/**
 * lib/request.ts
 *
 * Nuxt 4 unified fetch wrapper.
 * - Use Nuxt 4 built-in `$fetch` (no axios dep, works in SSR + client)
 * - Backend uses session cookie (HttpSession) for auth
 * - On client: browser automatically sends cookies for same-origin `/api/v1/**`
 * - On SSR: proxy through routeRules '/api/v1/**'; auth requests should be skipped on server
 *
 * T-01 扩展:
 * - 加 401 拦截:onResponseError 收到 401 → 清 auth store token + 触发 useLoginGuard
 * - 默认 `redirectOnAuthError=true`,401 自动跳 /login?from=...
 * - 不破坏现有成功响应处理(直接返回 res 给调用方)
 * - options 类型与 $fetch 兼容(headers/params/body/query 都能传)
 *   不用 FetchOptions 继承避免 Nuxt typed routes 引发 TS2321 递归栈溢出
 */

function buildUrl(url: string): string {
  if (url.startsWith('http')) return url
  return `/api/v1${url.startsWith('/') ? url : '/' + url}`
}

/**
 * 业务层 options:401 跳登录 / 自定义错误处理 + 任意 $fetch 选项
 * (headers / params / body / query 等透传给 $fetch)
 */
export interface RequestOptions {
  /** 401 时是否自动跳登录,默认 true */
  redirectOnAuthError?: boolean
  /** 自定义错误处理(覆盖默认 toast) */
  onError?: (err: Error) => void
  /** 任意 $fetch 选项(headers / params / body / query / signal / ... ) */
  [key: string]: any
}

/**
 * 统一处理 401:清 auth → 跳登录(保留 from)
 * 在 client 端同步执行 SSR 端只清 token(navigateTo 由客户端 hydrate 后再做)
 */
function handleUnauthorized(): void {
  if (!import.meta.client) return
  try {
    const authStore = useAuthStore()
    authStore.clearUser()
  } catch {
    /* store 不存在时静默 */
  }
  try {
    const guard = useLoginGuard()
    void guard.guardRoute()
  } catch (e) {
    console.warn('[request] login guard failed', e)
  }
}

function buildErrorHandler(options: RequestOptions) {
  return ({ response }: { response: { status: number; statusText: string } }) => {
    if (response.status === 401 && options.redirectOnAuthError !== false) {
      handleUnauthorized()
    }
    if (options.onError) {
      options.onError(new Error(`HTTP ${response.status} ${response.statusText}`))
    }
  }
}

export const request = {
  get<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    const { redirectOnAuthError: _r, onError: _e, ...rest } = options
    return $fetch<T>(buildUrl(url), {
      method: 'GET',
      ...rest,
      onResponseError: buildErrorHandler(options),
    })
  },
  post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { redirectOnAuthError: _r, onError: _e, ...rest } = options
    return $fetch<T>(buildUrl(url), {
      method: 'POST',
      body: data,
      ...rest,
      onResponseError: buildErrorHandler(options),
    })
  },
  put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    const { redirectOnAuthError: _r, onError: _e, ...rest } = options
    return $fetch<T>(buildUrl(url), {
      method: 'PUT',
      body: data,
      ...rest,
      onResponseError: buildErrorHandler(options),
    })
  },
}

export default request
