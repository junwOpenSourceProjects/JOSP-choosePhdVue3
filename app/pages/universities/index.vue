<script setup lang="ts">
import type { PageResult, University, UniversityTag } from '~/types'

useHead({ title: '院校库' })

const $api = useApi()
const authStore = useAuthStore()
const shortlistStore = useShortlistStore()
const route = useRoute()
const router = useRouter()

const keyword = ref((route.query.keyword as string) || '')
const continent = ref((route.query.continent as string) || '')
const country = ref((route.query.country as string) || '')
const sortBy = ref((route.query.sortBy as string) || 'bestRank')
const selectedTagIds = ref<number[]>(parseTagIds(route.query.tagIds))
const page = ref(Number(route.query.page) || 1)
const pageSize = 20

function parseTagIds(value: unknown): number[] {
  if (!value) return []
  if (Array.isArray(value)) return value.map(Number).filter(Boolean)
  return String(value).split(',').map(Number).filter(Boolean)
}

const continentOptions = [
  { label: '北美', value: '北美洲' },
  { label: '欧洲', value: '欧洲' },
  { label: '亚洲', value: '亚洲' },
  { label: '大洋洲', value: '大洋洲' },
  { label: '非洲', value: '非洲' },
  { label: '南美', value: '南美洲' }
]

const sortOptions = [
  { label: '排名优先', value: 'bestRank' },
  { label: '名称 A-Z', value: 'name' }
]

const syncQuery = () => {
  const query: Record<string, string | undefined> = {
    ...route.query,
    ...(keyword.value ? { keyword: keyword.value } : {}),
    ...(continent.value ? { continent: continent.value } : {}),
    ...(country.value ? { country: country.value } : {}),
    ...(sortBy.value && sortBy.value !== 'bestRank' ? { sortBy: sortBy.value } : {}),
    ...(selectedTagIds.value.length ? { tagIds: selectedTagIds.value.join(',') } : {}),
    page: page.value > 1 ? String(page.value) : undefined
  }
  if (!selectedTagIds.value.length) delete query.tagIds
  Object.keys(query).forEach((k) => {
    if (query[k] === undefined) delete query[k]
  })
  router.push({ query })
}

const { data: result, pending, refresh } = await useAsyncData<PageResult<University>>(
  () => `universities-${keyword.value}-${continent.value}-${country.value}-${sortBy.value}-${selectedTagIds.value.join('-')}-${page.value}`,
  () => $api<PageResult<University>>('/api/v1/universities', {
    query: {
      ...(keyword.value ? { keyword: keyword.value } : {}),
      ...(continent.value ? { continent: continent.value } : {}),
      ...(country.value ? { country: country.value } : {}),
      ...(selectedTagIds.value.length ? { tagIds: selectedTagIds.value.join(',') } : {}),
      sortBy: sortBy.value,
      page: page.value,
      size: pageSize
    }
  }),
  { server: true, watch: [keyword, continent, country, sortBy, page, selectedTagIds] }
)

const { data: tagOptions } = await useAsyncData<UniversityTag[]>(
  () => 'university-tags',
  () => $api<UniversityTag[]>('/api/v1/university-tags'),
  { server: false, default: () => [] }
)

const { data: countryOptions } = await useAsyncData<string[]>(
  () => `countries-${continent.value}`,
  () => $api<string[]>('/api/v1/universities/countries', {
    query: continent.value ? { continent: continent.value } : {}
  }),
  { server: false, watch: [continent], default: () => [] }
)

const totalPages = computed(() => result.value ? Math.max(1, Math.ceil(result.value.total / pageSize)) : 1)

const onSearch = (q: string) => {
  keyword.value = q
  page.value = 1
  syncQuery()
}

const onContinentFilter = (value: string) => {
  continent.value = continent.value === value ? '' : value
  country.value = ''
  page.value = 1
  syncQuery()
}

const onCountryFilter = (value: string) => {
  country.value = country.value === value ? '' : value
  page.value = 1
  syncQuery()
}

const onSortChange = (value: string) => {
  sortBy.value = value
  page.value = 1
  syncQuery()
}

const onTagToggle = (tagId: number) => {
  const idx = selectedTagIds.value.indexOf(tagId)
  if (idx >= 0) {
    selectedTagIds.value.splice(idx, 1)
  } else {
    selectedTagIds.value.push(tagId)
  }
  page.value = 1
  syncQuery()
}

const setPage = (v: number) => {
  page.value = v
  syncQuery()
}

const adding = ref<Record<string, boolean>>({})

