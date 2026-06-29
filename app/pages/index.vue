<script setup lang="ts">
import type { PageResult, RankingEntryVo, RankingSource, StatsOverview } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()

useHead({ title: t('home.title') })
useOrganizationJsonLd()
useWebSiteJsonLd()

const $api = useApi()
const rankingsStore = useRankingsStore()
const { isRanked } = useRankingChart()

const { data: stats, pending: statsLoading } = await useAsyncData<StatsOverview>(
  'stats-overview',
  () => $api<StatsOverview>('/api/v1/stats/overview'),
  { server: true }
)

const { data: featuredSources, pending: featuredLoading } = await useAsyncData<RankingSource[]>(
  'featured-rankings',
  async () => {
    const res = await $api<PageResult<RankingSource>>('/api/v1/sources', {
      query: { kind: 1, page: 1, size: 10 }
    })
    return res.list.slice(0, 4)
  },
  { server: true }
)

const { data: topUniversities, pending: topLoading } = await useAsyncData<RankingEntryVo[]>(
  'top-universities',
  async () => {
    const sources = await $api<PageResult<RankingSource>>('/api/v1/sources', {
      query: { kind: 1, page: 1, size: 20 }
    })
    const worldSources = sources.list.filter((s) => s.slug.toLowerCase().includes('world'))
    for (const source of worldSources) {
      const res = await $api<PageResult<RankingEntryVo>>(`/api/v1/sources/${source.id}/entries`, {
        query: { page: 1, size: 50 }
      })
      const ranked = res.list.filter(isRanked)
      if (ranked.length) {
        return ranked.slice(0, 10)
      }
    }
    return []
  },
  { server: true }
)

const statItems = computed(() => {
  const s = stats.value
  if (!s) return []
  return [
    { value: s.universityCount.toLocaleString(), label: t('home.statsUniversities') },
    { value: s.rankingEntryCount.toLocaleString(), label: t('home.statsRankings') },
    { value: s.rankingSourceCount.toLocaleString(), label: t('home.statsSources') },
    { value: s.subjectCount.toLocaleString(), label: t('home.statsSubjects') }
  ]
})

const colorForSource = (source: RankingSource): 'coral' | 'magenta' | 'blue' | 'purple' => {
  const key = `${source.slug}-${source.ownerOrg}`.toLowerCase()
  if (key.includes('qs')) return 'coral'
  if (key.includes('the')) return 'magenta'
  if (key.includes('arwu') || key.includes('shanghai')) return 'blue'
  return 'purple'
}

const quickEntries = [
  { to: '/universities', title: t('universities.title'), desc: '浏览全球大学' },
  { to: '/rankings', title: t('rankings.title'), desc: '查看权威排名' },
  { to: '/subjects', title: t('subjects.title'), desc: '按学科选项目' },
  { to: '/shortlist', title: t('shortlist.title'), desc: '管理目标院校' }
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-[var(--color-canvas)] pt-[var(--spacing-hero)] pb-[var(--spacing-section)]">
      <div class="container-page text-center">
        <div class="caption text-[var(--color-steel)] uppercase tracking-wider mb-[var(--spacing-md)]">
          {{ $t('home.subtitle') }}
        </div>
        <h1 class="hero-display text-[var(--color-ink)] mb-[var(--spacing-lg)]">
          {{ $t('home.hero') }}
        </h1>
        <p class="subtitle text-[var(--color-steel)] max-w-2xl mx-auto mb-[var(--spacing-xl)]">
          {{ $t('home.heroSub') }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-[var(--spacing-md)]">
          <AppButton variant="primary" :to="localePath('/universities')">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            {{ $t('home.ctaBrowse') }}
          </AppButton>
          <AppButton variant="secondary" :to="localePath('/rankings')">
            {{ $t('home.ctaCompare') }}
          </AppButton>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <AppSection class="bg-[var(--color-surface)]">
      <div v-if="statsLoading" class="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-md)]">
        <div v-for="i in 4" :key="i" class="card-base h-32 animate-pulse" />
      </div>
      <StatsRow v-else :stats="statItems" />
    </AppSection>

    <!-- Featured rankings -->
    <AppSection>
      <div class="flex items-end justify-between mb-[var(--spacing-xl)]">
        <h2 class="heading-md text-[var(--color-ink)]">{{ $t('home.featuredRankings') }}</h2>
        <NuxtLink :to="localePath('/rankings')" class="body-sm-medium text-[var(--color-charcoal)] hover:text-[var(--color-ink)]">
          {{ $t('common.search') }} →
        </NuxtLink>
      </div>
      <div v-if="featuredLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-md)]">
        <div v-for="i in 4" :key="i" class="card-base h-72 animate-pulse" />
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-md)]">
        <AppProductCard
          v-for="source in featuredSources"
          :key="source.id"
          :color="colorForSource(source)"
          :title="source.nameZh"
          :tagline="source.ownerOrg"
          :to="localePath(`/rankings/${source.id}`)"
        />
      </div>
    </AppSection>

    <!-- Top universities -->
    <AppSection class="bg-[var(--color-surface)]">
      <div class="flex items-end justify-between mb-[var(--spacing-xl)]">
        <h2 class="heading-md text-[var(--color-ink)]">{{ $t('home.topUniversities') }}</h2>
        <NuxtLink :to="localePath('/rankings')" class="body-sm-medium text-[var(--color-charcoal)] hover:text-[var(--color-ink)]">
          {{ $t('common.search') }} →
        </NuxtLink>
      </div>
      <div v-if="topLoading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[var(--spacing-md)]">
        <div v-for="i in 10" :key="i" class="card-base h-28 animate-pulse" />
      </div>
      <div v-else-if="!topUniversities?.length" class="card-base text-center py-[var(--spacing-section)] text-[var(--color-steel)]">
        {{ $t('common.noData') }}
      </div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-[var(--spacing-md)]">
        <NuxtLink
          v-for="(entry, idx) in topUniversities"
          :key="entry.id"
          :to="localePath(`/universities/${entry.universityId}`)"
          class="card-base hover:border-[var(--color-ink)] transition-colors"
        >
          <div class="flex items-center gap-[var(--spacing-sm)] mb-2">
            <span class="display-lg text-[var(--color-brand-blue-deep)] leading-none">#{{ idx + 1 }}</span>
            <span class="caption text-[var(--color-steel)]">{{ entry.year }}</span>
          </div>
          <h3 class="card-title text-[var(--color-ink)] line-clamp-2">{{ entry.universityNameZh || entry.universityNameEn }}</h3>
          <p class="body-sm text-[var(--color-steel)] mt-1">{{ entry.country || '—' }}</p>
        </NuxtLink>
      </div>
    </AppSection>

    <!-- Quick entries -->
    <AppSection>
      <h2 class="heading-md text-[var(--color-ink)] mb-[var(--spacing-xl)]">{{ $t('home.quickEntry') }}</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[var(--spacing-md)]">
        <NuxtLink
          v-for="entry in quickEntries"
          :key="entry.to"
          :to="localePath(entry.to)"
          class="card-base hover:border-[var(--color-ink)] transition-colors"
        >
          <h3 class="card-title text-[var(--color-ink)] mb-2">{{ entry.title }}</h3>
          <p class="body-sm text-[var(--color-steel)]">{{ entry.desc }}</p>
        </NuxtLink>
      </div>
    </AppSection>
  </div>
</template>
