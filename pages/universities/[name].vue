<script setup lang="ts">
/**
 * 院校详情页 - 整体重做 (2026-06-21)
 *
 * 设计原则 (用户思维 + DESIGN.md MiniMax + 东京大学/menggy 范式):
 *   1. 一屏答 1 个问题, 4 维平行展示 (不分 tab)
 *   2. 大数字前置 + sparkline mini 趋势 + 5 年 diff 趋势徽章
 *   3. 历史最佳 highlight (绿底 + ★ 角标)
 *   4. 关键事实 1 行 4 卡 (派生, 不发额外 API)
 *   5. 趋势大图 vs 矩阵表 互不重复 (图看变化, 表看最佳年)
 *   6. 其他榜单默认折叠, 决策 CTA 强
 *
 * 真凶链 (从 commit 10852a8 + 456bd79):
 *   - 4 维排名 drawerData 此前硬编码 ASU 对比基线 → 修后只 4 条 series
 *   - Tailwind v4 样式丢失 → main.css @source 修复
 *   - 当前问题: 视觉老气 (vision 3.5/10) + 信息密度低
 */
import { queryAllQs } from '~/lib/api/university'
import { drawerData, queryBackup2List } from '~/lib/api/ranking'
import type { Backup2Record, UniversityAllDTO } from '~/types'

const route = useRoute()
const router = useRouter()

const name = computed(() => decodeURIComponent(String(route.params.name || '')))

useHead({ title: () => `${name.value} · 学校详情` })

// ============== 数据 ==============
const detail = ref<UniversityAllDTO | null>(null)
const chartData = ref<any | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const loadRunId = ref(0)

const backup2Groups = ref<Array<{ rankTable: string; label: string; records: Backup2Record[] }>>([])
const backup2Loading = ref(false)
const otherRankingsOpen = ref(false)  // 默认折叠

const BACKUP2_LABEL_MAP: Record<string, string> = {
  arwu_subject: 'ARWU 学科',
  edurank_region: 'EduRank 地区',
  declining_trend: '下降趋势',
  mosiur_world: 'MOSIUR 全球',
  rur_world: 'RUR 全球',
  usnews_subject: 'US News 学科',
  qs_sustainability: 'QS 可持续'
}

async function loadBackup2Data(runId: number) {
  backup2Loading.value = true
  const rankTables = Object.keys(BACKUP2_LABEL_MAP)
  const groups: typeof backup2Groups.value = []
  const results = await Promise.allSettled(
    rankTables.map(rt => queryBackup2List({
      page: 1,
      limit: 50,
      rankTable: rt,
      universityNameChinese: name.value
    }))
  )
  if (runId !== loadRunId.value) return
  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      const records: Backup2Record[] = r.value?.data?.records ?? []
      if (records.length > 0) {
        groups.push({
          rankTable: rankTables[i]!,
          label: BACKUP2_LABEL_MAP[rankTables[i]!]!,
          records
        })
      }
    }
  })
  groups.sort((a, b) => b.records.length - a.records.length)
  backup2Groups.value = groups
  backup2Loading.value = false
}

async function load() {
  loading.value = true
  error.value = null
  loadRunId.value++
  const runId = loadRunId.value
  try {
    const list = await queryAllQs({
      page: 1, limit: 50,
      universityNameChinese: name.value,
      rankVariant: 'all'
    })
    if (runId !== loadRunId.value) return
    const records = list.records ?? []
    detail.value = records[0] ?? null

    const drawer = await drawerData(name.value)
    if (runId !== loadRunId.value) return
    if (drawer.chatData) chartData.value = drawer

    await loadBackup2Data(runId)
  } catch (e: any) {
    if (runId !== loadRunId.value) return
    console.warn('[detail] load failed', e?.message)
    error.value = '后端不可达, 显示示意数据'
    detail.value = generateMockDetail(name.value)
    chartData.value = generateMockChart()
    backup2Groups.value = []
  } finally {
    if (runId === loadRunId.value) loading.value = false
  }
}

