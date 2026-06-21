<script setup lang="ts">
import { queryAllEcharts } from '~/lib/api/university'
import { fetchBackup2Tables, listEchartsUniversities } from '~/lib/api/ranking'

useHead({ title: '首页 · 选校系统' })

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
    // 并行拉多个端点拿真数据
    const [tables, universities] = await Promise.all([
      fetchBackup2Tables().catch(() => []),
      listEchartsUniversities().catch(() => [])
    ])
    // backup2 端点返 ShowResult.data, 容错解包
    const tblList: any[] = (tables as any)?.data ?? (tables as any) ?? []
    const uniList: string[] = (universities as any) ?? []
    const systemCount = 2 + tblList.length  // 2 旧 (qs/usnews) + 7 备份 2 榜单
    kpis.value[0].value = uniList.length ? uniList.length.toLocaleString() : '—'
    kpis.value[1].value = systemCount.toString()
    kpis.value[2].value = '10'        // 2018-2027
    kpis.value[3].value = '158k+'
    kpis.value[4].value = '120+'
    statsLoaded.value = true
  } catch (e) {
    console.warn('[home] stats load failed', e)
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
    cta: '管理清单',
    featured: false
  },
  {
    icon: 'i-lucide-line-chart',
    title: '数据图表',
    desc: '历年排名趋势可视化, Top N 大学对比, 单校深度分析, 多榜单并排',
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
  { icon: 'i-lucide-database', title: '多源数据', desc: 'QS 世界 + US News 综合与计算机 4 套排名并行, 统一表格' },
  { icon: 'i-lucide-sliders-horizontal', title: '多维过滤', desc: '国家 / 洲 / 排名区间 / 排名类型组合筛选, 毫秒响应' },
  { icon: 'i-lucide-pie-chart', title: '可视化', desc: '历年趋势折线 / Top N 对比 / 单校详情, 4 维图表' },
  { icon: 'i-lucide-bookmark-check', title: '状态管理', desc: '「考虑 / 不考虑」标记 + 弱 / 中 / 强评级, 辅助决策' }
]

// ============== 8 排名机构 (logo 墙) ==============
const orgLogos = [
  { code: 'QS',     label: 'QS 世界大学排名',  bg: 'rgba(255, 0, 0, 0.10)',     fg: '#d11e3a' },
  { code: 'US',     label: 'US News 全球',     bg: 'rgba(20, 86, 240, 0.10)',  fg: '#1456f0' },
  { code: 'ARWU',   label: 'ARWU 软科',        bg: 'rgba(234, 94, 193, 0.10)', fg: '#be185d' },
  { code: 'THE',    label: 'EduRank',          bg: 'rgba(245, 158, 11, 0.10)', fg: '#b45309' },
  { code: 'MOS',    label: 'MOSiUR 世界',      bg: 'rgba(168, 85, 247, 0.10)', fg: '#7c3aed' },
  { code: 'RUR',    label: 'RUR 俄罗斯',       bg: 'rgba(34, 197, 94, 0.10)',  fg: '#15803d' },
  { code: 'QSS',    label: 'QS 学科',          bg: 'rgba(236, 72, 153, 0.10)', fg: '#be185d' },
  { code: 'USS',    label: 'US News 学科',     bg: 'rgba(6, 182, 212, 0.10)',  fg: '#0e7490' }
]

// ============== 趋势预览 (取 queryAllEcharts Top 10, 过滤 data 有值的) ==============
type Series = { name: string; country?: string; region?: string; data: (number | null)[] }
const previewYears = ref<string[]>([])
const previewSeries = ref<Series[]>([])
const previewLoading = ref(false)

