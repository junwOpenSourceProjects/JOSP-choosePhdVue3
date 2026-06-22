<script setup lang="ts">
import { rankTier } from '~/utils/rank'

/**
 * RankBadge · 排名徽章
 *
 * 金 / 银 / 铜 / 普通 四态，用于表格、卡片、详情页。
 * Top 3 金，Top 10 银，Top 50 铜，其余普通。
 */
const props = defineProps<{
  rank: number | null | undefined
  size?: 'md' | 'sm'
}>()

const tier = computed(() => rankTier(props.rank))

const display = computed(() => {
  if (props.rank == null) return '—'
  return String(props.rank)
})
</script>

<template>
  <span :class="['rank-badge', `rank-badge--${tier}`, `rank-badge--${size ?? 'md'}`]">
    #{{ display }}
  </span>
</template>

<style scoped>
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-data);
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.01em;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.rank-badge--md {
  min-width: 44px;
  height: 28px;
  padding: 0 10px;
  border-radius: var(--radius-md);
  font-size: 14px;
}
.rank-badge--sm {
  min-width: 36px;
  height: 22px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 12px;
}
.rank-badge--gold {
  background: var(--gradient-rank-gold);
  color: var(--color-canvas);
}
.rank-badge--silver {
  background: var(--gradient-rank-silver);
  color: var(--color-ink);
}
.rank-badge--bronze {
  background: var(--gradient-rank-bronze);
  color: var(--color-canvas);
}
.rank-badge--normal {
  background: var(--color-surface-soft);
  color: var(--color-ink);
}
.rank-badge--none {
  background: var(--color-surface-soft);
  color: var(--color-stone);
}
</style>
