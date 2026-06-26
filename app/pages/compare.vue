<script setup lang="ts">
import type { RankingEntryVo, ShortlistItem, University } from '~/types'

useHead({ title: '院校对比' })

const $api = useApi()
const authStore = useAuthStore()
const shortlistStore = useShortlistStore()
const universitiesStore = useUniversitiesStore()
const { isRanked, rankValue, colorAt, buildTrendOption } = useRankingChart()
const { isCoreRanking } = useCoreRankings()

const query = ref('')
const searchResults = ref<University[]>([])
const searching = ref(false)

const selected = ref<University[]>([])
const rankingsMap = ref<Record<string, RankingEntryVo[]>>({})
const loadingRankings = ref(false)
const activeSource = ref<string>('')
const showAllSources = ref(false)

onMounted(() => {
  if (authStore.isLoggedIn) {
    shortlistStore.fetchShortlist()
  }
})

const searchUniversities = async () => {
  if (!query.value.trim()) return
  searching.value = true
  try {
    const res = await universitiesStore.searchUniversities({ keyword: query.value.trim(), page: 1, size: 10 })
    searchResults.value = res?.list || []
  } finally {
    searching.value = false
  }
}

const addUniversity = (uni: University) => {
  if (selected.value.find((u) => u.urlId === uni.urlId)) return
  if (selected.value.length >= 3) return
  selected.value.push(uni)
  fetchRankings(uni.urlId)
}

const removeUniversity = (urlId: string) => {
  selected.value = selected.value.filter((u) => u.urlId !== urlId)
  delete rankingsMap.value[urlId]
}

const fetchRankings = async (urlId: string) => {
  loadingRankings.value = true
  try {
    const res = await $api(`/api/v1/universities/${encodeURIComponent(urlId)}/rankings`, {
      query: { page: 1, size: 5000, overallOnly: true }
    })
    rankingsMap.value[urlId] = (res as { list: RankingEntryVo[] }).list || []
  } finally {
    loadingRankings.value = false
  }
}

const latestRankBySource = (urlId: string, sourceName: string) => {
  const list = rankingsMap.value[urlId] || []
  const entries = list.filter((r) => r.sourceName === sourceName)
  if (!entries.length) return '—'
  const [latest] = entries.sort((a, b) => b.year - a.year)
  if (!latest) return '—'
  const scoreText = latest.score != null ? ` · ${latest.score}` : ''
  return `${latest.rankDisplay} (${latest.year})${scoreText}`
}

const allSourceNames = computed(() => {
  const names = new Set<string>()
  Object.values(rankingsMap.value).forEach((list) => {
    list.forEach((r) => { if (r.sourceName) names.add(r.sourceName) })
  })
  return Array.from(names).sort()
})

const sourceNames = computed(() => {
  if (showAllSources.value) return allSourceNames.value
  return allSourceNames.value.filter((name) =>
    Object.values(rankingsMap.value).some((list) =>
      list.some((r) => r.sourceName === name && isCoreRanking(r))
    )
  )
})

watch(sourceNames, (names) => {
  if (names.length && !names.includes(activeSource.value)) {
    activeSource.value = names[0]!
  }
}, { immediate: true })

