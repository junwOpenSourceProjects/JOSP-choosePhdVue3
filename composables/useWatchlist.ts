/**
 * composables/useWatchlist.ts
 *
 * 选校清单的兼容包装。状态已迁移到 `stores/watchlist.ts`(Pinia),
 * 本文件保留**旧 API 调用形式**,让 T-01 之前的现有页面(详情页 / 学校库 / 选校)不需要改动。
 *
 * 旧 API 契约(完全保留):
 *   list     : Ref<string[]>                 — 名字数组的 Vue ref
 *   count()  : () => number                  — 同步取长度(模板里 `watchCount()` 仍要能 work)
 *   max      : number                        — FIFO 上限(5→6 同步增大)
 *   has(name): boolean                       — 同步判断
 *   add/remove/toggle/clear: function        — 同步副作用
 *
 * 新 API 在 T-02 / T-03 期间逐步切换到 `useWatchlistStore()`(Pinia 直接调用)。
 *
 * ⚠️ 不再 re-export `useWatchlistStore`(会被 Nuxt auto-import 识别为重复,
 *    见 `nuxt prepare` 警告)。需要 store 本身请直接 import `~/stores/watchlist` 或
 *    用 Nuxt auto-import(`useWatchlistStore` from `stores/watchlist.ts`)。
 */

export function useWatchlist() {
  const store = useWatchlistStore()

  // 首次进入触发 hydrate(SSR 跳过,client 端 lazy)
  if (import.meta.client) {
    store.hydrate()
  }

  // 把 store.items 投影为 string[] ref(老 API 类型)
  const list = computed<string[]>(() => store.list)

  return {
    /** 旧 API:Ref<string[]> 名字数组 */
    list,
    /** 旧 API:`watchCount()` 同步取长度(模板里 `> 0` 比较) */
    count: (): number => store.count,
    /** 旧 API:number FIFO 上限 */
    max: 6 as const,
    /** 旧 API:同步判断是否已加入 */
    has: (name: string): boolean => store.has(name),
    /** 旧 API:同步添加 */
    add: (name: string): boolean => store.add(name),
    /** 旧 API:同步移除 */
    remove: (name: string): void => store.remove(name),
    /** 旧 API:同步切换 */
    toggle: (name: string): boolean => store.toggle(name),
    /** 旧 API:同步清空 */
    clear: (): void => store.clear(),
  }
}
