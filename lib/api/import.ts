import request from '~/lib/request'
import type { ImportHistoryRecord, ImportStats, Page, ShowResult } from '~/types'

export interface ListHistoryParams {
  page?: number
  pageSize?: number
  rankVariant?: string
}

/**
 * 上传排名 txt 文件并导入数据库
 * @param files - 文件数组
 * @returns 导入记录数
 */
export const uploadRankings = (files: File[]) => {
  const form = new FormData()
  for (const f of files) form.append('files', f)
  return request.post<ShowResult<number>>('/import/rankings', form, { headers: {} })
}

/**
 * 一键扫描本地工作目录下 qs 排名/ 文件夹
 */
export const scanLocal = () => request.post<ShowResult<unknown>>('/import/rankings/scanLocal', null)

/**
 * 扫描任意绝对路径
 */
export const scanPath = (path: string) => request.post<ShowResult<unknown>>('/import/rankings/scanPath', { path })

/**
 * 预览文件前 5 行 (不入库)
 * @param file - 上传文件
 */
export const previewFile = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return request.post<ShowResult<string[]>>('/import/rankings/preview', form, { headers: {} })
}

/**
 * 历史导入记录分页
 */
export const listHistory = (params: ListHistoryParams = {}) => {
  const q = new URLSearchParams()
  q.set('page', String(params.page ?? 1))
  q.set('pageSize', String(params.pageSize ?? 20))
  if (params.rankVariant) q.set('rankVariant', params.rankVariant)
  return request.get<ShowResult<Page<ImportHistoryRecord>>>(`/import/rankings/history?${q.toString()}`)
}

/**
 * 导入总量统计
 */
export const stats = () => request.get<ShowResult<ImportStats>>('/import/rankings/stats')
