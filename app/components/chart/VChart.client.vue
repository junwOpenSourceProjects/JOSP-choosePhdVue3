<script setup lang="ts">
// VChart · ECharts Vue 组件 (SSR-safe)
// 必须在 .client.vue 或 ClientOnly 内使用
import VChart from 'vue-echarts'

interface Props {
  option: Record<string, unknown>
  height?: string
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  height: '320px',
  loading: false
})

const mergedOption = computed(() => {
  if (props.loading) {
    return {
      ...props.option,
      title: {
        ...(props.option.title as Record<string, unknown>),
        text: '加载中…',
        left: 'center',
        top: 'middle',
        textStyle: { color: '#8e8e93', fontSize: 14, fontWeight: 'normal' }
      }
    }
  }
  return props.option
})
</script>

<template>
  <div class="chart-wrap" :style="{ height }">
    <VChart :option="mergedOption" :autoresize="true" :update-options="{ notMerge: true }" class="chart" />
  </div>
</template>

<style scoped>
.chart-wrap {
  width: 100%;
  position: relative;
}
.chart {
  width: 100%;
  height: 100%;
}
</style>