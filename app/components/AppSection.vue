<script setup lang="ts">
interface Props {
  contained?: boolean
  padded?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  contained: true,
  padded: true,
})
</script>

<template>
  <section :class="[props.padded ? 'py-[var(--spacing-section)]' : '', props.class]">
    <div v-if="props.contained" class="container-page">
      <slot />
    </div>
    <slot v-else />
  </section>
</template>
