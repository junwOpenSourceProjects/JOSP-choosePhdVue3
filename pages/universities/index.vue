<script setup lang="ts">
import { queryAll, queryAllQs, queryAllEcharts } from '~/lib/api/university'
import type { UniversityAllDTO, UniversityRankingsAll, RankVariant } from '~/types'
import { RANK_VARIANT_SHORT_MAP } from '~/types'

useHead({ title: '学校库 · 选校系统' })

// ============ 状态 ============
const search = ref('')
const rankVariant = ref<RankVariant>('qs')      // qs / usnews / all
const tagState = ref<string>('')                 // 洲
const tag = ref<string>('')                      // 国家
const maxRank = ref<number>(100)                 // 排名上限
const currentPage = ref(1)
const pageSize = 20
const sortBy = ref<'rank' | 'name' | 'country'>('rank')

// 数据
const tableData = ref<UniversityAllDTO[]>([])
const total = ref(0)
const loading = ref(false)
const error = ref<string | null>(null)

// 派生: 过滤选项 (从全表 first page 拉 200 条统计 unique 值)
const tagStateOptions = ref<string[]>([])
const tagOptions = computed(() => {
  if (!tagState.value) return []
  const set = new Set<string>()
  for (const row of tableData.value) {
    if (row.universityTagsState === tagState.value && row.universityTags) {
      set.add(row.universityTags)
    }
  }
  return Array.from(set).sort()
})

// ============ 加载数据 ============
async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await queryAllQs({
      page: currentPage.value,
      limit: pageSize,
      rankVariant: rankVariant.value,
      universityTagsState: tagState.value || undefined,
      universityTags: tag.value || undefined,
      currentRank: maxRank.value
    }) as any
    const records = res?.records ?? res?.data?.records ?? []
    tableData.value = records
    total.value = res?.total ?? res?.data?.total ?? 0
  } catch (e: any) {
    console.warn('[universities] load failed', e?.message)
    error.value = '后端不可达,显示 mock 数据'
    // mock fallback
    tableData.value = generateMock()
    total.value = 50
  } finally {
    loading.value = false
  }
}

function generateMock(): UniversityAllDTO[] {
  return [
    { universityNameChinese: '麻省理工学院', universityTags: '美国', universityTagsState: '北美洲', rankingYear: '2025', currentQsAllRank: 1, currentQsComputerRank: 1, currentUsnewsAllRank: 2, currentUsnewsComputerRank: 1 },
    { universityNameChinese: '斯坦福大学', universityTags: '美国', universityTagsState: '北美洲', rankingYear: '2025', currentQsAllRank: 5, currentQsComputerRank: 3, currentUsnewsAllRank: 3, currentUsnewsComputerRank: 2 },
    { universityNameChinese: '哈佛大学', universityTags: '美国', universityTagsState: '北美洲', rankingYear: '2025', currentQsAllRank: 4, currentQsComputerRank: 12, currentUsnewsAllRank: 1, currentUsnewsComputerRank: 16 },
    { universityNameChinese: '牛津大学', universityTags: '英国', universityTagsState: '欧洲', rankingYear: '2025', currentQsAllRank: 3, currentQsComputerRank: 5, currentUsnewsAllRank: 4, currentUsnewsComputerRank: 5 },
    { universityNameChinese: '剑桥大学', universityTags: '英国', universityTagsState: '欧洲', rankingYear: '2025', currentQsAllRank: 2, currentQsComputerRank: 4, currentUsnewsAllRank: 8, currentUsnewsComputerRank: 7 },
    { universityNameChinese: '苏黎世联邦理工学院', universityTags: '瑞士', universityTagsState: '欧洲', rankingYear: '2025', currentQsAllRank: 7, currentQsComputerRank: 8, currentUsnewsAllRank: 5, currentUsnewsComputerRank: 4 },
    { universityNameChinese: '清华大学', universityTags: '中国', universityTagsState: '亚洲', rankingYear: '2025', currentQsAllRank: 14, currentQsComputerRank: 10, currentUsnewsAllRank: 16, currentUsnewsComputerRank: 8 },
    { universityNameChinese: '北京大学', universityTags: '中国', universityTagsState: '亚洲', rankingYear: '2025', currentQsAllRank: 17, currentQsComputerRank: 11, currentUsnewsAllRank: 22, currentUsnewsComputerRank: 13 },
    { universityNameChinese: '东京大学', universityTags: '日本', universityTagsState: '亚洲', rankingYear: '2025', currentQsAllRank: 28, currentQsComputerRank: 32, currentUsnewsAllRank: 86, currentUsnewsComputerRank: 64 },
    { universityNameChinese: '新加坡国立大学', universityTags: '新加坡', universityTagsState: '亚洲', rankingYear: '2025', currentQsAllRank: 8, currentQsComputerRank: 6, currentUsnewsAllRank: 27, currentUsnewsComputerRank: 9 }
  ]
}

