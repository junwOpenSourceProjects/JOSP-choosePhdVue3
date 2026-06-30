import { useCookie, useState, useLocalePath, navigateTo } from '#imports'
import type { User } from '~/types'

export function useAuth() {
  const token = useCookie<string | null>('choosephd_token', { default: () => null })
  const user = useState<User | null>('auth-user', () => null)
  const isLoggedIn = computed(() => !!token.value && !!user.value)
  const $api = useApi()
  const localePath = useLocalePath()

  const login = (newToken: string, newUser: User) => {
    token.value = newToken
    user.value = newUser
  }

  const logout = () => {
    token.value = null
    user.value = null
    if (process.client) {
      navigateTo(localePath('/login'))
    }
  }

  const initAuth = async () => {
    if (!token.value) {
      user.value = null
      return
    }

    try {
      const me = await $api<User>('/api/v1/auth/me')
      user.value = me
    } catch {
      token.value = null
      user.value = null
    }
  }

  return {
    user,
    token,
    isLoggedIn,
    login,
    logout,
    initAuth,
  }
}
