<script setup lang="ts">
interface ImportStatus {
  status: string
  progress: number
  processedFiles: number
  totalFiles: number
  successRecords: number
  failedRecords: number
  message?: string
}

useHead({ title: '数据导入' })

const $api = useApi()

const status = ref<ImportStatus | null>(null)
const loading = ref(false)
const running = ref(false)

const fetchStatus = async () => {
  try {
    status.value = await $api<ImportStatus>('/api/v1/admin/import/status')
  } catch {
    // ignore polling errors
  }
}

const runImport = async () => {
  running.value = true
  try {
    await $api('/api/v1/admin/import/run', { method: 'POST' })
    await fetchStatus()
  } finally {
    running.value = false
  }
}

onMounted(() => {
  fetchStatus()
  const interval = setInterval(fetchStatus, 3000)
  onUnmounted(() => clearInterval(interval))
})
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">数据导入</h1>
    <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">
      查看后台排名数据导入进度，或手动触发重新导入。
    </p>

    <!-- Status card -->
    <AppCard variant="feature">
      <div v-if="!status && loading" class="text-center py-[var(--spacing-xl)] text-[var(--color-steel)]">
        加载中…
      </div>
      <div v-else-if="!status" class="text-center py-[var(--spacing-xl)] text-[var(--color-steel)]">
        暂无导入状态
      </div>
      <div v-else class="space-y-[var(--spacing-xl)]">
        <div class="flex items-center justify-between">
          <h2 class="heading-sm text-[var(--color-ink)]">导入状态</h2>
          <AppBadge
            :variant="status.status === 'completed' ? 'success' : status.status === 'failed' ? 'new' : 'beta'"
            :label="status.status || 'idle'"
          />
        </div>

        <!-- Progress bar -->
        <div>
          <div class="flex justify-between body-sm text-[var(--color-steel)] mb-[var(--spacing-xs)]">
            <span>进度</span>
            <span>{{ status.progress ?? 0 }}%</span>
          </div>
          <div class="h-3 w-full bg-[var(--color-hairline)] rounded-[var(--rounded-full)] overflow-hidden">
            <div
              class="h-full bg-[var(--color-primary)] transition-all duration-500"
              :style="{ width: `${status.progress ?? 0}%` }"
            />
          </div>
        </div>

        <!-- Stats grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-[var(--spacing-md)]">
          <div class="card-base text-center">
            <div class="heading-sm text-[var(--color-ink)]">{{ status.processedFiles ?? 0 }}</div>
            <div class="body-sm text-[var(--color-steel)]">已处理文件</div>
          </div>
          <div class="card-base text-center">
            <div class="heading-sm text-[var(--color-ink)]">{{ status.totalFiles ?? 0 }}</div>
            <div class="body-sm text-[var(--color-steel)]">总文件数</div>
          </div>
          <div class="card-base text-center">
            <div class="heading-sm text-[var(--color-success-text)]">{{ status.successRecords ?? 0 }}</div>
            <div class="body-sm text-[var(--color-steel)]">成功记录</div>
          </div>
          <div class="card-base text-center">
            <div class="heading-sm text-[var(--color-error)]">{{ status.failedRecords ?? 0 }}</div>
            <div class="body-sm text-[var(--color-steel)]">失败记录</div>
          </div>
        </div>

        <p v-if="status.message" class="body-sm text-[var(--color-charcoal)]">
          {{ status.message }}
        </p>
      </div>
    </AppCard>

    <!-- Actions -->
    <div class="mt-[var(--spacing-xl)]">
      <AppButton variant="primary" :disabled="running" @click="runImport">
        {{ running ? '导入中…' : '重新导入' }}
      </AppButton>
    </div>
  </div>
</template>
