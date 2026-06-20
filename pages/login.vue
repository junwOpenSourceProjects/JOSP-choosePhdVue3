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
  <div class="grid min-h-[calc(100vh-200px)] grid-cols-1 lg:grid-cols-2">
    <!-- 左: 登录表单 -->
    <div class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-sm space-y-6">
        <div>
          <div
            class="mb-4 inline-flex size-12 items-center justify-center rounded-2xl text-white"
            :style="{ background: 'var(--gradient-card-featured)' }"
          >
            <UIcon name="i-lucide-log-in" class="size-6" />
          </div>
          <h1
            class="text-[32px] font-medium leading-[1.10] tracking-tight text-default sm:text-[40px]"
            :style="{ fontFamily: 'var(--font-display)' }"
          >管理员登录</h1>
          <p class="mt-2 text-sm text-muted">登录后可执行数据初始化等管理操作</p>
        </div>

        <!-- 安全横幅 -->
        <UAlert
          color="info"
          variant="subtle"
          icon="i-lucide-shield-alert"
          title="安全提示"
          description="本系统为内部使用，请勿在公共网络下输入凭证"
        />

        <form class="space-y-4" @submit.prevent="onSubmit">
          <UFormField label="用户名" size="md">
            <UInput
              v-model="username"
              type="text"
              placeholder="请输入用户名"
              icon="i-lucide-user"
              size="md"
              block
              autocomplete="username"
            />
          </UFormField>
          <UFormField label="密码" size="md">
            <UInput
              v-model="password"
              type="password"
              placeholder="请输入密码"
              icon="i-lucide-lock"
              size="md"
              block
              autocomplete="current-password"
            />
          </UFormField>
          <UAlert
            v-if="error"
            color="error"
            variant="subtle"
            :title="error"
            icon="i-lucide-alert-circle"
            :close-button="{ onClick: () => error = null }"
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

        <p class="text-center text-[12px] text-muted">
          忘记密码?请联系系统管理员重置
        </p>
      </div>
    </div>

    <!-- 右: 品牌视觉锚点 -->
    <div
      class="hero-with-orb relative hidden items-center justify-center overflow-hidden p-10 lg:flex"
      :style="{ background: 'var(--gradient-card-featured)' }"
    >
      <div class="relative z-10 max-w-md text-white">
        <div class="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1.5 text-[13px] font-semibold" :style="{ backdropFilter: 'blur(8px)' }">
          <UIcon name="i-lucide-graduation-cap" class="size-4" />
          选校系统 · 管理员后台
        </div>
        <h2
          class="text-[40px] font-medium leading-[1.10] tracking-tight sm:text-[48px]"
          :style="{ fontFamily: 'var(--font-display)' }"
        >数据驱动<br />选校决策</h2>
        <p class="mt-4 text-base text-white/85 leading-relaxed">
          管理员可一键初始化排名数据、刷新最新数据、维护大学标签、监控系统状态。
        </p>
        <div class="mt-8 grid grid-cols-2 gap-3">
          <div class="rounded-2xl border border-white/20 bg-white/10 p-4" :style="{ backdropFilter: 'blur(8px)' }">
            <UIcon name="i-lucide-database" class="size-5" />
            <div class="mt-2 text-[13px] font-semibold">数据初始化</div>
            <div class="mt-0.5 text-[11px] text-white/70">从 QS 文件导入</div>
          </div>
          <div class="rounded-2xl border border-white/20 bg-white/10 p-4" :style="{ backdropFilter: 'blur(8px)' }">
            <UIcon name="i-lucide-refresh-cw" class="size-5" />
            <div class="mt-2 text-[13px] font-semibold">刷新排名</div>
            <div class="mt-0.5 text-[11px] text-white/70">同步最新数据</div>
          </div>
          <div class="rounded-2xl border border-white/20 bg-white/10 p-4" :style="{ backdropFilter: 'blur(8px)' }">
            <UIcon name="i-lucide-tags" class="size-5" />
            <div class="mt-2 text-[13px] font-semibold">标签维护</div>
            <div class="mt-0.5 text-[11px] text-white/70">国家/地区映射</div>
          </div>
          <div class="rounded-2xl border border-white/20 bg-white/10 p-4" :style="{ backdropFilter: 'blur(8px)' }">
            <UIcon name="i-lucide-activity" class="size-5" />
            <div class="mt-2 text-[13px] font-semibold">系统状态</div>
            <div class="mt-0.5 text-[11px] text-white/70">健康监控</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
