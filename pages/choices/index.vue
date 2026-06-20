<script setup lang="ts">
import { queryRankingStatus, insertOrUpdate, insertBatch, drawerData, initFromQs } from '~/lib/api/ranking'
import { insertChoosePhd } from '~/lib/api/choosePhd'
import type { RankingStatusDTO } from '~/types'

useHead({ title: '我的选校 · 选校系统' })

// ============ 状态 ============
const items = ref<RankingStatusDTO[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const info = ref<string | null>(null)
const saving = ref(false)

const filterConsider = ref<'all' | 'yes' | 'no'>('all')
const filterLevel = ref<'all' | 'strong' | 'medium' | 'weak'>('all')
const search = ref('')
const sortBy = ref<'name' | 'qs' | 'total'>('total')

// 抽屉
const drawerOpen = ref(false)
const drawerName = ref('')
const drawerChart = ref<any>(null)
const drawerLoading = ref(false)

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await queryRankingStatus() as any
    items.value = Array.isArray(res) ? res : []
  } catch (e: any) {
    console.warn('[choices] load failed', e?.message)
    error.value = '后端不可达,显示示例数据'
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
    setTimeout(() => info.value = null, 3000)
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
    setTimeout(() => info.value = null, 3000)
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
    const data = await drawerData(name) as any
    drawerChart.value = data
  } catch (e) {
    console.warn('[choices] drawer failed', e)
    drawerChart.value = { error: '后端不可达' }
  } finally {
    drawerLoading.value = false
  }
}

// 过滤
const filteredItems = computed(() => {
  let arr = [...items.value]
  if (filterConsider.value === 'yes') arr = arr.filter(i => i.consider === 1)
  if (filterConsider.value === 'no') arr = arr.filter(i => i.consider === 0)
  if (filterLevel.value === 'strong') arr = arr.filter(i => (i.statusTotal ?? -1) === 2)
  if (filterLevel.value === 'medium') arr = arr.filter(i => (i.statusTotal ?? -1) === 1)
  if (filterLevel.value === 'weak') arr = arr.filter(i => (i.statusTotal ?? -1) === 0)
  if (search.value) {
    const kw = search.value.toLowerCase()
    arr = arr.filter(i => i.universityNameChinese?.toLowerCase().includes(kw))
  }
  // 排序
  if (sortBy.value === 'name') {
    arr.sort((a, b) => (a.universityNameChinese || '').localeCompare(b.universityNameChinese || '', 'zh'))
  } else if (sortBy.value === 'qs') {
    arr.sort((a, b) => (b.statusQs ?? -1) - (a.statusQs ?? -1))
  } else {
    arr.sort((a, b) => (b.statusTotal ?? -1) - (a.statusTotal ?? -1))
  }
  return arr
})

// 统计
const stats = computed(() => {
  const total = items.value.length
  const considered = items.value.filter(i => i.consider === 1).length
  const strong = items.value.filter(i => (i.statusTotal ?? -1) === 2).length
  const medium = items.value.filter(i => (i.statusTotal ?? -1) === 1).length
  return { total, considered, strong, medium }
})

onMounted(load)

// 把状态值 (0/1/2/null) 映射到 'strong'/'medium'/'weak'/'none' 供样式
function statusClass(v: number | null | undefined): string {
  if (v == null) return 'none'
  if (v === 2) return 'strong'
  if (v === 1) return 'medium'
  if (v === 0) return 'weak'
  return 'none'
}
</script>

