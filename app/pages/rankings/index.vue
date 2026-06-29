<script setup lang="ts">
import type { PageResult, RankingSource } from '~/types'

const { t } = useI18n()
const localePath = useLocalePath()

useHead({ title: () => t('rankings.title') })

const $api = useApi()
const route = useRoute()
const router = useRouter()

const tabs = computed(() => [
  { label: t('rankings.all'), value: '' },
  { label: t('rankings.comprehensive'), value: '1' },
  { label: t('rankings.regional'), value: '2' },
  { label: t('rankings.subject'), value: '3' },
  { label: t('rankings.trend'), value: '4' }
])

const kindLabel = (kind: number) => {
  if (kind === 1) return t('rankings.comprehensive')
  if (kind === 2) return t('rankings.regional')
  if (kind === 3) return t('rankings.subject')
  if (kind === 4) return t('rankings.trend')
  return t('rankings.other')
}

const layout = ref<'table' | 'card'>('table')

const kind = computed({
  get: () => (route.query.kind as string) || '',
  set: (v) => router.push({ query: { ...route.query, kind: v || undefined, page: undefined } })
})

const page = computed({
  get: () => Number(route.query.page) || 1,
  set: (v) => router.push({ query: { ...route.query, page: v } })
})

const pageSize = 12

const { data: result, pending, refresh } = await useAsyncData<PageResult<RankingSource>>(
  () => `rankings-sources-${kind.value}-${page.value}`,
  () => $api<PageResult<RankingSource>>('/api/v1/sources', {
    query: {
      ...(kind.value ? { kind: kind.value } : {}),
      page: page.value,
      size: pageSize
    }
  }),
  { server: true, watch: [kind, page] }
)

const totalPages = computed(() => result.value ? Math.max(1, Math.ceil(result.value.total / pageSize)) : 1)

const colorForSource = (source: RankingSource, idx: number): 'coral' | 'magenta' | 'blue' | 'purple' => {
  const key = `${source.slug}-${source.ownerOrg}`.toLowerCase()
  if (key.includes('qs')) return 'coral'
  if (key.includes('the')) return 'magenta'
  if (key.includes('arwu') || key.includes('shanghai')) return 'blue'
  if (key.includes('usnews')) return 'purple'
  const colors: Array<'coral' | 'magenta' | 'blue' | 'purple'> = ['coral', 'magenta', 'blue', 'purple']
  return colors[idx % colors.length] || 'purple'
}

const columns = computed(() => [
  { key: 'nameZh', label: t('rankings.sourceName'), align: 'left' as const },
  { key: 'ownerOrg', label: t('rankings.ownerOrg'), align: 'left' as const },
  { key: 'kind', label: t('rankings.kind'), align: 'left' as const }
])

const sourceDisplay = (source: RankingSource) => {
  if (source.nameZh && source.nameEn) {
    return { primary: source.nameZh, secondary: source.nameEn }
  }
  return { primary: source.nameZh || source.nameEn || '—', secondary: '' }
}
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">{{ $t('rankings.title') }}</h1>
    <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">
      {{ $t('rankings.subtitle') }}
    </p>

    <!-- Tabs and layout toggle -->
    <div class="flex flex-wrap items-center justify-between gap-[var(--spacing-md)] mb-[var(--spacing-xl)]">
      <div class="flex flex-wrap gap-[var(--spacing-xs)]">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
          :class="kind === tab.value
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
          @click="kind = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
      <div class="flex items-center gap-[var(--spacing-xs)] border border-[var(--color-hairline)] rounded-[var(--rounded-full)] p-[2px]">
        <button
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] body-sm-medium transition-colors"
          :class="layout === 'table'
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
            : 'text-[var(--color-steel)] hover:text-[var(--color-ink)]'"
          @click="layout = 'table'"
        >
          表格
        </button>
        <button
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] body-sm-medium transition-colors"
          :class="layout === 'card'
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)]'
            : 'text-[var(--color-steel)] hover:text-[var(--color-ink)]'"
          @click="layout = 'card'"
        >
          卡片
        </button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
      <div v-for="i in pageSize" :key="i" class="card-base h-64 animate-pulse" />
    </div>
    <div v-else-if="!result?.list.length" class="card-base text-center py-[var(--spacing-section)] text-[var(--color-steel)]">
      {{ $t('rankings.noData') }}
    </div>

    <!-- Table -->
    <div v-else-if="layout === 'table'" class="overflow-x-auto">
      <table class="data-table min-w-[600px]">
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="data-table-header px-[var(--spacing-md)] py-[var(--spacing-sm)] text-left"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="source in result.list"
            :key="source.id"
            class="border-b border-[var(--color-hairline-soft)] hover:bg-[var(--color-surface-soft)] transition-colors"
          >
            <td class="px-[var(--spacing-md)] py-[var(--spacing-md)]">
              <NuxtLink
                :to="localePath(`/rankings/${source.id}`)"
                class="block body-sm-medium text-[var(--color-ink)] hover:underline"
              >
                {{ sourceDisplay(source).primary }}
              </NuxtLink>
              <span v-if="sourceDisplay(source).secondary" class="mt-[2px] block micro text-[var(--color-steel)]">
                {{ sourceDisplay(source).secondary }}
              </span>
            </td>
            <td class="px-[var(--spacing-md)] py-[var(--spacing-md)] body-sm text-[var(--color-ink)]">
              {{ source.ownerOrg || '—' }}
            </td>
            <td class="px-[var(--spacing-md)] py-[var(--spacing-md)]">
              <span class="inline-flex px-[var(--spacing-sm)] py-[2px] rounded-[var(--rounded-full)] bg-[var(--color-surface)] text-[var(--color-steel)] body-xs-medium">
                {{ kindLabel(source.kind) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
      <AppProductCard
        v-for="(source, idx) in result.list"
        :key="source.id"
        :color="colorForSource(source, idx)"
        :title="sourceDisplay(source).primary"
        :tagline="sourceDisplay(source).secondary || source.ownerOrg"
        :to="localePath(`/rankings/${source.id}`)"
      />
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-[var(--spacing-md)] mt-[var(--spacing-xl)]">
      <AppButton variant="tertiary" size="sm" :disabled="page <= 1" @click="page = page - 1">
        {{ $t('common.previousPage') }}
      </AppButton>
      <span class="body-sm text-[var(--color-steel)]">{{ page }} / {{ totalPages }}</span>
      <AppButton variant="tertiary" size="sm" :disabled="page >= totalPages" @click="page = page + 1">
        {{ $t('common.nextPage') }}
      </AppButton>
    </div>
  </div>
</template>
