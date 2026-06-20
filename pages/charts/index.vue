<script setup lang="ts">
import { queryAllEcharts, queryPartEcharts } from '~/lib/api/university'

useHead({ title: '数据图表 · 选校系统' })

// 全大学 echarts 概览
const allData = ref<any>(null)
const partData = ref<any>(null)
const loadingAll = ref(false)
const loadingPart = ref(false)
const errorAll = ref<string | null>(null)
const errorPart = ref<string | null>(null)
const currentRank = ref<number>(50)

const rankItems = [
  { value: 20, label: 'Top 20' },
  { value: 50, label: 'Top 50' },
  { value: 100, label: 'Top 100' }
]

async function loadAll() {
  loadingAll.value = true
  errorAll.value = null
  try {
    const data = await queryAllEcharts({ currentRank: currentRank.value }) as any
    allData.value = data
  } catch (e: any) {
    console.warn('[charts] loadAll failed', e?.message)
    errorAll.value = '后端不可达, 显示 mock'
    allData.value = generateMockAll(currentRank.value)
  } finally {
    loadingAll.value = false
  }
}

function generateMockAll(rank: number) {
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
  const series = [
    { name: '麻省理工学院', data: [4, 1, 1, 1, 1, 1, 1, 1] },
    { name: '斯坦福大学', data: [2, 2, 2, 2, 3, 3, 5, 5] },
    { name: '哈佛大学', data: [3, 3, 3, 5, 5, 5, 4, 4] },
    { name: '剑桥大学', data: [5, 6, 7, 7, 4, 2, 2, 2] },
    { name: '牛津大学', data: [6, 5, 4, 4, 2, 4, 3, 3] }
  ].filter(s => Math.max(...s.data) <= rank)
  return { chatData: { series }, legendData: years }
}

async function loadPart() {
  loadingPart.value = true
  errorPart.value = null
  try {
    const data = await queryPartEcharts({ currentRank: currentRank.value }) as any
    partData.value = data
  } catch (e: any) {
    console.warn('[charts] loadPart failed', e?.message)
    errorPart.value = '后端不可达, 显示 mock'
    partData.value = generateMockPart()
  } finally {
    loadingPart.value = false
  }
}

function generateMockPart() {
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
  return {
    chatData: {
      series: [
        { name: 'QS 综合', data: [6, 5, 4, 4, 5, 4, 5, 5] },
        { name: 'QS 计算机', data: [3, 4, 3, 3, 3, 2, 3, 3] },
        { name: 'US News 综合', data: [5, 4, 3, 3, 3, 2, 3, 3] },
        { name: 'US News 计算机', data: [2, 2, 1, 2, 2, 1, 2, 2] }
      ]
    },
    legendData: years
  }
}

const insights = [
  { icon: 'i-lucide-trending-up', title: '观察趋势', desc: '折线持续向下 = 该大学排名持续上升, 值得重点关注', color: '#1456f0' },
  { icon: 'i-lucide-target', title: '对比分析', desc: '多所大学曲线叠加, 可以快速判断「冲刺 / 主申 / 保底」区间', color: '#059669' },
  { icon: 'i-lucide-clock', title: '历年变化', desc: '关注排名大幅波动的大学(±10 位), 可能是「黑马」或「过誉」', color: '#9333ea' },
  { icon: 'i-lucide-merge', title: '4 维交叉', desc: '计算机排名 显著高于综合排名 = 理工强校; 反之 = 文理综合强校', color: '#d97706' }
]

onMounted(() => {
  loadAll()
  loadPart()
})

watch(currentRank, () => loadAll())
</script>

