<script setup lang="ts">
useHead({ title: '我的选校清单' })

const authStore = useAuthStore()
const shortlistStore = useShortlistStore()
const router = useRouter()

onMounted(() => {
  if (authStore.isLoggedIn) {
    shortlistStore.fetchShortlist()
  }
})

const priorityLabel = (priority: number) => {
  const map: Record<number, string> = { 1: '强意向', 2: '中意向', 3: '弱意向', 4: '不考虑' }
  return map[priority] || '未知'
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
  router.push(`/compare?ids=${ids}`)
}
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">我的选校清单</h1>
    <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">
      管理你的目标院校，按优先级分组。
    </p>

    <!-- Login CTA -->
    <div v-if="!authStore.isLoggedIn" class="card-base text-center py-[var(--spacing-section)]">
      <p class="body-md text-[var(--color-charcoal)] mb-[var(--spacing-md)]">请登录后查看选校清单</p>
      <AppButton variant="primary" to="/login?redirect=/shortlist">
        前往登录
      </AppButton>
    </div>

    <!-- Loading -->
    <div v-else-if="shortlistStore.loading" class="space-y-[var(--spacing-md)]">
      <div v-for="i in 3" :key="i" class="card-base h-24 animate-pulse" />
    </div>

    <!-- Empty -->
    <div v-else-if="!shortlistStore.items.length" class="card-base text-center py-[var(--spacing-section)] text-[var(--color-steel)]">
      <p class="body-md text-[var(--color-charcoal)] mb-[var(--spacing-md)]">清单为空</p>
      <AppButton variant="primary" to="/universities">
        去院校库添加
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
            <NuxtLink :to="`/universities/${item.universityId}`" class="card-title text-[var(--color-ink)] hover:underline">
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
              {{ removing[item.universityId] ? '移除中…' : '移除' }}
            </AppButton>
          </div>
        </div>
      </AppCard>

      <!-- Actions -->
      <div class="flex flex-wrap gap-[var(--spacing-md)] pt-[var(--spacing-md)]">
        <AppButton variant="primary" :disabled="shortlistStore.items.length < 2" @click="compare">
          跳转对比
        </AppButton>
        <AppButton variant="secondary" @click="clearConfirmOpen = true">
          清空清单
        </AppButton>
      </div>
    </div>

    <!-- 清空二次确认 — UModal 替代 confirm() -->
    <UModal v-model:open="clearConfirmOpen" title="清空选校清单">
      <template #body>
        <p class="body-md text-[var(--color-charcoal)]">
          清单中所有 {{ shortlistStore.items.length }} 所院校将被移除，此操作不可恢复。
        </p>
      </template>
      <template #footer>
        <div class="flex justify-end gap-[var(--spacing-md)]">
          <AppButton variant="tertiary" :disabled="clearing" @click="clearConfirmOpen = false">取消</AppButton>
          <AppButton variant="primary" :disabled="clearing" @click="clearAll">
            {{ clearing ? '清空中…' : '确认清空' }}
          </AppButton>
        </div>
      </template>
    </UModal>
  </div>
</template>
