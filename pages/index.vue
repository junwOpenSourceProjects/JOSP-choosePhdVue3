<script setup lang="ts">
import { queryAll, queryAllEcharts } from '~/lib/api/university'
import { queryRankingStatus } from '~/lib/api/ranking'

useHead({ title: '首页 · 选校系统' })

// 平台能力指标 (来自设计决策: 不展示 user 行为 0/0/0 冷启动差, 展示平台能力)
const totalUniversities = ref(0)
const rankingSystems = ref(2) // QS + US News
const totalYears = ref(0)    // 历年聚合数
const trackedSeries = ref(0)
const statsLoaded = ref(false)

async function loadStats() {
  if (import.meta.server) return
  try {
    const [qs, echarts, status] = await Promise.all([
      queryAll({ page: 1, limit: 1 }).catch(() => null),
      queryAllEcharts({ currentRank: 50 }).catch(() => null),
      queryRankingStatus().catch(() => [])
    ])
    totalUniversities.value = qs?.total ?? 0
    trackedSeries.value = echarts?.series?.length ?? 0
    // 推算年份: status list 长度 = 实际有数据的 (name, year) 组合数
    totalYears.value = Array.isArray(status) ? new Set(status.map((s: any) => s.rankingYear)).size : 0
    statsLoaded.value = true
  } catch (e) {
    console.warn('[home] stats load failed', e)
  }
}

onMounted(loadStats)

// 4 模块: 1 主推 (featured) + 3 普通
const modules = [
  {
    icon: 'i-lucide-library',
    title: '学校库',
    desc: '多维过滤 QS / US News · 综合 / 计算机 · 国家 / 洲 · 排名区间',
    to: '/universities',
    cta: '浏览学校',
    featured: true
  },
  {
    icon: 'i-lucide-clipboard-check',
    title: '我的选校',
    desc: '标记「考虑 / 不考虑」, 按 QS / 计算机 / US News / 整体 4 维评估强弱',
    to: '/choices',
    cta: '管理清单',
    featured: false
  },
  {
    icon: 'i-lucide-line-chart',
    title: '数据图表',
    desc: '历年排名趋势可视化, Top N 大学对比, 单校深度分析',
    to: '/charts',
    cta: '查看趋势',
    featured: false
  },
  {
    icon: 'i-lucide-zap',
    title: '快速初始化',
    desc: '一键导入全部监控大学, 自动同步国家 / 地区标签',
    to: '/choices?init=1',
    cta: '初始化清单',
    featured: false
  }
]

const features = [
  {
    icon: 'i-lucide-database',
    title: '多源数据',
    desc: 'QS World + US News 综合与计算机 4 套排名并行, 统一表格'
  },
  {
    icon: 'i-lucide-sliders-horizontal',
    title: '多维过滤',
    desc: '国家 / 洲 / 排名区间 / 排名类型组合筛选, 毫秒响应'
  },
  {
    icon: 'i-lucide-pie-chart',
    title: '可视化',
    desc: '历年趋势折线 / Top N 对比 / 单校详情, 4 维图表'
  },
  {
    icon: 'i-lucide-bookmark-check',
    title: '状态管理',
    desc: '「考虑 / 不考虑」标记 + 弱 / 中 / 强评级, 辅助决策'
  }
]

// Hero demo 缩略图: 静态 mock 趋势线, 真实数据来自 /charts 页
const heroDemoLines = [
  { name: 'MIT', color: '#1456f0', points: [10, 8, 7, 5, 4, 3, 2, 1, 1, 1] },
  { name: 'Stanford', color: '#ea5ec1', points: [5, 4, 3, 3, 2, 2, 2, 3, 4, 3] },
  { name: 'Harvard', color: '#22c55e', points: [3, 2, 1, 2, 1, 1, 2, 1, 2, 1] }
]
const heroDemoYears = ['2017', '2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026']

function buildHeroPath(points: number[]) {
  const maxRank = 10
  const xStep = 100 / (points.length - 1)
  return points.map((p, i) => {
    const x = i * xStep
    const y = 100 - (p / maxRank) * 90
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
  }).join(' ')
}
</script>

