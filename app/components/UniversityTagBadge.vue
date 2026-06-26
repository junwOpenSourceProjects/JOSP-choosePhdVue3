<script setup lang="ts">
import type { UniversityTag } from '~/types'

interface Props {
  tag: UniversityTag
}

const props = defineProps<Props>()

const style = computed(() => {
  const color = props.tag.color || 'var(--color-steel)'
  return {
    color,
    borderColor: color,
    backgroundColor: `${color}14`
  }
})
</script>

<template>
  <span
    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border"
    :style="style"
  >
    {{ tag.nameZh }}
  </span>
</template>
