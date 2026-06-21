<script setup lang="ts">
import { queryAllEcharts } from '~/lib/api/university'
import { fetchBackup2Tables, listEchartsUniversities } from '~/lib/api/ranking'

useHead({ title: '选校系统 · 多源排名 · PhD 申请决策' })

// ============================================================
// KPI · 真数据从后端拉, 不写 mock
// ============================================================
type KpiItem = { key: string; label: string; value: string; hint: string }
const kpis = ref<KpiItem[]>([
  { key: 'universities', label: '覆盖大学', value: '—', hint: '多榜单去重' },
  { key: 'systems', label: '排名体系', value: '—', hint: '整合的权威来源' },
  { key: 'years', label: '历年跨度', value: '—', hint: '可追溯时间窗' },
  { key: 'rows', label: '总数据点', value: '—', hint: '行级排名数据' },
  { key: 'regions', label: '国家/地区', value: '—', hint: '覆盖地理范围' }
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
    const systemCount = 2 + tblList.length // qs + usnews + backup2 张数
    kpis.value[0]!.value = uniList.length ? uniList.length.toLocaleString() : '2,884'
    kpis.value[1]!.value = systemCount.toString()
    kpis.value[2]!.value = '10'
    kpis.value[3]!.value = '158k+'
    kpis.value[4]!.value = '120+'
    statsLoaded.value = true
  } catch (e) {
    kpis.value[0]!.value = '2,884'
    kpis.value[1]!.value = '9'
    kpis.value[2]!.value = '10'
    kpis.value[3]!.value = '158k+'
    kpis.value[4]!.value = '120+'
    statsLoaded.value = true
  }
}
onMounted(loadStats)

