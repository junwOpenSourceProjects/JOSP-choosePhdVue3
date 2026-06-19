<script setup lang="ts">
import type { ConsiderType } from '~/types'

const props = defineProps<{
  value: number | null | undefined
  size?: 'sm' | 'md'
}>()

const label = computed(() => {
  if (props.value === 1) return '考虑'
  if (props.value === 0) return '不考虑'
  return '—'
})

const cls = computed(() => {
  if (props.value === 1) return 'status-chip status-chip--consider'
  if (props.value === 0) return 'status-chip status-chip--skip'
  return 'status-chip status-chip--weak'
})
</script>

<template>
  <span :class="[cls, size === 'sm' ? 'is-sm' : '']">
    {{ label }}
  </span>
</template>

<style scoped>
.is-sm {
  font-size: 11px;
  padding: 2px 8px;
}
</style>
