// plugins/auth.client.ts
// 客户端启动时恢复登录态

export default defineNuxtPlugin(async () => {
  const auth = useAuth()
  await auth.initAuth()
})
