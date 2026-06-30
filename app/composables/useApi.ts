import { useCookie, useRuntimeConfig, navigateTo, useLocalePath } from '#imports'
import type { ApiResult } from '~/types'

const XOR_KEY = 'JOSP-choosePhd-2026-net-tab-obfuscation-v1'

function xorDecode(base64: string): string {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0))
  const keyBytes = new TextEncoder().encode(XOR_KEY)
  const decoded = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) {
    decoded[i] = bytes[i]! ^ keyBytes[i % keyBytes.length]!
  }
  return new TextDecoder().decode(decoded)
}

/**
 * 通用 API 调用。
 * 后端 ResponseObfuscationFilter 对所有非 AI 爬虫请求混淆响应体（XOR+Base64），
 * 此处自动检测 X-Obfuscated 头并在客户端解码，用户无感知。
 */
export function useApi() {
  const config = useRuntimeConfig()
  const localePath = useLocalePath()
  const token = useCookie<string | null>('choosephd_token', { default: () => null })

  function handleResponseError(ctx: { response?: { status: number } }) {
    const status = ctx.response?.status
    if (status === 401) {
      token.value = null
      if (process.client) {
        navigateTo(localePath('/login'))
      }
    }
    if (status === 429 && process.client) {
      const toast = useToast()
      toast.add({
        title: '今日使用额度已用完',
        description: '升级专业版解锁更高额度、每页100条、无日限额。',
        color: 'warning',
        duration: 8000,
        actions: [{
          label: '查看升级方案',
          onClick: async () => { await navigateTo(localePath('/pricing')) }
        }]
      })
    }
  }

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

    // 用 responseType: 'text' 拿原始字符串，检测 X-Obfuscated 头决定是否解码
    let obfuscated = false
    const raw = await $fetch<string>(cleanUrl, {
      baseURL: config.public.apiBase,
      ...options,
      headers,
      responseType: 'text',
      onResponse(ctx) {
        obfuscated = ctx.response.headers.get('X-Obfuscated') === '1'
      },
      onResponseError: handleResponseError,
    })

    if (!raw || raw.trim().length === 0) {
      return undefined as unknown as T
    }

    const jsonText = obfuscated ? xorDecode(raw) : raw
    const parsed: ApiResult<T> = JSON.parse(jsonText)

    if (parsed.code !== 0) {
      throw new Error(parsed.message || 'API error')
    }

    return parsed.data as T
  }
}
