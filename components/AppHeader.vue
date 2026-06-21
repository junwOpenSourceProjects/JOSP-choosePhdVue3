<script setup lang="ts">
/**
 * DESIGN.md §Top Navigation (Marketing)
 * 白底 + 64px 高 + 底边 1px hairline-soft
 * 左: wordmark + 副标 · 中: link list · 右: 黑色 pill "登录" / 头像 + 退出
 */
const route = useRoute()
const open = ref(false)
const auth = useAuthStore()

const navItems = [
  { label: '首页', to: '/', icon: 'i-lucide-home' },
  { label: '学校库', to: '/universities', icon: 'i-lucide-library-big' },
  { label: '上传中心', to: '/upload', icon: 'i-lucide-upload' },
  { label: '我的选校', to: '/choices', icon: 'i-lucide-bookmark-check' },
  { label: '数据图表', to: '/charts', icon: 'i-lucide-line-chart' }
]

function close() { open.value = false }
const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <header class="nav-root">
    <div class="nav-inner">
      <!-- 左: brand -->
      <NuxtLink to="/" class="brand" @click="close">
        <div class="brand__mark">
          <UIcon name="i-lucide-graduation-cap" class="size-4" />
        </div>
        <div class="brand__txt">
          <span class="brand__name">选校系统</span>
          <span class="brand__sub">PhD 申请助手</span>
        </div>
      </NuxtLink>

      <!-- 中: 桌面 nav -->
      <nav class="nav-list">
        <UButton
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :variant="isActive(item.to) ? 'solid' : 'ghost'"
          :color="isActive(item.to) ? 'primary' : 'neutral'"
          size="sm"
          :label="item.label"
          class="rounded-full"
        />
      </nav>

      <!-- 右: 账户 -->
      <div class="nav-right">
        <template v-if="auth.isLoggedIn">
          <UAvatar
            v-if="auth.avatar"
            :src="auth.avatar"
            :alt="auth.displayName"
            size="xs"
          />
          <span class="nav-username">{{ auth.displayName }}</span>
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

      <!-- 移动端 menu button -->
      <UButton
        :icon="open ? 'i-lucide-x' : 'i-lucide-menu'"
        color="neutral"
        variant="ghost"
        size="sm"
        square
        class="nav-burger"
        @click="open = !open"
      />
    </div>

    <!-- 移动端 drawer -->
    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div v-if="open" class="nav-mobile">
        <UButton
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :variant="isActive(item.to) ? 'solid' : 'ghost'"
          :color="isActive(item.to) ? 'primary' : 'neutral'"
          size="sm"
          :label="item.label"
          block
          class="justify-start rounded-full"
          @click="close"
        />
        <div class="nav-mobile-sep" />
        <UButton
          v-if="auth.isLoggedIn"
          label="退出登录"
          color="neutral"
          variant="outline"
          size="sm"
          block
          class="rounded-full"
          @click="auth.clearUser(); close()"
        />
        <UButton
          v-else
          to="/login"
          label="登录"
          color="primary"
          variant="solid"
          size="sm"
          block
          class="rounded-full"
          @click="close"
        />
      </div>
    </Transition>
  </header>
</template>

<style scoped>
/* DESIGN.md §Top Navigation (Marketing): 64px · 白底 · 底 1px hairline-soft */
.nav-root {
  position: sticky;
  top: 0;
  z-index: 50;
  background: var(--color-canvas);
  border-bottom: 1px solid var(--color-hairline-soft);
  backdrop-filter: blur(8px);
}
.nav-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 32px;
  height: 64px;
  display: flex;
  align-items: center;
  gap: 24px;
}
@media (max-width: 768px) {
  .nav-inner { padding: 0 16px; gap: 12px; }
}
.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.brand__mark {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  background: var(--color-primary);
  color: var(--color-canvas);
  display: flex;
  align-items: center;
  justify-content: center;
}
.brand__txt { display: flex; flex-direction: column; line-height: 1.2; }
.brand__name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: var(--color-ink);
}
.brand__sub {
  font-family: var(--font-ui);
  font-size: 11px;
  font-weight: 400;
  color: var(--color-stone);
  margin-top: 2px;
}
.nav-list {
  display: none;
  flex: 1;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
@media (min-width: 768px) {
  .nav-list { display: flex; }
}
.nav-right {
  display: none;
  align-items: center;
  gap: 8px;
}
@media (min-width: 768px) {
  .nav-right { display: flex; }
}
.nav-username {
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink);
}
.nav-burger {
  margin-left: auto;
}
@media (min-width: 768px) {
  .nav-burger { display: none; }
}
.nav-mobile {
  border-top: 1px solid var(--color-hairline-soft);
  padding: 12px 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  background: var(--color-canvas);
}
.nav-mobile-sep {
  height: 1px;
  background: var(--color-hairline-soft);
  margin: 4px 0;
}
</style>