<script setup lang="ts">
interface Props {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'link'
  size?: 'md' | 'sm'
  to?: string | object
  href?: string
  disabled?: boolean
  type?: 'button' | 'submit'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const component = computed(() => {
  if (props.href) return 'a'
  if (props.to) return resolveComponent('NuxtLink')
  return 'button'
})

const isExternal = computed(() => {
  return !!props.href || (typeof props.to === 'string' && /^https?:\/\//.test(props.to))
})

const classes = computed(() => {
  if (props.variant === 'link') {
    return 'btn-link'
  }

  const sizeClass = props.size === 'sm' ? 'btn-sm' : 'btn-md'
  const variantMap = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    tertiary: 'btn-tertiary',
  }

  return `btn-base ${sizeClass} ${variantMap[props.variant]}`
})
</script>

<template>
  <component
    :is="component"
    :to="component === 'NuxtLink' ? to : undefined"
    :href="href"
    :target="isExternal ? '_blank' : undefined"
    :rel="isExternal ? 'noopener noreferrer' : undefined"
    :disabled="component === 'button' ? disabled : undefined"
    :type="component === 'button' ? type : undefined"
    :class="classes"
    @click="component === 'button' && $emit('click', $event)"
  >
    <slot />
  </component>
</template>
