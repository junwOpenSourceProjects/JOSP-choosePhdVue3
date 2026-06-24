import type { RankingEntryVo } from '~/types'

export interface RankSeries {
  name: string
  color?: string
  data: (number | null)[]
}

export function isRanked(row: RankingEntryVo | Record<string, any>): boolean {
  const r = row as RankingEntryVo
  return r.rankValue != null && r.rankValue > 0 && r.rankValue < 9999
}

export function rankValue(row: RankingEntryVo | Record<string, any>): number | null {
  const r = row as RankingEntryVo
  return isRanked(r) ? r.rankValue! : null
}

const PALETTE = ['#ff5530', '#ea5ec1', '#1456f0', '#a855f7', '#3daeff', '#f59e0b', '#10b981']

export function useRankingChart() {
  const colorAt = (idx: number) => PALETTE[idx % PALETTE.length]

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