// 客户端过滤 (search 实时)
const filteredData = computed(() => {
  if (!search.value) return tableData.value
  const kw = search.value.toLowerCase()
  return tableData.value.filter(r => r.universityNameChinese?.toLowerCase().includes(kw))
})

// 排序
const sortedData = computed(() => {
  const arr = [...filteredData.value]
  if (sortBy.value === 'rank') {
    arr.sort((a, b) => getRankValue(a) - getRankValue(b))
  } else if (sortBy.value === 'name') {
    arr.sort((a, b) => (a.universityNameChinese || '').localeCompare(b.universityNameChinese || '', 'zh'))
  } else if (sortBy.value === 'country') {
    arr.sort((a, b) => (a.universityTags || '').localeCompare(b.universityTags || '', 'zh'))
  }
  return arr
})

function getRankValue(row: UniversityAllDTO): number {
  if (rankVariant.value === 'qs') return row.currentQsAllRank ?? 9999
  if (rankVariant.value === 'usnews') return row.currentUsnewsAllRank ?? 9999
  return Math.min(row.currentQsAllRank ?? 9999, row.currentUsnewsAllRank ?? 9999)
}

function getRankField(row: UniversityAllDTO, which: 'all' | 'cs'): number | null {
  if (rankVariant.value === 'qs') {
    return which === 'all' ? row.currentQsAllRank : row.currentQsComputerRank
  }
  if (rankVariant.value === 'usnews') {
    return which === 'all' ? row.currentUsnewsAllRank : row.currentUsnewsComputerRank
  }
  // 'all' rankVariant: 综合 = 最小值
  if (which === 'all') {
    const a = row.currentQsAllRank, b = row.currentUsnewsAllRank
    if (a == null && b == null) return null
    if (a == null) return b
    if (b == null) return a
    return Math.min(a, b)
  }
  const a = row.currentQsComputerRank, b = row.currentUsnewsComputerRank
  if (a == null && b == null) return null
  if (a == null) return b
  if (b == null) return a
  return Math.min(a, b)
}

function rankClass(rank: number | null | undefined): string {
  if (rank == null) return 'rank-cell--none'
  if (rank <= 10) return 'rank-cell--top10'
  if (rank <= 50) return 'rank-cell--top50'
  if (rank <= 100) return 'rank-cell--top100'
  return 'rank-cell--normal'
}

function reset() {
  search.value = ''
  tagState.value = ''
  tag.value = ''
  maxRank.value = 100
  rankVariant.value = 'qs'
  currentPage.value = 1
  load()
}

// 监听过滤变化自动重查
watch([rankVariant, tagState, tag, maxRank], () => {
  currentPage.value = 1
  load()
})

onMounted(() => {
  load()
})

const totalPages = computed(() => Math.max(1, Math.ceil(total.value / pageSize)))
const pageNumbers = computed(() => {
  const t = totalPages.value
  const c = currentPage.value
  const arr: (number | string)[] = []
  if (t <= 7) {
    for (let i = 1; i <= t; i++) arr.push(i)
  } else {
    arr.push(1)
    if (c > 3) arr.push('…')
    for (let i = Math.max(2, c - 1); i <= Math.min(t - 1, c + 1); i++) arr.push(i)
    if (c < t - 2) arr.push('…')
    arr.push(t)
  }
  return arr
})

function goPage(p: number | string) {
  if (typeof p === 'string') return
  currentPage.value = p
  load()
}
</script>

