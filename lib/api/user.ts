import request from '~/lib/request'
import type { LoginForm, ShowResult, UserInfo } from '~/types'

/**
 * Login
 * Backend uses session cookie, no token storage needed on client.
 */
export const login = (data: LoginForm) =>
  request.post<ShowResult<{ token?: string }>>('/vue-element-admin/user/login', data)

/**
 * Get current user info
 */
export const info = () => request.get<ShowResult<UserInfo>>('/vue-element-admin/user/info')

/**
 * Logout
 */
export const logout = () => request.post<ShowResult<unknown>>('/vue-element-admin/user/logout')
