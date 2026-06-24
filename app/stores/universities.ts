import { defineStore } from 'pinia'
import type { PageResult, RankingEntryVo, University } from '~/types'

export const useUniversitiesStore = defineStore('universities', () => {
  const $api = useApi()

  const universities = ref<University[]>([])
  const loading = ref(false)
  const total = ref(0)

  const searchUniversities = async (params?: Record<string, any>) => {
    loading.value = true
    try {
      const res = await $api<PageResult<University>>('/api/v1/universities', {
        method: 'GET',
        query: params,
      })
      universities.value = res.list
      total.value = res.total
      return res
    } finally {
      loading.value = false
    }
  }

  const fetchUniversity = async (urlId: string) => {
    return await $api<University>(`/api/v1/universities/${urlId}`)
  }

  const fetchUniversityRankings = async (urlId: string, params?: Record<string, any>) => {
    return await $api<RankingEntryVo[]>(`/api/v1/universities/${urlId}/rankings`, {
      method: 'GET',
      query: params,
    })
  }

  return {
    universities,
    loading,
    total,
    searchUniversities,
    fetchUniversity,
    fetchUniversityRankings,
  }
})