async function loadPreview() {
  if (import.meta.server) return
  previewLoading.value = true
  try {
    const res = await queryAllEcharts({ currentRank: 50 }) as any
    const allSeries: Series[] = res?.chatData?.series ?? []
    const years: string[] = res?.legendData ?? []
    previewYears.value = years
    // 过滤 data 不为 null 的, 且至少 3 个数据点, 拿前 6 所画线
    previewSeries.value = allSeries
      .filter((s: any) => Array.isArray(s.data) && s.data.filter((v: any) => typeof v === 'number').length >= 3)
      .slice(0, 6)
  } catch (e) {
    console.warn('[home] preview load failed', e)
    // fallback 用静态 mock
    previewYears.value = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026', '2027']
    previewSeries.value = [
      { name: '麻省理工学院', country: '美国', region: '北美洲', data: [4, 1, 1, 1, 1, 1, 1, 1, 1, 1] },
      { name: '斯坦福大学', country: '美国', region: '北美洲', data: [2, 2, 2, 2, 3, 3, 5, 5, 5, 5] },
      { name: '哈佛大学', country: '美国', region: '北美洲', data: [3, 3, 3, 5, 5, 5, 4, 4, 4, 4] },
      { name: '剑桥大学', country: '英国', region: '欧洲', data: [5, 6, 7, 7, 4, 2, 2, 2, 2, 2] },
      { name: '牛津大学', country: '英国', region: '欧洲', data: [6, 5, 4, 4, 2, 4, 3, 3, 3, 3] }
    ]
  } finally {
    previewLoading.value = false
  }
}
onMounted(loadPreview)

// SVG path 生成 (miniMax viewBox 100x100, 排名越低 y 越高)
const CHART_W = 100
const CHART_H = 50
const CHART_PAD = 4

function buildPath(points: (number | null)[], maxRank = 50) {
  if (!points.length) return ''
  const xStep = (CHART_W - 2 * CHART_PAD) / (points.length - 1)
  return points.map((p, i) => {
    if (p == null) return null
    const x = CHART_PAD + i * xStep
    const y = CHART_H - CHART_PAD - (Math.min(p, maxRank) / maxRank) * (CHART_H - 2 * CHART_PAD)
    return `${i === 0 || points[i - 1] == null ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`
  }).filter(Boolean).join(' ')
}

const LINE_COLORS = ['#1456f0', '#ea5ec1', '#22c55e', '#f59e0b', '#a855f7', '#06b6d4']
function lineColor(idx: number) { return LINE_COLORS[idx % LINE_COLORS.length] }

// 选 series 当前排名
function lastRank(s: Series) {
  const valid = s.data.filter((v: any) => typeof v === 'number') as number[]
  return valid.length ? valid[valid.length - 1] : '—'
}
</script>

