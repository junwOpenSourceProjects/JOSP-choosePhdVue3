<script setup lang="ts">
import { queryAll, queryAllEcharts } from '~/lib/api/university'
import { queryRankingStatus } from '~/lib/api/ranking'

useHead({ title: '首页 · 选校系统' })

// 平台总览统计 - client 端按需加载,避免 SSR 不可用 (后端 8081 未启动时)
const totalUniversities = ref(0)
const myChoicesCount = ref(0)
const consideredCount = ref(0)
const trackedSeries = ref(0)

async function loadStats() {
  if (import.meta.server) return // SSR 跳过
  try {
    const [qs, status, echarts] = await Promise.all([
      queryAll({ page: 1, limit: 1 }).catch(() => null),
      queryRankingStatus().catch(() => []),
      queryAllEcharts({ currentRank: 50 }).catch(() => null)
    ])
    totalUniversities.value = qs?.total ?? 0
    myChoicesCount.value = Array.isArray(status) ? status.length : 0
    consideredCount.value = Array.isArray(status)
      ? status.filter((s: any) => s.consider === 1).length
      : 0
    trackedSeries.value = echarts?.series?.length ?? 0
  } catch (e) {
    console.warn('[home] stats load failed', e)
  }
}

onMounted(loadStats)

const modules = [
  {
    icon: 'i-lucide-library',
    title: '学校库',
    desc: '多维过滤:QS / US News · 综合 / 计算机 · 国家 / 洲 · 排名区间',
    to: '/universities',
    cta: '浏览学校'
  },
  {
    icon: 'i-lucide-clipboard-check',
    title: '我的选校',
    desc: '标记「考虑 / 不考虑」,按 QS / 计算机 / US News / 整体 4 维评估强弱',
    to: '/choices',
    cta: '管理清单'
  },
  {
    icon: 'i-lucide-line-chart',
    title: '数据图表',
    desc: '历年排名趋势可视化,Top N 大学对比,单校深度分析',
    to: '/charts',
    cta: '查看趋势'
  },
  {
    icon: 'i-lucide-zap',
    title: '快速初始化',
    desc: '一键导入全部监控大学,自动同步国家/地区标签',
    to: '/choices?init=1',
    cta: '初始化清单'
  }
]

