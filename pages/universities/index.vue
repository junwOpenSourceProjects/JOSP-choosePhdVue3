<script setup lang="ts">
import { queryAllQs } from '~/lib/api/university'
import { queryBackup2List, fetchBackup2Tables, fetchBackup2Years } from '~/lib/api/ranking'
import type { Backup2Record, UniversityAllDTO, RankVariant } from '~/types'
import { RANK_VARIANT_SHORT_MAP } from '~/types'
import { useWatchlist } from '~/composables/useWatchlist'

const { list: watchlist, toggle: toggleWatch, has: inWatchlist, count: watchCount, max: watchMax } = useWatchlist()

useHead({ title: '学校库 · 多源排名数据 · 选校系统' })

// ============== 状态 ==============
const search = ref<string | undefined>(undefined)
const debouncedSearch = ref<string | undefined>(undefined)
let searchTimer: ReturnType<typeof setTimeout> | null = null

const rankTable = ref<string>('qs')
const tagState = ref<string | undefined>(undefined)
const tag = ref<string | undefined>(undefined)
const maxRank = ref<number>(50)
const sortBy = ref<string>('rank')
const yearFilter = ref<string | undefined>(undefined)
const rankVariant = ref<RankVariant>('qs')

const tableData = ref<any[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)
const loadRunId = ref(0)

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
    const res = await fetchBackup2Tables()
    backup2Tables.value = res.data ?? []
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
    const res = await fetchBackup2Years(newVal)
    backup2Years.value = res.data ?? []
  } catch (e) {
    backup2Years.value = []
  }
})

watch(search, (newVal) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    debouncedSearch.value = newVal
  }, 300)
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

// ============== 排名徽章 ==============
function rankBadgeTier(rank: number | null | undefined): string {
  if (rank == null) return 'rank-badge--normal'
  if (rank <= 3) return 'rank-badge--gold'
  if (rank <= 10) return 'rank-badge--silver'
  if (rank <= 50) return 'rank-badge--bronze'
  return 'rank-badge--normal'
}

const REGION_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  '亚洲':   { bg: '#fce7f3', fg: '#be185d', dot: '#ea5ec1' },
  '欧洲':   { bg: '#dbeafe', fg: '#1d4ed8', dot: '#1456f0' },
  '北美洲': { bg: '#fef3c7', fg: '#b45309', dot: '#f59e0b' },
  '南美洲': { bg: '#dcfce7', fg: '#15803d', dot: '#22c55e' },
  '大洋洲': { bg: '#ede9fe', fg: '#7c3aed', dot: '#a855f7' },
  '非洲':   { bg: '#fee2e2', fg: '#b91c1c', dot: '#ef4444' }
}
function regionColor(region: string): string { return REGION_COLORS[region]?.dot ?? '#8e8e93' }
function regionStyle(region: string) {
  const c = REGION_COLORS[region]
  if (!c) return { background: 'var(--color-surface-soft)', color: 'var(--color-slate)' }
  return { background: c.bg, color: c.fg }
}

// ============== 加载 ==============
async function load() {
  loading.value = true
  error.value = null
  loadRunId.value++
  const runId = loadRunId.value
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
        universityNameChinese: debouncedSearch.value
      })
      if (runId !== loadRunId.value) return
      tableData.value = res.records ?? []
      total.value = res.total ?? 0
    } else {
      const res = await queryBackup2List({
        page: 1,
        limit: 20,
        rankTable: rankTable.value,
        universityNameChinese: debouncedSearch.value,
        universityTags: tag.value,
        universityTagsState: tagState.value,
        rankingYear: yearFilter.value || undefined,
        currentRankLimit: maxRank.value
      })
      if (runId !== loadRunId.value) return
      tableData.value = res.data?.records ?? []
      total.value = res.data?.total ?? 0
    }
  } catch (e: any) {
    if (runId !== loadRunId.value) return
    console.warn('[universities] load failed', e?.message)
    error.value = '后端不可达'
    tableData.value = []
    total.value = 0
  } finally {
    if (runId === loadRunId.value) loading.value = false
  }
}

