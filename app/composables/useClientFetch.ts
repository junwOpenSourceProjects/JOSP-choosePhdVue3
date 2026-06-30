import type { ApiResult } from '~/types'

interface Options<T> {
  default?: T
}

/**
 * 客户端 fetch composable — 鉴权接口专用，绕过 SSR。
 *
 * <p>为什么不能用 `useFetch`：`useFetch` 在 SSR 阶段会执行（拿不到 cookie/token），
 * 鉴权接口返回 401 时整个页面会渲染失败。这里用 onMounted 触发，
 * SSR 阶段返回 `options.default` 让页面骨架先渲染，客户端再异步拉真实数据。
 *
 * <p>典型用法：
 * <pre>{@code
 *   const { data, pending, error, refresh } = useClientFetch<MyType>(
 *     () => '/api/v1/admin/xxx',
 *     () => ({ q: filter.value }),
 *     { default: () => [] }
 *   )
 *   watch(filter, refresh)
 * }</pre>
 *
 * @param pathGetter  返回 path 字符串的函数 (避免每次重新计算)
 * @param queryGetter 返回 query 对象的函数 (支持 watch 触发 refresh)
 * @param options.default 初始 data 值 (避免 .list.map 报 undefined)
 */
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
  const localePath = useLocalePath()
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
        if (import.meta.client && !window.location.pathname.endsWith('/login')) {
          await navigateTo(localePath('/login'))
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
