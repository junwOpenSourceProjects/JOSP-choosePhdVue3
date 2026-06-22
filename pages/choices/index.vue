<script setup lang="ts">
import { queryRankingStatus, insertOrUpdate, drawerData, initFromQs } from '~/lib/api/ranking'
import { insertChoosePhd } from '~/lib/api/choosePhd'
import type { RankingStatusDTO } from '~/types'
import { useWatchlist } from '~/composables/useWatchlist'
import { computeTrend } from '~/utils/format'
import { regionStyle, regionDot } from '~/utils/region'

const { list: watchlist, remove: removeFromWatch, clear: clearWatch, count: watchCount } = useWatchlist()

useHead({ title: '我的选校 · 选校系统' })

definePageMeta({
  layout: 'default',
})

// ============== 状态 ==============
const items = ref<RankingStatusDTO[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const info = ref<string | null>(null)
const infoTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const saving = ref(false)

function scheduleInfoClear(delay = 3000) {
  if (infoTimer.value) clearTimeout(infoTimer.value)
  infoTimer.value = setTimeout(() => { info.value = null }, delay)
}
onBeforeUnmount(() => { if (infoTimer.value) clearTimeout(infoTimer.value) })

// ============== 过滤 / 排序 ==============
const filterConsider = ref<'all' | 'yes' | 'no'>('all')
const filterLevel = ref<'all' | 'strong' | 'medium' | 'weak'>('all')
const search = ref<string | undefined>(undefined)
const sortBy = ref<'total' | 'qs' | 'name'>('total')

const considerItems: { value: 'all' | 'yes' | 'no'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'yes', label: '考虑' },
  { value: 'no', label: '不考虑' }
]
const levelItems: { value: 'all' | 'strong' | 'medium' | 'weak'; label: string }[] = [
  { value: 'all', label: '全部强度' },
  { value: 'strong', label: '强' },
  { value: 'medium', label: '中' },
  { value: 'weak', label: '弱' }
]
const sortByItems = [
  { value: 'total', label: '按整体强度' },
  { value: 'qs', label: '按 QS 强度' },
  { value: 'name', label: '按名称' }
]
const statusLevelItems = [
  { value: null, label: '—' },
  { value: 0, label: '弱' },
  { value: 1, label: '中' },
  { value: 2, label: '强' }
]

// ============== 抽屉 ==============
const drawerOpen = ref(false)
const drawerName = ref('')
const drawerChart = ref<any>(null)
const drawerLoading = ref(false)

async function openDrawer(n: string) {
  drawerName.value = n
  drawerOpen.value = true
  drawerLoading.value = true
  drawerChart.value = null
  try {
    drawerChart.value = await drawerData(n)
  } catch {
    drawerChart.value = { error: '后端不可达' }
  } finally {
    drawerLoading.value = false
  }
}

// ============== 加载 ==============
async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await queryRankingStatus()
    items.value = Array.isArray(res) ? res : []
  } catch (e: any) {
    console.warn('[choices] load failed', e?.message)
    error.value = '后端不可达, 显示示意数据'
    items.value = generateMock()
  } finally {
    loading.value = false
  }
}

function generateMock(): RankingStatusDTO[] {
  return [
    { id: 1, universityNameChinese: '麻省理工学院', universityTags: '美国', universityTagsState: '北美洲', rankingQs: '', rankingQsCs: '', rankingUsnews: '', rankingUsnewsCs: '', statusQs: 2, statusQsCs: 2, statusUsnews: 2, statusUsnewsCs: 2, statusTotal: 2, consider: 1 },
    { id: 2, universityNameChinese: '斯坦福大学', universityTags: '美国', universityTagsState: '北美洲', rankingQs: '', rankingQsCs: '', rankingUsnews: '', rankingUsnewsCs: '', statusQs: 2, statusQsCs: 2, statusUsnews: 2, statusUsnewsCs: 2, statusTotal: 2, consider: 1 },
    { id: 3, universityNameChinese: '剑桥大学', universityTags: '英国', universityTagsState: '欧洲', rankingQs: '', rankingQsCs: '', rankingUsnews: '', rankingUsnewsCs: '', statusQs: 2, statusQsCs: 2, statusUsnews: 1, statusUsnewsCs: 1, statusTotal: 2, consider: 1 },
    { id: 4, universityNameChinese: '清华大学', universityTags: '中国', universityTagsState: '亚洲', rankingQs: '', rankingQsCs: '', rankingUsnews: '', rankingUsnewsCs: '', statusQs: 1, statusQsCs: 1, statusUsnews: 1, statusUsnewsCs: 1, statusTotal: 1, consider: 1 },
    { id: 5, universityNameChinese: '北京大学', universityTags: '中国', universityTagsState: '亚洲', rankingQs: '', rankingQsCs: '', rankingUsnews: '', rankingUsnewsCs: '', statusQs: 1, statusQsCs: 1, statusUsnews: 1, statusUsnewsCs: 1, statusTotal: 1, consider: 0 },
    { id: 6, universityNameChinese: '东京大学', universityTags: '日本', universityTagsState: '亚洲', rankingQs: '', rankingQsCs: '', rankingUsnews: '', rankingUsnewsCs: '', statusQs: 1, statusQsCs: 0, statusUsnews: 0, statusUsnewsCs: 0, statusTotal: 0, consider: 1 },
    { id: 7, universityNameChinese: '新加坡国立大学', universityTags: '新加坡', universityTagsState: '亚洲', rankingQs: '', rankingQsCs: '', rankingUsnews: '', rankingUsnewsCs: '', statusQs: 2, statusQsCs: 2, statusUsnews: 1, statusUsnewsCs: 1, statusTotal: 2, consider: 1 },
    { id: 8, universityNameChinese: '苏黎世联邦理工', universityTags: '瑞士', universityTagsState: '欧洲', rankingQs: '', rankingQsCs: '', rankingUsnews: '', rankingUsnewsCs: '', statusQs: 2, statusQsCs: 1, statusUsnews: 2, statusUsnewsCs: 2, statusTotal: 2, consider: 0 }
  ]
}

