<script setup lang="ts">
import { queryAllEcharts } from '~/lib/api/university'
import { trendAllVariants, queryBackup2List, fetchBackup2Years } from '~/lib/api/ranking'
import type { Backup2Record } from '~/types'

useHead({ title: '数据图表 · 选校系统' })

// ============== 顶部 4 mode tab ==============
type Mode = 'ranking' | 'variants' | 'subject' | 'region'
const mode = ref<Mode>('ranking')
const modeTabs: { value: Mode; label: string; icon: string; desc: string }[] = [
  { value: 'ranking', label: '排名榜 + 对比', icon: 'i-lucide-bar-chart-3', desc: 'Top 50 + 加入对比' },
  { value: 'variants', label: '4 维对比', icon: 'i-lucide-git-compare', desc: '勾几所, 看 N×4 维' },
  { value: 'subject', label: '按学科排序', icon: 'i-lucide-book-marked', desc: 'ARWU / US News / QS 可持续' },
  { value: 'region', label: '按地区联动', icon: 'i-lucide-globe-2', desc: '选洲 → 国家 → 院校' }
]

// ============== 通用数据 ==============
const allData = ref<any | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const currentRank = ref<number>(50)
const rankItems = [
  { value: 20, label: 'Top 20' },
  { value: 50, label: 'Top 50' },
  { value: 100, label: 'Top 100' }
]

async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const res = await queryAllEcharts({ currentRank: currentRank.value })
    allData.value = res
  } catch (e: any) {
    console.warn('[charts] loadAll failed', e?.message)
    error.value = '后端不可达, 显示示意数据'
    allData.value = generateMockAll(currentRank.value)
  } finally {
    loading.value = false
  }
}

function generateMockAll(rank: number) {
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
  return {
    chatData: {
      series: [
        { name: '麻省理工学院', data: [4, 1, 1, 1, 1, 1, 1, 1] },
        { name: '斯坦福大学',   data: [2, 2, 2, 2, 3, 3, 5, 5] },
        { name: '哈佛大学',     data: [3, 3, 3, 5, 5, 5, 4, 4] },
        { name: '剑桥大学',     data: [5, 6, 7, 7, 4, 2, 2, 2] },
        { name: '牛津大学',     data: [6, 5, 4, 4, 2, 4, 3, 3] }
      ].filter(s => Math.max(...s.data) <= rank)
    },
    legendData: years
  }
}

onMounted(loadAll)
watch(currentRank, loadAll)

// ============== 派生数据 ==============
const years = computed(() => allData.value?.legendData ?? [])
const series = computed(() => allData.value?.chatData?.series ?? [])

const rankingBoard = computed(() => {
  return series.value
    .map((s: any) => {
      const data = s.data || []
      const valid = data.filter((v: any) => typeof v === 'number') as number[]
      const last = valid.length ? valid[valid.length - 1]! : 0
      const first = valid.length ? valid[0]! : last
      const max = valid.length ? Math.max(...valid) : last
      const min = valid.length ? Math.min(...valid) : last
      const trend = last - first
      let tone: 'up' | 'down' | 'flat' = 'flat'
      if (trend < -3) tone = 'up'
      else if (trend > 3) tone = 'down'
      return { name: s.name, data, last, max, min, trend, tone }
    })
    .filter((r: any) => r.last > 0 && r.last <= currentRank.value)
    .sort((a: any, b: any) => a.last - b.last)
})

const kpis = computed(() => {
  const n = rankingBoard.value.length
  const up = rankingBoard.value.filter((r: any) => r.tone === 'up').length
  const down = rankingBoard.value.filter((r: any) => r.tone === 'down').length
  const stable = n - up - down
  return [
    { label: '入选大学', value: n, sub: `Top ${currentRank.value}`, color: 'var(--color-brand-blue)' },
    { label: '黑马 (上升)', value: up, sub: '同比首年 -3 以上', color: '#10b981' },
    { label: '下行', value: down, sub: '同比首年 +3 以上', color: '#ef4444' },
    { label: '稳定', value: stable, sub: '±3 内波动', color: 'var(--color-stone)' }
  ]
})

// ============== 模式 1: 排名榜 + 对比 (watchlist) ==============
const watchlist = ref<string[]>([])
const MAX_WATCHLIST = 5

