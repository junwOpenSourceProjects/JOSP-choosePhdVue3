<script setup lang="ts">
import { queryAllQs } from '~/lib/api/university'
import { queryBackup2List, fetchBackup2Tables, fetchBackup2Years } from '~/lib/api/ranking'
import type { Backup2Record, UniversityAllDTO, RankVariant } from '~/types'
import { RANK_VARIANT_SHORT_MAP } from '~/types'
import { useWatchlist } from '~/composables/useWatchlist'
import { regionStyle, regionDot } from '~/utils/region'

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

// ============== 排名 helper ==============
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

// ============== 地区分布 ==============
const regionDist = computed(() => {
  if (isOldTable.value) {
    const map = new Map<string, number>()
    for (const row of tableData.value) {
      const k = row.universityTagsState || '其他'
      map.set(k, (map.get(k) || 0) + 1)
    }
    return Array.from(map.entries())
      .map(([k, v]) => ({ key: k, count: v, color: regionDot(k) }))
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

// ============== 卡片显示 helper ==============
function cardRank(row: UniversityAllDTO | any): number | null {
  if (isOldTable.value) {
    return getRankField(row as UniversityAllDTO, 'all')
  }
  const r = getRankIntegerForNewTable(row)
  return r === 9999 ? null : r
}

function isTied(row: any, idx: number): boolean {
  if (!sortedData.value[idx + 1]) return false
  const cur = cardRank(row)
  const next = cardRank(sortedData.value[idx + 1])
  return cur != null && next != null && cur === next
}

function get4Dims(row: UniversityAllDTO | any): { qs: number | null; usnews: number | null; qsCs: number | null; usnewsCs: number | null } {
  if (isOldTable.value) {
    return {
      qs: row.currentQsAllRank ?? null,
      usnews: row.currentUsnewsAllRank ?? null,
      qsCs: row.currentQsComputerRank ?? null,
      usnewsCs: row.currentUsnewsComputerRank ?? null
    }
  }
  return { qs: null, usnews: null, qsCs: null, usnewsCs: null }
}

const currentRankLabel = computed(() => rankTableItems.value.find(t => t.value === rankTable.value)?.label ?? '')
</script>

<template>
  <div class="uni-page">
    <!-- Watchlist sticky bar -->
    <div v-if="watchCount() > 0" class="watchlist-bar">
      <div class="page-container watchlist-bar__inner">
        <div class="watchlist-bar__left">
          <UIcon name="i-lucide-bookmark-check" class="size-4" style="color: var(--color-brand-blue)" />
          <span class="text-sm">已选 <strong style="color: var(--color-brand-blue)">{{ watchCount() }}</strong> / {{ watchMax }} 所</span>
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

    <!-- HERO -->
    <section class="uni-hero">
      <div class="page-container">
        <div class="uni-hero__eyebrow">
          <span class="uni-hero__dot" />
          <span>多源排名 · 多维过滤 · 一目了然</span>
        </div>
        <h1 class="uni-hero__title">
          学校库
        </h1>
        <p class="uni-hero__sub">
          浏览 QS / US News / ARWU 等 9 大排名体系，按地区、年份、Top N 快速筛选目标院校。
        </p>
      </div>
    </section>

    <!-- TOOLBAR -->
    <section class="uni-toolbar-section">
      <div class="page-container">
        <div class="uni-toolbar">
          <div class="uni-toolbar__row">
            <UInput
              v-model="search"
              icon="i-lucide-search"
              placeholder="搜索大学名称 (清华 / MIT / 麻省)..."
              size="sm"
              class="uni-toolbar__search"
            />
            <USelectMenu
              v-model="rankTable"
              :items="rankTableItems"
              value-key="value"
              size="sm"
              class="uni-toolbar__select"
            >
              <template #leading>
                <UIcon name="i-lucide-layers" class="size-4" />
              </template>
            </USelectMenu>
            <USelectMenu
              v-model="tagState"
              :items="tagStateOptions"
              value-key="value"
              placeholder="洲"
              size="sm"
              class="uni-toolbar__select"
            >
              <template #leading>
                <UIcon name="i-lucide-globe-2" class="size-4" />
              </template>
            </USelectMenu>
            <USelectMenu
              v-model="maxRank"
              :items="maxRankItems"
              value-key="value"
              size="sm"
              class="uni-toolbar__select"
            >
              <template #leading>
                <UIcon name="i-lucide-trophy" class="size-4" />
              </template>
            </USelectMenu>
            <USelectMenu
              v-if="!isOldTable"
              v-model="yearFilter"
              :items="yearFilterItems"
              value-key="value"
              placeholder="年份"
              size="sm"
              class="uni-toolbar__select"
            >
              <template #leading>
                <UIcon name="i-lucide-calendar" class="size-4" />
              </template>
            </USelectMenu>
            <USelectMenu
              v-model="sortBy"
              :items="sortByItems"
              value-key="value"
              size="sm"
              class="uni-toolbar__select"
            >
              <template #leading>
                <UIcon name="i-lucide-arrow-up-down" class="size-4" />
              </template>
            </USelectMenu>
            <UButton
              icon="i-lucide-rotate-ccw"
              color="neutral"
              variant="outline"
              size="sm"
              label="重置"
              class="rounded-full"
              @click="reset"
            />
          </div>
          <div class="uni-toolbar__meta">
            <span class="uni-toolbar__total">
              <UIcon name="i-lucide-database" class="size-4" style="color: var(--color-brand-blue)" />
              共 <strong style="color: var(--color-brand-blue)">{{ total.toLocaleString() }}</strong> 所大学
            </span>
            <span v-if="loading" class="uni-toolbar__loading">
              <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
              加载中
            </span>
          </div>
        </div>
      </div>
    </section>

    <ClientOnly>
      <!-- SCHOOL CARDS GRID -->
      <section class="page-container section-band">
        <div class="grid-head">
          <div class="grid-head__left">
            <span class="grid-head__eyebrow">{{ currentRankLabel }}</span>
            <h2 class="grid-head__title">{{ currentRankLabel }} Top {{ maxRank }} 院校</h2>
          </div>
        </div>

        <div v-if="sortedData.length" class="school-grid">
          <article
            v-for="(row, idx) in sortedData"
            :key="row.universityNameChinese + idx"
            class="school-card"
          >
            <div class="school-card__head">
              <div class="school-card__rank-wrap">
                <RankBadge :rank="cardRank(row)" size="md" />
                <sup v-if="isTied(row, idx)" class="school-card__rank-tie">T</sup>
              </div>
              <span v-if="isOldTable && (get4Dims(row).qs || get4Dims(row).usnews)" class="school-card__chips">
                <span v-if="get4Dims(row).qs" class="school-card__chip">QS #{{ get4Dims(row).qs }}</span>
                <span v-if="get4Dims(row).usnews" class="school-card__chip">US #{{ get4Dims(row).usnews }}</span>
              </span>
              <span v-else-if="!isOldTable && row.rankingCategory" class="school-card__chip">{{ row.rankingCategory }}</span>
              <button
                class="school-card__bookmark"
                :class="inWatchlist(row.universityNameChinese) ? 'school-card__bookmark--on' : ''"
                :aria-label="inWatchlist(row.universityNameChinese) ? '已加入对比' : '加入对比'"
                @click.stop="toggleWatch(row.universityNameChinese)"
              >
                <UIcon :name="inWatchlist(row.universityNameChinese) ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'" class="size-4" />
              </button>
            </div>
            <NuxtLink :to="`/universities/${encodeURIComponent(row.universityNameChinese)}`" class="school-card__name">
              {{ row.universityNameChinese }}
            </NuxtLink>
            <div class="school-card__meta">
              <span class="school-card__country">{{ row.universityTags || '—' }}</span>
              <span
                v-if="row.universityTagsState"
                class="school-card__region"
                :style="regionStyle(row.universityTagsState)"
              >
                <span class="school-card__region-dot" :style="{ background: regionDot(row.universityTagsState) }" />
                {{ row.universityTagsState }}
              </span>
            </div>
          </article>
        </div>
        <AppError
          v-else-if="error"
          title="后端不可达"
          description="请检查后端服务 8081 是否运行，然后重试"
          retry-label="重试"
          size="md"
          @retry="load"
        />
        <AppEmpty
          v-else
          icon="i-lucide-search-x"
          title="暂无数据"
          description="试试调整筛选条件，或切换排名体系"
          size="md"
        />
      </section>

      <!-- 2 维分布 -->
      <section class="page-container section-band section-band--last">
        <div class="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div class="dist-card">
            <div class="dist-card__head">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-globe-2" class="size-4" style="color: var(--color-brand-blue)" />
                <span class="t-h4">按地区查看</span>
              </div>
              <span class="t-micro" style="color: var(--color-stone)">点击切换筛选</span>
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
            <div v-else class="empty-state empty-state--mini">
              <UIcon name="i-lucide-globe-2" class="size-4" />
              <span class="t-body-sm">该榜单暂无地区数据</span>
            </div>
          </div>

          <div class="dist-card">
            <div class="dist-card__head">
              <div class="flex items-center gap-2">
                <UIcon name="i-lucide-book-marked" class="size-4" style="color: var(--color-brand-blue)" />
                <span class="t-h4">按专业查看</span>
              </div>
              <span v-if="isOldTable" class="t-micro" style="color: var(--color-stone)">仅新榜单显示</span>
              <span v-else class="t-micro" style="color: var(--color-stone)">{{ subjectTotal }} 行 · 前 12</span>
            </div>
            <div v-if="!isOldTable && subjectDist.length" class="dist-list">
              <div v-for="s in subjectDist" :key="s.key" class="dist-row">
                <span class="dist-row__dot" style="background: #1456f0" />
                <span class="dist-row__name">{{ s.key }}</span>
                <span class="dist-row__bar">
                  <span class="dist-row__fill" :style="{ width: `${(s.count / subjectDist[0]!.count * 100)}%`, background: '#1456f0' }" />
                </span>
                <span class="dist-row__count">{{ s.count }}</span>
              </div>
            </div>
            <div v-else class="empty-state empty-state--mini">
              <UIcon name="i-lucide-book-marked" class="size-4" />
              <span class="t-body-sm">{{ isOldTable ? '切换到新榜单看专业分布' : '暂无专业数据' }}</span>
            </div>
          </div>
        </div>
      </section>
    </ClientOnly>
  </div>
</template>

<style scoped>
/* ===== Watchlist sticky bar ===== */
.watchlist-bar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: var(--color-ink);
  color: var(--color-canvas);
  padding: 8px 0;
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
  color: rgba(255, 255, 255, 0.85);
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
  background: rgba(255, 255, 255, 0.12);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-canvas);
}
.watchlist-bar__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  background: var(--color-canvas);
  color: var(--color-ink);
  border-radius: 9999px;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.15s ease;
  flex-shrink: 0;
}
.watchlist-bar__cta:hover { background: var(--color-hairline-soft); }
@media (max-width: 768px) {
  .watchlist-bar__names { display: none; }
}

