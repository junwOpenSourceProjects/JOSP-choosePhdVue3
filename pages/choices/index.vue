<script setup lang="ts">
import { queryRankingStatus, insertOrUpdate, drawerData, initFromQs } from '~/lib/api/ranking'
import { insertChoosePhd } from '~/lib/api/choosePhd'
import type { RankingStatusDTO } from '~/types'
import { useWatchlist } from '~/composables/useWatchlist'
import { computeTrend } from '~/utils/format'

const { list: watchlist, remove: removeFromWatch, clear: clearWatch, count: watchCount } = useWatchlist()

useHead({ title: '我的选校 · 选校系统' })

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

const considerItems = [
  { value: 'all', label: '全部' },
  { value: 'yes', label: '考虑' },
  { value: 'no', label: '不考虑' }
]
const levelItems = [
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

async function updateField(item: RankingStatusDTO, field: keyof RankingStatusDTO, value: any) {
  const updated = { ...item, [field]: value }
  const idx = items.value.findIndex(i => i.universityNameChinese === item.universityNameChinese)
  if (idx === -1) return
  items.value[idx] = updated
  saving.value = true
  try {
    await insertOrUpdate(updated)
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

onMounted(load)

// ============== 等级 chip helper ==============
function rankTierClass(rank: number): 'gold' | 'silver' | 'bronze' | 'normal' {
  if (rank <= 3) return 'gold'
  if (rank <= 10) return 'silver'
  if (rank <= 50) return 'bronze'
  return 'normal'
}

// ============== Watchlist 对比表 (C 方案核心) ==============
const compareDims = [
  { key: 'qs', label: 'QS 综合' },
  { key: 'usnews', label: 'US News' },
  { key: 'qsCs', label: 'QS 学科' },
  { key: 'usnewsCs', label: 'US News 学科' }
]
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

const darkhorses = ref<{ name: string; trend: string }[]>([])

watch(() => watchlist.value, async (newList) => {
  for (const name of newList) {
    if (!compareData.value[name]) {
      await loadCompareForSchool(name)
    }
  }
  const trends: { name: string; trend: string }[] = []
  for (const name of newList) {
    try {
      const resp: any = await drawerData(name)
      const seriesList: any[] = resp?.chatData?.series ?? []
      const sorted = [...seriesList].sort((a, b) => (b?.name?.length ?? 0) - (a?.name?.length ?? 0))
      const qs = sorted.find((x) => (x?.name ?? '').endsWith('qs'))
      const arr = (qs?.data ?? []).map((x: any) => (typeof x === 'number' ? x : parseFloat(x))).filter((v: number) => !Number.isNaN(v) && v > 0)
      if (arr.length < 2) continue
      const t = computeTrend(arr)
      if (t.trend.includes('↑')) {
        const num = parseInt(t.trend.replace(/[^0-9]/g, '')) || 0
        trends.push({ name, trend: `${t.trend} (${t.tone})`, num })
      }
    } catch { /* skip */ }
  }
  darkhorses.value = trends.sort((a, b) => b.num - a.num).slice(0, 5).map(({ name, trend }) => ({ name, trend }))
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

const REGION_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  '亚洲':   { bg: '#fce7f3', fg: '#be185d', dot: '#ea5ec1' },
  '欧洲':   { bg: '#dbeafe', fg: '#1d4ed8', dot: '#1456f0' },
  '北美洲': { bg: '#fef3c7', fg: '#b45309', dot: '#f59e0b' },
  '南美洲': { bg: '#dcfce7', fg: '#15803d', dot: '#22c55e' },
  '大洋洲': { bg: '#ede9fe', fg: '#7c3aed', dot: '#a855f7' },
  '非洲':   { bg: '#fee2e2', fg: '#b91c1c', dot: '#ef4444' }
}
function regionStyle(r: string) {
  const c = REGION_COLORS[r]
  if (!c) return { background: 'var(--color-surface-soft)', color: 'var(--color-slate)' }
  return { background: c.bg, color: c.fg }
}
function regionColor(r: string): string { return REGION_COLORS[r]?.dot ?? '#8e8e93' }

const fields = [
  { key: 'statusQs', label: 'QS 综合' },
  { key: 'statusQsCs', label: 'QS CS' },
  { key: 'statusUsnews', label: 'US News' },
  { key: 'statusUsnewsCs', label: 'US CS' },
  { key: 'statusTotal', label: '整体', primary: true }
]
</script>

<template>
  <div>
    <!-- ============== Hero (紧凑) ============== -->
    <section class="choice-hero">
      <div class="page-container">
        <div class="choice-hero__eyebrow">
          <span class="choice-hero__dot" />
          <span class="choice-hero__eyebrow-text">决策工作台 · 3 步走完选校</span>
        </div>
        <h1 class="choice-hero__title">
          我的选<span class="choice-hero__title-accent">校</span>
        </h1>
        <p class="choice-hero__sub">标记「考虑 / 不考虑」, 按 4 维强度评估, 筛选符合预期的项目</p>
        <div class="choice-hero__cta">
          <UButton icon="i-lucide-refresh-cw" color="neutral" variant="outline" size="lg" label="刷新最新排名" :loading="saving" class="rounded-full" @click="seedRankings" />
          <UButton icon="i-lucide-zap" color="primary" variant="solid" size="lg" label="一键初始化" :loading="saving" class="rounded-full" @click="batchInit" />
        </div>
      </div>
    </section>

    <!-- ============== Watchlist 对比表 (C 方案核心) ============== -->
    <ClientOnly>
      <div v-if="watchlist.length > 0" class="page-container section-band">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <UIcon name="i-lucide-git-compare-arrows" class="size-5 text-brand" />
            <h2 class="t-h3">我的对比 · {{ watchlist.length }} 所</h2>
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
        <UCard class="compare-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0 overflow-hidden', body: 'p-0' }">
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
        </UCard>

        <div class="decision-grid">
          <UCard class="decision-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
            <div class="decision-card__head">
              <UIcon name="i-lucide-trending-up" class="size-4" style="color: #047857" />
              <span class="decision-card__eyebrow">DARKHORSE</span>
            </div>
            <h4 class="decision-card__title">黑马识别</h4>
            <div v-if="darkhorses.length" class="decision-card__list">
              <div v-for="d in darkhorses" :key="d.name" class="darkhorse-row">
                <span class="darkhorse-name">{{ d.name }}</span>
                <span class="darkhorse-trend">{{ d.trend }}</span>
              </div>
            </div>
            <div v-else class="empty-state-mini">暂无上升势头大学</div>
          </UCard>

          <UCard class="decision-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
            <div class="decision-card__head">
              <UIcon name="i-lucide-bar-chart-3" class="size-4" style="color: var(--color-brand-blue)" />
              <span class="decision-card__eyebrow">DELTA</span>
            </div>
            <h4 class="decision-card__title">4 维差异</h4>
            <div v-if="dimRanking.length" class="decision-card__list">
              <div v-for="r in dimRanking" :key="r.dim" class="dim-row">
                <span class="dim-label">{{ r.dim }}</span>
                <span class="dim-best">{{ r.best }}</span>
              </div>
            </div>
            <div v-else class="empty-state-mini">加载中...</div>
          </UCard>

          <UCard class="decision-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-6' }">
            <div class="decision-card__head">
              <UIcon name="i-lucide-clipboard-check" class="size-4" style="color: var(--color-brand-blue)" />
              <span class="decision-card__eyebrow">ACTIONS</span>
            </div>
            <h4 class="decision-card__title">决策辅助</h4>
            <div class="decision-card__list">
              <UButton icon="i-lucide-download" color="neutral" variant="outline" size="md" label="导出 CSV" class="rounded-full w-full justify-center" />
              <UButton icon="i-lucide-share-2" color="neutral" variant="outline" size="md" label="分享" class="rounded-full w-full justify-center" />
              <UButton to="/universities" icon="i-lucide-plus" color="primary" variant="solid" size="md" label="继续添加" class="rounded-full w-full justify-center" />
            </div>
          </UCard>
        </div>
      </div>
    </ClientOnly>

    <!-- ============== 4 stats + stepper ============== -->
    <div class="page-container section-band">
      <!-- 决策流程 stepper (3 step) -->
      <div class="stepper">
        <div class="stepper__step is-done">
          <div class="stepper__dot"><UIcon name="i-lucide-check" class="size-3.5" /></div>
          <span class="stepper__label">1. 导入</span>
        </div>
        <div class="stepper__line is-done" />
        <div class="stepper__step is-current">
          <div class="stepper__dot">2</div>
          <span class="stepper__label">2. 评估</span>
        </div>
        <div class="stepper__line" />
        <div class="stepper__step is-todo">
          <div class="stepper__dot">3</div>
          <span class="stepper__label">3. 决策</span>
        </div>
      </div>

      <!-- 0 数据时引导插画 -->
      <UCard v-if="stats.total === 0" class="empty-card" :ui="{ root: 'rounded-3xl border-2 border-dashed border-default bg-muted ring-0', body: 'p-12 text-center' }">
        <div class="mx-auto flex size-16 items-center justify-center rounded-full empty-card__icon">
          <UIcon name="i-lucide-target" class="size-7" />
        </div>
        <h3 class="t-h3 mt-4">还没有选校, 开始第一步</h3>
        <p class="t-body-sm text-muted mt-2">点上方「一键初始化」导入全部监控大学, 或先去「学校库」收藏几所</p>
        <div class="mt-6 flex flex-wrap justify-center gap-3">
          <UButton to="/universities" color="primary" variant="solid" size="md" icon="i-lucide-search" label="去学校库" class="rounded-full" />
          <UButton color="neutral" variant="outline" size="md" icon="i-lucide-zap" label="一键初始化" :loading="saving" class="rounded-full" @click="batchInit" />
        </div>
      </UCard>

      <!-- 4 stats -->
      <div v-else class="stats-grid">
        <StatCard label="清单总数" :value="stats.total" hint="所大学" :icon="'i-lucide-database'" primary />
        <StatCard label="正在考虑" :value="stats.considered" hint="已标记" :icon="'i-lucide-bookmark-check'" />
        <StatCard label="强校" :value="stats.strong" hint="QS/US 双强" :icon="'i-lucide-trophy'" />
        <StatCard label="中校" :value="stats.medium" hint="评估待定" :icon="'i-lucide-circle-help'" />
      </div>
    </div>

    <!-- ============== Filter toolbar ============== -->
    <div class="page-container section-band">
      <UCard class="toolbar-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-5' }">
        <div class="toolbar-row">
          <UInput v-model="search" icon="i-lucide-search" placeholder="搜索大学名称 (支持中/英)..." size="md" class="toolbar-search" />
          <USelectMenu v-model="sortBy" :items="sortByItems" value-key="value" size="md" class="toolbar-sort">
            <template #leading>
              <UIcon name="i-lucide-arrow-up-down" class="size-4" />
            </template>
          </USelectMenu>
        </div>
        <div class="toolbar-row toolbar-row--second">
          <div class="toolbar-group">
            <span class="t-caption-bold text-muted">状态</span>
            <UFieldGroup size="sm">
              <UButton
                v-for="c in considerItems"
                :key="c.value"
                :color="filterConsider === c.value ? 'primary' : 'neutral'"
                :variant="filterConsider === c.value ? 'solid' : 'outline'"
                :icon="c.value === 'yes' ? 'i-lucide-check' : c.value === 'no' ? 'i-lucide-x' : 'i-lucide-list'"
                :label="c.label"
                size="sm"
                class="rounded-full"
                @click="filterConsider = c.value as any"
              />
            </UFieldGroup>
          </div>
          <div class="toolbar-sep" />
          <div class="toolbar-group">
            <span class="t-caption-bold text-muted">强度</span>
            <UFieldGroup size="sm">
              <UButton
                v-for="c in levelItems"
                :key="c.value"
                :color="filterLevel === c.value ? 'primary' : 'neutral'"
                :variant="filterLevel === c.value ? 'solid' : 'outline'"
                :label="c.label"
                size="sm"
                class="rounded-full"
                @click="filterLevel = c.value as any"
              />
            </UFieldGroup>
          </div>
        </div>

        <UAlert v-if="error" color="warning" variant="subtle" :title="error" icon="i-lucide-alert-circle" class="mt-3" />
        <UAlert v-if="info" color="success" variant="subtle" :title="info" icon="i-lucide-check-circle" class="mt-3" />
      </UCard>
    </div>

    <!-- ============== Cards grid ============== -->
    <div class="page-container section-band">
      <UCard v-if="loading" class="loading-card" :ui="{ root: 'rounded-2xl border border-default bg-default ring-0', body: 'p-20 text-center' }">
        <UIcon name="i-lucide-loader" class="size-5 mx-auto animate-spin text-muted" />
        <p class="t-body-sm text-muted mt-3">加载中…</p>
      </UCard>

      <UEmpty
        v-else-if="filteredItems.length === 0"
        icon="i-lucide-inbox"
        title="没有匹配的大学"
        description="尝试调整过滤条件, 或点击「一键初始化」导入全部大学"
        size="sm"
      />

      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UCard
          v-for="item in filteredItems"
          :key="item.universityNameChinese"
          class="choice-card"
          :ui="{
            root: 'rounded-2xl border border-default bg-default ring-0 transition-all duration-200 hover:shadow-md',
            body: 'p-5'
          }"
        >
          <!-- Header -->
          <div class="choice-card__head">
            <div>
              <h3 class="t-h4">
                <NuxtLink :to="`/universities/${encodeURIComponent(item.universityNameChinese)}`" class="text-default hover:text-brand">{{ item.universityNameChinese }}</NuxtLink>
              </h3>
              <div class="choice-card__chips">
                <UBadge color="neutral" variant="soft" size="xs">
                  <UIcon name="i-lucide-map-pin" class="size-3" />
                  <span class="ml-1">{{ item.universityTags || '—' }}</span>
                </UBadge>
                <span
                  v-if="item.universityTagsState"
                  class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 t-caption-bold"
                  :style="regionStyle(item.universityTagsState)"
                >
                  <span class="size-1.5 rounded-full" :style="{ background: regionColor(item.universityTagsState) }" />
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
          <div class="choice-card__status">
            <div v-for="f in fields" :key="f.key" class="choice-card__field">
              <div class="choice-card__field-label">{{ f.label }}</div>
              <USelectMenu
                :model-value="(item as any)[f.key]"
                :items="statusLevelItems"
                value-key="value"
                size="xs"
                :ui="{ base: 'w-full' }"
                @update:model-value="(v: any) => updateField(item, f.key as any, v)"
              />
              <StatusChip v-if="(item as any)[f.key] != null" :level="statusLevel((item as any)[f.key])" />
            </div>
          </div>

          <!-- Footer actions -->
          <div class="choice-card__foot">
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
    </div>

    <!-- ============== 抽屉 (UDrawer) ============== -->
    <UDrawer v-model:open="drawerOpen" direction="right" :ui="{ content: 'max-w-2xl' }">
      <template #header>
        <div class="flex flex-col gap-1">
          <span class="t-caption-bold text-muted">历年排名趋势</span>
          <h3 class="t-h4">{{ drawerName }}</h3>
        </div>
      </template>
      <template #body>
        <div v-if="drawerLoading" class="flex items-center justify-center py-16">
          <UIcon name="i-lucide-loader" class="size-5 animate-spin text-muted" />
          <span class="ml-2 t-body-sm text-muted">加载中…</span>
        </div>
        <div v-else-if="drawerChart?.error" class="text-center py-16">
          <UIcon name="i-lucide-alert-triangle" class="size-7 mx-auto text-muted" />
          <p class="t-body-sm text-muted mt-2">{{ drawerChart.error }}</p>
        </div>
        <div v-else-if="drawerChart" class="drawer-chart">
          <ChartSvgChart :chart="drawerChart" :height="320" />
        </div>
      </template>
    </UDrawer>
  </div>
</template>

<style scoped>
/* Hero (DESIGN.md §hero-band-marketing 紧凑版) */
.choice-hero { padding: 64px 0 32px; background: var(--color-canvas); }
@media (min-width: 768px) {
  .choice-hero { padding: 96px 0 48px; }
}
.choice-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: var(--color-surface);
  border: 1px solid var(--color-hairline);
  margin-bottom: 20px;
}
.choice-hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand-coral);
}
.choice-hero__eyebrow-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.choice-hero__title {
  margin: 0;
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 600;
  line-height: 1.10;
  letter-spacing: -1.5px;
  color: var(--color-ink);
}
@media (min-width: 1024px) {
  .choice-hero__title { font-size: 80px; letter-spacing: -2px; }
}
.choice-hero__title-accent {
  font-style: italic;
  font-weight: 600;
  color: var(--color-brand-coral);
  position: relative;
  display: inline-block;
}
.choice-hero__title-accent::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-brand-coral);
  border-radius: 9999px;
  opacity: 0.85;
  z-index: -1;
}
.choice-hero__sub {
  margin: 16px 0 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--color-slate);
  line-height: 1.50;
}
.choice-hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}

