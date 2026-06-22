/**
 * composables/useDebouncedRef.ts
 *
 * Debounced ref — 搜索框等场景,把高频更新削峰到 delay ms 一次。
 * - 返回 ref,值的变化会延迟 delay ms 反映
 * - 同步立即更新可调 `flush()`,取消可调 `cancel()`
 * - SSR 安全(client 端才启动 timer)
 */

import type { Ref } from 'vue'

export interface DebouncedRefReturn<T> {
  /** 只读 debounced 值(template 绑这个) */
  debounced: Ref<T>
  /** 立即把当前源值同步到 debounced(用于 Enter 提交时立刻生效) */
  flush: () => void
  /** 取消防抖(丢弃未触发的更新) */
  cancel: () => void
}

/**
 * useDebouncedRef — 创建一个延迟响应的 ref
 * @param source 源 ref(原始输入)
 * @param delay 延迟毫秒,默认 250
 * @example
 *   const search = ref('')
 *   const { debounced } = useDebouncedRef(search, 300)
 *   // debounced.value 会在 300ms 后才变化
 */
export function useDebouncedRef<T>(source: Ref<T>, delay: number = 250): DebouncedRefReturn<T> {
  const debounced = ref(source.value) as Ref<T>
  let timer: ReturnType<typeof setTimeout> | null = null

  function update() {
    debounced.value = source.value
  }

  function schedule() {
    if (!import.meta.client) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      update()
    }, delay)
  }

  function flush() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
    update()
  }

  function cancel() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  // 监听源变化(client 才挂 watch,SSR 跳过)
  if (import.meta.client) {
    watch(source, schedule)
  }

  // 组件卸载时清理
  if (import.meta.client && typeof onScopeDispose === 'function') {
    onScopeDispose(() => {
      if (timer) clearTimeout(timer)
    })
  }

  return { debounced, flush, cancel }
}
