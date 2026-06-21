<script setup lang="ts">
import { queryAllEcharts } from '~/lib/api/university'
import { trendAllVariants, queryBackup2List, fetchBackup2Tables, fetchBackup2Years } from '~/lib/api/ranking'

useHead({ title: '数据图表 · 选校系统' })

// ============ 顶部 tab: 4 大视图模式 ============
type Mode = 'ranking' | 'variants' | 'subject' | 'region'
const mode = ref<Mode>('ranking')
const modeTabs: { value: Mode; label: string; icon: string; desc: string }[] = [
  { value: 'ranking', label: '排名榜 + 对比', icon: 'i-lucide-bar-chart-3', desc: '看全部 + 加进我的对比' },
  { value: 'variants', label: '4 维多校对比', icon: 'i-lucide-git-compare', desc: '勾几所大学, 看 QS/US News/计算机 4 维' },
  { value: 'subject', label: '按专业排序', icon: 'i-lucide-book-marked', desc: 'ARWU 学科 / US News 学科 分类' },
  { value: 'region', label: '按地区联动', icon: 'i-lucide-globe-2', desc: '选洲 → 看国家 → 看院校' }
]

// ============ 通用 ============
const allData = ref<any>(null)        // queryAllEcharts 原始
const loading = ref(false)
const error = ref<string | null>(null)
const currentRank = ref<number>(50)   // Top 50

const rankItems = [
  { value: 20, label: 'Top 20' },
  { value: 50, label: 'Top 50' },
  { value: 100, label: 'Top 100' }
]

async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const data = await queryAllEcharts({ currentRank: currentRank.value }) as any
    allData.value = data
  } catch (e: any) {
    console.warn('[charts] loadAll failed', e?.message)
    error.value = '后端不可达'
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

// ============ 派生数据 ============
const years = computed(() => allData.value?.legendData ?? [])
const series = computed(() => allData.value?.chatData?.series ?? [])

/** Ranking Board: 一行一校,排序按最新一年升序 */
const rankingBoard = computed(() => {
  return series.value
    .map((s: any) => {
      const data = s.data || []
      const last = data[data.length - 1] ?? 0
      const first = data[0] ?? last
      const max = data.length ? Math.max(...data) : last
      const min = data.length ? Math.min(...data.filter((v: any) => typeof v === 'number' && v > 0)) : last
      const trend = last - first
      let tone: 'up' | 'down' | 'flat' = 'flat'
      if (trend < -3) tone = 'up'
      else if (trend > 3) tone = 'down'
      return { name: s.name, country: s.country, region: s.region, data, last, max, min, trend, tone }
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
    { label: '入选大学', value: n, sub: `Top ${currentRank.value}`, color: '#1456f0' },
    { label: '黑马 (上升)', value: up, sub: '同比首年 -3 以上', color: '#10b981' },
    { label: '下行', value: down, sub: '同比首年 +3 以上', color: '#ef4444' },
    { label: '稳定', value: stable, sub: '±3 内波动', color: '#8e8e93' }
  ]
})

// ============ 模式 1: 排名榜 + 对比 (watchlist) ============
const watchlist = ref<string[]>([])
const MAX_WATCHLIST = 5

function toggleWatch(name: string) {
  const idx = watchlist.value.indexOf(name)
  if (idx >= 0) {
    watchlist.value.splice(idx, 1)
  } else {
    if (watchlist.value.length >= MAX_WATCHLIST) {
      watchlist.value.shift()
    }
    watchlist.value.push(name)
  }
}
function isWatching(name: string): boolean { return watchlist.value.includes(name) }
const watchSeries = computed(() => watchlist.value.map(name => series.value.find((s: any) => s.name === name)).filter(Boolean))
const watchChart = computed(() => ({ chatData: { series: watchSeries.value }, legendData: years.value }))
function clearWatch() { watchlist.value = [] }

// ============ 模式 2: 4 维多校对比 (variants) ============
// 思路: 用户勾几所大学 → 拉 trendAllVariants 单校 4 维 → 拼成一图 (N*4 条线)
const selectedForVariants = ref<string[]>([])
const variantCharts = ref<Record<string, any>>({})  // { uniName: trendAllVariants 返的 chartData }
const variantLoading = ref(false)

const variantColors = ['#1456f0', '#ea5ec1', '#10b981', '#f59e0b', '#a855f7', '#06b6d4']
function variantColor(idx: number) { return variantColors[idx % variantColors.length] }

async function loadVariantChart(name: string) {
  if (variantCharts.value[name]) return
  try {
    const res = await trendAllVariants(name) as any
    const chartData = res?.chatData ?? res?.data?.chatData ?? res
    if (chartData?.series) variantCharts.value[name] = chartData
  } catch (e) {
    console.warn(`[charts] trendAllVariants failed for ${name}`, e)
  }
}

watch([selectedForVariants, currentRank], async () => {
  if (mode.value !== 'variants') return
  variantLoading.value = true
  // 拉所有选中校的 4 维
  await Promise.all(selectedForVariants.value.map(loadVariantChart))
  variantLoading.value = false
}, { deep: true })

const variantMergedChart = computed(() => {
  const mergedSeries: any[] = []
  let years: string[] = []
  for (const name of selectedForVariants.value) {
    const chart = variantCharts.value[name]
    if (!chart?.series) continue
    if (!years.length) years = chart.legendData ?? []
    for (const s of chart.series) {
      mergedSeries.push({ ...s, name: `${name} · ${s.name.replace(/^.*?·\s*/, '')}` })
    }
  }
  return { chatData: { series: mergedSeries }, legendData: years }
})

// ============ 模式 3: 按专业排序 (subject) ============
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
    const res = await fetchBackup2Years(subjectRankTable.value) as any
    subjectYears.value = res?.data ?? res ?? []
    if (subjectYears.value.length && !subjectYear.value) subjectYear.value = subjectYears.value[0]
  } catch (e) { subjectYears.value = [] }
}
watch(subjectRankTable, () => { subjectYear.value = undefined; subjectYears.value = []; loadSubjectYears() })

