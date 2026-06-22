<script setup lang="ts">
/**
 * RankingMatrix · 历年维度矩阵
 *
 * 行：qs / qs_cs / usnews / usnews_cs 四个维度
 * 列：年份
 * 用 UTable 重构，历史最佳单元格高亮。
 */
import type { EchartsDTO } from '~/types'

const props = defineProps<{
  chart: EchartsDTO | null
}>()

const DEFAULT_LABELS: Record<string, { label: string; color: string }> = {
  qs: { label: 'QS 综合', color: '#1456f0' },
  qs_cs: { label: 'QS 计算机', color: '#3b82f6' },
  usnews: { label: 'US News 综合', color: '#ea5ec1' },
  usnews_cs: { label: 'US News 计算机', color: '#a855f7' },
}

const years = computed(() => props.chart?.legendData ?? [])

interface Row {
  key: string
  label: string
  color: string
  values: (number | null)[]
  best: number | null
}

const rows = computed<Row[]>(() => {
  const series = props.chart?.chatData?.series ?? []
  if (!series.length || !years.value.length) return []

  const keys = Object.keys(DEFAULT_LABELS).sort((a, b) => b.length - a.length)
  const rows: Row[] = []

  for (const s of series) {
    let key = ''
    for (const k of keys) {
      if (s.name?.endsWith(k)) { key = k; break }
    }
    if (!key) continue
    const meta = DEFAULT_LABELS[key]
    if (!meta) continue
    const data = (s.data ?? []) as (number | null)[]
    const valid = data.filter((v): v is number => typeof v === 'number' && v > 0)
    const best = valid.length ? Math.min(...valid) : null
    rows.push({
      key,
      label: meta.label,
      color: meta.color,
      values: data,
      best,
    })
  }
  return rows
})

const columns = computed(() => {
  const cols = [
    { id: 'dim', header: '维度', accessorKey: 'dim' },
  ]
  for (const y of years.value) {
    cols.push({ id: `year-${y}`, header: String(y), accessorKey: `year-${y}` })
  }
  return cols
})

const tableData = computed(() => {
  return rows.value.map((row) => {
    const record: Record<string, any> = {
      dim: row,
    }
    row.values.forEach((v, i) => {
      const y = years.value[i]
      if (y != null) record[`year-${y}`] = { value: v, row }
    })
    return record
  })
})

function tierClass(rank: number | null): string {
  if (rank == null) return 'matrix__cell--none'
  if (rank <= 10) return 'matrix__cell--gold'
  if (rank <= 50) return 'matrix__cell--silver'
  if (rank <= 100) return 'matrix__cell--bronze'
  return 'matrix__cell--normal'
}

function isBest(cell: { value: number | null; row: Row }): boolean {
  if (cell.value == null) return false
  return cell.row.best === cell.value
}
</script>

<template>
  <div v-if="rows.length" class="matrix">
    <div class="matrix__scroll">
      <UTable
        :data="tableData"
        :columns="columns"
        :ui="{
          root: 'matrix__table rounded-xl border border-default overflow-hidden',
          th: 'text-[11px] font-semibold uppercase text-muted bg-muted',
          td: 'p-0',
        }"
      >
        <template #dim-cell="{ row }">
          <div class="matrix__dim">
            <span class="matrix__dot" :style="{ background: row.original.dim.color }" />
            <span>{{ row.original.dim.label }}</span>
          </div>
        </template>

        <template v-for="y in years" :key="y" v-slot:[`year-${y}-cell`]="{ row }">
          <div
            :class="[
              'matrix__cell',
              tierClass(row.original[`year-${y}`].value),
              isBest(row.original[`year-${y}`]) ? 'matrix__cell--best' : '',
            ]"
          >
            <span v-if="row.original[`year-${y}`].value != null" class="matrix__num">
              {{ row.original[`year-${y}`].value }}
            </span>
            <span v-else class="matrix__num matrix__num--none">—</span>
          </div>
        </template>
      </UTable>
    </div>

    <div class="matrix__legend">
      <span class="matrix__legend-item">
        <span class="matrix__cell matrix__cell--best matrix__cell--legend" />
        历史最佳
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
    <UIcon name="i-lucide-table" class="size-4" />
    <span>暂无历年数据</span>
  </div>
</template>

<style scoped>
.matrix { display: flex; flex-direction: column; gap: 16px; }
.matrix__scroll { width: 100%; overflow-x: auto; }
.matrix__table { min-width: 600px; }
.matrix__dim {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  white-space: nowrap;
}
.matrix__dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.matrix__cell {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 64px;
  height: 44px;
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
}
.matrix__cell--legend {
  display: inline-flex;
  width: 14px;
  height: 14px;
  min-width: 14px;
  border-radius: 4px;
  margin-right: 4px;
  padding: 0;
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
.matrix__num { font-variant-numeric: tabular-nums; }
.matrix__num--none { color: var(--color-stone); font-weight: 400; }
.matrix__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--color-slate);
}
.matrix__legend-item { display: inline-flex; align-items: center; }
.matrix__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: var(--color-stone);
  font-size: 13px;
  border: 1px dashed var(--color-hairline);
  border-radius: var(--radius-xl);
}
</style>