function toggleWatch(name: string) {
  const idx = watchlist.value.indexOf(name)
  if (idx >= 0) watchlist.value.splice(idx, 1)
  else {
    if (watchlist.value.length >= MAX_WATCHLIST) watchlist.value.shift()
    watchlist.value.push(name)
  }
}
function isWatching(name: string): boolean { return watchlist.value.includes(name) }
const watchSeries = computed(() => watchlist.value.map(n => series.value.find((s: any) => s.name === n)).filter(Boolean))
const watchChart = computed(() => ({ chatData: { series: watchSeries.value }, legendData: years.value }))
function clearWatch() { watchlist.value = [] }

// ============== 模式 2: 4 维对比 ==============
const selectedForVariants = ref<string[]>([])
const variantCharts = ref<Record<string, any>>({})
const variantLoading = ref(false)

const variantColors = ['#1456f0', '#ea5ec1', '#10b981', '#f59e0b', '#a855f7', '#06b6d4']
function variantColor(idx: number) { return variantColors[idx % variantColors.length] }

async function loadVariantChart(name: string) {
  if (variantCharts.value[name]) return
  try {
    const res = await trendAllVariants(name)
    if (res?.chatData?.series) variantCharts.value[name] = res.chatData
  } catch (e) {
    console.warn(`[charts] trendAllVariants failed for ${name}`, e)
  }
}

watch([selectedForVariants, currentRank], async () => {
  if (mode.value !== 'variants') return
  variantLoading.value = true
  await Promise.all(selectedForVariants.value.map(loadVariantChart))
  variantLoading.value = false
})

const variantMergedChart = computed(() => {
  const mergedSeries: any[] = []
  let chartYears: string[] = []
  for (const name of selectedForVariants.value) {
    const chart = variantCharts.value[name]
    if (!chart?.series) continue
    if (!chartYears.length) chartYears = chart.legendData ?? []
    for (const s of chart.series) {
      mergedSeries.push({ ...s, name: `${name} · ${s.name.replace(/^.*?·\s*/, '')}` })
    }
  }
  return { chatData: { series: mergedSeries }, legendData: chartYears }
})

function toggleSelect(name: string) {
  const idx = selectedForVariants.value.indexOf(name)
  if (idx >= 0) selectedForVariants.value.splice(idx, 1)
  else if (selectedForVariants.value.length < 6) selectedForVariants.value.push(name)
}

// ============== 模式 3: 按学科 ==============
const subjectRankTable = ref<string>('arwu_subject')
const subjectYear = ref<string | undefined>(undefined)
const subjectRankLimit = ref<number>(50)
const subjectList = ref<any[]>([])
const subjectLoading = ref(false)
const subjectCategoryDist = ref<{ name: string; count: number }[]>([])

const SUBJECT_TABLES: Record<string, string> = {
  arwu_subject: 'ARWU 学科',
  usnews_subject: 'US News 学科',
  qs_sustainability: 'QS 可持续',
  declining_trend: '下降趋势',
  edurank_region: 'EduRank 地区'
}
const subjectTableItems = Object.entries(SUBJECT_TABLES).map(([k, v]) => ({ value: k, label: v }))

const subjectYears = ref<string[]>([])
async function loadSubjectYears() {
  if (!subjectRankTable.value) return
  try {
    const res = await fetchBackup2Years(subjectRankTable.value)
    subjectYears.value = res.data ?? []
    if (subjectYears.value.length && !subjectYear.value) subjectYear.value = subjectYears.value[0]
  } catch (e) { subjectYears.value = [] }
}
watch(subjectRankTable, () => {
  subjectYear.value = undefined
  subjectYears.value = []
  loadSubjectYears()
})