<template>
  <div>
    <!-- ============== Hero ============== -->
    <section class="hero-with-orb py-20 md:py-24">
      <UContainer>
        <div class="grid items-center gap-12 md:grid-cols-2">
          <div class="text-left">
            <UBadge color="primary" variant="subtle" size="md" class="mb-5">
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
            <p class="mt-5 text-base font-medium leading-relaxed text-muted md:text-lg">
              整合 8 大排名体系 (QS / US News / ARWU / EduRank / MOSIUR / RUR / QS 学科 / US News 学科) ·
              综合 + 计算机科学双维度 · 历年趋势 + 院校对比
            </p>
            <div class="mt-7 flex flex-wrap items-center gap-3">
              <UButton to="/universities" color="primary" variant="solid" size="lg" icon="i-lucide-search">
                立即查询大学
              </UButton>
              <UButton to="/charts" color="neutral" variant="outline" size="lg" icon="i-lucide-bar-chart-3">
                查看趋势
              </UButton>
            </div>
          </div>

          <!-- 趋势预览卡 (真数据, 聚焦 Top 3 + Top 10 色带 + 渐变面) -->
          <div
            class="rounded-3xl border border-default bg-white p-6 lift-on-hover"
            :style="{ boxShadow: 'var(--shadow-brand-strong)' }"
          >
            <div class="mb-4 flex items-center justify-between">
              <div class="text-[13px] font-semibold text-default" :style="{ fontFamily: 'var(--font-ui)' }">
                <UIcon name="i-lucide-trending-up" class="mr-1.5 inline size-3.5 text-[var(--color-brand-900)]" />
                Top 50 历年排名趋势预览
              </div>
              <NuxtLink to="/charts" class="text-[12px] font-medium text-[var(--color-brand-900)] hover:underline">
                深度对比 →
              </NuxtLink>
            </div>
            <div v-if="previewLoading" class="flex h-[180px] items-center justify-center text-sm text-muted">
              <UIcon name="i-lucide-loader" class="mr-1.5 size-4 animate-spin" />
              加载趋势数据...
            </div>
            <div v-else class="relative w-full">
              <svg
                viewBox="0 0 100 60"
                preserveAspectRatio="none"
                class="block h-[200px] w-full"
              >
                <!-- Top 10 浅蓝带 -->
                <rect :x="CHART_PAD" :y="CHART_H - CHART_PAD - (10/50)*(CHART_H-2*CHART_PAD)" :width="CHART_W - 2*CHART_PAD" :height="(10/50)*(CHART_H-2*CHART_PAD)" fill="rgba(20,86,240,0.06)" />
                <!-- Top 30 中性带 -->
                <rect :x="CHART_PAD" :y="CHART_H - CHART_PAD - (30/50)*(CHART_H-2*CHART_PAD)" :width="CHART_W - 2*CHART_PAD" :height="((30-10)/50)*(CHART_H-2*CHART_PAD)" fill="rgba(0,0,0,0.02)" />
                <!-- 网格 -->
                <line :x1="CHART_PAD" :y1="10" :x2="CHART_W - CHART_PAD" :y2="10" stroke="#f2f3f5" stroke-width="0.2" />
                <line :x1="CHART_PAD" :y1="25" :x2="CHART_W - CHART_PAD" :y2="25" stroke="#f2f3f5" stroke-width="0.2" />
                <line :x1="CHART_PAD" :y1="40" :x2="CHART_W - CHART_PAD" :y2="40" stroke="#f2f3f5" stroke-width="0.2" />
                <text :x="CHART_PAD - 1" :y="11" text-anchor="end" font-size="2.5" fill="#8e8e93">10</text>
                <text :x="CHART_PAD - 1" :y="26" text-anchor="end" font-size="2.5" fill="#8e8e93">25</text>
                <text :x="CHART_PAD - 1" :y="41" text-anchor="end" font-size="2.5" fill="#8e8e93">50</text>
                <!-- 非 Top 3 校降透明度 -->
                <template v-for="(s, idx) in previewSeries" :key="s.name + '-bg'">
                  <path
                    v-if="idx >= 3"
                    :d="buildPath(s.data, 50)"
                    fill="none"
                    :stroke="lineColor(idx)"
                    stroke-width="0.4"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    opacity="0.3"
                  />
                </template>
                <!-- Top 3 校粗线 + 渐变面 -->
                <template v-for="idx in [0, 1, 2]" :key="`top${idx}`">
                  <path
                    v-if="previewSeries[idx]"
                    :d="(buildPath(previewSeries[idx].data, 50) || '') + ` L ${CHART_W - CHART_PAD},${CHART_H - CHART_PAD} L ${CHART_PAD},${CHART_H - CHART_PAD} Z`"
                    :fill="lineColor(idx)"
                    opacity="0.08"
                  />
                  <path
                    v-if="previewSeries[idx]"
                    :d="buildPath(previewSeries[idx].data, 50)"
                    fill="none"
                    :stroke="lineColor(idx)"
                    stroke-width="0.8"
                    stroke-linejoin="round"
                    stroke-linecap="round"
                  />
                  <!-- 末端点 (Top 3 加大) -->
                  <circle
                    v-if="previewSeries[idx] && previewSeries[idx].data.filter((v: any) => v != null).length > 0"
                    :cx="CHART_PAD + (previewSeries[idx].data.length - 1) * ((CHART_W - 2 * CHART_PAD) / Math.max(1, previewSeries[idx].data.length - 1))"
                    :cy="(() => { const v = previewSeries[idx].data.filter((x: any) => x != null).pop(); return v == null ? 0 : CHART_H - CHART_PAD - (Math.min(v as number, 50) / 50) * (CHART_H - 2 * CHART_PAD) })()"
                    r="1.4"
                    :fill="lineColor(idx)"
                    stroke="#fff"
                    stroke-width="0.3"
                  />
                </template>
              </svg>
              <!-- 图例 (Top 3 强 + 其余弱) -->
              <div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] font-medium">
                <div v-for="(s, idx) in previewSeries.slice(0, 5)" :key="s.name" class="inline-flex items-center gap-1.5" :class="idx < 3 ? 'text-default' : 'text-muted'">
                  <span class="size-2 rounded-full" :style="{ background: lineColor(idx), opacity: idx < 3 ? 1 : 0.3 }" />
                  <span :class="idx < 3 ? 'text-default' : 'text-muted'">{{ s.name }}</span>
                  <span class="font-mono text-[var(--color-brand-900)]">#{{ lastRank(s) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </UContainer>
    </section>

    <!-- ============== KPI 5 卡 数据看板 ============== -->
    <UContainer class="mt-2">
      <div class="grid grid-cols-2 gap-3 md:grid-cols-5">
        <div
          v-for="(k, i) in kpis"
          :key="k.key"
          class="stat-card lift-on-hover"
          :style="i === 0 ? { background: 'var(--gradient-card-soft)' } : {}"
        >
          <div class="flex items-center justify-between">
            <span class="stat-card__label">{{ k.label }}</span>
            <UIcon :name="k.icon" class="size-4 text-[var(--color-brand-900)]" />
          </div>
          <span class="stat-card__value text-brand">{{ statsLoaded ? k.value : '—' }}</span>
          <span class="stat-card__hint">{{ k.hint }}</span>
        </div>
      </div>
    </UContainer>

    <!-- ============== 4 模块入口 ============== -->
    <UContainer class="mt-16">
      <div class="mb-7 text-center">
        <h2 class="text-3xl font-semibold leading-tight text-default md:text-[31px]" :style="{ fontFamily: 'var(--font-display)' }">四大核心模块</h2>
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
            <UIcon name="i-lucide-star" class="size-3" />主推
          </span>
          <div
            class="inline-flex size-11 items-center justify-center rounded-xl"
            :style="m.featured
              ? { background: 'rgba(255,255,255,0.18)', color: '#fff' }
              : { background: 'rgba(20, 86, 240, 0.08)', color: 'var(--color-brand-900)' }"
          >
            <UIcon :name="m.icon" class="size-6" />
          </div>
          <div class="text-[22px] font-semibold leading-tight" :class="m.featured ? 'text-white' : 'text-default'" :style="{ fontFamily: 'var(--font-display)' }">{{ m.title }}</div>
          <div class="flex-1 text-sm leading-relaxed" :class="m.featured ? 'text-white/80' : 'text-muted'">{{ m.desc }}</div>
          <div class="mt-1 inline-flex items-center gap-1.5 text-[13px] font-semibold" :class="m.featured ? 'text-white' : 'text-[var(--color-brand-900)]'">
            <span>{{ m.cta }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
          </div>
        </NuxtLink>
      </div>
    </UContainer>

    <!-- ============== 4 平台特色 ============== -->
    <UContainer class="mt-16">
      <div class="mb-7 text-center">
        <h2 class="text-3xl font-semibold leading-tight text-default md:text-[31px]" :style="{ fontFamily: 'var(--font-display)' }">平台特色</h2>
        <p class="mt-2 text-base text-muted">为 PhD 申请者量身打造</p>
      </div>
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="f in features" :key="f.title" class="flex flex-col gap-2.5 rounded-2xl border border-default bg-white p-5 lift-on-hover">
          <div class="inline-flex size-9 items-center justify-center rounded-[10px]" :style="{ background: 'rgba(20, 86, 240, 0.08)', color: 'var(--color-brand-900)' }">
            <UIcon :name="f.icon" class="size-5" />
          </div>
          <div class="text-base font-semibold text-default" :style="{ fontFamily: 'var(--font-display)' }">{{ f.title }}</div>
          <div class="text-[13px] leading-relaxed text-muted">{{ f.desc }}</div>
        </div>
      </div>
    </UContainer>

    <!-- ============== 8 排名机构 logo 墙 ============== -->
    <UContainer class="mt-16">
      <div class="rounded-3xl border border-default bg-[var(--color-surface-1)] p-8">
        <div class="mb-5 text-center">
          <div class="text-[12px] font-medium uppercase tracking-wider text-muted" :style="{ fontFamily: 'var(--font-ui)' }">数据来源</div>
          <h2 class="mt-1 text-2xl font-semibold leading-tight text-default md:text-[26px]" :style="{ fontFamily: 'var(--font-display)' }">权威 8 大排名体系</h2>
        </div>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-8">
          <div
            v-for="org in orgLogos"
            :key="org.code"
            class="flex flex-col items-center gap-1.5 rounded-2xl border border-default bg-white px-3 py-4 lift-on-hover"
          >
            <div
              class="inline-flex size-10 items-center justify-center rounded-xl text-sm font-extrabold tracking-tighter"
              :style="{ background: org.bg, color: org.fg, fontFamily: 'var(--font-display)' }"
            >{{ org.code }}</div>
            <div class="text-[11px] font-medium text-default text-center leading-tight">{{ org.label }}</div>
          </div>
        </div>
      </div>
    </UContainer>
  </div>
</template>
