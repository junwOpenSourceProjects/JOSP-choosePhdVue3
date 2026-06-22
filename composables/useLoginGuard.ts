/**
 * composables/useLoginGuard.ts
 *
 * 全局登录守卫。
 * - 401 触发:从 `lib/request.ts` 的 onResponseError 调 `guardRoute()`
 * - 跳 `/login?from=<encoded fullPath>`,登录成功后 `redirectAfterLogin()` 回跳
 * - 已在登录页不重复跳
 * - SSR 安全(在 server 端不调 navigateTo,只存 from)
 */

import type { ComputedRef } from 'vue'

const LAST_FROM_KEY = 'choosePhd.login.from'

export interface UseLoginGuardReturn {
  isLoggedIn: ComputedRef<boolean>
  /** 跳登录并保留 from(401 时调用) */
  guardRoute: () => Promise<void>
  /** 登录成功后回跳 from */
  redirectAfterLogin: () => Promise<void>
}

/**
 * useLoginGuard — 401 自动跳登录,登录后回跳
 * @example
 *   // 全局调用(由 lib/request.ts 的 onResponseError 触发)
 *   const guard = useLoginGuard()
 *   await guard.guardRoute()
 *
 *   // 登录成功页面调用
 *   await guard.redirectAfterLogin()
 */
export function useLoginGuard(): UseLoginGuardReturn {
  const authStore = useAuthStore()
  const isLoggedIn = computed(() => authStore.isLoggedIn)

  /**
   * 触发跳登录。已登录 → 不跳;在登录页 → 不跳;无 route → 不跳
   */
  const guardRoute = async (): Promise<void> => {
    if (!import.meta.client) return
    if (isLoggedIn.value) return
    const route = useRoute()
    if (route.path === '/login') return

    // 保留原路径(支持 query + hash)
    const from = route.fullPath
    try {
      window.sessionStorage.setItem(LAST_FROM_KEY, from)
    } catch {
      /* sessionStorage 不可用时静默 */
    }

    const to = `/login?from=${encodeURIComponent(from)}`
    await navigateTo(to, { replace: true, external: false })
  }

  /**
   * 登录成功后回跳 from。优先级:
   * 1. URL query `?from=...`(登录页跳转来时携带)
   * 2. sessionStorage `choosePhd.login.from`(直接调 guardRoute 时存的)
   * 3. 兜底跳 `/`
   */
  const redirectAfterLogin = async (): Promise<void> => {
    if (!import.meta.client) {
      await navigateTo('/')
      return
    }

    const route = useRoute()
    const queryFrom = typeof route.query.from === 'string' ? route.query.from : ''

    let from = queryFrom
    if (!from) {
      try {
        from = window.sessionStorage.getItem(LAST_FROM_KEY) || ''
        if (from) window.sessionStorage.removeItem(LAST_FROM_KEY)
      } catch {
        from = ''
      }
    }

    // 安全检查:不能跳回登录页本身
    if (!from || from === '/login' || from.startsWith('/login?')) {
      await navigateTo('/', { replace: true })
      return
    }

    await navigateTo(from, { replace: true })
  }

  return {
    isLoggedIn,
    guardRoute,
    redirectAfterLogin,
  }
}
