<script setup lang="ts">
import { queryAllQs } from '~/lib/api/university'
import { drawerData, queryBackup2List } from '~/lib/api/ranking'
import type { Backup2Record, UniversityAllDTO } from '~/types'

const route = useRoute()
const router = useRouter()

const name = computed(() => decodeURIComponent(String(route.params.name || '')))

useHead({ title: () => `${name.value} · 学校详情` })

// ============== 数据 ==============
const detail = ref<UniversityAllDTO | null>(null)
const chartData = ref<any | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const loadRunId = ref(0)

const backup2Groups = ref<Array<{ rankTable: string; label: string; records: Backup2Record[] }>>([])
const backup2Loading = ref(false)

const BACKUP2_LABEL_MAP: Record<string, string> = {
  arwu_subject: 'ARWU 学科',
  edurank_region: 'EduRank 地区',
  declining_trend: '下降趋势',
  mosiur_world: 'MOSIUR 全球',
  rur_world: 'RUR 全球',
  usnews_subject: 'US News 学科',
  qs_sustainability: 'QS 可持续'
}

async function loadBackup2Data(runId: number) {
  backup2Loading.value = true
  const rankTables = Object.keys(BACKUP2_LABEL_MAP)
  const groups: typeof backup2Groups.value = []
  const results = await Promise.allSettled(
    rankTables.map(rt => queryBackup2List({
      page: 1,
      limit: 50,
      rankTable: rt,
      universityNameChinese: name.value
    }))
  )
  if (runId !== loadRunId.value) return
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      const records: Backup2Record[] = r.value?.data?.records ?? []
      if (records.length > 0) {
        groups.push({
          rankTable: rankTables[i]!,
          label: BACKUP2_LABEL_MAP[rankTables[i]!]!,
          records
        })
      }
    }
  })
  groups.sort((a, b) => b.records.length - a.records.length)
  backup2Groups.value = groups
  backup2Loading.value = false
}

async function load() {
  loading.value = true
  error.value = null
  loadRunId.value++
  const runId = loadRunId.value
  try {
    const list = await queryAllQs({
      page: 1, limit: 50,
      universityNameChinese: name.value,
      rankVariant: 'all'
    })
    if (runId !== loadRunId.value) return
    const records = list.records ?? []
    detail.value = records[0] ?? null

    const drawer = await drawerData(name.value)
    if (runId !== loadRunId.value) return
    if (drawer.chatData) chartData.value = drawer

    await loadBackup2Data(runId)
  } catch (e: any) {
    if (runId !== loadRunId.value) return
    console.warn('[detail] load failed', e?.message)
    error.value = '后端不可达, 显示示意数据'
    detail.value = generateMockDetail(name.value)
    chartData.value = generateMockChart()
    backup2Groups.value = []
  } finally {
    if (runId === loadRunId.value) loading.value = false
  }
}

onMounted(load)
onBeforeUnmount(() => { loadRunId.value++ })

function generateMockDetail(n: string): UniversityAllDTO {
  return {
    universityNameChinese: n,
    universityTags: '美国',
    universityTagsState: '北美洲',
    rankingYear: '2025',
    currentQsAllRank: 5,
    currentQsComputerRank: 3,
    currentUsnewsAllRank: 3,
    currentUsnewsComputerRank: 2
  }
}
function generateMockChart() {
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
  return {
    chatData: {
      series: [
        { name: 'QS 综合', smooth: true, data: [6, 5, 4, 4, 5, 4, 5, 5] },
        { name: 'QS 计算机', smooth: true, data: [3, 4, 3, 3, 3, 2, 3, 3] },
        { name: 'US News 综合', smooth: true, data: [5, 4, 3, 3, 3, 2, 3, 3] },
        { name: 'US News 计算机', smooth: true, data: [2, 2, 1, 2, 2, 1, 2, 2] }
      ]
    },
    legendData: years
  }
}

// ============== 4 维排名 ==============
type RankTab = 'all' | 'cs'
const rankTab = ref<RankTab>('all')
const rankCards = computed(() => {
  if (!detail.value) return []
  const d = detail.value
  if (rankTab.value === 'all') {
    return [
      { label: 'QS 综合', rank: d.currentQsAllRank, icon: 'i-lucide-globe-2', color: '#1456f0', key: 'QS 综合' },
      { label: 'US News 综合', rank: d.currentUsnewsAllRank, icon: 'i-lucide-award', color: '#ea5ec1', key: 'US News 综合' }
    ]
  }
  return [
    { label: 'QS 计算机', rank: d.currentQsComputerRank, icon: 'i-lucide-cpu', color: '#3b82f6', key: 'QS 计算机' },
    { label: 'US News 计算机', rank: d.currentUsnewsComputerRank, icon: 'i-lucide-code-2', color: '#a855f7', key: 'US News 计算机' }
  ]
})

