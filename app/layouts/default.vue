<script setup lang="ts">
const auth = useAuthStore()
const router = useRouter()
const { locale, locales, setLocale } = useI18n()
const localePath = useLocalePath()

const onLogout = () => {
  auth.logout()
}

const goSearch = () => {
  router.push(localePath('/universities'))
}

const switchLocale = (code: string) => {
  setLocale(code)
}

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[var(--color-canvas)] text-[var(--color-ink)]">
    <!-- Top Navigation -->
    <header class="sticky top-0 z-50 h-16 bg-[var(--color-canvas)] border-b border-[var(--color-hairline-soft)]">
      <div class="container-page h-full flex items-center justify-between">
        <div class="flex items-center gap-8">
          <NuxtLink :to="localePath('/')" class="text-[var(--color-ink-strong)] font-semibold text-xl tracking-tight">
            choosePhd
          </NuxtLink>
          <nav class="hidden md:flex items-center gap-6 body-sm text-[var(--color-charcoal)]">
            <NuxtLink :to="localePath('/')" class="hover:text-[var(--color-ink)]">{{ $t('nav.home') }}</NuxtLink>
            <NuxtLink :to="localePath('/rankings')" class="hover:text-[var(--color-ink)]">{{ $t('nav.rankings') }}</NuxtLink>
            <NuxtLink :to="localePath('/universities')" class="hover:text-[var(--color-ink)]">{{ $t('nav.universities') }}</NuxtLink>
            <NuxtLink :to="localePath('/subjects')" class="hover:text-[var(--color-ink)]">{{ $t('nav.subjects') }}</NuxtLink>
            <NuxtLink :to="localePath('/compare')" class="hover:text-[var(--color-ink)]">{{ $t('nav.compare') }}</NuxtLink>
            <NuxtLink
              v-if="auth.isAdmin"
              :to="localePath('/admin/scrape-audit')"
              class="text-[var(--color-ink-strong)] font-medium hover:text-[var(--color-ink)]"
            >
              {{ $t('nav.admin') }}
            </NuxtLink>
            <template v-if="auth.isAdmin">
              <span class="text-[var(--color-hairline)]">/</span>
              <NuxtLink
                :to="localePath('/admin/university-tags')"
                class="text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
              >
                标签
              </NuxtLink>
              <NuxtLink
                :to="localePath('/admin/import')"
                class="text-[var(--color-charcoal)] hover:text-[var(--color-ink)]"
              >
                导入
              </NuxtLink>
            </template>
          </nav>
        </div>

        <div class="flex items-center gap-3">
          <!-- Hamburger menu button (mobile) -->
          <button
            type="button"
            class="md:hidden btn-icon-circular"
            aria-label="菜单"
            @click="toggleMobileMenu"
          >
            <svg v-if="!mobileMenuOpen" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </svg>
            <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <!-- Language switcher -->
          <select
            :value="locale"
            class="body-sm bg-[var(--color-canvas)] border border-[var(--color-hairline)] rounded-[var(--rounded-md)] px-2 py-1 text-[var(--color-charcoal)]"
            @change="switchLocale(($event.target as HTMLSelectElement).value)"
          >
            <option v-for="l in locales" :key="l.code" :value="l.code">
              {{ (l as any).name }}
            </option>
          </select>

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
            <NuxtLink :to="localePath('/shortlist')" class="body-sm-medium text-[var(--color-charcoal)] hover:text-[var(--color-ink)] hidden sm:inline-flex">
              {{ $t('nav.shortlist') }}
            </NuxtLink>
            <div class="flex items-center gap-2 ml-2">
              <div class="w-8 h-8 rounded-full bg-[var(--color-surface)] flex items-center justify-center text-xs font-semibold border border-[var(--color-hairline)]">
                {{ auth.user?.username?.slice(0, 2).toUpperCase() || 'ME' }}
              </div>
              <AppButton variant="link" size="sm" :ui="{ base: 'text-[var(--color-steel)] hover:text-[var(--color-ink)]' }" @click="onLogout">
                {{ $t('nav.logout') }}
              </AppButton>
            </div>
          </template>

          <template v-else>
            <AppButton variant="secondary" size="sm" :to="localePath('/login')">{{ $t('nav.login') }}</AppButton>
            <AppButton variant="primary" size="sm" :to="localePath('/register')">{{ $t('nav.register') }}</AppButton>
          </template>
        </div>
      </div>
    </header>

    <!-- Mobile menu overlay -->
    <div
      v-if="mobileMenuOpen"
      class="md:hidden fixed inset-0 z-40"
      @click="closeMobileMenu"
    >
      <div class="absolute inset-0 bg-black/40" />
      <div class="absolute top-16 left-0 right-0 bg-[var(--color-canvas)] border-b border-[var(--color-hairline)] shadow-2" @click.stop>
        <nav class="container-page py-[var(--spacing-lg)] flex flex-col gap-[var(--spacing-md)]">
          <NuxtLink :to="localePath('/')" class="body-md text-[var(--color-ink)] py-[var(--spacing-xs)]" @click="closeMobileMenu">{{ $t('nav.home') }}</NuxtLink>
          <NuxtLink :to="localePath('/rankings')" class="body-md text-[var(--color-ink)] py-[var(--spacing-xs)]" @click="closeMobileMenu">{{ $t('nav.rankings') }}</NuxtLink>
          <NuxtLink :to="localePath('/universities')" class="body-md text-[var(--color-ink)] py-[var(--spacing-xs)]" @click="closeMobileMenu">{{ $t('nav.universities') }}</NuxtLink>
          <NuxtLink :to="localePath('/subjects')" class="body-md text-[var(--color-ink)] py-[var(--spacing-xs)]" @click="closeMobileMenu">{{ $t('nav.subjects') }}</NuxtLink>
          <NuxtLink :to="localePath('/compare')" class="body-md text-[var(--color-ink)] py-[var(--spacing-xs)]" @click="closeMobileMenu">{{ $t('nav.compare') }}</NuxtLink>
          <NuxtLink :to="localePath('/shortlist')" class="body-md text-[var(--color-ink)] py-[var(--spacing-xs)]" @click="closeMobileMenu">{{ $t('nav.shortlist') }}</NuxtLink>
          <template v-if="auth.isAdmin">
            <div class="border-t border-[var(--color-hairline)] pt-[var(--spacing-md)]">
              <NuxtLink :to="localePath('/admin/scrape-audit')" class="body-sm text-[var(--color-steel)] py-[var(--spacing-xs)] block" @click="closeMobileMenu">{{ $t('admin.scrapeAudit') }}</NuxtLink>
              <NuxtLink :to="localePath('/admin/university-tags')" class="body-sm text-[var(--color-steel)] py-[var(--spacing-xs)] block" @click="closeMobileMenu">标签管理</NuxtLink>
              <NuxtLink :to="localePath('/admin/import')" class="body-sm text-[var(--color-steel)] py-[var(--spacing-xs)] block" @click="closeMobileMenu">数据导入</NuxtLink>
            </div>
          </template>
          <template v-if="!auth.isLoggedIn">
            <div class="border-t border-[var(--color-hairline)] pt-[var(--spacing-md)] flex gap-[var(--spacing-sm)]">
              <AppButton variant="secondary" size="sm" :to="localePath('/login')" @click="closeMobileMenu">{{ $t('nav.login') }}</AppButton>
              <AppButton variant="primary" size="sm" :to="localePath('/register')" @click="closeMobileMenu">{{ $t('nav.register') }}</AppButton>
            </div>
          </template>
        </nav>
      </div>
    </div>

    <!-- Page content -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-[var(--color-footer-bg)] text-[var(--color-on-dark)]">
      <div class="container-page py-[var(--spacing-section)] grid grid-cols-1 md:grid-cols-4 gap-10">
        <div class="space-y-4">
          <div class="font-semibold text-lg">choosePhd</div>
          <p class="text-[var(--color-muted)] body-sm">{{ $t('footer.brand') }}</p>
        </div>

        <div>
          <h4 class="body-sm-medium mb-4">{{ $t('footer.rankings') }}</h4>
          <ul class="space-y-2 text-[var(--color-muted)] body-sm">
            <li><NuxtLink :to="localePath('/rankings')" class="hover:text-[var(--color-on-dark)]">QS World</NuxtLink></li>
            <li><NuxtLink :to="localePath('/rankings')" class="hover:text-[var(--color-on-dark)]">US News</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="body-sm-medium mb-4">{{ $t('footer.tools') }}</h4>
          <ul class="space-y-2 text-[var(--color-muted)] body-sm">
            <li><NuxtLink :to="localePath('/compare')" class="hover:text-[var(--color-on-dark)]">{{ $t('nav.compare') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/shortlist')" class="hover:text-[var(--color-on-dark)]">{{ $t('nav.shortlist') }}</NuxtLink></li>
          </ul>
        </div>

        <div>
          <h4 class="body-sm-medium mb-4">{{ $t('footer.account') }}</h4>
          <ul class="space-y-2 text-[var(--color-muted)] body-sm">
            <li><NuxtLink :to="localePath('/login')" class="hover:text-[var(--color-on-dark)]">{{ $t('nav.login') }}</NuxtLink></li>
            <li><NuxtLink :to="localePath('/register')" class="hover:text-[var(--color-on-dark)]">{{ $t('nav.register') }}</NuxtLink></li>
          </ul>
        </div>
      </div>

      <div class="container-page py-6 border-t border-[var(--color-charcoal)] text-[var(--color-muted)] micro">
        &copy; {{ new Date().getFullYear() }} choosePhd. All rights reserved.
      </div>
    </footer>
  </div>
</template>
