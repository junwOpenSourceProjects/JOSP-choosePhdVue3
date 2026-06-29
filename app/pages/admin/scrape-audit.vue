<script setup lang="ts">
/**
 * 反爬虫审计页面 — admin only
 *
 * <p>对接后端 4 个 scrape_audit 端点：
 * <ul>
 *   <li>GET /api/v1/admin/scrape-audit/recent — 最近 N 条拦截记录</li>
 *   <li>GET /api/v1/admin/scrape-audit/ip-count?ip=...&hours=24 — 单 IP 计数</li>
 *   <li>GET /api/v1/admin/scrape-audit/risky-ips?hours=24&threshold=50 — 高危 IP</li>
 *   <li>GET /api/v1/admin/scrape-audit/export?hours=24 — CSV 流式下载（admin 归档 / 离线分析）</li>
 * </ul>
 *
 * <p>AdminInterceptor 兜底（项目 commit 54ffcfd），无 admin 权限返 403。
 */
const localePath = useLocalePath()
const { t } = useI18n()

useHead({ title: () => t('admin.scrapeAudit') })

const $api = useApi()
const auth = useAuthStore()
const config = useRuntimeConfig()
const token = useCookie<string | null>('choosephd_token', { default: () => null })

interface AuditRecord {
  id: number
  ip: string
  userAgent: string
  path: string
  rejectReason: string   // 后端字段 rejectReason (非 reason)
  statusCode: number     // 后端字段 statusCode (非 status)
  createdAt: string  // Spring LocalDateTime Jackson 默认 ISO 字符串 (项目未配 WRITE_DATES_AS_TIMESTAMPS=false)
}

interface RiskyIp {
  ip: string
  count: number
}

const records = ref<AuditRecord[]>([])
const riskyIps = ref<RiskyIp[]>([])
const loading = ref(false)
const error = ref('')
const autoRefresh = ref(true)

// 查询参数
const recentLimit = ref(50)
const riskyHours = ref(24)
const riskyThreshold = ref(50)
const ipQuery = ref('')
const ipQueryHours = ref(24)
const ipQueryResult = ref<{ ip: string; count: number } | null>(null)

// CSV 导出参数 + 状态
const exportHours = ref(24)
const exportLoading = ref(false)

// ISO 字符串 → YYYY-MM-DD HH:MM:SS — 去掉时区秒精度
const formatDateTime = (val: string | null | undefined): string => {
  if (!val) return ''
  return String(val).replace('T', ' ').slice(0, 19)
}

// 状态码 badge 颜色
const statusColor = (s: number) => {
  if (s === 403) return 'warning'  // L2 AntiScrape
  if (s === 429) return 'error'    // L3 RateLimit
  return 'neutral'
}

// alias 兼容 — 模板里 status / reason 短名便于阅读
const statusOf = (r: AuditRecord) => r.statusCode
const reasonOf = (r: AuditRecord) => r.rejectReason

// reason 简短摘要（限制宽度）
const reasonShort = (r: string) => r.length > 80 ? r.slice(0, 80) + '…' : r

const fetchRecent = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await $api<{ code: number; data: AuditRecord[] }>(`/admin/scrape-audit/recent?limit=${recentLimit.value}`)
    records.value = res?.data ?? []
  } catch (e: any) {
    error.value = e?.message || '加载失败'
    records.value = []
  } finally {
    loading.value = false
  }
}

const fetchRisky = async () => {
  try {
    // 后端返 { risky_ip_count, top: [{ip, count}], total_ips, threshold, hours }
    const res = await $api<{ risky_ip_count: number; top: RiskyIp[]; total_ips: number }>(`/admin/scrape-audit/risky-ips?hours=${riskyHours.value}&threshold=${riskyThreshold.value}`)
    riskyIps.value = res?.top ?? []
  } catch {
    riskyIps.value = []
  }
}

const queryIp = async () => {
  if (!ipQuery.value.trim()) {
    ipQueryResult.value = null
    return
  }
  error.value = ''
  try {
    const res = await $api<{ code: number; data: { ip: string; count: number } }>(`/admin/scrape-audit/ip-count?ip=${encodeURIComponent(ipQuery.value.trim())}&hours=${ipQueryHours.value}`)
    ipQueryResult.value = res?.data ?? null
  } catch (e: any) {
    error.value = e?.message || '查询失败'
    ipQueryResult.value = null
  }
}

/**
 * CSV 导出 — admin 下载审计记录。
 *
 * <p>走原生 {@code $fetch} 而非 {@code useApi()}:CSV 流非 ApiResult 包装,
 * {@code useApi()} 会在 code !== 0 时 throw, 而 CSV Response 是空 JSON parse 失败误触发.
 * 直接构造 URL + Authorization header + 解析 blob + 触发 download.
 */
