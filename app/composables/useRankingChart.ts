import type { RankingEntryVo } from '~/types'

/** 一条折线/柱状数据序列的入参结构 — 多院校多榜单对比图通用。 */
export interface RankSeries {
  name: string
  color?: string
  /** null 表示该年份该院校该榜单无数据 (排名 9999 / 未参评)。 */
  data: (number | null)[]
}

/**
 * 判断一条 ranking 记录是否有效 (有排名)。
 *
 * <p>rankValue 9999 在数据库里代表"未参评/不适用"，< 1 也无意义，
 * 所以这里把这两个边界都视为无效。
 */
export function isRanked(row: RankingEntryVo | Record<string, any>): boolean {
  const r = row as RankingEntryVo
  return r.rankValue != null && r.rankValue > 0 && r.rankValue < 9999
}

/**
 * 取一条 ranking 记录的 rankValue (数值)，无效时返 null。
 *
 * @param row RankingEntryVo 或任意含 rankValue 字段的对象
 * @returns rankValue (1-9998 范围内) 或 null
 */
export function rankValue(row: RankingEntryVo | Record<string, any>): number | null {
  const r = row as RankingEntryVo
  return isRanked(r) ? r.rankValue! : null
}

/** 趋势图/柱状图统一配色 — 7 色循环 (跟 DESIGN.md 品牌色 + 辅助色对齐)。 */
const PALETTE = ['#ff5530', '#ea5ec1', '#1456f0', '#a855f7', '#3daeff', '#f59e0b', '#10b981']

/**
 * 暴露给组件的 ECharts 排名趋势图 helper。
 *
 * <p>Vue SFC 里通过 `const { isRanked, buildTrendOption } = useRankingChart()` 取函数，
 * 把 universities/[urlId].vue / compare.vue / charts/index.vue 等页面统一接到同一份图表配置。
 */
export function useRankingChart() {
  /** 按索引取色 (越界循环)。 */
  const colorAt = (idx: number) => PALETTE[idx % PALETTE.length]

  /**
   * 构造排名趋势折线图 ECharts option (多年份 × 多院校对比)。
   *
   * <p>Y 轴反序 (rank #1 在顶) + min=1 + 自动 yMax (≥20 且 ≥最大排名×1.1 向上取整)。
   *
   * @param years  X 轴年份数组 (升序)
   * @param series 多院校多榜单的 series 数组 — 每条 series.name 显示在 legend 和 tooltip
   * @returns 直接喂给 vue-echarts / LazyChartVChart 的 option 对象
   */
  const buildTrendOption = (years: number[], series: RankSeries[]) => {
    const validRanks = series.flatMap((s) => s.data.filter((v): v is number => v != null))
    const maxRank = validRanks.length ? Math.max(...validRanks) : 100
    const yMax = Math.max(20, Math.ceil(maxRank * 1.1))

    return {
      tooltip: {
        trigger: 'axis',
        formatter: (params: any[]) => {
          const year = params[0]?.axisValue
          const lines = params
            .filter((p) => p.value != null)
            .map((p) => `${p.marker} ${p.seriesName}: #${p.value}`)
          return [`${year}年`, ...lines].join('<br/>')
        }
      },
      legend: {
        bottom: 0,
        type: 'scroll' as const,
        textStyle: { color: '#5f5f5f' }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      },
      xAxis: {
        type: 'category' as const,
        data: years.map(String),
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#5f5f5f' }
      },
      yAxis: {
        type: 'value' as const,
        inverse: true,
        min: 1,
        max: yMax,
        name: '排名',
        nameTextStyle: { color: '#5f5f5f' },
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f2f3f5' } },
        axisLabel: { color: '#5f5f5f' }
      },
      series: series.map((s) => ({
        name: s.name,
        type: 'line' as const,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        connectNulls: false,
        data: s.data,
        lineStyle: { width: 2, color: s.color },
        itemStyle: { color: s.color },
        emphasis: { focus: 'series' as const }
      }))
    }
  }

  /**
   * 构造 Top-N 排名水平柱状图 ECharts option (单榜单快照)。
   *
   * <p>X 轴反序 (rank #1 在左)，bar 内嵌左侧 "#N" 文本标签 (白色)。
   *
   * @param names 院校名数组 (按 rank 升序)
   * @param ranks 对应排名数组 (与 names 等长, 升序)
   * @returns 直接喂给 vue-echarts / LazyChartVChart 的 option 对象
   */
  const buildTopBarOption = (names: string[], ranks: number[]) => {
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' as const },
        formatter: (params: any[]) => {
          const p = params[0]
          return `${p.name}<br/>排名: #${p.value}`
        }
      },
      grid: {
        left: '3%',
        right: '8%',
        bottom: '3%',
        top: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value' as const,
        inverse: true,
        min: 1,
        max: Math.max(20, Math.ceil(Math.max(...ranks) * 1.1)),
        axisLine: { show: false },
        splitLine: { lineStyle: { color: '#f2f3f5' } },
        axisLabel: { color: '#5f5f5f' }
      },
      yAxis: {
        type: 'category' as const,
        data: names.slice().reverse(),
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisLabel: { color: '#0a0a0a', fontWeight: 500 }
      },
      series: [
        {
          type: 'bar' as const,
          data: ranks.slice().reverse(),
          itemStyle: { borderRadius: [0, 6, 6, 0], color: '#1456f0' },
          label: { show: true, position: 'insideLeft' as const, formatter: '#{c}', color: '#fff' }
        }
      ]
    }
  }

  return { isRanked, rankValue, colorAt, buildTrendOption, buildTopBarOption }
}