@media (max-width: 640px) {
  .choice-hero { padding: 48px 0 24px; }
  .choice-hero__title { font-size: 40px; }
}

/* Section 间距 */
.section-band { margin-top: 24px; }
@media (min-width: 768px) {
  .section-band { margin-top: 32px; }
}

/* Stepper */
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 24px;
}
.stepper__step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.stepper__dot {
  width: 36px;
  height: 36px;
  border-radius: 9999px;
  background: var(--color-surface-soft);
  color: var(--color-stone);
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}
.stepper__step.is-done .stepper__dot {
  background: var(--color-brand-blue);
  color: var(--color-on-dark);
}
.stepper__step.is-current .stepper__dot {
  background: var(--color-brand-blue);
  color: var(--color-on-dark);
  box-shadow: 0 0 0 4px rgba(20, 86, 240, 0.15);
}
.stepper__step.is-todo { opacity: 0.5; }
.stepper__label { font-size: 11px; font-weight: 600; }
.stepper__line {
  width: 60px;
  height: 2px;
  background: var(--color-surface-soft);
  margin: 0 8px;
  margin-bottom: 16px;
}
.stepper__line.is-done { background: var(--color-brand-blue); }
@media (min-width: 768px) {
  .stepper__line { width: 120px; }
}

/* Empty card */
.empty-card__icon {
  background: rgba(20, 86, 240, 0.10);
  color: var(--color-brand-blue);
}

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}
@media (min-width: 768px) {
  .stats-grid { grid-template-columns: repeat(4, 1fr); gap: 16px; }
}