const downloadExport = async () => {
  exportLoading.value = true
  error.value = ''
  try {
    const hoursParam = String(exportHours.value)
    const url = `${config.public.apiBase}/admin/scrape-audit/export?hours=${hoursParam}`
    const res = await fetch(url, {
      headers: token.value ? { Authorization: `Bearer ${token.value}` } : {},
    })
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    const blob = await res.blob()
    // 从 Content-Disposition header 解析服务端文件名 (优先 filename* UTF-8)
    const dispo = res.headers.get('Content-Disposition') || ''
    const utf8Match = dispo.match(/filename\*=UTF-8''([^;]+)/)
    const asciiMatch = dispo.match(/filename="([^"]+)"/)
    let filename = ''
    if (utf8Match && utf8Match[1]) {
      try { filename = decodeURIComponent(utf8Match[1]) } catch { filename = utf8Match[1] }
    } else if (asciiMatch && asciiMatch[1]) {
      filename = asciiMatch[1]
    } else {
      filename = `scrape-audit_${hoursParam}h_${Date.now()}.csv`
    }

    // 触发浏览器 download
    const objectUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objectUrl
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(objectUrl)
  } catch (e: any) {
    error.value = e?.message || '导出失败'
  } finally {
    exportLoading.value = false
  }
}

let timer: ReturnType<typeof setInterval> | null = null

const startAutoRefresh = () => {
  stopAutoRefresh()
  if (autoRefresh.value) {
    timer = setInterval(() => {
      fetchRecent()
      fetchRisky()
    }, 10_000)
  }
}

const stopAutoRefresh = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

watch(autoRefresh, (v) => {
  if (v) startAutoRefresh()
  else stopAutoRefresh()
})

onMounted(() => {
  fetchRecent()
  fetchRisky()
  startAutoRefresh()
})

