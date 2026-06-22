<script setup lang="ts">
import { queryAllEcharts } from '~/lib/api/university'
import { trendAllVariants, queryBackup2List, fetchBackup2Years } from '~/lib/api/ranking'
import type { Backup2Record, ChartData, ChartSeries, EchartsDTO } from '~/types'

definePageMeta({
  layout: 'default',
})

useHead({ title: '数据图表 · 选校系统' })

// ============== 顶部 4 mode tab ==============
type Mode = 'ranking' | 'variants' | 'subject' | 'region'
const mode = ref<Mode>('ranking')

interface ModeTab {
  value: Mode
  label: string
  icon: string
  desc: string
}

const modeTabs: ModeTab[] = [
  { value: 'ranking', label: '排名榜 + 对比', icon: 'i-lucide-bar-chart-3', desc: 'Top 50 与自选对比' },
  { value: 'variants', label: '4 维对比', icon: 'i-lucide-git-compare', desc: '多校 N × 4 维趋势' },
  { value: 'subject', label: '按学科', icon: 'i-lucide-book-marked', desc: '学科与特色榜单' },
  { value: 'region', label: '按地区', icon: 'i-lucide-globe-2', desc: '洲 → 国家 → 院校' },
]

// ============== 通用数据 ==============
const allData = ref<EchartsDTO | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const currentRank = ref<number>(50)

const rankItems = [
  { value: 20, label: 'Top 20' },
  { value: 50, label: 'Top 50' },
  { value: 100, label: 'Top 100' },
]

function generateMockAll(rank: number): EchartsDTO {
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
  const series: ChartSeries[] = [
    { name: '麻省理工学院', data: [4, 1, 1, 1, 1, 1, 1, 1] },
    { name: '斯坦福大学', data: [2, 2, 2, 2, 3, 3, 5, 5] },
    { name: '哈佛大学', data: [3, 3, 3, 5, 5, 5, 4, 4] },
    { name: '剑桥大学', data: [5, 6, 7, 7, 4, 2, 2, 2] },
    { name: '牛津大学', data: [6, 5, 4, 4, 2, 4, 3, 3] },
  ]
    .filter(s => Math.max(...(s.data as number[])) <= rank)
    .map(s => ({ ...s, type: 'line' }))
  return {
    chatData: { series },
    legendData: years,
  }
}

async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const res = await queryAllEcharts({ currentRank: currentRank.value })
    allData.value = res
  } catch (e: unknown) {
    console.warn('[charts] loadAll failed', (e as Error)?.message)
    error.value = '后端不可达，显示示意数据'
    allData.value = generateMockAll(currentRank.value)
  } finally {
    loading.value = false
  }
}

onMounted(loadAll)
watch(currentRank, loadAll)

// ============== 派生数据 ==============
const years = computed(() => allData.value?.legendData ?? [])

interface SeriesItem {
  name: string
  data: number[]
  region: string | null
  country: string | null
}

const series = computed<SeriesItem[]>(() => {
  const raw = allData.value?.chatData?.series ?? []
  return raw.map((s: ChartSeries) => {
    const data = (s.data ?? [])
      .map((v: number | null) => (typeof v === 'number' ? v : Number.parseFloat(v as unknown as string)))
      .filter((v: number) => !Number.isNaN(v) && v > 0)
    return {
      name: s.name ?? '',
      data,
      region: (s as unknown as Record<string, string | null>).region ?? null,
      country: (s as unknown as Record<string, string | null>).country ?? null,
    }
  })
})

interface RankingRow {
  name: string
  data: number[]
  last: number
  max: number
  min: number
  trend: number
  tone: 'up' | 'down' | 'flat'
  region: string | null
}

const rankingBoard = computed<RankingRow[]>(() => {
  return series.value
    .map((s) => {
      const valid = s.data
      const last = valid.length ? valid[valid.length - 1]! : 0
      const first = valid.length ? valid[0]! : last
      const max = valid.length ? Math.max(...valid) : last
      const min = valid.length ? Math.min(...valid) : last
      const trend = last - first
      let tone: 'up' | 'down' | 'flat' = 'flat'
      if (trend < -3) tone = 'up'
      else if (trend > 3) tone = 'down'
      return { name: s.name, data: s.data, last, max, min, trend, tone, region: s.region }
    })
    .filter(r => r.last > 0 && r.last <= currentRank.value)
    .sort((a, b) => a.last - b.last)
})

