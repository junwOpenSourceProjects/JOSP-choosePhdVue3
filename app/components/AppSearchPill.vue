<script setup lang="ts">
const query = defineModel<string>('modelValue', { default: '' })

const emit = defineEmits<{
  search: [query: string]
}>()

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    emit('search', query.value)
  }
}
</script>

<template>
  <div class="search-pill w-full">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[var(--color-stone)] shrink-0">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
    <input
      v-model="query"
      type="text"
      placeholder="搜索大学、学科、榜单..."
      class="bg-transparent border-none outline-none flex-1 min-w-0 text-[var(--color-ink)] placeholder:text-[var(--color-muted)]"
      @keydown="onKeydown"
    >
  </div>
</template>
