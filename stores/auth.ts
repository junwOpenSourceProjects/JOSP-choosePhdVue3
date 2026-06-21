import { defineStore } from 'pinia'
import { info, logout } from '~/lib/api/user'
import type { UserInfo } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserInfo | null>(null)
  const loading = ref(false)
  const checked = ref(false)

  const isLoggedIn = computed(() => !!user.value)
  const displayName = computed(() => user.value?.name || '')
  const avatar = computed(() => user.value?.avatar || '')
  const isAdmin = computed(() => user.value?.roles?.includes('admin') ?? false)

  async function fetchUser() {
    if (import.meta.server) return
    loading.value = true
    try {
      const res = await info()
      user.value = res.data ?? null
    } catch (e) {
      user.value = null
    } finally {
      loading.value = false
      checked.value = true
    }
  }

  function setUser(data: UserInfo | null) {
    user.value = data
    checked.value = true
  }

  async function clearUser() {
    if (import.meta.client) {
      try { await logout() } catch (e) { /* ignore */ }
    }
    user.value = null
    checked.value = true
  }

  onMounted(fetchUser)

  return { user, loading, checked, isLoggedIn, displayName, avatar, isAdmin, fetchUser, setUser, clearUser }
})
