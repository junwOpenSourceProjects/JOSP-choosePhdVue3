<script setup lang="ts">
/**
 * SectionHeader · 页面小节标题
 *
 * eyebrow + h2 + subtitle 的标准组合，减少重复 CSS。
 */
defineProps<{
  eyebrow?: string
  title: string
  subtitle?: string
}>()
</script>

<template>
  <div class="section-header">
    <div v-if="eyebrow" class="section-header__eyebrow">{{ eyebrow }}</div>
    <h2 class="section-header__title">{{ title }}</h2>
    <p v-if="subtitle" class="section-header__subtitle">{{ subtitle }}</p>
  </div>
</template>

<style scoped>
.section-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 20px;
}
.section-header__eyebrow {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand-blue);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.section-header__title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  line-height: 1.30;
  color: var(--color-ink);
  margin: 0;
}
@media (min-width: 768px) {
  .section-header__title { font-size: 32px; letter-spacing: -0.5px; }
}
.section-header__subtitle {
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--color-slate);
  margin: 0;
}
</style>
