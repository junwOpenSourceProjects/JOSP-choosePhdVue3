import { useCookie, useRuntimeConfig, navigateTo } from '#imports'
import type { ApiResult } from '~/types'

// XOR key — 与后端 ResponseObfuscationFilter 保持一致
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

    // 用 responseType: 'text' 拿原始字符串，自行解析 JSON，以便支持混淆解码
    let obfuscated = false
    const rawText = await $fetch<string>(cleanUrl, {
      baseURL: config.public.apiBase,
      ...options,
      headers,
      responseType: 'text',
      onResponse(ctx) {
        obfuscated = ctx.response.headers.get('X-Obfuscated') === '1'
      },
      onResponseError(ctx) {
        if (ctx.response?.status === 401) {
          token.value = null
          if (process.client) {
            navigateTo('/login')
          }
        }
      },
    })

    // 解码混淆响应
    const jsonText = obfuscated ? xorDecode(rawText) : rawText
    const parsed: ApiResult<T> = JSON.parse(jsonText)

    if (parsed.code !== 0) {
      throw new Error(parsed.message || 'API error')
    }

    return parsed.data as T
  }
}
