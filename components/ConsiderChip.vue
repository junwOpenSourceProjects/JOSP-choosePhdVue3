<script setup lang="ts">
import type { ConsiderType } from '~/types'

const props = defineProps<{
  value: ConsiderType | number | null | undefined
  size?: 'sm' | 'md'
}>()

const label = computed(() => {
  if (props.value === 1) return '考虑'
  if (props.value === 0) return '不考虑'
  return '—'
})

const color = computed<'success' | 'error' | 'neutral'>(() => {
  if (props.value === 1) return 'success'
  if (props.value === 0) return 'error'
  return 'neutral'
})
</script>

<template>
  <UBadge
    :color="color"
    :variant="value === 1 ? 'subtle' : 'soft'"
    :size="size === 'sm' ? 'xs' : 'sm'"
  >{{ label }}</UBadge>
</template>
