<script setup lang="ts">
import type { RankingSource, Subject } from '~/types'

useHead({ title: '学科排名' })

const $api = useApi()
const route = useRoute()
const router = useRouter()

// Use ranking sources (kind=3) as the authoritative list of available subject rankings.
// A single subject slug (e.g. "engineering") may have sources from multiple orgs,
// so the subject table alone cannot represent the org-subject matrix.
const { data: subjects } = await useAsyncData<Subject[]>(
  'subjects',
  () => $api<Subject[]>('/api/v1/subjects'),
  { server: true }
)

const { data: sources } = await useAsyncData<RankingSource[]>(
  'subject-sources',
  async () => {
    try {
      const all: RankingSource[] = []
      let page = 1
      const size = 200
      while (true) {
        const res = await $api('/api/v1/sources', { query: { kind: 3, page, size } }) as { list: RankingSource[]; total: number }
        if (!res.list?.length) break
        all.push(...res.list)
        if (all.length >= res.total) break
        page += 1
      }
      return all
    } catch {
      return []
    }
  },
  { server: true }
)

const subjectNameMap = computed(() => {
  const map: Record<string, { nameZh: string; nameEn: string }> = {}
  subjects.value?.forEach((s) => {
    map[s.slug] = { nameZh: s.nameZh, nameEn: s.nameEn }
  })
  return map
})

const ownerOrgs = computed(() => {
  const orgs = new Set(sources.value?.map((s) => s.ownerOrg) || [])
  return Array.from(orgs).sort()
})

const activeOrg = computed({
  get: () => (route.query.org as string) || (ownerOrgs.value[0] || ''),
  set: (v) => router.push({ query: { ...route.query, org: v } })
})

const groupedSources = computed(() => {
  if (!sources.value) return []
  return sources.value.filter((s) => s.ownerOrg === activeOrg.value)
})

const SUBJECT_PARENT_RE = /^(qs|the|arwu|usnews|rur)-university-subject-rankings-/

function extractSubjectSlug(sourceSlug: string): string {
  return sourceSlug.replace(SUBJECT_PARENT_RE, '')
}

function displayName(source: RankingSource): string {
  const subjectSlug = extractSubjectSlug(source.slug)
  const subject = subjectNameMap.value[subjectSlug]
  if (subject?.nameZh?.trim() && subject.nameZh !== subjectSlug) {
    return subject.nameZh.trim()
  }
  // Fallback: strip org prefix and "学科排名" suffix from source name
  return source.nameZh
    .replace(/^U\.S\.\s*News/i, '')
    .replace(/^QS/i, '')
    .replace(/^THE/i, '')
    .replace(/^ARWU/i, '')
    .replace(/^RUR/i, '')
    .replace(/学科排名$/g, '')
    .trim()
    || source.nameZh
}

function displayEn(source: RankingSource): string {
  const subjectSlug = extractSubjectSlug(source.slug)
  const subject = subjectNameMap.value[subjectSlug]
  if (subject?.nameEn?.trim() && subject.nameEn !== subjectSlug) {
    return subject.nameEn.trim()
  }
  return subjectSlug.replace(/-/g, ' ')
}
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">学科排名</h1>
    <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">
      按榜单机构浏览学科排名，找到适合你的研究方向。
    </p>

    <!-- Owner tabs -->
    <div class="flex flex-wrap gap-[var(--spacing-xs)] mb-[var(--spacing-xl)]">
      <button
        v-for="org in ownerOrgs"
        :key="org"
        type="button"
        class="px-[var(--spacing-md)] py-[var(--spacing-xs)] rounded-[var(--rounded-full)] border body-sm-medium transition-colors"
        :class="activeOrg === org
          ? 'bg-[var(--color-primary)] text-[var(--color-on-primary)] border-[var(--color-primary)]'
          : 'bg-[var(--color-canvas)] text-[var(--color-steel)] border-[var(--color-hairline)] hover:text-[var(--color-ink)]'"
        @click="activeOrg = org"
      >
        {{ org }}
      </button>
    </div>

    <!-- Subject grid -->
    <div v-if="!groupedSources.length" class="card-base text-center py-[var(--spacing-section)] text-[var(--color-steel)]">
      暂无学科数据
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[var(--spacing-md)]">
      <NuxtLink
        v-for="source in groupedSources"
        :key="source.id"
        :to="`/rankings/${source.id}`"
        class="block group"
      >
        <AppCard class="h-full transition-colors hover:border-[var(--color-ink)] cursor-pointer">
          <h3 class="card-title text-[var(--color-ink)] mb-1 group-hover:underline">{{ displayName(source) }}</h3>
          <p class="body-sm text-[var(--color-steel)]">{{ displayEn(source) }}</p>
        </AppCard>
      </NuxtLink>
    </div>
  </div>
</template>
