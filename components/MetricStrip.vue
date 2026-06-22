<script setup lang="ts">
/**
 * MetricStrip · 关键事实条
 *
 * 4 列独立小卡：数据跨度 / 最佳排名 / 覆盖维度 / 最新完整度
 * 数据全部从 chartData 派生，不发额外 API
 */
import type { EchartsDTO } from '~/types'

interface MetricItem {
  icon: string
  iconBg: string
  iconColor: string
  primary: string
  secondary: string
}

const props = defineProps<{
  chart: EchartsDTO | null
  schoolName: string
}>()

// 1. 跨度
const spanText = computed(() => {
  const years = props.chart?.legendData ?? []
  if (!years.length) return { primary: '—', secondary: '暂无跨度数据' }
  return {
    primary: `${years[0]}-${years[years.length - 1]}`,
    secondary: `共 ${years.length} 段数据`,
  }
})

// 2. 最佳年
const bestEver = computed(() => {
  const series = props.chart?.chatData?.series ?? []
  const years = props.chart?.legendData ?? []
  if (!series.length || !years.length) return { primary: '—', secondary: '暂无最佳记录' }
  let best = Infinity
  let bestPos = ''
  let bestDim = ''
  for (const s of series) {
    const data = (s.data ?? []) as (number | null)[]
    for (let i = 0; i < data.length; i++) {
      const v = data[i]
      if (v != null && v > 0 && v < best) {
        best = v
        bestPos = years[i] ?? String(i + 1)
        for (const k of ['qs', 'qs_cs', 'usnews', 'usnews_cs']) {
          if (s.name?.endsWith(k)) { bestDim = k; break }
        }
      }
    }
  }
  if (best >= Infinity) return { primary: '—', secondary: '暂无最佳记录' }
  const DIM_NAMES: Record<string, string> = {
    qs: 'QS', qs_cs: 'QS CS',
    usnews: 'USN', usnews_cs: 'USN CS'
  }
  return {
    primary: `第 ${best} 名`,
    secondary: `${bestPos} 年 · ${DIM_NAMES[bestDim] ?? bestDim}`
  }
})

// 3. 覆盖榜单
const coverage = computed(() => {
  const series = props.chart?.chatData?.series ?? []
  return {
    primary: `${series.length || 4}`,
    secondary: '4 维榜单覆盖'
  }
})

// 4. 最新段完整度
const recentCompleteness = computed(() => {
  const series = props.chart?.chatData?.series ?? []
  if (!series.length) return { primary: '—', secondary: '暂无数据' }
  const years = props.chart?.legendData ?? []
  const lastPos = years[years.length - 1]
  let count = 0
  for (const s of series) {
    const data = (s.data ?? []) as (number | null)[]
    const last = data[data.length - 1]
    if (last != null && last > 0) count++
  }
  return {
    primary: `${count} / ${series.length}`,
    secondary: `${lastPos} 年 4 维完整度`
  }
})

const items = computed<MetricItem[]>(() => [
  {
    icon: 'i-lucide-calendar-days',
    iconBg: '#dbeafe',
    iconColor: '#1d4ed8',
    primary: spanText.value.primary,
    secondary: spanText.value.secondary,
  },
  {
    icon: 'i-lucide-trophy',
    iconBg: '#dcfce7',
    iconColor: '#15803d',
    primary: bestEver.value.primary,
    secondary: bestEver.value.secondary,
  },
  {
    icon: 'i-lucide-layers',
    iconBg: '#fce7f3',
    iconColor: '#be185d',
    primary: coverage.value.primary,
    secondary: coverage.value.secondary,
  },
  {
    icon: 'i-lucide-database',
    iconBg: '#fef3c7',
    iconColor: '#b45309',
    primary: recentCompleteness.value.primary,
    secondary: recentCompleteness.value.secondary,
  },
])
</script>

<template>
  <section class="metric-strip">
    <div class="metric-strip__grid">
      <div
        v-for="(item, i) in items"
        :key="i"
        class="metric-strip__card"
      >
        <div class="metric-strip__icon" :style="{ background: item.iconBg, color: item.iconColor }">
          <UIcon :name="item.icon" class="size-4" />
        </div>
        <div class="metric-strip__body">
          <div class="metric-strip__value">{{ item.primary }}</div>
          <div class="metric-strip__label">{{ item.secondary }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.metric-strip__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 768px) {
  .metric-strip__grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
}
.metric-strip__card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  transition: all 200ms ease;
}
.metric-strip__card:hover {
  border-color: var(--color-ink);
  transform: translateY(-2px);
  box-shadow: var(--shadow-card);
}
.metric-strip__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}
.metric-strip__body {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}
.metric-strip__value {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  color: var(--color-ink);
  letter-spacing: -0.2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.metric-strip__label {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--color-stone);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
