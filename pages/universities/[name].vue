<script setup lang="ts">
import { queryAllQs, drawerData } from '~/lib/api/university'
import type { UniversityAllDTO } from '~/types'

const route = useRoute()
const router = useRouter()

const name = computed(() => decodeURIComponent(String(route.params.name || '')))

useHead({ title: () => `${name.value} · 学校详情` })

// 数据
const detail = ref<UniversityAllDTO | null>(null)
const chartData = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const foundFromList = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    // 1) 用 queryAll 搜这一所的汇总数据
    const list = await queryAllQs({
      page: 1,
      limit: 50,
      universityNameChinese: name.value,
      rankVariant: 'all'
    }) as any
    const records = list?.records ?? list?.data?.records ?? []
    if (records.length > 0) {
      detail.value = records[0]
      foundFromList.value = true
    }
    // 2) 拉抽屉详细图表数据
    const drawer = await drawerData(name.value) as any
    if (drawer?.chatData) {
      chartData.value = drawer
    }
  } catch (e: any) {
    console.warn('[detail] load failed', e?.message)
    error.value = '后端不可达,显示 mock 数据'
    detail.value = generateMockDetail(name.value)
    chartData.value = generateMockChart(name.value)
  } finally {
    loading.value = false
  }
}

function generateMockDetail(n: string): UniversityAllDTO {
  return {
    universityNameChinese: n,
    universityTags: '美国',
    universityTagsState: '北美洲',
    rankingYear: '2025',
    currentQsAllRank: 5,
    currentQsComputerRank: 3,
    currentUsnewsAllRank: 3,
    currentUsnewsComputerRank: 2
  }
}

function generateMockChart(_n: string) {
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
  return {
    chatData: {
      series: [
        { name: 'QS 综合', smooth: true, data: [6, 5, 4, 4, 5, 4, 5, 5] },
        { name: 'QS 计算机', smooth: true, data: [3, 4, 3, 3, 3, 2, 3, 3] },
        { name: 'US News 综合', smooth: true, data: [5, 4, 3, 3, 3, 2, 3, 3] },
        { name: 'US News 计算机', smooth: true, data: [2, 2, 1, 2, 2, 1, 2, 2] }
      ]
    },
    legendData: years
  }
}

onMounted(load)

// 4 维排名数据
const rankCards = computed(() => {
  if (!detail.value) return []
  const d = detail.value
  return [
    {
      label: 'QS 综合',
      rank: d.currentQsAllRank,
      icon: 'i-lucide-globe-2',
      color: 'var(--color-brand-900)'
    },
    {
      label: 'QS 计算机',
      rank: d.currentQsComputerRank,
      icon: 'i-lucide-cpu',
      color: 'var(--color-brand-700)'
    },
    {
      label: 'US News 综合',
      rank: d.currentUsnewsAllRank,
      icon: 'i-lucide-award',
      color: 'var(--color-brand-deep, #17437d)'
    },
    {
      label: 'US News 计算机',
      rank: d.currentUsnewsComputerRank,
      icon: 'i-lucide-code-2',
      color: 'var(--color-brand-500, #3b82f6)'
    }
  ]
})

// SVG 折线图 (手画, 避免 echart 重量级)
const chartGeometry = computed(() => {
  if (!chartData.value?.chatData?.series?.length) return null
  const series = chartData.value.chatData.series
  const years = chartData.value.legendData || []
  const W = 720, H = 280, P = 40
  const allValues: number[] = []
  series.forEach((s: any) => (s.data || []).forEach((v: any) => {
    if (typeof v === 'number' && v > 0) allValues.push(v)
  }))
  const maxV = Math.max(...allValues, 10) * 1.1
  const minV = 0
  const xStep = (W - P * 2) / Math.max(1, years.length - 1)
  const yScale = (v: number) => H - P - ((v - minV) / (maxV - minV)) * (H - P * 2)

  const paths = series.map((s: any, idx: number) => {
    const pts = (s.data || []).map((v: any, i: number) => {
      const x = P + i * xStep
      const y = typeof v === 'number' ? yScale(v) : H - P
      return [x, y, v]
    })
    return { name: s.name, color: ['#1456f0', '#3b82f6', '#60a5fa', '#93c5fd'][idx % 4], points: pts }
  })

  return { W, H, P, years, maxV, minV, xStep, yScale, paths }
})

function back() { router.back() }
</script>

