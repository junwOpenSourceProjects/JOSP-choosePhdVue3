<script setup lang="ts">
import { uploadRankings, scanLocal, scanPath, previewFile, listHistory, stats } from '~/lib/api/import'

useHead({ title: '上传中心 · 选校系统' })

// ============ 状态 ============
const pendingFiles = ref<File[]>([])
const uploading = ref(false)
const scanning = ref(false)
const error = ref<string | null>(null)
const successMsg = ref<string | null>(null)

// 最近一次结果
const lastResult = ref<{
  totalRecords: number
  filesScanned: number
  fileResults: Array<{ fileName: string; records: number; status: string; message: string }>
} | null>(null)

// 历史
const historyRows = ref<Array<{ rankVariant: string; rankingYear: string }>>([])
const historyTotal = ref(0)
const historyPage = ref(1)
const historyPageSize = 20
const historyLoading = ref(false)

// 总量
const totalGroups = ref(0)

// 最近一次更新 (从 historyRows 取最大年份)
const latestYear = computed(() => {
  if (historyRows.value.length === 0) return null
  const years = historyRows.value
    .map(r => parseInt(r.rankingYear, 10))
    .filter(y => !isNaN(y))
  if (years.length === 0) return null
  return String(Math.max(...years))
})

// 自定义路径
const customPath = ref<string | undefined>(undefined)

// 预览 modal
const previewOpen = ref(false)
const previewData = ref<{
  fileName: string
  headers: string[]
  sampleRows: string[][]
  totalRows: number
} | null>(null)
const previewLoading = ref(false)

// ============ 上传 ============
function onFilesChange(files: File[] | null | undefined) {
  if (!files) {
    pendingFiles.value = []
    return
  }
  const valid = (Array.isArray(files) ? files : Array.from(files)).filter(f =>
    f.name.toLowerCase().endsWith('.txt')
  )
  if (valid.length === 0) {
    error.value = '只支持 .txt 格式的排名文件'
    return
  }
  error.value = null
  pendingFiles.value = valid
}

function addFiles(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  onFilesChange(Array.from(input.files))
  input.value = ''
}

function clearPending() {
  pendingFiles.value = []
}

async function doUpload() {
  if (pendingFiles.value.length === 0) {
    error.value = '请先选择文件'
    return
  }
  uploading.value = true
  error.value = null
  try {
    const res: any = await uploadRankings(pendingFiles.value)
    successMsg.value = `成功导入 ${res?.data ?? 0} 条记录`
    pendingFiles.value = []
    await Promise.all([loadHistory(), loadStats()])
    setTimeout(() => successMsg.value = null, 4000)
  } catch (e: any) {
    error.value = '上传失败: ' + (e?.data?.msg || e?.message || '后端不可达')
  } finally {
    uploading.value = false
  }
}

async function doScanLocal() {
  if (!confirm('确认扫描后端工作目录下的 qs 排名/ 文件夹?\n这会清空同 (大学+年份+排名类型) 旧数据后插入新数据。')) return
  scanning.value = true
  error.value = null
  try {
    const res: any = await scanLocal()
    lastResult.value = res?.data
    successMsg.value = `扫描完成: ${res?.data?.filesScanned ?? 0} 文件 / ${res?.data?.totalRecords ?? 0} 条记录`
    await Promise.all([loadHistory(), loadStats()])
    setTimeout(() => successMsg.value = null, 5000)
  } catch (e: any) {
    error.value = '扫描失败: ' + (e?.data?.msg || e?.message || '后端不可达')
  } finally {
    scanning.value = false
  }
}

async function doScanPath() {
  if (!customPath.value) {
    error.value = '请输入路径'
    return
  }
  if (!confirm(`确认扫描目录: ${customPath.value}?`)) return
  scanning.value = true
  error.value = null
  try {
    const res: any = await scanPath(customPath.value)
    lastResult.value = res?.data
    successMsg.value = `扫描完成: ${res?.data?.filesScanned ?? 0} 文件 / ${res?.data?.totalRecords ?? 0} 条记录`
    await Promise.all([loadHistory(), loadStats()])
    setTimeout(() => successMsg.value = null, 5000)
  } catch (e: any) {
    error.value = '扫描失败: ' + (e?.data?.msg || e?.message || '后端不可达')
  } finally {
    scanning.value = false
  }
}

// ============ 预览 ============
async function doPreview(file: File) {
  previewLoading.value = true
  previewOpen.value = true
  try {
    const res: any = await previewFile(file)
    previewData.value = res?.data
  } catch (e: any) {
    error.value = '预览失败: ' + (e?.message || '后端不可达')
    previewOpen.value = false
  } finally {
    previewLoading.value = false
  }
}

