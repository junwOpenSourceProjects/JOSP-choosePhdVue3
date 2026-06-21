/**
 * Nuxt 4 unified fetch wrapper.
 * - Use Nuxt 4 built-in `$fetch` (no axios dep, works in SSR + client)
 * - Backend uses session cookie (HttpSession) for auth
 * - On client: browser automatically sends cookies for same-origin `/api/v1/**`
 * - On SSR: proxy through routeRules '/api/v1/**'; auth requests should be skipped on server
 */

function buildUrl(url: string): string {
  if (url.startsWith('http')) return url
  return `/api/v1${url.startsWith('/') ? url : '/' + url}`
}

export const request = {
  get<T = any>(url: string, options: Record<string, any> = {}): Promise<T> {
    return $fetch<T>(buildUrl(url), {
      method: 'GET',
      ...options
    })
  },
  post<T = any>(url: string, data?: any, options: Record<string, any> = {}): Promise<T> {
    return $fetch<T>(buildUrl(url), {
      method: 'POST',
      body: data,
      ...options
    })
  },
  put<T = any>(url: string, data?: any, options: Record<string, any> = {}): Promise<T> {
    return $fetch<T>(buildUrl(url), {
      method: 'PUT',
      body: data,
      ...options
    })
  }
}

export default request
