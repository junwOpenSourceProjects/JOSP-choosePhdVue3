<script setup lang="ts">
import { queryAllQs } from '~/lib/api/university'
import type { UniversityAllDTO, RankVariant } from '~/types'
import { RANK_VARIANT_SHORT_MAP } from '~/types'

useHead({ title: '学校库 · 选校系统' })

// ============ 状态 ============
const search = ref<string | undefined>(undefined)
const rankVariant = ref<RankVariant>('qs')      // qs / usnews / all
const tagState = ref<string | undefined>(undefined)  // 洲
const tag = ref<string | undefined>(undefined)       // 国家
const maxRank = ref<number>(100)                 // 排名上限
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
    const res = await queryAllQs({
      page: currentPage.value,
      limit: pageSize,
      rankVariant: rankVariant.value,
      universityTagsState: tagState.value,
      universityTags: tag.value,
      currentRank: maxRank.value
    }) as any
    const records = res?.records ?? res?.data?.records ?? []
    tableData.value = records
    total.value = res?.total ?? res?.data?.total ?? 0
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
  if (!search.value) return tableData.value
  const kw = search.value.toLowerCase()
  return tableData.value.filter(r => r.universityNameChinese?.toLowerCase().includes(kw))
})

const sortedData = computed(() => {
  const arr = [...filteredData.value]
  if (sortBy.value === 'rank') {
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
  rankVariant.value = 'qs'
  sortBy.value = 'rank'
  currentPage.value = 1
  load()
}

watch([rankVariant, tagState, tag, maxRank, sortBy], () => {
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
          <UFieldGroup size="md">
            <UButton
              v-for="v in rankVariantItems"
              :key="v.value"
              :color="rankVariant === v.value ? 'primary' : 'neutral'"
              :variant="rankVariant === v.value ? 'solid' : 'outline'"
              :label="v.label"
              size="md"
              @click="rankVariant = v.value"
            />
          </UFieldGroup>
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
          <USelectMenu
            v-model="sortBy"
            :items="sortByItems"
            value-key="value"
            size="md"
            class="min-w-[120px]"
          />
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
            td: 'py-3.5 text-sm'
          }"
        >
          <template #rank-cell="{ row }">
            <UBadge
              :color="rankBadgeColor(getRankField(row.original, 'all'))"
              :variant="rankBadgeVariant(getRankField(row.original, 'all'))"
              size="sm"
              variant="solid"
              :label="String(getRankField(row.original, 'all') ?? '—')"
            />
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
              <span v-if="row.original.universityTagsState" class="mt-0.5 text-[11px] text-subtle">{{ row.original.universityTagsState }}</span>
            </div>
          </template>
          <template #qsAll-cell="{ row }">
            <UBadge
              :color="rankBadgeColor(row.original.currentQsAllRank)"
              :variant="rankBadgeVariant(row.original.currentQsAllRank)"
              size="sm"
              variant="subtle"
              :label="String(row.original.currentQsAllRank ?? '—')"
              class="font-[var(--font-data)]"
            />
          </template>
          <template #qsCs-cell="{ row }">
            <UBadge
              :color="rankBadgeColor(row.original.currentQsComputerRank)"
              :variant="rankBadgeVariant(row.original.currentQsComputerRank)"
              size="sm"
              variant="subtle"
              :label="String(row.original.currentQsComputerRank ?? '—')"
              class="font-[var(--font-data)]"
            />
          </template>
          <template #usAll-cell="{ row }">
            <UBadge
              :color="rankBadgeColor(row.original.currentUsnewsAllRank)"
              :variant="rankBadgeVariant(row.original.currentUsnewsAllRank)"
              size="sm"
              variant="subtle"
              :label="String(row.original.currentUsnewsAllRank ?? '—')"
              class="font-[var(--font-data)]"
            />
          </template>
          <template #usCs-cell="{ row }">
            <UBadge
              :color="rankBadgeColor(row.original.currentUsnewsComputerRank)"
              :variant="rankBadgeVariant(row.original.currentUsnewsComputerRank)"
              size="sm"
              variant="subtle"
              :label="String(row.original.currentUsnewsComputerRank ?? '—')"
              class="font-[var(--font-data)]"
            />
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
