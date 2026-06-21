<script setup lang="ts">
/**
 * DESIGN.md §testimonial-stat-row
 * 大数字 {typography.heading-lg} (40px) · 副标 {typography.body-sm} {colors.steel}
 * 白底 + 16px 圆角 + 1px hairline border
 */
defineProps<{
  label: string
  value: string | number
  hint?: string
  primary?: boolean
  icon?: string
}>()
</script>

<template>
  <div class="stat">
    <div class="stat__head">
      <span class="stat__label">{{ label }}</span>
      <UIcon v-if="icon" :name="icon" class="stat__icon" />
    </div>
    <div class="stat__value" :class="{ 'is-primary': primary }">
      {{ value }}
    </div>
    <div v-if="hint" class="stat__hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
.stat {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: var(--radius-xl);
  transition: box-shadow 200ms ease;
}
.stat:hover {
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px 0px;
}
.stat__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.stat__label {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.7;
  color: var(--color-slate);
}
.stat__icon {
  width: 16px;
  height: 16px;
  color: var(--color-steel);
}
.stat__value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.5px;
  color: var(--color-ink);
}
.stat__value.is-primary {
  color: var(--color-brand-blue);
}
.stat__hint {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-stone);
}
</style>