onMounted(load)
onBeforeUnmount(() => { loadRunId.value++ })

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
function generateMockChart() {
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

// ============== 4 维排名数据派生 (不依赖 rankTab, 4 维全显示) ==============
const rankCards = computed(() => {
  if (!detail.value || !chartData.value?.chatData) {
    return FALLBACK_CARDS.map(c => ({ ...c, series: [] as (number | null)[], years: [] as string[] }))
  }
  const years = chartData.value.legendData ?? []
  return FALLBACK_CARDS.map(c => {
    const series = chartData.value.chatData.series.find((s: any) => s.name?.endsWith(c.suffix))
    return {
      ...c,
      rank: (detail.value as any)[c.rankField] as number | null,
      series: (series?.data ?? []) as (number | null)[],
      years
    }
  })
})

const FALLBACK_CARDS = [
  { label: 'QS 综合', suffix: 'qs', icon: 'i-lucide-globe-2', color: '#1456f0', rankField: 'currentQsAllRank' },
  { label: 'QS 计算机', suffix: 'qs_cs', icon: 'i-lucide-cpu', color: '#3b82f6', rankField: 'currentQsComputerRank' },
  { label: 'US News 综合', suffix: 'usnews', icon: 'i-lucide-award', color: '#ea5ec1', rankField: 'currentUsnewsAllRank' },
  { label: 'US News 计算机', suffix: 'usnews_cs', icon: 'i-lucide-code-2', color: '#a855f7', rankField: 'currentUsnewsComputerRank' }
]

// ============== 对比组 (localStorage) ==============
const COMPARE_KEY = 'choosephd.compare'
const compareList = ref<{ name: string }[]>([])

function loadCompare() {
  if (import.meta.server) return
  try {
    const raw = localStorage.getItem(COMPARE_KEY)
    if (raw) compareList.value = JSON.parse(raw)
  } catch {}
}
function saveCompare() {
  try { localStorage.setItem(COMPARE_KEY, JSON.stringify(compareList.value)) } catch {}
}
function toggleCompare() {
  if (!detail.value) return
  const idx = compareList.value.findIndex(c => c.name === name.value)
  if (idx >= 0) compareList.value.splice(idx, 1)
  else {
    if (compareList.value.length >= 6) compareList.value.shift()
    compareList.value.push({ name: name.value })
  }
  saveCompare()
}
const inCompare = computed(() => compareList.value.some(c => c.name === name.value))

// ============== 杂项 ==============
function back() { router.back() }

function rankBadgeTier(rank: number | null | undefined): string {
  if (rank == null) return 'rank-badge--normal'
  if (rank <= 3) return 'rank-badge--gold'
  if (rank <= 10) return 'rank-badge--silver'
  if (rank <= 50) return 'rank-badge--bronze'
  return 'rank-badge--normal'
}

onMounted(loadCompare)
</script>

<template>
  <div>
    <!-- ============== 1. Hero (综合信息) ============== -->
    <SchoolHero
      :name="name || '未知大学'"
      :detail="detail"
      :loading="loading"
      @back="back"
      @toggle-compare="toggleCompare"
    />

    <UContainer v-if="error" class="pt-3">
      <UAlert color="warning" variant="subtle" :title="error" icon="i-lucide-alert-circle" />
    </UContainer>

    <!-- ============== 2. 4 维排名大数字 (sparkline + 趋势徽章) ============== -->
    <div class="page-container section-band">
      <div class="section-head">
        <div class="t-caption-bold text-muted">4 维排名 · 综合/计算机 × QS/US News</div>
        <h2 class="t-h3 mt-1">排名一览</h2>
        <p class="t-caption mt-1 text-muted">最新年大数字 · 历年 sparkline · 与 5 年前对比徽章</p>
      </div>
      <div class="rank-grid">
        <RankSparkCard
          v-for="r in rankCards"
          :key="r.label"
          :label="r.label"
          :icon="r.icon"
          :color="r.color"
          :rank="r.rank"
          :series="r.series"
          :years="r.years"
        />
      </div>
    </div>

    <!-- ============== 3. 关键事实 1 行 4 卡 (派生) ============== -->
    <div v-if="chartData" class="page-container section-band">
      <MetricStrip :chart="chartData" :school-name="name" />
    </div>

    <!-- ============== 4. 历年趋势大图 ============== -->
    <div v-if="chartData" class="page-container section-band">
      <UCard class="trend-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <div class="mb-5">
          <h2 class="t-h3">历年排名趋势</h2>
          <p class="t-caption mt-1">4 个维度 · 历年变化 (越低越好)</p>
        </div>
        <ClientOnly>
          <div class="trend-card__chart">
            <ChartSvgChart :chart="chartData" :height="320" />
          </div>
          <template #fallback>
            <div class="trend-card__loading">
              <UIcon name="i-lucide-loader" class="mr-1.5 size-4 animate-spin" />
              <span class="t-body-sm text-muted">加载趋势数据…</span>
            </div>
          </template>
        </ClientOnly>
      </UCard>
    </div>

    <!-- ============== 5. 历年数据明细 (年份 × 维度矩阵) ============== -->
    <div v-if="chartData" class="page-container section-band">
      <UCard class="matrix-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-6' }">
        <div class="mb-5">
          <h2 class="t-h3">历年数据明细</h2>
          <p class="t-caption mt-1">年份 × 4 维排名 · 绿色高亮 = 该维度历史最佳</p>
        </div>
        <RankingMatrix :chart="chartData" />
      </UCard>
    </div>

    <!-- ============== 6. 其他榜单 (默认折叠) ============== -->
    <div v-if="backup2Groups.length > 0 || backup2Loading" class="page-container section-band">
      <UCard class="other-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
        <button
          type="button"
          class="other-toggle"
          :aria-expanded="otherRankingsOpen"
          @click="otherRankingsOpen = !otherRankingsOpen"
        >
          <div class="flex-1 text-left">
            <div class="t-caption-bold text-muted">多榜单覆盖</div>
            <h2 class="t-h3 mt-1">其他榜单排名</h2>
            <p class="t-caption mt-1 text-muted">
              {{ backup2Groups.length }} 个榜单有数据
              <span v-if="backup2Loading" class="ml-2 inline-flex items-center gap-1 text-muted">
                <UIcon name="i-lucide-loader-2" class="size-3.5 animate-spin" />
                加载中…
              </span>
              <span v-else-if="backup2Groups.length > 0" class="ml-2">
                点击展开查看学科/地区/全球细分榜单
              </span>
            </p>
          </div>
          <UIcon
            :name="otherRankingsOpen ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'"
            class="size-5 text-muted"
          />
        </button>

        <div v-if="otherRankingsOpen" class="other-body">
          <div class="space-y-5">
            <UCard
              v-for="g in backup2Groups"
              :key="g.rankTable"
              class="other-rank-card"
              :ui="{ root: 'rounded-xl border border-default bg-muted', body: 'p-5' }"
            >
              <div class="mb-3 flex items-center justify-between gap-2">
                <div class="flex items-center gap-2">
                  <UIcon name="i-lucide-book-marked" class="size-4 text-brand" />
                  <span class="t-h4">{{ g.label }}</span>
                </div>
                <span class="t-caption text-muted">共 {{ g.records.length }} 条</span>
              </div>
              <div class="other-rank-grid">
                <div
                  v-for="(r, i) in g.records.slice(0, 10)"
                  :key="i"
                  class="other-rank-row"
                >
                  <span :class="['rank-badge', rankBadgeTier(r.currentRankInteger), 'rank-badge--sm']">
                    {{ r.currentRankInteger ?? '—' }}
                  </span>
                  <span class="other-rank-row__title">
                    <template v-if="r.rankingCategory">{{ r.rankingCategory }}</template>
                    <template v-else-if="r.universityTags">{{ r.universityTags }}</template>
                    <template v-else>—</template>
                  </span>
                  <span v-if="r.rankingYear" class="other-rank-row__year">
                    <UIcon name="i-lucide-calendar" class="size-3" />
                    {{ r.rankingYear }}
                  </span>
                  <span
                    v-if="r.currentRankRaw && r.currentRankRaw !== '#' + r.currentRankInteger"
                    class="other-rank-row__raw"
                  >原: {{ r.currentRankRaw }}</span>
                </div>
                <div v-if="g.records.length > 10" class="other-rank-more">
                  还有 {{ g.records.length - 10 }} 条…
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </UCard>
    </div>

    <!-- ============== 7. 底 CTA ============== -->
    <div class="page-container section-band">
      <UCard class="bottom-cta" :ui="{ root: 'rounded-3xl border border-default bg-brand ring-0', body: 'p-8' }">
        <div class="bottom-cta__inner">
          <div>
            <div class="t-caption-bold is-on-dark">{{ name }}</div>
            <h2 class="t-h2 mt-1 is-on-dark">开始比较这所大学</h2>
            <p class="t-body-sm mt-2 bottom-cta__sub">
              把它放进对比清单 · 拉到「数据图表」做 4 维并列
            </p>
          </div>
          <div class="bottom-cta__actions">
            <UButton
              :icon="inCompare ? 'i-lucide-list-checks' : 'i-lucide-list-plus'"
              :color="inCompare ? 'neutral' : 'primary'"
              :variant="inCompare ? 'soft' : 'solid'"
              size="md"
              :label="inCompare ? '已加入对比' : '加入对比'"
              class="rounded-full"
            />
            <UButton :to="'/charts'" color="primary" variant="solid" size="md" icon="i-lucide-git-compare" label="去图表对比" class="rounded-full" />
            <UButton :to="'/universities'" color="primary" variant="outline" size="md" icon="i-lucide-library" label="浏览其他" class="rounded-full" />
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>

<style scoped>
/* 4 维排名 grid (4 列桌面, 2 列平板, 1 列手机) */
.rank-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .rank-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .rank-grid { grid-template-columns: repeat(4, 1fr); }
}

