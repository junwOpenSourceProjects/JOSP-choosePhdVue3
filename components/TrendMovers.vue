<script setup lang="ts">
/**
 * TrendMovers · 首页趋势快讯
 *
 * 灰底区域，3 列白卡，每卡显示大学名、英文、当前排名、趋势箭头、sparkline。
 */
import { computed, onMounted, ref } from 'vue'
import { drawerData } from '~/lib/api/ranking'
import { computeTrend, formatSparklinePath } from '~/utils/format'
import type { EchartsDTO, ChartSeries } from '~/types'

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
  { name: '香港大学', enName: 'University of Hong Kong', seriesKey: 'usnews', seriesLabel: 'US News' },
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
const topCards = computed(() => cards.value.slice(0, 3))

onMounted(async () => {
  const results = await Promise.allSettled(
    CANDIDATES.map(async (c) => {
      const data = await drawerData(c.name) as unknown as EchartsDTO | null | undefined
      const seriesList: ChartSeries[] = data?.chatData?.series ?? []
      const suffixMap: Record<'qs' | 'usnews' | 'qsCs' | 'usnewsCs', string> = {
        qs: 'qs',
        usnews: 'usnews',
        qsCs: 'qs_cs',
        usnewsCs: 'usnews_cs',
      }
      const wantedSuffix = suffixMap[c.seriesKey]
      const sorted = [...seriesList].sort((a, b) => (b.name.length) - (a.name.length))
      const targetSeries = sorted.find((s) => s.name.endsWith(wantedSuffix))
      const arrRaw = targetSeries?.data
      if (!Array.isArray(arrRaw) || arrRaw.length === 0) return null
      const numeric = arrRaw
        .map((x: number | null) => (typeof x === 'number' ? x : parseFloat(String(x))))
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
        sparkPath: formatSparklinePath(numeric, 120, 36),
      } satisfies MoverCard
    })
  )
  cards.value = results
    .filter((r): r is PromiseFulfilledResult<MoverCard | null> => r.status === 'fulfilled')
    .map((r) => r.value)
    .filter((v): v is MoverCard => v !== null)
    .sort((a, b) => a.trend - b.trend)
  loading.value = false
})

function trendDisplay(c: MoverCard): string {
  if (c.tone === 'up') return `↑ ${Math.abs(c.trend)}`
  if (c.tone === 'down') return `↓ ${Math.abs(c.trend)}`
  return '— 0'
}

function trendToneClass(c: MoverCard): string {
  if (c.tone === 'up') return 'trend-movers__trend--up'
  if (c.tone === 'down') return 'trend-movers__trend--down'
  return 'trend-movers__trend--flat'
}

function trendStroke(c: MoverCard): string {
  if (c.tone === 'up') return '#10b981'
  if (c.tone === 'down') return '#ef4444'
  return '#9ca3af'
}
</script>

<template>
  <section class="trend-movers">
    <div class="trend-movers__inner">
      <div class="trend-movers__header">
        <div>
          <div class="trend-movers__eyebrow">趋势快讯</div>
          <h2 class="trend-movers__title">近期排名上升势头</h2>
        </div>
        <NuxtLink to="/charts" class="trend-movers__link">
          查看完整趋势
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
      </div>

      <div v-if="loading" class="trend-movers__grid">
        <UCard
          v-for="n in 3"
          :key="n"
          class="trend-movers__skeleton"
          :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }"
        >
          <div class="space-y-4">
            <USkeleton class="h-4 w-16" />
            <USkeleton class="h-6 w-32" />
            <USkeleton class="h-4 w-24" />
            <USkeleton class="h-9 w-full" />
          </div>
        </UCard>
      </div>

      <div v-else-if="hasData" class="trend-movers__grid">
        <UCard
          v-for="c in topCards"
          :key="c.name"
          class="trend-movers__card"
          :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 hover:border-ink transition-colors', body: 'p-6' }"
        >
          <div class="trend-movers__head">
            <div>
              <div class="trend-movers__series">{{ c.seriesLabel }}</div>
              <div class="trend-movers__name">{{ c.name }}</div>
              <div class="trend-movers__en">{{ c.enName }}</div>
            </div>
            <span :class="['trend-movers__trend', trendToneClass(c)]">{{ trendDisplay(c) }}</span>
          </div>

          <div class="trend-movers__foot">
            <div class="trend-movers__rank-block">
              <div class="trend-movers__rank-label">当前排名</div>
              <div class="trend-movers__rank-num">#{{ c.current }}</div>
            </div>
            <svg class="trend-movers__spark" viewBox="0 0 120 36" preserveAspectRatio="none">
              <path
                :d="c.sparkPath"
                fill="none"
                :stroke="trendStroke(c)"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>
        </UCard>
      </div>

      <AppEmpty
        v-else
        icon="i-lucide-database"
        title="暂无趋势数据"
        description="登录后加载排名，即可查看近期上升势头"
        size="md"
      />
    </div>
  </section>
</template>

<style scoped>
.trend-movers {
  width: 100%;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-hairline-soft);
}
.trend-movers__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 32px;
}
@media (min-width: 768px) {
  .trend-movers__inner { padding: 96px 32px; }
}
.trend-movers__header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}
@media (min-width: 768px) {
  .trend-movers__header {
    flex-direction: row;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 40px;
  }
}
.trend-movers__eyebrow {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand-coral);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.trend-movers__title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 6px 0 0;
}
@media (min-width: 768px) {
  .trend-movers__title { font-size: 36px; }
}
.trend-movers__link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  text-decoration: none;
  transition: color 160ms ease;
  flex-shrink: 0;
}
.trend-movers__link:hover { color: var(--color-brand-blue); }
.trend-movers__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .trend-movers__grid { grid-template-columns: repeat(3, 1fr); gap: 20px; }
}
.trend-movers__skeleton :deep(.space-y-4 > *) { border-radius: 6px; }
.trend-movers__card { display: flex; flex-direction: column; gap: 24px; }
.trend-movers__head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.trend-movers__series {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 600;
  color: var(--color-stone);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 6px;
}
.trend-movers__name {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.25;
}
.trend-movers__en {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-stone);
  line-height: 1.4;
  margin-top: 2px;
}
.trend-movers__trend {
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: -0.01em;
  flex-shrink: 0;
}
.trend-movers__trend--up { color: #10b981; }
.trend-movers__trend--down { color: #ef4444; }
.trend-movers__trend--flat { color: var(--color-stone); }
.trend-movers__foot {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 16px;
  margin-top: auto;
}
.trend-movers__rank-block { display: flex; flex-direction: column; gap: 2px; }
.trend-movers__rank-label {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 500;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.trend-movers__rank-num {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  color: var(--color-ink);
  letter-spacing: -0.03em;
  line-height: 1.1;
}
.trend-movers__spark {
  width: 120px;
  height: 36px;
  flex-shrink: 0;
}
@media (max-width: 768px) {
  .trend-movers__inner { padding: 56px 20px; }
  .trend-movers__title { font-size: 24px; }
  .trend-movers__rank-num { font-size: 32px; }
}
</style>
