#!/usr/bin/env node
/**
 * scripts/check-bundle-budget.mjs
 *
 * Bundle budget 校验:首屏 entry chunk gzipped ≤ 300KB。
 * T-01 阶段:扫描 .output/public/_nuxt/*.js,累加 gzipped size,
 *            报告但不阻断 CI(exit 0)。T-02 完成后切换为 strict mode。
 *
 * 阈值定义:
 *   BUDGET_KB = 300(架构文档 T-01 验收点 4)
 */
import { readdirSync, statSync, readFileSync, existsSync } from 'node:fs'
import { join, extname, basename } from 'node:path'
import { gzipSync } from 'node:zlib'

const OUTPUT_DIR = '.output/public/_nuxt'
const BUDGET_KB = 300
const ENTRY_HINTS = [
  // 入口文件通常名字短(无 hash 前缀太长)
  /^entry\..*\.js$/i,
  /^nuxt\..*\.js$/i,
  /^app\..*\.js$/i,
  /^index\..*\.js$/i,
]

let totalRawBytes = 0
let totalGzipBytes = 0
const fileReports = []
let entryGzipBytes = 0
let hasOutput = false

if (!existsSync(OUTPUT_DIR)) {
  console.log('ℹ️  未发现 .output 目录(需要先 `pnpm build`)')
  console.log('ℹ️  本期 T-01 允许 exit 0,降级为提示')
  console.log('ℹ️  T-02 完成后此脚本会切换为 strict mode(block > 300KB)')
  process.exit(0)
}

for (const name of readdirSync(OUTPUT_DIR)) {
  const p = join(OUTPUT_DIR, name)
  if (statSync(p).isDirectory()) continue
  if (extname(p) !== '.js') continue
  hasOutput = true
  const raw = readFileSync(p)
  const gz = gzipSync(raw, { level: 6 })
  totalRawBytes += raw.length
  totalGzipBytes += gz.length
  const isEntry = ENTRY_HINTS.some((rx) => rx.test(name))
  if (isEntry) entryGzipBytes += gz.length
  fileReports.push({
    name,
    raw: raw.length,
    gz: gz.length,
    isEntry,
  })
}

if (!hasOutput) {
  console.log('ℹ️  _nuxt 目录为空,跳过')
  process.exit(0)
}

fileReports.sort((a, b) => b.gz - a.gz)

console.log('📊 Bundle budget report')
console.log('='.repeat(60))
console.log(`阈值:首屏 entry chunk gzipped ≤ ${BUDGET_KB}KB`)
console.log('')

console.log(`Total .js files: ${fileReports.length}`)
console.log(`Total raw:       ${(totalRawBytes / 1024).toFixed(1)} KB`)
console.log(`Total gzipped:   ${(totalGzipBytes / 1024).toFixed(1)} KB`)
console.log(`Entry gzipped:   ${(entryGzipBytes / 1024).toFixed(1)} KB`)
console.log('')
console.log('Top 10 largest files (gzipped):')
for (const f of fileReports.slice(0, 10)) {
  const tag = f.isEntry ? ' [entry]' : ''
  console.log(`  ${(f.gz / 1024).toFixed(1).padStart(8)} KB  ${(f.raw / 1024).toFixed(1).padStart(8)} KB  ${f.name}${tag}`)
}

const overBudget = entryGzipBytes > BUDGET_KB * 1024
console.log('')
console.log('='.repeat(60))
if (overBudget) {
  console.log(`❌ Entry chunk 超预算:${(entryGzipBytes / 1024).toFixed(1)}KB > ${BUDGET_KB}KB`)
  // T-01 仍 exit 0(只警告)
  console.log('ℹ️  T-01 阶段 exit 0,T-05 收尾切换 strict')
  process.exit(0)
}
console.log('✅ Bundle 在预算内')
