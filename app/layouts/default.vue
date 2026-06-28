<script setup lang="ts">
const auth = useAuthStore()
const router = useRouter()

const onLogout = () => {
  auth.logout()
}

// 顶部搜索按钮 — 跳到院校库。useRouter() 替代 navigateTo() (typecheck 兼容)
const goSearch = () => {
  router.push('/universities')
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
    <!-- Top Navigation -->
    <header class="sticky top-0 z-50 h-16 bg-[var(--color-canvas)] border-b border-[var(--color-hairline-soft)]">
      <div class="container-page h-full flex items-center justify-between">
        <div class="flex items-center gap-8">
          <NuxtLink to="/" class="text-[var(--color-ink-strong)] font-semibold text-xl tracking-tight">
            choosePhd
          </NuxtLink>
          <nav class="hidden md:flex items-center gap-6 body-sm text-[var(--color-charcoal)]">
            <NuxtLink to="/" class="hover:text-[var(--color-ink)]">首页</NuxtLink>
            <NuxtLink to="/rankings" class="hover:text-[var(--color-ink)]">榜单</NuxtLink>
            <NuxtLink to="/universities" class="hover:text-[var(--color-ink)]">大学</NuxtLink>
            <NuxtLink to="/subjects" class="hover:text-[var(--color-ink)]">学科</NuxtLink>
            <NuxtLink to="/compare" class="hover:text-[var(--color-ink)]">对比</NuxtLink>
            <NuxtLink
              v-if="auth.isAdmin"
              to="/admin/scrape-audit"
              class="text-[var(--color-ink-strong)] font-medium hover:text-[var(--color-ink)]"
            >
              管理
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <AppButton
            variant="link"
            aria-label="搜索"
            :ui="{ base: 'btn-icon-circular text-[var(--color-ink)]' }"
            @click="goSearch"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
          </AppButton>

          <template v-if="auth.isLoggedIn">
            <NuxtLink to="/shortlist" class="body-sm-medium text-[var(--color-charcoal)] hover:text-[var(--color-ink)] hidden sm:inline-flex">
              选校清单
            </NuxtLink>
            <div class="flex items-center gap-2 ml-2">
              <div class="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-xs font-semibold border border-[var(--color-hairline)]">
                {{ auth.user?.username?.slice(0, 2).toUpperCase() || 'ME' }}
              </div>
              <AppButton variant="link" size="sm" :ui="{ base: 'text-[var(--color-steel)] hover:text-[var(--color-ink)]' }" @click="onLogout">
                退出
              </AppButton>
            </div>
          </template>

          <template v-else>
            <AppButton variant="secondary" size="sm" to="/login">登录</AppButton>
            <AppButton variant="primary" size="sm" to="/register">注册</AppButton>
          </template>
        </div>
      </div>
    </header>

    <!-- Page content will be injected here -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-[var(--color-footer-bg)] text-[var(--color-on-dark)]">
      <div class="container-page py-[var(--spacing-section)] grid grid-cols-1 md:grid-cols-4 gap-10">
        <div class="space-y-4">
          <div class="font-semibold text-lg">choosePhd</div>
          <p class="text-[var(--color-muted)] body-sm">
            帮你选对博士/硕士项目的择校助手。
          </p>
        </div>

        <div>
          <h4 class="body-sm-medium mb-4">榜单</h4>
          <ul class="space-y-2 text-[var(--color-muted)] body-sm">
            <li><NuxtLink to="/rankings" class="hover:text-[var(--color-on-dark)]">综合排名</NuxtLink></li>
            <li><NuxtLink to="/rankings?region=global" class="hover:text-[var(--color-on-dark)]">世界大学</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="body-sm-medium mb-4">工具</h4>
          <ul class="space-y-2 text-[var(--color-muted)] body-sm">
            <li><NuxtLink to="/compare" class="hover:text-[var(--color-on-dark)]">院校对比</NuxtLink></li>
            <li><NuxtLink to="/shortlist" class="hover:text-[var(--color-on-dark)]">选校清单</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="body-sm-medium mb-4">账户</h4>
          <ul class="space-y-2 text-[var(--color-muted)] body-sm">
            <li><NuxtLink to="/login" class="hover:text-[var(--color-on-dark)]">登录</NuxtLink></li>
            <li><NuxtLink to="/register" class="hover:text-[var(--color-on-dark)]">注册</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="container-page py-6 border-t border-[var(--color-charcoal)] text-[var(--color-muted)] micro">
        © {{ new Date().getFullYear() }} choosePhd. All rights reserved.
      </div>
    </footer>
  </div>
</template>