function previewPending() {
  if (pendingFiles.value[0]) {
    doPreview(pendingFiles.value[0])
  }
}

// ============ 历史 + 统计 ============
async function loadHistory() {
  historyLoading.value = true
  try {
    const res: any = await listHistory({ page: historyPage.value, pageSize: historyPageSize })
    historyRows.value = res?.data?.records ?? []
    historyTotal.value = res?.data?.total ?? 0
  } catch (e: any) {
    console.warn('[upload] history load failed', e?.message)
    error.value = '历史加载失败: ' + (e?.message || '后端不可达')
  } finally {
    historyLoading.value = false
  }
}

async function loadStats() {
  try {
    const res: any = await stats()
    totalGroups.value = res?.data?.qs_total ?? 0
  } catch {
    // silent
  }
}

onMounted(async () => {
  await Promise.all([loadHistory(), loadStats()])
})

function statusTone(s: string): 'primary' | 'error' | 'neutral' {
  if (s === 'OK') return 'primary'
  if (s === 'FAIL') return 'error'
  return 'neutral'
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
</script>

<template>
  <div>
    <UContainer class="py-10">
      <h1
        class="text-4xl font-semibold leading-tight tracking-tight text-default"
        :style="{ fontFamily: 'var(--font-display)' }"
      >上传中心</h1>
      <p class="mt-2 text-base text-muted">手动上传或一键扫描 · 解析后入库 · 全程幂等</p>
    </UContainer>

    <!-- 总览 + scanLocal 大按钮 -->
    <UContainer>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-5' }">
          <div class="text-[11px] font-semibold uppercase tracking-wider text-muted">已入库排名组数</div>
          <div
            class="mt-2 text-[40px] font-semibold leading-none tracking-tight text-[var(--color-brand-900)]"
            :style="{ fontFamily: 'var(--font-display)' }"
          >{{ totalGroups }}</div>
          <div class="mt-2 text-[12px] text-subtle">按 (排名类型, 年份) 分组</div>
        </UCard>
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-5' }">
          <div class="text-[11px] font-semibold uppercase tracking-wider text-muted">待上传文件</div>
          <div
            class="mt-2 text-[40px] font-semibold leading-none tracking-tight text-[var(--color-brand-900)]"
            :style="{ fontFamily: 'var(--font-display)' }"
          >{{ pendingFiles.length }}</div>
          <div class="mt-2 text-[12px] text-subtle">.txt 排名文件</div>
        </UCard>
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-5' }">
          <div class="text-[11px] font-semibold uppercase tracking-wider text-muted">最近一次更新</div>
          <div
            class="mt-2 text-[40px] font-semibold leading-none tracking-tight text-[var(--color-brand-900)]"
            :style="{ fontFamily: 'var(--font-display)' }"
          >{{ latestYear ?? '—' }}</div>
          <div class="mt-2 text-[12px] text-subtle">
            <span v-if="latestYear">最新年份 · 来自历史导入</span>
            <span v-else>尚未执行</span>
          </div>
        </UCard>
      </div>
    </UContainer>

    <!-- 3 大入口: 拖拽上传 / 一键扫本地 / 自定义路径 -->
    <UContainer class="pt-4">
      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <!-- 左: 拖拽上传 -->
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-6 space-y-4' }">
          <div>
            <h2 class="text-lg font-semibold text-default" :style="{ fontFamily: 'var(--font-display)' }">拖拽上传</h2>
            <p class="mt-1 text-[13px] text-muted">支持多选 .txt 格式的排名文件 (TSV 7 列)</p>
          </div>

          <div
            class="relative flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-default bg-[var(--color-surface-1)] p-8 transition-colors hover:border-[var(--color-brand-700)]"
            @dragover.prevent
            @drop.prevent="onFilesChange(Array.from($event.dataTransfer?.files ?? []))"
          >
            <UIcon name="i-lucide-upload-cloud" class="size-10 text-muted" />
            <div class="text-sm text-default">拖拽文件到此处</div>
            <div class="text-xs text-subtle">或</div>
            <label>
              <input
                type="file"
                accept=".txt"
                multiple
                class="hidden"
                @change="addFiles"
              />
              <UButton
                as="span"
                icon="i-lucide-folder-open"
                color="primary"
                variant="solid"
                size="sm"
                label="选择文件"
              />
            </label>
          </div>

          <!-- 已选文件列表 -->
          <div v-if="pendingFiles.length > 0" class="space-y-2">
            <div class="flex items-center justify-between">
              <div class="text-sm font-medium text-default">已选 {{ pendingFiles.length }} 个文件</div>
              <div class="flex gap-2">
                <UButton
                  icon="i-lucide-eye"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  label="预览"
                  @click="previewPending"
                />
                <UButton
                  icon="i-lucide-x"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  label="清空"
                  @click="clearPending"
                />
              </div>
            </div>
            <ul class="divide-y divide-default rounded-xl border border-default">
              <li
                v-for="(f, i) in pendingFiles"
                :key="i"
                class="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <div class="flex min-w-0 flex-1 items-center gap-2">
                  <UIcon name="i-lucide-file-text" class="size-4 shrink-0 text-muted" />
                  <span class="truncate text-default">{{ f.name }}</span>
                </div>
                <span class="text-xs text-muted">{{ formatSize(f.size) }}</span>
              </li>
            </ul>
          </div>

          <UButton
            icon="i-lucide-upload"
            color="primary"
            variant="solid"
            size="md"
            block
            :label="uploading ? '上传中…' : `上传并导入 (${pendingFiles.length})`"
            :disabled="pendingFiles.length === 0"
            :loading="uploading"
            @click="doUpload"
          />
        </UCard>

        <!-- 右: 一键扫描 -->
        <UCard :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-6 space-y-4' }">
          <div>
            <h2 class="text-lg font-semibold text-default" :style="{ fontFamily: 'var(--font-display)' }">一键扫描</h2>
            <p class="mt-1 text-[13px] text-muted">直接读后端工作目录的 qs 排名/ 文件夹, 全部导入</p>
          </div>

          <div class="space-y-3">
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-default bg-[var(--color-surface-1)] p-4"
            >
              <div>
                <div class="text-sm font-medium text-default">后端工作目录</div>
                <div class="mt-0.5 text-xs text-muted">默认 <code class="font-mono text-[12px]">qs 排名/</code>, 15 个 QS 年度文件</div>
              </div>
              <UButton
                icon="i-lucide-zap"
                color="primary"
                variant="solid"
                size="md"
                label="扫描本地"
                :loading="scanning"
                @click="doScanLocal"
              />
            </div>

            <UFormField label="自定义路径" size="md">
              <div class="flex gap-2">
                <UInput
                  v-model="customPath"
                  icon="i-lucide-folder"
                  placeholder="/path/to/your/rankings"
                  size="md"
                  class="flex-1"
                />
                <UButton
                  icon="i-lucide-search"
                  color="neutral"
                  variant="outline"
                  size="md"
                  label="扫描"
                  :loading="scanning"
                  @click="doScanPath"
                />
              </div>
            </UFormField>
          </div>

          <UAlert
            color="info"
            variant="subtle"
            title="幂等原则: 同 (大学+年份+排名类型) 会被覆盖, 不会重复入库"
            icon="i-lucide-info"
          />
        </UCard>
      </div>
    </UContainer>

    <!-- 通知 -->
    <UContainer class="pt-3">
      <UAlert
        v-if="error"
        color="error"
        variant="subtle"
        :title="error"
        icon="i-lucide-alert-circle"
        :close-button="{ onClick: () => error = null }"
      />
      <UAlert
        v-if="successMsg"
        color="success"
        variant="subtle"
        :title="successMsg"
        icon="i-lucide-check-circle"
      />
    </UContainer>

    <!-- 最近一次结果 -->
    <UContainer v-if="lastResult" class="pt-4">
      <UCard
        :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm', body: 'p-0 overflow-hidden' }"
      >
        <div class="border-b border-default p-5">
          <h2 class="text-lg font-semibold text-default" :style="{ fontFamily: 'var(--font-display)' }">
            最近一次结果
          </h2>
          <p class="mt-1 text-[13px] text-muted">
            扫描 {{ lastResult.filesScanned }} 文件 / 导入 {{ lastResult.totalRecords }} 条
          </p>
        </div>
        <UTable
          :data="lastResult.fileResults"
          :columns="[
            { id: 'name', header: '文件', accessorKey: 'fileName' },
            { id: 'records', header: '记录数', meta: { class: { th: 'w-[100px] text-right', td: 'w-[100px] text-right font-[var(--font-data)]' } } },
            { id: 'status', header: '状态', meta: { class: { th: 'w-[100px]', td: 'w-[100px]' } } },
            { id: 'msg', header: '消息' }
          ]"
          :ui="{ th: 'text-xs font-semibold uppercase tracking-wider text-muted', td: 'py-3 text-sm' }"
        >
          <template #name-cell="{ row }">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-file-text" class="size-4 text-muted" />
              <span class="truncate text-default">{{ row.original.fileName }}</span>
            </div>
          </template>
          <template #status-cell="{ row }">
            <UBadge
              :color="statusTone(row.original.status)"
              :variant="row.original.status === 'OK' ? 'subtle' : 'solid'"
              size="xs"
              :label="row.original.status"
            />
          </template>
          <template #msg-cell="{ row }">
            <span class="text-xs text-muted">{{ row.original.message || '—' }}</span>
          </template>
        </UTable>
      </UCard>
    </UContainer>

    <!-- 历史 -->
    <UContainer class="py-6">
      <UCard
        :ui="{ root: 'rounded-2xl border border-default bg-white shadow-sm overflow-hidden', body: 'p-0' }"
      >
        <div class="flex items-center justify-between border-b border-default p-5">
          <div>
            <h2 class="text-lg font-semibold text-default" :style="{ fontFamily: 'var(--font-display)' }">
              导入历史
            </h2>
            <p class="mt-1 text-[13px] text-muted">数据库中所有 (排名类型 + 年份) 的组合</p>
          </div>
          <UButton
            icon="i-lucide-refresh-cw"
            color="neutral"
            variant="ghost"
            size="sm"
            label="刷新"
            @click="loadHistory"
          />
        </div>
        <UTable
          :data="historyRows"
          :loading="historyLoading"
          :columns="[
            { id: 'variant', header: '排名类型', accessorKey: 'rankVariant' },
            { id: 'year', header: '年份', meta: { class: { th: 'w-[120px]', td: 'w-[120px] font-[var(--font-data)]' } } }
          ]"
          :ui="{ th: 'text-xs font-semibold uppercase tracking-wider text-muted', td: 'py-3 text-sm' }"
        >
          <template #variant-cell="{ row }">
            <UBadge color="primary" variant="subtle" size="sm" :label="row.original.rankVariant || '—'" />
          </template>
          <template #year-cell="{ row }">
            <span class="font-mono text-[14px] text-default">{{ row.original.rankingYear }}</span>
          </template>
          <template #empty>
            <UEmpty
              icon="i-lucide-database"
              title="还没有任何导入记录"
              description="上传 .txt 文件或一键扫描本地目录"
            />
          </template>
        </UTable>
        <div v-if="historyTotal > historyPageSize" class="border-t border-default px-4 py-3">
          <UPagination
            v-model:page="historyPage"
            :items-per-page="historyPageSize"
            :total="historyTotal"
            active-color="primary"
            @update:page="loadHistory"
          />
        </div>
      </UCard>
    </UContainer>

    <!-- 预览 modal -->
    <UModal v-model:open="previewOpen" :ui="{ content: 'sm:max-w-3xl' }">
      <template #header>
        <div>
          <h3 class="text-base font-semibold text-default" :style="{ fontFamily: 'var(--font-display)' }">
            预览: {{ previewData?.fileName || '—' }}
          </h3>
          <p v-if="previewData" class="mt-1 text-[13px] text-muted">
            共 {{ previewData.totalRows }} 行 · 仅展示前 5 行
          </p>
        </div>
      </template>
      <template #body>
        <div v-if="previewLoading" class="flex h-32 items-center justify-center text-muted">
          <UIcon name="i-lucide-loader" class="size-5 animate-spin" />
          <span class="ml-2 text-sm">解析中…</span>
        </div>
        <div v-else-if="previewData" class="space-y-3">
          <div class="overflow-x-auto rounded-xl border border-default">
            <table class="min-w-full text-[13px]">
              <thead class="bg-[var(--color-surface-1)]">
                <tr>
                  <th
                    v-for="(h, i) in previewData.headers"
                    :key="i"
                    class="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wider text-muted"
                  >{{ h }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in previewData.sampleRows" :key="i" class="border-t border-default">
                  <td
                    v-for="(c, j) in row"
                    :key="j"
                    class="px-3 py-2 text-default"
                  >{{ c }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <UAlert
            color="info"
            variant="subtle"
            title="表头 7 列: 大学名称 / 大学英文名称 / 大学标签 / 排名名称 / 年份 / 当前排名(取整) / 当前排名(原始)"
            icon="i-lucide-info"
          />
        </div>
      </template>
    </UModal>
  </div>
</template>
