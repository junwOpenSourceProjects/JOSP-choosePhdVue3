<script setup lang="ts">
/**
 * CompareTable · 首页 4 维对比预览
 *
 * 左右分栏：左文案 + 黑 pill CTA，右表格预览（清华/北大/复旦的 QS/US 排名）。
 */
import { onMounted, ref, computed } from 'vue'
import { drawerData } from '~/lib/api/ranking'
import type { EchartsDTO, ChartSeries } from '~/types'

interface DrawerResponse extends EchartsDTO {
  universityNameEnglish?: string | null
}

interface SchoolRow {
  name: string
  shortName: string
  enName: string
  qs: number | null
  qsCs: number | null
  usnews: number | null
  usnewsCs: number | null
}

interface Dimension {
  key: keyof Omit<SchoolRow, 'name' | 'shortName' | 'enName'>
  label: string
  badgeTone: 'coral' | 'blue' | 'magenta' | 'purple'
}

const DEFAULT_SCHOOLS: { name: string; shortName: string }[] = [
  { name: '清华大学', shortName: '清华' },
  { name: '北京大学', shortName: '北大' },
  { name: '复旦大学', shortName: '复旦' },
]

const rows = ref<SchoolRow[]>([])
const loading = ref(true)

function parseSeries(raw: unknown[]): number | null {
  if (!Array.isArray(raw) || raw.length === 0) return null
  for (let i = raw.length - 1; i >= 0; i--) {
    const v = raw[i]
    const num = typeof v === 'number' ? v : parseFloat(String(v))
    if (!Number.isNaN(num) && num > 0) return num
  }
  return null
}

onMounted(async () => {
  const results = await Promise.allSettled(
    DEFAULT_SCHOOLS.map(async ({ name, shortName }): Promise<SchoolRow> => {
      try {
        const data = await drawerData(name) as unknown as DrawerResponse | null | undefined
        const seriesList: ChartSeries[] = data?.chatData?.series ?? []
        if (!seriesList.length) {
          return { name, shortName, enName: '', qs: null, qsCs: null, usnews: null, usnewsCs: null }
        }
        const suffixMap: Record<'qs' | 'qsCs' | 'usnews' | 'usnewsCs', string> = {
          qs: 'qs',
          qsCs: 'qs_cs',
          usnews: 'usnews',
          usnewsCs: 'usnews_cs',
        }
        const sorted = [...seriesList].sort((a, b) => (b.name.length) - (a.name.length))
        function findSeries(key: keyof typeof suffixMap): number[] | null {
          const sfx = suffixMap[key]
          const s = sorted.find((x) => x.name.endsWith(sfx))
          if (!s?.data) return null
          return s.data
            .map((x: number | null) => (typeof x === 'number' ? x : parseFloat(String(x))))
            .filter((v: number) => !Number.isNaN(v) && v > 0)
        }
        return {
          name,
          shortName,
          enName: data?.universityNameEnglish ?? '',
          qs: parseSeries(findSeries('qs') ?? []),
          qsCs: parseSeries(findSeries('qsCs') ?? []),
          usnews: parseSeries(findSeries('usnews') ?? []),
          usnewsCs: parseSeries(findSeries('usnewsCs') ?? []),
        }
      } catch {
        return { name, shortName, enName: '', qs: null, qsCs: null, usnews: null, usnewsCs: null }
      }
    })
  )
  rows.value = results
    .map((r) => (r.status === 'fulfilled' ? r.value : null))
    .filter((v): v is SchoolRow => v !== null)
  loading.value = false
})

const dimensions: Dimension[] = [
  { key: 'qs', label: 'QS 综合', badgeTone: 'coral' },
  { key: 'qsCs', label: 'QS 学科', badgeTone: 'blue' },
  { key: 'usnews', label: 'US News 综合', badgeTone: 'magenta' },
]

const toneMap: Record<Dimension['badgeTone'], { bg: string; text: string }> = {
  coral: { bg: 'rgba(255, 85, 48, 0.10)', text: '#ff5530' },
  blue: { bg: 'rgba(20, 86, 240, 0.10)', text: '#1456f0' },
  magenta: { bg: 'rgba(234, 94, 193, 0.10)', text: '#ea5ec1' },
  purple: { bg: 'rgba(168, 85, 247, 0.10)', text: '#a855f7' },
}

const tableData = computed(() => {
  return dimensions.map((d) => {
    const record: Record<string, string | number | null> = { dim: d.label, tone: d.badgeTone }
    for (const r of rows.value) {
      record[r.shortName] = r[d.key]
    }
    return record
  })
})

const columns = computed(() => {
  return [
    { id: 'dim', header: '排名体系' },
    ...rows.value.map((r) => ({ id: r.shortName, header: r.shortName })),
  ]
})