async function updateField(item: RankingStatusDTO, field: keyof RankingStatusDTO, value: unknown) {
  const updated = { ...item, [field]: value }
  const idx = items.value.findIndex(i => i.universityNameChinese === item.universityNameChinese)
  if (idx === -1) return
  items.value[idx] = updated as RankingStatusDTO
  saving.value = true
  try {
    await insertOrUpdate(updated as RankingStatusDTO)
  } catch (e: any) {
    console.warn('[choices] update failed', e?.message)
    info.value = `已本地更新 (${item.universityNameChinese}) · 后端不可达`
  } finally {
    saving.value = false
  }
}

async function toggleConsider(item: RankingStatusDTO) {
  await updateField(item, 'consider', item.consider === 1 ? 0 : 1)
}

async function batchInit() {
  if (!confirm('确认一键初始化全部监控大学?\n这会把全部 university_consider 表的大学添加到清单。')) return
  saving.value = true
  error.value = null
  try {
    await insertChoosePhd()
    await load()
    info.value = '初始化成功'
    scheduleInfoClear()
  } catch (e: any) {
    error.value = '初始化失败: ' + (e?.message || '后端不可达')
  } finally {
    saving.value = false
  }
}

async function seedRankings() {
  if (!confirm('确认从 QS 数据初始化汇总表和 ECharts 数据?\n需要管理员登录。')) return
  saving.value = true
  error.value = null
  try {
    const res: any = await initFromQs()
    info.value = res?.data || '初始化成功'
    scheduleInfoClear()
  } catch (e: any) {
    const msg = e?.data?.msg || e?.message || '后端不可达'
    if (msg.includes('登录') || msg.includes('401')) {
      error.value = '请先登录管理员账号'
      await navigateTo('/login')
    } else {
      error.value = '初始化失败: ' + msg
    }
  } finally {
    saving.value = false
  }
}

const filteredItems = computed(() => {
  let arr = [...items.value]
  if (filterConsider.value === 'yes') arr = arr.filter(i => i.consider === 1)
  if (filterConsider.value === 'no') arr = arr.filter(i => i.consider === 0)
  if (filterLevel.value === 'strong') arr = arr.filter(i => (i.statusTotal ?? -1) === 2)
  if (filterLevel.value === 'medium') arr = arr.filter(i => (i.statusTotal ?? -1) === 1)
  if (filterLevel.value === 'weak') arr = arr.filter(i => (i.statusTotal ?? -1) === 0)
  if (search.value) {
    const kw = search.value.toLowerCase()
    arr = arr.filter(i => (i.universityNameChinese || '').toLowerCase().includes(kw))
  }
  if (sortBy.value === 'name') {
    arr.sort((a, b) => (a.universityNameChinese || '').localeCompare(b.universityNameChinese || '', 'zh'))
  } else if (sortBy.value === 'qs') {
    arr.sort((a, b) => (b.statusQs ?? -1) - (a.statusQs ?? -1))
  } else {
    arr.sort((a, b) => (b.statusTotal ?? -1) - (a.statusTotal ?? -1))
  }
  return arr
})

const stats = computed(() => {
  const total = items.value.length
  const considered = items.value.filter(i => i.consider === 1).length
  const strong = items.value.filter(i => (i.statusTotal ?? -1) === 2).length
  const medium = items.value.filter(i => (i.statusTotal ?? -1) === 1).length
  return { total, considered, strong, medium }
})

