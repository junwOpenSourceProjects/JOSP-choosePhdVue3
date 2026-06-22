/**
 * stores/watchlist.ts
 *
 * 选校清单全局状态(Pinia setup-store)。
 * - FIFO 上限 MAX(6)
 * - localStorage 持久化(key=choosePhd.watchlist.v1)
 * - SSR safe:localStorage 访问用 import.meta.client 包裹
 * - 跨页面共享(首页 / 学校库 / 详情 / 选校)
 */

import { defineStore } from 'pinia'

/** 选校清单单项 — 后续可扩字段(添加时间、来源等) */
export interface WatchlistItem {
  /** 学校中文名(主键) */
  name: string
  /** 加入时间戳 */
  addedAt: number
}

const STORAGE_KEY = 'choosePhd.watchlist.v1'
const MAX = 6

export const useWatchlistStore = defineStore('watchlist', () => {
  // ============== state ==============
  const items = ref<WatchlistItem[]>([])
  const hydrated = ref(false)

  // ============== getters ==============
  const count = computed(() => items.value.length)
  const isFull = computed(() => items.value.length >= MAX)
  /** 仅名字列表(兼容老 API) */
  const list = computed<string[]>(() => items.value.map((i) => i.name))

  function has(name: string): boolean {
    return items.value.some((i) => i.name === name)
  }

  // ============== actions ==============
  /**
   * 添加一个学校。已存在 / 已满 → false,否则 true
   */
  function add(name: string): boolean {
    if (has(name)) return false
    if (isFull.value) {
      // FIFO:移除最早加入的
      items.value = items.value.slice(1)
    }
    items.value = [...items.value, { name, addedAt: Date.now() }]
    persist()
    return true
  }

  /**
   * 移除一个学校
   */
  function remove(name: string): void {
    const idx = items.value.findIndex((i) => i.name === name)
    if (idx >= 0) {
      items.value = [...items.value.slice(0, idx), ...items.value.slice(idx + 1)]
      persist()
    }
  }

  /**
   * 切换:有则移除,无则添加。返回最新状态(has 含义)
   */
  function toggle(name: string): boolean {
    if (has(name)) {
      remove(name)
      return false
    }
    return add(name)
  }

  /**
   * 清空
   */
  function clear(): void {
    items.value = []
    persist()
  }

  // ============== persistence ==============
  function persist(): void {
    if (!import.meta.client) return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value))
    } catch (e) {
      console.warn('[watchlist] persist failed', e)
    }
  }

  function hydrate(): void {
    if (hydrated.value) return
    if (!import.meta.client) return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as WatchlistItem[]
        if (Array.isArray(parsed)) {
          items.value = parsed
            .filter((i): i is WatchlistItem => !!i && typeof i.name === 'string')
            .slice(0, MAX)
        }
      }
    } catch (e) {
      console.warn('[watchlist] hydrate failed', e)
    }
    hydrated.value = true
  }

  return {
    // state
    items,
    // getters
    count,
    isFull,
    list,
    has,
    // actions
    add,
    remove,
    toggle,
    clear,
    // persistence
    hydrate,
    persist,
  }
})

/** FIFO 上限导出(供 UI 提示用) */
export const WATCHLIST_MAX = MAX
export const WATCHLIST_STORAGE_KEY = STORAGE_KEY
