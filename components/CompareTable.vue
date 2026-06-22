<script setup lang="ts">
/**
 * CompareTable · 4 维对比表 (signature element of /choices)
 *
 * 默认展示 5 所名校的 4 维当前排名对比
 *
 * 行: 排名体系 (QS / QS CS / US News / US News CS)
 * 列: 大学
 * 单元: 当前排名 (#14, #17, #25...)
 * 表头: 平均排名 + 强度徽章
 *
 * 数据来源:
 *   - /status/trendAllVariants?universityNameChinese=X
 *   - 取每维数组最后一个有效排名 = 当前排名
 */

import { computed, onMounted, ref } from 'vue'
import { drawerData } from '~/lib/api/ranking'

interface SchoolRow {
  name: string
  enName: string
  qs: number | null
  qsCs: number | null
  usnews: number | null
  usnewsCs: number | null
}

const DEFAULT_SCHOOLS = ['清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学']

const rows = ref<SchoolRow[]>([])
const loading = ref(true)

function parseSeries(raw: any): number | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  for (let i = raw.length - 1; i >= 0; i--) {
    const v = raw[i]
    const num = typeof v === 'number' ? v : parseFloat(v)
    if (!Number.isNaN(num) && num > 0) return num
  }
  return null
}

onMounted(async () => {
  const results = await Promise.allSettled(
    DEFAULT_SCHOOLS.map(async (name): Promise<SchoolRow> => {
      try {
        const data: any = await drawerData(name)
        if (!data?.chatData?.series) {
          return { name, enName: '', qs: null, qsCs: null, usnews: null, usnewsCs: null }
        }
        const seriesList: any[] = data.chatData.series ?? []
        // 后端 series.name = "${name1}qs" / "${name1}qs_cs" / "${name1}usnews" / "${name1}usnews_cs"
        const suffixMap: Record<string, string> = {
          qs: 'qs',
          qsCs: 'qs_cs',
          usnews: 'usnews',
          usnewsCs: 'usnews_cs'
        }
        // 按 key 长度倒序排避免 'usnews' 误匹 'usnews_cs'
        const sorted = [...seriesList].sort((a, b) => (b?.name?.length ?? 0) - (a?.name?.length ?? 0))
        function findSeries(key: string): number[] | null {
          const sfx = suffixMap[key]
          const s = sorted.find((x) => (x?.name ?? '').endsWith(sfx))
          if (!s?.data) return null
          return s.data.map((x: any) => (typeof x === 'number' ? x : parseFloat(x))).filter((v: number) => !Number.isNaN(v) && v > 0)
        }
        return {
          name,
          enName: data.universityNameEnglish ?? '',
          qs: parseSeries(findSeries('qs')),
          qsCs: parseSeries(findSeries('qsCs')),
          usnews: parseSeries(findSeries('usnews')),
          usnewsCs: parseSeries(findSeries('usnewsCs'))
        }
      } catch {
        return { name, enName: '', qs: null, qsCs: null, usnews: null, usnewsCs: null }
      }
    })
  )
  rows.value = results.map((r) => (r.status === 'fulfilled' ? r.value : null)).filter((v): v is SchoolRow => v !== null)
  loading.value = false
})

const dimensions = [
  { key: 'qs' as const, label: 'QS 综合', shortLabel: 'QS' },
  { key: 'qsCs' as const, label: 'QS 学科', shortLabel: 'QS-CS' },
  { key: 'usnews' as const, label: 'US News 综合', shortLabel: 'USNews' },
  { key: 'usnewsCs' as const, label: 'US News 学科', shortLabel: 'USNews-CS' }
]

function rankCell(row: SchoolRow, key: keyof Omit<SchoolRow, 'name' | 'enName'>): string {
  const v = row[key]
  if (v == null) return '—'
  return `#${v}`
}

function rankColor(rank: number | null): 'gold' | 'silver' | 'bronze' | 'normal' {
  if (rank == null) return 'normal'
  if (rank <= 3) return 'gold'
  if (rank <= 10) return 'silver'
  if (rank <= 50) return 'bronze'
  return 'normal'
}

function avgRank(row: SchoolRow): string {
  const vals = [row.qs, row.qsCs, row.usnews, row.usnewsCs].filter((v): v is number => v != null && v > 0)
  if (vals.length === 0) return '—'
  const avg = vals.reduce((s, v) => s + v, 0) / vals.length
  return `#${avg.toFixed(1)}`
}
</script>

