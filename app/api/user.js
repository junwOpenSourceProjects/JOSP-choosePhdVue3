import request from '~/utils/request'

export const login = (data) => request.post('/vue-element-admin/user/login', data)
export const info = (params) => request.get('/vue-element-admin/user/info', { params })