const progressPercent = computed(() => {
  const total = stats.value.total || 1
  return Math.min(100, Math.round((stats.value.considered / total) * 100))
})

onMounted(load)

// ============== 等级 chip helper ==============
function rankTierClass(rank: number): 'gold' | 'silver' | 'bronze' | 'normal' {
  if (rank <= 3) return 'gold'
  if (rank <= 10) return 'silver'
  if (rank <= 50) return 'bronze'
  return 'normal'
}

// ============== Watchlist 对比表 ==============
const compareDims = [
  { key: 'qs', label: 'QS 综合' },
  { key: 'usnews', label: 'US News' },
  { key: 'qsCs', label: 'QS 学科' },
  { key: 'usnewsCs', label: 'US News 学科' }
] as const
const compareData = ref<Record<string, any>>({})
const compareLoading = ref<Record<string, boolean>>({})

async function loadCompareForSchool(name: string) {
  compareLoading.value[name] = true
  try {
    const resp: any = await drawerData(name)
    const seriesList: any[] = resp?.chatData?.series ?? []
    const sorted = [...seriesList].sort((a, b) => (b?.name?.length ?? 0) - (a?.name?.length ?? 0))
    const find = (suffix: string) => {
      const s = sorted.find((x) => (x?.name ?? '').endsWith(suffix))
      if (!s?.data) return null
      const valid = (s.data as any[]).map((x) => (typeof x === 'number' ? x : parseFloat(x))).filter((v: number) => !Number.isNaN(v) && v > 0)
      return valid.length ? valid[valid.length - 1] : null
    }
    compareData.value[name] = {
      qs: find('qs'),
      usnews: find('usnews'),
      qsCs: find('qs_cs'),
      usnewsCs: find('usnews_cs')
    }
  } catch {
    compareData.value[name] = { qs: null, usnews: null, qsCs: null, usnewsCs: null }
  } finally {
    compareLoading.value[name] = false
  }
}

interface Darkhorse {
  name: string
  trend: string
  num: number
}

const darkhorses = ref<Darkhorse[]>([])

watch(() => watchlist.value, async (newList) => {
  for (const name of newList) {
    if (!compareData.value[name]) {
      await loadCompareForSchool(name)
    }
  }
  const trends: Darkhorse[] = []
  for (const name of newList) {
    try {
      const resp: any = await drawerData(name)
      const seriesList: any[] = resp?.chatData?.series ?? []
      const sorted = [...seriesList].sort((a, b) => (b?.name?.length ?? 0) - (a?.name?.length ?? 0))
      const qs = sorted.find((x) => (x?.name ?? '').endsWith('qs'))
      const arr = (qs?.data ?? []).map((x: any) => (typeof x === 'number' ? x : parseFloat(x))).filter((v: number) => !Number.isNaN(v) && v > 0)
      if (arr.length < 2) continue
      const t = computeTrend(arr)
      if (t.tone === 'up') {
        const num = Math.abs(t.trend)
        trends.push({ name, trend: `↑ ${num} (${t.tone})`, num })
      }
    } catch { /* skip */ }
  }
  darkhorses.value = trends.sort((a, b) => b.num - a.num).slice(0, 5)
}, { immediate: true })

const dimRanking = computed(() => {
  const out: { dim: string; best: string }[] = []
  for (const d of compareDims) {
    let bestRank = Infinity
    let bestName = '—'
    for (const name of watchlist.value) {
      const r = compareData.value[name]?.[d.key]
      if (r != null && r < bestRank) {
        bestRank = r
        bestName = `${name} #${r}`
      }
    }
    if (bestName !== '—') out.push({ dim: d.label, best: bestName })
  }
  return out
})

function statusLevel(level: number | null | undefined): 'weak' | 'medium' | 'strong' | null {
  if (level == null) return null
  if (level === 2) return 'strong'
  if (level === 1) return 'medium'
  return 'weak'
}

function regionColor(r: string): string { return regionDot(r) }

const fields = [
  { key: 'statusQs', label: 'QS 综合' },
  { key: 'statusQsCs', label: 'QS CS' },
  { key: 'statusUsnews', label: 'US News' },
  { key: 'statusUsnewsCs', label: 'US CS' },
  { key: 'statusTotal', label: '整体', primary: true }
] as const

type FieldKey = typeof fields[number]['key']

function getFieldValue(item: RankingStatusDTO, key: FieldKey): number | null {
  const v = item[key]
  return typeof v === 'number' ? v : null
}
</script>

