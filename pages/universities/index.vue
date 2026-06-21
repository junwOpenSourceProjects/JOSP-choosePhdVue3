<script setup lang="ts">
import { queryAllQs } from '~/lib/api/university'
import { queryBackup2List, fetchBackup2Tables, fetchBackup2Years } from '~/lib/api/ranking'
import type { UniversityAllDTO, RankVariant } from '~/types'
import { RANK_VARIANT_SHORT_MAP } from '~/types'

useHead({ title: '学校库 · 选校系统' })

// ============ 状态 ============
const search = ref<string | undefined>(undefined)
const rankVariant = ref<RankVariant>('qs')      // qs / usnews / all
const tagState = ref<string | undefined>(undefined)  // 洲
const tag = ref<string | undefined>(undefined)       // 国家
const maxRank = ref<number>(100)                 // 排名上限
const yearFilter = ref<string | undefined>(undefined)
const sortBy = ref<string>('rank')               // rank / name / country
const currentPage = ref(1)
const pageSize = 20

// 数据
const tableData = ref<UniversityAllDTO[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

const rankVariantItems = [
  { value: 'qs' as const, label: RANK_VARIANT_SHORT_MAP.qs },
  { value: 'usnews' as const, label: RANK_VARIANT_SHORT_MAP.usnews },
  { value: 'all' as const, label: RANK_VARIANT_SHORT_MAP.all }
]

// "备份 2" 7 张新表 + 3 张旧表 = 10 个榜单类型
// 旧表走 queryAllQs (qs/usnews/all), 新表走 queryBackup2List (rankTable=xxx)
const rankTable = ref<string>('qs')
const backup2Tables = ref<string[]>([])
const backup2Years = ref<string[]>([])  // 当前新表的 distinct year (按年倒序)
const isOldTable = computed(() => rankTable.value === 'qs' || rankTable.value === 'usnews' || rankTable.value === 'all')

const rankTableItems = computed(() => {
  const builtins = [
    { value: 'qs', label: RANK_VARIANT_SHORT_MAP.qs },
    { value: 'usnews', label: RANK_VARIANT_SHORT_MAP.usnews },
    { value: 'all', label: RANK_VARIANT_SHORT_MAP.all }
  ]
  // 后端 7 张新表的中文名映射
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

// 启动时拉一次 7 张新表清单
onMounted(async () => {
  try {
    // ShowResult 包装的响应需要 .data 解包
    const res = await fetchBackup2Tables() as any
    backup2Tables.value = res?.data ?? res ?? []
  } catch (e) {
    console.warn('[universities] fetch backup2 tables failed', e)
  }
})

// rankTable 切换时, 如果是新表, 拉 distinct year
watch(rankTable, async (newVal) => {
  yearFilter.value = undefined  // 切榜单时清掉 year
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

const yearFilterItems = computed(() => {
  return [
    { value: undefined, label: '全部年份' },
    ...backup2Years.value.map(y => ({ value: y, label: y }))
  ]
})

const tagStateOptions = [
  { value: '亚洲', label: '亚洲' },
  { value: '欧洲', label: '欧洲' },
  { value: '北美洲', label: '北美洲' },
  { value: '大洋洲', label: '大洋洲' },
  { value: '南美洲', label: '南美洲' },
  { value: '非洲', label: '非洲' }
]

const maxRankItems = [
  { value: 50, label: 'Top 50' },
  { value: 100, label: 'Top 100' },
  { value: 200, label: 'Top 200' },
  { value: 500, label: 'Top 500' }
]

const sortByItems = [
  { value: 'rank', label: '按排名' },
  { value: 'name', label: '按名称' },
  { value: 'country', label: '按国家' }
]

// 派生: 排序指示
const sortByLabel = computed(() => sortByItems.find(s => s.value === sortBy.value)?.label ?? '按排名')
const sortIcon = computed(() => {
  if (sortBy.value === 'rank') return 'i-lucide-arrow-up-narrow-wide'
  if (sortBy.value === 'name') return 'i-lucide-arrow-down-a-z'
  return 'i-lucide-map-pin'
})

// 排名徽章 tier (金/银/铜/普通)
function rankBadgeTier(rank: number | null | undefined): string {
  if (rank == null) return 'rank-badge--normal'
  if (rank <= 3) return 'rank-badge--gold'
  if (rank <= 10) return 'rank-badge--silver'
  if (rank <= 50) return 'rank-badge--bronze'
  return 'rank-badge--normal'
}

// 洲颜色 token (DESIGN 6 大洲, 视觉差异化)
const REGION_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  '亚洲': { bg: 'rgba(234, 94, 193, 0.10)', fg: '#be185d', dot: '#ea5ec1' },
  '欧洲': { bg: 'rgba(20, 86, 240, 0.10)', fg: '#1d4ed8', dot: '#1456f0' },
  '北美洲': { bg: 'rgba(245, 158, 11, 0.10)', fg: '#b45309', dot: '#f59e0b' },
  '南美洲': { bg: 'rgba(34, 197, 94, 0.10)', fg: '#15803d', dot: '#22c55e' },
  '大洋洲': { bg: 'rgba(168, 85, 247, 0.10)', fg: '#7c3aed', dot: '#a855f7' },
  '非洲': { bg: 'rgba(239, 68, 68, 0.10)', fg: '#b91c1c', dot: '#ef4444' }
}
function regionColor(region: string): string {
  return REGION_COLORS[region]?.dot ?? '#8e8e93'
}
function regionStyle(region: string) {
  const c = REGION_COLORS[region]
  if (!c) return { background: 'rgba(0,0,0,0.04)', color: '#45515e' }
  return { background: c.bg, color: c.fg }
}

// 派生: 过滤选项
const tagOptions = computed(() => {
  if (!tagState.value) return []
  const set = new Set<string>()
  for (const row of tableData.value) {
    if (row.universityTagsState === tagState.value && row.universityTags) {
      set.add(row.universityTags)
    }
  }
  return Array.from(set).sort().map(v => ({ value: v, label: v }))
})

// ============ 加载数据 ============
async function load() {
  loading.value = true
  error.value = null
  try {
    // 旧 3 张表走 queryAllQs, 新 7 张表走 queryBackup2List
    if (rankTable.value === 'qs' || rankTable.value === 'usnews' || rankTable.value === 'all') {
      rankVariant.value = rankTable.value
      const res = await queryAllQs({
        page: currentPage.value,
        limit: pageSize,
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
        page: currentPage.value,
        limit: pageSize,
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
    error.value = '后端不可达, 显示 mock 数据'
    tableData.value = generateMock()
    total.value = 50
  } finally {
    loading.value = false
  }
}

function generateMock(): UniversityAllDTO[] {
  return [
    { universityNameChinese: '麻省理工学院', universityTags: '美国', universityTagsState: '北美洲', rankingYear: '2025', currentQsAllRank: 1, currentQsComputerRank: 1, currentUsnewsAllRank: 2, currentUsnewsComputerRank: 1 },
    { universityNameChinese: '斯坦福大学', universityTags: '美国', universityTagsState: '北美洲', rankingYear: '2025', currentQsAllRank: 5, currentQsComputerRank: 3, currentUsnewsAllRank: 3, currentUsnewsComputerRank: 2 },
    { universityNameChinese: '哈佛大学', universityTags: '美国', universityTagsState: '北美洲', rankingYear: '2025', currentQsAllRank: 4, currentQsComputerRank: 12, currentUsnewsAllRank: 1, currentUsnewsComputerRank: 16 },
    { universityNameChinese: '牛津大学', universityTags: '英国', universityTagsState: '欧洲', rankingYear: '2025', currentQsAllRank: 3, currentQsComputerRank: 5, currentUsnewsAllRank: 4, currentUsnewsComputerRank: 5 },
    { universityNameChinese: '剑桥大学', universityTags: '英国', universityTagsState: '欧洲', rankingYear: '2025', currentQsAllRank: 2, currentQsComputerRank: 4, currentUsnewsAllRank: 8, currentUsnewsComputerRank: 7 },
    { universityNameChinese: '苏黎世联邦理工学院', universityTags: '瑞士', universityTagsState: '欧洲', rankingYear: '2025', currentQsAllRank: 7, currentQsComputerRank: 8, currentUsnewsAllRank: 5, currentUsnewsComputerRank: 4 },
    { universityNameChinese: '清华大学', universityTags: '中国', universityTagsState: '亚洲', rankingYear: '2025', currentQsAllRank: 14, currentQsComputerRank: 10, currentUsnewsAllRank: 16, currentUsnewsComputerRank: 8 },
    { universityNameChinese: '北京大学', universityTags: '中国', universityTagsState: '亚洲', rankingYear: '2025', currentQsAllRank: 17, currentQsComputerRank: 11, currentUsnewsAllRank: 22, currentUsnewsComputerRank: 13 },
    { universityNameChinese: '东京大学', universityTags: '日本', universityTagsState: '亚洲', rankingYear: '2025', currentQsAllRank: 28, currentQsComputerRank: 32, currentUsnewsAllRank: 86, currentUsnewsComputerRank: 64 },
    { universityNameChinese: '新加坡国立大学', universityTags: '新加坡', universityTagsState: '亚洲', rankingYear: '2025', currentQsAllRank: 8, currentQsComputerRank: 6, currentUsnewsAllRank: 27, currentUsnewsComputerRank: 9 }
  ]
}

const filteredData = computed(() => {
  // 新表的 search 在后端做, 前端不再二次过滤 (避免翻页丢数据)
  if (rankTable.value !== 'qs' && rankTable.value !== 'usnews' && rankTable.value !== 'all') {
    return tableData.value
  }
  if (!search.value) return tableData.value
  const kw = search.value.toLowerCase()
  return tableData.value.filter(r => r.universityNameChinese?.toLowerCase().includes(kw))
})

const sortedData = computed(() => {
  // 备份 2 新表数据走表格前, 把字段映射到 UI 通用格式 (currentQsAllRank / qsCs 等占位)
  const normalized = tableData.value.map(r => {
    if (rankTable.value !== 'qs' && rankTable.value !== 'usnews' && rankTable.value !== 'all') {
      // 新表的 currentRankInteger 映射到 currentQsAllRank 占位列, 其余列留空
      return {
        ...r,
        currentQsAllRank: r.currentRankInteger ?? null,
        currentQsComputerRank: null,
        currentUsnewsAllRank: null,
        currentUsnewsComputerRank: null
      } as any
    }
    return r
  })
  const arr = [...normalized]
  // 新表按 currentRankInteger 排序; 旧表按 sortBy
  if (rankTable.value !== 'qs' && rankTable.value !== 'usnews' && rankTable.value !== 'all') {
    arr.sort((a: any, b: any) => (a.currentRankInteger ?? 9999) - (b.currentRankInteger ?? 9999))
  } else if (sortBy.value === 'rank') {
    arr.sort((a, b) => getRankValue(a) - getRankValue(b))
  } else if (sortBy.value === 'name') {
    arr.sort((a, b) => (a.universityNameChinese || '').localeCompare(b.universityNameChinese || '', 'zh'))
  } else if (sortBy.value === 'country') {
    arr.sort((a, b) => (a.universityTags || '').localeCompare(b.universityTags || '', 'zh'))
  }
  return arr
})

function getRankValue(row: UniversityAllDTO): number {
  if (rankVariant.value === 'qs') return row.currentQsAllRank ?? 9999
  if (rankVariant.value === 'usnews') return row.currentUsnewsAllRank ?? 9999
  return Math.min(row.currentQsAllRank ?? 9999, row.currentUsnewsAllRank ?? 9999)
}

function getRankField(row: UniversityAllDTO, which: 'all' | 'cs'): number | null {
  if (rankVariant.value === 'qs') {
    return which === 'all' ? row.currentQsAllRank : row.currentQsComputerRank
  }
  if (rankVariant.value === 'usnews') {
    return which === 'all' ? row.currentUsnewsAllRank : row.currentUsnewsComputerRank
  }
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

function rankBadgeColor(rank: number | null | undefined): 'primary' | 'secondary' | 'neutral' {
  if (rank == null) return 'neutral'
  if (rank <= 10) return 'primary'
  if (rank <= 50) return 'primary'
  if (rank <= 100) return 'secondary'
  return 'neutral'
}

function rankBadgeVariant(rank: number | null | undefined): 'solid' | 'subtle' | 'soft' {
  if (rank == null) return 'subtle'
  if (rank <= 10) return 'solid'
  if (rank <= 100) return 'subtle'
  return 'soft'
}

function reset() {
  search.value = undefined
  tagState.value = undefined
  tag.value = undefined
  maxRank.value = 100
  rankTable.value = 'qs'
  sortBy.value = 'rank'
  yearFilter.value = undefined
  currentPage.value = 1
  load()
}

watch([rankTable, tagState, tag, maxRank, sortBy, yearFilter, search], () => {
  currentPage.value = 1
  load()
})

onMounted(() => {
  load()
})
</script>

<template>
  <div>
    <!-- Page Hero -->
    <UContainer class="py-12">
      <h1
        class="text-[40px] font-medium leading-[1.10] tracking-tight text-default sm:text-5xl"
        :style="{ fontFamily: 'var(--font-display)' }"
      >学校库</h1>
      <p class="mt-2 text-base text-muted">多源排名 · 多维过滤 · 一目了然</p>
    </UContainer>

    <!-- Toolbar -->
    <UContainer>
      <UCard
        :ui="{
          root: 'rounded-2xl border border-default bg-white shadow-sm',
          body: 'p-5 sm:p-6 space-y-4'
        }"
      >
        <!-- Row 1: search + rank variant + reset -->
        <div class="flex flex-wrap items-center gap-3">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="搜索大学名称..."
            size="md"
            class="flex-1 min-w-[240px]"
          />
          <USelectMenu
            v-model="rankTable"
            :items="rankTableItems"
            value-key="value"
            placeholder="榜单类型"
            size="md"
            class="min-w-[180px]"
          />
          <UButton
            icon="i-lucide-rotate-ccw"
            color="neutral"
            variant="outline"
            size="md"
            label="重置"
            @click="reset"
          />
        </div>

        <!-- Row 2: filters + total -->
        <div class="flex flex-wrap items-center gap-3">
          <USelectMenu
            v-model="tagState"
            :items="tagStateOptions"
            value-key="value"
            placeholder="洲 (全部)"
            size="md"
            class="min-w-[140px]"
          />
          <USelectMenu
            v-model="tag"
            :items="tagOptions"
            value-key="value"
            :placeholder="tagState ? '国家 (全部)' : '请先选洲'"
            :disabled="!tagState"
            size="md"
            class="min-w-[140px]"
          />
          <USelectMenu
            v-model="maxRank"
            :items="maxRankItems"
            value-key="value"
            size="md"
            class="min-w-[120px]"
          />
          <!-- rankingYear filter: 只对 7 张新表显示 -->
          <USelectMenu
            v-if="!isOldTable"
            v-model="yearFilter"
            :items="yearFilterItems"
            value-key="value"
            placeholder="全部年份"
            size="md"
            class="min-w-[140px]"
          />
          <div class="inline-flex items-center gap-1 rounded-full border border-default bg-white px-3 py-1.5 text-[13px]">
            <span class="text-muted">排序</span>
            <span class="font-semibold text-default">{{ sortByLabel }}</span>
            <UIcon :name="sortIcon" class="size-3.5 text-[var(--color-brand-900)]" />
          </div>
          <div class="ml-auto text-[13px] text-muted">
            共 <strong class="text-default">{{ total }}</strong> 所大学
          </div>
        </div>

        <UAlert
          v-if="error"
          color="warning"
          variant="subtle"
          :title="error"
          icon="i-lucide-alert-circle"
        />
      </UCard>
    </UContainer>

    <!-- Table -->
    <UContainer class="py-6">
      <UCard
        :ui="{
          root: 'rounded-2xl border border-default bg-white shadow-sm overflow-hidden',
          body: 'p-0'
        }"
      >
        <UTable
          :data="sortedData"
          :loading="loading"
          :columns="[
            { id: 'rank', header: '排名', accessorKey: 'currentQsAllRank', meta: { class: { th: 'w-[88px]', td: 'w-[88px]' } } },
            { id: 'name', header: '大学', accessorKey: 'universityNameChinese' },
            { id: 'country', header: '国家/地区', accessorKey: 'universityTags' },
            { id: 'qsAll', header: () => rankVariant === 'usnews' ? 'QS (参考)' : 'QS', meta: { class: { th: 'text-right', td: 'text-right' } } },
            { id: 'qsCs', header: 'QS 计算机', meta: { class: { th: 'text-right', td: 'text-right' } } },
            { id: 'usAll', header: () => rankVariant === 'qs' ? 'US News (参考)' : 'US News', meta: { class: { th: 'text-right', td: 'text-right' } } },
            { id: 'usCs', header: 'US News 计算机', meta: { class: { th: 'text-right', td: 'text-right' } } },
            { id: 'action', header: '操作', meta: { class: { th: 'w-[100px]', td: 'w-[100px]' } } }
          ]"
          :ui="{
            wrapper: 'min-h-[200px]',
            th: 'text-[12px] font-medium text-muted',
            td: 'py-3.5 text-sm transition-colors duration-200 group-hover:bg-[var(--color-surface-1)]',
            tr: 'group transition-colors duration-200'
          }"
        >
          <template #rank-cell="{ row }">
            <span
              :class="['rank-badge', rankBadgeTier(getRankField(row.original, 'all'))]"
            >{{ getRankField(row.original, 'all') ?? '—' }}</span>
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
          <template #qsAll-cell="{ row }">
            <span
              :class="['rank-badge', rankBadgeTier(row.original.currentQsAllRank), rankBadgeTier(row.original.currentQsAllRank) === 'rank-badge--normal' ? 'opacity-70' : '']"
              :style="{ minWidth: '36px', height: '28px', fontSize: '13px' }"
            >{{ row.original.currentQsAllRank ?? '—' }}</span>
          </template>
          <template #qsCs-cell="{ row }">
            <span
              :class="['rank-badge', rankBadgeTier(row.original.currentQsComputerRank), rankBadgeTier(row.original.currentQsComputerRank) === 'rank-badge--normal' ? 'opacity-70' : '']"
              :style="{ minWidth: '36px', height: '28px', fontSize: '13px' }"
            >{{ row.original.currentQsComputerRank ?? '—' }}</span>
          </template>
          <template #usAll-cell="{ row }">
            <span
              :class="['rank-badge', rankBadgeTier(row.original.currentUsnewsAllRank), rankBadgeTier(row.original.currentUsnewsAllRank) === 'rank-badge--normal' ? 'opacity-70' : '']"
              :style="{ minWidth: '36px', height: '28px', fontSize: '13px' }"
            >{{ row.original.currentUsnewsAllRank ?? '—' }}</span>
          </template>
          <template #usCs-cell="{ row }">
            <span
              :class="['rank-badge', rankBadgeTier(row.original.currentUsnewsComputerRank), rankBadgeTier(row.original.currentUsnewsComputerRank) === 'rank-badge--normal' ? 'opacity-70' : '']"
              :style="{ minWidth: '36px', height: '28px', fontSize: '13px' }"
            >{{ row.original.currentUsnewsComputerRank ?? '—' }}</span>
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
            <div class="flex flex-col items-center justify-center gap-2 py-12 text-muted">
              <UIcon name="i-lucide-search-x" class="size-10" />
              <span class="text-sm">暂无数据</span>
            </div>
          </template>
          <template #loading>
            <div class="flex items-center justify-center py-10 text-muted">
              <UIcon name="i-lucide-loader-2" class="size-5 animate-spin" />
              <span class="ml-2 text-sm">加载中…</span>
            </div>
          </template>
        </UTable>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="border-t border-default px-4 py-3">
          <UPagination
            v-model:page="currentPage"
            :items-per-page="pageSize"
            :total="total"
            active-color="primary"
            show-first
            show-last
            @update:page="load"
          />
        </div>
      </UCard>
    </UContainer>
  </div>
</template>