<template>
  <div>
    <!-- Page Hero -->
    <section class="page-hero page-container">
      <h1 class="page-hero__title">学校库</h1>
      <p class="page-hero__sub">多源排名 · 多维过滤 · 一目了然</p>
    </section>

    <!-- Toolbar -->
    <section class="page-container toolbar-section">
      <div class="toolbar">
        <div class="toolbar__row">
          <div class="toolbar__search">
            <UIcon name="i-lucide-search" class="size-4 text-muted" />
            <input
              v-model="search"
              type="text"
              class="toolbar__input"
              placeholder="搜索大学名称..."
            />
          </div>

          <div class="toolbar__pills">
            <button
              v-for="v in (['qs', 'usnews', 'all'] as RankVariant[])"
              :key="v"
              class="pill"
              :class="{ 'is-active': rankVariant === v }"
              @click="rankVariant = v"
            >
              {{ RANK_VARIANT_SHORT_MAP[v] }}
            </button>
          </div>

          <button class="cta" style="background: #fff; color: #181e25; border: 1px solid #e5e7eb; padding: 8px 14px" @click="reset">
            <UIcon name="i-lucide-rotate-ccw" class="size-4" />
            <span style="margin-left: 6px">重置</span>
          </button>
        </div>

        <div class="toolbar__row">
          <label class="filter-label">
            <span>洲</span>
            <select v-model="tagState" class="filter-select">
              <option value="">全部</option>
              <option value="亚洲">亚洲</option>
              <option value="欧洲">欧洲</option>
              <option value="北美洲">北美洲</option>
              <option value="大洋洲">大洋洲</option>
              <option value="南美洲">南美洲</option>
              <option value="非洲">非洲</option>
            </select>
          </label>

          <label class="filter-label">
            <span>国家</span>
            <select v-model="tag" class="filter-select" :disabled="!tagState">
              <option value="">全部</option>
              <option v-for="c in tagOptions" :key="c" :value="c">{{ c }}</option>
            </select>
          </label>

          <label class="filter-label">
            <span>排名上限</span>
            <select v-model.number="maxRank" class="filter-select">
              <option :value="50">Top 50</option>
              <option :value="100">Top 100</option>
              <option :value="200">Top 200</option>
              <option :value="500">Top 500</option>
            </select>
          </label>

          <label class="filter-label">
            <span>排序</span>
            <select v-model="sortBy" class="filter-select">
              <option value="rank">按排名</option>
              <option value="name">按名称</option>
              <option value="country">按国家</option>
            </select>
          </label>

          <div class="filter-label" style="margin-left: auto">
            <span class="text-muted" style="font-size: 13px">
              共 <strong style="color: var(--color-ink-1000)">{{ total }}</strong> 所大学
            </span>
          </div>
        </div>
      </div>

      <div v-if="error" class="toolbar__error">
        <UIcon name="i-lucide-alert-circle" class="size-4" />
        <span>{{ error }}</span>
      </div>
    </section>

    <!-- Table -->
    <section class="page-container table-section">
      <div class="ds-card table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              <th style="width: 60px">排名</th>
              <th>大学</th>
              <th>国家/地区</th>
              <th style="text-align: right">QS {{ rankVariant === 'usnews' ? '(参考)' : '' }}</th>
              <th style="text-align: right">QS 计算机</th>
              <th style="text-align: right">US News {{ rankVariant === 'qs' ? '(参考)' : '' }}</th>
              <th style="text-align: right">US News 计算机</th>
              <th style="width: 80px">操作</th>
            </tr>
          </thead>
          <tbody v-if="!loading && sortedData.length > 0">
            <tr v-for="row in sortedData" :key="row.universityNameChinese" class="data-table__row">
              <td>
                <span class="rank-cell" :class="rankClass(getRankField(row, 'all'))">
                  {{ getRankField(row, 'all') ?? '—' }}
                </span>
              </td>
              <td class="data-table__name">
                <span class="data-table__name-cn">{{ row.universityNameChinese }}</span>
              </td>
              <td>
                <div class="data-table__location">
                  <span class="data-table__country">{{ row.universityTags || '—' }}</span>
                  <span class="data-table__state">{{ row.universityTagsState || '' }}</span>
                </div>
              </td>
              <td style="text-align: right" class="data-table__num">
                <span :class="rankClass(row.currentQsAllRank)">{{ row.currentQsAllRank ?? '—' }}</span>
              </td>
              <td style="text-align: right" class="data-table__num">
                <span :class="rankClass(row.currentQsComputerRank)">{{ row.currentQsComputerRank ?? '—' }}</span>
              </td>
              <td style="text-align: right" class="data-table__num">
                <span :class="rankClass(row.currentUsnewsAllRank)">{{ row.currentUsnewsAllRank ?? '—' }}</span>
              </td>
              <td style="text-align: right" class="data-table__num">
                <span :class="rankClass(row.currentUsnewsComputerRank)">{{ row.currentUsnewsComputerRank ?? '—' }}</span>
              </td>
              <td>
                <NuxtLink
                  :to="`/universities/${encodeURIComponent(row.universityNameChinese)}`"
                  class="data-table__link"
                >
                  详情
                  <UIcon name="i-lucide-chevron-right" class="size-3" />
                </NuxtLink>
              </td>
            </tr>
          </tbody>
          <tbody v-else-if="loading">
            <tr><td colspan="8" class="data-table__empty">加载中…</td></tr>
          </tbody>
          <tbody v-else>
            <tr><td colspan="8" class="data-table__empty">暂无数据</td></tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="total > pageSize" class="pagination">
          <button
            class="pagination__btn"
            :disabled="currentPage === 1"
            @click="goPage(currentPage - 1)"
          >
            <UIcon name="i-lucide-chevron-left" class="size-4" />
          </button>
          <button
            v-for="(p, idx) in pageNumbers"
            :key="idx"
            class="pagination__btn"
            :class="{
              'is-active': p === currentPage,
              'is-dots': typeof p === 'string'
            }"
            :disabled="typeof p === 'string'"
            @click="goPage(p)"
          >
            {{ p }}
          </button>
          <button
            class="pagination__btn"
            :disabled="currentPage === totalPages"
            @click="goPage(currentPage + 1)"
          >
            <UIcon name="i-lucide-chevron-right" class="size-4" />
          </button>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-hero { padding: 56px 0 24px; }