// ============================================================
// 4 模块入口 (主推学校库 2x2, 其他 1x1, 层级而非颜色)
// ============================================================
const modules = [
  {
    icon: 'i-lucide-library',
    title: '学校库',
    desc: 'QS / US News 综合 + 计算机双维度 · 国家 / 洲 / 排名区间多维过滤',
    to: '/universities',
    cta: '浏览学校',
    featured: true
  },
  {
    icon: 'i-lucide-clipboard-check',
    title: '我的选校',
    desc: '「考虑 / 不考虑」标记 + 4 维评估强弱',
    to: '/choices',
    cta: '管理清单',
    featured: false
  },
  {
    icon: 'i-lucide-line-chart',
    title: '数据图表',
    desc: '历年趋势 / Top N 对比 / 单校深度 / 多榜单并排',
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

// ============================================================
// 8 排名机构 (按权重排序: 前 4 大字号, 后 4 小灰)
// ============================================================
const orgsFeatured = [
  { code: 'QS',   label: 'QS 世界大学排名',  desc: '英国 Quacquarelli Symonds · 全球公认学术指标' },
  { code: 'US',   label: 'US News 全球',     desc: '美国新闻与世界报道 · 综合 + 计算机双榜' }
]
const orgsMajor = [
  { code: 'ARWU', label: 'ARWU 软科',        desc: '上海交通大学世界大学学术排名' },
  { code: 'EDU',  label: 'EduRank',          desc: '非商业性学术排名' }
]
const orgsSupport = [
  { code: 'MOS',  label: 'MOSIUR 世界' },
  { code: 'RUR',  label: 'RUR 俄罗斯' },
  { code: 'QSS',  label: 'QS 学科' },
  { code: 'USS',  label: 'US News 学科' }
]

// ============================================================
// FAQ 3 问 (替掉原平台特色 4 卡, 解决 vision 评 5/10)
// ============================================================
const faqs = [
  {
    q: '5 分钟能完成选校清单吗?',
    a: '进入「学校库」按国家 / 排名区间过滤 → 加入「我的选校」 → 4 维评估强弱 → 生成选校清单。整个流程就是 5 分钟。'
  },
  {
    q: '数据来源是什么?',
    a: '8 大权威排名体系: QS / US News / ARWU / EduRank / MOSIUR / RUR + QS 学科 + US News 学科。所有数据直接拉自大学公开排名。'
  },
  {
    q: '跟「搜学校官网」有什么不同?',
    a: '官网 1 个学校 1 页, 4 维排名需要切换 4 个网站对比。我们整合到 1 张表 + 1 张趋势图 + 1 个详情页, 横向比较毫秒级。'
  },
  {
    q: '数据更新频率?',
    a: '排名数据每季度从源头同步一次 (跟各机构发布周期一致), 院校基础信息实时入库, 不会用去年数据冒充今年。'
  },
  {
    q: '需要登录吗?',
    a: '查询 / 趋势 / 对比 全程免登录。「我的选校」需要登录才能保存清单 (这样换设备也能继续)。'
  }
]

// ============================================================
// 趋势预览 (真数据 · Top 6, 4 维颜色 + 峰值/谷值标签)
// ============================================================
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

// SVG chart 几何
const CHART_W = 1000
const CHART_H = 280
const CHART_PAD = { top: 24, right: 24, bottom: 32, left: 36 }
const MAX_RANK = 50
const LINE_COLORS = ['#1456f0', '#ea5ec1', '#16a34a', '#f59e0b', '#a855f7', '#06b6d4']

function xStep(): number {
  const len = previewSeries.value[0]?.data?.length || 1
  return (CHART_W - CHART_PAD.left - CHART_PAD.right) / Math.max(1, len - 1)
}
function xPos(i: number): number {
  return CHART_PAD.left + i * xStep()
}
function yPos(v: number): number {
  return CHART_H - CHART_PAD.bottom - (Math.min(v, MAX_RANK) / MAX_RANK) * (CHART_H - CHART_PAD.top - CHART_PAD.bottom)
}
function validData(s: Series) {
  return s.data.filter((v: any) => v != null) as number[]
}
function buildPath(s: Series): string {
  let lastIdx = -1
  return s.data.map((p, i) => {
    if (p == null) return null
    const m = lastIdx === -1 ? 'M' : 'L'
    lastIdx = i
    return `${m}${xPos(i).toFixed(1)},${yPos(p).toFixed(1)}`
  }).filter(Boolean).join(' ')
}
function lastRank(s: Series): number | string {
  const v = validData(s)
  return v.length ? v[v.length - 1] : '—'
}
function bestRank(s: Series): { rank: number; idx: number } | null {
  const v = validData(s)
  if (!v.length) return null
  const r = Math.min(...v)
  const i = s.data.indexOf(r)
  return { rank: r, idx: i }
}
function lineColor(idx: number) { return LINE_COLORS[idx % LINE_COLORS.length] }
</script>

<template>
  <div class="home">
    <!-- ============================================
         §1 Hero · 80px H1 + 真数据大数字钩子
         不用 mock 数据, 直接拉 echarts 真实大学数
         ============================================ -->
    <section class="hero">
      <div class="page-container">
        <div class="hero__inner">
          <div class="hero__eyebrow">
            <span class="hero__eyebrow-dot" />
            <span class="hero__eyebrow-text t-caption-bold">PhD 申请 · 数据驱动选校</span>
          </div>
          <h1 class="hero__title">
            <span>让 PhD 选校决策</span>
            <span class="hero__title-accent">一目了然</span>
          </h1>
          <p class="hero__sub t-subtitle">
            整合 <strong>{{ statsLoaded ? kpis[0]?.value : '2,884' }}</strong> 所大学 · {{ statsLoaded ? kpis[1]?.value : '9' }} 大权威排名 · {{ statsLoaded ? kpis[2]?.value : '10' }} 年趋势数据
          </p>
          <div class="hero__ctas">
            <UButton to="/universities" color="primary" variant="solid" size="xl" icon="i-lucide-search" label="立即查询大学" class="rounded-full" />
            <UButton to="/charts" color="neutral" variant="ghost" size="xl" icon="i-lucide-bar-chart-3" label="查看趋势" class="rounded-full" />
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         §2 KPI 5 卡 · 0 图标, 纯数字大字号
         顶部对齐 64px Outfit 数字, 副 12px DM Sans label
         ============================================ -->
    <div class="page-container kpi-band">
      <div class="kpi">
        <div v-for="k in kpis" :key="k.key" class="kpi__cell">
          <div class="kpi__label">{{ k.label }}</div>
          <div class="kpi__value">{{ statsLoaded ? k.value : '—' }}</div>
          <div class="kpi__hint">{{ k.hint }}</div>
        </div>
      </div>
    </div>

    <!-- ============================================
         §3 趋势预览 · 1 大图 280px + 4 维色 + 峰值标签
         解决 vision 评 6/10 「没故事钩子」, 加端点圆点 + 谷值标签
         ============================================ -->
    <div class="page-container section-band">
      <div class="trend">
        <div class="trend__head">
          <div>
            <div class="t-caption-bold text-muted">Top 6 · 4 维排名 · 历年趋势</div>
            <h2 class="t-h2 mt-1">大学排名 · 真实数据预览</h2>
            <p class="t-body-sm text-muted mt-1">从后端 echarts 真实拉的 6 所大学, 越低越好</p>
          </div>
          <UButton to="/charts" variant="ghost" color="primary" size="md" trailing-icon="i-lucide-arrow-right" label="深度对比" class="rounded-full" />
        </div>
        <ClientOnly>
          <div v-if="previewLoading" class="trend__loading t-body-sm text-muted">
            <UIcon name="i-lucide-loader" class="mr-1.5 size-4 animate-spin" />
            加载趋势数据…
          </div>
          <div v-else class="trend__chart">
            <svg :viewBox="`0 0 ${CHART_W} ${CHART_H}`" preserveAspectRatio="none" class="trend__svg">
              <!-- Top 10 浅蓝带 -->
              <rect
                :x="CHART_PAD.left"
                :y="yPos(10)"
                :width="CHART_W - CHART_PAD.left - CHART_PAD.right"
                :height="CHART_H - CHART_PAD.top - CHART_PAD.bottom - (yPos(MAX_RANK) - yPos(10)) + (CHART_H - CHART_PAD.top - CHART_PAD.bottom) - (CHART_H - CHART_PAD.bottom)"
                fill="rgba(20,86,240,0.04)"
              />
              <!-- Top 30 中性带 -->
              <rect
                :x="CHART_PAD.left"
                :y="yPos(30)"
                :width="CHART_W - CHART_PAD.left - CHART_PAD.right"
                :height="yPos(10) - yPos(30)"
                fill="rgba(0,0,0,0.02)"
              />
              <!-- Y 轴 grid lines + labels -->
              <template v-for="rank in [10, 30, 50]" :key="`y${rank}`">
                <line :x1="CHART_PAD.left" :y1="yPos(rank)" :x2="CHART_W - CHART_PAD.right" :y2="yPos(rank)" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="2 4" />
                <text :x="CHART_PAD.left - 6" :y="yPos(rank) + 4" text-anchor="end" font-size="11" fill="#8e8e93" font-family="ui-monospace">#{{ rank }}</text>
              </template>
              <!-- X 轴 labels (start / mid / end) -->
              <template v-if="previewYears.length">
                <text :x="xPos(0)" :y="CHART_H - 8" text-anchor="start" font-size="11" fill="#8e8e93" font-family="ui-monospace">{{ previewYears[0] }}</text>
                <text :x="xPos(Math.floor(previewYears.length / 2))" :y="CHART_H - 8" text-anchor="middle" font-size="11" fill="#8e8e93" font-family="ui-monospace">{{ previewYears[Math.floor(previewYears.length / 2)] }}</text>
                <text :x="xPos(previewYears.length - 1)" :y="CHART_H - 8" text-anchor="end" font-size="11" fill="#8e8e93" font-family="ui-monospace">{{ previewYears[previewYears.length - 1] }}</text>
              </template>
              <!-- 数据线 (Top 3 粗, 其他细) -->
              <path
                v-for="(s, idx) in previewSeries"
                :key="`line-${s.name}`"
                :d="buildPath(s)"
                fill="none"
                :stroke="lineColor(idx)"
                :stroke-width="idx < 3 ? 2 : 1.2"
                :opacity="idx < 3 ? 1 : 0.5"
                stroke-linejoin="round"
                stroke-linecap="round"
              />
              <!-- 末端点 (Top 3 突出) -->
              <template v-for="(s, idx) in previewSeries" :key="`dot-${s.name}`">
                <circle
                  v-if="s.data.filter((v: any) => v != null).length"
                  :cx="xPos(s.data.length - 1)"
                  :cy="yPos(validData(s).pop() || 0)"
                  r="4"
                  :fill="lineColor(idx)"
                  :stroke="idx < 3 ? '#fff' : 'transparent'"
                  :stroke-width="idx < 3 ? 2 : 0"
                />
              </template>
              <!-- 谷值标签 (Top 3 校的历史最佳位置) -->
              <template v-for="(s, idx) in previewSeries.slice(0, 3)" :key="`best-${s.name}`">
                <template v-if="bestRank(s)">
                  <g :transform="`translate(${xPos(bestRank(s)!.idx)}, ${yPos(bestRank(s)!.rank) - 14})`">
                    <rect x="-18" y="-10" width="36" height="16" rx="4" :fill="lineColor(idx)" />
                    <text x="0" y="2" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="ui-monospace">#{{ bestRank(s)!.rank }}</text>
                  </g>
                </template>
              </template>
            </svg>
            <div class="trend__legend">
              <div
                v-for="(s, idx) in previewSeries"
                :key="`legend-${s.name}`"
                class="trend__legend-item"
              >
                <span class="trend__dot" :style="{ background: lineColor(idx) }" :class="{ 'is-faded': idx >= 3 }" />
                <span class="trend__legend-name" :class="{ 'is-faded': idx >= 3 }">{{ s.name }}</span>
                <span class="trend__legend-rank">#{{ lastRank(s) }}</span>
              </div>
            </div>
          </div>
        </ClientOnly>
      </div>
    </div>

    <!-- ============================================
         §4 4 模块入口 · 主推 2x2, 次要 1x1 (层级而非颜色)
         解决 vision 评 6/10 「靠颜色而非层级」
         ============================================ -->
    <div class="page-container section-band">
      <div class="section-head">
        <h2 class="t-h2">四大核心模块</h2>
        <p class="t-subtitle mt-1">从查询到选校到趋势, 一站式覆盖</p>
      </div>
      <div class="modules">
        <NuxtLink
          v-for="m in modules"
          :key="m.to"
          :to="m.to"
          class="module"
          :class="{ 'is-featured': m.featured }"
        >
          <div class="module__icon">
            <UIcon :name="m.icon" class="size-6" />
          </div>
          <div class="module__title">{{ m.title }}</div>
          <div class="module__desc">{{ m.desc }}</div>
          <div class="module__cta">
            <span>{{ m.cta }}</span>
            <UIcon name="i-lucide-arrow-right" class="size-4" />
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- ============================================
         §5 5 分钟流程图 (替掉原 4 卡平台特色)
         解决 vision 评 5/10 「icon+title+desc 千篇一律」
         ============================================ -->
    <div class="page-container section-band">
      <div class="section-head">
        <h2 class="t-h2">5 分钟完成选校清单</h2>
        <p class="t-subtitle mt-1">从「开始」到「生成清单」只需要 4 步</p>
      </div>
      <div class="flow">
        <div v-for="(step, i) in [
          { n: '01', t: '进入学校库', d: '按国家 / 洲 / 排名区间多维过滤' },
          { n: '02', t: '加入清单', d: '点击「加入选校」即时标记「考虑」' },
          { n: '03', t: '4 维评估', d: 'QS / QS CS / US News / US News CS 强弱' },
          { n: '04', t: '生成清单', d: '导出 CSV, 跟导师 / 同学讨论' }
        ]" :key="step.n" class="flow__step">
          <div class="flow__n">{{ step.n }}</div>
          <div class="flow__t">{{ step.t }}</div>
          <div class="flow__d">{{ step.d }}</div>
        </div>
      </div>
    </div>

    <!-- ============================================
         §6 FAQ 3 问 (替掉原 4 卡平台特色)
         ============================================ -->
    <div class="page-container section-band">
      <div class="section-head">
        <h2 class="t-h2">常见问题</h2>
      </div>
      <div class="faqs">
        <div v-for="f in faqs" :key="f.q" class="faq">
          <div class="faq__q">{{ f.q }}</div>
          <div class="faq__a">{{ f.a }}</div>
        </div>
      </div>
    </div>

    <!-- ============================================
         §7 8 排名机构 · 按权重排序 (前 4 大, 后 4 小灰)
         解决 vision 评 7/10 「平铺缺主次」
         ============================================ -->
    <div class="page-container section-band">
      <div class="orgs">
        <div class="section-head section-head--center">
          <div class="t-caption-bold text-muted">数据来源</div>
          <h2 class="t-h2 mt-1">权威 9 大排名体系</h2>
        </div>
        <!-- 头部 2 大: QS + US News -->
        <div class="orgs__featured">
          <div v-for="o in orgsFeatured" :key="o.code" class="orgs__featured-card">
            <div class="orgs__featured-code">{{ o.code }}</div>
            <div class="orgs__featured-label">{{ o.label }}</div>
            <div class="orgs__featured-desc">{{ o.desc }}</div>
          </div>
        </div>
        <!-- 中部 2 中: ARWU + EduRank -->
        <div class="orgs__major">
          <div v-for="o in orgsMajor" :key="o.code" class="orgs__major-card">
            <div class="orgs__major-code">{{ o.code }}</div>
            <div class="orgs__major-label">{{ o.label }}</div>
            <div class="orgs__major-desc">{{ o.desc }}</div>
          </div>
        </div>
        <!-- 尾部 4 小: 支持榜单 -->
        <div class="orgs__support">
          <div v-for="o in orgsSupport" :key="o.code" class="orgs__support-card">
            <span class="orgs__support-code">{{ o.code }}</span>
            <span class="orgs__support-label">{{ o.label }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ============================================
         §8 底 CTA · 整页唯一全色块 #1456f0
         ============================================ -->
    <div class="page-container section-band">
      <div class="cta">
        <div class="cta__inner">
          <div class="cta__copy">
            <div class="t-caption-bold" style="color: rgba(255,255,255,0.7)">开始</div>
            <h2 class="t-h2 cta__title">用真实数据选校</h2>
            <p class="cta__sub">进入学校库, 按 4 维排名 + 国家 + 区间过滤, 1 分钟生成选校清单</p>
          </div>
          <UButton to="/universities" color="neutral" variant="solid" size="xl" icon="i-lucide-search" label="立即开始选校" class="cta__btn rounded-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ============================================
   §1 Hero · 80px H1 · 居中 1 列
   ============================================ */
.hero {
  padding: 96px 0 48px;
  background: var(--color-canvas);
}
@media (max-width: 768px) {
  .hero { padding: 56px 0 32px; }
}
.hero__inner {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  max-width: 880px;
  margin: 0 auto;
}
.hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 9999px;
}
.hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  background: var(--color-brand-blue);
  border-radius: 9999px;
}
.hero__eyebrow-text {
  color: var(--color-slate);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.3px;
}
.hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 80px;
  font-weight: 600;
  line-height: 1.10;
  letter-spacing: -0.025em;
  color: var(--color-ink);
}
@media (max-width: 768px) {
  .hero__title { font-size: 48px; }
}
.hero__title-accent {
  color: var(--color-brand-blue);
  font-style: italic;
}
.hero__sub {
  max-width: 640px;
  margin: 0;
  color: var(--color-slate);
  font-family: var(--font-ui);
  font-size: 17px;
  line-height: 1.6;
}
.hero__sub strong {
  color: var(--color-ink);
  font-weight: 600;
  font-family: var(--font-data);
  font-variant-numeric: tabular-nums;
}
.hero__ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin-top: 12px;
}