watch([rankTable, tagState, tag, maxRank, sortBy, yearFilter], () => { load() })
watch(debouncedSearch, () => { load() })

// ============== 排序 ==============
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

// ============== 地区分布 ==============
const regionDist = computed(() => {
  if (isOldTable.value) {
    const map = new Map<string, number>()
    for (const row of tableData.value) {
      const k = row.universityTagsState || '其他'
      map.set(k, (map.get(k) || 0) + 1)
    }
    return Array.from(map.entries())
      .map(([k, v]) => ({ key: k, count: v, color: regionColor(k) }))
      .sort((a, b) => b.count - a.count)
  }
  return []
})

// ============== 专业分布 (新表) ==============
const subjectDist = ref<{ key: string; count: number }[]>([])
const subjectRunId = ref(0)
async function loadSubjectDist() {
  if (isOldTable.value) {
    subjectDist.value = []
    return
  }
  subjectRunId.value++
  const runId = subjectRunId.value
  try {
    const res = await queryBackup2List({
      page: 1, limit: 500, rankTable: rankTable.value,
      rankingYear: yearFilter.value || undefined,
      currentRankLimit: maxRank.value
    })
    if (runId !== subjectRunId.value) return
    const records: Backup2Record[] = res.data?.records ?? []
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
    if (runId === subjectRunId.value) subjectDist.value = []
  }
}
watch([rankTable, yearFilter, maxRank], () => { loadSubjectDist() })
onMounted(loadSubjectDist)

onBeforeUnmount(() => {
  loadRunId.value++
  subjectRunId.value++
  if (searchTimer) clearTimeout(searchTimer)
})

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

const tableColumns = [
  { id: 'rank', header: '排名', meta: { class: { th: 'w-[88px]', td: 'w-[88px]' } } },
  { id: 'name', header: '大学' },
  { id: 'country', header: '国家/地区' },
  { id: 'subject', header: '专业 / 年份', meta: { class: { th: 'text-right', td: 'text-right w-[200px]' } } },
  { id: 'action', header: '', meta: { class: { th: 'w-[80px]', td: 'w-[80px]' } } }
]
</script>

