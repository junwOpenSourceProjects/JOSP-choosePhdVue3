<script setup lang="ts">
/**
 * AppHeader · 顶部导航
 *
 * - 白底 64px，底部 hairline
 * - 桌面：brand + 导航 pill + 登录/用户
 * - 移动：抽屉菜单
 */
const route = useRoute()
const auth = useAuthStore()
const drawerOpen = ref(false)

const navItems = [
  { label: '首页', to: '/', icon: 'i-lucide-home' },
  { label: '学校库', to: '/universities', icon: 'i-lucide-library-big' },
  { label: '上传中心', to: '/upload', icon: 'i-lucide-upload' },
  { label: '我的选校', to: '/choices', icon: 'i-lucide-bookmark-check' },
  { label: '数据图表', to: '/charts', icon: 'i-lucide-line-chart' },
]

function isActive(to: string): boolean {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}

function closeDrawer() {
  drawerOpen.value = false
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[var(--color-hairline-soft)]">
    <div class="page-container flex items-center h-16 gap-6">
      <!-- Brand -->
      <NuxtLink to="/" class="flex items-center gap-2.5 shrink-0 no-underline" @click="closeDrawer">
        <span class="w-9 h-9 rounded-xl bg-ink text-white flex items-center justify-center">
          <UIcon name="i-lucide-graduation-cap" class="size-4" />
        </span>
        <span class="flex flex-col leading-tight">
          <span class="font-display text-[17px] font-semibold tracking-tight text-ink">选校系统</span>
          <span class="text-[11px] text-stone">PhD 申请助手</span>
        </span>
      </NuxtLink>

      <!-- Desktop nav pills -->
      <nav class="hidden md:flex flex-1 items-center justify-center gap-1">
        <UButton
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :variant="isActive(item.to) ? 'solid' : 'ghost'"
          :color="isActive(item.to) ? 'primary' : 'neutral'"
          size="sm"
          :icon="item.icon"
          :label="item.label"
          class="rounded-full"
        />
      </nav>

      <!-- Right account -->
      <div class="hidden md:flex items-center gap-2">
        <template v-if="auth.isLoggedIn">
          <UAvatar
            v-if="auth.avatar"
            :src="auth.avatar"
            :alt="auth.displayName"
            size="xs"
          />
          <span class="text-sm font-medium text-ink">{{ auth.displayName }}</span>
          <UButton
            label="退出"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-full"
            @click="auth.clearUser"
          />
        </template>
        <UButton
          v-else
          to="/login"
          label="登录"
          color="primary"
          variant="solid"
          size="sm"
          class="rounded-full"
        />
      </div>

      <!-- Mobile menu trigger -->
      <UButton
        :icon="drawerOpen ? 'i-lucide-x' : 'i-lucide-menu'"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        class="md:hidden ml-auto rounded-full"
        aria-label="打开菜单"
        @click="drawerOpen = !drawerOpen"
      />
    </div>

    <!-- Mobile drawer -->
    <UDrawer v-model:open="drawerOpen" direction="bottom" :ui="{ content: 'h-auto rounded-t-2xl pb-safe' }">
      <template #body>
        <div class="flex flex-col gap-2 p-2 pb-4">
          <UButton
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :variant="isActive(item.to) ? 'solid' : 'ghost'"
            :color="isActive(item.to) ? 'primary' : 'neutral'"
            size="md"
            :icon="item.icon"
            :label="item.label"
            block
            class="justify-start rounded-full"
            @click="closeDrawer"
          />
          <div class="h-px bg-[var(--color-hairline-soft)] my-1" />
          <UButton
            v-if="auth.isLoggedIn"
            label="退出登录"
            color="neutral"
            variant="outline"
            size="md"
            block
            class="rounded-full"
            @click="auth.clearUser(); closeDrawer()"
          />
          <UButton
            v-else
            to="/login"
            label="登录"
            color="primary"
            variant="solid"
            size="md"
            block
            class="rounded-full"
            @click="closeDrawer"
          />
        </div>
      </template>
    </UDrawer>
  </header>
</template>