.page-hero__title { font-family: var(--font-display); font-size: 40px; font-weight: 600; color: var(--color-ink-1000); margin: 0; line-height: 1.1; letter-spacing: -0.02em; }
.page-hero__sub { font-size: 16px; color: var(--color-ink-700); margin: 8px 0 0; }

.toolbar-section { padding: 8px 24px 0; }
.toolbar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 24px;
  background: #fff;
  border-radius: 20px;
  border: 1px solid var(--color-border-light);
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}
.toolbar__row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.toolbar__search {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: var(--color-surface-1);
  border-radius: 12px;
  flex: 1;
  min-width: 240px;
}
.toolbar__input {
  flex: 1;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: var(--color-ink-1000);
}
.toolbar__input::placeholder { color: var(--color-ink-500); }

.toolbar__pills { display: flex; gap: 4px; padding: 4px; background: var(--color-surface-1); border-radius: 9999px; }
.toolbar__pills .pill { background: transparent; padding: 6px 14px; font-size: 13px; }
.toolbar__pills .pill:hover { background: rgba(0, 0, 0, 0.04); }
.toolbar__pills .pill.is-active { background: var(--color-brand-900); color: #fff; }

.filter-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--color-ink-700);
}
.filter-select {
  padding: 6px 10px;
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  color: var(--color-ink-1000);
  outline: none;
  cursor: pointer;
  transition: border 160ms ease;
}
.filter-select:hover { border-color: var(--color-brand-300); }
.filter-select:focus { border-color: var(--color-brand-900); }
.filter-select:disabled { background: var(--color-surface-1); cursor: not-allowed; }

.toolbar__error {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fef3c7;
  color: #92400e;
  border-radius: 8px;
  font-size: 13px;
}

.table-section { padding: 20px 24px 40px; }
.table-wrap { padding: 0; overflow: hidden; }

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}
.data-table thead {
  background: var(--color-surface-1);
  border-bottom: 1px solid var(--color-border-light);
}
.data-table th {
  text-align: left;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink-700);
  letter-spacing: 0.02em;
  text-transform: uppercase;
}
.data-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--color-border-light);
  vertical-align: middle;
}
.data-table__row { transition: background 160ms ease; }
.data-table__row:hover { background: rgba(20, 86, 240, 0.04); }
.data-table__name { font-weight: 500; color: var(--color-ink-1000); }
.data-table__name-cn { font-size: 14px; }
.data-table__location { display: flex; flex-direction: column; }
.data-table__country { color: var(--color-ink-1000); font-size: 13px; }
.data-table__state { color: var(--color-ink-500); font-size: 11px; margin-top: 2px; }
.data-table__num { font-family: var(--font-data); }
.data-table__link {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(20, 86, 240, 0.08);
  color: var(--color-brand-900);
  font-size: 12px;
  font-weight: 500;
  text-decoration: none;
  transition: all 160ms ease;
}
.data-table__link:hover { background: var(--color-brand-900); color: #fff; }
.data-table__empty { text-align: center; color: var(--color-ink-500); padding: 40px 0; }

.rank-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 32px;
  padding: 0 10px;
  border-radius: 10px;
  font-family: var(--font-data);
  font-size: 13px;
  font-weight: 600;
}
.rank-cell--top10 { background: var(--color-brand-900); color: #fff; }
.rank-cell--top50 { background: rgba(20, 86, 240, 0.1); color: var(--color-brand-700); }
.rank-cell--top100 { background: var(--color-surface-2); color: var(--color-ink-1000); }
.rank-cell--normal { color: var(--color-ink-700); }
.rank-cell--none { color: var(--color-ink-500); font-weight: 400; }

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 16px;
  border-top: 1px solid var(--color-border-light);
}
.pagination__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid var(--color-border);
  background: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink-1000);
  cursor: pointer;
  transition: all 160ms ease;
}
.pagination__btn:hover:not(:disabled) { border-color: var(--color-brand-900); color: var(--color-brand-900); }
.pagination__btn.is-active { background: var(--color-brand-900); color: #fff; border-color: var(--color-brand-900); }
.pagination__btn.is-dots { border: 0; background: transparent; cursor: default; }
.pagination__btn:disabled { opacity: 0.4; cursor: not-allowed; }

@media (max-width: 768px) {
  .toolbar__row { flex-direction: column; align-items: stretch; }
  .toolbar__pills { width: 100%; justify-content: space-between; }
  .data-table { font-size: 12px; }
  .data-table th, .data-table td { padding: 10px 8px; }
}
</style>