<template>
  <div class="choices-page">
    <!-- ============== Hero (dark) ============== -->
    <section class="choices-hero">
      <div class="page-container">
        <div class="choices-hero__eyebrow">
          <span class="choices-hero__dot" />
          <span class="choices-hero__eyebrow-text">决策工作台</span>
        </div>
        <h1 class="choices-hero__title">
          我的选校
        </h1>
        <p class="choices-hero__sub">
          标记「考虑 / 不考虑」，按 4 维强度评估，筛选符合预期的项目
        </p>
        <div class="choices-hero__cta">
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            size="md"
            label="刷新最新排名"
            :loading="saving"
            class="choices-hero__btn-secondary rounded-full"
            @click="seedRankings"
          />
          <UButton
            icon="i-lucide-zap"
            color="primary"
            variant="solid"
            size="md"
            label="一键初始化"
            :loading="saving"
            class="choices-hero__btn-primary rounded-full"
            @click="batchInit"
          />
        </div>

        <!-- 4 glass stats -->
        <div class="choices-hero__stats">
          <div class="choices-hero__stat">
            <div class="choices-hero__stat-value">{{ stats.total }}</div>
            <div class="choices-hero__stat-label">清单总数</div>
          </div>
          <div class="choices-hero__stat">
            <div class="choices-hero__stat-value">{{ stats.considered }}</div>
            <div class="choices-hero__stat-label">正在考虑</div>
          </div>
          <div class="choices-hero__stat">
            <div class="choices-hero__stat-value">{{ stats.strong }}</div>
            <div class="choices-hero__stat-label">强校</div>
          </div>
          <div class="choices-hero__stat">
            <div class="choices-hero__stat-value">{{ stats.medium }}</div>
            <div class="choices-hero__stat-label">中校</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============== Watchlist 对比表 ============== -->
    <ClientOnly>
      <section v-if="watchlist.length > 0" class="page-container section-band">
        <div class="section-head">
          <div class="section-head__left">
            <UIcon name="i-lucide-git-compare-arrows" class="size-4 text-brand-blue" />
            <h2 class="t-h3">我的对比</h2>
            <span class="watch-count-pill">{{ watchlist.length }} 所</span>
          </div>
          <UButton
            icon="i-lucide-trash-2"
            color="neutral"
            variant="ghost"
            size="sm"
            label="清空"
            class="rounded-full"
            @click="clearWatch"
          />
        </div>

        <UCard class="compare-card" :ui="{ root: 'rounded-3xl border border-ink bg-white ring-0 overflow-hidden', body: 'p-0' }">
          <div class="compare-scroll">
            <div class="compare-grid" :style="{ '--school-count': watchlist.length }">
              <div class="compare-grid__head">
                <div class="compare-grid__dim-label">排名体系</div>
                <div v-for="name in watchlist" :key="name" class="compare-grid__school-head">
                  <div class="compare-grid__school-name">{{ name }}</div>
                  <UButton
                    icon="i-lucide-x"
                    color="neutral"
                    variant="ghost"
                    size="xs"
                    class="rounded-full compare-grid__remove"
                    @click="removeFromWatch(name)"
                  />
                </div>
              </div>
              <div v-for="d in compareDims" :key="d.key" class="compare-grid__row">
                <div class="compare-grid__dim-label">{{ d.label }}</div>
                <div v-for="name in watchlist" :key="name + d.key" class="compare-grid__cell">
                  <div v-if="compareLoading[name]" class="compare-grid__skeleton" />
                  <div v-else-if="compareData[name]?.[d.key]" class="compare-grid__rank">
                    <span :class="['compare-grid__rank-num', `compare-grid__rank-num--${rankTierClass(compareData[name][d.key])}`]">
                      #{{ compareData[name][d.key] }}
                    </span>
                  </div>
                  <div v-else class="compare-grid__rank-num compare-grid__rank-num--none">—</div>
                </div>
              </div>
            </div>
          </div>
        </UCard>

        <!-- 决策辅助卡 -->
        <div class="decision-grid">
          <UCard class="decision-card" :ui="{ root: 'rounded-3xl border border-ink bg-white ring-0', body: 'p-6 sm:p-8' }">
            <div class="decision-card__head">
              <UIcon name="i-lucide-trending-up" class="size-4 text-emerald-600" />
              <span class="decision-card__eyebrow">DARKHORSE</span>
            </div>
            <h4 class="decision-card__title">黑马识别</h4>
            <div v-if="darkhorses.length" class="decision-card__list">
              <div v-for="d in darkhorses" :key="d.name" class="decision-card__row decision-card__row--up">
                <span class="decision-card__row-label">{{ d.name }}</span>
                <span class="decision-card__row-value text-emerald-600">{{ d.trend }}</span>
              </div>
            </div>
            <div v-else class="decision-card__empty">暂无上升势头大学</div>
          </UCard>

          <UCard class="decision-card" :ui="{ root: 'rounded-3xl border border-ink bg-white ring-0', body: 'p-6 sm:p-8' }">
            <div class="decision-card__head">
              <UIcon name="i-lucide-bar-chart-3" class="size-4 text-brand-blue" />
              <span class="decision-card__eyebrow">DELTA</span>
            </div>
            <h4 class="decision-card__title">4 维差异</h4>
            <div v-if="dimRanking.length" class="decision-card__list">
              <div v-for="r in dimRanking" :key="r.dim" class="decision-card__row">
                <span class="decision-card__row-label">{{ r.dim }}</span>
                <span class="decision-card__row-value">{{ r.best }}</span>
              </div>
            </div>
            <div v-else class="decision-card__empty">加载中...</div>
          </UCard>

          <UCard class="decision-card" :ui="{ root: 'rounded-3xl border border-ink bg-white ring-0', body: 'p-6 sm:p-8' }">
            <div class="decision-card__head">
              <UIcon name="i-lucide-clipboard-check" class="size-4 text-brand-blue" />
              <span class="decision-card__eyebrow">ACTIONS</span>
            </div>
            <h4 class="decision-card__title">决策辅助</h4>
            <div class="decision-card__actions">
              <UButton icon="i-lucide-download" color="neutral" variant="outline" size="md" label="导出 CSV" class="rounded-full w-full justify-center" />
              <UButton icon="i-lucide-share-2" color="neutral" variant="outline" size="md" label="分享" class="rounded-full w-full justify-center" />
              <UButton to="/universities" icon="i-lucide-plus" color="primary" variant="solid" size="md" label="继续添加" class="rounded-full w-full justify-center" />
            </div>
          </UCard>
        </div>
      </section>
    </ClientOnly>

    <!-- ============== 简洁进度状态条 ============== -->
    <section v-if="stats.total > 0" class="page-container section-band">
      <UCard :ui="{ root: 'rounded-2xl border border-ink bg-white ring-0', body: 'p-5 sm:p-6' }">
        <div class="status-bar">
          <div class="status-bar__header">
            <span class="status-bar__title">选校进度</span>
            <span class="status-bar__percent">{{ progressPercent }}%</span>
          </div>
          <div class="status-bar__track">
            <div class="status-bar__fill" :style="{ width: `${progressPercent}%` }" />
          </div>
          <div class="status-bar__labels">
            <span>已导入 {{ stats.total }} 所</span>
            <span>考虑 {{ stats.considered }} 所</span>
            <span>强校 {{ stats.strong }} 所</span>
          </div>
        </div>
      </UCard>
    </section>

    <!-- ============== 空状态 ============== -->
    <section v-if="stats.total === 0" class="page-container section-band">
      <UCard :ui="{ root: 'rounded-3xl border-2 border-dashed border-ink bg-surface ring-0', body: 'p-12 sm:p-16 text-center' }">
        <div class="empty-illustration">
          <UIcon name="i-lucide-target" class="size-5" />
        </div>
        <h3 class="t-h2 mt-6">还没有选校，开始第一步</h3>
        <p class="t-body text-muted mt-3 max-w-md mx-auto">
          点上方「一键初始化」导入全部监控大学，或先去「学校库」收藏几所心仪院校
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-3">
          <UButton to="/universities" color="primary" variant="solid" size="md" icon="i-lucide-search" label="去学校库" class="rounded-full" />
          <UButton color="neutral" variant="outline" size="md" icon="i-lucide-zap" label="一键初始化" :loading="saving" class="rounded-full" @click="batchInit" />
        </div>
      </UCard>
    </section>

    <!-- ============== Filter toolbar ============== -->
    <section v-if="stats.total > 0" class="page-container section-band">
      <div class="filter-bar">
        <div class="filter-bar__row">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="搜索大学名称..."
            size="md"
            class="filter-bar__search"
          />
          <USelectMenu
            v-model="sortBy"
            :items="sortByItems"
            value-key="value"
            size="md"
            class="filter-bar__sort"
          >
            <template #leading>
              <UIcon name="i-lucide-arrow-up-down" class="size-4" />
            </template>
          </USelectMenu>
        </div>
        <div class="filter-bar__row filter-bar__row--filters">
          <div class="filter-bar__group">
            <span class="filter-bar__label">状态</span>
            <div class="filter-bar__pills">
              <UButton
                v-for="c in considerItems"
                :key="c.value"
                :color="filterConsider === c.value ? 'primary' : 'neutral'"
                :variant="filterConsider === c.value ? 'solid' : 'outline'"
                :icon="c.value === 'yes' ? 'i-lucide-check' : c.value === 'no' ? 'i-lucide-x' : 'i-lucide-list'"
                :label="c.label"
                size="sm"
                class="rounded-full"
                @click="filterConsider = c.value"
              />
            </div>
          </div>
          <div class="filter-bar__sep" />
          <div class="filter-bar__group">
            <span class="filter-bar__label">强度</span>
            <div class="filter-bar__pills">
              <UButton
                v-for="c in levelItems"
                :key="c.value"
                :color="filterLevel === c.value ? 'primary' : 'neutral'"
                :variant="filterLevel === c.value ? 'solid' : 'outline'"
                :label="c.label"
                size="sm"
                class="rounded-full"
                @click="filterLevel = c.value"
              />
            </div>
          </div>
        </div>

        <UAlert v-if="error" color="warning" variant="subtle" :title="error" icon="i-lucide-alert-circle" class="mt-4" />
        <UAlert v-if="info" color="success" variant="subtle" :title="info" icon="i-lucide-check-circle" class="mt-4" />
      </div>
    </section>

    <!-- ============== Cards grid ============== -->
    <section v-if="stats.total > 0" class="page-container section-band section-band--last">
      <UCard v-if="loading" :ui="{ root: 'rounded-3xl border border-ink bg-white ring-0', body: 'p-20 text-center' }">
        <UIcon name="i-lucide-loader" class="size-4 mx-auto animate-spin text-muted" />
        <p class="t-body-sm text-muted mt-3">加载中…</p>
      </UCard>

      <AppEmpty
        v-else-if="filteredItems.length === 0"
        icon="i-lucide-inbox"
        title="没有匹配的大学"
        description="尝试调整过滤条件，或点击「一键初始化」导入全部大学"
        size="md"
      />

      <div v-else class="school-grid">
        <UCard
          v-for="item in filteredItems"
          :key="item.universityNameChinese"
          class="school-card"
          :ui="{
            root: 'rounded-3xl border border-ink bg-white ring-0 transition-all duration-200 hover:-translate-y-1 hover:shadow-hover',
            body: 'p-6'
          }"
        >
          <!-- Header -->
          <div class="school-card__head">
            <div>
              <h3 class="t-h4">
                <NuxtLink :to="`/universities/${encodeURIComponent(item.universityNameChinese)}`" class="school-card__name">
                  {{ item.universityNameChinese }}
                </NuxtLink>
              </h3>
              <div class="school-card__chips">
                <UBadge color="neutral" variant="soft" size="xs" class="school-card__chip">
                  <UIcon name="i-lucide-map-pin" class="size-4" />
                  <span>{{ item.universityTags || '—' }}</span>
                </UBadge>
                <span
                  v-if="item.universityTagsState"
                  class="school-card__region-chip"
                  :style="regionStyle(item.universityTagsState)"
                >
                  <span class="school-card__region-dot" :style="{ background: regionColor(item.universityTagsState) }" />
                  {{ item.universityTagsState }}
                </span>
              </div>
            </div>
            <UButton
              :icon="item.consider === 1 ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'"
              :color="item.consider === 1 ? 'primary' : 'neutral'"
              :variant="item.consider === 1 ? 'solid' : 'outline'"
              size="sm"
              :label="item.consider === 1 ? '考虑' : '不考虑'"
              class="rounded-full"
              @click="toggleConsider(item)"
            />
          </div>

          <!-- 5 status fields -->
          <div class="school-card__status">
            <div v-for="f in fields" :key="f.key" class="school-card__field">
              <div class="school-card__field-label">{{ f.label }}</div>
              <div class="school-card__field-input">
                <USelectMenu
                  :model-value="getFieldValue(item, f.key)"
                  :items="statusLevelItems"
                  value-key="value"
                  size="xs"
                  class="w-full"
                  @update:model-value="(v) => updateField(item, f.key, v)"
                />
              </div>
              <StatusChip v-if="getFieldValue(item, f.key) != null" :level="statusLevel(getFieldValue(item, f.key))" />
            </div>
          </div>

          <!-- Footer actions -->
          <div class="school-card__foot">
            <UButton
              :to="`/universities/${encodeURIComponent(item.universityNameChinese)}`"
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-info"
              label="详情"
              class="rounded-full"
            />
            <UButton
              color="neutral"
              variant="ghost"
              size="xs"
              icon="i-lucide-line-chart"
              label="趋势"
              class="rounded-full"
              @click="openDrawer(item.universityNameChinese)"
            />
            <UButton
              v-if="item.consider === 1"
              color="primary"
              variant="ghost"
              size="xs"
              icon="i-lucide-arrow-right"
              label="下一步"
              class="rounded-full ml-auto"
              to="/charts"
            />
          </div>
        </UCard>
      </div>
    </section>

    <!-- ============== 抽屉 ============== -->
    <UDrawer v-model:open="drawerOpen" direction="right" :ui="{ content: 'max-w-2xl' }">
      <template #header>
        <div class="flex flex-col gap-1">
          <span class="t-caption-bold text-muted">历年排名趋势</span>
          <h3 class="t-h4">{{ drawerName }}</h3>
        </div>
      </template>
      <template #body>
        <div v-if="drawerLoading" class="flex items-center justify-center py-16">
          <UIcon name="i-lucide-loader" class="size-4 animate-spin text-muted" />
          <span class="ml-2 t-body-sm text-muted">加载中…</span>
        </div>
        <div v-else-if="drawerChart?.error" class="text-center py-16">
          <UIcon name="i-lucide-alert-triangle" class="size-5 mx-auto text-muted" />
          <p class="t-body-sm text-muted mt-2">{{ drawerChart.error }}</p>
        </div>
        <div v-else-if="drawerChart" class="drawer-chart">
          <VChart :chart="drawerChart" :height="320" />
        </div>
      </template>
    </UDrawer>
  </div>