function rankBadgeTier(rank: number | null | undefined): string {
  if (rank == null) return 'rank-badge--normal'
  if (rank <= 3) return 'rank-badge--gold'
  if (rank <= 10) return 'rank-badge--silver'
  if (rank <= 50) return 'rank-badge--bronze'
  return 'rank-badge--normal'
}

function getSeriesData(name: string): (number | null)[] {
  return chartData.value?.chatData?.series?.find((s: any) => s.name === name)?.data ?? []
}

const REGION_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  '亚洲':   { bg: '#fce7f3', fg: '#be185d', dot: '#ea5ec1' },
  '欧洲':   { bg: '#dbeafe', fg: '#1d4ed8', dot: '#1456f0' },
  '北美洲': { bg: '#fef3c7', fg: '#b45309', dot: '#f59e0b' },
  '南美洲': { bg: '#dcfce7', fg: '#15803d', dot: '#22c55e' },
  '大洋洲': { bg: '#ede9fe', fg: '#7c3aed', dot: '#a855f7' },
  '非洲':   { bg: '#fee2e2', fg: '#b91c1c', dot: '#ef4444' }
}
function regionStyle(r: string) {
  const c = REGION_COLORS[r]
  if (!c) return { background: 'var(--color-surface-soft)', color: 'var(--color-slate)' }
  return { background: c.bg, color: c.fg }
}
function regionColor(r: string): string { return REGION_COLORS[r]?.dot ?? '#8e8e93' }

// ============== 对比组 (localStorage) ==============
const COMPARE_KEY = 'choosephd.compare'
const compareList = ref<{ name: string }[]>([])

function loadCompare() {
  if (import.meta.server) return
  try {
    const raw = localStorage.getItem(COMPARE_KEY)
    if (raw) compareList.value = JSON.parse(raw)
  } catch {}
}
function saveCompare() {
  try { localStorage.setItem(COMPARE_KEY, JSON.stringify(compareList.value)) } catch {}
}
function toggleCompare() {
  if (!detail.value) return
  const idx = compareList.value.findIndex(c => c.name === name.value)
  if (idx >= 0) compareList.value.splice(idx, 1)
  else {
    if (compareList.value.length >= 6) compareList.value.shift()
    compareList.value.push({ name: name.value })
  }
  saveCompare()
}
const inCompare = computed(() => compareList.value.some(c => c.name === name.value))

// ============== 历年明细表 ==============
const detailTableColumns = computed(() => {
  if (!chartData.value?.legendData?.length) return []
  return [
    { id: 'name', header: '维度', meta: { class: { th: 'w-[200px]', td: 'w-[200px]' } } },
    ...chartData.value.legendData.map((y: string) => ({
      id: `y_${y}`,
      header: y,
      meta: { class: { th: 'text-center', td: 'text-center' } }
    }))
  ]
})
const detailTableRows = computed(() => {
  if (!chartData.value?.chatData?.series?.length) return []
  return chartData.value.chatData.series.map((s: any) => {
    const row: any = { name: s.name }
    s.data.forEach((v: any, i: number) => {
      const year = chartData.value?.legendData[i]
      if (year) row[`y_${year}`] = v
    })
    return row
  })
})

function rankCellClass(v: any): string {
  if (v == null) return ''
  const num = Number(v)
  if (isNaN(num) || num > 50) return 'detail-row__rank--beyond'
  return `rank-badge rank-badge--${rankBadgeTier(num)}`
}

function back() { router.back() }
</script>