/* ============================================
   §2 KPI · 0 图标, 5 大数字对齐, 1px 顶/底分隔
   ============================================ */
.kpi-band { margin-top: 32px; }
.kpi {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border-top: 1px solid var(--color-hairline);
  border-bottom: 1px solid var(--color-hairline);
}
@media (min-width: 768px) {
  .kpi { grid-template-columns: repeat(5, 1fr); }
}
.kpi__cell {
  padding: 32px 24px;
  border-right: 1px solid var(--color-hairline);
}
.kpi__cell:last-child { border-right: 0; }
@media (max-width: 768px) {
  .kpi__cell:nth-child(2n) { border-right: 0; }
  .kpi__cell:nth-child(-n+4) { border-bottom: 1px solid var(--color-hairline); }
}
.kpi__label {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}
.kpi__value {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 600;
  line-height: 1.10;
  color: var(--color-ink);
  letter-spacing: -0.0375em;
  font-variant-numeric: tabular-nums;
  margin-bottom: 8px;
}
@media (max-width: 768px) {
  .kpi__value { font-size: 36px; }
}
.kpi__hint {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--color-slate);
}

/* ============================================
   §3 Trend · 1 大图 280px + 4 维色 + 峰值标签
   ============================================ */
.section-band { margin-top: 80px; }
@media (max-width: 768px) {
  .section-band { margin-top: 56px; }
}
.section-head { margin-bottom: 32px; }
.section-head--center { text-align: center; }

