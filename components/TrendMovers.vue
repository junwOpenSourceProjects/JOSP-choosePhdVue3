<script setup lang="ts">
/**
 * TrendMovers · 趋势快讯 (signature element)
 *
 * 6 张「近期排名变化」卡 — user 看到 "这网站真懂排名变化"
 *
 * 每张卡:
 *   - 校名 (中/英)
 *   - 当前排名 (大字)
 *   - 变化幅度 (↑ N / ↓ N / — 0, 色按 tone)
 *   - SVG sparkline (5-10 年走势)
 *   - 排名体系徽章 (QS / US News / ARWU)
 *
 * 数据来源:
 *   - /status/trendAllVariants?universityNameChinese=X (4 维)
 *   - 提取 ranking_qs 数组, 算 first → last = trend
 */

import { computed, onMounted, ref } from 'vue'
import { drawerData } from '~/lib/api/ranking'
import { computeTrend, formatSparklinePath } from '~/utils/format'

interface MoverItem {
  name: string
  enName?: string
  seriesKey: 'qs' | 'usnews' | 'qsCs' | 'usnewsCs'
  seriesLabel: string
}

const CANDIDATES: MoverItem[] = [
  { name: '清华大学', enName: 'Tsinghua University', seriesKey: 'qs', seriesLabel: 'QS' },
  { name: '北京大学', enName: 'Peking University', seriesKey: 'qs', seriesLabel: 'QS' },
  { name: '复旦大学', enName: 'Fudan University', seriesKey: 'qs', seriesLabel: 'QS' },
  { name: '上海交通大学', enName: 'Shanghai Jiao Tong University', seriesKey: 'qs', seriesLabel: 'QS' },
  { name: '香港中文大学', enName: 'Chinese University of Hong Kong', seriesKey: 'usnews', seriesLabel: 'US News' },
  { name: '香港大学', enName: 'University of Hong Kong', seriesKey: 'usnews', seriesLabel: 'US News' }
]

interface MoverCard {
  name: string
  enName: string
  seriesLabel: string
  current: number
  tone: 'up' | 'down' | 'flat'
  trend: number
  sparkPath: string
}

const cards = ref<MoverCard[]>([])
const loading = ref(true)

const hasData = computed(() => cards.value.length > 0)

