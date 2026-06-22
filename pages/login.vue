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

const brandStats = [
  { value: '2,884', label: '覆盖大学' },
  { value: '9', label: '排名体系' },
  { value: '10y', label: '历年数据' },
]

const brandFeatures = [
  { icon: 'i-lucide-database', text: '9 大权威排名体系聚合' },
  { icon: 'i-lucide-bar-chart-3', text: '历年趋势 + 多维对比' },
  { icon: 'i-lucide-bookmark-check', text: '「考虑 / 不考虑」状态管理' },
]

async function submit() {
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码'
    return
  }
  loading.value = true
  error.value = null
  try {
    await login({
      username: username.value.trim(),
      password: password.value,
    })
    await auth.fetchUser()
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
  <div class="min-h-[calc(100vh-64px)] grid grid-cols-1 lg:grid-cols-2">
    <!-- 左：品牌面板 -->
    <aside class="hidden lg:flex flex-col justify-between bg-ink text-white p-12 xl:p-14">
      <div class="flex flex-col gap-12">
        <NuxtLink to="/" class="flex items-center gap-3 no-underline">
          <span class="w-11 h-11 rounded-[14px] bg-white text-ink flex items-center justify-center">
            <UIcon name="i-lucide-graduation-cap" class="size-5" />
          </span>
          <div>
            <div class="font-display text-xl font-semibold text-white">选校系统</div>
            <div class="text-xs text-white/60 mt-0.5">PhD 申请助手</div>
          </div>
        </NuxtLink>

        <div class="flex flex-col gap-5 max-w-lg">
          <span class="inline-flex items-center gap-1.5 w-fit px-3 py-1.5 rounded-full bg-white/10 text-[13px] font-semibold">
            <UIcon name="i-lucide-sparkles" class="size-4" />
            PhD 选校 · 数据驱动决策
          </span>
          <h1 class="font-display text-5xl xl:text-6xl font-semibold leading-[1.05] tracking-tight text-white">
            登录<br />开始你的<br />选校之旅
          </h1>
          <p class="text-lg font-medium text-white/70">
            9 大排名体系 · 综合 + 计算机双维度 · 历年趋势 + 院校对比
          </p>
        </div>

        <div class="flex items-center gap-6 py-6 border-y border-white/10 max-w-lg">
          <div v-for="stat in brandStats" :key="stat.label" class="flex-1">
            <div class="font-display text-4xl xl:text-5xl font-semibold tracking-tight text-white">{{ stat.value }}</div>
            <div class="text-xs text-white/50 mt-1.5">{{ stat.label }}</div>
          </div>
        </div>

        <div class="flex flex-col gap-3 max-w-lg">
          <div v-for="f in brandFeatures" :key="f.text" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10">
            <UIcon :name="f.icon" class="size-4 text-white/80" />
            <span class="text-sm font-medium text-white/90">{{ f.text }}</span>
          </div>
        </div>
      </div>

      <div class="text-xs text-white/40">
        © {{ new Date().getFullYear() }} 选校系统 · 数据驱动选校决策
      </div>
    </aside>

    <!-- 右：登录表单 -->
    <main class="flex items-center justify-center bg-white px-6 py-12 md:py-16">
      <div class="w-full max-w-md flex flex-col gap-8">
        <div>
          <h2 class="t-h2">欢迎回来</h2>
          <p class="t-body-sm text-muted mt-1">登录账户继续你的选校决策</p>
        </div>

        <form class="flex flex-col gap-5" @submit.prevent="submit">
          <UFormField label="用户名" required>
            <UInput
              v-model="username"
              size="lg"
              placeholder="请输入用户名"
              autocomplete="username"
              class="w-full"
            >
              <template #leading>
                <UIcon name="i-lucide-user" class="size-4 text-stone" />
              </template>
            </UInput>
          </UFormField>

          <UFormField label="密码" required>
            <UInput
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              size="lg"
              placeholder="请输入密码"
              autocomplete="current-password"
              class="w-full"
            >
              <template #leading>
                <UIcon name="i-lucide-lock" class="size-4 text-stone" />
              </template>
              <template #trailing>
                <UButton
                  :icon="showPassword ? 'i-lucide-eye-off' : 'i-lucide-eye'"
                  color="neutral"
                  variant="ghost"
                  size="xs"
                  square
                  class="rounded-full"
                  aria-label="切换密码可见性"
                  @click="showPassword = !showPassword"
                />
              </template>
            </UInput>
          </UFormField>

          <div class="flex items-center justify-between flex-wrap gap-2">
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
            class="rounded-full mt-1"
          />

          <div class="flex items-center gap-3 my-1 text-xs text-stone">
            <span class="h-px flex-1 bg-hairline" />
            <span>或</span>
            <span class="h-px flex-1 bg-hairline" />
          </div>

          <UButton
            type="button"
            color="primary"
            variant="outline"
            size="lg"
            block
            icon="i-lucide-key-round"
            label="使用测试账号 admin"
            class="rounded-full bg-white"
            @click="fillAdmin"
          />
        </form>

        <div class="flex items-center justify-center gap-2 pt-4 border-t border-hairline-soft">
          <span class="t-caption text-muted">还没有账号?</span>
          <UButton variant="ghost" color="primary" size="sm" label="联系管理员" class="rounded-full" />
        </div>
      </div>
    </main>
  </div>
</template>
