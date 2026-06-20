<script setup lang="ts">
import { queryAllQs } from '~/lib/api/university'
import { drawerData } from '~/lib/api/ranking'
import type { UniversityAllDTO } from '~/types'

const route = useRoute()
const router = useRouter()

const name = computed(() => decodeURIComponent(String(route.params.name || '')))

useHead({ title: () => `${name.value} · 学校详情` })

// 数据
const detail = ref<UniversityAllDTO | null>(null)
const chartData = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = null
  try {
    // 1) 用 queryAllQs 搜这一所的汇总数据
    const list = await queryAllQs({
      page: 1,
      limit: 50,
      universityNameChinese: name.value,
      rankVariant: 'all'
    }) as any
    const records = list?.records ?? list?.data?.records ?? []
    if (records.length > 0) {
      detail.value = records[0]
    }
    // 2) 拉抽屉详细图表数据
    const drawer = await drawerData(name.value) as any
    if (drawer?.chatData) {
      chartData.value = drawer
    }
  } catch (e: any) {
    console.warn('[detail] load failed', e?.message)
    error.value = '后端不可达, 显示 mock 数据'
    detail.value = generateMockDetail(name.value)
    chartData.value = generateMockChart(name.value)
  } finally {
    loading.value = false
  }
}

function generateMockDetail(n: string): UniversityAllDTO {
  return {
    universityNameChinese: n,
    universityTags: '美国',
    universityTagsState: '北美洲',
    rankingYear: '2025',
    currentQsAllRank: 5,
    currentQsComputerRank: 3,
    currentUsnewsAllRank: 3,
    currentUsnewsComputerRank: 2
  }
}

function generateMockChart(_n: string) {
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
  return {
    chatData: {
      series: [
        { name: 'QS 综合', smooth: true, data: [6, 5, 4, 4, 5, 4, 5, 5] },
        { name: 'QS 计算机', smooth: true, data: [3, 4, 3, 3, 3, 2, 3, 3] },
        { name: 'US News 综合', smooth: true, data: [5, 4, 3, 3, 3, 2, 3, 3] },
        { name: 'US News 计算机', smooth: true, data: [2, 2, 1, 2, 2, 1, 2, 2] }
      ]
    },
    legendData: years
  }
}

onMounted(load)

// 4 维排名数据
const rankCards = computed(() => {
  if (!detail.value) return []
  const d = detail.value
  return [
    { label: 'QS 综合', rank: d.currentQsAllRank, icon: 'i-lucide-globe-2', color: '#1456f0' },
    { label: 'QS 计算机', rank: d.currentQsComputerRank, icon: 'i-lucide-cpu', color: '#1d4ed8' },
    { label: 'US News 综合', rank: d.currentUsnewsAllRank, icon: 'i-lucide-award', color: '#17437d' },
    { label: 'US News 计算机', rank: d.currentUsnewsComputerRank, icon: 'i-lucide-code-2', color: '#3b82f6' }
  ]
})

function rankTone(rank: number | null | undefined): 'primary' | 'secondary' | 'neutral' {
  if (rank == null) return 'neutral'
  if (rank <= 10) return 'primary'
  if (rank <= 100) return 'secondary'
  return 'neutral'
}

function back() { router.back() }

// 详情表: 行=维度, 列=年份
const detailTableColumns = computed(() => {
  if (!chartData.value?.legendData?.length) return []
  return [
    { id: 'name', header: '维度', accessorKey: 'name' },
    ...chartData.value.legendData.map((y: string) => ({
      id: `y_${y}`,
      header: y,
      meta: { class: { th: 'text-center', td: 'text-center font-[var(--font-data)]' } }
    }))
  ]
})

const detailTableRows = computed(() => {
  if (!chartData.value?.chatData?.series?.length) return []
  return chartData.value.chatData.series.map((s: any) => {
    const row: any = { name: s.name }
    s.data.forEach((v: any, i: number) => {
      const year = chartData.value.legendData[i]
      if (year) row[`y_${year}`] = v
    })
    return row
  })
})
</script>