onBeforeUnmount(() => stopAutoRefresh())
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <!-- 头部 -->
    <header class="mb-[var(--spacing-xl)]">
      <div class="flex items-center gap-3 mb-2">
        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium tracking-wider uppercase bg-[var(--color-surface)] text-[var(--color-steel)] border border-[var(--color-hairline)]">
          <span class="w-1.5 h-1.5 rounded-full bg-[var(--color-warning)]"></span>
          Admin
        </span>
        <span v-if="auth.user?.role" class="text-xs text-[var(--color-muted)]">{{ auth.user.role }}</span>
      </div>
      <h1 class="heading-lg text-[var(--color-ink)]">反爬虫审计</h1>
      <p class="subtitle text-[var(--color-steel)] mt-2">
        查看拦截记录、查询单 IP 行为、识别高危爬虫源。每 10 秒自动刷新。
      </p>
    </header>

    <!-- 错误提示 -->
    <div v-if="error" class="mb-[var(--spacing-md)] p-3 rounded-[var(--radius-md)] border border-[var(--color-error)] bg-[var(--color-error-bg)] text-[var(--color-error)] text-sm">
      {{ error }}
    </div>

    <!-- 工具栏 -->
    <div class="flex flex-wrap items-center gap-3 mb-[var(--spacing-lg)] p-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-hairline)]">
      <label class="flex items-center gap-2 text-sm text-[var(--color-charcoal)]">
        <input v-model="autoRefresh" type="checkbox" class="accent-[var(--color-indigo)]" />
        自动刷新
      </label>
      <span class="text-[var(--color-hairline)]">|</span>
      <label class="flex items-center gap-2 text-sm">
        <span class="text-[var(--color-steel)]">最近</span>
        <select v-model.number="recentLimit" @change="fetchRecent" class="px-2 py-1 rounded border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-sm">
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
        <span class="text-[var(--color-steel)]">条</span>
      </label>
      <AppButton size="sm" variant="secondary" @click="fetchRecent">手动刷新</AppButton>

      <span class="text-[var(--color-hairline)]">|</span>

      <!-- CSV 导出 -->
      <label class="flex items-center gap-2 text-sm">
        <span class="text-[var(--color-steel)]">导出</span>
        <select v-model.number="exportHours" class="px-2 py-1 rounded border border-[var(--color-hairline)] bg-[var(--color-canvas)] text-sm">
          <option :value="1">最近 1h</option>
          <option :value="6">最近 6h</option>
          <option :value="24">最近 24h</option>
          <option :value="72">最近 72h</option>
          <option :value="168">最近 7d</option>
          <option :value="0">全部</option>
        </select>
      </label>
      <AppButton
        size="sm"
        variant="primary"
        :disabled="exportLoading"
        @click="downloadExport"
      >
        {{ exportLoading ? '导出中...' : '下载 CSV' }}
      </AppButton>
    </div>

    <!-- 高危 IP 区 -->
    <section class="mb-[var(--spacing-xl)]">
      <header class="flex items-baseline justify-between mb-[var(--spacing-md)]">
        <h2 class="heading-md text-[var(--color-ink)]">高危 IP</h2>
        <div class="flex items-center gap-3 text-sm text-[var(--color-steel)]">
          <label class="flex items-center gap-2">
            <span>窗口</span>
            <select v-model.number="riskyHours" @change="fetchRisky" class="px-2 py-1 rounded border border-[var(--color-hairline)] bg-[var(--color-canvas)]">
              <option :value="1">1h</option>
              <option :value="6">6h</option>
              <option :value="24">24h</option>
              <option :value="72">72h</option>
            </select>
          </label>
          <label class="flex items-center gap-2">
            <span>阈值</span>
            <input v-model.number="riskyThreshold" type="number" min="1" class="w-16 px-2 py-1 rounded border border-[var(--color-hairline)] bg-[var(--color-canvas)]" />
          </label>
          <AppButton size="sm" variant="secondary" @click="fetchRisky">查询</AppButton>
        </div>
      </header>

      <div v-if="riskyIps.length === 0" class="text-center py-12 text-[var(--color-muted)] text-sm">
        暂无高危 IP
      </div>
      <ul v-else class="space-y-2">
        <li
          v-for="r in riskyIps"
          :key="r.ip"
          class="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--color-canvas)] border border-[var(--color-hairline)]"
        >
          <code class="font-mono text-sm text-[var(--color-ink)]">{{ r.ip }}</code>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-error-bg)] text-[var(--color-error)]">
            {{ r.count }} 次拦截
          </span>
        </li>
      </ul>
    </section>

    <!-- 单 IP 查询 -->
    <section class="mb-[var(--spacing-xl)]">
      <h2 class="heading-md text-[var(--color-ink)] mb-[var(--spacing-md)]">单 IP 查询</h2>
      <div class="flex flex-wrap items-center gap-3 p-4 rounded-[var(--radius-md)] bg-[var(--color-surface)] border border-[var(--color-hairline)]">
        <input
          v-model="ipQuery"
          type="text"
          placeholder="输入 IP 地址"
          class="flex-1 min-w-[180px] px-3 py-1.5 rounded border border-[var(--color-hairline)] bg-[var(--color-canvas)] font-mono text-sm"
          @keyup.enter="queryIp"
        />
        <label class="flex items-center gap-2 text-sm text-[var(--color-steel)]">
          <span>窗口</span>
          <select v-model.number="ipQueryHours" class="px-2 py-1 rounded border border-[var(--color-hairline)] bg-[var(--color-canvas)]">
            <option :value="1">1h</option>
            <option :value="24">24h</option>
            <option :value="72">72h</option>
            <option :value="168">7d</option>
          </select>
        </label>
        <AppButton size="sm" variant="primary" @click="queryIp">查询</AppButton>
        <div v-if="ipQueryResult" class="basis-full flex items-center gap-3 mt-2 pt-3 border-t border-[var(--color-hairline-soft)]">
          <code class="font-mono text-sm text-[var(--color-ink)]">{{ ipQueryResult.ip }}</code>
          <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-surface-2)] text-[var(--color-charcoal)]">
            {{ ipQueryResult.count }} 次拦截（窗口 {{ ipQueryHours }}h）
          </span>
        </div>
      </div>
    </section>

    <!-- 拦截记录 -->
    <section>
      <h2 class="heading-md text-[var(--color-ink)] mb-[var(--spacing-md)]">
        拦截记录
        <span class="text-sm font-normal text-[var(--color-muted)] ml-2">最近 {{ records.length }} 条</span>
      </h2>

      <div v-if="loading && records.length === 0" class="text-center py-12 text-[var(--color-muted)] text-sm">
        加载中...
      </div>
      <div v-else-if="records.length === 0" class="text-center py-12 text-[var(--color-muted)] text-sm">
        暂无拦截记录
      </div>
      <div v-else class="overflow-x-auto rounded-[var(--radius-md)] border border-[var(--color-hairline)]">
        <table class="w-full text-sm">
          <thead class="bg-[var(--color-surface)] text-left text-[11px] font-medium uppercase tracking-wider text-[var(--color-steel)]">
            <tr>
              <th class="px-3 py-2.5">时间</th>
              <th class="px-3 py-2.5">IP</th>
              <th class="px-3 py-2.5">状态</th>
              <th class="px-3 py-2.5">路径</th>
              <th class="px-3 py-2.5">原因</th>
              <th class="px-3 py-2.5">UA</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--color-hairline-soft)]">
            <tr v-for="r in records" :key="r.id" class="hover:bg-[var(--color-surface)]">
              <td class="px-3 py-2 font-mono text-xs text-[var(--color-steel)] whitespace-nowrap">{{ formatDateTime(r.createdAt) }}</td>
              <td class="px-3 py-2 font-mono text-xs whitespace-nowrap">{{ r.ip }}</td>
              <td class="px-3 py-2 whitespace-nowrap">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  :class="{
                    'bg-[var(--color-warning-bg)] text-[var(--color-warning)]': statusColor(statusOf(r)) === 'warning',
                    'bg-[var(--color-error-bg)] text-[var(--color-error)]': statusColor(statusOf(r)) === 'error'
                  }"
                >{{ statusOf(r) }}</span>
              </td>
              <td class="px-3 py-2 font-mono text-xs text-[var(--color-charcoal)] max-w-[200px] truncate" :title="r.path">{{ r.path }}</td>
              <td class="px-3 py-2 text-xs text-[var(--color-steel)] max-w-[260px]" :title="reasonOf(r)">{{ reasonShort(reasonOf(r)) }}</td>
              <td class="px-3 py-2 text-xs text-[var(--color-muted)] max-w-[200px] truncate" :title="r.userAgent">{{ r.userAgent }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
