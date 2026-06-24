// middleware/auth.global.ts
// 全局路由守卫 · 受保护页面需登录

export default defineNuxtRouteMiddleware(async (to) => {
  // SSR 不做客户端跳转检查，避免水合不一致
  if (import.meta.server) return

  const authStore = useAuthStore()
  const auth = useAuth()

  // 尝试恢复登录态
  if (!authStore.isLoggedIn && auth.token.value) {
    await auth.initAuth()
  }

  // 受保护页面需登录
  const protectedPaths = ['/shortlist', '/profile']
  if (protectedPaths.includes(to.path) && !authStore.isLoggedIn) {
    return navigateTo(`/login?redirect=${encodeURIComponent(to.fullPath)}`)
  }
})