<template>
  <div>
    <section class="page-hero page-container">
      <div class="page-hero__row">
        <div>
          <h1 class="page-hero__title">我的选校</h1>
          <p class="page-hero__sub">标记 · 评估 · 决策</p>
        </div>
        <div class="page-hero__actions">
          <button class="cta is-secondary" @click="seedRankings" :disabled="saving">
            <UIcon name="i-lucide-database" class="size-4" />
            <span style="margin-left: 6px">初始化排名数据</span>
          </button>
          <button class="cta" @click="batchInit" :disabled="saving">
            <UIcon name="i-lucide-zap" class="size-4" />
            <span style="margin-left: 6px">一键初始化</span>
          </button>
        </div>
      </div>
    </section>

    <!-- 4 stats -->
    <section class="page-container stats-section">
      <div class="stat-row">
        <div class="stat-mini">
          <div class="stat-mini__label">清单总数</div>
          <div class="stat-mini__value">{{ stats.total }}</div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini__label">正在考虑</div>
          <div class="stat-mini__value stat-mini__value--brand">{{ stats.considered }}</div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini__label">强校 (2)</div>
          <div class="stat-mini__value">{{ stats.strong }}</div>
        </div>
        <div class="stat-mini">
          <div class="stat-mini__label">中校 (1)</div>
          <div class="stat-mini__value">{{ stats.medium }}</div>
        </div>
      </div>
    </section>

    <!-- Filter toolbar -->
    <section class="page-container toolbar-section">
      <div class="toolbar">
        <div class="toolbar__search">
          <UIcon name="i-lucide-search" class="size-4 text-muted" />
          <input v-model="search" type="text" class="toolbar__input" placeholder="搜索大学名称..." />
        </div>

        <div class="toolbar__pills">
          <button class="pill" :class="{ 'is-active': filterConsider === 'all' }" @click="filterConsider = 'all'">全部</button>
          <button class="pill" :class="{ 'is-active': filterConsider === 'yes' }" @click="filterConsider = 'yes'">考虑</button>
          <button class="pill" :class="{ 'is-active': filterConsider === 'no' }" @click="filterConsider = 'no'">不考虑</button>
        </div>

        <div class="toolbar__pills">
          <button class="pill" :class="{ 'is-active': filterLevel === 'all' }" @click="filterLevel = 'all'">全部强弱</button>
          <button class="pill" :class="{ 'is-active': filterLevel === 'strong' }" @click="filterLevel = 'strong'">强</button>
          <button class="pill" :class="{ 'is-active': filterLevel === 'medium' }" @click="filterLevel = 'medium'">中</button>
          <button class="pill" :class="{ 'is-active': filterLevel === 'weak' }" @click="filterLevel = 'weak'">弱</button>
        </div>

        <label class="filter-label" style="margin-left: auto">
          <span>排序</span>
          <select v-model="sortBy" class="filter-select">
            <option value="total">按整体强度</option>
            <option value="qs">按 QS 强度</option>
            <option value="name">按名称</option>
          </select>
        </label>
      </div>

      <div v-if="error" class="banner-warn"><UIcon name="i-lucide-alert-circle" class="size-4" /><span>{{ error }}</span></div>
      <div v-if="info" class="banner-info"><UIcon name="i-lucide-check-circle" class="size-4" /><span>{{ info }}</span></div>
    </section>

    <!-- Cards grid -->
    <section class="page-container cards-section">
      <div v-if="loading" class="loading-state">
        <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
        <span>加载中...</span>
      </div>

      <div v-else-if="filteredItems.length === 0" class="empty-state">
        <UIcon name="i-lucide-inbox" class="size-10" />
        <div class="empty-state__title">没有匹配的大学</div>
        <div class="empty-state__desc">尝试调整过滤条件,或点击「一键初始化」导入全部大学</div>
      </div>

      <div v-else class="cards-grid">
        <div
          v-for="item in filteredItems"
          :key="item.universityNameChinese"
          class="choice-card"
          :class="{ 'is-consider': item.consider === 1 }"
        >
          <!-- Header -->
          <div class="choice-card__head">
            <div class="choice-card__title">
              <h3 class="choice-card__name">{{ item.universityNameChinese }}</h3>
              <div class="choice-card__meta">
                <span class="meta-chip">
                  <UIcon name="i-lucide-map-pin" class="size-3" />
                  {{ item.universityTags || '—' }}
                </span>
              </div>
            </div>
            <button
              class="consider-toggle"
              :class="{ 'is-on': item.consider === 1 }"
              :title="item.consider === 1 ? '点击改为不考虑' : '点击改为考虑'"
              @click="toggleConsider(item)"
            >
              <UIcon :name="item.consider === 1 ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'" class="size-4" />
              <span>{{ item.consider === 1 ? '考虑' : '不考虑' }}</span>
            </button>
          </div>

          <!-- 4 status fields -->
          <div class="choice-card__status">
            <div class="status-field">
              <div class="status-field__label">QS 综合</div>
              <select
                class="status-field__select"
                :class="`is-${statusClass(item.statusQs)}`"
                :value="item.statusQs ?? ''"
                @change="updateField(item, 'statusQs', $event.target.value === '' ? null : Number($event.target.value))"
              >
                <option value="">—</option>
                <option value="0">弱</option>
                <option value="1">中</option>
                <option value="2">强</option>
              </select>
            </div>
            <div class="status-field">
              <div class="status-field__label">QS CS</div>
              <select
                class="status-field__select"
                :class="`is-${statusClass(item.statusQsCs)}`"
                :value="item.statusQsCs ?? ''"
                @change="updateField(item, 'statusQsCs', $event.target.value === '' ? null : Number($event.target.value))"
              >
                <option value="">—</option>
                <option value="0">弱</option>
                <option value="1">中</option>
                <option value="2">强</option>
              </select>
            </div>
            <div class="status-field">
              <div class="status-field__label">US News</div>
              <select
                class="status-field__select"
                :class="`is-${statusClass(item.statusUsnews)}`"
                :value="item.statusUsnews ?? ''"
                @change="updateField(item, 'statusUsnews', $event.target.value === '' ? null : Number($event.target.value))"
              >
                <option value="">—</option>
                <option value="0">弱</option>
                <option value="1">中</option>
                <option value="2">强</option>
              </select>
            </div>
            <div class="status-field">
              <div class="status-field__label">US News CS</div>
              <select
                class="status-field__select"
                :class="`is-${statusClass(item.statusUsnewsCs)}`"
                :value="item.statusUsnewsCs ?? ''"
                @change="updateField(item, 'statusUsnewsCs', $event.target.value === '' ? null : Number($event.target.value))"
              >
                <option value="">—</option>
                <option value="0">弱</option>
                <option value="1">中</option>
                <option value="2">强</option>
              </select>
            </div>
            <div class="status-field status-field--total">
              <div class="status-field__label">整体</div>
              <select
                class="status-field__select status-field__select--total"
                :class="`is-${statusClass(item.statusTotal)}`"
                :value="item.statusTotal ?? ''"
                @change="updateField(item, 'statusTotal', $event.target.value === '' ? null : Number($event.target.value))"
              >
                <option value="">—</option>
                <option value="0">弱</option>
                <option value="1">中</option>
                <option value="2">强</option>
              </select>
            </div>
          </div>

          <!-- Footer -->
          <div class="choice-card__footer">
            <NuxtLink :to="`/universities/${encodeURIComponent(item.universityNameChinese)}`" class="card-link">
              <UIcon name="i-lucide-info" class="size-3" />
              详情
            </NuxtLink>
            <button class="card-link" @click="openDrawer(item.universityNameChinese)">
              <UIcon name="i-lucide-line-chart" class="size-3" />
              趋势
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Drawer -->
    <Teleport to="body">
      <Transition name="drawer-fade">
        <div v-if="drawerOpen" class="drawer-mask" @click.self="drawerOpen = false">
          <div class="drawer">
            <div class="drawer__head">
              <h2 class="drawer__title">{{ drawerName }} · 趋势</h2>
              <button class="drawer__close" @click="drawerOpen = false">
                <UIcon name="i-lucide-x" class="size-5" />
              </button>
            </div>
            <div class="drawer__body">
              <div v-if="drawerLoading" class="drawer__loading">
                <UIcon name="i-lucide-loader" class="size-6 animate-spin" />
              </div>
              <div v-else-if="drawerChart?.error" class="drawer__error">
                <UIcon name="i-lucide-alert-circle" class="size-5" />
                <span>{{ drawerChart.error }}</span>
              </div>
              <div v-else-if="drawerChart?.chatData" class="drawer__chart">
                <p class="text-muted">趋势数据来自后端 {{ drawerChart.chatData.series.length }} 条曲线</p>
                <pre class="drawer__pre">{{ JSON.stringify(drawerChart, null, 2) }}</pre>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.page-hero { padding: 56px 0 24px; }
