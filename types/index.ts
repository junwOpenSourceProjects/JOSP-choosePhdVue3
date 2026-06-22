// ============================================
// choosePhd · TypeScript types (镜像后端 DTO/Entity)
// 后端不动,前端按 Java field 名一一对应
// ============================================

// ============================================
// T-01 新增:UI-only 类型(架构文档 C.8 节)
// ============================================

/** 异步加载 5 态 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error' | 'empty'

/** 品牌色调(4 色产品身份卡 / rank 维度映射) */
export type BrandTone = 'coral' | 'magenta' | 'blue' | 'purple' | 'neutral'

/** 状态色(弱/中/强) */
export type StatusTone = 'weak' | 'medium' | 'strong' | 'neutral'

/** 全局 toast 消息(供 useToast + AppToast 共享) */
export interface ToastMessage {
  id: string
  tone: 'success' | 'error' | 'info' | 'warning'
  text: string
  /** ms,默认 4000 */
  duration?: number
}

/** 首页 4 张产品身份卡(对应 ProductMatrixCard 组件 props) */
export interface ProductMatrixItem {
  tone: BrandTone
  eyebrow: string
  title: string
  subtitle: string
  meta: string
  to: string
  visual: 'sparkline' | 'globe' | 'mini-table' | 'pills'
}

/** 图表页 KPI 卡(对应 KPICardGroup 组件 props) */
export interface KPIData {
  label: string
  value: string | number
  caption?: string
  tone?: BrandTone
}

/** 学校库筛选(对应 FilterToolbar 组件 v-model) */
export interface UniversityFilter {
  rankTable: 'qs' | 'usnews' | 'arwu_subject' | 'edurank' | 'mosiur' | 'rur'
  region?: string
  country?: string
  topN?: number
  year?: number
  sort?: 'rank' | 'name' | 'updatedAt'
  search?: string
}

/** 4 维排名(详情页 / 趋势图 / 矩阵 共用) */
export type RankDimension = 'qs' | 'qsCs' | 'usnews' | 'usnewsCs'

/** 固定顺序,所有 sparkline / 矩阵 / school-hero 共用此顺序 */
export const RANK_DIMENSION_ORDER: readonly RankDimension[] = ['qs', 'qsCs', 'usnews', 'usnewsCs']


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

export type ConsiderType = 0 | 1

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

/** 7 张新表 rankTable 值 */
export type Backup2Table =
  | 'arwu_subject'
  | 'usnews_subject'
  | 'qs_sustainability'
  | 'declining_trend'
  | 'edurank_region'
  | 'mosiur_world'
  | 'rur_world'

/** backup2 单条记录 */
export interface Backup2Record {
  id?: number
  universityNameChinese: string
  universityNameEnglish?: string | null
  universityTags?: string | null
  universityTagsState?: string | null
  rankingCategory?: string | null
  rankingYear?: string | null
  currentRankInteger?: number | null
  currentRankRaw?: string | null
}

/** 通用分页查询入参 */
export interface Backup2ListParams {
  page?: number
  limit?: number
  rankTable?: string
  universityNameChinese?: string
  universityTags?: string
  universityTagsState?: string
  rankingCategory?: string
  rankingYear?: string
  currentRankLimit?: number
}

/** 历史导入记录 */
export interface ImportHistoryRecord {
  id?: number
  rankVariant?: string
  rankingYear?: string
  fileName?: string
  recordCount?: number
  importedAt?: string
}

/** 导入总量统计 */
export interface ImportStats {
  totalRecords?: number
  totalFiles?: number
  lastImportedAt?: string | null
}

/** 趋势图 4 维数据 */
export interface TrendAllVariantsDTO {
  qs?: Record<string, number | null>
  qsCs?: Record<string, number | null>
  usnews?: Record<string, number | null>
  usnewsCs?: Record<string, number | null>
}

/** 登录/用户信息 */
export interface LoginForm {
  username: string
  password: string
}

/** 后端 UserInfo */
export interface UserInfo {
  name: string
  avatar: string
  roles: string[]
  introduction: string
}
