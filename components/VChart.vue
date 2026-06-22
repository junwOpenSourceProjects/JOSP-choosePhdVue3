<script setup lang="ts">
/**
 * VChart · ECharts 统一封装（懒加载版）
 *
 * 接受与旧 SVG 相同的数据结构:
 *   chart: { chatData: { series: [{ name, data: number[] }] }, legendData: string[] }
 *
 * 默认渲染折线图，Y 轴反转（排名 1 在上方）。
 * ECharts 与 vue-echarts 均动态导入，避免首屏打包。
 */
import { computed, defineAsyncComponent, ref } from 'vue'

const VChartBase = defineAsyncComponent(() => import('vue-echarts'))

const echartsReady = ref(false)
const echartsError = ref<string | null>(null)

async function initEcharts() {
  if (echartsReady.value) return
  try {
    const [{ use }, { CanvasRenderer }, { LineChart, BarChart }, {
      GridComponent,
      TooltipComponent,
      LegendComponent,
      DataZoomComponent,
      MarkLineComponent,
    }] = await Promise.all([
      import('echarts/core'),
      import('echarts/renderers'),
      import('echarts/charts'),
      import('echarts/components'),
    ])
    use([
      CanvasRenderer,
      LineChart,
      BarChart,
      GridComponent,
      TooltipComponent,
      LegendComponent,
      DataZoomComponent,
      MarkLineComponent,
    ])
    echartsReady.value = true
  } catch (e: any) {
    echartsError.value = e?.message || '图表库加载失败'
  }
}

onMounted(() => {
  initEcharts()
})

type ChartType = 'line' | 'bar'

interface Props {
  chart: any
  height?: number
  type?: ChartType
  smooth?: boolean
  showLegend?: boolean
  showTooltip?: boolean
  /** 是否把 Y 轴反转（排名类数据：1 在上） */
  inverseY?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: 320,
  type: 'line',
  smooth: false,
  showLegend: true,
  showTooltip: true,
  inverseY: true,
})

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
  '#a855f7', // violet
]

const geometry = computed(() => {
  const seriesRaw = props.chart?.chatData?.series ?? []
  const years = (props.chart?.legendData ?? []) as string[]
  if (!seriesRaw.length) return null

  // 按实际 series 长度裁剪 years
  const seriesLen = (seriesRaw[0]?.data ?? []).length
  const trimmedYears = years.length > seriesLen ? years.slice(years.length - seriesLen) : years

  const series = seriesRaw.map((s: any, idx: number) => ({
    name: s.name ?? `系列 ${idx + 1}`,
    type: props.type,
    smooth: props.smooth,
    symbol: 'circle',
    symbolSize: 6,
    lineStyle: { width: 2.5 },
    itemStyle: { color: PALETTE[idx % PALETTE.length] },
    data: (s.data ?? []).map((v: any) => (typeof v === 'number' && v > 0 ? v : null)),
  }))

  return { years: trimmedYears, series }
})

const option = computed(() => {
  if (!geometry.value) return {}
  const { years, series } = geometry.value
  return {
    backgroundColor: 'transparent',
    grid: {
      left: 16,
      right: 16,
      top: 32,
      bottom: 32,
      containLabel: true,
    },
    tooltip: props.showTooltip
      ? {
          trigger: 'axis',
          backgroundColor: 'rgba(255,255,255,0.96)',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          textStyle: { color: '#0a0a0a', fontSize: 12 },
          formatter: (params: any[]) => {
            const year = params[0]?.axisValue ?? ''
            const rows = params
              .filter(p => p.value != null)
              .map(p => {
                const marker = `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color};margin-right:6px"></span>`
                return `${marker}${p.seriesName}: <strong>#${p.value}</strong>`
              })
            if (!rows.length) return `${year}<br/>暂无数据`
            return `<div style="font-weight:600;margin-bottom:4px">${year}</div>${rows.join('<br/>')}`
          },
        }
      : undefined,
    legend: props.showLegend
      ? {
          bottom: 0,
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { color: '#45515e', fontSize: 12 },
        }
      : undefined,
    xAxis: {
      type: 'category',
      data: years,
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#5f5f5f', fontSize: 11, interval: 0 },
    },
    yAxis: {
      type: 'value',
      inverse: props.inverseY,
      splitLine: { lineStyle: { color: '#f2f3f5' } },
      axisLabel: { color: '#5f5f5f', fontSize: 11 },
    },
    series,
  }
})
</script>

<template>
  <ClientOnly>
    <div v-if="echartsError" class="v-chart-empty">
      <UIcon name="i-lucide-triangle-alert" class="size-4" />
      <span>{{ echartsError }}</span>
    </div>
    <div v-else-if="!echartsReady" class="v-chart-fallback" :style="{ height: `${height}px` }">
      <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
      <span>图表加载中…</span>
    </div>
    <VChartBase
      v-else-if="geometry"
      class="v-chart"
      :option="option"
      :autoresize="true"
      :style="{ height: `${height}px` }"
    />
    <div v-else class="v-chart-empty">
      <UIcon name="i-lucide-bar-chart-3" class="size-4" />
      <span>暂无数据</span>
    </div>

    <template #fallback>
      <div class="v-chart-fallback" :style="{ height: `${height}px` }">
        <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
        <span>图表加载中…</span>
      </div>
    </template>
  </ClientOnly>
</template>

<style scoped>
.v-chart {
  width: 100%;
}
.v-chart-empty,
.v-chart-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: var(--color-surface-1);
  border-radius: var(--radius-xl);
  color: var(--color-stone);
  font-size: 13px;
}
</style>
