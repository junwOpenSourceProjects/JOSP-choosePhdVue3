<script setup lang="ts">
/**
 * AppError · 统一错误状态 + 重试
 */
withDefaults(defineProps<{
  title?: string
  description?: string
  retryLabel?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  title: '加载失败',
  description: '后端不可达，请检查服务后重试',
  retryLabel: '重试',
  size: 'md',
})

const emit = defineEmits<{
  retry: []
}>()
</script>

<template>
  <div :class="['app-error', `app-error--${size}`]">
    <UIcon name="i-lucide-alert-triangle" :class="['app-error__icon', `app-error__icon--${size}`]" />
    <div class="app-error__title">{{ title }}</div>
    <div class="app-error__desc">{{ description }}</div>
    <UButton
      v-if="retryLabel"
      icon="i-lucide-rotate-ccw"
      color="primary"
      variant="solid"
      size="sm"
      :label="retryLabel"
      class="rounded-full"
      @click="emit('retry')"
    />
  </div>
</template>

<style scoped>
.app-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: var(--color-surface);
  border: 1px dashed var(--color-hairline);
  border-radius: var(--radius-2xl);
}
.app-error--sm { padding: 24px 16px; gap: 8px; }
.app-error--md { padding: 64px 24px; gap: 12px; }
.app-error--lg { padding: 96px 32px; gap: 16px; }

.app-error__icon {
  color: var(--color-warning);
}
.app-error__icon--sm { width: 24px; height: 24px; }
.app-error__icon--md { width: 32px; height: 32px; }
.app-error__icon--lg { width: 40px; height: 40px; }

.app-error__title {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-ink);
}
.app-error--sm .app-error__title { font-size: 14px; }
.app-error--md .app-error__title { font-size: 18px; }
.app-error--lg .app-error__title { font-size: 24px; }

.app-error__desc {
  font-size: 13px;
  color: var(--color-slate);
  max-width: 320px;
  line-height: 1.5;
}
</style>
