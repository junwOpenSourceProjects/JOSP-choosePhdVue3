#!/usr/bin/env node
/**
 * scripts/check-token-drift.mjs
 *
 * 扫所有 .vue / .css 文件,匹配:
 * - 硬编码 hex 颜色:#abc / #abcd / #aabbcc / #aabbccdd
 * - 硬编码 px 字号:font-size: 16px / font-size:16px 等
 *
 * 行为:只警告,不 exit 1(因为 tokens.css / main.css 本身必须含 hex)
 * 把违规按文件聚合,输出一份可读的 drift report。
 */
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOTS = ['components', 'pages', 'layouts', 'assets', 'composables', 'stores', 'utils', 'lib', 'app.vue']
const HEX = /#[0-9a-fA-F]{3,8}\b/g
const PX_FONT = /font-size\s*:\s*\d+(\.\d+)?\s*px/gi
// 排除 node_modules / .nuxt / .output
const EXCLUDE = /node_modules|\.nuxt|\.output|dist/

const report = {} // file -> { hex: [], pxFont: [] }

for (const root of ROOTS) {
  try { walk(root, report) } catch { /* skip */ }
}

// 排序输出
const files = Object.keys(report).sort()
let totalHex = 0
let totalPx = 0

console.log('🔍 Token drift report\n' + '='.repeat(40))
for (const file of files) {
  const { hex, pxFont } = report[file]
  if (hex.length === 0 && pxFont.length === 0) continue
  console.log(`\n📄 ${file}`)
  for (const h of hex) {
    console.log(`   hex  : ${h}`)
    totalHex++
  }
  for (const p of pxFont) {
    console.log(`   px   : ${p}`)
    totalPx++
  }
}

console.log('\n' + '='.repeat(40))
console.log(`合计 hex=${totalHex}, px font-size=${totalPx}`)
console.log('ℹ️  tokens.css / main.css 自身含 hex 是合法的(source of truth)')
console.log('ℹ️  本脚本只警告不阻断 CI(exit 0),下游 T-02 / T-03 收尾时按需收紧')

function walk(dir, acc) {
  const stat = statSync(dir)
  if (!stat.isDirectory()) {
    check(dir, acc)
    return
  }
  for (const name of readdirSync(dir)) {
    if (EXCLUDE.test(name)) continue
    const p = join(dir, name)
    const s = statSync(p)
    if (s.isDirectory()) walk(p, acc)
    else if (['.vue', '.css', '.scss'].includes(extname(p))) check(p, acc)
  }
}

function check(file, acc) {
  // app.vue 在 root
  const content = readFileSync(file, 'utf8')
  const lines = content.split('\n')
  const hexHits = []
  const pxHits = []
  lines.forEach((line, i) => {
    const hexMatches = line.match(HEX)
    if (hexMatches) {
      for (const m of hexMatches) hexHits.push(`L${i+1}: ${m} → ${line.trim()}`)
    }
    const pxMatches = line.match(PX_FONT)
    if (pxMatches) {
      for (const m of pxMatches) pxHits.push(`L${i+1}: ${m}`)
    }
  })
  if (hexHits.length || pxHits.length) {
    acc[file] = { hex: hexHits, pxFont: pxHits }
  }
}
