<script setup lang="ts">
import type { PageResult, RankingEntryVo, RankingSource } from '~/types'

const localePath = useLocalePath()
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const rankingsStore = useRankingsStore()
const { isRanked, rankValue, colorAt, buildTopBarOption, buildTrendOption } = useRankingChart()

const id = computed(() => Number(route.params.id))

const source = ref<RankingSource | null>(null)
const entries = ref<PageResult<RankingEntryVo> | null>(null)
const loading = ref(false)
const hasAutoSetYear = ref(false)
const sourceYears = ref<number[]>([])
const trendLoading = ref(false)
const trendEntries = ref<Record<number, RankingEntryVo[]>>({})
const trendCacheKey = ref('')

type ViewSize = 20 | 50 | 100 | 'all'
const viewSizes: { label: string; value: ViewSize }[] = [
  { label: 'Top 20', value: 20 },
  { label: 'Top 50', value: 50 },
  { label: 'Top 100', value: 100 },
  { label: t('rankings.all'), value: 'all' }
]

const viewSize = computed({
  get: () => {
    const v = route.query.size as string
    if (v === 'all') return 'all'
    const n = Number(v)
    return [20, 50, 100].includes(n) ? (n as ViewSize) : 20
  },
  set: (v) => router.push({ query: { ...route.query, size: String(v), page: undefined } })
})

const page = computed({
  get: () => Number(route.query.page) || 1,
  set: (v) => router.push({ query: { ...route.query, page: v } })
})

const year = computed({
  get: () => (route.query.year as string) || '',
  set: (v) => router.push({ query: { ...route.query, year: v || undefined, page: undefined } })
})

const loadSourceYears = async () => {
  if (!id.value) return
  sourceYears.value = await rankingsStore.fetchSourceYears(id.value)
}

const fetchAll = async () => {
  if (!id.value) return
  loading.value = true
  try {
    const s = await rankingsStore.fetchSource(id.value)
    source.value = s

    const baseParams = {
      ...(year.value ? { year: year.value } : {})
    }

    if (viewSize.value === 'all') {
      const all: RankingEntryVo[] = []
      let pageNum = 1
      const batchSize = 200
      let total = 0
      const maxPages = 500
      do {
        const res = await rankingsStore.fetchEntries(id.value, {
          ...baseParams,
          page: pageNum,
          size: batchSize
        })
        all.push(...(res.list || []))
        total = res.total
        pageNum++
      } while (all.length < total && pageNum <= maxPages)
      entries.value = {
        list: all,
        total,
        page: 1,
        size: total,
        pages: 1
      }
    } else {
      const res = await rankingsStore.fetchEntries(id.value, {
        ...baseParams,
        page: page.value,
        size: viewSize.value
      })
      entries.value = res
    }

    // Auto-select the latest year on first load if no year is specified
    if (!hasAutoSetYear.value && !route.query.year && sourceYears.value.length) {
      hasAutoSetYear.value = true
      router.push({ query: { ...route.query, year: String(sourceYears.value[0]) } })
    }
  } finally {
    loading.value = false
  }
}

const fetchTrendData = async () => {
  if (!id.value || !sourceYears.value.length || !entries.value?.list.length) return
  const topIds = entries.value.list.slice(0, 10).map((e) => e.universityId).filter(Boolean)
  if (!topIds.length) return

  const cacheKey = `${id.value}:${topIds.join(',')}`
  if (trendCacheKey.value === cacheKey) return
  trendCacheKey.value = cacheKey

  trendLoading.value = true
  try {
    const topIdSet = new Set(topIds)
    const results = await Promise.all(
      sourceYears.value.map(async (y) => {
        const res = await rankingsStore.fetchEntries(id.value!, {
          year: String(y),
          page: 1,
          size: 200
        })
        return { year: y, list: (res.list || []).filter((e) => topIdSet.has(e.universityId)) }
      })
    )
    trendEntries.value = Object.fromEntries(results.map((r) => [r.year, r.list]))
  } finally {
    trendLoading.value = false
  }
}

watch(() => id.value, () => {
  hasAutoSetYear.value = false
  sourceYears.value = []
  trendEntries.value = {}
  trendCacheKey.value = ''
  loadSourceYears()
}, { immediate: true })

watch([() => id.value, year, page, viewSize], fetchAll, { immediate: true })

watch([() => entries.value?.list, () => sourceYears.value.length], fetchTrendData, { immediate: true })

useHead({ title: () => source.value ? `${source.value.nameZh} · ${t('rankings.detail')}` : t('rankings.detail') })

const columns = computed(() => {
  const base = [
    { key: 'rankDisplay', label: t('rankings.rankColumn'), align: 'left' as const },
    { key: 'universityNameZh', label: t('rankings.universityColumn'), align: 'left' as const },
    { key: 'country', label: t('rankings.countryColumn'), align: 'left' as const }
  ]
  if (source.value?.ownerOrg === 'CSR') {
    base.push({ key: 'score', label: t('rankings.scoreColumn'), align: 'left' as const })
  }
  base.push({ key: 'rankDelta', label: t('rankings.rankDeltaColumn'), align: 'left' as const })
  return base
})

