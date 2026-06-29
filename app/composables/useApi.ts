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

    // 先尝试走正常 JSON 路径
    try {
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
    } catch (err: any) {
      // 如果后端返回了混淆响应（base64 文本），$fetch 尝试 JSON.parse 会失败
      // 此时用 responseType: 'text' 重试，手动 XOR 解码
      if (err?.message?.includes('JSON') || err?.cause || true) {
        try {
          const rawText = await $fetch<string>(cleanUrl, {
            baseURL: config.public.apiBase,
            ...options,
            headers,
            responseType: 'text',
            onResponseError(ctx: { response?: { status: number } }) {
              if (ctx.response?.status === 401) {
                token.value = null
                navigateTo('/login')
              }
            },
          })

          // 尝试 XOR 解码
          const decoded = xorDecode(rawText)
          const parsed: ApiResult<T> = JSON.parse(decoded)
          if (parsed.code !== 0) {
            throw new Error(parsed.message || 'API error')
          }
          return parsed.data as T
        } catch (retryErr: any) {
          // 重试也失败，抛出原始错误
          throw err
        }
      }
      throw err
    }
  }
}
