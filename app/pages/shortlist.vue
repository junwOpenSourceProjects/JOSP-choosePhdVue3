<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

useHead({ title: () => t('shortlist.title') })

const authStore = useAuthStore()
const shortlistStore = useShortlistStore()
const router = useRouter()

onMounted(() => {
  if (authStore.isLoggedIn) {
    shortlistStore.fetchShortlist()
  }
})

const priorityLabel = (priority: number) => {
  const map: Record<number, string> = {
    1: t('universityDetail.priorityStrong'),
    2: t('universityDetail.priorityMedium'),
    3: t('universityDetail.priorityWeak'),
    4: t('universityDetail.priorityNone')
  }
  return map[priority] || t('shortlist.unknown')
}

const priorityVariant = (priority: number): 'success' | 'new' | 'beta' | 'code' => {
  if (priority === 1) return 'new'
  if (priority === 2) return 'success'
  if (priority === 3) return 'beta'
  return 'code'
}

const removing = ref<Record<string, boolean>>({})

const remove = async (universityId: string) => {
  removing.value[universityId] = true
  try {
    await shortlistStore.removeFromShortlist(universityId)
  } finally {
    removing.value[universityId] = false
  }
}

// 清空二次确认 — UModal 替代浏览器原生 confirm()
const clearConfirmOpen = ref(false)
const clearing = ref(false)

const clearAll = async () => {
  clearing.value = true
  try {
    for (const item of shortlistStore.items) {
      await shortlistStore.removeFromShortlist(item.universityId)
    }
  } finally {
    clearing.value = false
    clearConfirmOpen.value = false
  }
}

const compare = () => {
  const ids = shortlistStore.items.slice(0, 3).map((i) => i.universityId).join(',')
  router.push(localePath(`/compare?ids=${ids}`))
}

// CSV 导出（Premium 专属）
const $api = useApi()
const exporting = ref(false)
const usage = ref<{ membership: string; exportMonthlyLimit: number } | null>(null)

const fetchUsage = async () => {
  try {
    usage.value = await $api<{ membership: string; exportMonthlyLimit: number }>('/api/v1/usage/me')
  } catch { /* ignore */ }
}
onMounted(() => { if (authStore.isLoggedIn) fetchUsage() })

const exportCsv = async () => {
  exporting.value = true
  try {
    const config = useRuntimeConfig()
    const token = useCookie<string | null>('choosephd_token', { default: () => null })
    const res = await fetch(`${config.public.apiBase}/shortlist/export`, {
      headers: { Authorization: `Bearer ${token.value}` }
    })
    if (!res.ok) {
      const err = await res.json()
      const toast = useToast()
      toast.add({ title: err.message || '导出失败', color: 'error', timeout: 5000 })
      return
    }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `choosephd-shortlist-${new Date().toISOString().slice(0, 10)}.csv`
    a.click(); URL.revokeObjectURL(url)
  } finally {
    exporting.value = false
  }
}
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">{{ $t('shortlist.title') }}</h1>
    <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">
      {{ $t('shortlist.subtitle') }}
    </p>

    <!-- Login CTA -->
    <div v-if="!authStore.isLoggedIn" class="card-base text-center py-[var(--spacing-section)]">
      <p class="body-md text-[var(--color-charcoal)] mb-[var(--spacing-md)]">{{ $t('shortlist.loginCTA') }}</p>
      <AppButton variant="primary" :to="localePath('/login?redirect=/shortlist')">
        {{ $t('auth.loginButton') }}
      </AppButton>
    </div>

    <!-- Loading -->
    <div v-else-if="shortlistStore.loading" class="space-y-[var(--spacing-md)]">
      <div v-for="i in 3" :key="i" class="card-base h-24 animate-pulse" />
    </div>

    <!-- Empty -->
    <div v-else-if="!shortlistStore.items.length" class="card-base text-center py-[var(--spacing-section)] text-[var(--color-steel)]">
      <p class="body-md text-[var(--color-charcoal)] mb-[var(--spacing-md)]">{{ $t('shortlist.empty') }}</p>
      <AppButton variant="primary" :to="localePath('/universities')">
        {{ $t('shortlist.browseUniversities') }}
      </AppButton>
    </div>

    <!-- List -->
    <div v-else class="space-y-[var(--spacing-md)]">
      <AppCard
        v-for="item in shortlistStore.items"
        :key="item.universityId"
      >
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-[var(--spacing-md)]">
          <div>
            <NuxtLink :to="localePath(`/universities/${item.universityId}`)" class="card-title text-[var(--color-ink)] hover:underline">
              {{ item.university?.nameZh || item.universityId }}
            </NuxtLink>
            <p class="body-sm text-[var(--color-steel)]">
              {{ item.university?.nameEn }} · {{ item.university?.country }}
            </p>
            <p v-if="item.note" class="body-sm text-[var(--color-charcoal)] mt-2">
              {{ item.note }}
            </p>
          </div>
          <div class="flex items-center gap-[var(--spacing-md)]">
            <AppBadge :variant="priorityVariant(item.priority)" :label="priorityLabel(item.priority)" />
            <AppButton variant="tertiary" size="sm" :disabled="removing[item.universityId]" @click="remove(item.universityId)">
              {{ removing[item.universityId] ? $t('shortlist.removing') : $t('shortlist.remove') }}
            </AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Actions -->
      <div class="flex flex-wrap items-center gap-[var(--spacing-md)] pt-[var(--spacing-md)]">
        <AppButton variant="primary" :disabled="shortlistStore.items.length < 2" @click="compare">
          {{ $t('shortlist.jumpCompare') }}
        </AppButton>
        <AppButton
          v-if="usage?.membership === 'premium'"
          variant="secondary"
          :disabled="exporting || !shortlistStore.items.length"
          @click="exportCsv"
        >
          {{ exporting ? '导出中…' : `导出 CSV (${usage.exportMonthlyLimit}次/月)` }}
        </AppButton>
        <AppButton
          v-else-if="authStore.isLoggedIn && usage?.membership !== 'premium'"
          variant="secondary"
          :to="localePath('/pricing')"
        >
          升级导出
        </AppButton>
        <AppButton variant="secondary" @click="clearConfirmOpen = true">
          {{ $t('shortlist.clearAll') }}
        </AppButton>
      </div>
    </div>

    <!-- 清空二次确认 — UModal 替代 confirm() -->
    <UModal v-model:open="clearConfirmOpen" :title="$t('shortlist.clearAll')">
      <template #body>
        <p class="body-md text-[var(--color-charcoal)]">
          {{ $t('shortlist.confirmClear', { count: shortlistStore.items.length }) }}
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-[var(--spacing-md)]">
          <AppButton variant="tertiary" :disabled="clearing" @click="clearConfirmOpen = false">{{ $t('common.cancel') }}</AppButton>
          <AppButton variant="primary" :disabled="clearing" @click="clearAll">
            {{ clearing ? $t('shortlist.clearing') : $t('shortlist.confirmClearButton') }}
          </AppButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
