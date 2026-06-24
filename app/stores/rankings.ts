import { defineStore } from 'pinia'
import type { PageResult, RankingEntryVo, RankingSource, Subject } from '~/types'

export const useRankingsStore = defineStore('rankings', () => {
  const $api = useApi()

  const sources = ref<RankingSource[]>([])
  const subjects = ref<Subject[]>([])
  const loading = ref(false)

  const fetchSources = async (params?: Record<string, any>) => {
    loading.value = true
    try {
      const res = await $api<PageResult<RankingSource>>('/api/v1/sources', {
        method: 'GET',
        query: params,
      })
      sources.value = res.list
    } finally {
      loading.value = false
    }
  }

  const fetchSource = async (id: number) => {
    return await $api<RankingSource>(`/api/v1/sources/${id}`)
  }

  const fetchEntries = async (id: number, params?: Record<string, any>) => {
    return await $api<PageResult<RankingEntryVo>>(`/api/v1/sources/${id}/entries`, {
      method: 'GET',
      query: params,
    })
  }

  const fetchSourceYears = async (id: number) => {
    return await $api<number[]>(`/api/v1/sources/${id}/years`, {
      method: 'GET',
    })
  }

  const fetchSubjects = async () => {
    loading.value = true
    try {
      subjects.value = await $api<Subject[]>('/api/v1/subjects')
    } finally {
      loading.value = false
    }
  }

  return {
    sources,
    subjects,
    loading,
    fetchSources,
    fetchSource,
    fetchEntries,
    fetchSourceYears,
    fetchSubjects,
  }
})
