/**
 * composables/useAsyncState.ts
 *
 * 4 态异步加载包装,统一全站 fetch 数据流契约。
 * 状态机:idle → loading → success|empty|error → (refresh) → loading → ...
 *
 * 设计要点:
 * - 不抛错误(try/catch 静默,error 塞 ref)
 * - SSR 兼容(用 Nuxt useAsyncData,自动 dedupe + key)
 * - 5 态 status 派生:idle / loading / success / error / empty
 * - 4-state 组件契约:模板侧 v-if="pending" → v-else-if="error" → v-else-if="!data.length" → v-else
 */

import type { Ref, ComputedRef } from 'vue'
import type { AsyncStatus } from '~/types'

export interface UseAsyncStateOptions<T> {
  /** 默认值(pending 期间显示) */
  initialValue?: T
  /** 是否立即执行(默认 true) */
  immediate?: boolean
  /** 重试策略,默认 0 */
  retries?: number
  /** 错误回调(用于自定义日志 / 上报) */
  onError?: (err: Error) => void
}

export interface UseAsyncStateReturn<T> {
  data: Ref<T>
  pending: Ref<boolean>
  error: Ref<Error | null>
  status: ComputedRef<AsyncStatus>
  refresh: () => Promise<void>
}

/**
 * 空态判断:data 长度为 0 即视为 empty
 * - null/undefined → empty
 * - Array.length === 0 → empty
 * - Page.records.length === 0 (MyBatis-Plus 分页对象) → empty
 * - 其他对象 → false
 */
export function isEmpty<T>(data: T): boolean {
  if (data == null) return true
  if (Array.isArray(data)) return data.length === 0
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.records)) return (obj.records as unknown[]).length === 0
    if (Array.isArray(obj.data)) return (obj.data as unknown[]).length === 0
    if (Array.isArray(obj.list)) return (obj.list as unknown[]).length === 0
  }
  return false
}

/**
 * useAsyncState — 统一异步数据状态钩子
 * @param fetcher 数据获取函数(可抛错)
 * @param initialValue 初始值(SSR 必传,客户端首屏前使用)
 * @param options 行为配置
 * @example
 *   const { data, pending, error, status, refresh } = await useAsyncState(
 *     () => rankingApi.query({ ... }),
 *     [] as UniversityAllDTO[]
 *   )
 */
export async function useAsyncState<T>(
  fetcher: () => Promise<T>,
  initialValue?: T,
  options: UseAsyncStateOptions<T> = {}
): Promise<UseAsyncStateReturn<T>> {
  const { initialValue: optDefault, immediate = true, retries = 0, onError } = options
  const fallback = (initialValue !== undefined ? initialValue : optDefault) as T

  // 用 fetcher toString 作为 key,SSR 多次 await 同一 fetcher 会 dedupe
  // (Nuxt 4 useAsyncData 自动复用)
  const key = `useAsyncState:${fetcher.toString().slice(0, 80)}`

  const asyncData = await useAsyncData<T>(key, async () => {
    let lastErr: unknown
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        return await fetcher()
      } catch (e) {
        lastErr = e
        if (attempt === retries) break
        // 简单退避:100ms * (attempt + 1)
        await new Promise((r) => setTimeout(r, 100 * (attempt + 1)))
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
  }, {
    default: () => fallback,
    immediate,
  })

  const { data, pending, error, refresh: nuxtRefresh } = asyncData

  // 暴露 5 态 status
  const status = computed<AsyncStatus>(() => {
    if (pending.value) return 'loading'
    if (error.value) return 'error'
    if (isEmpty(data.value)) return 'empty'
    if (data.value !== undefined && data.value !== null) return 'success'
    return 'idle'
  }) as ComputedRef<AsyncStatus>

  // 错误回调包装 refresh
  const refresh = async (): Promise<void> => {
    try {
      await nuxtRefresh()
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e))
      if (onError) onError(err)
    }
  }

  // 监听 onError(用户传入时)
  if (onError) {
    watch(error, (newErr) => {
      if (newErr) onError(newErr)
    })
  }

  return {
    data: data as Ref<T>,
    pending: pending as Ref<boolean>,
    error: error as Ref<Error | null>,
    status,
    refresh,
  }
}
