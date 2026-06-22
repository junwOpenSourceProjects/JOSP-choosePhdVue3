/**
 * utils/format.ts
 *
 * 通用格式化 helper
 * - formatRank: 排名数字 (null = '—', >500 = '500+')
 * - formatTrendArrow: 趋势变化 → 符号 + 颜色 (用于 trend column)
 * - formatYear: 排名年份 '2018' 标准化
 * - formatPercent: 百分比 (0.12 → '12%')
 * - formatSparklinePath: SVG sparkline path (m=moveto, l=lineto)
 *
 * 雪中送炭: 后端 DTO 日期可能是 array [y,m,d,h,mi,s] 而非 ISO 字符串
 * → formatDate 自动 Array.isArray 检测
 */

export function formatRank(rank: number | null | undefined): string {
  if (rank == null) return '—'
  if (rank > 500) return '500+'
  return String(rank)
}

export function formatTrendArrow(trend: number): { symbol: string; tone: 'up' | 'down' | 'flat' } {
  if (trend < -3) return { symbol: `↑ ${Math.abs(trend)}`, tone: 'up' }
  if (trend > 3) return { symbol: `↓ ${Math.abs(trend)}`, tone: 'down' }
  return { symbol: '— 0', tone: 'flat' }
}

export function formatTrendColor(tone: 'up' | 'down' | 'flat'): string {
  if (tone === 'up') return 'text-emerald-600'
  if (tone === 'down') return 'text-red-500'
  return 'text-muted'
}

export function formatYear(y: string | number | null | undefined): string {
  if (y == null) return '—'
  return String(y)
}

export function formatPercent(v: number | null | undefined, digits = 0): string {
  if (v == null) return '—'
  return `${(v * 100).toFixed(digits)}%`
}

/**
 * SVG sparkline path 生成
 * - 接受数字数组 (含 null/NaN 自动跳过)
 * - 返回 'M x y L x y L ...' 字符串
 * - 空数组返 ''
 */
export function formatSparklinePath(
  data: ReadonlyArray<number | null | undefined>,
  width = 100,
  height = 28
): string {
  const valid = data.filter((v): v is number => typeof v === 'number' && !Number.isNaN(v))
  if (valid.length === 0) return ''
  const maxV = Math.max(...valid, 10) * 1.1
  const xStep = valid.length > 1 ? width / (valid.length - 1) : 0
  let path = ''
  let validIdx = 0
  for (let i = 0; i < data.length; i++) {
    const v = data[i]
    if (typeof v !== 'number' || Number.isNaN(v)) continue
    const x = i * xStep
    const y = height - (v / maxV) * height
    path += `${validIdx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)} `
    validIdx++
  }
  return path.trim()
}

/**
 * 日期数组 / 字符串 / Date 统一转 Date 对象
 * - Spring Boot LocalDateTime Jackson 默认序列化为 [y,m,d,h,mi,s] 数组
 * - '2024-12-15T12:34:56' ISO 字符串
 * - new Date(...) 标准
 */
export function parseAnyDate(input: any): Date | null {
  if (input == null) return null
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input
  if (Array.isArray(input) && input.length >= 3) {
    const [y, m, d, h = 0, mi = 0, s = 0] = input
    const date = new Date(y, (m ?? 1) - 1, d ?? 1, h, mi, s)
    return Number.isNaN(date.getTime()) ? null : date
  }
  if (typeof input === 'string' || typeof input === 'number') {
    const date = new Date(input)
    return Number.isNaN(date.getTime()) ? null : date
  }
  return null
}

/**
 * 排名变化趋势计算
 * - 历年排名数组
 * - 返回: { tone, trend, last, max, min }
 */
export function computeTrend(data: ReadonlyArray<number | null | undefined>): {
  tone: 'up' | 'down' | 'flat'
  trend: number
  last: number
  max: number
  min: number
} {
  const valid = data.filter((v): v is number => typeof v === 'number' && v > 0)
  if (valid.length === 0) return { tone: 'flat', trend: 0, last: 0, max: 0, min: 0 }
  const last = valid[valid.length - 1]!
  const first = valid[0]!
  const trend = last - first
  const max = Math.max(...valid)
  const min = Math.min(...valid)
  let tone: 'up' | 'down' | 'flat' = 'flat'
  if (trend < -3) tone = 'up'
  else if (trend > 3) tone = 'down'
  return { tone, trend, last, max, min }
}

/**
 * 排名 tier (Top 3 / Top 10 / Top 50 / 其余) → 用于徽章颜色
 */
export function rankTier(rank: number | null | undefined): 'gold' | 'silver' | 'bronze' | 'normal' {
  if (rank == null) return 'normal'
  if (rank <= 3) return 'gold'
  if (rank <= 10) return 'silver'
  if (rank <= 50) return 'bronze'
  return 'normal'
}