const kpis = computed(() => {
  const n = rankingBoard.value.length
  const up = rankingBoard.value.filter(r => r.tone === 'up').length
  const down = rankingBoard.value.filter(r => r.tone === 'down').length
  const stable = n - up - down
  return [
    { label: '入选大学', value: n, sub: `Top ${currentRank.value}`, icon: 'i-lucide-school' },
    { label: '黑马（上升）', value: up, sub: '同比首年 -3 以上', icon: 'i-lucide-trending-up' },
    { label: '下行', value: down, sub: '同比首年 +3 以上', icon: 'i-lucide-trending-down' },
    { label: '稳定', value: stable, sub: '±3 内波动', icon: 'i-lucide-minus' },
  ]
})

// ============== 模式 1: 排名榜 + 对比 (watchlist) ==============
const watchlist = ref<string[]>([])
const MAX_WATCHLIST = 5

function toggleWatch(name: string) {
  const idx = watchlist.value.indexOf(name)
  if (idx >= 0) {
    watchlist.value.splice(idx, 1)
  } else if (watchlist.value.length < MAX_WATCHLIST) {
    watchlist.value.push(name)
  }
}
function isWatching(name: string): boolean { return watchlist.value.includes(name) }

const watchSeries = computed<ChartSeries[]>(() => {
  return watchlist.value
    .map(name => series.value.find(s => s.name === name))
    .filter((s): s is SeriesItem => !!s)
    .map(s => ({ name: s.name, data: s.data }))
})

const watchChart = computed<EchartsDTO>(() => ({
  chatData: { series: watchSeries.value },
  legendData: years.value,
}))

function clearWatch() { watchlist.value = [] }

// ============== 模式 2: 4 维对比 ==============
const selectedForVariants = ref<string[]>([])
const variantCharts = ref<Record<string, EchartsDTO>>({})
const variantLoading = ref(false)

const VARIANT_DIM_COLORS: Record<string, string> = {
  qs: '#1456f0',
  qs_cs: '#3b82f6',
  usnews: '#ea5ec1',
  usnews_cs: '#a855f7',
}

function variantDimLabel(suffix: string): string {
  if (suffix === 'qs') return 'QS 综合'
  if (suffix === 'qs_cs') return 'QS 计算机'
  if (suffix === 'usnews') return 'US News 综合'
  if (suffix === 'usnews_cs') return 'US News 计算机'
  return suffix
}

async function loadVariantChart(name: string) {
  if (variantCharts.value[name]) return
  try {
    const res = await trendAllVariants(name)
    if (res?.chatData) variantCharts.value[name] = res
  } catch (e: unknown) {
    console.warn(`[charts] trendAllVariants failed for ${name}`, (e as Error)?.message)
  }
}

watch([selectedForVariants, currentRank], async () => {
  if (mode.value !== 'variants') return
  variantLoading.value = true
  await Promise.all(selectedForVariants.value.map(loadVariantChart))
  variantLoading.value = false
})

