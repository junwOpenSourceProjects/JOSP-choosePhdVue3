import request from '~/lib/request'

/**
 * Login
 * body: { username, password }
 * Backend uses session cookie, no token storage needed on client.
 */
export const login = (data) => request.post('/vue-element-admin/user/login', data)

/**
 * Get current user info
 */
export const info = () => request.get('/vue-element-admin/user/info')
