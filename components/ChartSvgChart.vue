<script setup lang="ts">
interface Props {
  chart: any           // { chatData: { series: [{name, data: number[]}] }, legendData: string[] }
  height?: number      // default 320
}

const props = withDefaults(defineProps<Props>(), {
  height: 320
})

const W = 1000  // viewBox 宽,实际靠 width: 100% 等比缩放

const PALETTE = [
  '#1456f0', // brand blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // purple
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#84cc16', // lime
  '#f97316', // orange
  '#6366f1', // indigo
  '#14b8a6', // teal
  '#a855f7'  // violet
]

const geometry = computed(() => {
  if (!props.chart?.chatData?.series?.length) return null
  const seriesRaw = props.chart.chatData.series as any[]
  const years = (props.chart.legendData || []) as string[]
  const H = props.height
  const P = 50
  const allValues: number[] = []
  seriesRaw.forEach((s: any) => (s.data || []).forEach((v: any) => {
    if (typeof v === 'number' && v > 0) allValues.push(v)
  }))
  const maxV = Math.max(...allValues, 10) * 1.1
  const xStep = years.length > 1 ? (W - P * 2) / (years.length - 1) : 0
  const yScale = (v: number) => H - P - ((v - 0) / (maxV - 0)) * (H - P * 2)
  const series = seriesRaw.map((s: any, idx: number) => ({
    name: s.name,
    data: (s.data || []) as any[],
    color: PALETTE[idx % PALETTE.length]
  }))
  const paths = series.map((s: any) => {
    const points = s.data.map((v: any, i: number) => {
      const x = P + i * xStep
      const y = typeof v === 'number' ? yScale(v) : H - P
      return [x, y, v]
    })
    return { ...s, points }
  })
  return { H, P, W, years, maxV, xStep, yScale, paths }
})

const yTicks = computed(() => {
  if (!geometry.value) return []
  const g = geometry.value
  const step = g.maxV / 4
  return [0, 1, 2, 3, 4].map(i => Math.round(step * (4 - i)))
})
</script>

<template>
  <div v-if="geometry" class="chart-svg-wrap" :style="{ height: geometry.H + 'px' }">
    <svg
      :viewBox="`0 0 ${geometry.W} ${geometry.H}`"
      class="chart-svg"
      preserveAspectRatio="xMidYMid meet"
    >
      <!-- 网格 + Y 轴 -->
      <g class="chart-grid">
        <line
          v-for="i in 5"
          :key="'g' + i"
          :x1="geometry.P"
          :x2="geometry.W - geometry.P"
          :y1="geometry.P + (i - 1) * (geometry.H - geometry.P * 2) / 4"
          :y2="geometry.P + (i - 1) * (geometry.H - geometry.P * 2) / 4"
          stroke="#e5e7eb"
          stroke-dasharray="3 3"
          stroke-width="1"
        />
        <text
          v-for="(tick, i) in yTicks"
          :key="'t' + i"
          :x="geometry.P - 8"
          :y="geometry.P + i * (geometry.H - geometry.P * 2) / 4 + 4"
          text-anchor="end"
          fill="#8e8e93"
          font-size="11"
        >
          {{ tick }}
        </text>
      </g>

      <!-- 折线 -->
      <g v-for="(p, idx) in geometry.paths" :key="'p' + idx">
        <path
          :d="p.points.map((pt: any, i: number) => `${i === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`).join(' ')"
          fill="none"
          :stroke="p.color"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-for="(pt, i) in p.points"
          :key="'c' + idx + '-' + i"
          :cx="pt[0]"
          :cy="pt[1]"
          r="3.5"
          :fill="p.color"
        />
      </g>

      <!-- X 轴 -->
      <g class="chart-xaxis">
        <text
          v-for="(y, i) in geometry.years"
          :key="'x' + i"
          :x="geometry.P + i * geometry.xStep"
          :y="geometry.H - geometry.P + 20"
          text-anchor="middle"
          fill="#8e8e93"
          font-size="11"
        >
          {{ y }}
        </text>
      </g>
    </svg>

    <div class="chart-legend">
      <div
        v-for="(p, idx) in geometry.paths"
        :key="'l' + idx"
        class="chart-legend__item"
      >
        <span class="chart-legend__dot" :style="{ background: p.color }"></span>
        <span>{{ p.name }}</span>
      </div>
    </div>
  </div>

  <div v-else class="chart-svg-empty">
    <UIcon name="i-lucide-bar-chart-3" class="size-4" />
    <span>暂无数据</span>
  </div>
</template>

<style scoped>
.chart-svg-wrap {
  width: 100%;
  background: var(--color-surface-1);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.chart-svg {
  width: 100%;
  height: auto;
  display: block;
}

.chart-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-border-light);
}
.chart-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-ink-1000);
}
.chart-legend__dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.chart-svg-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 240px;
  color: var(--color-ink-500);
  font-size: 13px;
}
</style>
