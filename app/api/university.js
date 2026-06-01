import request from '~/utils/request'

export const queryQs = (params) => request.get('/query/qs', { params })
export const queryAllQs = (params) => request.get('/query/queryQs', { params })
export const queryAll = (params) => request.get('/query/queryAll', { params })
export const queryAllEcharts = (params) => request.get('/query/queryAllEcharts', { params })
export const updateEchartsData = () => request.get('/query/updateEchartsData')
export const queryPartEcharts = (params) => request.get('/query/queryPartEcharts', { params })
