<script setup lang="ts">
import { login } from '~/lib/api/user'

definePageMeta({ layout: 'default' })

useHead({ title: '登录 · 选校系统' })

const username = ref('')
const password = ref('')
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
  <div class="login-page">
    <div class="login-card">
      <h1 class="login-title">管理员登录</h1>
      <p class="login-sub">登录后可执行数据初始化等管理操作</p>
      <form class="login-form" @submit.prevent="onSubmit">
        <div class="login-field">
          <label>用户名</label>
          <input v-model="username" type="text" placeholder="admin" />
        </div>
        <div class="login-field">
          <label>密码</label>
          <input v-model="password" type="password" placeholder="admin" />
        </div>
        <div v-if="error" class="login-error">
          {{ error }}
        </div>
        <button type="submit" class="login-submit" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.login-card {
  width: 100%;
  max-width: 400px;
  background: #fff;
  border: 1px solid var(--color-border-light);
  border-radius: 20px;
  padding: 32px;
  box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}
.login-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}
.login-sub {
  font-size: 13px;
  color: var(--color-ink-700);
  margin: 8px 0 24px;
}
.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.login-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.login-field label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-ink-700);
}
.login-field input {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: 10px;
  font-size: 14px;
  outline: none;
}
.login-field input:focus {
  border-color: var(--color-brand-900);
}
.login-error {
  padding: 10px 12px;
  background: #fef2f2;
  color: #b91c1c;
  border-radius: 10px;
  font-size: 13px;
}
.login-submit {
  padding: 12px;
  background: var(--color-brand-900);
  color: #fff;
  border: 0;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 200ms ease;
}
.login-submit:hover:not(:disabled) {
  background: var(--color-brand-700);
}
.login-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
