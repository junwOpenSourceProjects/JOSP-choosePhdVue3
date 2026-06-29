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

const localePath = useLocalePath()
const { t } = useI18n()

useHead({ title: () => t('admin.import') })

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
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">{{ $t('admin.import') }}</h1>
    <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">
      {{ $t('admin.importDesc') }}
    </p>

    <!-- Status card -->
    <AppCard variant="feature">
      <div v-if="!status && loading" class="text-center py-[var(--spacing-xl)] text-[var(--color-steel)]">
        {{ $t('common.loading') }}
      </div>
      <div v-else-if="!status" class="text-center py-[var(--spacing-xl)] text-[var(--color-steel)]">
        {{ $t('admin.noImportStatus') }}
      </div>
      <div v-else class="space-y-[var(--spacing-xl)]">
        <div class="flex items-center justify-between">
          <h2 class="heading-sm text-[var(--color-ink)]">{{ $t('admin.importStatus') }}</h2>
          <AppBadge
            :variant="status.status === 'completed' ? 'success' : status.status === 'failed' ? 'new' : 'beta'"
            :label="status.status || 'idle'"
          />
        </div>

        <!-- Progress bar -->
        <div>
          <div class="flex justify-between body-sm text-[var(--color-steel)] mb-[var(--spacing-xs)]">
            <span>{{ $t('admin.progress') }}</span>
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
            <div class="body-sm text-[var(--color-steel)]">{{ $t('admin.processedFiles') }}</div>
          </div>
          <div class="card-base text-center">
            <div class="heading-sm text-[var(--color-ink)]">{{ status.totalFiles ?? 0 }}</div>
            <div class="body-sm text-[var(--color-steel)]">{{ $t('admin.totalFiles') }}</div>
          </div>
          <div class="card-base text-center">
            <div class="heading-sm text-[var(--color-success-text)]">{{ status.successRecords ?? 0 }}</div>
            <div class="body-sm text-[var(--color-steel)]">{{ $t('admin.successRecords') }}</div>
          </div>
          <div class="card-base text-center">
            <div class="heading-sm text-[var(--color-error)]">{{ status.failedRecords ?? 0 }}</div>
            <div class="body-sm text-[var(--color-steel)]">{{ $t('admin.failedRecords') }}</div>
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
        {{ running ? $t('admin.importing') : $t('admin.reimport') }}
      </AppButton>
    </div>
  </div>
</template>
