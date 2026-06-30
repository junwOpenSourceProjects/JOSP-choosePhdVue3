import { defineStore } from 'pinia'
import type { ShortlistItem } from '~/types'

export const useShortlistStore = defineStore('shortlist', () => {
  const $api = useApi()
  const auth = useAuth()
  const localePath = useLocalePath()

  const items = ref<ShortlistItem[]>([])
  const loading = ref(false)

  const requireLogin = () => {
    if (!auth.isLoggedIn.value) {
      if (process.client) {
        navigateTo(localePath('/login'))
      }
      return false
    }
    return true
  }

  const fetchShortlist = async () => {
    if (!requireLogin()) return
    loading.value = true
    try {
      items.value = await $api<ShortlistItem[]>('/api/v1/shortlist')
    } finally {
      loading.value = false
    }
  }

  const addToShortlist = async (payload: {
    universityId: string
    priority?: number
    note?: string
  }) => {
    if (!requireLogin()) return
    const created = await $api<ShortlistItem>('/api/v1/shortlist', {
      method: 'POST',
      body: payload,
    })
    items.value.push(created)
    return created
  }

  const removeFromShortlist = async (universityId: string) => {
    if (!requireLogin()) return
    await $api(`/api/v1/shortlist/${universityId}`, {
      method: 'DELETE',
    })
    items.value = items.value.filter((item) => item.universityId !== universityId)
  }

  return {
    items,
    loading,
    fetchShortlist,
    addToShortlist,
    removeFromShortlist,
  }
})
