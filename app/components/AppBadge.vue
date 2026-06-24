<script setup lang="ts">
interface Props {
  variant: 'success' | 'new' | 'beta' | 'code'
  label: string
}

const props = defineProps<Props>()

const classes = computed(() => {
  const map = {
    success: 'badge badge-success',
    new: 'badge badge-new',
    beta: 'badge badge-beta',
    code: 'badge badge-code',
  }
  return map[props.variant]
})
</script>

<template>
  <span :class="classes">
    {{ label }}
  </span>
</template>
