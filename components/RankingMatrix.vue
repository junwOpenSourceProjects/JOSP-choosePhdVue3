<script setup lang="ts">
/**
 * DESIGN.md §ranking-matrix
 * 院校详情页"历年数据明细" - 年份 × 维度矩阵表
 *
 * 1 屏答 1 个问题: "这学校每一年在 4 大榜单排多少? 哪年最好?"
 *
 * 行: 4 维度 (qs / qs_cs / usnews / usnews_cs)
 * 列: 年份 (从 series 数据动态算)
 * 单元格: 排名数字
 * 高亮: 数字最小 = 最佳 = 绿色背景 + 数字加粗 (用户思维, 一眼看出 peak)
 */
import type { EchartsDTO } from '~/types'

const props = defineProps<{
  chart: EchartsDTO | null
  /** 维度中文名映射 (默认 4 维) */
  dimensionLabels?: Record<string, string>
}>()

// 默认 4 维 + 颜色 (DESIGN.md 品牌色)
const DEFAULT_LABELS: Record<string, { label: string; color: string }> = {
  qs: { label: 'QS 综合', color: '#1456f0' },
  qs_cs: { label: 'QS 计算机', color: '#3b82f6' },
  usnews: { label: 'US News 综合', color: '#ea5ec1' },
  usnews_cs: { label: 'US News 计算机', color: '#a855f7' }
}

const dimensionLabels = computed(() => props.dimensionLabels ?? Object.fromEntries(
  Object.entries(DEFAULT_LABELS).map(([k, v]) => [k, v.label])
))

// 从 chart.chatData.series 算表格行 + 列
const tableData = computed(() => {
  const series = props.chart?.chatData?.series ?? []
  const years = props.chart?.legendData ?? []
  if (!series.length || !years.length) return { years: [], rows: [], best: {} as Record<string, number> }

  // 每个 series.name 都含"qs"/"qs_cs"/"usnews"/"usnews_cs" 后缀 (drawerData 行为)
  // key = series.name 去掉大学名前缀 (eg '哥伦比亚大学qs' -> 'qs')
  // 找该 series.data 中数字最小 (非 null, >0)
  const rows: { key: string; label: string; color: string; values: (number | null)[]; best: number | null }[] = []
  const bestMap: Record<string, number> = {}
  for (const s of series) {
    const data = (s.data ?? []) as (number | null)[]
    // series.name 解析维度 key: 按 key 长度倒序排, 先 match 长的 (避免 'usnews' 匹到 'usnews_cs')
    let key = ''
    const keys = Object.keys(DEFAULT_LABELS).sort((a, b) => b.length - a.length)
    for (const k of keys) {
      if (s.name?.endsWith(k)) { key = k; break }
    }
    if (!key) continue
    const meta = DEFAULT_LABELS[key]
    const validValues = data.filter((v): v is number => typeof v === 'number' && v > 0)
    const best = validValues.length ? Math.min(...validValues) : null
    if (best != null) bestMap[key] = best
    rows.push({
      key,
      label: meta.label,
      color: meta.color,
      values: data,
      best
    })
  }
  return { years, rows, best: bestMap }
})

function rankTier(rank: number | null): string {
  if (rank == null) return 'matrix__cell--none'
  if (rank <= 10) return 'matrix__cell--gold'
  if (rank <= 50) return 'matrix__cell--silver'
  if (rank <= 100) return 'matrix__cell--bronze'
  return 'matrix__cell--normal'
}

function isBest(rank: number | null, key: string): boolean {
  if (rank == null) return false
  return tableData.value.best[key] === rank
}
</script>

