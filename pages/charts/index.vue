<script setup lang="ts">
import { queryAllEcharts } from '~/lib/api/university'
import { trendAllVariants, listEchartsUniversities } from '~/lib/api/ranking'

useHead({ title: '数据图表 · 选校系统' })

// ============ 状态 ============
const allData = ref<any>(null)        // 后端 queryAllEcharts 原始: { chatData: { series }, legendData }
const loading = ref(false)
const error = ref<string | null>(null)
const currentRank = ref<number>(50)   // Top 50

const rankItems = [
  { value: 20, label: 'Top 20' },
  { value: 50, label: 'Top 50' },
  { value: 100, label: 'Top 100' }
]

// ============ 数据加载 ============
async function loadAll() {
  loading.value = true
  error.value = null
  try {
    const data = await queryAllEcharts({ currentRank: currentRank.value }) as any
    allData.value = data
  } catch (e: any) {
    console.warn('[charts] loadAll failed', e?.message)
    error.value = '后端不可达, 显示 mock 数据'
    allData.value = generateMockAll(currentRank.value)
  } finally {
    loading.value = false
  }
}

function generateMockAll(rank: number) {
  const years = ['2018', '2019', '2020', '2021', '2022', '2023', '2024', '2025']
  return {
    chatData: {
      series: [
        { name: '麻省理工学院', data: [4, 1, 1, 1, 1, 1, 1, 1] },
        { name: '斯坦福大学',   data: [2, 2, 2, 2, 3, 3, 5, 5] },
        { name: '哈佛大学',     data: [3, 3, 3, 5, 5, 5, 4, 4] },
        { name: '剑桥大学',     data: [5, 6, 7, 7, 4, 2, 2, 2] },
        { name: '牛津大学',     data: [6, 5, 4, 4, 2, 4, 3, 3] }
      ].filter(s => Math.max(...s.data) <= rank)
    },
    legendData: years
  }
}

// ============ 数据派生 ============
const years = computed(() => allData.value?.legendData ?? [])
const series = computed(() => allData.value?.chatData?.series ?? [])

/** Ranking Board: 一行一校,排序按最新一年 (data 最后一位) 升序 */
const rankingBoard = computed(() => {
  return series.value
    .map((s: any) => {
      const data = s.data || []
      const last = data[data.length - 1] ?? 0
      const first = data[0] ?? last
      const max = data.length ? Math.max(...data) : last
      const min = data.length ? Math.min(...data.filter((v: any) => typeof v === 'number' && v > 0)) : last
      // 趋势: latest - earliest (负数 = 上升)
      const trend = last - first
      let tone: 'up' | 'down' | 'flat' = 'flat'
      if (trend < -3) tone = 'up'
      else if (trend > 3) tone = 'down'
      return {
        name: s.name,
        country: s.country,
        region: s.region,
        data,
        last,
        max,
        min,
        trend,
        tone
      }
    })
    .filter((r: any) => r.last > 0 && r.last <= currentRank.value)
    .sort((a: any, b: any) => a.last - b.last)
})

/** 地区分布: 用 rankingBoard (已按 currentRank 过滤) 计算, 不用全 series */
const regionDist = computed(() => {
  const buckets: Record<string, { count: number; totalRank: number; names: string[] }> = {}
  for (const r of rankingBoard.value) {
    // 优先用后端返的 country 字段 (从 university_tags 来), 后端没返时降级用启发式
    const country = (r.country && r.country.trim()) || guessCountry(r.name) || '未知'
    if (!buckets[country]) buckets[country] = { count: 0, totalRank: 0, names: [] }
    buckets[country].count += 1
    buckets[country].totalRank += r.last
    buckets[country].names.push(r.name)
  }
  return Object.entries(buckets)
    .map(([country, v]) => ({
      country,
      count: v.count,
      avgRank: v.count ? Math.round(v.totalRank / v.count) : 0,
      names: v.names
    }))
    .sort((a, b) => b.count - a.count)
})

/** 根据大学名称快速判断国家 (启发式, 跟 raw qs 排名文件用同一语义) */
function guessCountry(name: string): string {
  // 简化: 按常见关键词
  if (name.includes('中国') || name.includes('清华') || name.includes('北大') || name.includes('香港') || name.includes('台湾')) return '中国大陆/港台'
  if (name.includes('美') || name.includes('加州') || name.includes('纽约') || name.includes('麻省') || name.includes('德州')) return '美国'
  if (name.includes('英') || name.includes('伦敦') || name.includes('剑桥') || name.includes('牛津') || name.includes('帝国')) return '英国'
  if (name.includes('日本') || name.includes('东京') || name.includes('京都')) return '日本'
  if (name.includes('澳')) return '澳大利亚'
  if (name.includes('加坡')) return '新加坡'
  if (name.includes('瑞士') || name.includes('苏黎世') || name.includes('联邦')) return '瑞士'
  if (name.includes('加拿大')) return '加拿大'
  if (name.includes('德国') || name.includes('柏林') || name.includes('慕尼黑')) return '德国'
  if (name.includes('法国') || name.includes('巴黎')) return '法国'
  if (name.includes('韩')) return '韩国'
  return '其他'
}