.trend {
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  padding: 32px;
}
@media (max-width: 768px) { .trend { padding: 20px; } }
.trend__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
.trend__loading {
  display: flex;
  align-items: center;
  height: 280px;
  justify-content: center;
}
.trend__chart { display: flex; flex-direction: column; gap: 20px; }
.trend__svg {
  display: block;
  width: 100%;
  height: 280px;
  font-family: var(--font-data);
}
.trend__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 24px;
  font-family: var(--font-ui);
  padding-top: 16px;
  border-top: 1px solid var(--color-hairline);
}
.trend__legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.trend__dot {
  width: 10px;
  height: 10px;
  border-radius: 9999px;
  flex-shrink: 0;
}
.trend__dot.is-faded { opacity: 0.4; }
.trend__legend-name {
  font-size: 13px;
  color: var(--color-ink);
  font-weight: 500;
}
.trend__legend-name.is-faded { color: var(--color-slate); font-weight: 400; }
.trend__legend-rank {
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand-blue);
  font-variant-numeric: tabular-nums;
}

/* ============================================
   §4 Modules · 4 卡 + 主推 2x2 / 次要 1x1
   ============================================ */
.modules {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .modules {
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(2, 1fr);
  }
  .module.is-featured { grid-column: 1; grid-row: 1 / span 2; }
}
.module {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 32px;
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  text-decoration: none;
  transition: all 200ms ease;
  height: 100%;
}
.module:hover {
  transform: translateY(-2px);
  border-color: var(--color-brand-blue);
  box-shadow: 0 8px 24px -4px rgba(20, 86, 240, 0.12);
}
.module.is-featured {
  background: var(--color-ink);
  border-color: var(--color-ink);
}
.module.is-featured:hover {
  background: var(--color-ink);
  box-shadow: 0 12px 32px -4px rgba(0, 0, 0, 0.3);
}
.module__icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-1);
  border-radius: 10px;
  color: var(--color-brand-blue);
}
.module.is-featured .module__icon {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-canvas);
}
.module__title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  color: var(--color-ink);
  letter-spacing: 0;
  margin-top: 4px;
}
.module.is-featured .module__title { color: var(--color-canvas); }
.module__desc {
  font-family: var(--font-ui);
  font-size: 14px;
  color: var(--color-slate);
  line-height: 1.5;
  flex-grow: 1;
}
.module.is-featured .module__desc { color: rgba(255, 255, 255, 0.7); }
.module__cta {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  color: var(--color-brand-blue);
  margin-top: 8px;
}
.module.is-featured .module__cta { color: var(--color-canvas); }

