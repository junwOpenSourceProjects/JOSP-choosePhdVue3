// plugins/echarts.client.ts
// SSR-safe ECharts 注册 · 动态 import + tree-shake
// 注意: 文件名 .client.ts → 只在客户端执行,SSR 不加载 ECharts

import { defineNuxtPlugin } from '#app'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import {
  LineChart,
  BarChart,
  RadarChart,
  ScatterChart
} from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  RadarComponent,
  MarkLineComponent
} from 'echarts/components'

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  RadarChart,
  ScatterChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DatasetComponent,
  RadarComponent,
  MarkLineComponent
])

export default defineNuxtPlugin(() => {
  // 注册完成,客户端可直接 import { use } from 'echarts/core'
})