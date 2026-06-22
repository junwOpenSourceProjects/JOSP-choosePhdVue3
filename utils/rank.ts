/**
 * 排名等级共享工具
 *
 * 用于 RankBadge 及各页面的自定义 rank 样式。
 */

export type RankTier = 'gold' | 'silver' | 'bronze' | 'normal' | 'none'

export function rankTier(rank: number | null | undefined): RankTier {
  if (rank == null) return 'none'
  if (rank <= 3) return 'gold'
  if (rank <= 10) return 'silver'
  if (rank <= 50) return 'bronze'
  return 'normal'
}

export function rankTierClass(
  rank: number | null | undefined,
  prefix = 'rank-badge'
): string {
  return `${prefix}--${rankTier(rank)}`
}
