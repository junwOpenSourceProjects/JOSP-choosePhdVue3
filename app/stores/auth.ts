import { defineStore } from 'pinia'
import type { AuthResponse, LoginCredentials, RegisterData } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const auth = useAuth()
  const $api = useApi()

  const user = computed(() => auth.user.value)
  const isLoggedIn = computed(() => auth.isLoggedIn.value)

  const login = async (credentials: LoginCredentials) => {
    const res = await $api<AuthResponse>('/api/v1/auth/login', {
      method: 'POST',
      body: credentials,
    })
    auth.login(res.token, res.user)
    return res
  }

  const register = async (data: RegisterData) => {
    return await $api<AuthResponse>('/api/v1/auth/register', {
      method: 'POST',
      body: data,
    })
  }

  const logout = () => {
    auth.logout()
  }

  const fetchMe = async () => {
    await auth.initAuth()
  }

  return {
    user,
    isLoggedIn,
    isAdmin: computed(() => user.value?.role === 'ROLE_ADMIN'),
    login,
    register,
    logout,
    fetchMe,
  }
})