</template>

<style scoped>
/* ============== Page ============== */
.choices-page {
  width: 100%;
  min-height: 100vh;
  background: var(--color-canvas);
  color: var(--color-ink);
}

/* ============== Hero (dark) ============== */
.choices-hero {
  width: 100%;
  background: var(--color-ink);
  color: var(--color-on-dark);
  padding: 72px 0 48px;
}
@media (min-width: 768px) {
  .choices-hero { padding: 96px 0 64px; }
}

.choices-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.16);
  margin-bottom: 20px;
}
.choices-hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand-coral);
}
.choices-hero__eyebrow-text {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.choices-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.03em;
  color: var(--color-on-dark);
}
@media (min-width: 1024px) {
  .choices-hero__title { font-size: 80px; }
}

.choices-hero__sub {
  margin: 16px 0 0;
  font-size: 18px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.65);
  line-height: 1.5;
  max-width: 640px;
}

.choices-hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}
.choices-hero__btn-primary {
  background: var(--color-on-dark) !important;
  color: var(--color-ink) !important;
  border-color: var(--color-on-dark) !important;
}
.choices-hero__btn-primary:hover {
  background: rgba(255, 255, 255, 0.9) !important;
}
.choices-hero__btn-secondary {
  background: transparent !important;
  color: var(--color-on-dark) !important;
  border-color: rgba(255, 255, 255, 0.35) !important;
}
.choices-hero__btn-secondary:hover {
  background: rgba(255, 255, 255, 0.08) !important;
}

