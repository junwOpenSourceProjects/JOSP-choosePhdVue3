import request from '~/lib/request'
import type { Backup2ListParams, Backup2Record, EchartsDTO, Page, RankingStatusDTO, ShowResult, UniversityConsider } from '~/types'

/**
 * Query ranking status (我的选校清单)
 */
export const queryRankingStatus = () => request.get<RankingStatusDTO[]>('/status/queryRankingStatus')

/**
 * Insert or update ranking status of a single university
 * body: UniversityConsider (含 id, universityNameChinese, statusQs, statusQsCs, statusUsnews, statusUsnewsCs, statusTotal, consider)
 */
export const insertOrUpdate = (data: UniversityConsider) => request.post<ShowResult<unknown>>('/status/insertOrUpdate', data)

/**
 * Batch insert
 * body: string[] (大学中文名数组)
 */
export const insertBatch = (nameList: string[]) => request.post<ShowResult<unknown>>('/status/insertBatch', nameList)

/**
 * Get echarts drawer data for a single university
 * body: string (大学中文名)
 */
export const drawerData = (name: string) => request.post<EchartsDTO>('/status/drawerData', name)

/**
 * 4 维趋势 (qs/qs_cs/usnews/usnews_cs) - 4 条线
 */
export const trendAllVariants = (universityNameChinese: string) =>
  request.get<EchartsDTO>('/status/trendAllVariants', { params: { universityNameChinese } })

/**
 * 列出 echarts 表所有大学名 (供 4 维趋势图下拉)
 */
export const listEchartsUniversities = () => request.get<string[]>('/status/listEchartsUniversities')

/**
 * Initialize aggregated ranking tables and ECharts data from existing QS data
 * Requires admin login
 */
export const initFromQs = () => request.post<ShowResult<unknown>>('/init/fromQs')

/**
 * 列出 "备份 2" 7 张新表的 rankTable 名 (动态从后端拉)
 */
export const fetchBackup2Tables = () => request.get<ShowResult<string[]>>('/backup2/listTables')

/**
 * 通用分页查询 (按 rankTable 路由到 7 张新表之一)
 */
export const queryBackup2List = (params: Backup2ListParams = {}) =>
  request.get<ShowResult<Page<Backup2Record>>>('/backup2/list', { params })

/**
 * 列出某张表的所有 ranking_year (按年倒序, 供前端 filter)
 */
export const fetchBackup2Years = (rankTable: string) =>
  request.get<ShowResult<string[]>>('/backup2/listYears', { params: { rankTable } })
