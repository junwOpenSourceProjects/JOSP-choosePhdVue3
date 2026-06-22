<script setup lang="ts">
/**
 * StatCard · 大数字统计卡
 *
 * 用 UCard 包裹，保持 DESIGN.md 白底 + hairline 边框。
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
  <UCard
    :ui="{
      root: 'rounded-2xl border border-default bg-default ring-0',
      body: 'p-5',
    }"
  >
    <div class="stat__head">
      <span class="stat__label">{{ label }}</span>
      <UIcon v-if="icon" :name="icon" class="size-4 text-stone" />
    </div>
    <div class="stat__value" :class="{ 'stat__value--primary': primary }">
      {{ value }}
    </div>
    <div v-if="hint" class="stat__hint">{{ hint }}</div>
  </UCard>
</template>

<style scoped>
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
.stat__value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.5px;
  color: var(--color-ink);
  margin-top: 8px;
}
.stat__value--primary {
  color: var(--color-brand-blue);
}
.stat__hint {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-stone);
  margin-top: 4px;
}
</style>
