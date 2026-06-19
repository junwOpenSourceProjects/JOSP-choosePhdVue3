<script setup lang="ts">
import { queryAll, queryAllEcharts } from '~/lib/api/university'
import { queryRankingStatus } from '~/lib/api/ranking'

useHead({ title: '首页 · 选校系统' })

// 平台总览统计 - client 端按需加载,避免 SSR 不可用 (后端 8081 未启动时)
const totalUniversities = ref(0)
const myChoicesCount = ref(0)
const consideredCount = ref(0)
const trackedSeries = ref(0)
const loaded = ref(false)

async function loadStats() {
  if (import.meta.server) return  // SSR 跳过
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
  } finally {
    loaded.value = true
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
    <section class="hero">
      <div class="page-container">
        <div class="hero__inner">
          <div class="hero__badge">
            <UIcon name="i-lucide-sparkles" class="size-3" />
            <span>PhD 申请 · 数据驱动 · 选校决策</span>
          </div>
          <h1 class="hero__heading">
            多源排名数据<br />
            让 PhD 选校 <span class="hero__highlight">一目了然</span>
          </h1>
          <p class="hero__sub">
            整合 QS 世界大学排名、US News 全球大学排名,按综合 / 计算机科学双维度对比,
            结合历年趋势图表,助你高效做出选校决策。
          </p>
          <div class="hero__cta">
            <NuxtLink to="/universities" class="cta is-blue">
              <UIcon name="i-lucide-search" class="size-4" />
              <span style="margin-left: 8px">立即查询大学</span>
            </NuxtLink>
            <NuxtLink to="/charts" class="cta" style="background: #fff; color: #181e25; border: 1px solid #e5e7eb; box-shadow: 0 1px 2px rgba(0,0,0,0.05)">
              <UIcon name="i-lucide-bar-chart-3" class="size-4" />
              <span style="margin-left: 8px">查看趋势</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <!-- Stat grid -->
    <section class="page-container" style="margin-top: -24px">
      <div class="stats-grid">
        <StatCard
          label="监控大学"
          :value="totalUniversities"
          hint="覆盖 QS + US News 双榜"
          icon="i-lucide-globe-2"
        />
        <StatCard
          label="选校清单"
          :value="myChoicesCount"
          hint="已添加的大学数"
          icon="i-lucide-clipboard-list"
        />
        <StatCard
          label="正在考虑"
          :value="consideredCount"
          hint="标记为「考虑」"
          icon="i-lucide-bookmark-check"
        />
        <StatCard
          label="趋势曲线"
          :value="trackedSeries"
          hint="可视化对比序列"
          icon="i-lucide-line-chart"
        />
      </div>
    </section>

    <!-- 4 Module Entry -->
    <section class="modules page-container">
      <div class="modules__head">
        <h2 class="section-title">四大核心模块</h2>
        <p class="section-subtitle">从查询到选校到趋势分析,一站式覆盖</p>
      </div>
      <div class="modules__grid">
        <NuxtLink
          v-for="m in modules"
          :key="m.to"
          :to="m.to"
          class="module-card"
        >
          <div class="module-card__icon">
            <UIcon :name="m.icon" class="size-6" />
          </div>
          <div class="module-card__title">{{ m.title }}</div>
          <div class="module-card__desc">{{ m.desc }}</div>
          <div class="module-card__cta">
            <span>{{ m.cta }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Features -->
    <section class="features page-container">
      <div class="features__head">
        <h2 class="section-title">平台特色</h2>
        <p class="section-subtitle">为 PhD 申请者量身打造</p>
      </div>
      <div class="features__grid">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <div class="feature-card__icon">
            <UIcon :name="f.icon" class="size-5" />
          </div>
          <div class="feature-card__title">{{ f.title }}</div>
          <div class="feature-card__desc">{{ f.desc }}</div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.hero__inner {
  max-width: 800px;
  text-align: center;
  margin: 0 auto;
  padding: 16px 0;
}

.hero__badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 9999px;
  background: rgba(20, 86, 240, 0.08);
  color: var(--color-brand-900);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.01em;
  margin-bottom: 24px;
}

.hero__highlight {
  background: linear-gradient(120deg, #1456f0 0%, #60a5fa 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.hero__cta {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 32px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
@media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .stats-grid { grid-template-columns: 1fr; } }

.modules { margin-top: 80px; }
.modules__head { text-align: center; margin-bottom: 32px; }
.modules__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}
@media (max-width: 768px) { .modules__grid { grid-template-columns: 1fr; } }

.module-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 28px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
  text-decoration: none;
  color: inherit;
  transition: all 240ms ease;
}
.module-card:hover {
  transform: translateY(-2px);
  box-shadow: rgba(44, 30, 116, 0.16) 0px 0px 15px;
  border-color: transparent;
}
.module-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(20, 86, 240, 0.08);
  color: var(--color-brand-900);
}
.module-card__title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-ink-1000);
  line-height: 1.5;
}
.module-card__desc {
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-ink-700);
  flex: 1;
}
.module-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-brand-900);
  margin-top: 4px;
}

.features { margin-top: 80px; }
.features__head { text-align: center; margin-bottom: 32px; }
.features__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 1024px) { .features__grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px)  { .features__grid { grid-template-columns: 1fr; } }

.feature-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 22px;
  background: var(--color-surface-1);
  border-radius: 16px;
  transition: background 200ms ease;
}
.feature-card:hover {
  background: #fff;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}
.feature-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #fff;
  color: var(--color-brand-900);
}
.feature-card__title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  color: var(--color-ink-1000);
}
.feature-card__desc {
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-ink-700);
}
</style>
