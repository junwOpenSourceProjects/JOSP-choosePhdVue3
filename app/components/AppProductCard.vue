<script setup lang="ts">
interface Props {
  color: 'coral' | 'magenta' | 'blue' | 'purple' | 'photo'
  title: string
  tagline: string
  badge?: string
  to?: string
}

const props = defineProps<Props>()

const colorClass = computed(() => {
  const map = {
    coral: 'bg-[var(--color-brand-coral)]',
    magenta: 'bg-[var(--color-brand-magenta)]',
    blue: 'bg-[var(--color-brand-blue)]',
    purple: 'bg-[var(--color-brand-purple)]',
    photo: 'bg-[var(--color-primary)]',
  }
  return map[props.color]
})

const component = computed(() => (props.to ? resolveComponent('NuxtLink') : 'div'))
</script>

<template>
  <component
    :is="component"
    :to="to"
    :class="[
      'relative overflow-hidden rounded-[var(--rounded-xxxl)] p-[var(--spacing-xl)] text-[var(--color-on-dark)] min-h-[220px] flex flex-col justify-between',
      colorClass,
    ]"
  >
    <div v-if="badge" class="absolute top-4 right-4">
      <AppBadge variant="new" :label="badge" />
    </div>

    <div class="min-w-0">
      <h3 class="heading-sm break-words line-clamp-3 mb-2">{{ title }}</h3>
      <p class="caption opacity-80 line-clamp-2">{{ tagline }}</p>
    </div>

    <div v-if="$slots.action" class="mt-4">
      <slot name="action" />
    </div>
  </component>
</template>