<template>
  <div>
    <!-- Hero: 加 hero-with-orb 品牌氛围 + 真趋势图缩略图作视觉锚点 -->
    <section class="hero-with-orb py-20 md:py-28">
      <UContainer>
        <div class="grid items-center gap-12 md:grid-cols-2">
          <div class="text-left">
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
              class="text-4xl font-medium leading-[1.10] tracking-tight text-default sm:text-5xl md:text-[56px]"
              :style="{ fontFamily: 'var(--font-display)' }"
            >
              多源排名数据<br />
              让 PhD 选校 <span class="text-gradient-brand">一目了然</span>
            </h1>

            <p class="mt-5 text-lg font-medium leading-relaxed text-muted md:text-xl">
              整合 QS 世界大学排名、US News 全球大学排名, 按综合 / 计算机科学双维度对比,
              结合历年趋势图表, 助你高效做出选校决策。
            </p>

            <div class="mt-8 flex flex-wrap items-center gap-3">
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

            <div class="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-muted">
              <div class="inline-flex items-center gap-1.5">
                <UIcon name="i-lucide-shield-check" class="size-3.5 text-[var(--color-brand-900)]" />
                覆盖 1107+ 大学
              </div>
              <div class="inline-flex items-center gap-1.5">
                <UIcon name="i-lucide-database" class="size-3.5 text-[var(--color-brand-900)]" />
                2 大排名体系
              </div>
              <div class="inline-flex items-center gap-1.5">
                <UIcon name="i-lucide-zap" class="size-3.5 text-[var(--color-brand-900)]" />
                毫秒级响应
              </div>
            </div>
          </div>

          <!-- Hero 视觉锚点: 真实趋势图缩略图 -->
          <div
            class="rounded-3xl border border-default bg-white p-6 lift-on-hover"
            :style="{ boxShadow: 'var(--shadow-brand-strong)' }"
          >
            <div class="mb-3 flex items-center justify-between">
              <div class="text-[13px] font-semibold text-default" :style="{ fontFamily: 'var(--font-ui)' }">
                <UIcon name="i-lucide-trending-up" class="mr-1.5 inline size-3.5 text-[var(--color-brand-900)]" />
                历年 QS Top 10 趋势
              </div>
              <UBadge color="primary" variant="subtle" size="xs">DEMO</UBadge>
            </div>
            <div class="relative aspect-[4/3] w-full">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" class="absolute inset-0 h-full w-full">
                <!-- 网格线 -->
                <line x1="0" y1="10" x2="100" y2="10" stroke="#f2f3f5" stroke-width="0.3" />
                <line x1="0" y1="30" x2="100" y2="30" stroke="#f2f3f5" stroke-width="0.3" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#f2f3f5" stroke-width="0.3" />
                <line x1="0" y1="70" x2="100" y2="70" stroke="#f2f3f5" stroke-width="0.3" />
                <line x1="0" y1="90" x2="100" y2="90" stroke="#f2f3f5" stroke-width="0.3" />
                <path
                  v-for="line in heroDemoLines"
                  :key="line.name"
                  :d="buildHeroPath(line.points)"
                  fill="none"
                  :stroke="line.color"
                  stroke-width="0.8"
                  stroke-linejoin="round"
                  stroke-linecap="round"
                />
                <!-- 数据点 -->
                <g v-for="line in heroDemoLines" :key="line.name + '-dots'">
                  <circle
                    v-for="(p, i) in line.points"
                    :key="i"
                    :cx="(i * 100) / (line.points.length - 1)"
                    :cy="100 - (p / 10) * 90"
                    r="0.8"
                    :fill="line.color"
                  />
                </g>
              </svg>
              <div class="absolute bottom-0 left-0 right-0 flex justify-between px-1 text-[9px] text-subtle">
                <span v-for="y in heroDemoYears" :key="y">{{ y }}</span>
              </div>
            </div>
            <div class="mt-3 flex items-center gap-4 text-[11px] font-medium text-muted">
              <div v-for="line in heroDemoLines" :key="line.name" class="inline-flex items-center gap-1.5">
                <span class="size-2 rounded-full" :style="{ background: line.color }" />
                {{ line.name }}
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- KPI: 平台能力指标 (替代 0/0/0 冷启动观感) -->
    <UContainer class="-mt-6">
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          class="stat-card lift-on-hover"
          :style="{ background: 'var(--gradient-card-soft)' }"
        >
          <div class="flex items-center justify-between">
            <span class="stat-card__label">覆盖大学</span>
            <UIcon name="i-lucide-globe-2" class="size-4 text-[var(--color-brand-900)]" />
          </div>
          <span class="stat-card__value text-brand">{{ statsLoaded ? totalUniversities : '—' }}</span>
          <span class="stat-card__hint">QS + US News 双榜去重</span>
        </div>
        <div class="stat-card lift-on-hover">
          <div class="flex items-center justify-between">
            <span class="stat-card__label">排名体系</span>
            <UIcon name="i-lucide-layers" class="size-4 text-[var(--color-brand-900)]" />
          </div>
          <span class="stat-card__value text-brand">{{ rankingSystems }}</span>
          <span class="stat-card__hint">QS 世界 + US News 全球</span>
        </div>
        <div class="stat-card lift-on-hover">
          <div class="flex items-center justify-between">
            <span class="stat-card__label">历史年份</span>
            <UIcon name="i-lucide-calendar-range" class="size-4 text-[var(--color-brand-900)]" />
          </div>
          <span class="stat-card__value text-brand">{{ statsLoaded ? totalYears : '—' }}</span>
          <span class="stat-card__hint">覆盖年份数</span>
        </div>
        <div class="stat-card lift-on-hover">
          <div class="flex items-center justify-between">
            <span class="stat-card__label">趋势序列</span>
            <UIcon name="i-lucide-activity" class="size-4 text-[var(--color-brand-900)]" />
          </div>
          <span class="stat-card__value text-brand">{{ statsLoaded ? trackedSeries : '—' }}</span>
          <span class="stat-card__hint">可视化大学数</span>
        </div>
      </div>
    </UContainer>

    <!-- 4 模块: featured 差异化 -->
    <UContainer class="mt-20">
      <div class="mb-8 text-center">
        <h2
          class="text-3xl font-semibold leading-tight text-default md:text-[31px]"
          :style="{ fontFamily: 'var(--font-display)' }"
        >四大核心模块</h2>
        <p class="mt-2 text-base text-muted">从查询到选校到趋势分析, 一站式覆盖</p>
      </div>
      <div class="grid grid-cols-1 gap-5 md:grid-cols-2">
        <NuxtLink
          v-for="m in modules"
          :key="m.to"
          :to="m.to"
          class="group relative flex flex-col gap-3 overflow-hidden rounded-3xl border bg-white p-7 transition-all duration-300 lift-on-hover"
          :class="m.featured ? 'border-transparent md:row-span-2' : 'border-default'"
          :style="m.featured
            ? { background: 'var(--gradient-card-featured)', color: '#fff', boxShadow: 'var(--shadow-brand-strong)' }
            : { boxShadow: 'rgba(0,0,0,0.08) 0px 4px 6px' }"
        >
          <span
            v-if="m.featured"
            class="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white"
            :style="{ backdropFilter: 'blur(8px)' }"
          >
            <UIcon name="i-lucide-star" class="size-3" />
            主推
          </span>
          <div
            class="inline-flex size-11 items-center justify-center rounded-xl"
            :style="m.featured
              ? { background: 'rgba(255,255,255,0.18)', color: '#fff' }
              : { background: 'rgba(20, 86, 240, 0.08)', color: 'var(--color-brand-900)' }"
          >
            <UIcon :name="m.icon" class="size-6" />
          </div>
          <div
            class="text-[22px] font-semibold leading-tight"
            :class="m.featured ? 'text-white' : 'text-default'"
            :style="{ fontFamily: 'var(--font-display)' }"
          >{{ m.title }}</div>
          <div
            class="flex-1 text-sm leading-relaxed"
            :class="m.featured ? 'text-white/80' : 'text-muted'"
          >{{ m.desc }}</div>
          <div
            class="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold"
            :class="m.featured ? 'text-white' : 'text-[var(--color-brand-900)]'"
          >
            <span>{{ m.cta }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </NuxtLink>
      </div>
    </UContainer>

    <!-- 4 平台特色 -->
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
          class="flex flex-col gap-2.5 rounded-2xl border border-default bg-white p-5 lift-on-hover"
        >
          <div
            class="inline-flex size-9 items-center justify-center rounded-[10px]"
            :style="{ background: 'rgba(20, 86, 240, 0.08)', color: 'var(--color-brand-900)' }"
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