<template>
  <div>
    <UContainer class="py-10">
      <h1
        class="text-4xl font-semibold leading-tight tracking-tight text-default"
        :style="{ fontFamily: 'var(--font-display)' }"
      >数据图表</h1>
      <p class="mt-2 text-base text-muted">趋势 · 对比 · 洞察</p>
    </UContainer>

    <!-- Toolbar -->
    <UContainer>
      <UCard
        :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-4 sm:p-5' }"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-sm text-muted">排名区间</span>
            <UFieldGroup size="sm">
              <UButton
                v-for="r in rankItems"
                :key="r.value"
                :color="currentRank === r.value ? 'primary' : 'neutral'"
                :variant="currentRank === r.value ? 'solid' : 'outline'"
                :label="r.label"
                size="sm"
                @click="currentRank = r.value"
              />
            </UFieldGroup>
          </div>
          <div class="inline-flex items-center gap-1.5 text-xs text-subtle">
            <UIcon name="i-lucide-info" class="size-3" />
            <span>排名越低越好, 折线向下 = 排名上升</span>
          </div>
        </div>

        <UAlert
          v-if="errorAll || errorPart"
          color="warning"
          variant="subtle"
          :title="errorAll || errorPart || ''"
          icon="i-lucide-alert-circle"
          class="mt-3"
        />
      </UCard>
    </UContainer>

    <!-- Chart 1: 综合排名对比 -->
    <UContainer class="pt-5">
      <UCard
        :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-6' }"
      >
        <div class="mb-5 flex items-start justify-between gap-3">
          <div>
            <h2
              class="text-[22px] font-semibold leading-tight text-default"
              :style="{ fontFamily: 'var(--font-display)' }"
            >Top {{ currentRank }} 大学综合排名对比</h2>
            <p class="mt-1 text-[13px] text-muted">历年综合排名变化曲线, 辅助选校决策</p>
          </div>
          <UBadge
            v-if="allData?.chatData?.series?.length"
            color="primary"
            variant="subtle"
            size="md"
            :label="`${allData.chatData.series.length} 所大学`"
          />
        </div>

        <div v-if="loadingAll" class="flex h-72 flex-col items-center justify-center gap-3 text-muted">
          <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
          <span class="text-sm">加载中…</span>
        </div>
        <UEmpty
          v-else-if="!allData"
          icon="i-lucide-bar-chart-3"
          title="暂无数据"
        />
        <div v-else class="rounded-xl bg-[var(--color-surface-1)] p-4">
          <ChartSvgChart :chart="allData" :height="320" />
        </div>
      </UCard>
    </UContainer>

    <!-- Chart 2: 4 维排名趋势 -->
    <UContainer class="pt-5">
      <UCard
        :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-6' }"
      >
        <div class="mb-5">
          <h2
            class="text-[22px] font-semibold leading-tight text-default"
            :style="{ fontFamily: 'var(--font-display)' }"
          >单一大学 4 维排名趋势</h2>
          <p class="mt-1 text-[13px] text-muted">QS / US News × 综合 / 计算机 共 4 维对比</p>
        </div>

        <div v-if="loadingPart" class="flex h-72 flex-col items-center justify-center gap-3 text-muted">
          <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
          <span class="text-sm">加载中…</span>
        </div>
        <UEmpty
          v-else-if="!partData"
          icon="i-lucide-line-chart"
          title="暂无数据"
        />
        <div v-else class="rounded-xl bg-[var(--color-surface-1)] p-4">
          <ChartSvgChart :chart="partData" :height="320" />
        </div>
      </UCard>
    </UContainer>

    <!-- Insight grid -->
    <UContainer class="py-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="i in insights"
          :key="i.title"
          class="group flex flex-col gap-2.5 rounded-2xl border border-default bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            class="inline-flex size-9 items-center justify-center rounded-xl"
            :style="{ background: i.color + '15', color: i.color }"
          >
            <UIcon :name="i.icon" class="size-5" />
          </div>
          <div
            class="text-base font-semibold text-default"
            :style="{ fontFamily: 'var(--font-display)' }"
          >{{ i.title }}</div>
          <div class="text-[13px] leading-relaxed text-muted">{{ i.desc }}</div>
        </div>
      </div>
    </UContainer>
  </div>
</template>