<template>
  <div>
    <!-- ============== Hero (紧凑) ============== -->
    <section class="detail-hero">
      <div class="page-container">
        <div class="detail-hero__top">
          <UButton icon="i-lucide-arrow-left" color="neutral" variant="ghost" size="sm" label="返回学校库" class="rounded-full" @click="back" />
        </div>
        <div class="detail-hero__body">
          <div class="detail-hero__meta">
            <div v-if="detail" class="flex flex-wrap items-center gap-2">
              <UBadge v-if="detail.universityTags" color="primary" variant="subtle" size="md">
                <UIcon name="i-lucide-map-pin" class="size-3.5" />
                <span class="ml-1 t-caption-bold">{{ detail.universityTags }}</span>
              </UBadge>
              <span
                v-if="detail.universityTagsState"
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 t-caption-bold"
                :style="regionStyle(detail.universityTagsState)"
              >
                <span class="size-1.5 rounded-full" :style="{ background: regionColor(detail.universityTagsState) }" />
                {{ detail.universityTagsState }}
              </span>
              <UBadge v-if="detail.rankingYear" color="neutral" variant="soft" size="md">
                <UIcon name="i-lucide-calendar" class="size-3.5" />
                <span class="ml-1 t-caption-bold">{{ detail.rankingYear }} 年最新</span>
              </UBadge>
            </div>
            <h1 class="t-h1 detail-hero__title">{{ name || '未知大学' }}</h1>
            <p v-if="detail" class="t-body-sm detail-hero__sub">
              4 维排名 (综合/计算机 × QS/US News) · 历年趋势 · 多榜单覆盖
            </p>
          </div>
          <div class="detail-hero__cta">
            <UButton
              :icon="inCompare ? 'i-lucide-list-checks' : 'i-lucide-list-plus'"
              :color="inCompare ? 'primary' : 'primary'"
              :variant="inCompare ? 'solid' : 'outline'"
              size="lg"
              :label="inCompare ? '已加入对比' : '加入对比'"
              class="rounded-full"
              @click="toggleCompare"
            />
            <UButton to="/charts" color="neutral" variant="outline" size="lg" icon="i-lucide-line-chart" label="看趋势" class="rounded-full" />
          </div>
        </div>
      </div>
    </section>

    <UContainer v-if="error" class="pt-2">
      <UAlert color="warning" variant="subtle" :title="error" icon="i-lucide-alert-circle" />
    </UContainer>

    <!-- ============== 4 维排名卡 ============== -->
    <div class="page-container section-band">
      <div class="section-head section-head--row">
        <div>
          <div class="t-caption-bold text-muted">4 维排名 · 综合/计算机 × QS/US News</div>
          <h2 class="t-h3 mt-1">排名卡</h2>
        </div>
        <UFieldGroup size="sm">
          <UButton
            :color="rankTab === 'all' ? 'primary' : 'primary'"
            :variant="rankTab === 'all' ? 'solid' : 'outline'"
            size="sm"
            icon="i-lucide-globe-2"
            label="综合"
            class="rounded-full"
            @click="rankTab = 'all'"
          />
          <UButton
            :color="rankTab === 'cs' ? 'primary' : 'primary'"
            :variant="rankTab === 'cs' ? 'solid' : 'outline'"
            size="sm"
            icon="i-lucide-cpu"
            label="计算机"
            class="rounded-full"
            @click="rankTab = 'cs'"
          />
        </UFieldGroup>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <UCard
          v-for="r in rankCards"
          :key="r.label"
          class="rank-card"
          :ui="{
            root: 'rounded-2xl border border-default bg-default ring-0 transition-transform duration-200',
            body: 'p-5'
          }"
        >
          <div class="flex items-center justify-between">
            <div
              class="inline-flex size-9 items-center justify-center rounded-xl"
              :style="{ background: r.color + '15', color: r.color }"
            >
              <UIcon :name="r.icon" class="size-4" />
            </div>
            <UBadge
              v-if="r.rank != null"
              :color="r.rank <= 10 ? 'primary' : r.rank <= 50 ? 'primary' : 'neutral'"
              :variant="r.rank <= 10 ? 'solid' : 'subtle'"
              size="xs"
              :label="r.rank <= 10 ? 'Top 10' : r.rank <= 50 ? 'Top 50' : r.rank <= 100 ? 'Top 100' : `${r.rank}+`"
            />
          </div>
          <div class="rank-card__body">
            <span :class="['rank-badge', rankBadgeTier(r.rank), 'rank-badge--large']">
              {{ r.rank ?? '—' }}
            </span>
            <div class="rank-card__right">
              <div class="rank-card__label">{{ r.label }}</div>
              <ClientOnly>
                <svg
                  v-if="getSeriesData(r.key).length > 1"
                  viewBox="0 0 100 32"
                  preserveAspectRatio="none"
                  class="rank-card__svg"
                >
                  <path
                    :d="buildSparkline(getSeriesData(r.key))"
                    fill="none"
                    :stroke="r.color"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </ClientOnly>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- ============== 历年趋势图 ============== -->
    <div class="page-container section-band">
      <UCard class="trend-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <div class="mb-5">
          <h2 class="t-h3">历年排名趋势</h2>
          <p class="t-caption mt-1">4 个维度 · 历年变化 (越低越好)</p>
        </div>
        <ClientOnly>
          <div v-if="chartData" class="trend-card__chart">
            <ChartSvgChart :chart="chartData" :height="280" />
          </div>
          <div v-else class="trend-card__loading">
            <UIcon name="i-lucide-loader" class="mr-1.5 size-4 animate-spin" />
            <span class="t-body-sm text-muted">加载趋势数据…</span>
          </div>
        </ClientOnly>
      </UCard>
    </div>

    <!-- ============== 历年明细表 ============== -->
    <div v-if="chartData" class="page-container section-band">
      <UCard class="matrix-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-0' }">
        <div class="matrix-card__head">
          <div>
            <h2 class="t-h3">历年数据明细</h2>
            <p class="t-caption mt-1">年份 × 4 维排名矩阵</p>
          </div>
        </div>
        <div class="matrix-card__body">
          <UTable
            :data="detailTableRows"
            :columns="detailTableColumns"
            :ui="{
              th: 'text-[12px] font-medium text-muted',
              td: 'py-2.5 text-sm'
            }"
          >
            <template #name-cell="{ row }">
              <span class="t-body-sm font-medium text-default">{{ row.original.name }}</span>
            </template>
          </UTable>
        </div>
      </UCard>
    </div>

    <!-- ============== 其他榜单排名 ============== -->
    <div v-if="backup2Groups.length > 0 || backup2Loading" class="page-container section-band">
      <UCard class="other-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <div class="section-head section-head--row">
          <div>
            <div class="t-caption-bold text-muted">多榜单覆盖</div>
            <h2 class="t-h3 mt-1">其他榜单排名</h2>
            <p class="t-caption mt-1">
              {{ backup2Groups.length }} 个榜单有数据
              <span v-if="backup2Loading" class="ml-2 inline-flex items-center gap-1 text-muted">
                <UIcon name="i-lucide-loader-2" class="size-3.5 animate-spin" />
                加载中…
              </span>
            </p>
          </div>
        </div>
        <div class="space-y-5">
          <UCard
            v-for="g in backup2Groups"
            :key="g.rankTable"
            class="other-rank-card"
            :ui="{ root: 'rounded-xl border border-default bg-muted', body: 'p-5' }"
          >
            <div class="mb-3 flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-book-marked" class="size-4 text-brand" />
                <span class="t-h4">{{ g.label }}</span>
              </div>
              <span class="t-caption text-muted">共 {{ g.records.length }} 条</span>
            </div>
            <div class="other-rank-grid">
              <div
                v-for="(r, i) in g.records.slice(0, 10)"
                :key="i"
                class="other-rank-row"
              >
                <span :class="['rank-badge', rankBadgeTier(r.currentRankInteger), 'rank-badge--sm']">
                  {{ r.currentRankInteger ?? '—' }}
                </span>
                <span class="other-rank-row__title">
                  <template v-if="r.rankingCategory">{{ r.rankingCategory }}</template>
                  <template v-else-if="r.universityTags">{{ r.universityTags }}</template>
                  <template v-else>—</template>
                </span>
                <span
                  v-if="r.rankingYear"
                  class="other-rank-row__year"
                >
                  <UIcon name="i-lucide-calendar" class="size-3" />
                  {{ r.rankingYear }}
                </span>
                <span
                  v-if="r.currentRankRaw && r.currentRankRaw !== '#' + r.currentRankInteger"
                  class="other-rank-row__raw"
                >原: {{ r.currentRankRaw }}</span>
              </div>
              <div v-if="g.records.length > 10" class="other-rank-more">
                还有 {{ g.records.length - 10 }} 条…
              </div>
            </div>
          </UCard>
        </div>
      </UCard>
    </div>

    <!-- ============== 底 CTA ============== -->
    <div class="page-container section-band">
      <UCard class="bottom-cta" :ui="{ root: 'rounded-3xl border border-default bg-brand ring-0', body: 'p-8' }">
        <div class="bottom-cta__inner">
          <div>
            <div class="t-caption-bold is-on-dark">{{ name }}</div>
            <h2 class="t-h2 mt-1 is-on-dark">开始比较这所大学</h2>
            <p class="t-body-sm mt-2 bottom-cta__sub">
              把它放进对比清单 · 拉到「数据图表」做 4 维并列
            </p>
          </div>
          <div class="bottom-cta__actions">
            <UButton :to="'/charts'" color="primary" variant="solid" size="lg" icon="i-lucide-git-compare" label="去图表对比" class="rounded-full" />
            <UButton :to="'/universities'" color="primary" variant="outline" size="lg" icon="i-lucide-library" label="浏览其他" class="rounded-full" />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<script lang="ts">