function cellStyle(tone: Dimension['badgeTone']): Record<string, string> {
  const t = toneMap[tone]
  return {
    background: t.bg,
    color: t.text,
  }
}
</script>

<template>
  <section class="compare-table">
    <div class="compare-table__inner">
      <div class="compare-table__grid">
        <div class="compare-table__copy">
          <div class="compare-table__eyebrow">4 维对比</div>
          <h2 class="compare-table__title">
            同时比较 QS / US News<br class="hidden md:block" />
            综合与计算机排名
          </h2>
          <p class="compare-table__desc">
            不再需要在不同榜单之间来回切换。一键对比多所大学的综合排名与计算机学科排名，快速锁定目标院校。
          </p>
          <NuxtLink to="/choices" class="compare-table__cta">
            打开完整对比表
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </NuxtLink>
        </div>

        <UCard
          v-if="loading"
          class="compare-table__card"
          :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-6' }"
        >
          <div class="compare-table__loading">
            <UIcon name="i-lucide-loader-circle" class="size-4 animate-spin text-muted" />
            <p class="compare-table__loading-text">加载排名数据…</p>
          </div>
        </UCard>

        <UCard
          v-else-if="rows.length"
          class="compare-table__card"
          :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-0' }"
        >
          <div class="overflow-x-auto">
            <UTable
              :data="tableData"
              :columns="columns"
              :ui="{
                root: 'compare-table__table',
                th: 'compare-table__th',
                td: 'compare-table__td',
              }"
            >
              <template #dim-cell="{ row }">
                <span class="compare-table__dim">{{ row.original.dim }}</span>
              </template>
              <template v-for="r in rows" :key="r.shortName" v-slot:[`${r.shortName}-cell`]="{ row }">
                <span
                  v-if="row.original[r.shortName] != null"
                  class="compare-table__badge"
                  :style="cellStyle(row.original.tone as Dimension['badgeTone'])"
                >
                  #{{ row.original[r.shortName] }}
                </span>
                <span v-else class="compare-table__badge compare-table__badge--none">#—</span>
              </template>
            </UTable>
          </div>
        </UCard>

        <UCard
          v-else
          class="compare-table__card"
          :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-6' }"
        >
          <AppEmpty
            icon="i-lucide-database"
            title="暂无对比数据"
            description="登录后加载排名，即可查看 4 维对比"
            size="md"
          />
        </UCard>
      </div>
    </div>
  </section>
</template>

<style scoped>
.compare-table {
  width: 100%;
  background: var(--color-canvas);
  border-bottom: 1px solid var(--color-hairline-soft);
}
.compare-table__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 32px;
}
@media (min-width: 768px) {
  .compare-table__inner { padding: 96px 32px; }
}
.compare-table__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  align-items: center;
}
@media (min-width: 1024px) {
  .compare-table__grid { grid-template-columns: 1fr 1.15fr; gap: 64px; }
}
.compare-table__copy {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.compare-table__eyebrow {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand-magenta);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.compare-table__title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 0;
}
@media (min-width: 768px) {
  .compare-table__title { font-size: 36px; }
}
.compare-table__desc {
  font-family: var(--font-ui);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: var(--color-slate);
  margin: 0;
  max-width: 480px;
}
.compare-table__cta {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: flex-start;
  padding: 13px 24px;
  background: var(--color-ink);
  color: var(--color-canvas);
  font-family: var(--font-ui);
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  text-decoration: none;
  transition: background 160ms ease;
  margin-top: 8px;
}
.compare-table__cta:hover { background: var(--color-charcoal); }
.compare-table__card { width: 100%; }
.compare-table__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 64px 24px;
}
.compare-table__loading-text {
  font-family: var(--font-ui);
  font-size: 14px;
  color: var(--color-slate);
}
.compare-table__table { min-width: 360px; width: 100%; }
.compare-table__th {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--color-surface);
  white-space: nowrap;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-hairline);
}
:deep(.compare-table__th:first-child) { border-top-left-radius: var(--radius-2xl); }
:deep(.compare-table__th:last-child) { border-top-right-radius: var(--radius-2xl); }
.compare-table__td {
  font-family: var(--font-ui);
  font-size: 14px;
  color: var(--color-ink);
  white-space: nowrap;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-hairline-soft);
}
:deep(.compare-table__table tbody tr:last-child .compare-table__td) { border-bottom: none; }
.compare-table__dim {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-slate);
}
.compare-table__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 24px;
  padding: 0 8px;
  border-radius: var(--radius-md);
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.compare-table__badge--none {
  background: var(--color-surface-soft);
  color: var(--color-stone);
}
@media (max-width: 768px) {
  .compare-table__inner { padding: 56px 20px; }
  .compare-table__title { font-size: 24px; }
  .compare-table__cta { width: 100%; }
}
</style>