.page-hero__row { display: flex; justify-content: space-between; align-items: flex-end; gap: 16px; flex-wrap: wrap; }
.page-hero__title { font-family: var(--font-display); font-size: 40px; font-weight: 600; color: var(--color-ink-1000); margin: 0; line-height: 1.1; letter-spacing: -0.02em; }
.page-hero__sub { font-size: 16px; color: var(--color-ink-700); margin: 8px 0 0; }
.page-hero__actions { display: flex; gap: 8px; }

.stats-section { padding: 8px 24px 0; }
.stat-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 768px) { .stat-row { grid-template-columns: repeat(2, 1fr); } }

.stat-mini {
  padding: 16px 20px;
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: 16px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}
.stat-mini__label { font-size: 12px; color: var(--color-ink-700); }
.stat-mini__value { font-family: var(--font-display); font-size: 28px; font-weight: 600; color: var(--color-ink-1000); margin-top: 4px; line-height: 1.1; }
.stat-mini__value--brand { color: var(--color-brand-900); }

.toolbar-section { padding: 16px 24px 0; }
.toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px 20px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}
.toolbar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--color-surface-1);
  border-radius: 12px;
  flex: 1;
  min-width: 200px;
}
.toolbar__input { flex: 1; border: 0; background: transparent; outline: none; font-size: 14px; }
.toolbar__input::placeholder { color: var(--color-ink-500); }

