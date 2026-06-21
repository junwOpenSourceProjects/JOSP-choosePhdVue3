<script setup lang="ts">
import { queryAllQs } from '~/lib/api/university'
import { queryBackup2List, fetchBackup2Tables, fetchBackup2Years } from '~/lib/api/ranking'
import type { UniversityAllDTO, RankVariant } from '~/types'
import { RANK_VARIANT_SHORT_MAP } from '~/types'

useHead({ title: '学校库 · 选校系统' })

// ============ 状态 (只留核心) ============
const search = ref<string | undefined>(undefined)
const rankTable = ref<string>('qs')            // qs / usnews / all / 7 张新表
const tagState = ref<string | undefined>(undefined)  // 洲
const tag = ref<string | undefined>(undefined)       // 国家
const maxRank = ref<number>(50)
const sortBy = ref<string>('rank')             // rank / name / country
const yearFilter = ref<string | undefined>(undefined)
const rankVariant = ref<RankVariant>('qs')

const tableData = ref<UniversityAllDTO[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

const backup2Tables = ref<string[]>([])
const backup2Years = ref<string[]>([])
const isOldTable = computed(() => rankTable.value === 'qs' || rankTable.value === 'usnews' || rankTable.value === 'all')

const rankTableItems = computed(() => {
  const builtins = [
    { value: 'qs', label: RANK_VARIANT_SHORT_MAP.qs },
    { value: 'usnews', label: RANK_VARIANT_SHORT_MAP.usnews },
    { value: 'all', label: RANK_VARIANT_SHORT_MAP.all }
  ]
  const labelMap: Record<string, string> = {
    arwu_subject: 'ARWU 学科',
    edurank_region: 'EduRank 地区',
    declining_trend: '下降趋势',
    mosiur_world: 'MOSIUR 全球',
    rur_world: 'RUR 全球',
    usnews_subject: 'US News 学科',
    qs_sustainability: 'QS 可持续'
  }
  const extras = backup2Tables.value.map(t => ({ value: t, label: labelMap[t] || t }))
  return [...builtins, ...extras]
})

onMounted(async () => {
  try {
    const res = await fetchBackup2Tables() as any
    backup2Tables.value = res?.data ?? res ?? []
  } catch (e) {
    console.warn('[universities] fetch backup2 tables failed', e)
  }
  load()
})

watch(rankTable, async (newVal) => {
  yearFilter.value = undefined
  if (newVal === 'qs' || newVal === 'usnews' || newVal === 'all') {
    backup2Years.value = []
    return
  }
  try {
    const res = await fetchBackup2Years(newVal) as any
    backup2Years.value = res?.data ?? res ?? []
  } catch (e) {
    console.warn('[universities] fetch years failed', e)
    backup2Years.value = []
  }
})

const yearFilterItems = computed(() => [
  { value: undefined, label: '全部年份' },
  ...backup2Years.value.map(y => ({ value: y, label: y }))
])

const tagStateOptions = [
  { value: '亚洲', label: '亚洲' },
  { value: '欧洲', label: '欧洲' },
  { value: '北美洲', label: '北美洲' },
  { value: '大洋洲', label: '大洋洲' },
  { value: '南美洲', label: '南美洲' },
  { value: '非洲', label: '非洲' }
]

const maxRankItems = [
  { value: 20, label: 'Top 20' },
  { value: 50, label: 'Top 50' },
  { value: 100, label: 'Top 100' },
  { value: 200, label: 'Top 200' }
]

const sortByItems = [
  { value: 'rank', label: '按排名' },
  { value: 'name', label: '按名称' },
  { value: 'country', label: '按国家' }
]

const sortByLabel = computed(() => sortByItems.find(s => s.value === sortBy.value)?.label ?? '按排名')
const sortIcon = computed(() => {
  if (sortBy.value === 'rank') return 'i-lucide-arrow-up-narrow-wide'
  if (sortBy.value === 'name') return 'i-lucide-arrow-down-a-z'
  return 'i-lucide-map-pin'
})

// ============ 排名徽章 ============
function rankBadgeTier(rank: number | null | undefined): string {
  if (rank == null) return 'rank-badge--normal'
  if (rank <= 3) return 'rank-badge--gold'
  if (rank <= 10) return 'rank-badge--silver'
  if (rank <= 50) return 'rank-badge--bronze'
  return 'rank-badge--normal'
}

// 洲颜色 token
const REGION_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  '亚洲': { bg: 'rgba(234, 94, 193, 0.10)', fg: '#be185d', dot: '#ea5ec1' },
  '欧洲': { bg: 'rgba(20, 86, 240, 0.10)', fg: '#1d4ed8', dot: '#1456f0' },
  '北美洲': { bg: 'rgba(245, 158, 11, 0.10)', fg: '#b45309', dot: '#f59e0b' },
  '南美洲': { bg: 'rgba(34, 197, 94, 0.10)', fg: '#15803d', dot: '#22c55e' },
  '大洋洲': { bg: 'rgba(168, 85, 247, 0.10)', fg: '#7c3aed', dot: '#a855f7' },
  '非洲': { bg: 'rgba(239, 68, 68, 0.10)', fg: '#b91c1c', dot: '#ef4444' }
}
function regionColor(region: string): string { return REGION_COLORS[region]?.dot ?? '#8e8e93' }
function regionStyle(region: string) {
  const c = REGION_COLORS[region]
  if (!c) return { background: 'rgba(0,0,0,0.04)', color: '#45515e' }
  return { background: c.bg, color: c.fg }
}

