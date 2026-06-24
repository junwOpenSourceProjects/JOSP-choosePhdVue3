<script setup lang="ts">
useHead({ title: '登录' })

definePageMeta({ layout: 'centered' })

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

if (authStore.isLoggedIn) {
  await navigateTo('/')
}

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

const submit = async () => {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = ''
  try {
    await authStore.login({ username: username.value, password: password.value })
    const redirect = (route.query.redirect as string) || '/'
    await router.push(redirect)
  } catch (err: any) {
    error.value = err?.message || err?.data?.message || '登录失败，请重试'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="text-center mb-[var(--spacing-xl)]">
    <NuxtLink to="/" class="inline-flex items-center gap-[var(--spacing-xs)] text-[var(--color-ink)] font-semibold text-xl tracking-tight mb-[var(--spacing-md)]">
      <svg width="24" height="24" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <rect width="32" height="32" rx="6" fill="#0A0A0A" />
        <path d="M8 12L16 8L24 12L16 16L8 12Z" fill="#1456F0" />
      </svg>
      choosePhd
    </NuxtLink>
    <h1 class="heading-md text-[var(--color-ink)]">登录</h1>
    <p class="body-sm text-[var(--color-steel)] mt-1">使用账号密码登录</p>
  </div>

  <form class="space-y-[var(--spacing-md)]" @submit.prevent="submit">
    <div>
      <label for="username" class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">用户名</label>
      <input
        id="username"
        v-model="username"
        type="text"
        class="text-input"
        placeholder="用户名"
        autocomplete="username"
        required
      >
    </div>

    <div>
      <label for="password" class="body-sm-medium text-[var(--color-charcoal)] block mb-[var(--spacing-xs)]">密码</label>
      <input
        id="password"
        v-model="password"
        type="password"
        class="text-input"
        placeholder="••••••"
        autocomplete="current-password"
        required
      >
    </div>

    <div v-if="error" class="px-[var(--spacing-md)] py-[var(--spacing-sm)] rounded-[var(--rounded-md)] bg-[#fff1f1] text-[var(--color-error)] body-sm">
      {{ error }}
    </div>

    <AppButton variant="primary" type="submit" class="w-full justify-center" :disabled="loading">
      {{ loading ? '登录中…' : '登录' }}
    </AppButton>
  </form>

  <div class="mt-[var(--spacing-xl)] text-center body-sm text-[var(--color-steel)]">
    还没有账号？
    <NuxtLink to="/register" class="text-[var(--color-brand-blue-deep)] hover:underline">立即注册</NuxtLink>
  </div>
</template>
