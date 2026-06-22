<script setup lang="ts">
/**
 * AppEmpty · 统一空状态
 */
withDefaults(defineProps<{
  icon?: string
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg'
}>(), {
  icon: 'i-lucide-inbox',
  title: '暂无数据',
  description: '',
  size: 'md',
})
</script>

<template>
  <div :class="['app-empty', `app-empty--${size}`]">
    <UIcon :name="icon" :class="['app-empty__icon', `app-empty__icon--${size}`]" />
    <div class="app-empty__title">{{ title }}</div>
    <div v-if="description" class="app-empty__desc">{{ description }}</div>
    <div v-if="$slots.action" class="app-empty__action">
      <slot name="action" />
    </div>
  </div>
</template>

<style scoped>
.app-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: var(--color-stone);
}
.app-empty--sm { padding: 32px 16px; gap: 8px; }
.app-empty--md { padding: 64px 24px; gap: 12px; }
.app-empty--lg { padding: 96px 32px; gap: 16px; }

.app-empty__icon {
  color: var(--color-muted);
}
.app-empty__icon--sm { width: 24px; height: 24px; }
.app-empty__icon--md { width: 32px; height: 32px; }
.app-empty__icon--lg { width: 40px; height: 40px; }

.app-empty__title {
  font-family: var(--font-display);
  font-weight: 600;
  color: var(--color-ink);
}
.app-empty--sm .app-empty__title { font-size: 14px; }
.app-empty--md .app-empty__title { font-size: 18px; }
.app-empty--lg .app-empty__title { font-size: 24px; }

.app-empty__desc {
  font-size: 13px;
  color: var(--color-slate);
  max-width: 320px;
  line-height: 1.5;
}
.app-empty__action {
  margin-top: 4px;
}
</style>