<template>
  <div>
    <!-- ============== Watchlist Sticky Bar ============== -->
    <div v-if="watchCount() > 0" class="watchlist-bar">
      <div class="page-container watchlist-bar__inner">
        <div class="watchlist-bar__left">
          <UIcon name="i-lucide-bookmark-check" class="size-4 text-brand" />
          <span class="t-body-sm">已选 <strong class="text-brand">{{ watchCount() }}</strong> / {{ watchMax }} 所</span>
          <span class="watchlist-bar__names">
            <span v-for="n in watchlist.slice(0, 5)" :key="n" class="watchlist-bar__chip">{{ n }}</span>
          </span>
        </div>
        <NuxtLink to="/choices" class="watchlist-bar__cta">
          打开对比
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
      </div>
    </div>

    <!-- ============== Hero (紧凑) ============== -->
    <section class="uni-hero">
      <div class="page-container">
        <div class="uni-hero__inner">
          <UBadge color="primary" variant="subtle" size="md">
            <UIcon name="i-lucide-library" class="size-3.5" />
            <span class="ml-1.5 t-caption-bold">多源排名 · 9 大排名体系</span>
          </UBadge>
          <h1 class="t-h1 uni-hero__title">学校库</h1>
          <p class="t-subtitle uni-hero__sub">多源排名 · 多维过滤 · 一目了然</p>
        </div>
      </div>
    </section>

    <!-- ============== Toolbar ============== -->
    <div class="page-container toolbar-band">
      <div class="toolbar">
        <div class="toolbar__row">
          <UInput v-model="search" icon="i-lucide-search" placeholder="搜索大学名称 (清华 / MIT / 麻省)..." size="lg" class="toolbar__search" />
          <USelectMenu v-model="rankTable" :items="rankTableItems" value-key="value" size="lg" class="toolbar__rank">
            <template #leading>
              <UIcon name="i-lucide-layers" class="size-4" />
            </template>
          </USelectMenu>
          <UButton icon="i-lucide-rotate-ccw" color="neutral" variant="outline" size="lg" label="重置" class="rounded-full" @click="reset" />
        </div>
        <div class="toolbar__row toolbar__row--second">
          <USelectMenu v-model="tagState" :items="tagStateOptions" value-key="value" placeholder="洲 (全部)" size="md" class="toolbar__select">
            <template #leading>
              <UIcon name="i-lucide-globe-2" class="size-4" />
            </template>
          </USelectMenu>
          <USelectMenu v-model="maxRank" :items="maxRankItems" value-key="value" size="md" class="toolbar__select">
            <template #leading>
              <UIcon name="i-lucide-trophy" class="size-4" />
            </template>
          </USelectMenu>
          <USelectMenu v-if="!isOldTable" v-model="yearFilter" :items="yearFilterItems" value-key="value" placeholder="全部年份" size="md" class="toolbar__select">
            <template #leading>
              <UIcon name="i-lucide-calendar" class="size-4" />
            </template>
          </USelectMenu>
          <USelectMenu v-model="sortBy" :items="sortByItems" value-key="value" size="md" class="toolbar__select">
            <template #leading>
              <UIcon name="i-lucide-arrow-up-down" class="size-4" />
            </template>
          </USelectMenu>
          <div class="toolbar__total">
            <UIcon name="i-lucide-database" class="size-3.5 text-brand" />
            共 <strong class="text-brand">{{ total.toLocaleString() }}</strong> 所大学
          </div>
        </div>
        <UAlert v-if="error" color="warning" variant="subtle" :title="error" icon="i-lucide-alert-circle" />
      </div>
    </div>

    <ClientOnly>
      <!-- ============== Top 20 表格 ============== -->
      <div class="page-container section-band">
        <UCard class="table-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-0' }">
          <div class="table-card__head">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-trophy" class="size-4 text-brand" />
              <span class="t-h4">Top {{ maxRank }} 前 20 院校</span>
              <UBadge color="primary" variant="subtle" size="xs" class="ml-1">
                {{ rankTableItems.find(t => t.value === rankTable)?.label }}
              </UBadge>
            </div>
            <div class="flex items-center gap-3">
              <div v-if="loading" class="flex items-center gap-1.5 t-micro text-muted">
                <UIcon name="i-lucide-loader" class="size-3 animate-spin" />
                加载中
              </div>
            </div>
          </div>
          <UTable
            :data="sortedData"
            :columns="tableColumns"
            :ui="{
              th: 'text-[12px] font-medium text-muted',
              td: 'py-3 text-sm transition-colors duration-200 group-hover:bg-muted',
              tr: 'group transition-colors duration-200'
            }"
          >
            <template #rank-cell="{ row }">
              <span
                v-if="isOldTable"
                :class="['rank-badge', rankBadgeTier(getRankField(row.original, 'all'))]"
              >{{ getRankField(row.original, 'all') ?? '—' }}</span>
              <span
                v-else
                :class="['rank-badge', getRankIntegerForNewTable(row.original) <= 10 ? 'rank-badge--silver' : 'rank-badge--normal']"
              >{{ getRankIntegerForNewTable(row.original) === 9999 ? '—' : getRankIntegerForNewTable(row.original) }}</span>
            </template>
            <template #name-cell="{ row }">
              <NuxtLink
                :to="`/universities/${encodeURIComponent(row.original.universityNameChinese)}`"
                class="t-body-sm font-medium text-default hover:text-brand"
              >{{ row.original.universityNameChinese }}</NuxtLink>
            </template>
            <template #country-cell="{ row }">
              <div class="flex flex-col leading-tight">
                <span class="t-body-sm text-default">{{ row.original.universityTags || '—' }}</span>
                <span
                  v-if="row.original.universityTagsState"
                  class="mt-1 inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 t-micro font-semibold"
                  :style="regionStyle(row.original.universityTagsState)"
                >
                  <span class="size-1.5 rounded-full" :style="{ background: regionColor(row.original.universityTagsState) }" />
                  {{ row.original.universityTagsState }}
                </span>
              </div>
            </template>
            <template #subject-cell="{ row }">
              <div class="flex flex-col items-end leading-tight">
                <span v-if="!isOldTable && row.original.rankingCategory" class="t-body-sm text-default">{{ row.original.rankingCategory }}</span>
                <span v-if="!isOldTable && row.original.rankingYear" class="t-micro text-muted">年份 {{ row.original.rankingYear }}</span>
                <span v-if="isOldTable" class="t-micro text-muted">QS #{{ row.original.currentQsAllRank ?? '—' }} · US #{{ row.original.currentUsnewsAllRank ?? '—' }}</span>
              </div>
            </template>
            <template #action-cell="{ row }">
              <div class="flex items-center justify-end gap-2">
                <UButton
                  :icon="inWatchlist(row.original.universityNameChinese) ? 'i-lucide-check' : 'i-lucide-plus'"
                  :color="inWatchlist(row.original.universityNameChinese) ? 'primary' : 'neutral'"
                  :variant="inWatchlist(row.original.universityNameChinese) ? 'solid' : 'outline'"
                  size="xs"
                  :disabled="!inWatchlist(row.original.universityNameChinese) && watchCount() >= watchMax"
                  :title="inWatchlist(row.original.universityNameChinese) ? '已加入对比, 点击移除' : '加入对比 (最多 5 所)'"
                  class="rounded-full"
                  @click.stop="toggleWatch(row.original.universityNameChinese)"
                />
                <UButton
                  :to="`/universities/${encodeURIComponent(row.original.universityNameChinese)}`"
                  color="primary"
                  variant="subtle"
                  size="xs"
                  trailing-icon="i-lucide-chevron-right"
                  label="详情"
                  class="rounded-full"
                />
              </div>
            </template>
            <template #empty>
              <div class="empty-state">
                <UIcon name="i-lucide-search-x" class="size-5" />
                <span class="t-body-sm">暂无数据, 试试调整筛选</span>
              </div>
            </template>
          </UTable>
        </UCard>
      </div>

      <!-- ============== 2 维分布 ============== -->
      <div class="page-container section-band">
        <div class="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <!-- 按地区 -->
          <UCard class="dist-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
            <div class="dist-card__head">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-globe-2" class="size-4 text-brand" />
                <span class="t-h4">按地区查看</span>
              </div>
              <span class="t-micro text-muted">点击切换筛选</span>
            </div>
            <div v-if="regionDist.length" class="dist-list">
              <button
                v-for="r in regionDist"
                :key="r.key"
                class="dist-row"
                @click="tagState = (tagState === r.key ? undefined : r.key)"
              >
                <span class="dist-row__dot" :style="{ background: r.color }" />
                <span class="dist-row__name" :class="{ 'is-active': tagState === r.key }">{{ r.key }}</span>
                <span class="dist-row__bar">
                  <span class="dist-row__fill" :style="{ width: `${(r.count / regionDist[0]!.count * 100)}%`, background: r.color }" />
                </span>
                <span class="dist-row__count">{{ r.count }}</span>
              </button>
            </div>
            <div v-else class="empty-state">
              <UIcon name="i-lucide-globe-2" class="size-5" />
              <span class="t-body-sm">该榜单暂无地区数据</span>
            </div>
          </UCard>

          <!-- 按专业 -->
          <UCard class="dist-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
            <div class="dist-card__head">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-book-marked" class="size-4 text-brand" />
                <span class="t-h4">按专业查看</span>
              </div>
              <span v-if="isOldTable" class="t-micro text-muted">仅新榜单显示</span>
              <span v-else class="t-micro text-muted">{{ subjectTotal }} 行 · 前 12</span>
            </div>
            <div v-if="!isOldTable && subjectDist.length" class="dist-list">
              <div
                v-for="s in subjectDist"
                :key="s.key"
                class="dist-row"
              >
                <span class="dist-row__dot" style="background: #1456f0" />
                <span class="dist-row__name">{{ s.key }}</span>
                <span class="dist-row__bar">
                  <span class="dist-row__fill" :style="{ width: `${(s.count / subjectDist[0]!.count * 100)}%`, background: '#1456f0' }" />
                </span>
                <span class="dist-row__count">{{ s.count }}</span>
              </div>
            </div>
            <div v-else class="empty-state">
              <UIcon name="i-lucide-book-marked" class="size-5" />
              <span class="t-body-sm">{{ isOldTable ? '切换到新榜单看专业分布' : '暂无专业数据' }}</span>
            </div>
          </UCard>
        </div>
      </div>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* Watchlist sticky bar */