/* ===== HERO ===== */
.uni-hero {
  padding: 64px 0 40px;
  background: var(--color-ink);
  color: var(--color-canvas);
}
@media (min-width: 768px) {
  .uni-hero { padding: 80px 0 48px; }
}
@media (min-width: 1024px) {
  .uni-hero { padding: 96px 0 56px; }
}
.uni-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 20px;
}
.uni-hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand-coral);
}
.uni-hero__eyebrow span:last-child {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.uni-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--color-canvas);
}
@media (min-width: 1024px) {
  .uni-hero__title { font-size: 80px; }
}
.uni-hero__sub {
  margin: 16px 0 0;
  font-size: 18px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
  max-width: 640px;
}

/* ===== TOOLBAR ===== */
.uni-toolbar-section {
  padding: 20px 0 0;
}
.uni-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-hairline);
  border-radius: 9999px;
}
@media (max-width: 768px) {
  .uni-toolbar {
    border-radius: 24px;
    padding: 12px;
  }
}
.uni-toolbar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  flex: 1;
}
.uni-toolbar__search { flex: 1; min-width: 240px; }
.uni-toolbar__select { min-width: 120px; }
.uni-toolbar__meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.uni-toolbar__total {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 9999px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
}
.uni-toolbar__loading {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-stone);
}