/** 4 个 KPI */
const kpis = computed(() => {
  const n = rankingBoard.value.length
  const up = rankingBoard.value.filter((r: any) => r.tone === 'up').length
  const down = rankingBoard.value.filter((r: any) => r.tone === 'down').length
  const stable = n - up - down
  return [
    { label: '入选大学', value: n, sub: `Top ${currentRank.value}`, color: '#1456f0' },
    { label: '黑马 (上升)', value: up, sub: '同比首年 -3 以上', color: '#10b981' },
    { label: '下行', value: down, sub: '同比首年 +3 以上', color: '#ef4444' },
    { label: '稳定', value: stable, sub: '±3 内波动', color: '#8e8e93' }
  ]
})

// ============ 我的对比 (watchlist) ============
const watchlist = ref<string[]>([])
const MAX_WATCHLIST = 5

function toggleWatch(name: string) {
  const idx = watchlist.value.indexOf(name)
  if (idx >= 0) {
    watchlist.value.splice(idx, 1)
  } else {
    if (watchlist.value.length >= MAX_WATCHLIST) {
      // FIFO: 移除最早加入的
      watchlist.value.shift()
    }
    watchlist.value.push(name)
  }
}

function isWatching(name: string): boolean {
  return watchlist.value.includes(name)
}

const watchSeries = computed(() => {
  return watchlist.value
    .map(name => series.value.find((s: any) => s.name === name))
    .filter(Boolean)
})

const watchChart = computed(() => {
  return {
    chatData: { series: watchSeries.value },
    legendData: years.value
  }
})

function clearWatch() {
  watchlist.value = []
}

// ============ Trend helpers ============
function trendIcon(tone: string): string {
  if (tone === 'up') return 'i-lucide-trending-up'
  if (tone === 'down') return 'i-lucide-trending-down'
  return 'i-lucide-minus'
}

function trendColor(tone: string): string {
  if (tone === 'up') return 'text-emerald-600'
  if (tone === 'down') return 'text-red-500'
  return 'text-muted'
}

function trendLabel(tone: string, trend: number): string {
  if (tone === 'up') return `↑ ${Math.abs(trend)}`
  if (tone === 'down') return `↓ ${Math.abs(trend)}`
  return '— 0'
}

