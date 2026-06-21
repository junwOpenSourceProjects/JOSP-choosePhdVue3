<script setup lang="ts">
const year = new Date().getFullYear()

const dataSources = [
  { label: 'QS World University Rankings', href: 'https://www.topuniversities.com/' },
  { label: 'US News Global Universities', href: 'https://www.usnews.com/education/best-global-universities' }
]

const modules = [
  { label: '学校库', to: '/universities' },
  { label: '我的选校', to: '/choices' },
  { label: '数据图表', to: '/charts' }
]

const project = [
  { label: 'GitHub 源码', href: 'https://github.com/' },
  { label: 'v1.0.0', muted: true }
]
</script>

<template>
  <footer class="mt-20 bg-[#181e25] text-white/85">
    <UContainer class="py-14">
      <div class="grid grid-cols-1 gap-12 border-b border-white/10 pb-9 md:grid-cols-[1.2fr_2fr]">
        <!-- 品牌区 -->
        <div class="flex items-start gap-3">
          <div
            class="flex size-9 flex-shrink-0 items-center justify-center rounded-xl text-white"
            :style="{ background: 'var(--color-brand-900)' }"
          >
            <UIcon name="i-lucide-graduation-cap" class="size-4" />
          </div>
          <div class="flex-1">
            <div
              class="text-lg font-semibold text-white"
              :style="{ fontFamily: 'var(--font-display)' }"
            >选校系统</div>
            <div class="mt-1.5 max-w-xs text-[13px] leading-relaxed text-white/60">
              PhD 申请选校助手 · 多源排名数据 · 选校清单 · 趋势可视化
            </div>
          </div>
        </div>

        <!-- 3 列 -->
        <div class="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <div class="flex flex-col gap-2.5">
            <div class="mb-1 text-[13px] font-semibold text-white">数据来源</div>
            <a
              v-for="d in dataSources"
              :key="d.href"
              :href="d.href"
              target="_blank"
              rel="noopener"
              class="text-[13px] leading-relaxed text-white/60 transition-colors duration-200 hover:text-white"
            >{{ d.label }}</a>
          </div>

          <div class="flex flex-col gap-2.5">
            <div class="mb-1 text-[13px] font-semibold text-white">功能模块</div>
            <NuxtLink
              v-for="m in modules"
              :key="m.to"
              :to="m.to"
              class="text-[13px] leading-relaxed text-white/60 transition-colors duration-200 hover:text-white"
            >{{ m.label }}</NuxtLink>
          </div>

          <div class="flex flex-col gap-2.5">
            <div class="mb-1 text-[13px] font-semibold text-white">项目</div>
            <template v-for="p in project" :key="p.label">
              <a
                v-if="p.href"
                :href="p.href"
                target="_blank"
                rel="noopener"
                class="text-[13px] leading-relaxed text-white/60 transition-colors duration-200 hover:text-white"
              >{{ p.label }}</a>
              <span
                v-else
                class="cursor-default text-[13px] leading-relaxed text-white/60"
              >{{ p.label }}</span>
            </template>
          </div>
        </div>
      </div>

      <!-- 底部 -->
      <div class="flex flex-col items-center justify-between gap-2 pt-6 text-xs text-white/40 sm:flex-row">
        <span>© {{ year }} 选校系统. All rights reserved.</span>
        <span>Built with Nuxt 4 + @nuxt/ui v4</span>
      </div>
    </UContainer>
  </footer>
</template>
