<script setup lang="ts">
import { login } from '~/lib/api/user'

useHead({ title: '登录 · 选校系统' })

const auth = useAuthStore()

const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref<string | null>(null)
const showPassword = ref(false)
const remember = ref(true)

async function submit() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = null
  try {
    const res = await login({
      username: username.value.trim(),
      password: password.value
    })
    auth.setUser(res.data)
    await navigateTo('/choices')
  } catch (e: any) {
    const msg = e?.data?.msg || e?.message || '登录失败'
    error.value = msg
  } finally {
    loading.value = false
  }
}

function fillAdmin() {
  username.value = 'admin'
  password.value = 'admin123'
}
</script>

<template>
  <div class="login-shell">
    <!-- 左: brand panel -->
    <aside class="login-brand">
      <div class="login-brand__inner">
        <NuxtLink to="/" class="login-brand__logo">
          <div class="login-brand__mark">
            <UIcon name="i-lucide-graduation-cap" class="size-5" />
          </div>
          <div>
            <div class="login-brand__name">选校系统</div>
            <div class="login-brand__sub">PhD 申请助手</div>
          </div>
        </NuxtLink>

        <div class="login-brand__hero">
          <UBadge color="primary" variant="solid" size="md">
            <UIcon name="i-lucide-sparkles" class="size-3.5" />
            <span class="ml-1.5 t-caption-bold">PhD 选校 · 数据驱动决策</span>
          </UBadge>
          <h1 class="t-hero login-brand__title">
            登录<br />开始你的<br />选校之旅
          </h1>
          <p class="t-subtitle login-brand__lead">
            9 大排名体系 · 综合 + 计算机双维度 · 历年趋势 + 院校对比
          </p>
        </div>

        <div class="login-brand__stats">
          <div class="login-stat">
            <div class="login-stat__value">2,884</div>
            <div class="login-stat__label">覆盖大学</div>
          </div>
          <div class="login-stat__sep" />
          <div class="login-stat">
            <div class="login-stat__value">9</div>
            <div class="login-stat__label">排名体系</div>
          </div>
          <div class="login-stat__sep" />
          <div class="login-stat">
            <div class="login-stat__value">10y</div>
            <div class="login-stat__label">历年数据</div>
          </div>
        </div>

        <div class="login-brand__features">
          <div class="login-feature">
            <UIcon name="i-lucide-database" class="size-4 text-brand" />
            <span class="t-body-sm">9 大权威排名体系聚合</span>
          </div>
          <div class="login-feature">
            <UIcon name="i-lucide-bar-chart-3" class="size-4 text-brand" />
            <span class="t-body-sm">历年趋势 + 多维对比</span>
          </div>
          <div class="login-feature">
            <UIcon name="i-lucide-bookmark-check" class="size-4 text-brand" />
            <span class="t-body-sm">「考虑 / 不考虑」状态管理</span>
          </div>
        </div>
      </div>
      <div class="login-brand__foot">
        © {{ new Date().getFullYear() }} 选校系统 · 数据驱动选校决策
      </div>
    </aside>

    <!-- 右: 登录表单 -->
    <main class="login-form-wrap">
      <div class="login-form">
        <div class="login-form__head">
          <h2 class="t-h2">欢迎回来</h2>
          <p class="t-body-sm text-muted mt-1">登录账户继续你的选校决策</p>
        </div>

        <form class="login-form__body" @submit.prevent="submit">
          <UFormField label="用户名" required>
            <UInput
              v-model="username"
              icon="i-lucide-user"
              placeholder="请输入用户名"
              size="lg"
              autocomplete="username"
              :ui="{ leadingIcon: 'size-4' }"
            />
          </UFormField>

          <UFormField label="密码" required>
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              icon="i-lucide-lock"
              placeholder="请输入密码"
              size="lg"
              autocomplete="current-password"
              :ui="{ leadingIcon: 'size-4', trailingIcon: 'size-4' }"
            >
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  square
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <div class="login-form__extras">
            <UCheckbox v-model="remember" label="记住登录状态" />
            <UButton variant="ghost" color="primary" size="sm" label="忘记密码?" class="rounded-full" />
          </div>

          <UAlert v-if="error" color="error" variant="subtle" :title="error" icon="i-lucide-alert-circle" />

          <UButton
            type="submit"
            color="primary"
            variant="solid"
            size="lg"
            block
            :loading="loading"
            icon="i-lucide-log-in"
            label="登录"
            class="rounded-full login-form__submit"
          />

          <div class="login-form__divider"><span>或</span></div>

          <UButton
            type="button"
            color="neutral"
            variant="outline"
            size="lg"
            block
            icon="i-lucide-key-round"
            label="使用测试账号 admin"
            class="rounded-full"
            @click="fillAdmin"
          />
        </form>

        <div class="login-form__foot">
          <span class="t-caption text-muted">还没有账号?</span>
          <UButton variant="ghost" color="primary" size="sm" label="联系管理员" class="rounded-full" />
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* ========== 双栏布局 ========== */
.login-shell {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr;
}
@media (min-width: 1024px) {
  .login-shell { grid-template-columns: 1fr 1fr; }
}

/* ========== 左 brand panel ========== */
.login-brand {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: var(--color-canvas);
  padding: 48px 56px;
  border-right: 1px solid var(--color-hairline);
}
@media (max-width: 1023px) {
  .login-brand { display: none; }
}
.login-brand__inner { display: flex; flex-direction: column; gap: 48px; }
.login-brand__logo {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
}
.login-brand__mark {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  background: var(--color-brand-blue);
  color: var(--color-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
}
.login-brand__name {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  color: var(--color-ink);
}
.login-brand__sub {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 400;
  color: var(--color-stone);
  margin-top: 2px;
}
.login-brand__hero {
  display: flex;
  flex-direction: column;
  gap: 20px;
  max-width: 520px;
}
.login-brand__title { margin: 0; }
.login-brand__lead { margin: 0; color: var(--color-slate); }

.login-brand__features {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 8px;
}
.login-brand__stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 24px 0;
  border-top: 1px solid var(--color-hairline);
  border-bottom: 1px solid var(--color-hairline);
}
.login-stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}
.login-stat__value {
  font-family: var(--font-display);
  font-size: 40px;
  font-weight: 600;
  line-height: 1.10;
  color: var(--color-ink);
  letter-spacing: -1px;
  font-variant-numeric: tabular-nums;
}
.login-stat__label {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-stone);
}
.login-stat__sep {
  width: 1px;
  height: 48px;
  background: var(--color-hairline);
}
.login-feature {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-hairline-soft);
  border-radius: 12px;
}

.login-brand__foot {
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--color-stone);
}

/* ========== 右 form ========== */
.login-form-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 32px;
  background: var(--color-canvas);
}
.login-form {
  width: 100%;
  max-width: 440px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}
.login-form__head { text-align: left; }

.login-form__body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-form__extras {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.login-form__submit { margin-top: 4px; }

.login-form__divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 4px 0;
  font-size: 12px;
  color: var(--color-stone);
}
.login-form__divider::before,
.login-form__divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--color-hairline);
}

.login-form__foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding-top: 16px;
  border-top: 1px solid var(--color-hairline-soft);
}
</style>