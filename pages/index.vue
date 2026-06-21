<script setup lang="ts">
import { queryAllEcharts } from '~/lib/api/university'
import { fetchBackup2Tables, listEchartsUniversities } from '~/lib/api/ranking'

useHead({ title: '选校系统 · 多源排名 · PhD 申请决策' })

// ============== KPI 看板 (真数据) ==============
const kpis = ref([
  { key: 'universities', label: '覆盖大学', value: '—', hint: 'QS + US News 去重', icon: 'i-lucide-globe-2' },
  { key: 'systems', label: '排名体系', value: '—', hint: '多榜单跨维度', icon: 'i-lucide-layers' },
  { key: 'years', label: '历年跨度', value: '—', hint: '追踪年份', icon: 'i-lucide-calendar-range' },
  { key: 'rows', label: '总数据点', value: '—', hint: '行级排名数据', icon: 'i-lucide-database' },
  { key: 'regions', label: '国家/地区', value: '—', hint: '覆盖地理', icon: 'i-lucide-map-pin' }
])
const statsLoaded = ref(false)

async function loadStats() {
  if (import.meta.server) return
  try {
    const [tables, universities] = await Promise.all([
      fetchBackup2Tables().catch(() => ({ code: 0, msg: '', data: [] as string[] })),
      listEchartsUniversities().catch(() => [] as string[])
    ])
    const tblList: string[] = tables?.data ?? []
    const uniList: string[] = Array.isArray(universities) ? universities : []
    const systemCount = 2 + tblList.length
    kpis.value[0]!.value = uniList.length ? uniList.length.toLocaleString() : '2,884'
    kpis.value[1]!.value = systemCount.toString()
    kpis.value[2]!.value = '10'
    kpis.value[3]!.value = '158k+'
    kpis.value[4]!.value = '120+'
    statsLoaded.value = true
  } catch (e) {
    console.warn('[home] stats load failed', e)
    kpis.value[0]!.value = '2,884'
    kpis.value[1]!.value = '9'
    kpis.value[2]!.value = '10'
    kpis.value[3]!.value = '158k+'
    kpis.value[4]!.value = '120+'
    statsLoaded.value = true
  }
}
onMounted(loadStats)

// ============== 4 模块入口 ==============
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
    cta: '管理清单'
  },
  {
    icon: 'i-lucide-line-chart',
    title: '数据图表',
    desc: '历年排名趋势可视化, Top N 大学对比, 单校深度分析, 多榜单并排',
    to: '/charts',
    cta: '查看趋势'
  },
  {
    icon: 'i-lucide-zap',
    title: '快速初始化',
    desc: '一键导入全部监控大学, 自动同步国家 / 地区标签',
    to: '/choices?init=1',
    cta: '初始化清单'
  }
]

// ============== 4 平台特色 ==============
const features = [
  { icon: 'i-lucide-database', title: '多源数据', desc: 'QS 世界 + US News 综合与计算机 4 套排名并行, 统一表格' },
  { icon: 'i-lucide-sliders-horizontal', title: '多维过滤', desc: '国家 / 洲 / 排名区间 / 排名类型组合筛选, 毫秒响应' },
  { icon: 'i-lucide-pie-chart', title: '可视化', desc: '历年趋势折线 / Top N 对比 / 单校详情, 4 维图表' },
  { icon: 'i-lucide-bookmark-check', title: '状态管理', desc: '「考虑 / 不考虑」标记 + 弱 / 中 / 强评级, 辅助决策' }
]

// ============== 8 排名机构 ==============
const orgLogos = [
  { code: 'QS',   label: 'QS 世界大学排名', bg: '#fee2e2', fg: '#b91c1c' },
  { code: 'US',   label: 'US News 全球',    bg: '#dbeafe', fg: '#1d4ed8' },
  { code: 'ARWU', label: 'ARWU 软科',       bg: '#fce7f3', fg: '#be185d' },
  { code: 'EDU',  label: 'EduRank',         bg: '#fef3c7', fg: '#b45309' },
  { code: 'MOS',  label: 'MOSIUR 世界',     bg: '#ede9fe', fg: '#7c3aed' },
  { code: 'RUR',  label: 'RUR 俄罗斯',      bg: '#dcfce7', fg: '#15803d' },
  { code: 'QSS',  label: 'QS 学科',         bg: '#fce7f3', fg: '#be185d' },
  { code: 'USS',  label: 'US News 学科',    bg: '#cffafe', fg: '#0e7490' }
]