async function loadSubject() {
  if (mode.value !== 'subject') return
  subjectLoading.value = true
  try {
    const res = await queryBackup2List({
      page: 1, limit: 500,
      rankTable: subjectRankTable.value,
      rankingYear: subjectYear.value || undefined,
      currentRankLimit: subjectRankLimit.value
    }) as any
    const records: any[] = res?.records ?? res?.data?.records ?? []
    subjectList.value = records.sort((a, b) => (a.currentRankInteger ?? 9999) - (b.currentRankInteger ?? 9999))
    // 分类分布
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
watch([mode, subjectRankTable, subjectYear, subjectRankLimit], loadSubject)
onMounted(async () => { await loadSubjectYears(); loadSubject() })

// ============ 模式 4: 按地区联动 (region) ============
const selectedRegion = ref<string | undefined>(undefined)
const regionCountryDist = ref<{ name: string; count: number }[]>([])
const regionCountryList = ref<any[]>([])
const regionLoading = ref(false)

const REGION_TABS: { value: string; label: string; color: string }[] = [
  { value: '亚洲', label: '亚洲', color: '#ea5ec1' },
  { value: '欧洲', label: '欧洲', color: '#1456f0' },
  { value: '北美洲', label: '北美洲', color: '#f59e0b' },
  { value: '南美洲', label: '南美洲', color: '#22c55e' },
  { value: '大洋洲', label: '大洋洲', color: '#a855f7' },
  { value: '非洲', label: '非洲', color: '#ef4444' }
]

async function loadRegion() {
  if (mode.value !== 'region') return
  regionLoading.value = true
  try {
    // 用 queryAllQs 拉当前 currentRank 范围内的学校
    const { queryAllQs } = await import('~/lib/api/university')
    const res = await queryAllQs({
      page: 1, limit: 500, rankVariant: 'all',
      universityTagsState: selectedRegion.value,
      currentRank: 200
    }) as any
    const records: any[] = res?.records ?? res?.data?.records ?? []
    // 国家级分布
    const map = new Map<string, number>()
    for (const r of records) {
      const k = r.universityTags || '未知'
      map.set(k, (map.get(k) || 0) + 1)
    }
    regionCountryDist.value = Array.from(map.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 15)
    regionCountryList.value = records.slice(0, 100)
  } catch (e) {
    console.warn('[charts] loadRegion failed', e)
  } finally {
    regionLoading.value = false
  }
}
watch([mode, selectedRegion], loadRegion)
onMounted(loadRegion)

// ============ helpers ============
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
  const minV = 0
  const xStep = data.length > 1 ? width / (data.length - 1) : 0
  return data.map((v, i) => {
    const x = i * xStep
    const y = height - ((v - minV) / (maxV - minV)) * height
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}
function toggleSelect(name: string) {
  const idx = selectedForVariants.value.indexOf(name)
  if (idx >= 0) selectedForVariants.value.splice(idx, 1)
  else if (selectedForVariants.value.length < 6) selectedForVariants.value.push(name)
}
</script>

<template>
  <div>
    <!-- Hero -->
    <UContainer class="pt-10 pb-4">
      <h1 class="text-[40px] font-medium leading-[1.10] tracking-tight text-default sm:text-5xl" :style="{ fontFamily: 'var(--font-display)' }">数据图表</h1>
      <p class="mt-2 text-base text-muted">趋势 · 对比 · 洞察 · 让选校决策有数</p>
    </UContainer>

    <!-- 4 大视图 mode tab -->
    <UContainer class="pt-2">
      <div class="grid grid-cols-2 gap-2 md:grid-cols-4">
        <button
          v-for="m in modeTabs"
          :key="m.value"
          type="button"
          class="flex flex-col items-start gap-1 rounded-xl border bg-white p-3.5 text-left transition-all"
          :class="mode === m.value ? 'border-transparent shadow-md' : 'border-default hover:border-[var(--color-brand-900)]'"
          :style="mode === m.value ? { background: 'var(--gradient-card-featured)', color: '#fff', boxShadow: 'var(--shadow-brand)' } : {}"
          @click="mode = m.value"
        >
          <div class="flex items-center gap-1.5">
            <UIcon :name="m.icon" class="size-4" />
            <span class="text-sm font-semibold">{{ m.label }}</span>
          </div>
          <span class="text-[11px] opacity-80">{{ m.desc }}</span>
        </button>
      </div>
    </UContainer>

    <UContainer v-if="error" class="pt-4">
      <UAlert color="warning" variant="subtle" :title="error" icon="i-lucide-alert-circle" />
    </UContainer>

    <!-- 通用 toolbar: Top N 选择 + KPI (ranking/variants 显示) -->
    <UContainer v-if="mode === 'ranking' || mode === 'variants'" class="py-4">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <UFieldGroup size="sm">
          <UButton
            v-for="r in rankItems"
            :key="r.value"
            :color="currentRank === r.value ? 'primary' : 'neutral'"
            :variant="currentRank === r.value ? 'solid' : 'outline'"
            :label="r.label"
            size="sm"
            @click="currentRank = r.value"
          />
        </UFieldGroup>
        <div class="text-[12px] text-muted">筛选 QS / US News Top {{ currentRank }} 范围</div>
      </div>
    </UContainer>

    <!-- KPI 4 卡 (只 ranking/variants 显示) -->
    <UContainer v-if="mode === 'ranking' || mode === 'variants'" class="pb-2">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <UCard v-for="k in kpis" :key="k.label" :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-5' }">
          <div class="text-[12px] font-medium text-muted">{{ k.label }}</div>
          <div class="mt-2 text-[36px] font-semibold leading-none tracking-tight" :style="{ color: k.color, fontFamily: 'var(--font-display)' }">{{ k.value }}</div>
          <div class="mt-2 text-[12px] text-subtle">{{ k.sub }}</div>
        </UCard>
      </div>
    </UContainer>

    <!-- ============ 模式 1: 排名榜 + 对比 ============ -->
    <template v-if="mode === 'ranking'">
      <!-- 我的对比 -->
      <UContainer class="py-4">
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-6' }">
          <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-[22px] font-semibold leading-tight text-default" :style="{ fontFamily: 'var(--font-display)' }">我的对比</h2>
              <p class="mt-1 text-[13px] text-muted">下方排名榜点 <span class="font-mono text-default">+ 加入对比</span> 添加, 最多 {{ MAX_WATCHLIST }} 所大学</p>
            </div>
            <div class="flex items-center gap-2">
              <UBadge v-if="watchlist.length" color="primary" variant="subtle" :label="`${watchlist.length} / ${MAX_WATCHLIST}`" />
              <UButton v-if="watchlist.length" icon="i-lucide-trash-2" color="neutral" variant="ghost" size="sm" label="清空" @click="clearWatch" />
            </div>
          </div>
          <ClientOnly>
            <div v-if="watchlist.length === 0" class="rounded-2xl border-2 border-dashed border-default bg-[var(--color-surface-1)] p-10 text-center">
              <UIcon name="i-lucide-eye-off" class="mx-auto size-10 text-muted" />
              <div class="mt-3 text-sm text-default">还没有添加大学</div>
              <div class="mt-1 text-xs text-muted">从下方排名榜点 + 加入对比, 这里只画你挑的大学, 不再 137 条线堆一起</div>
            </div>
            <div v-else class="rounded-xl bg-[var(--color-surface-1)] p-4">
              <ChartSvgChart :chart="watchChart" :height="320" />
              <div class="mt-3 flex flex-wrap gap-2">
                <UButton v-for="name in watchlist" :key="name" :label="name" icon="i-lucide-x" color="neutral" variant="outline" size="xs" @click="toggleWatch(name)" />
              </div>
            </div>
          </ClientOnly>
        </UCard>
      </UContainer>

      <!-- 排名榜 -->
      <UContainer class="py-4">
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm overflow-hidden', body: 'p-0' }">
          <div class="flex items-center justify-between border-b border-default p-5">
            <div>
              <h2 class="text-[22px] font-semibold leading-tight text-default" :style="{ fontFamily: 'var(--font-display)' }">Top {{ currentRank }} 排名榜</h2>
              <p class="mt-1 text-[13px] text-muted">按最新年份排名升序 · 历年曲线 = sparkline · 趋势 = 同比首年变化</p>
            </div>
          </div>
          <ClientOnly>
            <UTable
              :data="rankingBoard"
              :loading="loading"
              :columns="[
                { id: 'rank', header: '排名', meta: { class: { th: 'w-[80px]', td: 'w-[80px]' } } },
                { id: 'name', header: '大学' },
                { id: 'sparkline', header: '历年曲线', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } },
                { id: 'minmax', header: '区间 (低/高)', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } },
                { id: 'trend', header: '趋势', meta: { class: { th: 'w-[120px]', td: 'w-[120px]' } } },
                { id: 'action', header: '', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } }
              ]"
              :ui="{ th: 'text-[12px] font-medium text-muted', td: 'py-3 text-sm'}"
            >
              <template #rank-cell="{ row }">
                <span :class="['rank-badge', rankBadgeTier(row.original.last)]">{{ row.original.last }}</span>
              </template>
              <template #name-cell="{ row }">
                <NuxtLink :to="`/universities/${encodeURIComponent(row.original.name)}`" class="text-default hover:text-[var(--color-brand-900)]" :style="{ fontFamily: 'var(--font-display)' }">{{ row.original.name }}</NuxtLink>
              </template>
              <template #sparkline-cell="{ row }">
                <svg :width="100" :height="28" class="overflow-visible">
                  <path :d="sparklinePath(row.original.data, 100, 28)" fill="none" stroke="#1456f0" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </template>
              <template #minmax-cell="{ row }">
                <span class="font-mono text-[13px] text-muted">
                  <span class="text-emerald-600">{{ row.original.min }}</span>
                  <span class="mx-1 text-subtle">/</span>
                  <span class="text-red-500">{{ row.original.max }}</span>
                </span>
              </template>
              <template #trend-cell="{ row }">
                <div class="inline-flex items-center gap-1.5" :class="trendColor(row.original.tone)">
                  <UIcon :name="trendIcon(row.original.tone)" class="size-4" />
                  <span class="text-[13px] font-medium">{{ trendLabel(row.original.tone, row.original.trend) }}</span>
                </div>
              </template>
              <template #action-cell="{ row }">
                <UButton
                  :icon="isWatching(row.original.name) ? 'i-lucide-check' : 'i-lucide-plus'"
                  :color="isWatching(row.original.name) ? 'primary' : 'neutral'"
                  :variant="isWatching(row.original.name) ? 'solid' : 'outline'"
                  size="xs"
                  :label="isWatching(row.original.name) ? '已加入' : '加入对比'"
                  :disabled="!isWatching(row.original.name) && watchlist.length >= MAX_WATCHLIST"
                  @click="toggleWatch(row.original.name)"
                />
              </template>
            </UTable>
          </ClientOnly>
        </UCard>
      </UContainer>
    </template>

    <!-- ============ 模式 2: 4 维多校对比 ============ -->
    <template v-else-if="mode === 'variants'">
      <UContainer class="py-4">
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-6' }">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-[22px] font-semibold leading-tight text-default" :style="{ fontFamily: 'var(--font-display)' }">4 维多校对比</h2>
              <p class="mt-1 text-[13px] text-muted">勾几所大学, 拉到 QS 综合 / QS 计算机 / US News 综合 / US News 计算机 4 维 (共 N × 4 条线)</p>
            </div>
            <UBadge v-if="selectedForVariants.length" color="primary" variant="subtle" :label="`已选 ${selectedForVariants.length} / 6`" />
          </div>

          <!-- 大学选择器 (Top 50 网格) -->
          <div class="mb-5">
            <div class="mb-2 text-[12px] font-medium text-muted">点击切换选择</div>
            <div class="flex flex-wrap gap-1.5">
              <button
                v-for="r in rankingBoard.slice(0, 30)"
                :key="r.name"
                type="button"
                class="inline-flex items-center gap-1 rounded-full border bg-white px-2.5 py-1 text-[12px] font-medium transition-all"
                :class="selectedForVariants.includes(r.name) ? 'border-transparent' : 'border-default hover:border-[var(--color-brand-900)]'"
                :style="selectedForVariants.includes(r.name) ? { background: 'var(--color-brand-900)', color: '#fff' } : {}"
                @click="toggleSelect(r.name)"
              >
                <span :class="['rank-badge', rankBadgeTier(r.last)]" :style="{ height: '18px', minWidth: '24px', fontSize: '10px', padding: '0 6px' }">{{ r.last }}</span>
                <span>{{ r.name }}</span>
                <UIcon v-if="selectedForVariants.includes(r.name)" name="i-lucide-check" class="size-3" />
              </button>
            </div>
          </div>

          <!-- 4 维对比图 -->
          <div class="rounded-xl bg-[var(--color-surface-1)] p-4">
            <ClientOnly>
              <div v-if="selectedForVariants.length === 0" class="flex flex-col items-center justify-center gap-2 py-16 text-center text-muted">
                <UIcon name="i-lucide-git-compare" class="size-10" />
                <span class="text-sm">从上方勾几所大学, 这里画 N × 4 条对比线</span>
              </div>
              <div v-else-if="variantLoading" class="flex items-center justify-center py-16 text-muted">
                <UIcon name="i-lucide-loader" class="size-5 animate-spin" />
                <span class="ml-2 text-sm">加载 4 维数据...</span>
              </div>
              <div v-else>
                <ChartSvgChart :chart="variantMergedChart" :height="380" />
                <div class="mt-3 flex flex-wrap gap-2 text-[11px]">
                  <div class="inline-flex items-center gap-1.5">
                    <span class="size-2 rounded-full" style="background: var(--color-brand-900)" />QS 综合
                  </div>
                  <div class="inline-flex items-center gap-1.5">
                    <span class="size-2 rounded-full" style="background: #3b82f6" />QS 计算机
                  </div>
                  <div class="inline-flex items-center gap-1.5">
                    <span class="size-2 rounded-full" style="background: #ea5ec1" />US News 综合
                  </div>
                  <div class="inline-flex items-center gap-1.5">
                    <span class="size-2 rounded-full" style="background: #a855f7" />US News 计算机
                  </div>
                </div>
              </div>
            </ClientOnly>
          </div>
        </UCard>
      </UContainer>
    </template>

    <!-- ============ 模式 3: 按专业排序 ============ -->
    <template v-else-if="mode === 'subject'">
      <UContainer class="py-4">
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-6' }">
          <div class="mb-4 flex flex-wrap items-center gap-3">
            <h2 class="text-[22px] font-semibold leading-tight text-default" :style="{ fontFamily: 'var(--font-display)' }">按专业 / 分类排序</h2>
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
            <!-- 分类分布 (Top 12) -->
            <div class="rounded-xl border border-default bg-[var(--color-surface-1)] p-4">
              <div class="mb-2 text-[13px] font-semibold text-default">分类分布 (Top 12)</div>
              <div v-if="subjectLoading" class="flex items-center justify-center py-8 text-muted">
                <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
              </div>
              <div v-else class="space-y-1">
                <div v-for="(c, i) in subjectCategoryDist" :key="c.name" class="flex items-center gap-2">
                  <span class="w-[120px] truncate text-[12px] text-default" :title="c.name">{{ c.name }}</span>
                  <div class="flex-1 overflow-hidden rounded-full bg-white h-1.5">
                    <div class="h-full rounded-full" :style="{ background: variantColor(i), width: ((c.count / (subjectCategoryDist[0]?.count || 1)) * 100) + '%' }" />
                  </div>
                  <span class="w-[40px] text-right font-mono text-[12px] font-semibold" :style="{ fontFamily: 'var(--font-data)', color: variantColor(i) }">{{ c.count }}</span>
                </div>
              </div>
            </div>

            <!-- 排名榜 (按 currentRankInteger 升序) -->
            <div class="rounded-xl border border-default bg-white lg:col-span-2">
              <div v-if="subjectLoading" class="flex items-center justify-center py-10 text-muted">
                <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
                <span class="ml-2 text-sm">加载中…</span>
              </div>
              <UTable
                v-else
                :data="subjectList.slice(0, 50)"
                :columns="[
                  { id: 'rank', header: '排名', meta: { class: { th: 'w-[80px]', td: 'w-[80px]' } } },
                  { id: 'name', header: '院校 / 学科' },
                  { id: 'category', header: '学科分类' },
                  { id: 'year', header: '年份', meta: { class: { th: 'w-[100px]', td: 'w-[100px]' } } },
                  { id: 'action', header: '', meta: { class: { th: 'w-[100px]', td: 'w-[100px]' } } }
                ]"
                :ui="{ th: 'text-[12px] font-medium text-muted', td: 'py-2.5 text-sm' }"
              >
                <template #rank-cell="{ row }">
                  <span :class="['rank-badge', rankBadgeTier(row.original.currentRankInteger)]" :style="{ minWidth: '36px', height: '24px', fontSize: '12px' }">{{ row.original.currentRankInteger ?? '—' }}</span>
                </template>
                <template #name-cell="{ row }">
                  <NuxtLink :to="`/universities/${encodeURIComponent(row.original.universityNameChinese)}`" class="font-medium text-default hover:text-[var(--color-brand-900)]">
                    {{ row.original.universityNameChinese }}
                  </NuxtLink>
                </template>
                <template #category-cell="{ row }">
                  <UBadge color="primary" variant="subtle" size="xs" :label="row.original.rankingCategory || '—'" />
                </template>
                <template #year-cell="{ row }">
                  <span class="text-[12px] text-muted">{{ row.original.rankingYear || '—' }}</span>
                </template>
                <template #action-cell="{ row }">
                  <UButton
                    :icon="isWatching(row.original.universityNameChinese) ? 'i-lucide-check' : 'i-lucide-plus'"
                    :color="isWatching(row.original.universityNameChinese) ? 'primary' : 'neutral'"
                    :variant="isWatching(row.original.universityNameChinese) ? 'solid' : 'outline'"
                    size="xs"
                    :label="isWatching(row.original.universityNameChinese) ? '已加入' : '加入对比'"
                    @click="toggleWatch(row.original.universityNameChinese)"
                  />
                </template>
              </UTable>
            </div>
          </div>
        </UCard>
      </UContainer>
    </template>

    <!-- ============ 模式 4: 按地区联动 ============ -->
    <template v-else-if="mode === 'region'">
      <UContainer class="py-4">
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-6' }">
          <div class="mb-4">
            <h2 class="text-[22px] font-semibold leading-tight text-default" :style="{ fontFamily: 'var(--font-display)' }">按地区联动</h2>
            <p class="mt-1 text-[13px] text-muted">选洲 → 看国家分布 → 加对比</p>
          </div>

          <!-- 6 大洲 tab -->
          <div class="mb-5 flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-full border bg-white px-4 py-1.5 text-[12px] font-semibold transition-all"
              :class="!selectedRegion ? 'border-transparent' : 'border-default hover:border-current'"
              :style="!selectedRegion ? { background: 'var(--color-brand-900)', color: '#fff' } : {}"
              @click="selectedRegion = undefined"
            >全部</button>
            <button
              v-for="r in REGION_TABS"
              :key="r.value"
              type="button"
              class="rounded-full border bg-white px-4 py-1.5 text-[12px] font-semibold transition-all"
              :class="selectedRegion === r.value ? 'border-transparent' : 'border-default hover:border-current'"
              :style="selectedRegion === r.value ? { background: r.color, color: '#fff' } : { color: r.color }"
              @click="selectedRegion = selectedRegion === r.value ? undefined : r.value"
            >{{ r.label }}</button>
          </div>

          <div v-if="regionLoading" class="flex items-center justify-center py-10 text-muted">
            <UIcon name="i-lucide-loader" class="size-5 animate-spin" />
            <span class="ml-2 text-sm">加载中…</span>
          </div>
          <div v-else class="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <!-- 国家分布 -->
            <div class="rounded-xl border border-default bg-[var(--color-surface-1)] p-4">
              <div class="mb-2 text-[13px] font-semibold text-default">国家分布 (Top 15)</div>
              <div class="space-y-1">
                <div v-for="(c, i) in regionCountryDist" :key="c.name" class="flex items-center gap-2">
                  <span class="w-[120px] truncate text-[12px] text-default" :title="c.name">{{ c.name }}</span>
                  <div class="flex-1 overflow-hidden rounded-full bg-white h-1.5">
                    <div class="h-full rounded-full bg-[var(--color-brand-900)]" :style="{ width: ((c.count / (regionCountryDist[0]?.count || 1)) * 100) + '%' }" />
                  </div>
                  <span class="w-[40px] text-right font-mono text-[12px] font-semibold text-[var(--color-brand-900)]" :style="{ fontFamily: 'var(--font-data)' }">{{ c.count }}</span>
                </div>
              </div>
            </div>

            <!-- 院校列表 (Top 100 范围内, 按 currentQsAllRank 升序) -->
            <div class="rounded-xl border border-default bg-white lg:col-span-2">
              <UTable
                :data="regionCountryList"
                :columns="[
                  { id: 'rank', header: '排名', meta: { class: { th: 'w-[80px]', td: 'w-[80px]' } } },
                  { id: 'name', header: '大学' },
                  { id: 'country', header: '国家' },
                  { id: 'action', header: '', meta: { class: { th: 'w-[100px]', td: 'w-[100px]' } } }
                ]"
                :ui="{ th: 'text-[12px] font-medium text-muted', td: 'py-2.5 text-sm' }"
              >
                <template #rank-cell="{ row }">
                  <span :class="['rank-badge', rankBadgeTier(row.original.currentQsAllRank)]" :style="{ minWidth: '36px', height: '24px', fontSize: '12px' }">{{ row.original.currentQsAllRank ?? '—' }}</span>
                </template>
                <template #name-cell="{ row }">
                  <NuxtLink :to="`/universities/${encodeURIComponent(row.original.universityNameChinese)}`" class="font-medium text-default hover:text-[var(--color-brand-900)]">{{ row.original.universityNameChinese }}</NuxtLink>
                </template>
                <template #country-cell="{ row }">
                  <span class="text-[12px] text-muted">{{ row.original.universityTags || '—' }}</span>
                </template>
                <template #action-cell="{ row }">
                  <UButton
                    :icon="isWatching(row.original.universityNameChinese) ? 'i-lucide-check' : 'i-lucide-plus'"
                    :color="isWatching(row.original.universityNameChinese) ? 'primary' : 'neutral'"
                    :variant="isWatching(row.original.universityNameChinese) ? 'solid' : 'outline'"
                    size="xs"
                    :label="isWatching(row.original.universityNameChinese) ? '已加入' : '加入对比'"
                    @click="toggleWatch(row.original.universityNameChinese)"
                  />
                </template>
              </UTable>
            </div>
          </div>
        </UCard>
      </UContainer>
    </template>
  </div>
</template>