const addToShortlist = async (uni: University) => {
  if (!authStore.isLoggedIn) {
    await navigateTo('/login?redirect=' + encodeURIComponent(route.fullPath))
    return
  }
  adding.value[uni.urlId] = true
  try {
    await shortlistStore.addToShortlist({ universityId: uni.urlId, priority: 2 })
  } finally {
    adding.value[uni.urlId] = false
  }
}
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">院校库</h1>
    <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">
      搜索并浏览全球大学，按世界排名发现顶尖院校。
    </p>

    <!-- Search -->
    <div class="max-w-2xl mb-[var(--spacing-xl)]">
      <AppSearchPill v-model="keyword" @search="onSearch" />
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-[var(--spacing-md)] mb-[var(--spacing-xl)]">
      <div class="flex flex-wrap items-center gap-[var(--spacing-xs)]">
        <span class="body-sm text-[var(--color-steel)] mr-1">大洲</span>
        <button
          v-for="c in continentOptions"
          :key="c.value"
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
          :class="continent === c.value
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
          @click="onContinentFilter(c.value)"
        >
          {{ c.label }}
        </button>
      </div>

      <div v-if="continent && (countryOptions || []).length > 0" class="flex flex-wrap items-center gap-[var(--spacing-xs)]">
        <span class="body-sm text-[var(--color-steel)] mr-1">国家</span>
        <button
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
          :class="country === ''
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
          @click="country = ''; page = 1; syncQuery()"
        >
          全部
        </button>
        <button
          v-for="c in countryOptions"
          :key="c"
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
          :class="country === c
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
          @click="onCountryFilter(c)"
        >
          {{ c }}
        </button>
      </div>

      <div class="flex flex-wrap items-center gap-[var(--spacing-xs)]">
        <span class="body-sm text-[var(--color-steel)] mr-1">排序</span>
        <button
          v-for="s in sortOptions"
          :key="s.value"
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
          :class="sortBy === s.value
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
          @click="onSortChange(s.value)"
        >
          {{ s.label }}
        </button>
      </div>

      <div v-if="tagOptions && tagOptions.length" class="flex flex-wrap items-center gap-[var(--spacing-xs)]">
        <span class="body-sm text-[var(--color-steel)] mr-1">标签</span>
        <button
          v-for="tag in tagOptions"
          :key="tag.id"
          type="button"
          class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
          :class="selectedTagIds.includes(tag.id)
            ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
            : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
          @click="onTagToggle(tag.id)"
        >
          {{ tag.nameZh }}
        </button>
      </div>
    </div>

    <!-- Grid -->
    <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
      <div v-for="i in pageSize" :key="i" class="card-base h-48 animate-pulse" />
    </div>
    <div v-else-if="!result?.list.length" class="card-base text-center py-[var(--spacing-section)] text-[var(--color-steel)]">
      未找到匹配院校
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
      <AppCard v-for="(uni, idx) in result.list" :key="uni.urlId">
        <NuxtLink :to="`/universities/${uni.urlId}`">
          <div class="flex items-start justify-between gap-2 mb-1">
            <h3 class="card-title text-[var(--color-ink)]">{{ uni.nameZh }}</h3>
            <span v-if="sortBy === 'bestRank' && page === 1" class="body-sm-bold text-[var(--color-steel)]">#{{ (page - 1) * pageSize + idx + 1 }}</span>
          </div>
          <p class="body-sm text-[var(--color-steel)] mb-[var(--spacing-md)]">{{ uni.nameEn }}</p>
        </NuxtLink>
        <div class="flex items-center justify-between">
          <div class="flex gap-[var(--spacing-xs)] flex-wrap items-center">
            <template v-if="uni.tags && uni.tags.length">
              <UniversityTagBadge
                v-for="tag in uni.tags.slice(0, 2)"
                :key="tag.id"
                :tag="tag"
              />
              <span v-if="uni.tags.length > 2" class="text-[var(--color-muted)] text-xs">+{{ uni.tags.length - 2 }}</span>
            </template>
            <template v-else>
              <AppBadge variant="code" :label="uni.country || '—'" />
              <AppBadge variant="beta" :label="uni.region || '—'" />
            </template>
          </div>
          <button
            type="button"
            class="btn-sm btn-tertiary"
            :disabled="adding[uni.urlId]"
            @click="addToShortlist(uni)"
          >
            {{ adding[uni.urlId] ? '添加中…' : '加入清单' }}
          </button>
        </div>
      </AppCard>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="flex items-center justify-center gap-[var(--spacing-md)] mt-[var(--spacing-xl)]">
      <AppButton variant="tertiary" size="sm" :disabled="page <= 1" @click="setPage(page - 1)">
        上一页
      </AppButton>
      <span class="body-sm text-[var(--color-steel)]">{{ page }} / {{ totalPages }}</span>
      <AppButton variant="tertiary" size="sm" :disabled="page >= totalPages" @click="setPage(page + 1)">
        下一页
      </AppButton>
    </div>
  </div>
</template>