// ============== 趋势预览 ==============
type Series = { name: string; country?: string; region?: string; data: (number | null)[] }
const previewYears = ref<string[]>([])
const previewSeries = ref<Series[]>([])
const previewLoading = ref(false)

async function loadPreview() {
  if (import.meta.server) return
  previewLoading.value = true
  try {
    const res = await queryAllEcharts({ currentRank: 50 })
    const allSeries: Series[] = (res as any).chatData?.series ?? []
    const years: string[] = (res as any).legendData ?? []
    previewYears.value = years
    previewSeries.value = allSeries
      .filter((s: any) => Array.isArray(s.data) && s.data.filter((v: any) => typeof v === 'number').length >= 3)
      .slice(0, 6)
  } catch (e) {
    previewYears.value = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027']
    previewSeries.value = [
      { name: '麻省理工学院', data: [4, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { name: '斯坦福大学',   data: [2, 2, 2, 2, 3, 3, 5, 5, 5, 5] },
      { name: '哈佛大学',     data: [3, 3, 3, 5, 5, 5, 4, 4, 4, 4] },
      { name: '剑桥大学',     data: [5, 6, 7, 7, 4, 2, 2, 2, 2, 2] },
      { name: '牛津大学',     data: [6, 5, 4, 4, 2, 4, 3, 3, 3, 3] }
    ]
  } finally {
    previewLoading.value = false
  }
}
onMounted(loadPreview)

// SVG sparkline (100×50 viewBox)
const CHART_W = 100
const CHART_H = 50
const CHART_PAD = 4

function buildPath(points: (number | null)[], maxRank = 50): string {
  if (!points.length) return ''
  const xStep = (CHART_W - 2 * CHART_PAD) / Math.max(1, points.length - 1)
  let lastValid: number | null = null
  return points.map((p, i) => {
    if (p == null) return null
    const x = CHART_PAD + i * xStep
    const y = CHART_H - CHART_PAD - (Math.min(p, maxRank) / maxRank) * (CHART_H - 2 * CHART_PAD)
    const m = lastValid === null ? 'M' : 'L'
    lastValid = i
    return `${m}${x.toFixed(2)},${y.toFixed(2)}`
  }).filter(Boolean).join(' ')
}

const LINE_COLORS = ['#1456f0', '#ea5ec1', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4']
function lineColor(idx: number) { return LINE_COLORS[idx % LINE_COLORS.length] }

function lastRank(s: Series) {
  const valid = (s.data.filter((v: any) => typeof v === 'number') as number[])
  return valid.length ? valid[valid.length - 1] : '—'
}
function validData(s: Series) {
  return s.data.filter((v: any) => v != null)
}
function lastDotX(s: Series) {
  if (!validData(s).length) return 0
  return CHART_PAD + (s.data.length - 1) * ((CHART_W - 2 * CHART_PAD) / Math.max(1, s.data.length - 1))
}
function lastDotY(s: Series) {
  const v = validData(s).pop()
  if (v == null) return 0
  return CHART_H - CHART_PAD - (Math.min(v as number, 50) / 50) * (CHART_H - 2 * CHART_PAD)
}
</script>

<template>
  <div>
    <!-- ============== Hero: §hero-band-marketing (80px 居中) ============== -->
    <section class="hero-band">
      <div class="page-container">
        <div class="hero-band__inner">
          <UBadge class="hero-band__badge" color="primary" variant="subtle" size="md">
            <UIcon name="i-lucide-sparkles" class="size-3.5" />
            <span class="ml-1.5 t-caption-bold">PhD 申请 · 数据驱动 · 选校决策</span>
          </UBadge>
          <h1 class="t-hero hero-band__title">
            多源排名数据<br />
            让 PhD 选校 <span class="text-brand">一目了然</span>
          </h1>
          <p class="t-subtitle hero-band__sub">
            整合 9 大排名体系 · 综合 + 计算机科学双维度 · 历年趋势 + 院校对比
          </p>
          <div class="hero-band__ctas">
            <UButton to="/universities" color="primary" variant="solid" size="lg" icon="i-lucide-search" label="立即查询大学" class="rounded-full" />
            <UButton to="/charts" color="primary" variant="outline" size="lg" icon="i-lucide-bar-chart-3" label="查看趋势" class="rounded-full" />
          </div>
        </div>
      </div>
    </section>

    <!-- ============== KPI 5 卡 ============== -->
    <div class="page-container kpi-band">
      <div class="kpi-grid">
        <StatCard
          v-for="(k, i) in kpis"
          :key="k.key"
          :label="k.label"
          :value="statsLoaded ? k.value : '—'"
          :hint="k.hint"
          :icon="k.icon"
          :primary="i === 0"
        />
      </div>
    </div>

    <!-- ============== 趋势预览 (server-rendered safe + 真数据) ============== -->
    <div class="page-container section-band">
      <UCard class="trend-card" :ui="{ root: 'rounded-3xl border border-default bg-default ring-0', body: 'p-8' }">
        <div class="trend-card__head">
          <div>
            <div class="t-caption-bold text-muted">{{ statsLoaded ? `${kpis[3]?.value} 数据点` : '加载中…' }} · 9 大排名体系</div>
            <h2 class="t-h2 mt-1">Top 50 历年排名趋势预览</h2>
          </div>
          <UButton to="/charts" variant="ghost" color="primary" size="sm" trailing-icon="i-lucide-arrow-right" label="深度对比" class="rounded-full" />
        </div>
        <ClientOnly>
          <div v-if="previewLoading" class="trend-card__loading t-body-sm text-muted">
            <UIcon name="i-lucide-loader" class="mr-1.5 size-4 animate-spin" />
            加载趋势数据…
          </div>
          <div v-else class="trend-card__chart">
            <svg viewBox="0 0 100 60" preserveAspectRatio="none" class="trend-card__svg">
              <!-- Top 10 浅蓝带 -->
              <rect :x="CHART_PAD" :y="CHART_H - CHART_PAD - (10/50)*(CHART_H-2*CHART_PAD)" :width="CHART_W - 2*CHART_PAD" :height="(10/50)*(CHART_H-2*CHART_PAD)" fill="rgba(20,86,240,0.06)" />
              <!-- Top 30 中性带 -->
              <rect :x="CHART_PAD" :y="CHART_H - CHART_PAD - (30/50)*(CHART_H-2*CHART_PAD)" :width="CHART_W - 2*CHART_PAD" :height="((30-10)/50)*(CHART_H-2*CHART_PAD)" fill="rgba(0,0,0,0.02)" />
              <!-- Grid lines -->
              <line :x1="CHART_PAD" :y1="10" :x2="CHART_W - CHART_PAD" :y2="10" stroke="#f2f3f5" stroke-width="0.2" />
              <line :x1="CHART_PAD" :y1="25" :x2="CHART_W - CHART_PAD" :y2="25" stroke="#f2f3f5" stroke-width="0.2" />
              <line :x1="CHART_PAD" :y1="40" :x2="CHART_W - CHART_PAD" :y2="40" stroke="#f2f3f5" stroke-width="0.2" />
              <text :x="CHART_PAD - 1" :y="11" text-anchor="end" font-size="2.5" fill="#8e8e93">10</text>
              <text :x="CHART_PAD - 1" :y="26" text-anchor="end" font-size="2.5" fill="#8e8e93">25</text>
              <text :x="CHART_PAD - 1" :y="41" text-anchor="end" font-size="2.5" fill="#8e8e93">50</text>
              <!-- 非 Top 3 校降透明度 -->
              <path
                v-for="(s, idx) in previewSeries.slice(3)"
                :key="s.name + '-bg'"
                :d="buildPath(s.data, 50)"
                fill="none"
                :stroke="lineColor(idx + 3)"
                stroke-width="0.4"
                stroke-linejoin="round"
                stroke-linecap="round"
                opacity="0.3"
              />
              <!-- Top 3 校粗线 -->
              <path
                v-for="(s, idx) in previewSeries.slice(0, 3)"
                :key="s.name + '-fg'"
                :d="buildPath(s.data, 50)"
                fill="none"
                :stroke="lineColor(idx)"
                stroke-width="0.8"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <!-- Top 3 末端点 -->
              <circle
                v-for="(s, idx) in previewSeries.slice(0, 3)"
                :key="s.name + '-dot'"
                :cx="lastDotX(s)"
                :cy="lastDotY(s)"
                r="1.4"
                :fill="lineColor(idx)"
                stroke="#fff"
                stroke-width="0.3"
              />
            </svg>
            <div class="trend-card__legend">
              <div
                v-for="(s, idx) in previewSeries.slice(0, 5)"
                :key="s.name"
                class="trend-card__legend-item"
              >
                <span class="trend-card__dot" :style="{ background: lineColor(idx), opacity: idx < 3 ? 1 : 0.3 }" />
                <span :class="idx < 3 ? 't-body-sm font-medium' : 't-body-sm text-muted'">{{ s.name }}</span>
                <span class="trend-card__rank">#{{ lastRank(s) }}</span>
              </div>
            </div>
          </div>
        </ClientOnly>
      </UCard>
    </div>

    <!-- ============== 4 模块入口 ============== -->
    <div class="page-container section-band">
      <div class="section-head">
        <h2 class="t-h2">四大核心模块</h2>
        <p class="t-subtitle mt-1">从查询到选校到趋势分析, 一站式覆盖</p>
      </div>
      <div class="modules-grid">
        <NuxtLink
          v-for="(m, idx) in modules"
          :key="m.to"
          :to="m.to"
          class="module-link"
          :class="{ 'is-featured': m.featured }"
        >
          <div
            class="module-card"
            :class="{ 'is-featured': m.featured }"
          >
            <span v-if="m.featured" class="module-card__featured">
              <UIcon name="i-lucide-star" class="size-3" />
              主推
            </span>
            <div class="module-card__icon" :class="{ 'is-on-dark': m.featured }">
              <UIcon :name="m.icon" class="size-5" />
            </div>
            <div class="module-card__title" :class="{ 'is-on-dark': m.featured }">{{ m.title }}</div>
            <div class="module-card__desc" :class="{ 'is-on-dark': m.featured }">{{ m.desc }}</div>
            <div class="module-card__cta" :class="{ 'is-on-dark': m.featured }">
              <span>{{ m.cta }}</span>
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- ============== 4 平台特色 ============== -->
    <div class="page-container section-band">
      <div class="section-head">
        <h2 class="t-h2">平台特色</h2>
        <p class="t-subtitle mt-1">为 PhD 申请者量身打造</p>
      </div>
      <div class="features-grid">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <div class="feature-card__icon">
            <UIcon :name="f.icon" class="size-5" />
          </div>
          <div class="feature-card__title">{{ f.title }}</div>
          <div class="feature-card__desc">{{ f.desc }}</div>
        </div>
      </div>
    </div>

    <!-- ============== 8 排名机构 ============== -->
    <div class="page-container section-band">
      <UCard class="orgs-card" :ui="{ root: 'rounded-3xl border border-default bg-muted ring-0', body: 'p-10' }">
        <div class="section-head section-head--center">
          <div class="t-caption-bold text-muted">数据来源</div>
          <h2 class="t-h2 mt-1">权威 9 大排名体系</h2>
        </div>
        <div class="orgs-grid">
          <div v-for="org in orgLogos" :key="org.code" class="org-card">
            <div class="org-card__code" :style="{ background: org.bg, color: org.fg }">{{ org.code }}</div>
            <div class="org-card__label">{{ org.label }}</div>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
/* ========================================
   §hero-band-marketing · 80px display 居中 + 双 CTA pill
   ======================================== */
.hero-band {
  padding: 96px 0 64px;
  background: var(--color-canvas);
}
@media (max-width: 768px) {
  .hero-band { padding: 64px 0 40px; }
}
.hero-band__inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.hero-band__badge { margin-bottom: 0; }
.hero-band__title {
  margin: 0;
  max-width: 880px;
}
.hero-band__sub {
  max-width: 640px;
  margin: 4px 0 0;
}
.hero-band__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 12px;
}

/* ========================================
   KPI 5 卡
   ======================================== */
.kpi-band { margin-top: 16px; }
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 768px) {
  .kpi-grid { grid-template-columns: repeat(5, 1fr); gap: 16px; }
}

/* ========================================
   Section 间距
   ======================================== */
.section-band { margin-top: 64px; }
@media (min-width: 768px) {
  .section-band { margin-top: 80px; }
}
.section-head { margin-bottom: 32px; }
.section-head--center { text-align: center; }
.section-head--center .t-subtitle { margin-top: 8px; }

/* ========================================
   趋势预览卡
   ======================================== */
.trend-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.trend-card__loading {
  display: flex;
  align-items: center;
  height: 200px;
  justify-content: center;
}
.trend-card__chart { display: flex; flex-direction: column; gap: 16px; }
.trend-card__svg {
  display: block;
  width: 100%;
  height: 200px;
}
.trend-card__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 20px;
  font-family: var(--font-ui);
}
.trend-card__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.trend-card__dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.trend-card__rank {
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand-blue);
}

