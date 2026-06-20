<script setup lang="ts">
const route = useRoute()
const open = ref(false)

const navItems = [
  { label: '首页', to: '/' },
  { label: '学校库', to: '/universities' },
  { label: '我的选校', to: '/choices' },
  { label: '数据图表', to: '/charts' }
]

const userRoute = { label: '登录', to: '/login' }

function close() {
  open.value = false
}

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <header class="app-header">
    <div class="app-header__inner page-container">
      <NuxtLink to="/" class="app-header__brand" @click="close">
        <div class="app-header__logo">
          <UIcon name="i-lucide-graduation-cap" class="size-6" />
        </div>
        <div class="app-header__brand-text">
          <span class="app-header__title">选校系统</span>
          <span class="app-header__subtitle">PhD 申请助手</span>
        </div>
      </NuxtLink>

      <nav class="app-header__nav">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="pill"
          :class="{ 'is-active': isActive(item.to) }"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <NuxtLink
        :to="userRoute.to"
        class="app-header__login"
      >
        {{ userRoute.label }}
      </NuxtLink>

      <button
        type="button"
        class="app-header__menu-btn"
        :aria-expanded="open"
        aria-label="菜单"
        @click="open = !open"
      >
        <UIcon :name="open ? 'i-lucide-x' : 'i-lucide-menu'" class="size-6" />
      </button>
    </div>

    <Transition name="slide">
      <div v-if="open" class="app-header__mobile">
        <NuxtLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          class="app-header__mobile-item"
          :class="{ 'is-active': isActive(item.to) }"
          @click="close"
        >
          {{ item.label }}
        </NuxtLink>
        <NuxtLink
          :to="userRoute.to"
          class="app-header__mobile-item"
          @click="close"
        >
          {{ userRoute.label }}
        </NuxtLink>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 50;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: saturate(180%) blur(16px);
  -webkit-backdrop-filter: saturate(180%) blur(16px);
  border-bottom: 1px solid var(--color-border-light);
}

.app-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 24px;
}

.app-header__brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--color-ink-1000);
}
.app-header__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-brand-900);
  color: #fff;
  box-shadow: var(--shadow-card);
}
.app-header__brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}
.app-header__title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: var(--color-ink-1000);
  letter-spacing: -0.01em;
}
.app-header__subtitle {
  font-size: 11px;
  color: var(--color-ink-700);
  margin-top: 2px;
}

.app-header__nav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  justify-content: center;
}

.app-header__login {
  padding: 8px 16px;
  border-radius: 9999px;
  background: var(--color-brand-900);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;
  transition: background 200ms ease;
}
.app-header__login:hover {
  background: var(--color-brand-700);
}

.app-header__menu-btn {
  display: none;
  background: transparent;
  border: 0;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-ink-1000);
}
.app-header__menu-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.app-header__mobile {
  display: none;
  flex-direction: column;
  border-top: 1px solid var(--color-border-light);
  background: #fff;
  padding: 12px 16px;
  gap: 4px;
}
.app-header__mobile-item {
  display: block;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-ink-1000);
  text-decoration: none;
}
.app-header__mobile-item.is-active {
  background: var(--color-brand-900);
  color: #fff;
}
.app-header__mobile-item:hover {
  background: rgba(0, 0, 0, 0.05);
}
.app-header__mobile-item.is-active:hover {
  background: var(--color-brand-700);
}

@media (max-width: 768px) {
  .app-header__nav { display: none; }
  .app-header__menu-btn { display: inline-flex; }
  .app-header__mobile { display: flex; }
  .app-header__subtitle { display: none; }
}

.slide-enter-active, .slide-leave-active {
  transition: all 200ms ease;
}
.slide-enter-from, .slide-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
