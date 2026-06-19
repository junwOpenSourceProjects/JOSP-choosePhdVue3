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

async function loadAll() {
  loadingAll.value = true
  errorAll.value = null
  try {
    const data = await queryAllEcharts({ currentRank: currentRank.value }) as any
    allData.value = data
  } catch (e: any) {
    console.warn('[charts] loadAll failed', e?.message)
    errorAll.value = '后端不可达,显示 mock'
    allData.value = generateMockAll(currentRank.value)
  } finally {
    loadingAll.value = false
  }
}

function generateMockAll(rank: number) {
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
  // 选 5 所大学做综合排名 (QS All) 折线
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
    // 用 mock 4 维 (没有真实后端时拿空)
    const data = await queryPartEcharts({ currentRank: currentRank.value }) as any
    partData.value = data
  } catch (e: any) {
    console.warn('[charts] loadPart failed', e?.message)
    errorPart.value = '后端不可达,显示 mock'
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

// ============ SVG 折线图工具 ============
interface Series { name: string; data: number[]; color: string }
const PALETTE = ['#1456f0', '#3b82f6', '#60a5fa', '#93c5fd', '#1e40af', '#0ea5e9', '#06b6d4', '#10b981']

function buildGeometry(chart: any, W: number, H: number, P: number) {
  if (!chart?.chatData?.series?.length) return null
  const seriesRaw = chart.chatData.series
  const years = chart.legendData || []
  const allValues: number[] = []
  seriesRaw.forEach((s: any) => (s.data || []).forEach((v: any) => {
    if (typeof v === 'number' && v > 0) allValues.push(v)
  }))
  const maxV = Math.max(...allValues, 10) * 1.1
  const minV = 0
  const xStep = years.length > 1 ? (W - P * 2) / (years.length - 1) : 0
  const yScale = (v: number) => H - P - ((v - minV) / (maxV - minV)) * (H - P * 2)
  const series: Series[] = seriesRaw.map((s: any, idx: number) => ({
    name: s.name,
    data: s.data || [],
    color: PALETTE[idx % PALETTE.length]
  }))
  const paths = series.map(s => {
    const points = s.data.map((v, i) => {
      const x = P + i * xStep
      const y = typeof v === 'number' ? yScale(v) : H - P
      return [x, y, v]
    })
    return { ...s, points }
  })
  return { W, H, P, years, maxV, minV, xStep, yScale, paths }
}

onMounted(() => {
  loadAll()
  loadPart()
})

watch(currentRank, () => loadAll())
</script>

<template>
  <div>
    <section class="page-hero page-container">
      <h1 class="page-hero__title">数据图表</h1>
      <p class="page-hero__sub">趋势 · 对比 · 洞察</p>
    </section>

    <!-- Toolbar: 排名上限选择 -->
    <section class="page-container toolbar-section">
      <div class="toolbar">
        <div class="toolbar__group">
          <span class="toolbar__label">排名区间</span>
          <div class="toolbar__pills">
            <button
              v-for="r in [20, 50, 100]"
              :key="r"
              class="pill"
              :class="{ 'is-active': currentRank === r }"
              @click="currentRank = r"
            >
              Top {{ r }}
            </button>
          </div>
        </div>
        <div class="toolbar__hint">
          <UIcon name="i-lucide-info" class="size-3" />
          <span>排名越低越好,折线向下 = 排名上升</span>
        </div>
      </div>

      <div v-if="errorAll || errorPart" class="banner-warn">
        <UIcon name="i-lucide-alert-circle" class="size-4" />
        <span>{{ errorAll || errorPart }}</span>
      </div>
    </section>

    <!-- Chart 1: 全大学综合排名趋势对比 -->
    <section class="page-container chart-section">
      <div class="ds-card chart-card">
        <div class="chart-card__head">
          <div>
            <h2 class="chart-card__title">Top {{ currentRank }} 大学综合排名对比</h2>
            <p class="chart-card__sub">历年综合排名变化曲线,辅助选校决策</p>
          </div>
          <div v-if="allData?.chatData?.series?.length" class="chart-card__count">
            {{ allData.chatData.series.length }} 所大学
          </div>
        </div>

        <div v-if="loadingAll" class="chart-empty">
          <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
          <span>加载中...</span>
        </div>
        <div v-else-if="!allData" class="chart-empty">
          <UIcon name="i-lucide-bar-chart-3" class="size-8" />
          <span>暂无数据</span>
        </div>
        <ChartSvgChart v-else :chart="allData" :height="360" />
      </div>
    </section>

    <!-- Chart 2: 4 维排名趋势 (单一大学 4 维对比) -->
    <section class="page-container chart-section">
      <div class="ds-card chart-card">
        <div class="chart-card__head">
          <div>
            <h2 class="chart-card__title">单一大学 4 维排名趋势</h2>
            <p class="chart-card__sub">QS / US News × 综合 / 计算机 共 4 维对比</p>
          </div>
        </div>

        <div v-if="loadingPart" class="chart-empty">
          <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
          <span>加载中...</span>
        </div>
        <div v-else-if="!partData" class="chart-empty">
          <UIcon name="i-lucide-line-chart" class="size-8" />
          <span>暂无数据</span>
        </div>
        <ChartSvgChart v-else :chart="partData" :height="360" />
      </div>
    </section>

    <!-- Insight grid -->
    <section class="page-container insight-section">
      <div class="insight-grid">
        <div class="insight-card">
          <div class="insight-card__icon insight-card__icon--blue">
            <UIcon name="i-lucide-trending-up" class="size-5" />
          </div>
          <div class="insight-card__title">观察趋势</div>
          <div class="insight-card__desc">
            折线持续向下 = 该大学排名持续上升,值得重点关注
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-card__icon insight-card__icon--green">
            <UIcon name="i-lucide-target" class="size-5" />
          </div>
          <div class="insight-card__title">对比分析</div>
          <div class="insight-card__desc">
            多所大学曲线叠加,可以快速判断「冲刺 / 主申 / 保底」区间
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-card__icon insight-card__icon--purple">
            <UIcon name="i-lucide-clock" class="size-5" />
          </div>
          <div class="insight-card__title">历年变化</div>
          <div class="insight-card__desc">
            关注排名大幅波动的大学(±10 位),可能是「黑马」或「过誉」
          </div>
        </div>
        <div class="insight-card">
          <div class="insight-card__icon insight-card__icon--orange">
            <UIcon name="i-lucide-merge" class="size-5" />
          </div>
          <div class="insight-card__title">4 维交叉</div>
          <div class="insight-card__desc">
            计算机排名 显著高于综合排名 = 理工强校;反之 = 文理综合强校
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-hero { padding: 56px 0 24px; }
.page-hero__title { font-family: var(--font-display); font-size: 40px; font-weight: 600; color: var(--color-ink-1000); margin: 0; line-height: 1.1; letter-spacing: -0.02em; }
.page-hero__sub { font-size: 16px; color: var(--color-ink-700); margin: 8px 0 0; }

.toolbar-section { padding: 8px 24px 0; }
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
  padding: 16px 20px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}
