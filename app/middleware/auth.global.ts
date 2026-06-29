// middleware/auth.global.ts
// 全局路由守卫 · 受保护页面需登录

export default defineNuxtRouteMiddleware(async (to) => {
  if (import.meta.server) return

  const authStore = useAuthStore()
  const auth = useAuth()

  if (!authStore.isLoggedIn && auth.token.value) {
    await auth.initAuth()
  }

  // 去掉 locale 前缀再匹配路径
  const pathWithoutLocale = to.path.replace(/^\/[a-z]{2}-[A-Z]{2}/, '') || '/'
  const protectedPaths = ['/shortlist', '/profile']
  if (protectedPaths.includes(pathWithoutLocale) && !authStore.isLoggedIn) {
    const localePath = useLocalePath()
    return navigateTo(localePath(`/login?redirect=${encodeURIComponent(to.fullPath)}`))
  }
})
