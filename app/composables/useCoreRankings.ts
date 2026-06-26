import type { RankingEntryVo } from '~/types'

/**
 * 核心榜单 source ID 集合 — 用于"核心榜单"过滤。
 *
 * <p>包含 6 个世界/国家综合排名，覆盖申请院校时最常参考的 4-5 个榜单。
 * 学科榜 (QS Subjects / ARWU Subjects / USNews Subjects / THE Subjects / Edurank)
 * **不在此集合** —— 它们是按学科细分的排名，不适合做"院校综合实力"对比。
 *
 * <ul>
 *   <li>4 — QS World Universities Rankings</li>
 *   <li>11 — USNews National University Rankings (美国国内)</li>
 *   <li>16 — USNews World Universities Rankings</li>
 *   <li>19 — THE World Universities Rankings</li>
 *   <li>46 — ARWU World Universities Rankings</li>
 *   <li>54 — CWUR World Universities Rankings</li>
 *   <li>268 — CSRankings 综合 (计算机科学全球排名)</li>
 *   <li>269 — CSRankings AI</li>
 *   <li>270 — CSRankings Systems</li>
 *   <li>271 — CSRankings Theory</li>
 *   <li>272 — CSRankings Interdisciplinary</li>
 * </ul>
 */
export const CORE_RANKING_SOURCE_IDS = new Set([4, 11, 16, 19, 46, 54, 268, 269, 270, 271, 272])

/**
 * 判断一条 ranking 记录是否属于核心榜单。
 *
 * @param entry RankingEntryVo 或任意含 sourceId 字段的对象
 * @returns true 当 entry.sourceId 在 CORE_RANKING_SOURCE_IDS 内
 */
export function isCoreRanking(entry: RankingEntryVo | Record<string, any>): boolean {
  const e = entry as RankingEntryVo
  return e.sourceId != null && CORE_RANKING_SOURCE_IDS.has(e.sourceId)
}

/**
 * 暴露给组件的核心榜单判断 hook。
 *
 * <p>Vue SFC 里通过 `const { isCoreRanking } = useCoreRankings()` 取函数引用,
 * 模板里直接 `v-if="isCoreRanking(row)"` 过滤非核心榜单。
 */
export function useCoreRankings() {
  return { CORE_RANKING_SOURCE_IDS, isCoreRanking }
}