async function loadSubject() {
  if (mode.value !== 'subject') return
  subjectLoading.value = true
  try {
    const res = await queryBackup2List({
      page: 1, limit: 500,
      rankTable: subjectRankTable.value,
      rankingYear: subjectYear.value || undefined,
      currentRankLimit: subjectRankLimit.value
    })
    const records: Backup2Record[] = res.data?.records ?? []
    subjectList.value = records.sort((a, b) => (a.currentRankInteger ?? 9999) - (b.currentRankInteger ?? 9999))
    const map = new Map<string, number>()
    for (const r of records) {
      const k = r.rankingCategory || '未分类'
      map.set(k, (map.get(k) || 0) + 1)
    }
    subjectCategoryDist.value = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
  } catch (e) {
    console.warn('[charts] loadSubject failed', e)
    subjectList.value = []
  } finally {
    subjectLoading.value = false
  }
}
watch([mode, subjectYear, subjectRankLimit], loadSubject)
onMounted(loadSubjectYears)

// ============== 模式 4: 按地区 ==============
const selectedRegion = ref<string | undefined>(undefined)
const REGION_TABS = [
  { value: '亚洲', label: '亚洲', color: '#ea5ec1' },
  { value: '欧洲', label: '欧洲', color: '#1456f0' },
  { value: '北美洲', label: '北美洲', color: '#f59e0b' },
  { value: '南美洲', label: '南美洲', color: '#22c55e' },
  { value: '大洋洲', label: '大洋洲', color: '#a855f7' },
  { value: '非洲', label: '非洲', color: '#ef4444' }
]

