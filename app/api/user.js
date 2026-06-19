import request from '~/utils/request'
import { setToken } from '~/utils/request'

/**
 * Login
 * body: { username, password }
 */
export const login = (data) => request.post('/vue-element-admin/user/login', data).then((res) => {
  if (res?.data?.token) setToken(res.data.token)
  return res
})

/**
 * Get current user info
 */
export const info = () => request.get('/vue-element-admin/user/info')