<template>
  <div>
    <section class="page-container detail-hero">
      <button class="back-btn" @click="back">
        <UIcon name="i-lucide-arrow-left" class="size-4" />
        <span>返回</span>
      </button>
      <div class="detail-hero__head">
        <div>
          <h1 class="detail-hero__title">{{ name || '未知大学' }}</h1>
          <div class="detail-hero__meta" v-if="detail">
            <span class="meta-chip">
              <UIcon name="i-lucide-map-pin" class="size-3" />
              {{ detail.universityTags || '—' }}
            </span>
            <span class="meta-chip" v-if="detail.universityTagsState">
              <UIcon name="i-lucide-globe-2" class="size-3" />
              {{ detail.universityTagsState }}
            </span>
            <span class="meta-chip" v-if="detail.rankingYear">
              <UIcon name="i-lucide-calendar" class="size-3" />
              {{ detail.rankingYear }} 年
            </span>
          </div>
        </div>
      </div>
    </section>

    <div v-if="error" class="page-container">
      <div class="banner-warn">
        <UIcon name="i-lucide-alert-circle" class="size-4" />
        <span>{{ error }}</span>
      </div>
    </div>

    <!-- 4 维排名卡 -->
    <section class="page-container rank-grid-section">
      <div class="rank-grid">
        <div v-for="r in rankCards" :key="r.label" class="rank-grid__card">
          <div class="rank-grid__icon" :style="{ background: r.color + '15', color: r.color }">
            <UIcon :name="r.icon" class="size-5" />
          </div>
          <div class="rank-grid__label">{{ r.label }}</div>
          <div class="rank-grid__value" :style="{ color: r.color }">
            <span class="rank-grid__num">{{ r.rank ?? '—' }}</span>
            <span class="rank-grid__suffix">/ 排名</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 趋势图 -->
    <section class="page-container chart-section">
      <div class="ds-card chart-card">
        <div class="chart-card__head">
          <h2 class="chart-card__title">历年排名趋势</h2>
          <p class="chart-card__sub">4 个维度的排名变化 (越低越好)</p>
        </div>

        <div v-if="chartGeometry" class="chart-svg-wrap">
          <svg
            :viewBox="`0 0 ${chartGeometry.W} ${chartGeometry.H}`"
            class="chart-svg"
            preserveAspectRatio="xMidYMid meet"
          >
            <!-- 网格 + Y 轴 -->
            <g class="chart-grid">
              <line
                v-for="i in 5"
                :key="'g' + i"
                :x1="chartGeometry.P"
                :x2="chartGeometry.W - chartGeometry.P"
                :y1="chartGeometry.P + (i - 1) * (chartGeometry.H - chartGeometry.P * 2) / 4"
                :y2="chartGeometry.P + (i - 1) * (chartGeometry.H - chartGeometry.P * 2) / 4"
                stroke="#e5e7eb"
                stroke-dasharray="3 3"
                stroke-width="1"
              />
              <text
                v-for="i in 5"
                :key="'t' + i"
                :x="chartGeometry.P - 8"
                :y="chartGeometry.P + (i - 1) * (chartGeometry.H - chartGeometry.P * 2) / 4 + 4"
                text-anchor="end"
                fill="#8e8e93"
                font-size="11"
              >
                {{ Math.round((chartGeometry.maxV - (i - 1) * chartGeometry.maxV / 4)) }}
              </text>
            </g>

            <!-- 折线 -->
            <g v-for="(p, idx) in chartGeometry.paths" :key="'p' + idx">
              <path
                :d="p.points.map((pt: any, i: number) => `${i === 0 ? 'M' : 'L'} ${pt[0]} ${pt[1]}`).join(' ')"
                fill="none"
                :stroke="p.color"
                stroke-width="2.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <circle
                v-for="(pt, i) in p.points"
                :key="'c' + idx + '-' + i"
                :cx="pt[0]"
                :cy="pt[1]"
                r="3.5"
                :fill="p.color"
              />
            </g>

            <!-- X 轴 -->
            <g class="chart-xaxis">
              <text
                v-for="(y, i) in chartGeometry.years"
                :key="'x' + i"
                :x="chartGeometry.P + i * chartGeometry.xStep"
                :y="chartGeometry.H - chartGeometry.P + 20"
                text-anchor="middle"
                fill="#8e8e93"
                font-size="11"
              >
                {{ y }}
              </text>
            </g>
          </svg>
        </div>

        <div v-else class="chart-card__empty">
          <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
          <span>加载中...</span>
        </div>

        <!-- Legend -->
        <div v-if="chartGeometry" class="chart-legend">
          <div
            v-for="(p, idx) in chartGeometry.paths"
            :key="'l' + idx"
            class="chart-legend__item"
          >
            <span class="chart-legend__dot" :style="{ background: p.color }"></span>
            <span>{{ p.name }}</span>
          </div>
        </div>
      </div>
    </section>

    <!-- 历年明细表 -->
    <section v-if="chartGeometry" class="page-container table-section">
      <div class="ds-card table-wrap">
        <div class="table-wrap__head">
          <h2 class="table-wrap__title">历年数据明细</h2>
        </div>
        <table class="detail-table">
          <thead>
            <tr>
              <th>维度</th>
              <th v-for="y in chartGeometry.years" :key="y">{{ y }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(p, idx) in chartGeometry.paths" :key="idx">
              <td class="detail-table__name">
                <span class="chart-legend__dot" :style="{ background: p.color }"></span>
                {{ p.name }}
              </td>
              <td v-for="(pt, i) in p.points" :key="i" class="detail-table__cell">
                {{ pt[2] ?? '—' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped>
.detail-hero { padding: 24px 24px 0; }
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border: 0;
  background: transparent;
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-ink-700);
  cursor: pointer;
  transition: all 160ms ease;
}
.back-btn:hover { background: rgba(0, 0, 0, 0.05); color: var(--color-ink-1000); }

.detail-hero__head { margin-top: 8px; }
.detail-hero__title {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 600;
  color: var(--color-ink-1000);
  margin: 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
}
.detail-hero__meta {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
}
.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--color-surface-2);
  border-radius: 9999px;
  font-size: 12px;
  color: var(--color-ink-700);
}