.watchlist-bar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-hairline);
  padding: 12px 0;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 1px 2px 0px;
}
.watchlist-bar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.watchlist-bar__left {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.watchlist-bar__names {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
.watchlist-bar__chip {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border-radius: 9999px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-ink);
}
.watchlist-bar__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-ink);
  color: var(--color-canvas);
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease;
}
.watchlist-bar__cta:hover {
  background: #181e25;
}
@media (max-width: 768px) {
  .watchlist-bar__names { display: none; }
}

/* §hero-band-marketing 紧凑版 */
.uni-hero {
  padding: 64px 0 32px;
  background: var(--color-canvas);
}
@media (min-width: 768px) {
  .uni-hero { padding: 80px 0 48px; }
}
.uni-hero__inner {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}
.uni-hero__title { margin: 4px 0 0; }
.uni-hero__sub { margin: 0; }

/* Toolbar */
.toolbar-band { margin-top: 8px; }
.toolbar {
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: rgba(0, 0, 0, 0.04) 0px 1px 2px 0px;
}
.toolbar__row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}
.toolbar__row--second {
  padding-top: 12px;
  border-top: 1px solid var(--color-hairline-soft);
}
.toolbar__search { flex: 1; min-width: 280px; }
.toolbar__rank { min-width: 180px; }
.toolbar__select { min-width: 140px; }
.toolbar__total {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  background: var(--color-surface);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-ink);
}