/* ===== Section bands ===== */
.section-band { margin-top: 80px; }
.section-band--last { margin-bottom: 120px; }
@media (max-width: 768px) {
  .section-band { margin-top: 56px; }
  .section-band--last { margin-bottom: 80px; }
}

/* ===== Grid head ===== */
.grid-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}
.grid-head__left { display: flex; flex-direction: column; gap: 6px; }
.grid-head__eyebrow {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand-blue);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.grid-head__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.5px;
  color: var(--color-ink);
}
@media (min-width: 768px) {
  .grid-head__title { font-size: 40px; letter-spacing: -1px; }
}

/* ===== School grid ===== */
.school-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .school-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .school-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1440px) {
  .school-grid { grid-template-columns: repeat(4, 1fr); }
}

/* ===== School card ===== */
.school-card {
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 200ms ease;
  position: relative;
  min-height: 152px;
}
.school-card:hover {
  border-color: var(--color-ink);
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.08);
}
.school-card__head {
  display: flex;
  align-items: center;
  gap: 8px;
}
.school-card__rank-wrap {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
.school-card__rank-tie {
  font-size: 10px;
  font-weight: 700;
  color: var(--color-stone);
  margin-left: 2px;
}
.school-card__chips {
  display: inline-flex;
  gap: 4px;
  flex-wrap: wrap;
  flex: 1;
}
.school-card__chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  padding: 0 8px;
  border-radius: 6px;
  background: var(--color-surface);
  border: 1px solid var(--color-hairline);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-slate);
  letter-spacing: 0.02em;
  white-space: nowrap;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.school-card__bookmark {
  margin-left: auto;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid var(--color-hairline);
  color: var(--color-slate);
  cursor: pointer;
  transition: all 150ms ease;
  flex-shrink: 0;
}
.school-card__bookmark:hover {
  background: var(--color-surface);
  border-color: var(--color-ink);
  color: var(--color-ink);
}
.school-card__bookmark--on {
  background: var(--color-brand-blue);
  border-color: var(--color-brand-blue);
  color: var(--color-canvas);
}
.school-card__name {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.30;
  letter-spacing: -0.01em;
  color: var(--color-ink);
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.school-card__name:hover { color: var(--color-brand-blue); }
.school-card__meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: auto;
}
.school-card__country {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-slate);
}
.school-card__region {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
}
.school-card__region-dot {
  width: 5px;
  height: 5px;
  border-radius: 9999px;
}

/* ===== Empty state ===== */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-stone);
  gap: 8px;
}
.empty-state--mini { padding: 32px 16px; }

/* ===== Dist cards ===== */
.dist-card {
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  padding: 24px;
}
.dist-card__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.dist-list { display: flex; flex-direction: column; gap: 8px; }
.dist-row {
  display: grid;
  grid-template-columns: 12px 110px 1fr 32px;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: background 160ms ease;
  font-family: var(--font-ui);
}
button.dist-row { width: 100%; }
.dist-row:hover { background: var(--color-surface-soft); }
.dist-row__dot { width: 10px; height: 10px; border-radius: 9999px; }
.dist-row__name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-charcoal);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  transition: width 240ms ease;
}
.dist-row__count {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 700;
  color: var(--color-charcoal);
  text-align: right;
  font-variant-numeric: tabular-nums;
  line-height: 1;
  min-width: 28px;
}

@media (max-width: 640px) {
  .uni-hero { padding: 48px 0 32px; }
  .uni-hero__title { font-size: 48px; }
  .uni-toolbar { border-radius: 24px; }
  .uni-toolbar__total { width: 100%; justify-content: center; }
  .dist-row { grid-template-columns: 10px 90px 1fr 28px; gap: 8px; }
}
</style>