// mini sparkline SVG path
function sparklinePath(data: number[], width = 100, height = 28): string {
  if (!data.length) return ''
  const maxV = Math.max(...data, 10) * 1.1
  const minV = 0
  const xStep = data.length > 1 ? width / (data.length - 1) : 0
  return data
    .map((v, i) => {
      const x = i * xStep
      const y = height - ((v - minV) / (maxV - minV)) * height
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

onMounted(() => loadAll())
watch(currentRank, () => loadAll())
</script>

<template>
  <div>
    <UContainer class="py-10">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div class="flex items-center gap-2.5">
            <h1
              class="text-[40px] font-medium leading-[1.10] tracking-tight text-default sm:text-5xl"
              :style="{ fontFamily: 'var(--font-display)' }"
            >数据图表</h1>
            <span
              class="mt-3 size-2 shrink-0 rounded-full"
              :style="{ background: 'var(--color-brand-pink)' }"
              aria-hidden="true"
            />
          </div>
          <p class="mt-2 text-base text-muted">趋势 · 对比 · 洞察 · 让选校决策有数</p>
        </div>
        <UFieldGroup size="sm">
          <UButton
            v-for="r in rankItems"
            :key="r.value"
            :color="currentRank === r.value ? 'primary' : 'neutral'"
            :variant="currentRank === r.value ? 'solid' : 'outline'"
            :label="r.label"
            size="sm"
            @click="currentRank = r.value"
          />
        </UFieldGroup>
      </div>
    </UContainer>

    <UContainer v-if="error">
      <UAlert
        color="warning"
        variant="subtle"
        :title="error"
        icon="i-lucide-alert-circle"
      />
    </UContainer>

    <!-- KPI 4 卡 -->
    <UContainer class="pb-2">
      <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <UCard
          v-for="k in kpis"
          :key="k.label"
          :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-5' }"
        >
          <div class="text-[12px] font-medium text-muted">{{ k.label }}</div>
          <div
            class="mt-2 text-[36px] font-semibold leading-none tracking-tight"
            :style="{ color: k.color, fontFamily: 'var(--font-display)' }"
          >{{ k.value }}</div>
          <div class="mt-2 text-[12px] text-subtle">{{ k.sub }}</div>
        </UCard>
      </div>
    </UContainer>

    <!-- 我的对比 (watchlist) -->
    <UContainer class="py-4">
      <UCard
        :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-6' }"
      >
        <div class="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2
              class="text-[22px] font-semibold leading-tight text-default"
              :style="{ fontFamily: 'var(--font-display)' }"
            >我的对比</h2>
            <p class="mt-1 text-[13px] text-muted">
              下方排名榜点 <span class="font-mono text-default">+ 加入对比</span> 添加, 最多 {{ MAX_WATCHLIST }} 所大学
            </p>
          </div>
          <div class="flex items-center gap-2">
            <UBadge
              v-if="watchlist.length"
              color="primary"
              variant="subtle"
              :label="`${watchlist.length} / ${MAX_WATCHLIST}`"
            />
            <UButton
              v-if="watchlist.length"
              icon="i-lucide-trash-2"
              color="neutral"
              variant="ghost"
              size="sm"
              label="清空"
              @click="clearWatch"
            />
          </div>
        </div>

        <ClientOnly>
          <div v-if="watchlist.length === 0" class="rounded-2xl border-2 border-dashed border-default bg-[var(--color-surface-1)] p-10 text-center">
            <UIcon name="i-lucide-eye-off" class="mx-auto size-10 text-muted" />
            <div class="mt-3 text-sm text-default">还没有添加大学</div>
            <div class="mt-1 text-xs text-muted">从下方排名榜点 + 加入对比, 这里只画你挑的大学, 不再 137 条线堆一起</div>
          </div>

          <div v-else class="rounded-xl bg-[var(--color-surface-1)] p-4">
            <ChartSvgChart :chart="watchChart" :height="320" />
            <div class="mt-3 flex flex-wrap gap-2">
              <UButton
                v-for="name in watchlist"
                :key="name"
                :label="name"
                icon="i-lucide-x"
                color="neutral"
                variant="outline"
                size="xs"
                @click="toggleWatch(name)"
              />
            </div>
          </div>
        </ClientOnly>
      </UCard>
    </UContainer>

    <!-- 排名榜 (核心) -->
    <UContainer class="py-4">
      <UCard
        :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm overflow-hidden', body: 'p-0' }"
      >
        <div class="flex items-center justify-between border-b border-default p-5">
          <div>
            <h2
              class="text-[22px] font-semibold leading-tight text-default"
              :style="{ fontFamily: 'var(--font-display)' }"
            >Top {{ currentRank }} 排名榜</h2>
            <p class="mt-1 text-[13px] text-muted">按最新年份排名升序 · 历年曲线 = sparkline · 趋势 = 同比首年变化</p>
          </div>
        </div>
        <ClientOnly>
          <UTable
            :data="rankingBoard"
            :loading="loading"
            :columns="[
            { id: 'rank', header: '排名', meta: { class: { th: 'w-[80px]', td: 'w-[80px] font-[var(--font-data)]' } } },
            { id: 'name', header: '大学' },
            { id: 'sparkline', header: '历年曲线', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } },
            { id: 'minmax', header: '区间 (低/高)', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } },
            { id: 'trend', header: '趋势', meta: { class: { th: 'w-[120px]', td: 'w-[120px]' } } },
            { id: 'action', header: '', meta: { class: { th: 'w-[140px]', td: 'w-[140px]' } } }
          ]"
          :ui="{ th: 'text-[12px] font-medium text-muted', td: 'py-3 text-sm'}"
        >
          <template #rank-cell="{ row }">
            <span
              class="text-[16px] font-semibold"
              :class="row.original.last <= 10 ? 'text-[var(--color-brand-900)]' : 'text-default'"
            >{{ row.original.last }}</span>
          </template>
          <template #name-cell="{ row }">
            <span class="text-default" :style="{ fontFamily: 'var(--font-display)' }">{{ row.original.name }}</span>
          </template>
          <template #sparkline-cell="{ row }">
            <svg :width="100" :height="28" class="overflow-visible">
              <path
                :d="sparklinePath(row.original.data, 100, 28)"
                fill="none"
                stroke="#1456f0"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </template>
          <template #minmax-cell="{ row }">
            <span class="font-mono text-[13px] text-muted">
              <span class="text-emerald-600">{{ row.original.min }}</span>
              <span class="mx-1 text-subtle">/</span>
              <span class="text-red-500">{{ row.original.max }}</span>
            </span>
          </template>
          <template #trend-cell="{ row }">
            <div class="inline-flex items-center gap-1.5" :class="trendColor(row.original.tone)">
              <UIcon :name="trendIcon(row.original.tone)" class="size-4" />
              <span class="text-[13px] font-medium">{{ trendLabel(row.original.tone, row.original.trend) }}</span>
            </div>
          </template>
          <template #action-cell="{ row }">
            <UButton
              :icon="isWatching(row.original.name) ? 'i-lucide-check' : 'i-lucide-plus'"
              :color="isWatching(row.original.name) ? 'primary' : 'neutral'"
              :variant="isWatching(row.original.name) ? 'solid' : 'outline'"
              size="xs"
              :label="isWatching(row.original.name) ? '已加入' : '加入对比'"
              :disabled="!isWatching(row.original.name) && watchlist.length >= MAX_WATCHLIST"
              @click="toggleWatch(row.original.name)"
            />
          </template>
          <template #empty>
            <UEmpty
              icon="i-lucide-bar-chart-3"
              title="暂无排名数据"
              description="后端 /query/queryAllEcharts 返回为空"
            />
          </template>
        </UTable>
        </ClientOnly>
      </UCard>
    </UContainer>

    <!-- 地区分布 -->
    <UContainer class="py-4">
      <UCard
        :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-6' }"
      >
        <div class="mb-5">
          <h2
            class="text-[22px] font-semibold leading-tight text-default"
            :style="{ fontFamily: 'var(--font-display)' }"
          >地区分布</h2>
          <p class="mt-1 text-[13px] text-muted">Top {{ currentRank }} 在主要国家/地区的分布 · 辅助宏观选校方向</p>
        </div>
        <div v-if="regionDist.length === 0" class="text-sm text-muted">暂无数据</div>
        <div v-else class="space-y-3">
          <div
            v-for="r in regionDist"
            :key="r.country"
            class="flex items-center gap-3"
          >
            <div class="w-28 shrink-0 text-sm text-default">{{ r.country }}</div>
            <div class="relative h-7 flex-1 overflow-hidden rounded-full bg-[var(--color-surface-2)]">
              <div
                class="absolute inset-y-0 left-0 rounded-full bg-[var(--color-brand-700)]"
                :style="{ width: (r.count / regionDist[0].count * 100) + '%' }"
              />
              <div class="absolute inset-0 flex items-center justify-end pr-3 text-[12px] font-medium text-white mix-blend-difference">
                {{ r.count }} 所
              </div>
            </div>
            <div class="w-20 shrink-0 text-right text-[12px] text-muted">
              均 {{ r.avgRank }}
            </div>
          </div>
        </div>
        <UAlert
          color="info"
          variant="subtle"
          title="地区推断: 基于大学名称的启发式识别, 实际以 DB university_tags 字段为准"
          icon="i-lucide-info"
          class="mt-4"
        />
      </UCard>
    </UContainer>

    <!-- 洞察 -->
    <UContainer class="py-8">
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="i in [
            { icon: 'i-lucide-eye', title: '先挑再画', desc: '不再 137 条线堆一起 · 加 5 所进对比看清晰曲线', color: '#1456f0' },
            { icon: 'i-lucide-trending-up', title: '找黑马', desc: '「趋势 = ↓」= 排名持续上升 = 近年表现亮眼', color: '#10b981' },
            { icon: 'i-lucide-shield-alert', title: '避陷阱', desc: '「趋势 = ↑」= 排名持续下滑 = 警惕「过誉」老牌名校', color: '#ef4444' },
            { icon: 'i-lucide-globe', title: '看分布', desc: 'Top 50 里 50% 美国 · 选校考虑地区多元化降低风险', color: '#9333ea' }
          ]"
          :key="i.title"
          class="group flex flex-col gap-2.5 rounded-2xl border border-default bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div
            class="inline-flex size-9 items-center justify-center rounded-xl"
            :style="{ background: i.color + '15', color: i.color }"
          >
            <UIcon :name="i.icon" class="size-5" />
          </div>
          <div class="text-base font-semibold text-default" :style="{ fontFamily: 'var(--font-display)' }">{{ i.title }}</div>
          <div class="text-[13px] leading-relaxed text-muted">{{ i.desc }}</div>
        </div>
      </div>
    </UContainer>
  </div>
</template>