/* Table card */
.section-band { margin-top: 24px; }
.table-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-hairline);
}
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 40px 20px;
  color: var(--color-slate);
}

/* Dist card */
.dist-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.dist-list { display: flex; flex-direction: column; gap: 8px; }
.dist-row {
  display: grid;
  grid-template-columns: 12px 100px 1fr auto;
  align-items: center;
  gap: 12px;
  padding: 6px 8px;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 160ms ease;
  font-family: var(--font-ui);
}
.dist-row:hover { background: var(--color-surface-soft); }
.dist-row__dot { width: 10px; height: 10px; border-radius: 9999px; }
.dist-row__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-charcoal);
}
.dist-row__name.is-active { color: var(--color-brand-blue); font-weight: 600; }
.dist-row__bar {
  height: 6px;
  background: var(--color-surface-soft);
  border-radius: 9999px;
  overflow: hidden;
}
.dist-row__fill {
  display: block;
  height: 100%;
  border-radius: 9999px;
}
.dist-row__count {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-charcoal);
  min-width: 32px;
  text-align: right;
}

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
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
  color: var(--color-canvas);
}
:deep(.rank-badge--gold)   { background: #f59e0b; }
:deep(.rank-badge--silver) { background: #9ca3af; color: var(--color-ink); }
:deep(.rank-badge--bronze) { background: #ea580c; }
:deep(.rank-badge--normal) { background: var(--color-surface-soft); color: var(--color-ink); }
</style>