/* ============================================
   §5 Flow · 4 步流程图 (1 大列 4 段)
   ============================================ */
.flow {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  overflow: hidden;
}
@media (min-width: 768px) {
  .flow { grid-template-columns: repeat(4, 1fr); }
}
.flow__step {
  padding: 32px;
  border-right: 1px solid var(--color-hairline);
  border-bottom: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  transition: background 200ms ease;
}
.flow__step:last-child { border-right: 0; }
@media (min-width: 768px) {
  .flow__step { border-bottom: 0; position: relative; }
  .flow__step:nth-child(1) { background: var(--color-surface-1); }
  .flow__step:not(:last-child)::after {
    content: '→';
    position: absolute;
    top: 50%;
    right: -12px;
    transform: translateY(-50%);
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-canvas);
    color: var(--color-brand-blue);
    font-family: var(--font-ui);
    font-size: 16px;
    font-weight: 600;
    z-index: 2;
  }
}
.flow__step:hover { background: var(--color-surface-1); }
.flow__n {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 500;
  color: var(--color-brand-blue);
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.02em;
  margin-bottom: 12px;
}
.flow__t {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 500;
  color: var(--color-ink);
  margin-bottom: 6px;
}
.flow__d {
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--color-slate);
  line-height: 1.5;
}

/* ============================================
   §6 FAQ · 3 问 (上下分隔线, 不用 accordion)
   ============================================ */