// ============== Helpers ==============
function trendIcon(tone: string): string {
  if (tone === 'up') return 'i-lucide-trending-up'
  if (tone === 'down') return 'i-lucide-trending-down'
  return 'i-lucide-minus'
}
function trendColor(tone: string): string {
  if (tone === 'up') return 'text-emerald-600'
  if (tone === 'down') return 'text-red-500'
  return 'text-muted'
}
function trendLabel(tone: string, trend: number): string {
  if (tone === 'up') return `↑ ${Math.abs(trend)}`
  if (tone === 'down') return `↓ ${Math.abs(trend)}`
  return '— 0'
}
function rankBadgeTier(rank: number | null | undefined): string {
  if (rank == null) return 'rank-badge--normal'
  if (rank <= 3) return 'rank-badge--gold'
  if (rank <= 10) return 'rank-badge--silver'
  if (rank <= 50) return 'rank-badge--bronze'
  return 'rank-badge--normal'
}
function sparklinePath(data: number[], width = 100, height = 28): string {
  if (!data.length) return ''
  const maxV = Math.max(...data, 10) * 1.1
  const xStep = data.length > 1 ? width / (data.length - 1) : 0
  return data.map((v, i) => {
    const x = i * xStep
    const y = height - (v / maxV) * height
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}
</script>

<template>
  <div>
    <!-- ============== Hero (紧凑) ============== -->
    <section class="chart-hero">
      <div class="page-container">
        <div class="chart-hero__inner">
          <UBadge color="primary" variant="subtle" size="md">
            <UIcon name="i-lucide-line-chart" class="size-3.5" />
            <span class="ml-1.5 t-caption-bold">趋势 · 对比 · 洞察</span>
          </UBadge>
          <h1 class="t-h1 mt-3">数据图表</h1>
          <p class="t-subtitle mt-2">让选校决策有数</p>
        </div>
      </div>
    </section>

    <!-- ============== 4 mode tab pill ============== -->
    <div class="page-container section-band">
      <div class="mode-tab-row">
        <UButton
          v-for="m in modeTabs"
          :key="m.value"
          :color="mode === m.value ? 'primary' : 'neutral'"
          :variant="mode === m.value ? 'solid' : 'outline'"
          :icon="m.icon"
          size="md"
          class="mode-tab-btn rounded-full"
          :ui="{ leadingIcon: 'size-4' }"
          @click="mode = m.value"
        >
          <span class="mode-tab-btn__label">
            <span class="mode-tab-btn__title">{{ m.label }}</span>
            <span class="mode-tab-btn__desc">{{ m.desc }}</span>
          </span>
        </UButton>
      </div>
    </div>

    <UContainer v-if="error" class="pt-2">
      <UAlert color="warning" variant="subtle" :title="error" icon="i-lucide-alert-circle" />
    </UContainer>

    <!-- ============== 通用 toolbar + KPI ============== -->
    <div v-if="mode === 'ranking' || mode === 'variants'" class="page-container section-band">
      <div class="toolbar-row">
        <UFieldGroup size="sm">
          <UButton
            v-for="r in rankItems"
            :key="r.value"
            :color="currentRank === r.value ? 'primary' : 'neutral'"
            :variant="currentRank === r.value ? 'solid' : 'outline'"
            :label="r.label"
            size="sm"
            class="rounded-full"
            @click="currentRank = r.value"
          />
        </UFieldGroup>
        <span class="t-caption text-muted">筛选 Top {{ currentRank }} 范围</span>
      </div>
      <div class="kpi-grid mt-3">
        <StatCard
          v-for="(k, i) in kpis"
          :key="k.label"
          :label="k.label"
          :value="k.value"
          :hint="k.sub"
          :primary="i === 0"
        />
      </div>
    </div>

    <!-- ============== 模式 1: 排名榜 + 对比 ============== -->
    <div v-if="mode === 'ranking'" class="page-container section-band">
      <UCard class="watch-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <div class="watch-card__head">
          <div>
            <div class="t-caption-bold text-muted">我的对比</div>
            <h2 class="t-h3 mt-1">挑出你最关注的 {{ MAX_WATCHLIST }} 所大学</h2>
          </div>
          <div class="flex items-center gap-2">
            <UBadge v-if="watchlist.length" color="primary" variant="subtle" :label="`${watchlist.length} / ${MAX_WATCHLIST}`" />
            <UButton v-if="watchlist.length" icon="i-lucide-trash-2" color="neutral" variant="ghost" size="sm" label="清空" class="rounded-full" @click="clearWatch" />
          </div>
        </div>
        <ClientOnly>
          <div v-if="watchlist.length === 0" class="watch-empty">
            <UIcon name="i-lucide-eye-off" class="size-7" />
            <span class="t-body-sm">还没有添加大学</span>
            <span class="t-caption text-muted">下方排名榜点 + 加入对比</span>
          </div>
          <div v-else class="watch-chart-box">
            <ChartSvgChart :chart="watchChart" :height="320" />
            <div class="watch-chips">
              <UButton
                v-for="name in watchlist"
                :key="name"
                :label="name"
                icon="i-lucide-x"
                color="neutral"
                variant="outline"
                size="xs"
                class="rounded-full"
                @click="toggleWatch(name)"
              />
            </div>
          </div>
        </ClientOnly>
      </UCard>
    </div>

    <div v-if="mode === 'ranking'" class="page-container section-band">
      <UCard class="rank-table-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-0' }">
        <div class="rank-table-head">
          <div>
            <h2 class="t-h3">Top {{ currentRank }} 排名榜</h2>
            <p class="t-caption mt-1">按最新年份排名升序 · sparkline = 历年曲线 · trend = 同比首年变化</p>
          </div>
        </div>
        <ClientOnly>
          <UTable
            :data="rankingBoard"
            :loading="loading"
            :columns="[
              { id: 'rank', header: '排名', meta: { class: { th: 'w-[88px]', td: 'w-[88px]' } } },
              { id: 'name', header: '大学' },
              { id: 'sparkline', header: '历年曲线', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } },
              { id: 'minmax', header: '区间 (低/高)', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } },
              { id: 'trend', header: '趋势', meta: { class: { th: 'w-[120px]', td: 'w-[120px]' } } },
              { id: 'action', header: '', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } }
            ]"
            :ui="{ th: 'text-[12px] font-medium text-muted', td: 'py-3 text-sm' }"
          >
            <template #rank-cell="{ row }">
              <span :class="['rank-badge', rankBadgeTier(row.original.last)]">{{ row.original.last }}</span>
            </template>
            <template #name-cell="{ row }">
              <NuxtLink :to="`/universities/${encodeURIComponent(row.original.name)}`" class="t-body-sm font-medium text-default hover:text-brand">{{ row.original.name }}</NuxtLink>
            </template>
            <template #sparkline-cell="{ row }">
              <svg :width="100" :height="28" class="overflow-visible">
                <path :d="sparklinePath(row.original.data, 100, 28)" fill="none" stroke="var(--color-brand-blue)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </template>
            <template #minmax-cell="{ row }">
              <span class="t-caption">
                <span class="text-emerald-600">{{ row.original.min }}</span>
                <span class="mx-1 text-stone">/</span>
                <span class="text-red-500">{{ row.original.max }}</span>
              </span>
            </template>
            <template #trend-cell="{ row }">
              <div class="inline-flex items-center gap-1.5" :class="trendColor(row.original.tone)">
                <UIcon :name="trendIcon(row.original.tone)" class="size-4" />
                <span class="t-body-sm font-medium">{{ trendLabel(row.original.tone, row.original.trend) }}</span>
              </div>
            </template>
            <template #action-cell="{ row }">
              <UButton
                :icon="isWatching(row.original.name) ? 'i-lucide-check' : 'i-lucide-plus'"
                :color="isWatching(row.original.name) ? 'primary' : 'neutral'"
                :variant="isWatching(row.original.name) ? 'solid' : 'outline'"
                size="xs"
                :label="isWatching(row.original.name) ? '已加入' : '加入对比'"
                class="rounded-full"
                :disabled="!isWatching(row.original.name) && watchlist.length >= MAX_WATCHLIST"
                @click="toggleWatch(row.original.name)"
              />
            </template>
          </UTable>
        </ClientOnly>
      </UCard>
    </div>

    <!-- ============== 模式 2: 4 维对比 ============== -->
    <div v-if="mode === 'variants'" class="page-container section-band">
      <UCard class="variant-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 class="t-h3">4 维多校对比</h2>
            <p class="t-caption mt-1">勾几所大学 · 拉到 QS 综合 / QS 计算机 / US News 综合 / US News 计算机 (共 N × 4 条线)</p>
          </div>
          <UBadge v-if="selectedForVariants.length" color="primary" variant="subtle" :label="`已选 ${selectedForVariants.length} / 6`" />
        </div>
        <div class="mb-4">
          <div class="t-caption-bold text-muted mb-2">点击切换选择 (Top 30)</div>
          <div class="variant-pill-row">
            <UButton
              v-for="r in rankingBoard.slice(0, 30)"
              :key="r.name"
              :color="selectedForVariants.includes(r.name) ? 'primary' : 'neutral'"
              :variant="selectedForVariants.includes(r.name) ? 'solid' : 'outline'"
              size="xs"
              class="variant-pill rounded-full"
              @click="toggleSelect(r.name)"
            >
              <span class="text-[10px] tabular-nums mr-1">{{ r.last }}</span>
              {{ r.name }}
              <UIcon v-if="selectedForVariants.includes(r.name)" name="i-lucide-check" class="ml-1 size-3" />
            </UButton>
          </div>
        </div>
        <ClientOnly>
          <div v-if="selectedForVariants.length === 0" class="watch-empty">
            <UIcon name="i-lucide-git-compare" class="size-7" />
            <span class="t-body-sm">从上方勾几所大学, 这里画 N × 4 条对比线</span>
          </div>
          <div v-else-if="variantLoading" class="watch-loading">
            <UIcon name="i-lucide-loader" class="size-5 animate-spin" />
            <span class="ml-2 t-body-sm text-muted">加载 4 维数据...</span>
          </div>
          <div v-else class="watch-chart-box">
            <ChartSvgChart :chart="variantMergedChart" :height="380" />
            <div class="variant-legend">
              <div class="variant-legend__item">
                <span class="variant-legend__dot" style="background: #1456f0" />QS 综合
              </div>
              <div class="variant-legend__item">
                <span class="variant-legend__dot" style="background: #3b82f6" />QS 计算机
              </div>
              <div class="variant-legend__item">
                <span class="variant-legend__dot" style="background: #ea5ec1" />US News 综合
              </div>
              <div class="variant-legend__item">
                <span class="variant-legend__dot" style="background: #a855f7" />US News 计算机
              </div>
            </div>
          </div>
        </ClientOnly>
      </UCard>
    </div>

    <!-- ============== 模式 3: 按学科 ============== -->
    <div v-if="mode === 'subject'" class="page-container section-band">
      <UCard class="subject-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <div class="mb-4 flex flex-wrap items-center gap-3">
          <h2 class="t-h3">按学科 / 分类排序</h2>
          <USelectMenu v-model="subjectRankTable" :items="subjectTableItems" value-key="value" size="sm" class="min-w-[180px]" />
          <USelectMenu
            v-if="subjectYears.length"
            v-model="subjectYear"
            :items="subjectYears.map(y => ({ value: y, label: y }))"
            value-key="value"
            size="sm"
            class="min-w-[100px]"
          />
          <USelectMenu
            :model-value="subjectRankLimit"
            :items="[{ value: 20, label: 'Top 20' }, { value: 50, label: 'Top 50' }, { value: 100, label: 'Top 100' }, { value: 200, label: 'Top 200' }]"
            value-key="value"
            size="sm"
            class="min-w-[100px]"
            @update:model-value="(v: any) => subjectRankLimit = v"
          />
        </div>
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <UCard class="dist-card" :ui="{ root: 'rounded-2xl border border-default bg-muted ring-0', body: 'p-4' }">
            <div class="t-caption-bold text-muted mb-2">分类分布 (Top 12)</div>
            <div v-if="subjectLoading" class="text-center py-8">
              <UIcon name="i-lucide-loader" class="size-4 animate-spin text-muted" />
            </div>
            <div v-else class="space-y-1.5">
              <div v-for="(c, i) in subjectCategoryDist" :key="c.name" class="dist-row">
                <span class="dist-row__name">{{ c.name }}</span>
                <span class="dist-row__bar">
                  <span class="dist-row__fill" :style="{ width: ((c.count / (subjectCategoryDist[0]?.count || 1)) * 100) + '%', background: variantColor(i) }" />
                </span>
                <span class="dist-row__count" :style="{ color: variantColor(i) }">{{ c.count }}</span>
              </div>
            </div>
          </UCard>
          <UCard class="subject-table-card lg:col-span-2" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-0' }">
            <ClientOnly>
              <UTable
                v-if="!subjectLoading"
                :data="subjectList.slice(0, 50)"
                :columns="[
                  { id: 'rank', header: '排名', meta: { class: { th: 'w-[80px]', td: 'w-[80px]' } } },
                  { id: 'name', header: '院校' },
                  { id: 'category', header: '学科' },
                  { id: 'year', header: '年份', meta: { class: { th: 'w-[100px]', td: 'w-[100px]' } } },
                  { id: 'action', header: '', meta: { class: { th: 'w-[100px]', td: 'w-[100px]' } } }
                ]"
                :ui="{ th: 'text-[12px] font-medium text-muted', td: 'py-2.5 text-sm' }"
              >
                <template #rank-cell="{ row }">
                  <span :class="['rank-badge', rankBadgeTier(row.original.currentRankInteger), 'rank-badge--sm']">{{ row.original.currentRankInteger ?? '—' }}</span>
                </template>
                <template #name-cell="{ row }">
                  <NuxtLink :to="`/universities/${encodeURIComponent(row.original.universityNameChinese)}`" class="t-body-sm font-medium text-default hover:text-brand">
                    {{ row.original.universityNameChinese }}
                  </NuxtLink>
                </template>
                <template #category-cell="{ row }">
                  <UBadge color="primary" variant="subtle" size="xs" :label="row.original.rankingCategory || '—'" />
                </template>
                <template #year-cell="{ row }">
                  <span class="t-caption text-muted">{{ row.original.rankingYear || '—' }}</span>
                </template>
                <template #action-cell="{ row }">
                  <UButton
                    :icon="isWatching(row.original.universityNameChinese) ? 'i-lucide-check' : 'i-lucide-plus'"
                    :color="isWatching(row.original.universityNameChinese) ? 'primary' : 'neutral'"
                    :variant="isWatching(row.original.universityNameChinese) ? 'solid' : 'outline'"
                    size="xs"
                    :label="isWatching(row.original.universityNameChinese) ? '已加入' : '加入对比'"
                    class="rounded-full"
                    @click="toggleWatch(row.original.universityNameChinese)"
                  />
                </template>
              </UTable>
              <div v-else class="text-center py-10">
                <UIcon name="i-lucide-loader" class="size-4 animate-spin text-muted" />
                <p class="t-body-sm text-muted mt-2">加载中…</p>
              </div>
            </ClientOnly>
          </UCard>
        </div>
      </UCard>
    </div>

    <!-- ============== 模式 4: 按地区 ============== -->
    <div v-if="mode === 'region'" class="page-container section-band">
      <UCard class="region-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <div class="mb-4">
          <h2 class="t-h3">按地区联动</h2>
          <p class="t-caption mt-1">选洲 → 看国家分布 → 加对比</p>
        </div>
        <div class="mb-5 flex flex-wrap gap-2">
          <UButton
            :color="!selectedRegion ? 'primary' : 'neutral'"
            :variant="!selectedRegion ? 'solid' : 'outline'"
            size="sm"
            label="全部"
            class="rounded-full"
            @click="selectedRegion = undefined"
          />
          <UButton
            v-for="r in REGION_TABS"
            :key="r.value"
            :color="selectedRegion === r.value ? 'primary' : 'neutral'"
            :variant="selectedRegion === r.value ? 'solid' : 'outline'"
            size="sm"
            :label="r.label"
            class="rounded-full"
            @click="selectedRegion = selectedRegion === r.value ? undefined : r.value"
          />
        </div>
        <div class="rounded-2xl border border-dashed border-default p-12 text-center">
          <UIcon name="i-lucide-globe-2" class="size-7 mx-auto text-muted" />
          <h3 class="t-h4 mt-3">地区分布视图</h3>
          <p class="t-body-sm text-muted mt-2">点击上方洲 tab 后, 展示对应国家的院校列表与排名分布</p>
          <UButton to="/universities" color="primary" variant="outline" size="md" icon="i-lucide-library" label="去学校库" class="rounded-full mt-4" />
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
/* Hero */
.chart-hero { padding: 64px 0 32px; background: var(--color-canvas); }
@media (min-width: 768px) {
  .chart-hero { padding: 80px 0 48px; }
}
.chart-hero__inner { display: flex; flex-direction: column; gap: 12px; }

