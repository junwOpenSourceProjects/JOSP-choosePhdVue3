<script setup lang="ts">
import type { PageResult, RankingEntryVo, ShortlistItem, University, UniversityDetail, UniversitySourceSummary } from '~/types'

const route = useRoute()
const router = useRouter()
const $api = useApi()
const authStore = useAuthStore()
const shortlistStore = useShortlistStore()
const { isRanked, rankValue, colorAt, buildTrendOption } = useRankingChart()
const { isCoreRanking } = useCoreRankings()

const urlId = computed(() => String(route.params.urlId))

const activeTab = computed({
  get: () => (route.query.tab as string) || 'rankings',
  set: (v) => router.push({ query: { ...route.query, tab: v } })
})

const { data: detail, pending: uniPending } = await useAsyncData<UniversityDetail>(
  () => `university-${urlId.value}`,
  () => $api<UniversityDetail>(`/api/v1/universities/${encodeURIComponent(urlId.value)}`),
  { server: true, watch: [urlId] }
)

const university = computed(() => detail.value?.university || null)
const sources = computed(() => detail.value?.sources || [])

const rankings = ref<RankingEntryVo[]>([])
const rankingsLoading = ref(false)
const showSubjects = ref(false)
const showAllSources = ref(false)

const fetchRankings = async () => {
  rankingsLoading.value = true
  try {
    const all: RankingEntryVo[] = []
    const pageSize = 500
    let page = 1
    let total = 0
    do {
      const res = await $api<PageResult<RankingEntryVo>>(`/api/v1/universities/${encodeURIComponent(urlId.value)}/rankings`, {
        query: { page, size: pageSize }
      })
      all.push(...(res.list || []))
      total = res.total
      page++
    } while (all.length < total)
    rankings.value = all
  } finally {
    rankingsLoading.value = false
  }
}

watch(urlId, fetchRankings, { immediate: true })

useHead({ title: () => university.value ? `${university.value.nameZh} · 院校详情` : '院校详情' })

const columns = [
  { key: 'sourceName', label: '榜单', align: 'left' as const },
  { key: 'subjectName', label: '学科', align: 'left' as const },
  { key: 'year', label: '年份', align: 'left' as const },
  { key: 'rankDisplay', label: '排名', align: 'left' as const },
  { key: 'rankDelta', label: '变化', align: 'left' as const }
]

const filteredRankings = computed(() => {
  let list = rankings.value
  if (!showSubjects.value) {
    list = list.filter((r) => r.subjectId == null)
  }
  if (!showAllSources.value) {
    list = list.filter((r) => isCoreRanking(r))
  }
  return list
})

const deltaText = (row: RankingEntryVo | Record<string, any>) => {
  const delta = (row as RankingEntryVo).rankDelta
  if (!delta || delta === 0) return '—'
  const sign = delta > 0 ? '+' : ''
  return `${sign}${delta}`
}

const seriesKey = (r: RankingEntryVo) => {
  const base = r.sourceName || '未知榜单'
  return r.subjectName ? `${base} · ${r.subjectName}` : base
}

const trendChartOption = computed(() => {
  const list = filteredRankings.value
  const ranked = list.filter(isRanked)
  if (!ranked.length) return null

  const years = Array.from(new Set(ranked.map((r) => r.year))).sort((a, b) => a - b)
  const keys = Array.from(new Set(ranked.map(seriesKey)))

  const series = keys.map((name, idx) => {
    const data = years.map((year) => {
      const entry = ranked.find((r) => r.year === year && seriesKey(r) === name)
      return entry ? rankValue(entry) : null
    })
    return { name, color: colorAt(idx), data }
  })

  return buildTrendOption(years, series)
})

// Shortlist form
const priority = ref<number>(2)
const note = ref('')
const submitting = ref(false)
const submitted = ref(false)

const priorityOptions = [
  { value: 1, label: '1 · 强意向' },
  { value: 2, label: '2 · 中意向' },
  { value: 3, label: '3 · 弱意向' },
  { value: 4, label: '4 · 不考虑' }
]