<template>
  <div v-if="tableData.years.length && tableData.rows.length" class="matrix">
    <div class="matrix__scroll">
      <table class="matrix__table">
        <thead>
          <tr>
            <th class="matrix__corner">维度 \ 年份</th>
            <th
              v-for="(y, i) in tableData.years"
              :key="y + i"
              class="matrix__year"
            >{{ y }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in tableData.rows" :key="row.key">
            <td class="matrix__dim">
              <span class="matrix__dot" :style="{ background: row.color }" />
              <span>{{ row.label }}</span>
            </td>
            <td
              v-for="(v, i) in row.values"
              :key="i"
              :class="['matrix__cell', rankTier(v), isBest(v, row.key) ? 'matrix__cell--best' : '']"
            >
              <span v-if="v != null" class="matrix__num">{{ v }}</span>
              <span v-else class="matrix__num matrix__num--none">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="matrix__legend">
      <span class="matrix__legend-item">
        <span class="matrix__cell matrix__cell--best matrix__cell--legend" />
        历史最佳 (该维度内)
      </span>
      <span class="matrix__legend-item">
        <span class="matrix__cell matrix__cell--gold matrix__cell--legend" />
        Top 10
      </span>
      <span class="matrix__legend-item">
        <span class="matrix__cell matrix__cell--silver matrix__cell--legend" />
        Top 50
      </span>
      <span class="matrix__legend-item">
        <span class="matrix__cell matrix__cell--bronze matrix__cell--legend" />
        Top 100
      </span>
    </div>
  </div>
  <div v-else class="matrix__empty">
    <UIcon name="i-lucide-table" class="size-5" />
    <span>暂无历年数据</span>
  </div>
</template>

<style scoped>
.matrix {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.matrix__scroll {
  width: 100%;
  overflow-x: auto;
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-hairline);
}
.matrix__table {
  width: 100%;
  border-collapse: collapse;
  font-family: var(--font-data);
  font-size: 13px;
  min-width: 600px;
}
.matrix__table th,
.matrix__table td {
  padding: 10px 12px;
  text-align: center;
  border-bottom: 1px solid var(--color-hairline);
  border-right: 1px solid var(--color-hairline);
  white-space: nowrap;
}
.matrix__table th:last-child,
.matrix__table td:last-child { border-right: 0; }
.matrix__table tr:last-child td { border-bottom: 0; }

.matrix__corner {
  text-align: left !important;
  font-family: var(--font-ui) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: var(--color-stone) !important;
  background: var(--color-surface-1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: sticky;
  left: 0;
  z-index: 1;
}
.matrix__year {
  font-family: var(--font-data) !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  color: var(--color-stone) !important;
  background: var(--color-surface-1);
}
.matrix__dim {
  text-align: left !important;
  font-family: var(--font-ui) !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  color: var(--color-ink) !important;
  position: sticky;
  left: 0;
  background: var(--color-canvas);
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
}
.matrix__dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.matrix__cell {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  background: var(--color-canvas);
  position: relative;
}
.matrix__cell--legend {
  display: inline-block;
  width: 14px;
  height: 14px;
  border-radius: 4px;
  margin-right: 4px;
  vertical-align: middle;
  border: none;
  padding: 0;
  position: static;
}
.matrix__cell--gold { background: #fef3c7; color: #b45309; font-weight: 600; }
.matrix__cell--silver { background: #f1f5f9; color: #475569; }
.matrix__cell--bronze { background: #fce7f3; color: #be185d; }
.matrix__cell--normal { color: var(--color-slate); }
.matrix__cell--none { color: var(--color-stone); background: var(--color-surface-1); }
.matrix__cell--best {
  background: #dcfce7 !important;
  color: #15803d !important;
  font-weight: 700 !important;
}
.matrix__cell--best::after {
  content: '★';
  position: absolute;
  top: 2px;
  right: 4px;
  font-size: 9px;
  color: #16a34a;
}
.matrix__num { font-variant-numeric: tabular-nums; }
.matrix__num--none { color: var(--color-stone); font-weight: 400; }

.matrix__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--color-slate);
  padding: 0 4px;
}
.matrix__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.matrix__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--color-stone);
  font-family: var(--font-ui);
  font-size: 13px;
  border: 1px dashed var(--color-hairline);
  border-radius: var(--radius-xl);
}
</style>
