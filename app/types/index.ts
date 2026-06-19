// ============================================
// choosePhd · TypeScript types (镜像后端 DTO/Entity)
// 后端不动,前端按 Java field 名一一对应
// ============================================

/** 后端 ShowResult<T> 包装 */
export interface ShowResult<T> {
  code: number
  msg: string
  data: T
}

/** 后端 Page<T> 包装 (MyBatis-Plus) */
export interface Page<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

/** university_rankings_all 实体 - 汇总排名 */
export interface UniversityRankingsAll {
  id: number
  universityNameChinese: string
  universityNameEnglish: string | null
  universityTags: string | null          // 国家
  universityTagsState: string | null     // 洲
  rankingYear: string | number | null
  currentRankIntegerQs: number | null
  currentRankIntegerQsCs: number | null
  currentRankIntegerUsnews: number | null
  currentRankIntegerUsnewsCs: number | null
}

/** UniversityAllDTO - 跨榜查询结果 (queryQs 返回) */
export interface UniversityAllDTO {
  universityNameChinese: string
  universityTags: string | null
  universityTagsState: string | null
  rankingYear: string | null
  currentQsAllRank: number | null
  currentQsComputerRank: number | null
  currentUsnewsAllRank: number | null
  currentUsnewsComputerRank: number | null
}

/** university_rankings_echarts 实体 - 趋势数据 */
export interface UniversityRankingsEcharts {
  id: number
  universityNameChinese: string
  universityTags: string | null
  universityTagsState: string | null
  rankingQs: string | null          // 序列化的历年排名 JSON
  rankingQsCs: string | null
  rankingUsnews: string | null
  rankingUsnewsCs: string | null
}

/** RankingStatusDTO - 选校清单 (extends UniversityRankingsEcharts) */
export interface RankingStatusDTO extends UniversityRankingsEcharts {
  statusQs: number | null          // 0=弱 1=中 2=强
  statusQsCs: number | null
  statusUsnews: number | null
  statusUsnewsCs: number | null
  statusTotal: number | null
  consider: number | null           // 0=不考虑 1=考虑
}

/** UniversityConsider - insertOrUpdate 入参 */
export interface UniversityConsider {
  id?: number
  universityNameChinese: string
  statusQs?: number | null
  statusQsCs?: number | null
  statusUsnews?: number | null
  statusUsnewsCs?: number | null
  statusTotal?: number | null
  consider?: number | null
}

/** ChartData - 折线图渲染 */
export interface ChartData {
  series: ChartSeries[]
}

export interface ChartSeries {
  name: string
  type?: string
  xAxisIndex?: number
  smooth?: boolean
  emphasis?: { focus?: string }
  data: (number | null)[]
}

/** EchartsDTO - 抽屉详情 + 整体趋势 */
export interface EchartsDTO {
  chatData: ChartData
  legendData: string[]
}

/** LoginUser 登录入参/返参 */
export interface LoginUser {
  id?: number
  username: string
  password: string
  token?: string
}

export interface AccountRole {
  roles: string[]
  introduction: string
  avatar: string
  name: string
}

// ============================================
// 前端业务模型
// ============================================

/** 排名变体 */
export type RankVariant = 'qs' | 'usnews' | 'all'

/** 排名强弱 0=弱 1=中 2=强 */
export type StatusLevel = 0 | 1 | 2

/** 状态文字映射 */
export const STATUS_LEVEL_MAP: Record<StatusLevel, { label: string; cls: string }> = {
  0: { label: '弱', cls: 'status-chip--weak' },
  1: { label: '中', cls: 'status-chip--medium' },
  2: { label: '强', cls: 'status-chip--strong' }
}

/** 考虑与否 0=不考虑 1=考虑 */
export const CONSIDER_MAP: Record<number, { label: string; cls: string }> = {
  0: { label: '不考虑', cls: 'status-chip--skip' },
  1: { label: '考虑', cls: 'status-chip--consider' }
}

/** 排名变体显示名 */
export const RANK_VARIANT_MAP: Record<RankVariant, string> = {
  qs: 'QS 世界大学排名',
  usnews: 'US News 世界大学排名',
  all: '汇总'
}

/** 排名变体短名 (筛选器用) */
export const RANK_VARIANT_SHORT_MAP: Record<RankVariant, string> = {
  qs: 'QS',
  usnews: 'US News',
  all: '汇总'
}