const submitShortlist = async () => {
  if (!university.value) return
  if (!authStore.isLoggedIn) {
    await navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath))
    return
  }
  submitting.value = true
  try {
    await shortlistStore.addToShortlist({
      universityId: university.value.urlId,
      priority: priority.value,
      note: note.value
    })
    submitted.value = true
    note.value = ''
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <div v-if="uniPending" class="space-y-[var(--spacing-md)]">
      <div class="h-10 w-1/3 bg-[var(--color-surface)] rounded-[var(--rounded-md)] animate-pulse" />
      <div class="h-6 w-1/4 bg-[var(--color-surface)] rounded-[var(--rounded-md)] animate-pulse" />
    </div>
    <div v-else-if="!university" class="card-base text-center py-[var(--spacing-section)] text-[var(--color-steel)]">
      院校不存在
    </div>
    <template v-else>
      <div class="mb-[var(--spacing-xl)]">
        <NuxtLink to="/universities" class="body-sm text-[var(--color-steel)] hover:text-[var(--color-ink)]">
          ← 返回院校库
        </NuxtLink>
        <h1 class="heading-lg text-[var(--color-ink)] mt-[var(--spacing-sm)]">{{ university.nameZh }}</h1>
        <p class="subtitle text-[var(--color-steel)]">{{ university.nameEn }}</p>
        <div class="flex gap-[var(--spacing-xs)] mt-[var(--spacing-md)]">
          <AppBadge variant="code" :label="university.country || '—'" />
          <AppBadge variant="beta" :label="university.region || '—'" />
        </div>

        <!-- Basic info -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-[var(--spacing-md)] mt-[var(--spacing-lg)]">
          <div v-if="university.foundedDate" class="body-sm text-[var(--color-charcoal)]">
            <span class="text-[var(--color-steel)]">建校时间：</span>
            <span class="font-medium">{{ university.foundedDate }}</span>
          </div>
          <div v-if="university.website" class="body-sm text-[var(--color-charcoal)]">
            <span class="text-[var(--color-steel)]">官网：</span>
            <NuxtLink
              :to="university.website"
              target="_blank"
              external
              class="font-medium text-[var(--color-primary)] hover:underline break-all"
            >
              {{ university.website }}
            </NuxtLink>
          </div>
          <div v-if="university.motto" class="body-sm text-[var(--color-charcoal)] sm:col-span-2">
            <span class="text-[var(--color-steel)]">校训：</span>
            <span class="font-medium">{{ university.motto }}</span>
          </div>
          <div v-if="university.address" class="body-sm text-[var(--color-charcoal)] sm:col-span-2">
            <span class="text-[var(--color-steel)]">地址：</span>
            <span class="font-medium">{{ university.address }}</span>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-[var(--spacing-xs)] border-b border-[var(--color-hairline)] mb-[var(--spacing-xl)]">
        <button
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-md)] body-sm-medium transition-colors border-b-2"
          :class="activeTab === 'rankings'
            ? 'text-[var(--color-ink)] border-[var(--color-ink)]'
            : 'text-[var(--color-steel)] border-transparent hover:text-[var(--color-ink)]'"
          @click="activeTab = 'rankings'"
        >
          排名历史
        </button>
        <button
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-md)] body-sm-medium transition-colors border-b-2"
          :class="activeTab === 'shortlist'
            ? 'text-[var(--color-ink)] border-[var(--color-ink)]'
            : 'text-[var(--color-steel)] border-transparent hover:text-[var(--color-ink)]'"
          @click="activeTab = 'shortlist'"
        >
          加入清单
        </button>
      </div>

      <!-- Rankings tab -->
      <div v-if="activeTab === 'rankings'" class="space-y-[var(--spacing-xl)]">
        <div v-if="trendChartOption" class="card-base">
          <div class="flex items-center justify-between mb-[var(--spacing-md)]">
            <h3 class="heading-sm text-[var(--color-ink)]">排名趋势</h3>
            <div class="flex gap-[var(--spacing-xs)]">
              <button
                type="button"
                class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
                :class="showAllSources
                  ? 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'
                  : 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'"
                @click="showAllSources = false"
              >
                核心榜单
              </button>
              <button
                type="button"
                class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
                :class="showAllSources
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
                  : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
                @click="showAllSources = true"
              >
                全部榜单
              </button>
              <button
                type="button"
                class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
                :class="showSubjects
                  ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
                  : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
                @click="showSubjects = !showSubjects"
              >
                {{ showSubjects ? '包含学科' : '只看综合' }}
              </button>
            </div>
          </div>
          <LazyChartVChart :option="trendChartOption" height="360px" />
        </div>
        <AppDataTable :columns="columns" :rows="filteredRankings" :loading="rankingsLoading">
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
      </div>

      <!-- Shortlist tab -->
      <AppCard v-else variant="feature">
        <h3 class="heading-sm text-[var(--color-ink)] mb-[var(--spacing-md)]">加入选校清单</h3>
        <form class="space-y-[var(--spacing-md)] max-w-xl" @submit.prevent="submitShortlist">
          <div>
            <label class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">意向优先级</label>
            <select v-model="priority" class="text-input">
              <option v-for="opt in priorityOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>
          <div>
            <label class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">备注</label>
            <textarea
              v-model="note"
              rows="4"
              class="text-input h-auto py-[var(--spacing-md)]"
              placeholder="记录你的选校理由、导师方向或申请进度…"
            />
          </div>
          <div class="flex items-center gap-[var(--spacing-md)]">
            <AppButton variant="primary" type="submit" :disabled="submitting">
              {{ submitting ? '提交中…' : '加入清单' }}
            </AppButton>
            <AppBadge v-if="submitted" variant="success" label="已添加" />
          </div>
        </form>
      </AppCard>
    </template>
  </div>
</template>
