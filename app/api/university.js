import request from '~/utils/request'

/**
 * Old simple QS paged query (legacy)
 */
export const queryQs = (params) => request.get('/query/qs', { params })

/**
 * Multi-dimension university rank query (the main query API)
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} [params.rankVariant='qs'] - 'qs' | 'usnews' | 'all'
 * @param {string} [params.universityTagsState]
 * @param {string} [params.universityTags]
 * @param {number} [params.currentRank]
 */
export const queryAllQs = (params) => request.get('/query/queryQs', { params })

/**
 * Aggregated university rank query with fuzzy name search
 * @param {Object} params
 * @param {number} params.page
 * @param {number} params.limit
 * @param {string} [params.universityNameChinese]
 * @param {string} [params.universityTagsState]
 * @param {string} [params.universityTags]
 * @param {number} [params.currentRank=100]
 */
export const queryAll = (params) => request.get('/query/queryAll', { params })

/**
 * Aggregated ECharts data (line chart series data for top N universities)
 * @param {Object} params
 * @param {string} [params.universityNameChinese]
 * @param {string} [params.universityTagsState]
 * @param {string} [params.universityTags]
 * @param {number} [params.currentRank=10]
 * @param {string} [params.rankVariant]
 */
export const queryAllEcharts = (params) => request.get('/query/queryAllEcharts', { params })

/**
 * Force-refresh the echarts aggregated data table
 */
export const updateEchartsData = () => request.get('/query/updateEchartsData')

/**
 * Part-echarts: filtered draw data (used by chart drawer)
 * @param {Object} params
 * @param {string} [params.universityNameChinese]
 * @param {string} [params.universityTagsState]
 * @param {string} [params.universityTags]
 * @param {string} [params.rankVariant='qs']
 */
export const queryPartEcharts = (params) => request.get('/query/queryPartEcharts', { params })