const compareChartOption = computed(() => {
  if (!activeSource.value || selected.value.length < 2) return null

  const allEntries = selected.value.flatMap((uni) => {
    const list = rankingsMap.value[uni.urlId] || []
    return list.filter((r) => r.sourceName === activeSource.value && isRanked(r))
  })

  if (!allEntries.length) return null

  const years = Array.from(new Set(allEntries.map((r) => r.year))).sort((a, b) => a - b)

  const series = selected.value.map((uni, idx) => {
    const data = years.map((year) => {
      const entry = allEntries.find((r) => r.year === year && r.universityId === uni.urlId)
      return entry ? rankValue(entry) : null
    })
    return { name: uni.nameZh, color: colorAt(idx), data }
  })

  return buildTrendOption(years, series)
})
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">院校对比</h1>
    <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">
      选择 2-3 所院校，横向对比各榜单排名。
    </p>

    <!-- Search -->
    <div class="max-w-2xl mb-[var(--spacing-xl)]">
      <div class="flex gap-[var(--spacing-md)]">
        <AppSearchPill v-model="query" class="flex-1" @search="searchUniversities" />
        <AppButton variant="primary" size="md" @click="searchUniversities">
          搜索
        </AppButton>
      </div>
      <div v-if="searchResults.length" class="mt-[var(--spacing-md)] card-base space-y-[var(--spacing-xs)]">
        <button
          v-for="uni in searchResults"
          :key="uni.urlId"
          type="button"
          class="w-full text-left px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-[var(--rounded-md)] hover:bg-[var(--color-surface-soft)] transition-colors"
          :disabled="selected.length >= 3 || selected.some((u) => u.urlId === uni.urlId)"
          @click="addUniversity(uni)"
        >
          <div class="body-sm-medium text-[var(--color-ink)]">{{ uni.nameZh }}</div>
          <div class="micro text-[var(--color-steel)]">{{ uni.nameEn }} · {{ uni.country }}</div>
        </button>
      </div>
      <div v-else-if="query && !searching" class="mt-[var(--spacing-md)] body-sm text-[var(--color-steel)]">
        无搜索结果
      </div>
    </div>

    <!-- Shortlist suggestions -->
    <div v-if="authStore.isLoggedIn && shortlistStore.items.length" class="mb-[var(--spacing-xl)]">
      <h3 class="heading-sm text-[var(--color-ink)] mb-[var(--spacing-md)]">从选校清单添加</h3>
      <div class="flex flex-wrap gap-[var(--spacing-xs)]">
        <button
          v-for="item in shortlistStore.items"
          :key="item.universityId"
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
          :class="selected.some((u) => u.urlId === item.universityId)
            ? 'bg-[var(--color-surface)] text-[var(--color-muted)] border-[var(--color-hairline)] cursor-not-allowed'
            : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
          :disabled="selected.length >= 3 || selected.some((u) => u.urlId === item.universityId)"
          @click="item.university && addUniversity(item.university)"
        >
          {{ item.university?.nameZh || item.universityId }}
        </button>
      </div>
    </div>

    <!-- Selected chips -->
    <div v-if="selected.length" class="flex flex-wrap gap-[var(--spacing-xs)] mb-[var(--spacing-xl)]">
      <div
        v-for="uni in selected"
        :key="uni.urlId"
        class="flex items-center gap-[var(--spacing-xs)] px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] bg-[var(--color-primary)] text-[var(--color-on-primary)] body-sm-medium"
      >
        {{ uni.nameZh }}
        <button type="button" class="hover:opacity-70" @click="removeUniversity(uni.urlId)">×</button>
      </div>
    </div>

    <!-- Comparison chart -->
    <div v-if="selected.length >= 2 && sourceNames.length" class="mb-[var(--spacing-xl)]">
      <div class="flex flex-wrap items-center gap-[var(--spacing-xs)] mb-[var(--spacing-md)]">
        <button
          v-for="source in sourceNames"
          :key="source"
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
          :class="activeSource === source
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
          @click="activeSource = source"
        >
          {{ source }}
        </button>
        <button
          type="button"
          class="ml-auto px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
          :class="showAllSources
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
          @click="showAllSources = !showAllSources"
        >
          {{ showAllSources ? '仅看核心' : '查看全部' }}
        </button>
      </div>
      <div v-if="compareChartOption" class="card-base">
        <LazyChartVChart :option="compareChartOption" height="360px" />
      </div>
      <div v-else class="card-base text-center py-[var(--spacing-xl)] text-[var(--color-steel)]">
        该榜单暂无足够排名数据绘制趋势
      </div>
    </div>

    <!-- Comparison table -->
    <div v-if="selected.length" class="overflow-x-auto">
      <table class="data-table min-w-[600px]">
        <thead>
          <tr>
            <th class="data-table-header px-[var(--spacing-md)] py-[var(--spacing-sm)] text-left">榜单 / 维度</th>
            <th
              v-for="uni in selected"
              :key="uni.urlId"
              class="data-table-header px-[var(--spacing-md)] py-[var(--spacing-sm)] text-left"
            >
              {{ uni.nameZh }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-[var(--color-hairline-soft)]">
            <td class="px-[var(--spacing-md)] py-[var(--spacing-md)] body-sm-medium text-[var(--color-charcoal)]">国家</td>
            <td v-for="uni in selected" :key="uni.urlId" class="px-[var(--spacing-md)] py-[var(--spacing-md)] body-sm text-[var(--color-ink)]">
              {{ uni.country || '—' }}
            </td>
          </tr>
          <tr class="border-b border-[var(--color-hairline-soft)]">
            <td class="px-[var(--spacing-md)] py-[var(--spacing-md)] body-sm-medium text-[var(--color-charcoal)]">地区</td>
            <td v-for="uni in selected" :key="uni.urlId" class="px-[var(--spacing-md)] py-[var(--spacing-md)] body-sm text-[var(--color-ink)]">
              {{ uni.region || '—' }}
            </td>
          </tr>
          <tr v-for="source in sourceNames" :key="source" class="border-b border-[var(--color-hairline-soft)]">
            <td class="px-[var(--spacing-md)] py-[var(--spacing-md)] body-sm-medium text-[var(--color-charcoal)]">{{ source }}</td>
            <td v-for="uni in selected" :key="uni.urlId" class="px-[var(--spacing-md)] py-[var(--spacing-md)] body-sm text-[var(--color-ink)]">
              {{ latestRankBySource(uni.urlId, source) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="card-base text-center py-[var(--spacing-section)] text-[var(--color-steel)]">
      请选择至少一所院校开始对比
    </div>
  </div>
</template>
