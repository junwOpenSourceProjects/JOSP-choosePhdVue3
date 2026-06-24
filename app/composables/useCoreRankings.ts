import type { RankingEntryVo } from '~/types'

/**
 * 核心榜单 source ID：世界大学综合排名 + USNews 美国国内大学排名
 * 4  QS World Universities Rankings
 * 11 USNews National University Rankings
 * 16 USNews World Universities Rankings
 * 19 THE World Universities Rankings
 * 46 ARWU World Universities Rankings
 * 54 CWUR World Universities Rankings
 */
export const CORE_RANKING_SOURCE_IDS = new Set([4, 11, 16, 19, 46, 54])

export function isCoreRanking(entry: RankingEntryVo | Record<string, any>): boolean {
  const e = entry as RankingEntryVo
  return e.sourceId != null && CORE_RANKING_SOURCE_IDS.has(e.sourceId)
}

export function useCoreRankings() {
  return { CORE_RANKING_SOURCE_IDS, isCoreRanking }
}
