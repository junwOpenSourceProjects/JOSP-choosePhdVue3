<script setup lang="ts">
/**
 * DESIGN.md §badge-success (考虑)
 * 考虑 / 不考虑 二态
 */
defineProps<{
  consider: 0 | 1 | null
}>()
</script>

<template>
  <span v-if="consider === 1" class="chip chip--consider">
    <UIcon name="i-lucide-check" class="size-3" />
    考虑
  </span>
  <span v-else-if="consider === 0" class="chip chip--skip">
    <UIcon name="i-lucide-x" class="size-3" />
    不考虑
  </span>
  <span v-else class="chip chip--none">未标记</span>
</template>

<style scoped>
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
}
/* DESIGN.md §badge-success: 成功 = success-bg + success-text */
.chip--consider {
  background: var(--color-success-bg);
  color: var(--color-success-text);
}
/* 不考虑 = 红色 wash (DESIGN.md 提到 d45656) */
.chip--skip {
  background: #fee2e2;
  color: #b91c1c;
}
.chip--none {
  background: var(--color-surface-soft);
  color: var(--color-stone);
}
</style>