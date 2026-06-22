/**
 * composables/useToast.ts
 *
 * 全站 toast 通知队列。提供 success / error / info / warning 四个 helper,
 * 内部维护一个 module-level 的 toast 列表(全站单例)。
 *
 * 渲染职责:`layouts/default.vue` 的 `<ClientOnly>` 区域(本期 T-02 实现组件)。
 * 本期 T-01 只提供 push / state / helper API,不动 UI。
 */

import type { Ref } from 'vue'
import type { ToastMessage } from '~/types'

// =============================================================
// 全局单例队列(module-level ref,跨页面共享)
// =============================================================
const toasts = ref<ToastMessage[]>([])
let counter = 0

/**
 * 生成稳定 id(SSR 安全:不依赖 Date.now 之外的随机源)
 */
function genId(): string {
  counter += 1
  return `toast-${Date.now()}-${counter}`
}

/**
 * 内部 push,统一管理 duration / 自动消失
 */
function push(
  tone: ToastMessage['tone'],
  text: string,
  duration: number = 4000
): string {
  const id = genId()
  const msg: ToastMessage = { id, tone, text, duration }
  toasts.value = [...toasts.value, msg]

  if (duration > 0 && import.meta.client) {
    setTimeout(() => dismiss(id), duration)
  }
  return id
}

/**
 * 手动关闭指定 toast
 */
function dismiss(id: string): void {
  toasts.value = toasts.value.filter((t) => t.id !== id)
}

/**
 * useToast — 全局 toast 入口
 * @example
 *   const toast = useToast()
 *   toast.success('已保存')
 *   toast.error('网络异常', { duration: 6000 })
 *   toast.dismiss('toast-12345-1')
 */
export function useToast(): {
  toasts: Ref<ToastMessage[]>
  push: (tone: ToastMessage['tone'], text: string, duration?: number) => string
  success: (text: string, opts?: { duration?: number }) => void
  error: (text: string, opts?: { duration?: number }) => void
  info: (text: string, opts?: { duration?: number }) => void
  warning: (text: string, opts?: { duration?: number }) => void
  dismiss: (id: string) => void
  clear: () => void
} {
  return {
    toasts: toasts as Ref<ToastMessage[]>,
    push,
    success(text, opts) {
      push('success', text, opts?.duration ?? 4000)
    },
    error(text, opts) {
      push('error', text, opts?.duration ?? 6000)
    },
    info(text, opts) {
      push('info', text, opts?.duration ?? 4000)
    },
    warning(text, opts) {
      push('warning', text, opts?.duration ?? 5000)
    },
    dismiss,
    clear() {
      toasts.value = []
    },
  }
}