const variantMergedChart = computed<EchartsDTO>(() => {
  const mergedSeries: ChartSeries[] = []
  let chartYears: string[] = []
  for (const name of selectedForVariants.value) {
    const chart = variantCharts.value[name]
    if (!chart?.chatData?.series) continue
    if (!chartYears.length) chartYears = chart.legendData ?? []
    for (const s of chart.chatData.series) {
      const shortName = (s.name ?? '').replace(/^.*?·\s*/, '')
      mergedSeries.push({
        ...s,
        name: `${name} · ${shortName}`,
      })
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
const subjectList = ref<Backup2Record[]>([])
const subjectLoading = ref(false)
const subjectCategoryDist = ref<{ name: string; count: number }[]>([])

const SUBJECT_TABLES: Record<string, string> = {
  arwu_subject: 'ARWU 学科',
  usnews_subject: 'US News 学科',
  qs_sustainability: 'QS 可持续',
  declining_trend: '下降趋势',
  edurank_region: 'EduRank 地区',
}

const subjectTableItems = Object.entries(SUBJECT_TABLES).map(([k, v]) => ({ value: k, label: v }))
const subjectLimitItems = [
  { value: 20, label: 'Top 20' },
  { value: 50, label: 'Top 50' },
  { value: 100, label: 'Top 100' },
  { value: 200, label: 'Top 200' },
]

const subjectYears = ref<string[]>([])
async function loadSubjectYears() {
  if (!subjectRankTable.value) return
  try {
    const res = await fetchBackup2Years(subjectRankTable.value)
    subjectYears.value = res.data ?? []
    if (subjectYears.value.length && !subjectYear.value) subjectYear.value = subjectYears.value[0]
  } catch (e: unknown) {
    console.warn('[charts] loadSubjectYears failed', (e as Error)?.message)
    subjectYears.value = []
  }
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
      page: 1,
      limit: 500,
      rankTable: subjectRankTable.value,
      rankingYear: subjectYear.value || undefined,
      currentRankLimit: subjectRankLimit.value,
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
  } catch (e: unknown) {
    console.warn('[charts] loadSubject failed', (e as Error)?.message)
    subjectList.value = []
  } finally {
    subjectLoading.value = false
  }
}

watch([mode, subjectYear, subjectRankLimit], loadSubject)
onMounted(loadSubjectYears)

// ============== 模式 4: 按地区 ==============
interface RegionTab {
  value: string
  label: string
  color: string
}

const REGION_TABS: RegionTab[] = [
  { value: '亚洲', label: '亚洲', color: '#ea5ec1' },
  { value: '欧洲', label: '欧洲', color: '#1456f0' },
  { value: '北美洲', label: '北美洲', color: '#f59e0b' },
  { value: '南美洲', label: '南美洲', color: '#22c55e' },
  { value: '大洋洲', label: '大洋洲', color: '#a855f7' },
  { value: '非洲', label: '非洲', color: '#ef4444' },
]

const selectedRegion = ref<string | undefined>(undefined)

const regionRows = computed<RankingRow[]>(() => {
  if (!selectedRegion.value) return []
  return rankingBoard.value.filter(r => r.region === selectedRegion.value)
})

const regionDist = computed<{ tab: RegionTab; count: number }[]>(() => {
  return REGION_TABS.map(tab => ({
    tab,
    count: rankingBoard.value.filter(r => r.region === tab.value).length,
  }))
})

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
  <div class="charts-page">
    <!-- ============== Hero ============== -->
    <section class="charts-hero">
      <div class="page-container">
        <div class="charts-hero__eyebrow">
          <span class="charts-hero__dot" />
          <span>趋势 · 对比 · 洞察</span>
        </div>
        <h1 class="charts-hero__title">数据图表</h1>
        <p class="charts-hero__sub">多源排名 × 历年趋势 × 多维对比，让选校决策有数</p>
      </div>
    </section>

    <!-- ============== 4 mode tab ============== -->
    <section class="page-container section-band">
      <div class="mode-grid">
        <UButton
          v-for="m in modeTabs"
          :key="m.value"
          :color="mode === m.value ? 'primary' : 'neutral'"
          :variant="mode === m.value ? 'solid' : 'outline'"
          :icon="m.icon"
          :class="['mode-card', mode === m.value ? 'bg-ink text-white' : 'bg-canvas text-ink']"
          :ui="{ base: 'rounded-2xl border border-default justify-start h-auto', leadingIcon: 'size-4' }"
          @click="mode = m.value"
        >
          <span class="mode-card__label">
            <span class="mode-card__title">{{ m.label }}</span>
            <span class="mode-card__desc">{{ m.desc }}</span>
          </span>
        </UButton>
      </div>
    </section>

    <UContainer v-if="error" class="pt-2">
      <UAlert color="warning" variant="subtle" :title="error" icon="i-lucide-alert-circle" />
    </UContainer>

    <!-- ============== 通用 toolbar + KPI ============== -->
    <section
      v-if="mode === 'ranking' || mode === 'variants' || mode === 'region'"
      class="page-container section-band"
    >
      <div class="toolbar-row">
        <div class="rank-filter">
          <UButton
            v-for="r in rankItems"
            :key="r.value"
            :color="currentRank === r.value ? 'primary' : 'neutral'"
            :variant="currentRank === r.value ? 'solid' : 'outline'"
            :label="r.label"
            size="sm"
            :class="['rounded-full', currentRank === r.value ? 'bg-ink text-white' : '']"
            @click="currentRank = r.value"
          />
        </div>
        <span class="t-caption text-muted">当前范围：Top {{ currentRank }}</span>
      </div>
      <div class="kpi-grid">
        <UCard
          v-for="k in kpis"
          :key="k.label"
          class="kpi-card"
          :ui="{ root: 'rounded-2xl border border-white/50 bg-white/60 ring-0 backdrop-blur', body: 'p-5' }"
        >
          <div class="kpi-card__head">
            <span class="kpi-card__label">{{ k.label }}</span>
            <UIcon :name="k.icon" class="size-4 text-stone" />
          </div>
          <div class="kpi-card__value">{{ k.value }}</div>
          <div class="kpi-card__hint">{{ k.sub }}</div>
        </UCard>
      </div>
    </section>

    <!-- ============== 模式 1: 排名榜 + 对比 ============== -->
    <template v-if="mode === 'ranking'">
      <section class="page-container section-band">
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
          <div class="section-card__head">
            <div>
              <div class="t-caption text-muted">我的对比</div>
              <h2 class="t-h3 mt-1">关注最多 {{ MAX_WATCHLIST }} 所大学</h2>
            </div>
            <div class="flex items-center gap-2">
              <UBadge
                v-if="watchlist.length"
                color="primary"
                variant="subtle"
                class="bg-ink text-white"
                :label="`${watchlist.length} / ${MAX_WATCHLIST}`"
              />
              <UButton
                v-if="watchlist.length"
                icon="i-lucide-trash-2"
                color="neutral"
                variant="ghost"
                size="sm"
                label="清空"
                class="rounded-full"
                @click="clearWatch"
              />
            </div>
          </div>
          <ClientOnly>
            <div v-if="watchlist.length === 0" class="empty-box">
              <UIcon name="i-lucide-eye-off" class="size-5" />
              <span class="t-body-sm">还没有添加大学</span>
              <span class="t-caption text-muted">在下方排名榜点击「加入对比」</span>
            </div>
            <div v-else>
              <VChart :chart="watchChart" :height="320" />
              <div class="chips-row">
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
      </section>

      <section class="page-container section-band section-band--lg">
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-0' }">
          <div class="rank-table-head">
            <div>
              <h2 class="t-h3">Top {{ currentRank }} 排名榜</h2>
              <p class="t-caption mt-1">按最新年份排名升序 · 历年曲线 · 同比首年变化</p>
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
                { id: 'minmax', header: '区间（低 / 高）', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } },
                { id: 'trend', header: '趋势', meta: { class: { th: 'w-[120px]', td: 'w-[120px]' } } },
                { id: 'action', header: '', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } },
              ]"
              :ui="{ th: 'text-[12px] font-medium text-muted bg-muted', td: 'py-4 text-sm' }"
            >
              <template #rank-cell="{ row }">
                <RankBadge :rank="(row.original as RankingRow).last" size="sm" />
              </template>
              <template #name-cell="{ row }">
                <NuxtLink
                  :to="`/universities/${encodeURIComponent((row.original as RankingRow).name)}`"
                  class="t-body-sm font-medium text-default hover:text-brand"
                >
                  {{ (row.original as RankingRow).name }}
                </NuxtLink>
              </template>
              <template #sparkline-cell="{ row }">
                <svg :width="100" :height="28" class="overflow-visible">
                  <path
                    :d="sparklinePath((row.original as RankingRow).data, 100, 28)"
                    fill="none"
                    stroke="var(--color-brand-blue)"
                    stroke-width="1.5"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </template>
              <template #minmax-cell="{ row }">
                <span class="t-caption">
                  <span class="text-emerald-600">{{ (row.original as RankingRow).min }}</span>
                  <span class="mx-1 text-stone">/</span>
                  <span class="text-red-500">{{ (row.original as RankingRow).max }}</span>
                </span>
              </template>
              <template #trend-cell="{ row }">
                <div
                  class="inline-flex items-center gap-1.5"
                  :class="trendColor((row.original as RankingRow).tone)"
                >
                  <UIcon :name="trendIcon((row.original as RankingRow).tone)" class="size-4" />
                  <span class="t-body-sm font-medium">
                    {{ trendLabel((row.original as RankingRow).tone, (row.original as RankingRow).trend) }}
                  </span>
                </div>
              </template>
              <template #action-cell="{ row }">
                <UButton
                  :icon="isWatching((row.original as RankingRow).name) ? 'i-lucide-check' : 'i-lucide-plus'"
                  :color="isWatching((row.original as RankingRow).name) ? 'primary' : 'neutral'"
                  :variant="isWatching((row.original as RankingRow).name) ? 'solid' : 'outline'"
                  size="xs"
                  :label="isWatching((row.original as RankingRow).name) ? '已加入' : '加入对比'"
                  :class="['rounded-full', isWatching((row.original as RankingRow).name) ? 'bg-ink text-white' : '']"
                  :disabled="!isWatching((row.original as RankingRow).name) && watchlist.length >= MAX_WATCHLIST"
                  @click="toggleWatch((row.original as RankingRow).name)"
                />
              </template>
            </UTable>
          </ClientOnly>
        </UCard>
      </section>
    </template>

    <!-- ============== 模式 2: 4 维对比 ============== -->
    <section v-if="mode === 'variants'" class="page-container section-band">
      <UCard :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <div class="section-card__head">
          <div>
            <div class="t-caption text-muted">4 维对比</div>
            <h2 class="t-h3 mt-1">多校 N × 4 维趋势</h2>
          </div>
          <UBadge
            v-if="selectedForVariants.length"
            color="primary"
            variant="subtle"
            class="bg-ink text-white"
            :label="`已选 ${selectedForVariants.length} / 6`"
          />
        </div>

        <div class="variant-pick">
          <div class="t-caption text-muted mb-2">点击选择院校（Top 30）</div>
          <div class="chips-row">
            <UButton
              v-for="r in rankingBoard.slice(0, 30)"
              :key="r.name"
              :color="selectedForVariants.includes(r.name) ? 'primary' : 'neutral'"
              :variant="selectedForVariants.includes(r.name) ? 'solid' : 'outline'"
              size="xs"
              :class="['rounded-full', selectedForVariants.includes(r.name) ? 'bg-ink text-white' : '']"
              @click="toggleSelect(r.name)"
            >
              <span class="text-[10px] tabular-nums mr-1">#{{ r.last }}</span>
              {{ r.name }}
              <UIcon
                v-if="selectedForVariants.includes(r.name)"
                name="i-lucide-check"
                class="ml-1 size-4"
              />
            </UButton>
          </div>
        </div>

        <ClientOnly>
          <div v-if="selectedForVariants.length === 0" class="empty-box">
            <UIcon name="i-lucide-git-compare" class="size-5" />
            <span class="t-body-sm">从上方选择院校，查看 QS / US News 四个维度对比</span>
          </div>
          <div v-else-if="variantLoading" class="loading-box">
            <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
            <span class="ml-2 t-body-sm text-muted">加载 4 维数据…</span>
          </div>
          <div v-else>
            <VChart :chart="variantMergedChart" :height="380" />
            <div class="variant-legend">
              <div class="variant-legend__item">
                <span class="variant-legend__dot" :style="{ background: VARIANT_DIM_COLORS.qs }" />
                QS 综合
              </div>
              <div class="variant-legend__item">
                <span class="variant-legend__dot" :style="{ background: VARIANT_DIM_COLORS.qs_cs }" />
                QS 计算机
              </div>
              <div class="variant-legend__item">
                <span class="variant-legend__dot" :style="{ background: VARIANT_DIM_COLORS.usnews }" />
                US News 综合
              </div>
              <div class="variant-legend__item">
                <span class="variant-legend__dot" :style="{ background: VARIANT_DIM_COLORS.usnews_cs }" />
                US News 计算机
              </div>
            </div>
          </div>
        </ClientOnly>
      </UCard>
    </section>

    <!-- ============== 模式 3: 按学科 ============== -->
    <section v-if="mode === 'subject'" class="page-container section-band">
      <UCard :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <div class="section-card__head">
          <div>
            <div class="t-caption text-muted">按学科</div>
            <h2 class="t-h3 mt-1">学科与特色榜单</h2>
          </div>
        </div>
        <div class="toolbar-row toolbar-row--wrap">
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
            :items="subjectLimitItems"
            value-key="value"
            size="sm"
            class="min-w-[100px]"
            @update:model-value="(v: number) => subjectRankLimit = v"
          />
        </div>
        <div class="subject-grid">
          <UCard :ui="{ root: 'rounded-2xl border border-default bg-muted ring-0', body: 'p-5' }">
            <div class="t-caption text-muted mb-3">分类分布（Top 12）</div>
            <div v-if="subjectLoading" class="loading-box">
              <UIcon name="i-lucide-loader" class="size-4 animate-spin text-muted" />
            </div>
            <div v-else class="dist-list">
              <div v-for="(c, i) in subjectCategoryDist" :key="c.name" class="dist-row">
                <span class="dist-row__name">{{ c.name }}</span>
                <span class="dist-row__bar">
                  <span
                    class="dist-row__fill"
                    :style="{ width: ((c.count / (subjectCategoryDist[0]?.count || 1)) * 100) + '%', background: Object.values(VARIANT_DIM_COLORS)[i % 4] }"
                  />
                </span>
                <span
                  class="dist-row__count"
                  :style="{ color: Object.values(VARIANT_DIM_COLORS)[i % 4] }"
                >{{ c.count }}</span>
              </div>
            </div>
          </UCard>
          <UCard :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-0' }">
            <ClientOnly>
              <div v-if="subjectLoading" class="loading-box">
                <UIcon name="i-lucide-loader" class="size-4 animate-spin text-muted" />
                <p class="t-body-sm text-muted mt-2">加载中…</p>
              </div>
              <UTable
                v-else
                :data="subjectList.slice(0, 50)"
                :columns="[
                  { id: 'rank', header: '排名', meta: { class: { th: 'w-[80px]', td: 'w-[80px]' } } },
                  { id: 'name', header: '院校' },
                  { id: 'category', header: '学科' },
                  { id: 'year', header: '年份', meta: { class: { th: 'w-[100px]', td: 'w-[100px]' } } },
                  { id: 'action', header: '', meta: { class: { th: 'w-[100px]', td: 'w-[100px]' } } },
                ]"
                :ui="{ th: 'text-[12px] font-medium text-muted bg-muted', td: 'py-3 text-sm' }"
              >
                <template #rank-cell="{ row }">
                  <RankBadge :rank="(row.original as Backup2Record).currentRankInteger" size="sm" />
                </template>
                <template #name-cell="{ row }">
                  <NuxtLink
                    :to="`/universities/${encodeURIComponent((row.original as Backup2Record).universityNameChinese)}`"
                    class="t-body-sm font-medium text-default hover:text-brand"
                  >
                    {{ (row.original as Backup2Record).universityNameChinese }}
                  </NuxtLink>
                </template>
                <template #category-cell="{ row }">
                  <UBadge color="neutral" variant="subtle" size="xs" :label="(row.original as Backup2Record).rankingCategory || '—'" />
                </template>
                <template #year-cell="{ row }">
                  <span class="t-caption text-muted">{{ (row.original as Backup2Record).rankingYear || '—' }}</span>
                </template>
                <template #action-cell="{ row }">
                  <UButton
                    :icon="isWatching((row.original as Backup2Record).universityNameChinese) ? 'i-lucide-check' : 'i-lucide-plus'"
                    :color="isWatching((row.original as Backup2Record).universityNameChinese) ? 'primary' : 'neutral'"
                    :variant="isWatching((row.original as Backup2Record).universityNameChinese) ? 'solid' : 'outline'"
                    size="xs"
                    :label="isWatching((row.original as Backup2Record).universityNameChinese) ? '已加入' : '加入对比'"
                    :class="['rounded-full', isWatching((row.original as Backup2Record).universityNameChinese) ? 'bg-ink text-white' : '']"
                    @click="toggleWatch((row.original as Backup2Record).universityNameChinese)"
                  />
                </template>
              </UTable>
            </ClientOnly>
          </UCard>
        </div>
      </UCard>
    </section>

    <!-- ============== 模式 4: 按地区 ============== -->
    <section v-if="mode === 'region'" class="page-container section-band">
      <UCard :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <div class="section-card__head">
          <div>
            <div class="t-caption text-muted">按地区</div>
            <h2 class="t-h3 mt-1">洲 → 国家 → 院校</h2>
          </div>
        </div>
        <div class="region-tabs">
          <UButton
            :color="!selectedRegion ? 'primary' : 'neutral'"
            :variant="!selectedRegion ? 'solid' : 'outline'"
            size="sm"
            label="全部概览"
            :class="['rounded-full', !selectedRegion ? 'bg-ink text-white' : '']"
            @click="selectedRegion = undefined"
          />
          <UButton
            v-for="r in REGION_TABS"
            :key="r.value"
            :color="selectedRegion === r.value ? 'primary' : 'neutral'"
            :variant="selectedRegion === r.value ? 'solid' : 'outline'"
            size="sm"
            :label="r.label"
            :class="['rounded-full', selectedRegion === r.value ? 'bg-ink text-white' : '']"
            @click="selectedRegion = selectedRegion === r.value ? undefined : r.value"
          />
        </div>

        <div v-if="!selectedRegion" class="region-overview">
          <UCard
            v-for="item in regionDist"
            :key="item.tab.value"
            :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-5' }"
          >
            <div class="flex items-center gap-2 mb-2">
              <span class="region-dot" :style="{ background: item.tab.color }" />
              <span class="t-body-sm font-medium">{{ item.tab.label }}</span>
            </div>
            <div class="region-overview__value">{{ item.count }}</div>
            <div class="t-caption text-muted">所院校进入 Top {{ currentRank }}</div>
          </UCard>
        </div>

        <div v-else-if="regionRows.length === 0" class="empty-box">
          <UIcon name="i-lucide-globe-2" class="size-5" />
          <span class="t-body-sm">该地区暂无 Top {{ currentRank }} 数据</span>
          <span class="t-caption text-muted">可尝试扩大排名范围</span>
        </div>

        <UCard
          v-else
          :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-0' }"
        >
          <UTable
            :data="regionRows"
            :columns="[
              { id: 'rank', header: '排名', meta: { class: { th: 'w-[88px]', td: 'w-[88px]' } } },
              { id: 'name', header: '大学' },
              { id: 'trend', header: '趋势', meta: { class: { th: 'w-[120px]', td: 'w-[120px]' } } },
              { id: 'action', header: '', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } },
            ]"
            :ui="{ th: 'text-[12px] font-medium text-muted bg-muted', td: 'py-3 text-sm' }"
          >
            <template #rank-cell="{ row }">
              <RankBadge :rank="(row.original as RankingRow).last" size="sm" />
            </template>
            <template #name-cell="{ row }">
              <NuxtLink
                :to="`/universities/${encodeURIComponent((row.original as RankingRow).name)}`"
                class="t-body-sm font-medium text-default hover:text-brand"
              >
                {{ (row.original as RankingRow).name }}
              </NuxtLink>
            </template>
            <template #trend-cell="{ row }">
              <div
                class="inline-flex items-center gap-1.5"
                :class="trendColor((row.original as RankingRow).tone)"
              >
                <UIcon :name="trendIcon((row.original as RankingRow).tone)" class="size-4" />
                <span class="t-body-sm font-medium">
                  {{ trendLabel((row.original as RankingRow).tone, (row.original as RankingRow).trend) }}
                </span>
              </div>
            </template>
            <template #action-cell="{ row }">
              <UButton
                :icon="isWatching((row.original as RankingRow).name) ? 'i-lucide-check' : 'i-lucide-plus'"
                :color="isWatching((row.original as RankingRow).name) ? 'primary' : 'neutral'"
                :variant="isWatching((row.original as RankingRow).name) ? 'solid' : 'outline'"
                size="xs"
                :label="isWatching((row.original as RankingRow).name) ? '已加入' : '加入对比'"
                :class="['rounded-full', isWatching((row.original as RankingRow).name) ? 'bg-ink text-white' : '']"
                @click="toggleWatch((row.original as RankingRow).name)"
              />
            </template>
          </UTable>
        </UCard>
      </UCard>
    </section>
  </div>