const deltaText = (row: RankingEntryVo | Record<string, any>) => {
  const delta = (row as RankingEntryVo).rankDelta
  if (!delta || delta === 0) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}`
}

const chartLimit = computed(() => (viewSize.value === 'all' ? 100 : viewSize.value))

const chartOption = computed(() => {
  const list = (entries.value?.list || []).filter(isRanked).slice(0, chartLimit.value)
  if (!list.length) return null
  const names = list.map((r) => r.universityNameZh || r.universityNameEn || '—')
  const ranks = list.map((r) => r.rankValue!)
  return buildTopBarOption(names, ranks)
})

const chartHeight = computed(() => `${Math.max(420, chartLimit.value * 18 + 80)}px`)

const trendOption = computed(() => {
  const topList = (entries.value?.list || []).slice(0, 10).filter(isRanked)
  const years = [...sourceYears.value].sort((a, b) => a - b)
  if (!topList.length || years.length < 2) return null

  const series = topList.map((entry, idx) => {
    const data = years.map((y) => {
      const match = trendEntries.value[y]?.find(
        (e) => e.universityId === entry.universityId && e.subjectId === entry.subjectId
      )
      return match ? rankValue(match) : null
    })
    return {
      name: entry.universityNameZh || entry.universityNameEn || '—',
      color: colorAt(idx),
      data
    }
  })

  return buildTrendOption(years, series)
})
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <div v-if="loading && !source" class="space-y-[var(--spacing-md)]">
      <div class="h-10 w-1/3 bg-[var(--color-surface)] rounded-[var(--rounded-md)] animate-pulse" />
      <div class="h-8 w-1/4 bg-[var(--color-surface)] rounded-[var(--rounded-md)] animate-pulse" />
    </div>
    <div v-else-if="!source" class="card-base text-center py-[var(--spacing-section)] text-[var(--color-steel)]">
      {{ $t('rankings.notFound') }}
    </div>
    <template v-else>
      <div class="mb-[var(--spacing-xl)]">
        <NuxtLink :to="localePath('/rankings')" class="body-sm text-[var(--color-steel)] hover:text-[var(--color-ink)]">
          {{ $t('rankings.backToList') }}
        </NuxtLink>
        <h1 class="heading-lg text-[var(--color-ink)] mt-[var(--spacing-sm)]">{{ source.nameZh }}</h1>
        <p class="body-sm text-[var(--color-steel)]">{{ source.nameEn }} · {{ source.ownerOrg }}</p>
      </div>

      <!-- Year selector and view size -->
      <div class="flex flex-wrap items-center justify-between gap-[var(--spacing-md)] mb-[var(--spacing-xl)]">
        <div class="flex flex-wrap items-center gap-[var(--spacing-xs)]">
          <button
            type="button"
            class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
            :class="!year
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
              : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
            @click="year = ''"
          >
            {{ $t('rankings.allYears') }}
          </button>
          <button
            v-for="y in sourceYears"
            :key="y"
            type="button"
            class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
            :class="year === String(y)
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
              : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
            @click="year = String(y)"
          >
            {{ y }}
          </button>
        </div>
        <div class="flex items-center gap-[var(--spacing-xs)] border border-[var(--color-hairline)] rounded-[var(--rounded-full)] p-[2px]">
          <button
            v-for="opt in viewSizes"
            :key="String(opt.value)"
            type="button"
            class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] body-sm-medium transition-colors"
            :class="viewSize === opt.value
              ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
              : 'text-[var(--color-steel)] hover:text-[var(--color-ink)]'"
            @click="viewSize = opt.value"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Top N chart -->
      <div v-if="chartOption" class="card-base mb-[var(--spacing-xl)]">
        <h3 class="heading-sm text-[var(--color-ink)] mb-[var(--spacing-md)]">{{ $t('rankings.topN', { n: chartLimit }) }}</h3>
        <LazyChartVChart :option="chartOption" :height="chartHeight" />
      </div>

      <!-- Historical trend chart -->
      <div v-if="trendOption" class="card-base mb-[var(--spacing-xl)]">
        <h3 class="heading-sm text-[var(--color-ink)] mb-[var(--spacing-md)]">{{ $t('rankings.historicalTrend') }}</h3>
        <LazyChartVChart :option="trendOption" height="420px" />
      </div>

      <!-- Table -->
      <AppDataTable :columns="columns" :rows="entries?.list || []" :loading="loading">
        <template #universityNameZh="{ row }">
          <NuxtLink :to="localePath(`/universities/${row.universityId}`)" class="body-sm-medium text-[var(--color-ink)] hover:underline">
            {{ row.universityNameZh || row.universityNameEn || '—' }}
          </NuxtLink>
        </template>
        <template #score="{ row }">
          <span class="body-sm text-[var(--color-ink)]">{{ row.score != null ? Number(row.score).toFixed(3) : '—' }}</span>
        </template>
        <template #rankDelta="{ row }">
          <span
            class="caption-bold"
            :class="{
              'text-[var(--color-success-text)]': row.rankDelta && row.rankDelta < 0,
              'text-[var(--color-error)]': row.rankDelta && row.rankDelta > 0,
              'text-[var(--color-steel)]': !row.rankDelta || row.rankDelta === 0
            }"
          >
            {{ deltaText(row) }}
          </span>
        </template>
      </AppDataTable>

      <!-- Pagination -->
      <div v-if="viewSize !== 'all' && (entries?.pages || 1) > 1" class="flex items-center justify-center gap-[var(--spacing-md)] mt-[var(--spacing-xl)]">
        <AppButton variant="tertiary" size="sm" :disabled="page <= 1" @click="page = page - 1">
          {{ $t('common.previousPage') }}
        </AppButton>
        <span class="body-sm text-[var(--color-steel)]">{{ page }} / {{ entries?.pages }}</span>
        <AppButton variant="tertiary" size="sm" :disabled="page >= (entries?.pages || 1)" @click="page = page + 1">
          {{ $t('common.nextPage') }}
        </AppButton>
      </div>
    </template>
  </div>
</template>
