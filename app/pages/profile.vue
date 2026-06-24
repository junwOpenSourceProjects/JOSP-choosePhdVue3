<script setup lang="ts">
useHead({ title: '个人中心' })

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (!authStore.isLoggedIn) {
    navigateTo('/login?redirect=/profile')
  }
})

const logout = () => {
  authStore.logout()
}
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">个人中心</h1>

    <div v-if="!authStore.isLoggedIn" class="card-base text-center py-[var(--spacing-section)]">
      <p class="body-md text-[var(--color-charcoal)] mb-[var(--spacing-md)]">请登录后查看个人中心</p>
      <AppButton variant="primary" to="/login?redirect=/profile">
        前往登录
      </AppButton>
    </div>

    <AppCard v-else variant="feature">
      <div class="flex items-center gap-[var(--spacing-md)] mb-[var(--spacing-xl)]">
        <div class="w-16 h-16 rounded-[var(--rounded-full)] bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center text-xl font-semibold">
          {{ authStore.user?.username?.slice(0, 2).toUpperCase() || 'ME' }}
        </div>
        <div>
          <h2 class="heading-sm text-[var(--color-ink)]">{{ authStore.user?.username }}</h2>
          <p class="body-sm text-[var(--color-steel)]">角色：{{ authStore.user?.role }}</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-[var(--spacing-md)]">
        <AppButton variant="primary" to="/shortlist">
          我的清单
        </AppButton>
        <AppButton variant="secondary" @click="logout">
          退出登录
        </AppButton>
      </div>
    </AppCard>
  </div>
</template>
