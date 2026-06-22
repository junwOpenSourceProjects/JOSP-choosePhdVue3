/**
 * 地区颜色与样式共享工具
 *
 * 在 SchoolHero / universities / choices 等多处复用，避免重复定义。
 */

export interface RegionMeta {
  bg: string
  fg: string
  dot: string
}

export const REGION_COLORS: Record<string, RegionMeta> = {
  '亚洲': { bg: '#fce7f3', fg: '#be185d', dot: '#ea5ec1' },
  '欧洲': { bg: '#dbeafe', fg: '#1d4ed8', dot: '#1456f0' },
  '北美洲': { bg: '#fef3c7', fg: '#b45309', dot: '#f59e0b' },
  '南美洲': { bg: '#dcfce7', fg: '#15803d', dot: '#22c55e' },
  '大洋洲': { bg: '#ede9fe', fg: '#7c3aed', dot: '#a855f7' },
  '非洲': { bg: '#fee2e2', fg: '#b91c1c', dot: '#ef4444' },
}

export function regionMeta(region?: string | null): RegionMeta {
  if (!region) return { bg: 'var(--color-surface-soft)', fg: 'var(--color-slate)', dot: '#8e8e93' }
  return REGION_COLORS[region] ?? { bg: 'var(--color-surface-soft)', fg: 'var(--color-slate)', dot: '#8e8e93' }
}

export function regionStyle(region?: string | null) {
  const meta = regionMeta(region)
  return { background: meta.bg, color: meta.fg }
}

export function regionDot(region?: string | null): string {
  return regionMeta(region).dot
}