onMounted(async () => {
  const results = await Promise.allSettled(
    CANDIDATES.map(async (c) => {
      const resp: any = await drawerData(c.name)
      const data = resp ?? {}
      const seriesList: any[] = data?.chatData?.series ?? []
      // 后端 series.name = "${name1}qs" / "${name1}qs_cs" / "${name1}usnews" / "${name1}usnews_cs"
      // 拼接系列对应后缀
      const suffixMap: Record<string, string> = {
        qs: 'qs',
        usnews: 'usnews',
        qsCs: 'qs_cs',
        usnewsCs: 'usnews_cs'
      }
      const wantedSuffix = suffixMap[c.seriesKey]
      // 按 key 长度倒序排 (避免 'usnews' 匹到 'usnews_cs')
      const sorted = [...seriesList].sort((a, b) => (b?.name?.length ?? 0) - (a?.name?.length ?? 0))
      const targetSeries = sorted.find((s) => (s?.name ?? '').endsWith(wantedSuffix))
      const arrRaw = targetSeries?.data
      if (!Array.isArray(arrRaw) || arrRaw.length === 0) return null
      const numeric = arrRaw
        .map((x: any) => (typeof x === 'number' ? x : parseFloat(x)))
        .filter((v: number) => !Number.isNaN(v) && v > 0)
      if (numeric.length === 0) return null
      const { tone, trend, last } = computeTrend(numeric)
      return {
        name: c.name,
        enName: c.enName ?? '',
        seriesLabel: c.seriesLabel,
        current: last,
        tone,
        trend,
        sparkPath: formatSparklinePath(numeric, 120, 28)
      } satisfies MoverCard
    })
  )
  cards.value = results
    .filter((r): r is PromiseFulfilledResult<MoverCard | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((v): v is MoverCard => v !== null)
    .sort((a, b) => a.trend - b.trend) // 升 = 趋势 up, 升最多的排前面
  loading.value = false
})

function trendDisplay(c: MoverCard): string {
  if (c.tone === 'up') return `↑ ${Math.abs(c.trend)}`
  if (c.tone === 'down') return `↓ ${Math.abs(c.trend)}`
  return '— 0'
}

function toneClass(c: MoverCard): string {
  if (c.tone === 'up') return 'text-emerald-600'
  if (c.tone === 'down') return 'text-red-500'
  return 'text-muted'
}
</script>

<template>
  <section class="trend-movers">
    <div class="trend-movers__inner">
      <header class="trend-movers__head">
        <div class="trend-movers__eyebrow">
          <UIcon name="i-lucide-trending-up" class="size-3.5" />
          趋势快讯
        </div>
        <h2 class="trend-movers__title">近期排名上升势头</h2>
        <p class="trend-movers__sub">数据说话 · 不替选 · 你做决策</p>
      </header>

      <div v-if="loading" class="trend-movers__grid">
        <div v-for="n in 6" :key="n" class="trend-movers__card trend-movers__card--skeleton">
          <div class="trend-movers__skeleton-line" />
          <div class="trend-movers__skeleton-line trend-movers__skeleton-line--big" />
        </div>
      </div>

      <div v-else-if="hasData" class="trend-movers__grid">
        <article v-for="c in cards" :key="c.name" class="trend-movers__card">
          <div class="trend-movers__card-head">
            <span class="trend-movers__card-badge">{{ c.seriesLabel }}</span>
            <span :class="['trend-movers__card-trend', toneClass(c)]">{{ trendDisplay(c) }}</span>
          </div>

          <div class="trend-movers__card-body">
            <div class="trend-movers__card-name">{{ c.name }}</div>
            <div class="trend-movers__card-en">{{ c.enName }}</div>
          </div>

          <div class="trend-movers__card-foot">
            <div class="trend-movers__card-rank-block">
              <div class="trend-movers__card-rank-label">当前</div>
              <div class="trend-movers__card-rank-num">#{{ c.current }}</div>
            </div>
            <svg class="trend-movers__card-spark" viewBox="0 0 120 28" preserveAspectRatio="none">
              <path
                :d="c.sparkPath"
                fill="none"
                :stroke="c.tone === 'up' ? '#10b981' : c.tone === 'down' ? '#ef4444' : '#9ca3af'"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </article>
      </div>

      <div v-else class="trend-movers__empty">
        <UIcon name="i-lucide-database" class="size-6 text-muted" />
        <div>暂无趋势数据 · 请先登录加载排名</div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.trend-movers {
  width: 100%;
  background: var(--ui-bg-elevated, #f7f8fa);
  border-bottom: 1px solid var(--ui-border);
}

.trend-movers__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 80px 32px;
}

.trend-movers__head {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 40px;
  max-width: 640px;
}

.trend-movers__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ui-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.trend-movers__title {
  font-family: 'DM Sans', 'Noto Sans SC', system-ui, sans-serif;
  font-size: 40px;
  font-weight: 600;
  line-height: 1.15;
  letter-spacing: -0.02em;
  color: var(--ui-text);
  margin: 0;
}

.trend-movers__sub {
  font-size: 16px;
  font-weight: 400;
  color: var(--ui-text-muted);
  margin: 0;
}

.trend-movers__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.trend-movers__card {
  background: var(--ui-bg);
  border: 1px solid var(--ui-border);
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: border-color 0.15s ease, transform 0.15s ease;
}

.trend-movers__card:hover {
  border-color: var(--ui-primary, #1456f0);
  transform: translateY(-2px);
}

.trend-movers__card--skeleton {
  height: 168px;
  justify-content: center;
}

.trend-movers__skeleton-line {
  height: 16px;
  background: var(--ui-border);
  border-radius: 4px;
  width: 60%;
}

.trend-movers__skeleton-line--big {
  height: 36px;
  width: 40%;
  margin-top: 12px;
}

.trend-movers__card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.trend-movers__card-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--ui-primary, #1456f0);
  background: rgba(20, 86, 240, 0.08);
  padding: 3px 10px;
  border-radius: 9999px;
  letter-spacing: 0.04em;
}

.trend-movers__card-trend {
  font-family: 'Roboto', system-ui, sans-serif;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.trend-movers__card-body {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.trend-movers__card-name {
  font-family: 'DM Sans', 'Noto Sans SC', system-ui, sans-serif;
  font-size: 20px;
  font-weight: 600;
  color: var(--ui-text);
  line-height: 1.3;
}

.trend-movers__card-en {
  font-size: 12px;
  font-weight: 400;
  color: var(--ui-text-muted);
  line-height: 1.3;
}

.trend-movers__card-foot {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  border-top: 1px solid var(--ui-border);
  padding-top: 12px;
}

.trend-movers__card-rank-block {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.trend-movers__card-rank-label {
  font-size: 10px;
  font-weight: 500;
  color: var(--ui-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.trend-movers__card-rank-num {
  font-family: 'Roboto', system-ui, sans-serif;
  font-size: 24px;
  font-weight: 600;
  color: var(--ui-text);
  letter-spacing: -0.02em;
  line-height: 1.1;
}

.trend-movers__card-spark {
  width: 120px;
  height: 28px;
  flex-shrink: 0;
}

.trend-movers__empty {
  padding: 64px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  color: var(--ui-text-muted);
  font-size: 14px;
}

@media (max-width: 768px) {
  .trend-movers__inner {
    padding: 56px 20px;
  }
  .trend-movers__title {
    font-size: 32px;
  }
  .trend-movers__grid {
    grid-template-columns: 1fr;
  }
}
</style>
