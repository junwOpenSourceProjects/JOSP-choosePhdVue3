<script setup lang="ts">
const localePath = useLocalePath()
const { t } = useI18n()

useHead({ title: () => t('auth.profile') })

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
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">{{ $t('auth.profile') }}</h1>

    <div v-if="!authStore.isLoggedIn" class="card-base text-center py-[var(--spacing-section)]">
      <p class="body-md text-[var(--color-charcoal)] mb-[var(--spacing-md)]">{{ $t('auth.loginPrompt') }}</p>
      <AppButton variant="primary" :to="localePath('/login?redirect=/profile')">
        {{ $t('auth.loginButton') }}
      </AppButton>
    </div>

    <AppCard v-else variant="feature">
      <div class="flex items-center gap-[var(--spacing-md)] mb-[var(--spacing-xl)]">
        <div class="w-16 h-16 rounded-[var(--rounded-full)] bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center text-xl font-semibold">
          {{ authStore.user?.username?.slice(0, 2).toUpperCase() || 'ME' }}
        </div>
        <div>
          <h2 class="heading-sm text-[var(--color-ink)]">{{ authStore.user?.username }}</h2>
          <p class="body-sm text-[var(--color-steel)]">{{ $t('auth.role') }}：{{ authStore.user?.role }}</p>
        </div>
      </div>

      <div class="flex flex-wrap gap-[var(--spacing-md)]">
        <AppButton variant="primary" :to="localePath('/shortlist')">
          {{ $t('auth.myShortlist') }}
        </AppButton>
        <AppButton variant="secondary" @click="logout">
          {{ $t('auth.logout') }}
        </AppButton>
      </div>
    </AppCard>
  </div>
</template>
