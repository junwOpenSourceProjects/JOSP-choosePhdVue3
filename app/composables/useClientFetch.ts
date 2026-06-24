// composables/useClientFetch.ts
// 客户端 fetch · 鉴权接口专用(避免 SSR 拿不到 token)
// 用法:
//   const { data, pending, error, refresh } = useClientFetch<MyType>(
//     () => '/api/v1/xxx',
//     () => ({ q: filter.value }),
//     { default: [] }
//   )
//   watch(filter, refresh)  // 手动 watch 触发刷新

import type { ApiResult } from '~/types'

interface Options<T> {
  default?: T
}

export function useClientFetch<T = unknown>(
  pathGetter: () => string,
  queryGetter: () => Record<string, unknown> = () => ({}),
  options: Options<T> = {}
) {
  const data = ref<T>(options.default as T) as Ref<T>
  const pending = ref(true)
  const error = ref<unknown>(null)
  const loaded = ref(false)

  const config = useRuntimeConfig()
  const token = useCookie<string | null>('choosephd_token', { default: () => null })

  async function refresh() {
    pending.value = true
    error.value = null
    try {
      const base = config.public.apiBase as string
      const path = pathGetter()
      const url = path.startsWith('http') ? path : `${base}${path}`

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token.value) {
        headers['Authorization'] = `Bearer ${token.value}`
      }

      const res = await $fetch<ApiResult<T>>(url, {
        method: 'GET',
        query: queryGetter(),
        headers,
        timeout: 8000
      })
      if (res.code !== 0) throw new Error(res.message || 'API error')
      data.value = res.data
    } catch (err: unknown) {
      error.value = err
      const e = err as { statusCode?: number }
      if (e.statusCode === 401) {
        token.value = null
        if (import.meta.client && window.location.pathname !== '/login') {
          await navigateTo('/login')
        }
      }
    } finally {
      pending.value = false
      loaded.value = true
    }
  }

  onMounted(() => { refresh() })

  return { data, pending, error, loaded, refresh }
}
