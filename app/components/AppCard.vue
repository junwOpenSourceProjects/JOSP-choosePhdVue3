<script setup lang="ts">
interface Props {
  variant?: 'base' | 'feature' | 'recommendation'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'base',
})

const classes = computed(() => {
  const map = {
    base: 'card-base',
    feature: 'card-feature',
    recommendation: 'card-recommendation',
  }
  return map[props.variant]
})
</script>

<template>
  <div :class="classes">
    <slot />
  </div>
</template>
