import request from '~/lib/request'

/**
 * Query ranking status (我的选校清单)
 */
export const queryRankingStatus = () => request.get('/status/queryRankingStatus')

/**
 * Insert or update ranking status of a single university
 * body: UniversityConsider (含 id, universityNameChinese, statusQs, statusQsCs, statusUsnews, statusUsnewsCs, statusTotal, consider)
 */
export const insertOrUpdate = (data) => request.post('/status/insertOrUpdate', data)

/**
 * Batch insert
 * body: string[] (大学中文名数组)
 */
export const insertBatch = (nameList) => request.post('/status/insertBatch', nameList)

/**
 * Get echarts drawer data for a single university
 * body: string (大学中文名)
 */
export const drawerData = (name) => request.post('/status/drawerData', name)

/**
 * 4 维趋势 (qs/qs_cs/usnews/usnews_cs) - 4 条线
 */
export const trendAllVariants = (universityNameChinese) => request.get('/status/trendAllVariants', { params: { universityNameChinese } })

/**
 * 列出 echarts 表所有大学名 (供 4 维趋势图下拉)
 */
export const listEchartsUniversities = () => request.get('/status/listEchartsUniversities')

/**
 * Initialize aggregated ranking tables and ECharts data from existing QS data
 * Requires admin login
 */
export const initFromQs = () => request.post('/init/fromQs')