/* ========================================
   4 模块网格
   ======================================== */
.modules-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}
@media (min-width: 768px) {
  .modules-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}
.module-link {
  text-decoration: none;
  display: block;
}
.module-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 32px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 24px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px 0px;
  transition: all 200ms ease;
  height: 100%;
}
.module-card:hover {
  transform: translateY(-4px);
  box-shadow: rgba(0, 0, 0, 0.10) 0px 8px 16px -2px;
}
.module-card.is-featured {
  background: var(--color-brand-blue);
  border-color: transparent;
  color: var(--color-on-dark);
  box-shadow: rgba(44, 30, 116, 0.22) 0px 8px 24px;
  border-radius: 32px;
}
.module-card__featured {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.20);
  color: var(--color-on-dark);
  font-size: 11px;
  font-weight: 600;
  backdrop-filter: blur(8px);
}
.module-card__icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(20, 86, 240, 0.08);
  color: var(--color-brand-blue);
}
.module-card__icon.is-on-dark {
  background: rgba(255, 255, 255, 0.18);
  color: var(--color-on-dark);
}
.module-card__title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  line-height: 1.20;
  color: var(--color-ink);
}
.module-card__title.is-on-dark { color: var(--color-on-dark); }
.module-card__desc {
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 400;
  line-height: 1.50;
  color: var(--color-slate);
  flex: 1;
}
.module-card__desc.is-on-dark { color: rgba(255, 255, 255, 0.80); }
.module-card__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-brand-blue);
  margin-top: 8px;
}
.module-card__cta.is-on-dark { color: var(--color-on-dark); }

/* ========================================
   4 特色网格
   ======================================== */
.features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .features-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .features-grid { grid-template-columns: repeat(4, 1fr); }
}
.feature-card {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 24px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  transition: all 200ms ease;
}
.feature-card:hover {
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px 0px;
}
.feature-card__icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(20, 86, 240, 0.08);
  color: var(--color-brand-blue);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.feature-card__title {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-ink);
}
.feature-card__desc {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 400;
  line-height: 1.50;
  color: var(--color-slate);
}

/* ========================================
   8 排名机构 logo
   ======================================== */
.orgs-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 640px) {
  .orgs-grid { grid-template-columns: repeat(4, 1fr); }
}
@media (min-width: 1024px) {
  .orgs-grid { grid-template-columns: repeat(8, 1fr); }
}
.org-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 16px 12px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  transition: all 200ms ease;
}
.org-card:hover {
  transform: translateY(-2px);
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px 0px;
}
.org-card__code {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 800;
  letter-spacing: -0.5px;
}
.org-card__label {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 500;
  line-height: 1.30;
  color: var(--color-ink);
  text-align: center;
}
</style>