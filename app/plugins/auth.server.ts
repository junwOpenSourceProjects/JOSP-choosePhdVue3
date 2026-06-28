// plugins/auth.server.ts
// SSR 阶段恢复登录态 — 跟 auth.client.ts 对称, 解决 SSR HTML 看不到 admin nav 的问题
//
// 真凶: 之前只有 auth.client.ts plugin, SSR 时 user.value 默认 null,
// default.vue 的 `v-if="auth.isAdmin"` 永 false → admin nav 在 SSR HTML 不渲染,
// 浏览器 refresh 客户端 mount 后才显示, SEO + 视觉闪烁。
//
// SSR 时拿 token cookie → fetch /api/v1/auth/me → set user.value。
// 失败 (token 无效/后端未起) 不抛错, 让 client 端 auth.client.ts 再跑 initAuth 兜底。

export default defineNuxtPlugin(async () => {
  const auth = useAuth()
  const token = useCookie<string | null>('choosephd_token', { default: () => null })

  if (!token.value) {
    return
  }

  try {
    const $api = useApi()
    const me = await $api<{ id: number; username: string; role: string }>('/api/v1/auth/me')
    auth.user.value = me
  } catch {
    // SSR 阶段 fetch 失败 (后端未起 / token 无效) — 让 client 端 plugin 再处理
    // 不清 token, 跟 client 行为一致 (client 也只在 fetch 401 时才清)
  }
})