// ============ 加载数据 ============
async function load() {
  loading.value = true
  error.value = null
  try {
    if (isOldTable.value) {
      rankVariant.value = rankTable.value as RankVariant
      const res = await queryAllQs({
        page: 1,
        limit: 20,
        rankVariant: rankTable.value,
        universityTagsState: tagState.value,
        universityTags: tag.value,
        currentRank: maxRank.value,
        universityNameChinese: search.value
      }) as any
      const records = res?.records ?? res?.data?.records ?? []
      tableData.value = records
      total.value = res?.total ?? res?.data?.total ?? 0
    } else {
      const res = await queryBackup2List({
        page: 1,
        limit: 20,
        rankTable: rankTable.value,
        universityNameChinese: search.value,
        universityTags: tag.value,
        universityTagsState: tagState.value,
        rankingYear: yearFilter.value || undefined,
        currentRankLimit: maxRank.value
      }) as any
      const records = res?.records ?? res?.data?.records ?? []
      tableData.value = records
      total.value = res?.total ?? res?.data?.total ?? 0
    }
  } catch (e: any) {
    console.warn('[universities] load failed', e?.message)
    error.value = '后端不可达'
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}

watch([rankTable, tagState, tag, maxRank, sortBy, yearFilter, search], () => {
  load()
})

// ============ 排序 ============
function getRankValue(row: UniversityAllDTO): number {
  if (rankVariant.value === 'qs') return row.currentQsAllRank ?? 9999
  if (rankVariant.value === 'usnews') return row.currentUsnewsAllRank ?? 9999
  return Math.min(row.currentQsAllRank ?? 9999, row.currentUsnewsAllRank ?? 9999)
}
function getRankField(row: UniversityAllDTO, which: 'all' | 'cs'): number | null {
  if (rankVariant.value === 'qs') return which === 'all' ? row.currentQsAllRank : row.currentQsComputerRank
  if (rankVariant.value === 'usnews') return which === 'all' ? row.currentUsnewsAllRank : row.currentUsnewsComputerRank
  if (which === 'all') {
    const a = row.currentQsAllRank, b = row.currentUsnewsAllRank
    if (a == null && b == null) return null
    if (a == null) return b
    if (b == null) return a
    return Math.min(a, b)
  }
  const a = row.currentQsComputerRank, b = row.currentUsnewsComputerRank
  if (a == null && b == null) return null
  if (a == null) return b
  if (b == null) return a
  return Math.min(a, b)
}
function getRankIntegerForNewTable(row: any): number {
  return row?.currentRankInteger ?? 9999
}

const sortedData = computed(() => {
  const arr = [...tableData.value]
  if (!isOldTable.value) {
    arr.sort((a: any, b: any) => getRankIntegerForNewTable(a) - getRankIntegerForNewTable(b))
  } else if (sortBy.value === 'rank') {
    arr.sort((a, b) => getRankValue(a) - getRankValue(b))
  } else if (sortBy.value === 'name') {
    arr.sort((a, b) => (a.universityNameChinese || '').localeCompare(b.universityNameChinese || '', 'zh'))
  } else if (sortBy.value === 'country') {
    arr.sort((a, b) => (a.universityTags || '').localeCompare(b.universityTags || '', 'zh'))
  }
  return arr
})

// ============ 地区分布 (按当前榜单类型) ============
const regionDist = computed(() => {
  if (isOldTable.value) {
    // qs/usnews/all: 按 universityTagsState 统计
    const map = new Map<string, number>()
    for (const row of tableData.value) {
      const k = row.universityTagsState || '其他'
      map.set(k, (map.get(k) || 0) + 1)
    }
    return Array.from(map.entries())
      .map(([k, v]) => ({ key: k, count: v, color: regionColor(k) }))
      .sort((a, b) => b.count - a.count)
  }
  // 新表按 universityTagsState 统计 (可能为空字符串)
  return []
})

// ============ 专业分布 (只新表, 按 rankingCategory) ============
const subjectDist = ref<{ key: string; count: number }[]>([])
async function loadSubjectDist() {
  if (isOldTable.value) {
    subjectDist.value = []
    return
  }
  try {
    // 用 limit=500 抽样, 客户端 groupBy rankingCategory
    const res = await queryBackup2List({
      page: 1, limit: 500, rankTable: rankTable.value,
      rankingYear: yearFilter.value || undefined,
      currentRankLimit: maxRank.value
    }) as any
    const records: any[] = res?.records ?? res?.data?.records ?? []
    const map = new Map<string, number>()
    for (const r of records) {
      const k = r.rankingCategory || '未分类'
      map.set(k, (map.get(k) || 0) + 1)
    }
    subjectDist.value = Array.from(map.entries())
      .map(([k, v]) => ({ key: k, count: v }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12)
  } catch (e) {
    subjectDist.value = []
  }
}
watch([rankTable, yearFilter, maxRank], () => { loadSubjectDist() })
onMounted(loadSubjectDist)

const subjectTotal = computed(() => subjectDist.value.reduce((s, x) => s + x.count, 0))

function reset() {
  search.value = undefined
  tagState.value = undefined
  tag.value = undefined
  maxRank.value = 50
  rankTable.value = 'qs'
  sortBy.value = 'rank'
  yearFilter.value = undefined
}
</script>

<template>
  <div>
    <!-- Page Hero (品牌色 Hero + 搜索嵌入 + 装饰球) -->
    <section class="hero-with-orb relative overflow-hidden py-14 md:py-20">
      <UContainer>
        <div class="grid items-center gap-8 md:grid-cols-[1.1fr_1fr]">
          <div>
            <UBadge color="primary" variant="subtle" size="md" class="mb-4">
              <UIcon name="i-lucide-library" class="size-3.5" />
              <span class="ml-1.5">{{ total > 0 ? total.toLocaleString() : '2,884' }} 所大学 · 8 大排名体系</span>
            </UBadge>
            <h1 class="text-4xl font-medium leading-[1.10] tracking-tight text-default sm:text-5xl md:text-[52px]" :style="{ fontFamily: 'var(--font-display)' }">
              学校库
            </h1>
            <p class="mt-3 text-base font-medium leading-relaxed text-muted md:text-lg">
              多源排名 · 多维过滤 · 一目了然
            </p>
            <div class="mt-5 flex flex-wrap gap-2">
              <UBadge v-for="r in [10, 20, 50, 100, 200].map(v => ({ v, l: 'Top ' + v }))" :key="r.v" :color="maxRank === r.v ? 'primary' : 'neutral'" :variant="maxRank === r.v ? 'solid' : 'soft'" size="sm" :label="r.l" class="cursor-pointer" @click="maxRank = r.v" />
            </div>
          </div>
          <div class="flex items-center justify-end">
            <div class="grid grid-cols-2 gap-3 text-center md:gap-4">
              <div class="rounded-2xl border border-default bg-white px-5 py-4 shadow-sm">
                <div class="text-[10px] font-medium uppercase tracking-wider text-muted">院校</div>
                <div class="mt-1 text-3xl font-bold leading-none text-[var(--color-brand-900)]" :style="{ fontFamily: 'var(--font-display)' }">{{ total > 0 ? total.toLocaleString() : '2,884' }}</div>
                <div class="mt-1 text-[11px] text-muted">所大学</div>
              </div>
              <div class="rounded-2xl border border-default bg-white px-5 py-4 shadow-sm">
                <div class="text-[10px] font-medium uppercase tracking-wider text-muted">排名</div>
                <div class="mt-1 text-3xl font-bold leading-none text-[var(--color-brand-pink)]" :style="{ fontFamily: 'var(--font-display)' }">8</div>
                <div class="mt-1 text-[11px] text-muted">权威体系</div>
              </div>
              <div class="rounded-2xl border border-default bg-white px-5 py-4 shadow-sm">
                <div class="text-[10px] font-medium uppercase tracking-wider text-muted">跨度</div>
                <div class="mt-1 text-3xl font-bold leading-none text-[var(--color-brand-900)]" :style="{ fontFamily: 'var(--font-display)' }">10</div>
                <div class="mt-1 text-[11px] text-muted">年 (2018-2027)</div>
              </div>
              <div class="rounded-2xl border border-default bg-white px-5 py-4 shadow-sm">
                <div class="text-[10px] font-medium uppercase tracking-wider text-muted">数据</div>
                <div class="mt-1 text-3xl font-bold leading-none text-[var(--color-brand-pink)]" :style="{ fontFamily: 'var(--font-display)' }">158k+</div>
                <div class="mt-1 text-[11px] text-muted">行级排名</div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Toolbar (单行 + 搜索框聚焦) -->
    <UContainer>
      <ClientOnly>
      <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-4 sm:p-5 space-y-3' }">
        <div class="flex flex-wrap items-center gap-3">
          <UInput v-model="search" icon="i-lucide-search" placeholder="搜索大学名称 (清华 / MIT / 麻省)..." size="lg" class="flex-1 min-w-[280px]" />
          <USelectMenu v-model="rankTable" :items="rankTableItems" value-key="value" size="lg" class="min-w-[180px]">
            <template #leading>
              <UIcon name="i-lucide-layers" class="size-4" />
            </template>
          </USelectMenu>
          <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="outline" size="lg" label="重置" @click="reset" />
        </div>
        <div class="flex flex-wrap items-center gap-2.5">
          <USelectMenu v-model="tagState" :items="tagStateOptions" value-key="value" placeholder="洲 (全部)" size="md" class="min-w-[140px]">
            <template #leading>
              <UIcon name="i-lucide-globe-2" class="size-4" />
            </template>
          </USelectMenu>
          <USelectMenu v-model="maxRank" :items="maxRankItems" value-key="value" size="md" class="min-w-[120px]">
            <template #leading>
              <UIcon name="i-lucide-trophy" class="size-4" />
            </template>
          </USelectMenu>
          <USelectMenu v-if="!isOldTable" v-model="yearFilter" :items="yearFilterItems" value-key="value" placeholder="全部年份" size="md" class="min-w-[140px]">
            <template #leading>
              <UIcon name="i-lucide-calendar" class="size-4" />
            </template>
          </USelectMenu>
          <USelectMenu v-model="sortBy" :items="sortByItems" value-key="value" size="md" class="min-w-[140px]">
            <template #leading>
              <UIcon :name="sortIcon" class="size-4" />
            </template>
          </USelectMenu>
          <div class="ml-auto inline-flex items-center gap-1.5 rounded-full bg-[var(--color-surface-1)] px-3 py-1.5 text-[12px] font-medium text-default">
            <UIcon name="i-lucide-database" class="size-3.5 text-[var(--color-brand-900)]" />
            共 <strong class="text-[var(--color-brand-900)]">{{ total.toLocaleString() }}</strong> 所大学
          </div>
        </div>
        <UAlert v-if="error" color="warning" variant="subtle" :title="error" icon="i-lucide-alert-circle" />
      </UCard>
      </ClientOnly>
    </UContainer>

    <!-- 顶部 Top 20 表 (4 列精简) -->
    <UContainer class="pt-6">
      <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm overflow-hidden', body: 'p-0' }">
        <div class="flex items-center justify-between border-b border-default px-5 py-3">
          <div class="flex items-center gap-2">
            <UIcon name="i-lucide-trophy" class="size-4 text-[var(--color-brand-900)]" />
            <span class="text-sm font-semibold text-default">Top {{ maxRank }} 前 20 院校</span>
            <UBadge v-if="!isOldTable" color="primary" variant="subtle" size="xs" class="ml-1">{{ rankTableItems.find(t => t.value === rankTable)?.label }}</UBadge>
            <UBadge v-else color="primary" variant="subtle" size="xs" class="ml-1">{{ rankTableItems.find(t => t.value === rankTable)?.label }}</UBadge>
          </div>
          <div v-if="loading" class="flex items-center gap-1.5 text-xs text-muted">
            <UIcon name="i-lucide-loader" class="size-3 animate-spin" />
            加载中
          </div>
        </div>
        <UTable
          :data="sortedData"
          :columns="[
            { id: 'rank', header: '排名', meta: { class: { th: 'w-[88px]', td: 'w-[88px]' } } },
            { id: 'name', header: '大学' },
            { id: 'country', header: '国家/地区' },
            { id: 'subject', header: '专业 / 年份', meta: { class: { th: 'text-right', td: 'text-right w-[200px]' } } },
            { id: 'action', header: '', meta: { class: { th: 'w-[80px]', td: 'w-[80px]' } } }
          ]"
          :ui="{
            th: 'text-[12px] font-medium text-muted',
            td: 'py-3 text-sm transition-colors duration-200 group-hover:bg-[var(--color-surface-1)]',
            tr: 'group transition-colors duration-200'
          }"
        >
          <template #rank-cell="{ row }">
            <span
              v-if="isOldTable"
              :class="['rank-badge', rankBadgeTier(getRankField(row.original, 'all'))]"
            >{{ getRankField(row.original, 'all') ?? '—' }}</span>
            <span v-else :class="['rank-badge', getRankIntegerForNewTable(row.original) <= 10 ? 'rank-badge--silver' : 'rank-badge--normal']">
              {{ getRankIntegerForNewTable(row.original) === 9999 ? '—' : getRankIntegerForNewTable(row.original) }}
            </span>
          </template>
          <template #name-cell="{ row }">
            <NuxtLink
              :to="`/universities/${encodeURIComponent(row.original.universityNameChinese)}`"
              class="font-medium text-default hover:text-[var(--color-brand-900)]"
            >{{ row.original.universityNameChinese }}</NuxtLink>
          </template>
          <template #country-cell="{ row }">
            <div class="flex flex-col leading-tight">
              <span class="text-[13px] text-default">{{ row.original.universityTags || '—' }}</span>
              <span
                v-if="row.original.universityTagsState"
                class="mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                :style="regionStyle(row.original.universityTagsState)"
              >
                <span class="size-1.5 rounded-full" :style="{ background: regionColor(row.original.universityTagsState) }" />
                {{ row.original.universityTagsState }}
              </span>
            </div>
          </template>
          <template #subject-cell="{ row }">
            <div class="flex flex-col items-end leading-tight">
              <span v-if="!isOldTable && row.original.rankingCategory" class="text-[12px] text-default">{{ row.original.rankingCategory }}</span>
              <span v-if="!isOldTable && row.original.rankingYear" class="text-[11px] text-muted">年份 {{ row.original.rankingYear }}</span>
              <span v-if="isOldTable" class="text-[12px] text-muted">QS #{{ row.original.currentQsAllRank ?? '—' }} · US #{{ row.original.currentUsnewsAllRank ?? '—' }}</span>
            </div>
          </template>
          <template #action-cell="{ row }">
            <UButton
              :to="`/universities/${encodeURIComponent(row.original.universityNameChinese)}`"
              color="primary"
              variant="subtle"
              size="xs"
              trailing-icon="i-lucide-chevron-right"
              label="详情"
            />
          </template>
          <template #empty>
            <div class="flex flex-col items-center justify-center gap-2 py-10 text-muted">
              <UIcon name="i-lucide-search-x" class="size-10" />
              <span class="text-sm">暂无数据, 试试调整筛选</span>
            </div>
          </template>
        </UTable>
      </UCard>
    </UContainer>

    <!-- 底部 2 块: ①按地区 ②按专业 (新表) -->
    <UContainer class="py-6">
      <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <!-- 按地区 -->
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-5' }">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-globe-2" class="size-4 text-[var(--color-brand-900)]" />
              <span class="text-sm font-semibold text-default">按地区查看</span>
            </div>
            <span class="text-[11px] text-muted">点击切换筛选</span>
          </div>
          <div v-if="isOldTable" class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            <button
              v-for="r in regionDist"
              :key="r.key"
              type="button"
              class="flex flex-col gap-1 rounded-xl border border-default bg-white p-3 text-left transition-all hover:border-current hover:shadow-sm"
              :class="tagState === r.key ? 'border-transparent ring-2' : ''"
              :style="tagState === r.key ? { background: REGION_COLORS[r.key]?.bg || '#f2f3f5', color: REGION_COLORS[r.key]?.fg || '#222', boxShadow: '0 0 0 2px ' + r.color + ' inset' } : {}"
              @click="tagState = tagState === r.key ? undefined : r.key"
            >
              <div class="flex items-center gap-1.5">
                <span class="size-2 rounded-full" :style="{ background: r.color }" />
                <span class="text-[12px] font-semibold">{{ r.key }}</span>
              </div>
              <span class="text-[18px] font-bold leading-none" :style="{ fontFamily: 'var(--font-data)' }">{{ r.count }}</span>
              <span class="text-[10px] text-muted">所大学</span>
            </button>
          </div>
          <div v-else class="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted">
            <UIcon name="i-lucide-info" class="size-5" />
            <span class="text-sm">新榜单表 ({{ rankTableItems.find(t => t.value === rankTable)?.label }}) 暂无地区分类, 请切换 QS / US News 查看</span>
          </div>
        </UCard>

        <!-- 按专业 (新表) -->
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-5' }">
          <div class="mb-4 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-book-marked" class="size-4 text-[var(--color-brand-900)]" />
              <span class="text-sm font-semibold text-default">按专业 / 分类</span>
            </div>
            <span v-if="!isOldTable && subjectTotal" class="text-[11px] text-muted">Top {{ subjectDist.length }} / 共 {{ subjectTotal }} 条</span>
          </div>
          <div v-if="!isOldTable && subjectDist.length" class="flex flex-col gap-1.5">
            <NuxtLink
              v-for="s in subjectDist"
              :key="s.key"
              :to="`/charts?rankTable=${rankTable}&category=${encodeURIComponent(s.key)}`"
              class="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-[var(--color-surface-1)]"
            >
              <span class="w-[140px] flex-none truncate text-[12px] text-default">{{ s.key }}</span>
              <div class="flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)] h-1.5">
                <div
                  class="h-full rounded-full bg-[var(--color-brand-900)] transition-all"
                  :style="{ width: ((s.count / subjectDist[0].count) * 100) + '%' }"
                />
              </div>
              <span class="w-[48px] flex-none text-right font-mono text-[12px] font-semibold text-[var(--color-brand-900)]" :style="{ fontFamily: 'var(--font-data)' }">{{ s.count }}</span>
              <UIcon name="i-lucide-chevron-right" class="size-3.5 text-muted transition-transform group-hover:translate-x-0.5" />
            </NuxtLink>
          </div>
          <div v-else class="flex flex-col items-center justify-center gap-2 py-10 text-center text-muted">
            <UIcon name="i-lucide-info" class="size-5" />
            <span class="text-sm">专业分类仅 ARWU 学科 / US News 学科 / EduRank 等新榜单表支持, 请切换榜单查看</span>
          </div>
        </UCard>
      </div>
    </UContainer>
  </div>
</template>