/* 4 glass stats */
.choices-hero__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 48px;
}
@media (min-width: 768px) {
  .choices-hero__stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 64px;
  }
}
.choices-hero__stat {
  padding: 20px 24px;
  border-radius: var(--radius-xl);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(4px);
}
.choices-hero__stat-value {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 600;
  line-height: 1.2;
  letter-spacing: -0.02em;
  color: var(--color-on-dark);
}
.choices-hero__stat-label {
  margin-top: 4px;
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

@media (max-width: 640px) {
  .choices-hero { padding: 56px 0 40px; }
  .choices-hero__title { font-size: 40px; }
  .choices-hero__stat { padding: 16px 20px; }
  .choices-hero__stat-value { font-size: 28px; }
}

/* ============== Section spacing ============== */
.section-band {
  margin-top: 48px;
}
@media (min-width: 768px) {
  .section-band { margin-top: 64px; }
}
@media (min-width: 1024px) {
  .section-band { margin-top: 80px; }
}
.section-band--last {
  margin-bottom: 120px;
}

/* ============== Section head ============== */
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.section-head__left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.watch-count-pill {
  display: inline-flex;
  align-items: center;
  height: 24px;
  padding: 0 10px;
  border-radius: 9999px;
  background: rgba(20, 86, 240, 0.10);
  color: var(--color-brand-blue);
  font-size: 11px;
  font-weight: 700;
  font-family: var(--font-data);
  letter-spacing: 0.02em;
}

/* ============== Compare table ============== */
.compare-scroll {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}
.compare-grid {
  display: grid;
  grid-template-columns: 140px repeat(var(--school-count, 1), minmax(140px, 1fr));
  min-width: max-content;
}
.compare-grid__head {
  display: contents;
}
.compare-grid__head > .compare-grid__dim-label {
  padding: 18px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-hairline);
}
.compare-grid__school-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-hairline);
  background: var(--color-surface);
  border-left: 1px solid var(--color-hairline-soft);
}
.compare-grid__school-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.compare-grid__remove {
  flex-shrink: 0;
  min-width: 28px;
  min-height: 28px;
}
.compare-grid__row {
  display: contents;
}
.compare-grid__row > .compare-grid__dim-label {
  padding: 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-hairline-soft);
}
.compare-grid__cell {
  padding: 16px;
  border-bottom: 1px solid var(--color-hairline-soft);
  border-left: 1px solid var(--color-hairline-soft);
  display: flex;
  align-items: center;
  justify-content: center;
}
.compare-grid__rank {
  display: flex;
  align-items: center;
  gap: 8px;
}
.compare-grid__rank-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 26px;
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 600;
  padding: 0 10px;
  border-radius: 6px;
  letter-spacing: -0.01em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}
