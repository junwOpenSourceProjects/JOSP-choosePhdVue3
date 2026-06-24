<script setup lang="ts">
interface Stat {
  value: string
  label: string
}

interface Props {
  stats: Stat[]
}

defineProps<Props>()
</script>

<template>
  <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
    <div
      v-for="(stat, idx) in stats"
      :key="idx"
      class="text-center p-[var(--spacing-xl)]"
    >
      <div class="heading-lg text-[var(--color-ink)]">{{ stat.value }}</div>
      <div class="body-sm text-[var(--color-steel)] mt-1">{{ stat.label }}</div>
    </div>
  </div>
</template>
