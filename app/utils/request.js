/**
 * Nuxt 4 unified fetch wrapper.
 * - Use Nuxt 4 built-in `$fetch` (no axios dep, works in SSR + client)
 * - On SSR: proxy through routeRules '/api/v1/**' to backend
 * - On client: direct fetch with X-Token header
 */

const TOKEN_KEY = 'choosePhd_token'

export function getToken() {
  if (import.meta.client) {
    return localStorage.getItem(TOKEN_KEY) || ''
  }
  return ''
}

export function setToken(token) {
  if (import.meta.client && token) {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function clearToken() {
  if (import.meta.client) {
    localStorage.removeItem(TOKEN_KEY)
  }
}

function buildUrl(url) {
  if (url.startsWith('http')) return url
  // Routes go through /api/v1/** nuxt proxy
  return `/api/v1${url.startsWith('/') ? url : '/' + url}`
}

export const request = {
  get(url, options = {}) {
    return $fetch(buildUrl(url), {
      method: 'GET',
      headers: { 'X-Token': getToken() },
      ...options
    })
  },
  post(url, data, options = {}) {
    return $fetch(buildUrl(url), {
      method: 'POST',
      headers: { 'X-Token': getToken() },
      body: data,
      ...options
    })
  },
  put(url, data, options = {}) {
    return $fetch(buildUrl(url), {
      method: 'PUT',
      headers: { 'X-Token': getToken() },
      body: data,
      ...options
    })
  }
}

export default request