.compare-grid__rank-num--gold {
  background: rgba(245, 158, 11, 0.12);
  color: #b45309;
}
.compare-grid__rank-num--silver {
  background: rgba(59, 130, 246, 0.12);
  color: #1d4ed8;
}
.compare-grid__rank-num--bronze {
  background: rgba(20, 184, 166, 0.12);
  color: #0f766e;
}
.compare-grid__rank-num--normal {
  color: var(--color-ink);
}
.compare-grid__rank-num--none {
  color: var(--color-stone);
  font-weight: 400;
}
.compare-grid__skeleton {
  width: 56px;
  height: 26px;
  background: var(--color-hairline-soft);
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ============== Decision cards ============== */
.decision-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 20px;
}
@media (min-width: 1024px) {
  .decision-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}
.decision-card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.decision-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}
.decision-card__head {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.decision-card__eyebrow {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-stone);
  letter-spacing: 0.08em;
}
.decision-card__title {
  margin: 0 0 16px;
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-ink);
  letter-spacing: -0.01em;
}
.decision-card__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.decision-card__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 12px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
}
.decision-card__row--up {
  background: rgba(16, 185, 129, 0.06);
}
.decision-card__row-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
}
.decision-card__row-value {
  font-family: var(--font-data);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink);
}
.decision-card__empty {
  font-size: 13px;
  color: var(--color-stone);
  padding: 8px 0;
}
.decision-card__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ============== Status bar ============== */
.status-bar__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.status-bar__title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-ink);
}
.status-bar__percent {
  font-family: var(--font-data);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-brand-blue);
}
.status-bar__track {
  width: 100%;
  height: 6px;
  background: var(--color-surface-soft);
  border-radius: var(--radius-pill);
  overflow: hidden;
}
.status-bar__fill {
  height: 100%;
  background: var(--color-brand-blue);
  border-radius: var(--radius-pill);
  transition: width 300ms ease;
}
.status-bar__labels {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 13px;
  color: var(--color-slate);
}

