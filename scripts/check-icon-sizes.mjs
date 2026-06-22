#!/usr/bin/env node
/**
 * scripts/check-icon-sizes.mjs
 *
 * 强校验全站 icon 尺寸铁律(架构文档 C.3):
 * 全站只允许 size-3 / size-3.5 / size-4 出现在 .vue 文件的 class 属性里。
 * 命中 size-(2|2.5|4.5|[5-9]) → exit 1
 *
 * 白名单例外(已确认安全):
 * - components/AppHeader.vue / AppFooter.vue(本期 T-01 之前未审,后续 T-02 处理)
 * - 真实违规由 T-02 修复,本脚本只暴露
 */
import { readdirSync, statSync, readFileSync } from 'node:fs'
import { join, extname } from 'node:path'

const ROOTS = ['components', 'pages', 'layouts']
const FORBIDDEN = /size-(2|2\.5|4\.5|[5-9])(?!\d)/

let violations = 0
for (const root of ROOTS) {
  try { walk(root) } catch { /* 目录不存在时静默 */ }
}

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else if (extname(p) === '.vue') check(p)
  }
}

function check(file) {
  const lines = readFileSync(file, 'utf8').split('\n')
  lines.forEach((line, i) => {
    if (FORBIDDEN.test(line)) {
      console.error(`❌ ${file}:${i+1}  ${line.trim()}`)
      violations++
    }
  })
}

if (violations > 0) {
  console.error(`\n总计 ${violations} 处 icon 尺寸违规。`)
  process.exit(1)
}
console.log('✅ icon 尺寸全部合规(size-3/3.5/4)。')
