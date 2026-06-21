<script setup lang="ts">
import { queryRankingStatus, insertOrUpdate, drawerData, initFromQs } from '~/lib/api/ranking'
import { insertChoosePhd } from '~/lib/api/choosePhd'
import type { RankingStatusDTO } from '~/types'

useHead({ title: '我的选校 · 选校系统' })

// ============ 状态 ============
const items = ref<RankingStatusDTO[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const info = ref<string | null>(null)
const infoTimer = ref<ReturnType<typeof setTimeout> | null>(null)
const saving = ref(false)

function scheduleInfoClear(delay = 3000) {
  if (infoTimer.value) clearTimeout(infoTimer.value)
  infoTimer.value = setTimeout(() => info.value = null, delay)
}

onBeforeUnmount(() => {
  if (infoTimer.value) clearTimeout(infoTimer.value)
})

const filterConsider = ref<'all' | 'yes' | 'no'>('all')
const filterLevel = ref<'all' | 'strong' | 'medium' | 'weak'>('all')
const search = ref<string | undefined>(undefined)
const sortBy = ref<'name' | 'qs' | 'total'>('total')

// 抽屉 (UDrawer)
const drawerOpen = ref(false)
const drawerName = ref('')
const drawerChart = ref<any>(null)
const drawerLoading = ref(false)

const considerItems = [
  { value: 'all' as const, label: '全部' },
  { value: 'yes' as const, label: '考虑' },
  { value: 'no' as const, label: '不考虑' }
]

const levelItems = [
  { value: 'all' as const, label: '全部强度' },
  { value: 'strong' as const, label: '强' },
  { value: 'medium' as const, label: '中' },
  { value: 'weak' as const, label: '弱' }
]

const sortByItems = [
  { value: 'total' as const, label: '按整体强度' },
  { value: 'qs' as const, label: '按 QS 强度' },
  { value: 'name' as const, label: '按名称' }
]

const statusLevelItems = [
  { value: null, label: '—' },
  { value: 0, label: '弱' },
  { value: 1, label: '中' },
  { value: 2, label: '强' }
]

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await queryRankingStatus()
    items.value = Array.isArray(res) ? res : []
  } catch (e: any) {
    console.warn('[choices] load failed', e?.message)
    error.value = '后端不可达, 显示示例数据'
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
  const newVal = item.consider === 1 ? 0 : 1
  await updateField(item, 'consider', newVal)
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

async function openDrawer(name: string) {
  drawerName.value = name
  drawerOpen.value = true
  drawerLoading.value = true
  drawerChart.value = null
  try {
    const data = await drawerData(name)
    drawerChart.value = data
  } catch (e) {
    console.warn('[choices] drawer failed', e)
    drawerChart.value = { error: '后端不可达' }
  } finally {
    drawerLoading.value = false
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

function statusColor(v: number | null | undefined): 'primary' | 'secondary' | 'neutral' {
  if (v == null) return 'neutral'
  if (v === 2) return 'primary'
  if (v === 1) return 'secondary'
  return 'neutral'
}
</script>

<template>
  <div>
    <!-- Hero + 顶部 actions -->
    <UContainer class="py-10">
      <div class="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 class="text-[40px] font-medium leading-[1.10] tracking-tight text-default sm:text-5xl font-[var(--font-display)]">
            我的选校
          </h1>
          <p class="mt-2 text-base text-muted">标记 · 评估 · 决策</p>
        </div>
        <div class="flex flex-wrap gap-2">
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="outline"
            size="md"
            label="刷新最新排名"
            :loading="saving"
            :ui="{ leadingIcon: 'size-4' }"
            class="rounded-full"
            @click="seedRankings"
          />
          <UButton
            icon="i-lucide-zap"
            color="primary"
            variant="solid"
            size="md"
            label="一键初始化"
            :loading="saving"
            :ui="{ leadingIcon: 'size-4' }"
            class="rounded-full"
            @click="batchInit"
          />
        </div>
      </div>
    </UContainer>

    <!-- 4 stats + stepper 流程叙事 -->
    <UContainer class="pt-4">
      <!-- 决策流程 stepper (3 step, 当前脉冲光晕) -->
      <div class="mb-6 flex items-center justify-center gap-1">
        <div class="flex flex-col items-center gap-1.5">
          <div class="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-900)] text-sm font-bold text-white">
            <UIcon name="i-lucide-check" class="size-4" />
          </div>
          <span class="text-[11px] font-semibold" :style="{ color: 'var(--color-brand-900)' }">1. 导入</span>
        </div>
        <div class="mx-2 h-0.5 w-16 bg-[var(--color-brand-900)] sm:w-28" />
        <div class="flex flex-col items-center gap-1.5">
          <div class="relative flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-brand-900)] text-sm font-bold text-white shadow-lg" :style="{ boxShadow: '0 0 0 4px rgba(20,86,240,0.15), 0 0 0 8px rgba(20,86,240,0.08)' }">
            2
            <span class="absolute inset-0 animate-ping rounded-full bg-[var(--color-brand-900)] opacity-30" />
          </div>
          <span class="text-[11px] font-semibold" :style="{ color: 'var(--color-brand-900)' }">2. 评估</span>
        </div>
        <div class="mx-2 h-0.5 w-16 bg-default sm:w-28" />
        <div class="flex flex-col items-center gap-1.5 opacity-50">
          <div class="flex h-9 w-9 items-center justify-center rounded-full border-2 border-default bg-white text-sm font-bold text-muted">3</div>
          <span class="text-[11px] font-medium text-muted">3. 决策</span>
        </div>
      </div>
      <!-- 4 stats card (0 数据 → 引导插画; > 0 → 数字 + mini 进度条) -->
      <UCard v-if="stats.total === 0" :ui="{ root: 'rounded-2xl border-2 border-dashed border-default bg-[var(--color-surface-1)]', body: 'p-12 text-center space-y-4' }">
        <div class="mx-auto flex size-16 items-center justify-center rounded-full" :style="{ background: 'rgba(20, 86, 240, 0.08)' }">
          <UIcon name="i-lucide-target" class="size-4" :style="{ color: 'var(--color-brand-900)' }" />
        </div>
        <h3 class="text-lg font-semibold text-default font-[var(--font-display)]">还没有选校, 开始第一步</h3>
        <p class="text-sm text-muted">点上方「一键初始化」导入全部监控大学, 或先去「学校库」收藏几所</p>
        <div class="flex flex-wrap justify-center gap-2">
          <UButton to="/universities" color="primary" variant="solid" size="md" icon="i-lucide-search" label="去学校库" :ui="{ leadingIcon: 'size-4' }" class="rounded-full" />
          <UButton color="neutral" variant="outline" size="md" icon="i-lucide-zap" label="一键初始化" :loading="saving" :ui="{ leadingIcon: 'size-4' }" class="rounded-full" @click="batchInit" />
        </div>
      </UCard>
      <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <UCard
          v-for="s in [
            { key: 'total', label: '清单总数', value: stats.total, color: '#222', hint: '所大学', percent: 100 },
            { key: 'considered', label: '正在考虑', value: stats.considered, color: 'var(--color-brand-900)', hint: '已标记', percent: stats.total ? Math.round(stats.considered / stats.total * 100) : 0 },
            { key: 'strong', label: '强校', value: stats.strong, color: '#22c55e', hint: 'QS/US 双强', percent: stats.total ? Math.round(stats.strong / stats.total * 100) : 0 },
            { key: 'medium', label: '中校', value: stats.medium, color: '#f59e0b', hint: '评估待定', percent: stats.total ? Math.round(stats.medium / stats.total * 100) : 0 }
          ]"
          :key="s.key"
          :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-4' }"
        >
          <div class="flex items-center justify-between text-xs text-muted">
            <span>{{ s.label }}</span>
            <span class="font-mono text-[10px]">{{ s.percent }}%</span>
          </div>
          <div class="mt-1.5 flex items-baseline gap-1">
            <span class="text-[28px] font-semibold leading-none font-[var(--font-display)]" :style="{ color: s.color }">{{ s.value }}</span>
            <span class="text-[11px] text-muted">{{ s.hint }}</span>
          </div>
          <div class="mt-2 h-1 w-full overflow-hidden rounded-full bg-[var(--color-surface-2)]">
            <div class="h-full rounded-full transition-all" :style="{ width: s.percent + '%', background: s.color }" />
          </div>
        </UCard>
      </div>
    </UContainer>

    <!-- Filter toolbar (视觉分组) -->
    <UContainer class="pt-4">
      <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-4 sm:p-5 space-y-3' }">
        <div class="flex flex-wrap items-center gap-3">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="搜索大学名称 (支持中/英)..."
            size="md"
            class="flex-1 min-w-[200px]"
            :ui="{ leadingIcon: 'size-4' }"
          />
          <USelectMenu
            v-model="sortBy"
            :items="sortByItems"
            value-key="value"
            size="md"
            class="ml-auto min-w-[160px]"
          >
            <template #leading>
              <UIcon name="i-lucide-arrow-up-down" class="size-4" />
            </template>
          </USelectMenu>
        </div>
        <div class="flex flex-wrap items-center gap-4 border-t border-default pt-3">
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted">状态</span>
            <UFieldGroup size="sm">
              <UButton
                v-for="c in considerItems"
                :key="c.value"
                :color="filterConsider === c.value ? 'primary' : 'neutral'"
                :variant="filterConsider === c.value ? 'solid' : 'outline'"
                :icon="c.value === 'yes' ? 'i-lucide-check' : c.value === 'no' ? 'i-lucide-x' : 'i-lucide-list'"
                :label="c.label"
                size="sm"
                :ui="{ leadingIcon: 'size-3.5' }"
                class="rounded-full"
                @click="filterConsider = c.value"
              />
            </UFieldGroup>
          </div>
          <div class="h-5 w-px bg-default" />
          <div class="flex items-center gap-2">
            <span class="text-[11px] font-semibold uppercase tracking-wider text-muted">强度</span>
            <UFieldGroup size="sm">
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
            </UFieldGroup>
          </div>
        </div>

        <UAlert
          v-if="error"
          color="warning"
          variant="subtle"
          :title="error"
          icon="i-lucide-alert-circle"
        />
        <UAlert
          v-if="info"
          color="success"
          variant="subtle"
          :title="info"
          icon="i-lucide-check-circle"
        />
      </UCard>
    </UContainer>

    <!-- Cards grid -->
    <UContainer class="py-6">
      <UCard v-if="loading" :ui="{ root: 'rounded-2xl border border-default bg-white', body: 'p-20 flex flex-col items-center justify-center gap-3 text-muted' }">
        <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
        <span class="text-sm">加载中…</span>
      </UCard>

      <UEmpty
        v-else-if="filteredItems.length === 0"
        icon="i-lucide-inbox"
        title="没有匹配的大学"
        description="尝试调整过滤条件, 或点击「一键初始化」导入全部大学"
        size="sm"
      >
        <template #footer>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <UCard :ui="{ root: 'rounded-2xl border border-default bg-[var(--color-surface-1)] opacity-60', body: 'p-4 text-left space-y-2' }">
              <div class="flex items-center gap-2">
                <span class="rank-badge rank-badge--gold">1</span>
                <span class="text-sm font-semibold text-default">麻省理工学院</span>
              </div>
              <div class="text-[11px] text-muted">示意卡 · 真实数据需初始化</div>
            </UCard>
            <UCard :ui="{ root: 'rounded-2xl border border-default bg-[var(--color-surface-1)] opacity-60', body: 'p-4 text-left space-y-2' }">
              <div class="flex items-center gap-2">
                <span class="rank-badge rank-badge--silver">5</span>
                <span class="text-sm font-semibold text-default">斯坦福大学</span>
              </div>
              <div class="text-[11px] text-muted">示意卡 · 真实数据需初始化</div>
            </UCard>
            <UCard :ui="{ root: 'rounded-2xl border border-default bg-[var(--color-surface-1)] opacity-60', body: 'p-4 text-left space-y-2' }">
              <div class="flex items-center gap-2">
                <span class="rank-badge rank-badge--bronze">23</span>
                <span class="text-sm font-semibold text-default">清华大学</span>
              </div>
              <div class="text-[11px] text-muted">示意卡 · 真实数据需初始化</div>
            </UCard>
          </div>
        </template>
      </UEmpty>

      <div v-else class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <UCard
          v-for="item in filteredItems"
          :key="item.universityNameChinese"
          :ui="{
            root: 'rounded-2xl border border-default bg-white shadow-sm transition-shadow duration-200 hover:shadow-md',
            body: 'p-5 space-y-4'
          }"
        >
          <!-- Header -->
          <div class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-lg font-semibold leading-tight text-default font-[var(--font-display)]">
                {{ item.universityNameChinese }}
              </h3>
              <div class="mt-1.5 flex items-center gap-1.5">
                <UBadge color="neutral" variant="soft" size="xs">
                  <UIcon name="i-lucide-map-pin" class="size-3.5" />
                  <span class="ml-1">{{ item.universityTags || '—' }}</span>
                </UBadge>
              </div>
            </div>
            <UButton
              :icon="item.consider === 1 ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'"
              :color="item.consider === 1 ? 'primary' : 'neutral'"
              :variant="item.consider === 1 ? 'solid' : 'outline'"
              size="sm"
              :ui="{ leadingIcon: 'size-3.5' }"
              class="rounded-full"
              :label="item.consider === 1 ? '考虑' : '不考虑'"
              @click="toggleConsider(item)"
            />
          </div>

          <!-- 4 status fields + overall -->
          <div class="grid grid-cols-5 gap-2">
            <div v-for="f in [
              { key: 'statusQs', label: 'QS 综合' },
              { key: 'statusQsCs', label: 'QS CS' },
              { key: 'statusUsnews', label: 'US News' },
              { key: 'statusUsnewsCs', label: 'US CS' },
              { key: 'statusTotal', label: '整体', primary: true }
            ]" :key="f.key" class="space-y-1.5">
              <div class="text-[11px] font-medium text-muted">{{ f.label }}</div>
              <USelectMenu
                :model-value="(item as any)[f.key]"
                :items="statusLevelItems"
                value-key="value"
                size="xs"
                :ui="{ base: 'w-full' }"
                @update:model-value="(v: any) => updateField(item, f.key as any, v)"
              />
              <UBadge
                v-if="(item as any)[f.key] != null"
                :color="statusColor((item as any)[f.key])"
                :variant="(item as any)[f.key] === 2 ? 'solid' : 'subtle'"
                size="xs"
                :label="(item as any)[f.key] === 2 ? '强' : (item as any)[f.key] === 1 ? '中' : '弱'"
                block
              />
            </div>
          </div>

          <!-- Footer actions -->
          <div class="flex items-center gap-2 border-t border-default pt-3">
            <UButton
              :to="`/universities/${encodeURIComponent(item.universityNameChinese)}`"
              icon="i-lucide-info"
              color="neutral"
              variant="ghost"
              size="xs"
              label="详情"
              :ui="{ leadingIcon: 'size-3.5' }"
              class="rounded-full"
            />
            <UButton
              icon="i-lucide-line-chart"
              color="neutral"
              variant="ghost"
              size="xs"
              label="趋势"
              :ui="{ leadingIcon: 'size-3.5' }"
              class="rounded-full"
              @click="openDrawer(item.universityNameChinese)"
            />
          </div>
        </UCard>
      </div>
    </UContainer>

    <!-- Drawer (UDrawer) -->
    <UDrawer v-model:open="drawerOpen" direction="right" :ui="{ content: 'w-full sm:max-w-2xl' }">
      <template #header>
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-default font-[var(--font-display)]">{{ drawerName }} · 趋势</h2>
        </div>
      </template>
      <template #body>
        <div class="space-y-4 p-2">
          <div v-if="drawerLoading" class="flex h-40 items-center justify-center text-muted">
            <UIcon name="i-lucide-loader" class="size-4 animate-spin" />
            <span class="ml-2 text-sm">加载中…</span>
          </div>
          <UAlert
            v-else-if="drawerChart?.error"
            color="warning"
            variant="subtle"
            :title="drawerChart.error"
            icon="i-lucide-alert-circle"
          />
          <div v-else-if="drawerChart?.chatData" class="space-y-3">
            <p class="text-sm text-muted">趋势数据来自后端 {{ drawerChart.chatData.series.length }} 条曲线</p>
            <div class="rounded-xl bg-[var(--color-surface-1)] p-4">
              <ChartSvgChart :chart="drawerChart" :height="300" />
            </div>
          </div>
        </div>
      </template>
    </UDrawer>
  </div>
</template>