/* ============== Empty state ============== */
.empty-illustration {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(20, 86, 240, 0.10);
  color: var(--color-brand-blue);
}

/* ============== Filter toolbar ============== */
.filter-bar {
  background: var(--color-canvas);
  border: 1px solid var(--color-ink);
  border-radius: var(--radius-2xl);
  padding: 16px;
}
@media (min-width: 768px) {
  .filter-bar { padding: 20px; }
}
.filter-bar__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.filter-bar__row--filters {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-hairline-soft);
}
.filter-bar__search {
  flex: 1;
  min-width: 200px;
}
.filter-bar__sort {
  min-width: 170px;
}
.filter-bar__group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.filter-bar__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.filter-bar__pills {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}
.filter-bar__sep {
  width: 1px;
  height: 20px;
  background: var(--color-hairline);
}
@media (max-width: 640px) {
  .filter-bar__sep { display: none; }
}

/* ============== School cards ============== */
.school-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 768px) {
  .school-grid { grid-template-columns: repeat(2, 1fr); gap: 20px; }
}
.school-card:hover {
  border-color: var(--color-ink);
}
.school-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.school-card__name {
  color: var(--color-ink);
  text-decoration: none;
  transition: color 150ms ease;
}
.school-card__name:hover {
  color: var(--color-brand-blue);
}
.school-card__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
}
.school-card__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.school-card__region-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  border-radius: var(--radius-pill);
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.5;
}
.school-card__region-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
}
.school-card__status {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 20px;
}
@media (min-width: 640px) {
  .school-card__status { grid-template-columns: repeat(5, 1fr); }
}
.school-card__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.school-card__field-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-stone);
}
.school-card__field-input {
  width: 100%;
}
.school-card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--color-hairline-soft);
}

/* ============== Drawer chart ============== */
.drawer-chart {
  padding: 16px;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
}

/* ============== Utility overrides ============== */
:deep(.u-button) {
  transition: all 160ms ease;
}
</style>
