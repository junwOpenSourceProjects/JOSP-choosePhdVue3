<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()

useHead({ title: t('auth.register') })

definePageMeta({ layout: 'centered' })

const router = useRouter()
const authStore = useAuthStore()

if (authStore.isLoggedIn) {
  await navigateTo(localePath('/'))
}

const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref('')

const submit = async () => {
  if (!username.value || !password.value) {
    error.value = t('auth.registerError')
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await authStore.register({ username: username.value, password: password.value })
    await authStore.login({ username: username.value, password: password.value })
    await router.push(localePath('/'))
  } catch (err: any) {
    error.value = err?.message || err?.data?.message || t('auth.registerError')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="text-center mb-[var(--spacing-xl)]">
    <NuxtLink :to="localePath('/')" class="inline-flex items-center gap-[var(--spacing-xs)] text-[var(--color-ink)] font-semibold text-xl tracking-tight mb-[var(--spacing-md)]">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#0A0A0A" />
        <path d="M8 12L16 8L24 12L16 16L8 12Z" fill="#1456F0" />
      </svg>
      choosePhd
    </NuxtLink>
    <h1 class="heading-md text-[var(--color-ink)]">{{ $t('auth.register') }}</h1>
    <p class="body-sm text-[var(--color-steel)] mt-1">创建 choosePhd 账号</p>
  </div>

  <form class="space-y-[var(--spacing-md)]" @submit.prevent="submit">
    <div>
      <label for="username" class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">{{ $t('auth.username') }}</label>
      <input
        id="username"
        v-model="username"
        type="text"
        class="text-input"
        :placeholder="$t('auth.username')"
        autocomplete="username"
        required
      >
    </div>

    <div>
      <label for="password" class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">{{ $t('auth.password') }}</label>
      <input
        id="password"
        v-model="password"
        type="password"
        class="text-input"
        placeholder="••••••"
        autocomplete="new-password"
        required
      >
    </div>

    <div>
      <label for="confirmPassword" class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">{{ $t('auth.confirmPassword') }}</label>
      <input
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        class="text-input"
        placeholder="••••••"
        autocomplete="new-password"
        required
      >
    </div>

    <div v-if="error" class="px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-[var(--rounded-md)] bg-[#fff1f1] text-[var(--color-error)] body-sm">
      {{ error }}
    </div>

    <AppButton variant="primary" type="submit" class="w-full justify-center" :disabled="loading">
      {{ loading ? '...' : $t('auth.registerButton') }}
    </AppButton>
  </form>

  <div class="mt-[var(--spacing-xl)] text-center body-sm text-[var(--color-steel)]">
    {{ $t('auth.hasAccount') }}
    <NuxtLink :to="localePath('/login')" class="text-[var(--color-brand-blue-deep)] hover:underline">{{ $t('auth.goLogin') }}</NuxtLink>
  </div>
</template>
