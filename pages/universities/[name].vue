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

// 4 维排名数据 - 4 色区分配色 (金/银/铜/普通 不用于 4 维, 用 4 色 token)
const rankCards = computed(() => {
  if (!detail.value) return []
  const d = detail.value
  return [
    { label: 'QS 综合', rank: d.currentQsAllRank, icon: 'i-lucide-globe-2', color: '#1456f0', sparkColor: '#1456f0' },
    { label: 'QS 计算机', rank: d.currentQsComputerRank, icon: 'i-lucide-cpu', color: '#3b82f6', sparkColor: '#3b82f6' },
    { label: 'US News 综合', rank: d.currentUsnewsAllRank, icon: 'i-lucide-award', color: '#ea5ec1', sparkColor: '#ea5ec1' },
    { label: 'US News 计算机', rank: d.currentUsnewsComputerRank, icon: 'i-lucide-code-2', color: '#a855f7', sparkColor: '#a855f7' }
  ]
})

function rankTone(rank: number | null | undefined): 'primary' | 'secondary' | 'neutral' {
  if (rank == null) return 'neutral'
  if (rank <= 10) return 'primary'
  if (rank <= 100) return 'secondary'
  return 'neutral'
}

function rankBadgeTier(rank: number | null | undefined): string {
  if (rank == null) return 'rank-badge--normal'
  if (rank <= 3) return 'rank-badge--gold'
  if (rank <= 10) return 'rank-badge--silver'
  if (rank <= 50) return 'rank-badge--bronze'
  return 'rank-badge--normal'
}

// 区域色 token (与 universities 列表一致)
const REGION_BAR_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  '亚洲': { bg: 'rgba(234, 94, 193, 0.10)', fg: '#be185d', dot: '#ea5ec1' },
  '欧洲': { bg: 'rgba(20, 86, 240, 0.10)', fg: '#1d4ed8', dot: '#1456f0' },
  '北美洲': { bg: 'rgba(245, 158, 11, 0.10)', fg: '#b45309', dot: '#f59e0b' },
  '南美洲': { bg: 'rgba(34, 197, 94, 0.10)', fg: '#15803d', dot: '#22c55e' },
  '大洋洲': { bg: 'rgba(168, 85, 247, 0.10)', fg: '#7c3aed', dot: '#a855f7' },
  '非洲': { bg: 'rgba(239, 68, 68, 0.10)', fg: '#b91c1c', dot: '#ef4444' }
}
function regionStyle(r: string) {
  const c = REGION_BAR_COLORS[r]
  if (!c) return { background: 'rgba(0,0,0,0.04)', color: '#45515e' }
  return { background: c.bg, color: c.fg }
}
function regionColor(r: string): string {
  return REGION_BAR_COLORS[r]?.dot ?? '#8e8e93'
}

// 4 维排名 sparkline mini (SVG)
function rankSparklinePath(data: number[], width = 100, height = 32): string {
  if (!data || !data.length) return ''
  const maxV = Math.max(...data, 10) * 1.1
  const minV = 0
  const xStep = data.length > 1 ? width / (data.length - 1) : 0
  return data.map((v, i) => {
    const x = i * xStep
    const y = height - ((v - minV) / (maxV - minV)) * height
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
  }).join(' ')
}
function getSeriesData(seriesName: string): number[] {
  return chartData.value?.chatData?.series?.find((s: any) => s.name === seriesName)?.data ?? []
}

const isConsidering = ref(false)
function toggleConsider() {
  isConsidering.value = !isConsidering.value
  // TODO: 接 insertOrUpdate API
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
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1
            class="text-[40px] font-medium leading-[1.10] tracking-tight text-default sm:text-5xl"
            :style="{ fontFamily: 'var(--font-display)' }"
          >{{ name || '未知大学' }}</h1>
          <div v-if="detail" class="mt-3 flex flex-wrap items-center gap-2">
            <UBadge v-if="detail.universityTags" color="primary" variant="subtle" size="sm">
              <UIcon name="i-lucide-map-pin" class="size-3" />
              <span class="ml-1">{{ detail.universityTags }}</span>
            </UBadge>
            <span
              v-if="detail.universityTagsState"
              class="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold"
              :style="regionStyle(detail.universityTagsState)"
            >
              <span class="size-1.5 rounded-full" :style="{ background: regionColor(detail.universityTagsState) }" />
              {{ detail.universityTagsState }}
            </span>
            <UBadge v-if="detail.rankingYear" color="neutral" variant="soft" size="sm">
              <UIcon name="i-lucide-calendar" class="size-3" />
              <span class="ml-1">{{ detail.rankingYear }} 年</span>
            </UBadge>
          </div>
        </div>
        <UButton
          :icon="isConsidering ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'"
          :color="isConsidering ? 'primary' : 'neutral'"
          :variant="isConsidering ? 'solid' : 'outline'"
          size="md"
          :label="isConsidering ? '已加入考虑' : '加入考虑'"
          @click="toggleConsider"
        />
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

    <!-- 4 维排名卡 (rank-badge + sparkline mini) -->
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
          <div class="flex items-center justify-between">
            <div
              class="inline-flex size-9 items-center justify-center rounded-xl"
              :style="{ background: r.color + '15', color: r.color }"
            >
              <UIcon :name="r.icon" class="size-4.5" />
            </div>
            <UBadge
              v-if="r.rank != null"
              :color="rankTone(r.rank)"
              :variant="r.rank <= 10 ? 'solid' : 'subtle'"
              size="xs"
              :label="r.rank <= 10 ? 'Top 10' : r.rank <= 50 ? 'Top 50' : r.rank <= 100 ? 'Top 100' : `${r.rank}+`"
            />
          </div>
          <div class="text-[12px] font-medium text-muted">{{ r.label }}</div>
          <div class="flex items-end justify-between gap-2">
            <span :class="['rank-badge', rankBadgeTier(r.rank)]" :style="{ minWidth: '44px', height: '32px', fontSize: '16px' }">
              {{ r.rank ?? '—' }}
            </span>
            <svg v-if="getSeriesData(r.label).length > 1" :width="100" :height="32" class="overflow-visible opacity-80">
              <path
                :d="rankSparklinePath(getSeriesData(r.label))"
                fill="none"
                :stroke="r.sparkColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <div v-else class="flex h-8 w-[100px] items-center justify-center text-[10px] text-subtle opacity-60">
              暂无趋势数据
            </div>
          </div>
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