/* Section 间距 */
.section-band { margin-top: 24px; }
@media (min-width: 768px) { .section-band { margin-top: 32px; } }
.section-head { margin-bottom: 16px; }

/* Trend */
.trend-card__chart { padding: 16px; background: var(--color-surface); border-radius: 16px; }
.trend-card__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 80px;
}

/* Other rank toggle (默认折叠) */
.other-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-align: left;
}
.other-toggle:hover { opacity: 0.85; }
.other-body { margin-top: 20px; }

/* Other rank */
.other-rank-grid { display: flex; flex-direction: column; gap: 4px; }
.other-rank-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  background: var(--color-canvas);
  border-radius: 8px;
  font-family: var(--font-ui);
}
.other-rank-row__title {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  flex: 1;
  min-width: 0;
}
.other-rank-row__year {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 9999px;
  border: 1px solid var(--color-hairline);
  background: var(--color-canvas);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-slate);
}
.other-rank-row__raw {
  font-size: 11px;
  color: var(--color-stone);
  margin-left: auto;
}
.other-rank-more {
  text-align: center;
  font-size: 11px;
  color: var(--color-stone);
  padding: 4px 0;
}

/* Rank badge (其他榜单内部用) */
:deep(.rank-badge) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 24px;
  padding: 0 6px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  color: var(--color-canvas);
}
:deep(.rank-badge--sm) { font-size: 12px; height: 24px; min-width: 32px; }
:deep(.rank-badge--gold)   { background: #f59e0b; }
:deep(.rank-badge--silver) { background: #9ca3af; color: var(--color-ink); }
:deep(.rank-badge--bronze) { background: #ea580c; }
:deep(.rank-badge--normal) { background: var(--color-surface-soft); color: var(--color-ink); }

/* Bottom CTA */
.bottom-cta { background: var(--color-brand-blue) !important; border-color: transparent !important; }
.bottom-cta__inner {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.is-on-dark { color: var(--color-on-dark); }
.bottom-cta__sub { color: rgba(255, 255, 255, 0.80); }
.bottom-cta__actions { display: flex; flex-wrap: wrap; gap: 12px; }
</style>
