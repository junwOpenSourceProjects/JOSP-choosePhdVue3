<script setup lang="ts">
/**
 * StatusChip · 弱 / 中 / 强
 *
 * 直接用 UBadge，减少自定义样式碎片。
 */
type Level = 'weak' | 'medium' | 'strong' | null

const props = defineProps<{
  level: Level
  label?: string
}>()

const config = computed(() => {
  switch (props.level) {
    case 'strong':
      return { color: 'primary', variant: 'solid', label: props.label ?? '强' }
    case 'medium':
      return { color: 'primary', variant: 'subtle', label: props.label ?? '中' }
    case 'weak':
      return { color: 'neutral', variant: 'subtle', label: props.label ?? '弱' }
    default:
      return null
  }
})
</script>

<template>
  <UBadge
    v-if="config"
    :color="config.color as any"
    :variant="config.variant as any"
    size="xs"
    :label="config.label"
    class="font-semibold"
  />
</template>
