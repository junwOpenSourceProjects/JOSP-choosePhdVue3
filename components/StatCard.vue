<script setup lang="ts">
defineProps<{
  label: string
  value: string | number
  hint?: string
  icon?: string
  tone?: 'primary' | 'neutral' | 'success'
}>()
</script>

<template>
  <UCard
    :ui="{
      root: 'rounded-2xl border border-default bg-white shadow-sm transition-transform duration-200 hover:-translate-y-0.5',
      body: 'p-6 sm:p-6'
    }"
  >
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-2.5">
        <span
          v-if="icon"
          class="inline-flex size-8 items-center justify-center rounded-xl"
          :class="[
            tone === 'success' ? 'bg-green-50 text-green-600'
              : tone === 'neutral' ? 'bg-gray-100 text-gray-700'
                : 'bg-blue-50 text-[var(--color-brand-900)]'
          ]"
        >
          <UIcon :name="icon" class="size-5" />
        </span>
        <span class="text-[13px] font-medium text-muted">{{ label }}</span>
      </div>
      <div
        class="text-[32px] font-semibold leading-tight tracking-tight text-default"
        :style="{ fontFamily: 'var(--font-display)' }"
      >{{ value }}</div>
      <div v-if="hint" class="text-xs text-subtle">{{ hint }}</div>
    </div>
  </UCard>
</template>