.toolbar__pills { display: flex; gap: 4px; padding: 4px; background: var(--color-surface-1); border-radius: 9999px; }
.toolbar__pills .pill { background: transparent; padding: 6px 12px; font-size: 12px; }
.toolbar__pills .pill:hover { background: rgba(0, 0, 0, 0.04); }
.toolbar__pills .pill.is-active { background: var(--color-brand-900); color: #fff; }

.filter-label { display: inline-flex; align-items: center; gap: 6px; font-size: 13px; color: var(--color-ink-700); }
.filter-select {
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-ink-1000);
  outline: none;
  cursor: pointer;
}

.banner-warn, .banner-info {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 13px;
  margin-top: 12px;
}
.banner-warn { background: #fef3c7; color: #92400e; }
.banner-info { background: var(--color-success-bg); color: #15803d; }

.cards-section { padding: 20px 24px 40px; }
.loading-state, .empty-state {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 80px 24px; background: #fff; border-radius: 20px; border: 1px solid var(--color-border-light);
  text-align: center; color: var(--color-ink-500);
}
.empty-state__title { font-family: var(--font-display); font-size: 18px; font-weight: 600; color: var(--color-ink-1000); }
.empty-state__desc { font-size: 13px; }

.cards-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 1fr;
  gap: 16px;
}
@media (max-width: 1280px) { .cards-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 960px) { .cards-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 640px) { .cards-grid { grid-template-columns: 1fr; } }

.choice-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 16px;
  padding: 20px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
  transition: all 240ms ease;
}
.choice-card.is-consider { border-color: var(--color-brand-200); box-shadow: rgba(20, 86, 240, 0.1) 0px 4px 12px; }
.choice-card:hover { transform: translateY(-2px); box-shadow: rgba(44, 30, 116, 0.16) 0px 0px 15px; }

.choice-card__head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
.choice-card__title { flex: 1; min-width: 0; }
.choice-card__name {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-ink-1000);
  margin: 0;
  line-height: 1.3;
}
.choice-card__meta { display: flex; gap: 6px; margin-top: 6px; }
.meta-chip {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 8px; background: var(--color-surface-2); border-radius: 9999px;
  font-size: 11px; color: var(--color-ink-700);
}

.consider-toggle {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-ink-700);
  cursor: pointer;
  transition: all 160ms ease;
  flex-shrink: 0;
}
.consider-toggle:hover { border-color: var(--color-brand-300); }
.consider-toggle.is-on {
  background: var(--color-brand-900);
  border-color: var(--color-brand-900);
  color: #fff;
}

