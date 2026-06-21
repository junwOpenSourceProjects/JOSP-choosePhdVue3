<script setup lang="ts">
/**
 * DESIGN.md §rank-card
 * 4 维排名大数字 + sparkline 趋势线 + 上升/下降/平稳徽章
 * 一张卡答 1 个问题: "这维度现在多少? 历年怎么变?"
 *
 * rank: 当前排名 (number | null)
 * series: 历年排名数组 [null, null, ..., 11, 14, 14, ...] (数字=排名, null=未上榜)
 * color: 品牌色 (#1456f0)
 * years: 对应 series 的年份数组 ['2018', ..., '2026']
 */
const props = defineProps<{
  label: string
  icon: string
  color: string
  rank: number | null | undefined
  series: (number | null)[]
  years: string[]
}>()

// 把排名数组映射成 sparkline 路径 (归一化, 数字越大越靠上 = 排名越靠前)
const sparkPath = computed(() => {
  const data = props.series.filter((v): v is number => typeof v === 'number' && v > 0)
  if (data.length < 2) return ''
  const W = 200, H = 48, P = 4
  const maxV = Math.max(...data, 10) * 1.1
  const minV = Math.min(...data, 1) * 0.9
  const range = Math.max(maxV - minV, 1)
  const xStep = (W - P * 2) / Math.max(1, props.series.length - 1)
  return props.series.map((v, i) => {
    if (v == null || v <= 0) return null
    const x = P + i * xStep
    // 排名越低 (=数字越小) 越靠上, Y 越小
    const y = H - P - ((v - minV) / range) * (H - P * 2)
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
  }).filter(Boolean).join(' ')
})

const sparkArea = computed(() => {
  const path = sparkPath.value
  if (!path) return ''
  return `${path} L196,44 L4,44 Z`
})

// 趋势: 当前 vs 5 年前
const trend = computed(() => {
  const data = props.series.filter((v): v is number => typeof v === 'number' && v > 0)
  if (data.length < 2) return null
  const current = data[data.length - 1]
  const prev = data[Math.max(0, data.length - 6)] // 5 年前
  if (current == null || prev == null) return null
  const diff = current - prev
  if (diff === 0) return { type: 'flat', label: '持平', icon: 'i-lucide-minus' }
  if (diff < 0) return { type: 'up', label: `↑ ${Math.abs(diff)}`, icon: 'i-lucide-trending-up' }
  return { type: 'down', label: `↓ ${diff}`, icon: 'i-lucide-trending-down' }
})

// 历史最佳 (数字最小 = 排名最高)
const best = computed(() => {
  let minVal = Infinity
  let minIdx = -1
  props.series.forEach((v, i) => {
    if (v != null && v > 0 && v < minVal) { minVal = v; minIdx = i }
  })
  if (minIdx < 0) return null
  return { rank: minVal, year: props.years[minIdx] }
})

const tierClass = computed(() => {
  if (props.rank == null) return 'rank-card__badge--none'
  if (props.rank <= 10) return 'rank-card__badge--gold'
  if (props.rank <= 50) return 'rank-card__badge--silver'
  if (props.rank <= 100) return 'rank-card__badge--bronze'
  return 'rank-card__badge--normal'
})
</script>

<template>
  <div class="rank-card">
    <div class="rank-card__head">
      <div
        class="rank-card__icon"
        :style="{ background: color + '14', color }"
      >
        <UIcon :name="icon" class="size-4" />
      </div>
      <div class="rank-card__meta">
        <div class="rank-card__label">{{ label }}</div>
        <div v-if="best" class="rank-card__best">历史最佳 #{{ best.rank }} · {{ best.year }}</div>
      </div>
      <span
        v-if="trend"
        class="rank-card__trend"
        :class="`rank-card__trend--${trend.type}`"
      >
        <UIcon :name="trend.icon" class="size-3" />
        {{ trend.label }}
      </span>
    </div>
    <div class="rank-card__body">
      <div class="rank-card__rank" :style="{ color }">
        <span v-if="rank != null">{{ rank }}</span>
        <span v-else class="rank-card__rank--none">—</span>
        <span v-if="rank != null" class="rank-card__rank-suffix">位</span>
      </div>
      <svg
        v-if="sparkPath"
        viewBox="0 0 200 48"
        preserveAspectRatio="none"
        class="rank-card__spark"
      >
        <defs>
          <linearGradient :id="`grad-${color.replace('#', '')}`" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" :stop-color="color" stop-opacity="0.18" />
            <stop offset="100%" :stop-color="color" stop-opacity="0" />
          </linearGradient>
        </defs>
        <path :d="sparkArea" :fill="`url(#grad-${color.replace('#', '')})`" />
        <path
          :d="sparkPath"
          fill="none"
          :stroke="color"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
      <div v-else class="rank-card__spark rank-card__spark--empty">
        <span class="rank-card__hint">暂无趋势</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rank-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  transition: box-shadow 200ms ease, transform 200ms ease;
}
.rank-card:hover {
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 12px 0px;
  transform: translateY(-2px);
}
.rank-card__head {
  display: flex;
  align-items: center;
  gap: 12px;
}
.rank-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  flex-shrink: 0;
}
.rank-card__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}
.rank-card__label {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-slate);
}
.rank-card__best {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 400;
  color: var(--color-stone);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rank-card__trend {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.rank-card__trend--up { background: #dcfce7; color: #15803d; }
.rank-card__trend--down { background: #fee2e2; color: #b91c1c; }
.rank-card__trend--flat { background: #f1f5f9; color: #64748b; }

.rank-card__body {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  margin-top: 4px;
}
.rank-card__rank {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -1px;
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
}
.rank-card__rank--none {
  color: var(--color-stone);
  font-weight: 400;
}
.rank-card__rank-suffix {
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-stone);
  margin-left: 2px;
}
.rank-card__spark {
  width: 200px;
  height: 48px;
  flex-shrink: 0;
}
.rank-card__spark--empty {
  display: flex;
  align-items: center;
  justify-content: center;
}
.rank-card__hint {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--color-stone);
}
</style>