</template>

<style scoped>
.charts-page {
  width: 100%;
  min-height: 100vh;
  background: var(--color-canvas);
  color: var(--color-ink);
}

/* Hero */
.charts-hero {
  background: var(--color-ink);
  color: var(--color-on-dark);
  padding: 80px 0 56px;
}
@media (min-width: 768px) {
  .charts-hero { padding: 112px 0 80px; }
}
.charts-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 20px;
}
.charts-hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand-coral);
}
.charts-hero__title {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0;
}
@media (min-width: 1024px) {
  .charts-hero__title { font-size: 80px; }
}
.charts-hero__sub {
  font-size: 18px;
  font-weight: 400;
  line-height: 1.50;
  color: rgba(255, 255, 255, 0.72);
  margin: 16px 0 0;
  max-width: 560px;
}
@media (max-width: 640px) {
  .charts-hero { padding: 64px 0 40px; }
  .charts-hero__title { font-size: 40px; }
}

/* Section spacing */
.section-band { margin-top: 32px; }
.section-band--lg { margin-top: 48px; }
@media (min-width: 768px) {
  .section-band { margin-top: 48px; }
  .section-band--lg { margin-top: 64px; }
}
@media (min-width: 1024px) {
  .section-band { margin-top: 64px; }
  .section-band--lg { margin-top: 80px; }
}

