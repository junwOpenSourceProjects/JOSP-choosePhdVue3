<script setup lang="ts">
import type { StatusLevel } from '~/types'

const props = defineProps<{
  level: StatusLevel | null | undefined
  size?: 'sm' | 'md'
}>()

const label = computed(() => {
  if (props.level === null || props.level === undefined) return '—'
  if (props.level === 0) return '弱'
  if (props.level === 1) return '中'
  return '强'
})

const cls = computed(() => {
  if (props.level === null || props.level === undefined) return 'status-chip status-chip--weak'
  if (props.level === 0) return 'status-chip status-chip--weak'
  if (props.level === 1) return 'status-chip status-chip--medium'
  return 'status-chip status-chip--strong'
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
