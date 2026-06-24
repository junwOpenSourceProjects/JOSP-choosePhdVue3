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

    const res = await $fetch<ApiResult<T>>(url, {
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
