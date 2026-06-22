/**
 * composables/useWatchlist.ts
 *
 * 全局选校清单 (FIFO 5 所)
 * - Pinia store 持久化到 localStorage (key: choosePhd.watchlist.v1)
 * - 跨页面共享 (首页 / 学校库 / 详情 / 我的选校 都能用)
 * - add(name) / remove(name) / toggle(name) / clear() / has(name)
 * - onMounted 从 localStorage hydrate
 */

import { ref, watch } from 'vue'

const STORAGE_KEY = 'choosePhd.watchlist.v1'
const MAX = 5

const watchlist = ref<string[]>([])
let hydrated = false

function hydrate() {
  if (hydrated || typeof window === 'undefined') return
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) watchlist.value = parsed.slice(0, MAX)
    }
  } catch (e) {
    console.warn('[watchlist] hydrate failed', e)
  }
  hydrated = true
}

function persist() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(watchlist.value))
  } catch (e) {
    console.warn('[watchlist] persist failed', e)
  }
}

export function useWatchlist() {
  hydrate()

  watch(watchlist, persist, { deep: true })

  function add(name: string) {
    if (watchlist.value.includes(name)) return
    if (watchlist.value.length >= MAX) watchlist.value.shift()
    watchlist.value.push(name)
  }

  function remove(name: string) {
    const idx = watchlist.value.indexOf(name)
    if (idx >= 0) watchlist.value.splice(idx, 1)
  }

  function toggle(name: string) {
    if (watchlist.value.includes(name)) remove(name)
    else add(name)
  }

  function clear() {
    watchlist.value = []
  }

  function has(name: string): boolean {
    return watchlist.value.includes(name)
  }

  return {
    list: watchlist,
    count: () => watchlist.value.length,
    max: MAX,
    add,
    remove,
    toggle,
    clear,
    has,
  }
}