/* Section 间距 */
.section-band { margin-top: 24px; }
@media (min-width: 768px) {
  .section-band { margin-top: 32px; }
}

/* 4 mode tab pill row */
.mode-tab-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.mode-tab-btn {
  flex: 1 1 200px;
  min-height: 56px;
  justify-content: flex-start !important;
}
.mode-tab-btn__label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.2;
}
.mode-tab-btn__title { font-size: 13px; font-weight: 600; }
.mode-tab-btn__desc { font-size: 10px; font-weight: 400; opacity: 0.8; }

/* Toolbar */
.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 768px) {
  .kpi-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
}

/* Watch card */
.watch-card__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 16px;
}
.watch-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 48px 20px;
  border-radius: 16px;
  border: 2px dashed var(--color-hairline);
  background: var(--color-surface-soft);
  color: var(--color-slate);
  text-align: center;
}
.watch-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px;
}
.watch-chart-box {
  border-radius: 16px;
  background: var(--color-surface);
  padding: 16px;
}
.watch-chips {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Rank table */
.rank-table-head { padding: 16px 20px; border-bottom: 1px solid var(--color-hairline); }

/* Variant card */
.variant-pill-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.variant-legend {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 11px;
  color: var(--color-slate);
}
.variant-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.variant-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
}

/* Dist row */
.dist-row {
  display: grid;
  grid-template-columns: 120px 1fr 36px;
  align-items: center;
  gap: 8px;
  font-family: var(--font-ui);
}
.dist-row__name {
  font-size: 12px;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dist-row__bar {
  height: 6px;
  background: var(--color-canvas);
  border-radius: 9999px;
  overflow: hidden;
}
.dist-row__fill {
  display: block;
  height: 100%;
  border-radius: 9999px;
}
.dist-row__count {
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 700;
  text-align: right;
}

/* Subject table */
.subject-table-card { background: var(--color-canvas); }

/* Rank badge (DESIGN.md §rounded.md 8px) */
:deep(.rank-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  height: 32px;
  padding: 0 10px;
  border-radius: 8px;
  font-family: var(--font-data);
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-canvas);
}
:deep(.rank-badge--gold)   { background: #f59e0b; }
:deep(.rank-badge--silver) { background: #9ca3af; color: var(--color-ink); }
:deep(.rank-badge--bronze) { background: #ea580c; }
:deep(.rank-badge--normal) { background: var(--color-surface-soft); color: var(--color-ink); }
:deep(.rank-badge--sm) {
  min-width: 36px;
  height: 24px;
  font-size: 12px;
  padding: 0 6px;
}
</style>