/* Toolbar */
.toolbar-card { background: var(--color-canvas); }
.toolbar-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.toolbar-row--second {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--color-hairline-soft);
}
.toolbar-search { flex: 1; min-width: 200px; }
.toolbar-sort { min-width: 160px; margin-left: auto; }
.toolbar-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.toolbar-sep {
  width: 1px;
  height: 20px;
  background: var(--color-hairline);
}

/* Choice card */
.choice-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.choice-card__chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
}
.choice-card__status {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
@media (min-width: 480px) {
  .choice-card__status { grid-template-columns: repeat(5, 1fr); }
}
.choice-card__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-start;
}
.choice-card__field-label {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-stone);
}
.choice-card__foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  padding-top: 12px;
  border-top: 1px solid var(--color-hairline-soft);
}

/* Drawer chart */
.drawer-chart { padding: 16px; background: var(--color-surface); border-radius: 16px; }

/* Watchlist compare grid */
.compare-grid {
  display: grid;
  grid-template-columns: 160px repeat(var(--school-count, 1), minmax(140px, 1fr));
}
.compare-grid__head {
  display: contents;
}
.compare-grid__head > .compare-grid__dim-label {
  padding: 16px 12px;
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
  padding: 12px;
  border-bottom: 1px solid var(--color-hairline);
  background: var(--color-surface);
  border-left: 1px solid var(--color-hairline-soft);
}
.compare-grid__school-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}
.compare-grid__remove {
  flex-shrink: 0;
}
.compare-grid__row {
  display: contents;
}
.compare-grid__row > .compare-grid__dim-label {
  padding: 14px 12px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-hairline-soft);
}
.compare-grid__cell {
  padding: 14px 12px;
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
  display: inline-block;
  font-family: 'Roboto', system-ui, sans-serif;
  font-size: 16px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 8px;
  letter-spacing: -0.01em;
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
  height: 24px;
  background: var(--color-hairline-soft);
  border-radius: 8px;
  animation: pulse 1.5s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Decision grid (DESIGN.md §card-base + eyebrow pattern) */
.decision-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 16px;
}
@media (max-width: 1024px) {
  .decision-grid {
    grid-template-columns: 1fr;
  }
}
.decision-card__head {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
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
  font-size: 24px;
  font-weight: 600;
  line-height: 1.30;
  color: var(--color-ink);
}
.decision-card__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.darkhorse-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(16, 185, 129, 0.06);
  border-radius: 8px;
}
.darkhorse-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink);
}
.darkhorse-trend {
  font-family: 'Roboto', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: #047857;
}
.dim-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: var(--color-surface);
  border-radius: 8px;
}
.dim-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-stone);
}
.dim-best {
  font-family: 'Roboto', system-ui, sans-serif;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink);
}
.empty-state-mini {
  font-size: 12px;
  color: var(--color-stone);
  padding: 8px 0;
}
</style>