const features = [
  {
    icon: 'i-lucide-database',
    title: '多源数据',
    desc: 'QS World + US News 综合与计算机 4 套排名并行,统一表格'
  },
  {
    icon: 'i-lucide-sliders-horizontal',
    title: '多维过滤',
    desc: '国家 / 洲 / 排名区间 / 排名类型组合筛选,毫秒响应'
  },
  {
    icon: 'i-lucide-pie-chart',
    title: '可视化',
    desc: '历年趋势折线 / Top N 对比 / 单校详情,4 维图表'
  },
  {
    icon: 'i-lucide-bookmark-check',
    title: '状态管理',
    desc: '「考虑 / 不考虑」标记 + 弱/中/强评级,辅助决策'
  }
]
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="bg-white py-20 md:py-24">
      <UContainer>
        <div class="mx-auto max-w-3xl text-center">
          <UBadge
            color="primary"
            variant="subtle"
            size="md"
            class="mb-6"
          >
            <UIcon name="i-lucide-sparkles" class="size-3.5" />
            <span class="ml-1.5">PhD 申请 · 数据驱动 · 选校决策</span>
          </UBadge>

          <h1
            class="text-4xl font-medium leading-[1.10] tracking-tight text-default sm:text-5xl md:text-[64px]"
            :style="{ fontFamily: 'var(--font-display)' }"
          >
            多源排名数据<br />
            让 PhD 选校 <span class="bg-gradient-to-r from-[#1456f0] to-[#60a5fa] bg-clip-text text-transparent">一目了然</span>
          </h1>
          <span
            class="mx-auto mt-2 size-2 shrink-0 rounded-full"
            :style="{ background: 'var(--color-brand-pink)' }"
            aria-hidden="true"
          />

          <p class="mt-4 text-lg font-medium leading-relaxed text-muted md:text-xl">
            整合 QS 世界大学排名、US News 全球大学排名,按综合 / 计算机科学双维度对比,
            结合历年趋势图表,助你高效做出选校决策。
          </p>

          <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
            <UButton
              to="/universities"
              color="primary"
              variant="solid"
              size="lg"
              icon="i-lucide-search"
            >立即查询大学</UButton>
            <UButton
              to="/charts"
              color="neutral"
              variant="outline"
              size="lg"
              icon="i-lucide-bar-chart-3"
            >查看趋势</UButton>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- Stat grid -->
    <UContainer class="-mt-6">
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="监控大学"
          :value="totalUniversities"
          hint="覆盖 QS + US News 双榜"
          icon="i-lucide-globe-2"
          tone="primary"
        />
        <StatCard
          label="选校清单"
          :value="myChoicesCount"
          hint="已添加的大学数"
          icon="i-lucide-clipboard-list"
          tone="neutral"
        />
        <StatCard
          label="正在考虑"
          :value="consideredCount"
          hint="标记为「考虑」"
          icon="i-lucide-bookmark-check"
          tone="success"
        />
        <StatCard
          label="趋势曲线"
          :value="trackedSeries"
          hint="可视化对比序列"
          icon="i-lucide-line-chart"
          tone="neutral"
        />
      </div>
    </UContainer>

    <!-- 4 Module Entry -->
    <UContainer class="mt-20">
      <div class="mb-8 text-center">
        <h2
          class="text-3xl font-semibold leading-tight text-default md:text-[31px]"
          :style="{ fontFamily: 'var(--font-display)' }"
        >四大核心模块</h2>
        <p class="mt-2 text-base text-muted">从查询到选校到趋势分析,一站式覆盖</p>
      </div>
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <NuxtLink
          v-for="m in modules"
          :key="m.to"
          :to="m.to"
          class="group flex flex-col gap-3 rounded-2xl border border-default bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent"
          :style="{ boxShadow: 'rgba(0,0,0,0.08) 0px 4px 6px' }"
        >
          <div
            class="inline-flex size-11 items-center justify-center rounded-xl"
            :style="{ background: 'rgba(20, 86, 240, 0.08)', color: 'var(--color-brand-900)' }"
          >
            <UIcon :name="m.icon" class="size-6" />
          </div>
          <div
            class="text-[22px] font-semibold leading-tight text-default"
            :style="{ fontFamily: 'var(--font-display)' }"
          >{{ m.title }}</div>
          <div class="flex-1 text-sm leading-relaxed text-muted">{{ m.desc }}</div>
          <div class="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--color-brand-900)]">
            <span>{{ m.cta }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </NuxtLink>
      </div>
    </UContainer>

    <!-- Features -->
    <UContainer class="mt-20">
      <div class="mb-8 text-center">
        <h2
          class="text-3xl font-semibold leading-tight text-default md:text-[31px]"
          :style="{ fontFamily: 'var(--font-display)' }"
        >平台特色</h2>
        <p class="mt-2 text-base text-muted">为 PhD 申请者量身打造</p>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="f in features"
          :key="f.title"
          class="flex flex-col gap-2.5 rounded-2xl bg-[var(--color-surface-1)] p-5 transition-all duration-200 hover:bg-white hover:shadow-sm"
        >
          <div
            class="inline-flex size-9 items-center justify-center rounded-[10px] bg-white text-[var(--color-brand-900)]"
          >
            <UIcon :name="f.icon" class="size-5" />
          </div>
          <div
            class="text-base font-semibold text-default"
            :style="{ fontFamily: 'var(--font-display)' }"
          >{{ f.title }}</div>
          <div class="text-[13px] leading-relaxed text-muted">{{ f.desc }}</div>
        </div>
      </div>
    </UContainer>
  </div>
</template>
