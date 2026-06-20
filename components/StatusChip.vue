<script setup lang="ts">
import type { StatusLevel } from '~/types'

const props = defineProps<{
  level: StatusLevel | number | null | undefined
  size?: 'sm' | 'md'
}>()

const label = computed(() => {
  if (props.level === null || props.level === undefined) return '—'
  if (props.level === 0) return '弱'
  if (props.level === 1) return '中'
  return '强'
})

const color = computed<'primary' | 'secondary' | 'success' | 'neutral'>(() => {
  if (props.level === null || props.level === undefined) return 'neutral'
  if (props.level === 0) return 'neutral'
  if (props.level === 1) return 'secondary'
  return 'primary'
})

const variant = computed<'subtle' | 'soft' | 'solid'>(() => {
  if (props.level === 2) return 'solid'
  return 'subtle'
})
</script>

<template>
  <UBadge
    :color="color"
    :variant="variant"
    :size="size === 'sm' ? 'xs' : 'sm'"
  >{{ label }}</UBadge>
</template>
