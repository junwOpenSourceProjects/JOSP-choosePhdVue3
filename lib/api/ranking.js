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
 * Initialize aggregated ranking tables and ECharts data from existing QS data
 * Requires admin login
 */
export const initFromQs = () => request.post('/init/fromQs')