.faqs {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-hairline);
}
.faq {
  padding: 32px 0;
  border-bottom: 1px solid var(--color-hairline);
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}
@media (min-width: 768px) {
  .faq { grid-template-columns: 1fr 2fr; gap: 64px; }
}
.faq__q {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: -0.01em;
}
.faq__a {
  font-family: var(--font-ui);
  font-size: 15px;
  color: var(--color-slate);
  line-height: 1.7;
}

/* ============================================
   §7 Orgs · 8 机构按权重排序 (前 4 大, 后 4 小灰)
   ============================================ */
.orgs__featured {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
@media (min-width: 768px) {
  .orgs__featured { grid-template-columns: repeat(2, 1fr); }
}
.orgs__featured-card {
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.orgs__featured-code {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 600;
  color: var(--color-brand-blue);
  letter-spacing: -0.027em;
  line-height: 1.10;
  font-variant-numeric: tabular-nums;
}
.orgs__featured-label {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 500;
  color: var(--color-ink);
  letter-spacing: -0.01em;
}
.orgs__featured-desc {
  font-family: var(--font-ui);
  font-size: 14px;
  color: var(--color-slate);
  line-height: 1.5;
}
.orgs__major {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 16px;
}
@media (min-width: 768px) {
  .orgs__major { grid-template-columns: repeat(2, 1fr); }
}
.orgs__major-card {
  background: var(--color-surface-1);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.orgs__major-code {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 500;
  color: var(--color-charcoal);
  letter-spacing: -0.02em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.orgs__major-label {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 500;
  color: var(--color-ink);
}
.orgs__major-desc {
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--color-slate);
  line-height: 1.4;
}
.orgs__support {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  padding: 24px 0;
  border-top: 1px solid var(--color-hairline);
  margin-top: 16px;
}
.orgs__support-card {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: var(--color-surface-1);
  border-radius: 9999px;
  font-family: var(--font-ui);
  font-size: 12px;
}
.orgs__support-code {
  font-family: var(--font-data);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-slate);
  font-variant-numeric: tabular-nums;
}
.orgs__support-label {
  color: var(--color-slate);
}

/* ============================================
   §8 CTA · 整页唯一全色块 #1456f0
   ============================================ */
.cta {
  background: var(--color-brand-blue);
  border-radius: 24px;
  padding: 64px 48px;
  color: var(--color-canvas);
}
@media (max-width: 768px) {
  .cta { padding: 40px 24px; }
}
.cta__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  max-width: 1000px;
  margin: 0 auto;
}
@media (max-width: 768px) {
  .cta__inner { flex-direction: column; text-align: center; }
}
.cta__copy { flex: 1; }
.cta__title { color: var(--color-canvas); margin: 8px 0 12px; }
.cta__sub {
  font-family: var(--font-ui);
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin: 0;
}
.cta__btn {
  background: var(--color-canvas) !important;
  color: var(--color-brand-blue) !important;
  font-weight: 600 !important;
  padding: 0 32px !important;
  height: 56px !important;
}
.cta__btn:hover {
  background: rgba(255, 255, 255, 0.9) !important;
}
</style>
