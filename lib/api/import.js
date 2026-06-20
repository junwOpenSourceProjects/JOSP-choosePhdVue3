import request from '~/lib/request'

/**
 * 上传排名 txt 文件并导入数据库
 * @param {File[]} files
 * @returns 导入记录数
 */
export const uploadRankings = (files) => {
  const form = new FormData()
  for (const f of files) form.append('files', f)
  return request.post('/import/rankings', form, { headers: {} })
}

/**
 * 一键扫描本地工作目录下 qs 排名/ 文件夹
 */
export const scanLocal = () => request.post('/import/rankings/scanLocal', null)

/**
 * 扫描任意绝对路径
 */
export const scanPath = (path) => request.post('/import/rankings/scanPath', { path })

/**
 * 预览文件前 5 行 (不入库)
 * @param {File} file
 */
export const previewFile = (file) => {
  const form = new FormData()
  form.append('file', file)
  return request.post('/import/rankings/preview', form, { headers: {} })
}

/**
 * 历史导入记录分页
 * @param {Object} params - { page, pageSize, rankVariant }
 */
export const listHistory = (params = {}) => {
  const q = new URLSearchParams()
  q.set('page', String(params.page ?? 1))
  q.set('pageSize', String(params.pageSize ?? 20))
  if (params.rankVariant) q.set('rankVariant', params.rankVariant)
  return request.get(`/import/rankings/history?${q.toString()}`)
}

/**
 * 导入总量统计
 */
export const stats = () => request.get('/import/rankings/stats')