function buildSparkline(data: (number | null)[]): string {
  if (!data || data.length < 2) return ''
  const W = 100, H = 32, PAD = 2
  const maxV = Math.max(...data.map(v => v ?? 0), 10) * 1.1
  const xStep = (W - 2 * PAD) / Math.max(1, data.length - 1)
  return data.map((v, i) => {
    if (v == null) return null
    const x = PAD + i * xStep
    const y = H - PAD - (Math.min(v, maxV) / maxV) * (H - 2 * PAD)
    const m = i === 0 ? 'M' : 'L'
    return `${m}${x.toFixed(2)},${y.toFixed(2)}`
  }).filter(Boolean).join(' ')
}
</script>

<style scoped>
/* Hero */
.detail-hero { padding: 32px 0 24px; background: var(--color-canvas); }
.detail-hero__top { margin-bottom: 16px; }
.detail-hero__body {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-end;
  gap: 24px;
}
.detail-hero__meta { display: flex; flex-direction: column; gap: 8px; min-width: 0; flex: 1; }
.detail-hero__title { margin: 4px 0 0; }
.detail-hero__sub { margin: 0; color: var(--color-slate); }
.detail-hero__cta { display: flex; flex-wrap: wrap; gap: 10px; }

/* Section 间距 */
.section-band { margin-top: 24px; }
@media (min-width: 768px) {
  .section-band { margin-top: 32px; }
}
.section-head { margin-bottom: 16px; }
.section-head--row {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 16px;
}