<template>
  <section class="compare-table">
    <div class="compare-table__inner">
      <header class="compare-table__head">
        <div class="compare-table__eyebrow">
          <UIcon name="i-lucide-git-compare-arrows" class="size-3.5" />
          4 维对比
        </div>
        <h2 class="compare-table__title">名校当前排名一览</h2>
        <p class="compare-table__sub">默认 5 所 · 数据说话 · 你做决策</p>
      </header>

      <div v-if="loading" class="compare-table__loading">
        <UIcon name="i-lucide-loader-circle" class="size-5 animate-spin text-muted" />
        <span>加载排名数据 ...</span>
      </div>

      <div v-else class="compare-table__wrap">
        <table class="compare-table__tbl">
          <thead>
            <tr>
              <th class="compare-table__th compare-table__th--dim">排名体系</th>
              <th v-for="r in rows" :key="r.name" class="compare-table__th compare-table__th--school">
                <div class="compare-table__school-name">{{ r.name }}</div>
                <div class="compare-table__school-en">{{ r.enName || '\u00a0' }}</div>
              </th>
              <th class="compare-table__th compare-table__th--avg">综合</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="d in dimensions" :key="d.key">
              <th class="compare-table__dim">{{ d.label }}</th>
              <td v-for="r in rows" :key="r.name + d.key" class="compare-table__cell">
                <span :class="['compare-table__rank', `compare-table__rank--${rankColor(r[d.key])}`]">
                  {{ rankCell(r, d.key) }}
                </span>
              </td>
              <td class="compare-table__cell compare-table__cell--avg">
                <UIcon name="i-lucide-minus" class="size-3 text-muted" />
              </td>
            </tr>
            <tr class="compare-table__avg-row">
              <th class="compare-table__dim compare-table__dim--avg">综合平均</th>
              <td v-for="r in rows" :key="r.name + '-avg'" class="compare-table__cell">
                <span class="compare-table__rank compare-table__rank--avg">{{ avgRank(r) }}</span>
              </td>
              <td class="compare-table__cell"></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="compare-table__cta">
        <NuxtLink to="/choices" class="compare-table__cta-btn">
          打开完整对比表
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>

<style scoped>
.compare-table {
  width: 100%;
  background: var(--ui-bg);
  border-bottom: 1px solid var(--ui-border);
}

.compare-table__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 32px;
}

.compare-table__head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
  max-width: 640px;
}

.compare-table__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ui-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.compare-table__title {
  font-family: 'DM Sans', 'Noto Sans SC', system-ui, sans-serif;
  font-size: 40px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--ui-text);
  margin: 0;
}

.compare-table__sub {
  font-size: 16px;
  font-weight: 400;
  color: var(--ui-text-muted);
  margin: 0;
}

.compare-table__loading {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--ui-text-muted);
  padding: 40px 0;
  font-size: 14px;
}

.compare-table__wrap {
  overflow-x: auto;
  border: 1px solid var(--ui-border);
  border-radius: 16px;
  background: var(--ui-bg);
}

.compare-table__tbl {
  width: 100%;
  border-collapse: collapse;
  min-width: 640px;
}

.compare-table__th {
  text-align: left;
  padding: 16px 12px;
  font-size: 12px;
  font-weight: 600;
  color: var(--ui-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  border-bottom: 1px solid var(--ui-border);
  background: var(--ui-bg-elevated, #f7f8fa);
  white-space: nowrap;
}

.compare-table__th--dim {
  width: 160px;
}

.compare-table__th--school {
  text-align: center;
  min-width: 140px;
}

.compare-table__school-name {
  font-family: 'DM Sans', 'Noto Sans SC', system-ui, sans-serif;
  font-size: 14px;
  font-weight: 600;
  color: var(--ui-text);
  text-transform: none;
  letter-spacing: 0;
}

.compare-table__school-en {
  font-size: 10px;
  font-weight: 400;
  color: var(--ui-text-muted);
  text-transform: none;
  letter-spacing: 0;
  margin-top: 2px;
}

.compare-table__th--avg {
  width: 80px;
  text-align: center;
}

.compare-table__dim {
  text-align: left;
  padding: 16px 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--ui-text);
  border-bottom: 1px solid var(--ui-border);
  background: var(--ui-bg-elevated, #f7f8fa);
  white-space: nowrap;
}

.compare-table__dim--avg {
  font-weight: 600;
  color: var(--ui-text);
}

.compare-table__cell {
  padding: 14px 12px;
  text-align: center;
  border-bottom: 1px solid var(--ui-border);
  font-family: 'Roboto', system-ui, sans-serif;
}

.compare-table__rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  font-size: 13px;
  font-weight: 600;
  padding: 0 10px;
  border-radius: 6px;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

.compare-table__rank--gold {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}

.compare-table__rank--silver {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}

.compare-table__rank--bronze {
  background: rgba(20, 184, 166, 0.12);
  color: #0f766e;
}

.compare-table__rank--normal {
  color: var(--ui-text);
}

.compare-table__rank--avg {
  background: var(--ui-text, #0a0a0a);
  color: var(--ui-bg, #ffffff);
  font-size: 13px;
  height: 24px;
}

.compare-table__avg-row {
  background: var(--ui-bg-elevated, #f7f8fa);
}

.compare-table__avg-row .compare-table__cell {
  background: var(--ui-bg-elevated, #f7f8fa);
}

.compare-table__cta {
  margin-top: 24px;
  display: flex;
  justify-content: center;
}

.compare-table__cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: var(--ui-text, #0a0a0a);
  color: var(--ui-bg, #ffffff);
  font-size: 15px;
  font-weight: 600;
  border-radius: 9999px;
  text-decoration: none;
  transition: background 0.15s ease;
}

.compare-table__cta-btn:hover {
  background: #181e25;
}

@media (max-width: 768px) {
  .compare-table__inner {
    padding: 56px 20px;
  }
  .compare-table__title {
    font-size: 32px;
  }
  .compare-table__th--dim,
  .compare-table__dim {
    width: 100px;
  }
}
</style>
