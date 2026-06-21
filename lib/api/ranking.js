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

/**
 * 列出 "备份 2" 7 张新表的 rankTable 名 (动态从后端拉)
 */
export const fetchBackup2Tables = () => request.get('/backup2/listTables')

/**
 * 通用分页查询 (按 rankTable 路由到 7 张新表之一)
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} params.rankTable - arwu_subject / edurank_region / declining_trend / mosiur_world / rur_world / usnews_subject / qs_sustainability
 * @param {string} [params.universityNameChinese]
 * @param {string} [params.universityTags]
 * @param {string} [params.universityTagsState]
 * @param {string} [params.rankingCategory]
 * @param {string} [params.rankingYear]
 * @param {number} [params.currentRankLimit]
 */
export const queryBackup2List = (params) => request.get('/backup2/list', { params })