<template>
  <div>
    <!-- Hero + 返回 -->
    <UContainer class="pt-6">
      <UButton
        icon="i-lucide-arrow-left"
        color="neutral"
        variant="ghost"
        size="sm"
        label="返回"
        @click="back"
      />
    </UContainer>

    <UContainer class="pt-4 pb-2">
      <div class="flex items-center gap-3">
        <h1
          class="text-[40px] font-medium leading-[1.10] tracking-tight text-default sm:text-5xl"
          :style="{ fontFamily: 'var(--font-display)' }"
        >{{ name || '未知大学' }}</h1>
        <span
          v-if="detail"
          class="mt-3 size-2 shrink-0 rounded-full"
          :style="{ background: 'var(--color-brand-pink)' }"
          aria-hidden="true"
        />
      </div>
      <div v-if="detail" class="mt-3 flex flex-wrap items-center gap-2">
        <UBadge v-if="detail.universityTags" color="primary" variant="subtle" size="sm">
          <UIcon name="i-lucide-map-pin" class="size-3" />
          <span class="ml-1">{{ detail.universityTags }}</span>
        </UBadge>
        <UBadge v-if="detail.universityTagsState" color="neutral" variant="soft" size="sm">
          <UIcon name="i-lucide-globe-2" class="size-3" />
          <span class="ml-1">{{ detail.universityTagsState }}</span>
        </UBadge>
        <UBadge v-if="detail.rankingYear" color="neutral" variant="soft" size="sm">
          <UIcon name="i-lucide-calendar" class="size-3" />
          <span class="ml-1">{{ detail.rankingYear }} 年</span>
        </UBadge>
      </div>
    </UContainer>

    <UContainer v-if="error" class="pt-2">
      <UAlert
        color="warning"
        variant="subtle"
        :title="error"
        icon="i-lucide-alert-circle"
      />
    </UContainer>

    <!-- 4 维排名卡 -->
    <UContainer class="py-6">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard
          v-for="r in rankCards"
          :key="r.label"
          :ui="{
            root: 'rounded-2xl border border-default bg-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5',
            body: 'p-5 space-y-3'
          }"
        >
          <div
            class="inline-flex size-10 items-center justify-center rounded-xl"
            :style="{ background: r.color + '15', color: r.color }"
          >
            <UIcon :name="r.icon" class="size-5" />
          </div>
          <div class="text-[13px] text-muted">{{ r.label }}</div>
          <div class="flex items-baseline gap-1.5">
            <span
              class="text-4xl font-semibold leading-none tracking-tight"
              :style="{ fontFamily: 'var(--font-display)', color: r.color }"
            >{{ r.rank ?? '—' }}</span>
            <span class="text-[13px] text-subtle">/ 排名</span>
          </div>
          <UBadge
            v-if="r.rank != null"
            :color="rankTone(r.rank)"
            :variant="r.rank <= 10 ? 'solid' : 'subtle'"
            size="xs"
            :label="r.rank <= 10 ? 'Top 10' : r.rank <= 50 ? 'Top 50' : r.rank <= 100 ? 'Top 100' : `${r.rank}+`"
          />
        </UCard>
      </div>
    </UContainer>

    <!-- 趋势图 -->
    <UContainer class="pb-6">
      <UCard
        :ui="{
          root: 'rounded-2xl border border-default bg-white shadow-sm',
          body: 'p-6'
        }"
      >
        <div class="mb-5">
          <h2
            class="text-[22px] font-semibold leading-tight text-default"
            :style="{ fontFamily: 'var(--font-display)' }"
          >历年排名趋势</h2>
          <p class="mt-1 text-[13px] text-muted">4 个维度的排名变化 (越低越好)</p>
        </div>

        <div v-if="chartData" class="rounded-xl bg-[var(--color-surface-1)] p-4">
          <ChartSvgChart :chart="chartData" :height="280" />
        </div>
        <div v-else class="flex h-60 items-center justify-center gap-2 text-muted">
          <UIcon name="i-lucide-loader" class="size-5 animate-spin" />
          <span class="text-sm">加载中…</span>
        </div>
      </UCard>
    </UContainer>

    <!-- 历年明细表 -->
    <UContainer v-if="chartData" class="pb-12">
      <UCard
        :ui="{
          root: 'rounded-2xl border border-default bg-white shadow-sm overflow-hidden',
          body: 'p-0'
        }"
      >
        <div class="border-b border-default p-5">
          <h2
            class="text-lg font-semibold leading-tight text-default"
            :style="{ fontFamily: 'var(--font-display)' }"
          >历年数据明细</h2>
        </div>
        <UTable
          :data="detailTableRows"
          :columns="detailTableColumns"
          :ui="{
            th: 'text-[12px] font-medium text-muted',
            td: 'py-3 text-sm'
          }"
        >
          <template #name-cell="{ row }">
            <span class="font-medium text-default">{{ row.original.name }}</span>
          </template>
        </UTable>
      </UCard>
    </UContainer>
  </div>
</template>