.banner-warn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-top: 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 12px;
  font-size: 13px;
}

.rank-grid-section { padding: 24px; }
.rank-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
@media (max-width: 768px) { .rank-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 480px) { .rank-grid { grid-template-columns: 1fr; } }

.rank-grid__card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: #fff;
  border-radius: 16px;
  border: 1px solid var(--color-border-light);
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
  transition: all 240ms ease;
}
.rank-grid__card:hover {
  transform: translateY(-2px);
  box-shadow: rgba(44, 30, 116, 0.16) 0px 0px 15px;
}
.rank-grid__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
}
.rank-grid__label { font-size: 13px; color: var(--color-ink-700); }
.rank-grid__value { display: flex; align-items: baseline; gap: 6px; }
.rank-grid__num { font-family: var(--font-display); font-size: 40px; font-weight: 600; line-height: 1; letter-spacing: -0.02em; }
.rank-grid__suffix { font-size: 13px; color: var(--color-ink-500); }

.chart-section { padding: 0 24px 24px; }
.chart-card { padding: 24px; }
.chart-card__head { margin-bottom: 20px; }
.chart-card__title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-ink-1000);
  margin: 0;
}
.chart-card__sub { font-size: 13px; color: var(--color-ink-700); margin: 4px 0 0; }

.chart-svg-wrap {
  width: 100%;
  background: var(--color-surface-1);
  border-radius: 12px;
  padding: 16px;
}
.chart-svg { width: 100%; height: auto; display: block; }

.chart-card__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 240px;
  color: var(--color-ink-500);
  font-size: 13px;
}

.chart-legend {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--color-border-light);
}
.chart-legend__item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-ink-1000);
}
.chart-legend__dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.table-section { padding: 0 24px 24px; }
.table-wrap { padding: 0; overflow: hidden; }
.table-wrap__head { padding: 20px 24px 0; }
.table-wrap__title { font-family: var(--font-display); font-size: 18px; font-weight: 600; margin: 0; }
.detail-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 16px; }
.detail-table thead { background: var(--color-surface-1); }
.detail-table th, .detail-table td { padding: 10px 16px; text-align: center; border-bottom: 1px solid var(--color-border-light); }
.detail-table th { font-size: 12px; font-weight: 600; color: var(--color-ink-700); }
.detail-table__name { text-align: left; display: flex; align-items: center; gap: 8px; font-weight: 500; }
.detail-table__cell { font-family: var(--font-data); color: var(--color-ink-1000); }

@media (max-width: 768px) {
  .detail-hero__title { font-size: 28px; }
  .rank-grid__num { font-size: 28px; }
}
</style>
