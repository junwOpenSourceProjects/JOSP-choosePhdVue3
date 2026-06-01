import request from '~/utils/request'

export const queryRankingStatus = (params) => request.get('/status/queryRankingStatus', { params })
export const insertOrUpdate = (data) => request.post('/status/insertOrUpdate', data)
export const insertBatch = (data) => request.post('/status/insertBatch', data)
export const drawerData = (data) => request.post('/status/drawerData', data)
