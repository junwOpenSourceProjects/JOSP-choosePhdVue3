<script setup lang="ts">
/**
 * DESIGN.md §badge-success (考虑)
 * 弱/中/强 三档映射到 DESIGN.md 的语义色
 */
type Level = 'weak' | 'medium' | 'strong' | null
defineProps<{
  level: Level
  label?: string
}>()

const labelMap: Record<Exclude<Level, null>, string> = {
  weak: '弱',
  medium: '中',
  strong: '强'
}
</script>

<template>
  <span v-if="level" class="chip" :class="`chip--${level}`">
    {{ label ?? labelMap[level] }}
  </span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}
/* DESIGN.md: 弱 = 中性灰 (surface-soft + slate) */
.chip--weak {
  background: var(--color-surface-soft);
  color: var(--color-slate);
}
/* DESIGN.md: 中 = badge-beta 蓝 (brand-blue-200 + brand-blue-deep) */
.chip--medium {
  background: var(--color-brand-blue-200);
  color: var(--color-brand-blue-deep);
}
/* DESIGN.md: 强 = 黑底白字 (primary + on-primary) */
.chip--strong {
  background: var(--color-primary);
  color: var(--color-on-primary);
}
</style>