/* Rank card */
.rank-card { transition: transform 200ms ease, box-shadow 200ms ease; }
.rank-card:hover { transform: translateY(-2px); box-shadow: rgba(0,0,0,0.08) 0px 4px 6px 0px; }
.rank-card__body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  margin-top: 12px;
}
.rank-card__right { display: flex; flex-direction: column; align-items: flex-end; gap: 4px; }
.rank-card__label { font-family: var(--font-ui); font-size: 13px; font-weight: 600; color: var(--color-slate); }
.rank-card__svg { width: 110px; height: 32px; }

/* Rank badge 大/小变体 */
:deep(.rank-badge--large) { font-size: 22px; height: 40px; min-width: 56px; }
:deep(.rank-badge--sm) { font-size: 12px; height: 24px; min-width: 32px; }

/* Trend */
.trend-card__chart { padding: 16px; background: var(--color-surface); border-radius: 16px; }
.trend-card__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px;
}

/* Matrix */
.matrix-card__head { padding: 16px 20px; border-bottom: 1px solid var(--color-hairline); }
.matrix-card__body { padding: 8px 0; }
.matrix-card :deep(.rank-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-canvas);
}
.matrix-card :deep(.rank-badge--gold)   { background: #f59e0b; }
.matrix-card :deep(.rank-badge--silver) { background: #9ca3af; color: var(--color-ink); }
.matrix-card :deep(.rank-badge--bronze) { background: #ea580c; }
.matrix-card :deep(.rank-badge--normal) { background: var(--color-surface-soft); color: var(--color-ink); }

/* Other rank */
.other-rank-grid { display: flex; flex-direction: column; gap: 4px; }
.other-rank-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--color-canvas);
  border-radius: 8px;
  font-family: var(--font-ui);
}
.other-rank-row__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  flex: 1;
  min-width: 0;
}
.other-rank-row__year {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-slate);
}
.other-rank-row__raw {
  font-size: 11px;
  color: var(--color-stone);
  margin-left: auto;
}
.other-rank-more {
  text-align: center;
  font-size: 11px;
  color: var(--color-stone);
  padding: 4px 0;
}

/* Bottom CTA */
.bottom-cta { background: var(--color-brand-blue) !important; border-color: transparent !important; }
.bottom-cta__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.is-on-dark { color: var(--color-on-dark); }
.bottom-cta__sub { color: rgba(255, 255, 255, 0.80); }
.bottom-cta__actions { display: flex; flex-wrap: wrap; gap: 12px; }
</style>