.toolbar__group { display: flex; align-items: center; gap: 12px; }
.toolbar__label { font-size: 13px; color: var(--color-ink-700); }
.toolbar__pills { display: flex; gap: 4px; padding: 4px; background: var(--color-surface-1); border-radius: 9999px; }
.toolbar__pills .pill { background: transparent; padding: 6px 14px; font-size: 13px; }
.toolbar__pills .pill:hover { background: rgba(0, 0, 0, 0.04); }
.toolbar__pills .pill.is-active { background: var(--color-brand-900); color: #fff; }
.toolbar__hint { display: inline-flex; align-items: center; gap: 4px; font-size: 12px; color: var(--color-ink-500); }

.banner-warn {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 8px;
  background: #fef3c7; color: #92400e; font-size: 13px;
  margin-top: 12px;
}

.chart-section { padding: 20px 24px; }
.chart-card { padding: 24px; }
.chart-card__head {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 20px; gap: 16px;
}
.chart-card__title {
  font-family: var(--font-display); font-size: 22px; font-weight: 600;
  color: var(--color-ink-1000); margin: 0;
}
.chart-card__sub { font-size: 13px; color: var(--color-ink-700); margin: 4px 0 0; }
.chart-card__count {
  padding: 4px 10px; background: rgba(20, 86, 240, 0.08);
  border-radius: 9999px; font-size: 12px; font-weight: 500;
  color: var(--color-brand-900); white-space: nowrap;
}

.chart-empty {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 60px 24px; color: var(--color-ink-500); font-size: 13px;
}

.insight-section { padding: 0 24px 40px; }
.insight-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1024px) { .insight-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .insight-grid { grid-template-columns: 1fr; } }

.insight-card {
  display: flex; flex-direction: column; gap: 10px;
  padding: 20px; background: #fff;
  border-radius: 16px; border: 1px solid var(--color-border-light);
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
  transition: all 240ms ease;
}
.insight-card:hover { transform: translateY(-2px); box-shadow: rgba(44, 30, 116, 0.16) 0px 0px 15px; }
.insight-card__icon {
  display: inline-flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 10px;
}
.insight-card__icon--blue { background: rgba(20, 86, 240, 0.1); color: var(--color-brand-900); }
.insight-card__icon--green { background: rgba(16, 185, 129, 0.1); color: #059669; }
.insight-card__icon--purple { background: rgba(168, 85, 247, 0.1); color: #9333ea; }
.insight-card__icon--orange { background: rgba(245, 158, 11, 0.1); color: #d97706; }
.insight-card__title { font-family: var(--font-display); font-size: 16px; font-weight: 600; color: var(--color-ink-1000); }
.insight-card__desc { font-size: 13px; line-height: 1.5; color: var(--color-ink-700); }
</style>
