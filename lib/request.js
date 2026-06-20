/**
 * Nuxt 4 unified fetch wrapper.
 * - Use Nuxt 4 built-in `$fetch` (no axios dep, works in SSR + client)
 * - Backend uses session cookie (HttpSession) for auth
 * - On client: browser automatically sends cookies for same-origin `/api/v1/**`
 * - On SSR: proxy through routeRules '/api/v1/**'; auth requests should be skipped on server
 */

function buildUrl(url) {
  if (url.startsWith('http')) return url
  // Routes go through /api/v1/** nuxt proxy
  return `/api/v1${url.startsWith('/') ? url : '/' + url}`
}

export const request = {
  get(url, options = {}) {
    return $fetch(buildUrl(url), {
      method: 'GET',
      ...options
    })
  },
  post(url, data, options = {}) {
    return $fetch(buildUrl(url), {
      method: 'POST',
      body: data,
      ...options
    })
  },
  put(url, data, options = {}) {
    return $fetch(buildUrl(url), {
      method: 'PUT',
      body: data,
      ...options
    })
  }
}

export default request
