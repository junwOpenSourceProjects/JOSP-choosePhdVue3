<script setup lang="ts">
interface FooterLink {
  label: string
  to?: string
  href?: string
  external?: boolean
}

interface FooterSection {
  title: string
  links: FooterLink[]
}

const sections: FooterSection[] = [
  {
    title: '数据',
    links: [
      { label: 'QS 世界排名', to: '/universities?rankTable=qs' },
      { label: 'US News 综合', to: '/universities?rankTable=usnews' },
      { label: 'ARWU 软科', to: '/universities?rankTable=arwu_subject' },
      { label: 'QS 可持续', to: '/universities?rankTable=qs_sustainability' },
    ],
  },
  {
    title: '工具',
    links: [
      { label: '学校库', to: '/universities' },
      { label: '数据图表', to: '/charts' },
      { label: '我的选校', to: '/choices' },
      { label: '上传中心', to: '/upload' },
    ],
  },
  {
    title: '关于',
    links: [
      { label: '项目文档', href: '/SPEC.md', external: true },
      { label: '设计规范', href: '/DESIGN.md', external: true },
      { label: '数据来源', to: '/universities' },
    ],
  },
  {
    title: '支持',
    links: [
      { label: '帮助中心', href: '#', external: true },
      { label: '联系我们', href: '#', external: true },
      { label: '使用反馈', href: '#', external: true },
    ],
  },
]
</script>

<template>
  <footer class="bg-ink text-white mt-20 md:mt-24">
    <div class="page-container py-14 md:py-16 pb-8">
      <div class="grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-8 pb-12 border-b border-white/10">
        <!-- Brand -->
        <div class="col-span-2 md:col-span-1">
          <div class="flex items-start gap-3">
            <span class="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-graduation-cap" class="size-4" />
            </span>
            <div>
              <div class="font-display text-[17px] font-semibold text-white">选校系统</div>
              <div class="text-[13px] text-white/60 mt-1.5">PhD 申请 · 数据驱动 · 选校决策</div>
            </div>
          </div>
        </div>

        <!-- Link columns -->
        <div v-for="s in sections" :key="s.title" class="flex flex-col gap-2.5">
          <div class="text-sm font-semibold text-white mb-1">{{ s.title }}</div>
          <template v-for="l in s.links" :key="l.label">
            <a
              v-if="l.href"
              :href="l.href"
              target="_blank"
              rel="noopener"
              class="text-sm text-white/60 hover:text-white transition-colors"
            >{{ l.label }}</a>
            <NuxtLink
              v-else
              :to="l.to"
              class="text-sm text-white/60 hover:text-white transition-colors"
            >{{ l.label }}</NuxtLink>
          </template>
        </div>
      </div>

      <div class="flex flex-wrap justify-between gap-3 pt-6 text-xs text-white/50">
        <span>© {{ new Date().getFullYear() }} 选校系统</span>
        <span>数据来源 · QS / US News / ARWU / EduRank / MOSIUR / RUR</span>
      </div>
    </div>
  </footer>
</template>
