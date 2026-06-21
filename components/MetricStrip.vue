<script setup lang="ts">
/**
 * DESIGN.md §metric-strip
 * 院校详情页"关键事实条" - 1 行 4 个核心指标卡
 *
 * 1 屏答 1 个问题: "我对这学校的 4 个核心事实在哪?"
 *
 * 1. 历年排名跨度 (eg 2000-2027 · 跨度 22 年)
 * 2. 最佳年 (eg 2020 年 · QS 第 3 名, 数字最小)
 * 3. 覆盖榜单 (4 维 4 套数据)
 * 4. 最新年数据完整度 (2027 4 维里几个有数)
 *
 * 数据全部从 chartData 派生, 不发额外 API
 */
import type { EchartsDTO } from '~/types'

const props = defineProps<{
  chart: EchartsDTO | null
  schoolName: string
}>()

// 1. 跨度 (从 legendData 算)
const spanText = computed(() => {
  const years = props.chart?.legendData ?? []
  if (!years.length) return { primary: '—', secondary: '暂无跨度数据' }
  return {
    primary: `${years[0]}-${years[years.length - 1]}`,
    secondary: `跨度 ${years.length} 年`
  }
})

// 2. 最佳年: 在 4 维里找最小排名 + 对应年份
const bestEver = computed(() => {
  const series = props.chart?.chatData?.series ?? []
  const years = props.chart?.legendData ?? []
  if (!series.length || !years.length) return { primary: '—', secondary: '暂无最佳记录' }
  let best = Infinity
  let bestYear = ''
  let bestDim = ''
  for (const s of series) {
    const data = (s.data ?? []) as (number | null)[]
    for (let i = 0; i < data.length; i++) {
      const v = data[i]
      if (v != null && v > 0 && v < best) {
        best = v
        bestYear = years[i]
        // 从 series.name 解析维度
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
    secondary: `${bestYear} 年 · ${DIM_NAMES[bestDim] ?? bestDim}`
  }
})

// 3. 覆盖榜单 (固定 4 维)
const coverage = computed(() => {
  const series = props.chart?.chatData?.series ?? []
  return {
    primary: `${series.length || 4}`,
    secondary: '4 维榜单 (qs/qs_cs/usnews/usnews_cs)'
  }
})

// 4. 最新年完整度: 最后一年的 4 维里几个有数
const recentCompleteness = computed(() => {
  const series = props.chart?.chatData?.series ?? []
  if (!series.length) return { primary: '—', secondary: '暂无数据' }
  const years = props.chart?.legendData ?? []
  const lastYear = years[years.length - 1]
  let count = 0
  for (const s of series) {
    const data = (s.data ?? []) as (number | null)[]
    if (data.length && data[data.length - 1] != null && data[data.length - 1] > 0) {
      count++
    }
  }
  return {
    primary: `${count} / ${series.length}`,
    secondary: `${lastYear} 年 4 维完整度`
  }
})
</script>

<template>
  <section class="metric-strip">
    <div class="metric-strip__grid">
      <!-- 1. 跨度 -->
      <div class="metric-strip__item">
        <div class="metric-strip__icon" style="background:#dbeafe;color:#1d4ed8">
          <UIcon name="i-lucide-calendar-days" class="size-4" />
        </div>
        <div class="metric-strip__body">
          <div class="metric-strip__value">{{ spanText.primary }}</div>
          <div class="metric-strip__label">{{ spanText.secondary }}</div>
        </div>
      </div>
      <!-- 2. 最佳年 -->
      <div class="metric-strip__item">
        <div class="metric-strip__icon" style="background:#dcfce7;color:#15803d">
          <UIcon name="i-lucide-trophy" class="size-4" />
        </div>
        <div class="metric-strip__body">
          <div class="metric-strip__value">{{ bestEver.primary }}</div>
          <div class="metric-strip__label">{{ bestEver.secondary }}</div>
        </div>
      </div>
      <!-- 3. 覆盖 -->
      <div class="metric-strip__item">
        <div class="metric-strip__icon" style="background:#fce7f3;color:#be185d">
          <UIcon name="i-lucide-layers" class="size-4" />
        </div>
        <div class="metric-strip__body">
          <div class="metric-strip__value">{{ coverage.primary }} 维</div>
          <div class="metric-strip__label">{{ coverage.secondary }}</div>
        </div>
      </div>
      <!-- 4. 完整度 -->
      <div class="metric-strip__item">
        <div class="metric-strip__icon" style="background:#fef3c7;color:#b45309">
          <UIcon name="i-lucide-database" class="size-4" />
        </div>
        <div class="metric-strip__body">
          <div class="metric-strip__value">{{ recentCompleteness.primary }}</div>
          <div class="metric-strip__label">{{ recentCompleteness.secondary }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.metric-strip {
  background: var(--color-surface-1);
  border-radius: var(--radius-xl);
  padding: 4px;
  border: 1px solid var(--color-hairline);
}
.metric-strip__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0;
}
@media (min-width: 768px) {
  .metric-strip__grid { grid-template-columns: repeat(4, 1fr); }
}
.metric-strip__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-hairline);
  border-right: 1px solid var(--color-hairline);
}
@media (max-width: 767px) {
  .metric-strip__item:nth-child(2n) { border-right: 0; }
  .metric-strip__item:nth-last-child(-n+2) { border-bottom: 0; }
}
@media (min-width: 768px) {
  .metric-strip__item { border-bottom: 0; }
  .metric-strip__item:last-child { border-right: 0; }
}
.metric-strip__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
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
