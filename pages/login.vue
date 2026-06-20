<script setup lang="ts">
import { login } from '~/lib/api/user'

useHead({ title: '登录 · 选校系统' })

const username = ref<string | undefined>(undefined)
const password = ref<string | undefined>(undefined)
const loading = ref(false)
const error = ref<string | null>(null)
const router = useRouter()

async function onSubmit() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = null
  try {
    const res: any = await login({ username: username.value, password: password.value })
    if (res?.code === 20000) {
      await router.push('/')
    } else {
      error.value = res?.msg || '登录失败'
    }
  } catch (e: any) {
    error.value = e?.data?.msg || e?.message || '登录请求失败'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex min-h-[60vh] items-center justify-center px-4 py-10">
    <UCard
      :ui="{
        root: 'w-full max-w-md rounded-2xl border border-default bg-white shadow-sm',
        body: 'p-8 space-y-6'
      }"
    >
      <div>
        <div class="mb-2 inline-flex size-10 items-center justify-center rounded-xl bg-[var(--color-brand-900)] text-white">
          <UIcon name="i-lucide-log-in" class="size-5" />
        </div>
        <h1
          class="text-2xl font-semibold leading-tight text-default"
          :style="{ fontFamily: 'var(--font-display)' }"
        >管理员登录</h1>
        <p class="mt-1.5 text-sm text-muted">登录后可执行数据初始化等管理操作</p>
      </div>

      <form class="space-y-4" @submit.prevent="onSubmit">
        <UFormField label="用户名" size="md">
          <UInput
            v-model="username"
            type="text"
            placeholder="admin"
            icon="i-lucide-user"
            size="md"
            block
          />
        </UFormField>
        <UFormField label="密码" size="md">
          <UInput
            v-model="password"
            type="password"
            placeholder="admin"
            icon="i-lucide-lock"
            size="md"
            block
          />
        </UFormField>
        <UAlert
          v-if="error"
          color="error"
          variant="subtle"
          :title="error"
          icon="i-lucide-alert-circle"
        />
        <UButton
          type="submit"
          color="primary"
          variant="solid"
          size="lg"
          block
          :loading="loading"
          :label="loading ? '登录中…' : '登录'"
          icon="i-lucide-log-in"
        />
      </form>
    </UCard>
  </div>
</template>
