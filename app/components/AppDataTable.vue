<script setup lang="ts" generic="T extends Record<string, any>">
interface Column {
  key: string
  label: string
  align?: 'left' | 'center' | 'right'
}

interface Props {
  columns: Column[]
  rows: T[]
  loading?: boolean
}

const props = defineProps<Props>()

const alignClass = (align?: 'left' | 'center' | 'right') => {
  const map = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }
  return map[align || 'left']
}
</script>

<template>
  <div class="w-full border border-[var(--color-hairline)] rounded-[var(--rounded-md)] overflow-hidden bg-[var(--color-canvas)]">
    <table class="w-full text-[var(--text-body-sm)]">
      <thead class="bg-[var(--color-surface)] text-[var(--color-steel)]">
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            class="px-[var(--spacing-md)] py-[var(--spacing-sm)] font-semibold text-[var(--text-caption)]"
            :class="alignClass(col.align)"
          >
            {{ col.label }}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading" class="border-b border-[var(--color-hairline-soft)]">
          <td :colspan="columns.length" class="px-[var(--spacing-md)] py-[var(--spacing-md)] text-[var(--color-steel)]">
            加载中…
          </td>
        </tr>
        <tr v-else-if="rows.length === 0" class="border-b border-[var(--color-hairline-soft)]">
          <td :colspan="columns.length" class="px-[var(--spacing-md)] py-[var(--spacing-md)] text-[var(--color-steel)]">
            暂无数据
          </td>
        </tr>
        <tr
          v-for="(row, idx) in rows"
          :key="idx"
          class="border-b border-[var(--color-hairline-soft)] last:border-b-0 hover:bg-[var(--color-surface-soft)] transition-colors"
        >
          <td
            v-for="col in columns"
            :key="col.key"
            class="px-[var(--spacing-md)] py-[var(--spacing-md)]"
            :class="alignClass(col.align)"
          >
            <slot :name="col.key" :row="row" :value="row[col.key]">
              {{ row[col.key] ?? '-' }}
            </slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
