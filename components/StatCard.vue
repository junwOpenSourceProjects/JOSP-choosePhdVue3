<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint?: string
  icon?: string
}>()
</script>

<template>
  <div class="stat-card">
    <div class="stat-card__top">
      <span v-if="icon" class="stat-card__icon">
        <UIcon :name="icon" class="size-5" />
      </span>
      <span class="stat-card__label">{{ label }}</span>
    </div>
    <div class="stat-card__value">{{ value }}</div>
    <div v-if="hint" class="stat-card__hint">{{ hint }}</div>
  </div>
</template>

<style scoped>
.stat-card__top {
  display: flex;
  align-items: center;
  gap: 8px;
}
.stat-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(20, 86, 240, 0.08);
  color: var(--color-brand-900);
}
</style>