/* Mode tabs */
.mode-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 640px) {
  .mode-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .mode-grid { grid-template-columns: repeat(4, 1fr); }
}
.mode-card {
  height: auto;
  min-height: 72px;
  justify-content: flex-start !important;
  padding: 16px !important;
}
.mode-card__label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  line-height: 1.25;
  text-align: left;
}
.mode-card__title { font-size: 14px; font-weight: 600; }
.mode-card__desc { font-size: 11px; font-weight: 400; opacity: 0.72; }

/* Toolbar */
.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.toolbar-row--wrap { margin-bottom: 0; }
.rank-filter {
  display: inline-flex;
  gap: 6px;
  padding: 4px;
  border-radius: 9999px;
  border: 1px solid var(--color-hairline);
  background: var(--color-surface);
}

/* KPI */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 768px) {
  .kpi-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
}
.kpi-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.kpi-card__label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-slate);
  line-height: 1.5;
}
.kpi-card__value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.02em;
  color: var(--color-ink);
  margin-top: 8px;
}
.kpi-card__hint {
  font-size: 12px;
  color: var(--color-stone);
  line-height: 1.5;
  margin-top: 2px;
}

/* Card section head */
.section-card__head {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

/* Empty / loading boxes */
.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 56px 20px;
  border-radius: 16px;
  border: 2px dashed var(--color-hairline);
  background: var(--color-surface);
  color: var(--color-slate);
  text-align: center;
}
.loading-box {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 64px 20px;
  color: var(--color-slate);
}

/* Chips */
.chips-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
}

/* Rank table */
.rank-table-head {
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-hairline);
}

/* Variant */
.variant-pick { margin-bottom: 20px; }
.variant-legend {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 12px;
  color: var(--color-slate);
}
.variant-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.variant-legend__dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
}

/* Subject */
.subject-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 20px;
}
@media (min-width: 1024px) {
  .subject-grid { grid-template-columns: 340px 1fr; }
}
.dist-list { display: flex; flex-direction: column; gap: 10px; }
.dist-row {
  display: grid;
  grid-template-columns: 120px 1fr 36px;
  align-items: center;
  gap: 10px;
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
  font-variant-numeric: tabular-nums;
  line-height: 1;
}

/* Region */
.region-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}
.region-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 768px) {
  .region-overview { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1024px) {
  .region-overview { grid-template-columns: repeat(6, 1fr); }
}
.region-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
}
.region-overview__value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.2;
  margin-top: 4px;
}
</style>
