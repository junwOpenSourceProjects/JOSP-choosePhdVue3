/**
 * utils/rankingColor.ts
 *
 * 4 维排名 → 品牌色 集中映射。
 * 所有 sparkline / 矩阵 / school-hero / 详情页 rank 卡 必须从这里取色,
 * 不允许散落写 `qs → coral` 的判断。
 *
 * 固定映射(架构文档 F.6 / PRD 2.3):
 *   qs      → coral
 *   qsCs    → magenta
 *   usnews  → blue
 *   usnewsCs → purple
 */

import type { RankDimension, BrandTone } from '~/types'

/** 4 维排名 → 品牌色 映射表(只读) */
export const RANK_COLOR: Record<RankDimension, BrandTone> = {
  qs: 'coral',
  qsCs: 'magenta',
  usnews: 'blue',
  usnewsCs: 'purple',
}

/**
 * 取 4 维排名对应的 BrandTone
 */
export function rankDimensionColor(dim: RankDimension): BrandTone {
  return RANK_COLOR[dim]
}

/**
 * 取对应的 text utility class(供 <span :class="rankTextClass('qs')"> 使用)
 */
export function rankTextClass(dim: RankDimension): string {
  return `text-brand-${RANK_COLOR[dim]}`
}

/**
 * 取对应的 bg utility class(供 <div :class="rankBgClass('qs')"> 使用)
 */
export function rankBgClass(dim: RankDimension): string {
  return `bg-brand-${RANK_COLOR[dim]}`
}
