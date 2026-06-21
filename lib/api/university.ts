import request from '~/lib/request'
import type { ChartData, EchartsDTO, Page, ShowResult, UniversityAllDTO, UniversityRankingsAll, UniversityRankingsEcharts } from '~/types'

export interface QueryQsParams {
  page?: number
  limit?: number
  rankVariant?: string
  universityTagsState?: string
  universityTags?: string
  currentRank?: number
  universityNameChinese?: string
}

export interface QueryAllParams {
  page?: number
  limit?: number
  universityNameChinese?: string
  universityTagsState?: string
  universityTags?: string
  currentRank?: number
}

export interface QueryEchartsParams {
  universityNameChinese?: string
  universityTagsState?: string
  universityTags?: string
  currentRank?: number
  rankVariant?: string
}

export interface QueryPartEchartsParams {
  universityNameChinese?: string
  universityTagsState?: string
  universityTags?: string
  rankVariant?: string
}

/**
 * Old simple QS paged query (legacy)
 */
export const queryQs = (params: QueryQsParams = {}) =>
  request.get<ShowResult<Page<UniversityRankingsAll>>>('/query/qs', { params })

/**
 * Multi-dimension university rank query (the main query API)
 */
export const queryAllQs = (params: QueryQsParams = {}) =>
  request.get<Page<UniversityAllDTO>>('/query/queryQs', { params })

/**
 * Aggregated university rank query with fuzzy name search
 */
export const queryAll = (params: QueryAllParams = {}) =>
  request.get<Page<UniversityAllDTO>>('/query/queryAll', { params })

/**
 * Aggregated ECharts data (line chart series data for top N universities)
 */
export const queryAllEcharts = (params: QueryEchartsParams = {}) =>
  request.get<EchartsDTO>('/query/queryAllEcharts', { params })

/**
 * Force-refresh the echarts aggregated data table
 */
export const updateEchartsData = () => request.get<ChartData>('/query/updateEchartsData')

/**
 * Part-echarts: filtered draw data (used by chart drawer)
 */
export const queryPartEcharts = (params: QueryPartEchartsParams = {}) =>
  request.get<EchartsDTO>('/query/queryPartEcharts', { params })
