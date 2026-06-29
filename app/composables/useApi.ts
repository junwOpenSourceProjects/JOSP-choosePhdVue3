import { useCookie, useRuntimeConfig, navigateTo } from '#imports'
import type { ApiResult } from '~/types'

const XOR_KEY = 'JOSP-choosePhd-2026-net-tab-obfuscation-v1'

function xorDecode(base64: string): string {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const keyBytes = new TextEncoder().encode(XOR_KEY)
  const decoded = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    decoded[i] = bytes[i] ^ keyBytes[i % keyBytes.length]
  }
  return new TextDecoder().decode(decoded)
}

function handleResponseError(ctx: { response?: { status: number } }) {
  const status = ctx.response?.status
  if (status === 401) {
    const token = useCookie<string | null>('choosephd_token', { default: () => null })
    token.value = null
    if (process.client) {
      navigateTo('/login')
    }
  }
  if (status === 429 && process.client) {
    const toast = useToast()
    toast.add({
      title: '今日使用额度已用完',
      description: '升级专业版解锁更高额度、每页100条、无日限额。',
      color: 'warning',
      timeout: 8000,
      actions: [{
        label: '查看升级方案',
        click: () => navigateTo('/pricing')
      }]
    })
  }
}

export function useApi() {
  const config = useRuntimeConfig()
  const token = useCookie<string | null>('choosephd_token', { default: () => null })

  return async function $api<T>(url: string, options: Record<string, any> = {}): Promise<T> {
    const headers: Record<string, string> = { ...(options.headers || {}) }

    if (token.value) {
      headers.Authorization = `Bearer ${token.value}`
    }

    const baseURL = config.public.apiBase as string
    let cleanUrl = url
    if (url.startsWith(baseURL)) {
      cleanUrl = url.slice(baseURL.length)
    } else {
      const basePath = new URL(baseURL).pathname.replace(/\/$/, '')
      if (url.startsWith(basePath)) {
        cleanUrl = url.slice(basePath.length) || '/'
      }
    }

    // 正常 JSON 路径
    try {
      const res = await $fetch<ApiResult<T>>(cleanUrl, {
        baseURL: config.public.apiBase,
        ...options,
        headers,
        onResponseError: handleResponseError,
      })

      if (res.code !== 0) {
        throw new Error(res.message || 'API error')
      }
      return res.data as T
    } catch (err: any) {
      // 混淆响应（base64 blob）→ JSON.parse 失败 → 重试 text 解码
      try {
        const rawText = await $fetch<string>(cleanUrl, {
          baseURL: config.public.apiBase,
          ...options,
          headers,
          responseType: 'text',
          onResponseError: handleResponseError,
        })

        const decoded = xorDecode(rawText)
        const parsed: ApiResult<T> = JSON.parse(decoded)
        if (parsed.code !== 0) {
          throw new Error(parsed.message || 'API error')
        }
        return parsed.data as T
      } catch {
        throw err
      }
    }
  }
}
