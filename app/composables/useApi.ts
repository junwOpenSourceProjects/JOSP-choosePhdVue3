import { useCookie, useRuntimeConfig, navigateTo } from '#imports'
import type { ApiResult } from '~/types'

export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('choosephd_token', { default: () => null })

  return async function $api<T>(url: string, options: Record<string, any> = {}): Promise<T> {
    const headers: Record<string, string> = { ...(options.headers || {}) }

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    // 兼容旧调用: 传入的 url 若已含 baseURL 路径段 (如 /api/v1/...), 剥掉避免 $fetch 拼出 /api/v1/api/v1/...
    // 跨 JOSP-* 通用反模式修复 (memory §fetch-string-body-json-stringify-quote-bug 同根)
    const baseURL = config.public.apiBase as string
    // 1) 完整 URL 匹配 (http://localhost:8080/api/v1 + /xxx)
    // 2) 路径段匹配 (/api/v1 + /xxx) — 兼容老调用直接传 /api/v1/xxx
    let cleanUrl = url
    if (url.startsWith(baseURL)) {
      cleanUrl = url.slice(baseURL.length)
    } else {
      // 尝试用 baseURL 路径段 (如 /api/v1) 剥前缀
      const basePath = new URL(baseURL).pathname.replace(/\/$/, '')
      if (url.startsWith(basePath)) {
        cleanUrl = url.slice(basePath.length) || '/'
      }
    }

    const res = await $fetch<ApiResult<T>>(cleanUrl, {
      baseURL: config.public.apiBase,
      ...options,
      headers,
      onResponseError(ctx: { response?: { status: number } }) {
        if (ctx.response?.status === 401) {
          token.value = null
          if (process.client) {
            navigateTo('/login')
          }
        }
      },
    })

    if (res.code !== 0) {
      throw new Error(res.message || 'API error')
    }

    return res.data as T
  }
}