.choice-card__status {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.status-field { display: flex; flex-direction: column; gap: 4px; }
.status-field--total .status-field__label { color: var(--color-brand-900); font-weight: 600; }
.status-field__label { font-size: 11px; color: var(--color-ink-700); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.status-field__select {
  padding: 6px 8px;
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink-1000);
  outline: none;
  cursor: pointer;
  transition: all 160ms ease;
  text-align: center;
}
.status-field__select:hover { border-color: var(--color-brand-300); }
.status-field__select:focus { border-color: var(--color-brand-900); box-shadow: 0 0 0 3px rgba(20, 86, 240, 0.12); }
.status-field__select--total {
  background: var(--color-brand-900);
  color: #fff;
  border-color: var(--color-brand-900);
}

/* 强/中/弱 三色语义化 */
.status-field__select.is-strong {
  background: #15803d;
  color: #fff;
  border-color: #15803d;
}
.status-field__select.is-medium {
  background: #d97706;
  color: #fff;
  border-color: #d97706;
}
.status-field__select.is-weak {
  background: #b91c1c;
  color: #fff;
  border-color: #b91c1c;
}
.status-field__select.is-none {
  background: #f3f4f6;
  color: var(--color-ink-500);
  border-color: var(--color-border);
}

.choice-card__footer {
  display: flex;
  gap: 12px;
  padding-top: 12px;
  margin-top: auto;
  border-top: 1px solid var(--color-border-light);
}
.card-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 0;
  background: transparent;
  border: 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--color-brand-900);
  text-decoration: none;
  cursor: pointer;
  transition: opacity 160ms ease;
}
.card-link:hover { opacity: 0.7; }

/* Drawer */
.drawer-mask {
  position: fixed; inset: 0; z-index: 100;
  background: rgba(0, 0, 0, 0.4);
  display: flex; justify-content: flex-end;
}
.drawer {
  width: 560px; max-width: 100vw;
  background: #fff;
  display: flex; flex-direction: column;
  box-shadow: rgba(0, 0, 0, 0.16) 0px 12px 32px;
}
.drawer__head {
  display: flex; justify-content: space-between; align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--color-border-light);
}
.drawer__title { font-family: var(--font-display); font-size: 18px; font-weight: 600; margin: 0; }
.drawer__close { background: transparent; border: 0; padding: 6px; border-radius: 8px; cursor: pointer; color: var(--color-ink-700); }
.drawer__close:hover { background: rgba(0, 0, 0, 0.05); }
.drawer__body { flex: 1; padding: 24px; overflow-y: auto; }
.drawer__loading { display: flex; justify-content: center; padding: 40px; color: var(--color-ink-500); }
.drawer__error { display: flex; align-items: center; gap: 8px; padding: 16px; background: #fef3c7; color: #92400e; border-radius: 12px; font-size: 13px; }
.drawer__chart { display: flex; flex-direction: column; gap: 12px; }
.drawer__pre {
  padding: 12px; background: var(--color-surface-1); border-radius: 8px;
  font-size: 11px; overflow: auto; max-height: 400px;
}

.drawer-fade-enter-active, .drawer-fade-leave-active { transition: opacity 200ms ease; }
.drawer-fade-enter-from, .drawer-fade-leave-to { opacity: 0; }
.drawer-fade-enter-active .drawer, .drawer-fade-leave-active .drawer { transition: transform 200ms ease; }
.drawer-fade-enter-from .drawer, .drawer-fade-leave-to .drawer { transform: translateX(100%); }

@media (max-width: 768px) {
  .choice-card__status { grid-template-columns: repeat(2, 1fr); }
  .status-field--total { grid-column: span 2; }
  .drawer { width: 100vw; }
  .toolbar { flex-direction: column; align-items: stretch; }
  .toolbar__pills { width: 100%; justify-content: space-between; }
  .toolbar__search { min-width: 0; }
  .filter-label { margin-left: 0 !important; }
}
</style>
