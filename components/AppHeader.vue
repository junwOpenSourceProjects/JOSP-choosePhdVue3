<script setup lang="ts">
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

function close() {
  open.value = false
}

const isActive = (to: string) => {
  if (to === '/') return route.path === '/'
  return route.path === to || route.path.startsWith(to + '/')
}
</script>

<template>
  <header
    class="sticky top-0 z-50 backdrop-blur-md"
    :class="[
      'border-b border-default',
      'bg-white/85 dark:bg-white/85'
    ]"
  >
    <UContainer class="flex h-16 items-center justify-between gap-6">
      <NuxtLink to="/" class="flex items-center gap-3" @click="close">
        <div
          class="flex size-9 items-center justify-center rounded-xl text-white shadow-sm"
          :style="{ background: 'var(--color-brand-900)' }"
        >
          <UIcon name="i-lucide-graduation-cap" class="size-4" />
        </div>
        <div class="flex flex-col leading-tight">
          <span
            class="text-lg font-semibold tracking-tight text-default"
            :style="{ fontFamily: 'var(--font-display)' }"
          >选校系统</span>
          <span class="mt-0.5 text-[11px] text-muted">PhD 申请助手</span>
        </div>
      </NuxtLink>

      <nav class="hidden flex-1 items-center justify-center gap-1 md:flex">
        <UButton
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :icon="item.icon"
          :variant="isActive(item.to) ? 'solid' : 'ghost'"
          :color="isActive(item.to) ? 'primary' : 'neutral'"
          size="sm"
          class="rounded-full"
        />
      </nav>

      <div class="hidden items-center gap-2 md:flex">
        <template v-if="auth.isLoggedIn">
          <UAvatar
            v-if="auth.avatar"
            :src="auth.avatar"
            :alt="auth.displayName"
            size="sm"
          />
          <span class="text-sm font-medium text-default">{{ auth.displayName }}</span>
          <UButton
            icon="i-lucide-log-out"
            color="neutral"
            variant="ghost"
            size="sm"
            class="rounded-full"
            @click="auth.clearUser"
          >
            退出
          </UButton>
        </template>
        <UButton
          v-else
          to="/login"
          icon="i-lucide-log-in"
          color="primary"
          variant="solid"
          size="sm"
          class="rounded-full"
        >
          登录
        </UButton>
      </div>

      <UButton
        :icon="open ? 'i-lucide-x' : 'i-lucide-menu'"
        color="neutral"
        variant="ghost"
        size="sm"
        class="md:hidden"
        square
        @click="open = !open"
      />
    </UContainer>

    <Transition
      enter-active-class="transition-all duration-200 ease-out"
      leave-active-class="transition-all duration-150 ease-in"
      enter-from-class="opacity-0 -translate-y-2"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="open"
        class="border-t border-default bg-white px-4 py-3 md:hidden"
      >
        <div class="flex flex-col gap-1">
          <UButton
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            :icon="item.icon"
            :variant="isActive(item.to) ? 'solid' : 'ghost'"
            :color="isActive(item.to) ? 'primary' : 'neutral'"
            size="sm"
            block
            class="justify-start"
            @click="close"
          >
            {{ item.label }}
          </UButton>
          <template v-if="auth.isLoggedIn">
            <div class="flex items-center gap-2 px-2 py-2">
              <UAvatar
                v-if="auth.avatar"
                :src="auth.avatar"
                :alt="auth.displayName"
                size="sm"
              />
              <span class="text-sm font-medium text-default">{{ auth.displayName }}</span>
            </div>
            <UButton
              icon="i-lucide-log-out"
              color="neutral"
              variant="outline"
              size="sm"
              block
              class="mt-2 justify-center"
              @click="auth.clearUser(); close()"
            >
              退出
            </UButton>
          </template>
          <UButton
            v-else
            to="/login"
            icon="i-lucide-log-in"
            color="primary"
            variant="solid"
            size="sm"
            block
            class="mt-2 justify-center"
            @click="close"
          >
            登录
          </UButton>
        </div>
      </div>
    </Transition>
  </header>
</template>
