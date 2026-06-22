<script setup lang="ts">
/**
 * DESIGN.md §footer-region
 * 4 列 link grid · 黑底 · section padding
 */
const sections = [
  {
    title: '数据',
    links: [
      { label: 'QS 世界排名', to: '/universities?rankTable=qs' },
      { label: 'US News 综合', to: '/universities?rankTable=usnews' },
      { label: 'ARWU 软科', to: '/universities?rankTable=arwu_subject' },
      { label: 'QS 学科', to: '/universities?rankTable=qs_sustainability' }
    ]
  },
  {
    title: '工具',
    links: [
      { label: '学校库', to: '/universities' },
      { label: '数据图表', to: '/charts' },
      { label: '我的选校', to: '/choices' },
      { label: '上传中心', to: '/upload' }
    ]
  },
  {
    title: '关于',
    links: [
      { label: '项目文档', href: '/SPEC.md', external: true },
      { label: '设计规范', href: '/DESIGN.md', external: true },
      { label: '数据来源', to: '/universities' }
    ]
  }
]
</script>

<template>
  <footer class="footer">
    <div class="footer__inner">
      <div class="footer__top">
        <div class="footer__brand">
          <div class="footer__mark">
            <UIcon name="i-lucide-graduation-cap" class="size-4" />
          </div>
          <div>
            <div class="footer__name">选校系统</div>
            <div class="footer__sub">PhD 申请 · 数据驱动 · 选校决策</div>
          </div>
        </div>
        <div class="footer__grid">
          <div v-for="s in sections" :key="s.title" class="footer__col">
            <div class="footer__heading">{{ s.title }}</div>
            <a
              v-if="l.external"
              v-for="l in s.links"
              :key="l.label"
              :href="l.href"
              target="_blank"
              rel="noopener"
              class="footer__link"
            >{{ l.label }}</a>
            <NuxtLink
              v-else
              v-for="l in s.links"
              :key="l.label"
              :to="l.to"
              class="footer__link"
            >{{ l.label }}</NuxtLink>
          </div>
        </div>
      </div>
      <div class="footer__bottom">
        <span>© {{ new Date().getFullYear() }} 选校系统</span>
        <span>数据来源 · QS / US News / ARWU / EduRank / MOSIUR / RUR</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
/* DESIGN.md §footer-region: footer-bg · padding section · 黑底 */
.footer {
  background: var(--color-footer-bg);
  color: var(--color-on-dark);
  margin-top: 80px;
}
.footer__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 32px 32px;
}
@media (max-width: 768px) {
  .footer__inner { padding: 48px 16px 24px; }
}
.footer__top {
  display: grid;
  grid-template-columns: 1fr;
  gap: 40px;
  padding-bottom: 48px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.10);
}
@media (min-width: 768px) {
  .footer__top {
    grid-template-columns: 1fr 2fr;
    gap: 64px;
  }
}
.footer__brand {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.footer__mark {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, 0.10);
  color: var(--color-on-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.footer__name {
  font-family: var(--font-display);
  font-size: 17px;
  font-weight: 600;
  color: var(--color-on-dark);
}
.footer__sub {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 400;
  color: var(--color-muted);
  margin-top: 6px;
}
.footer__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}
@media (min-width: 768px) {
  .footer__grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
.footer__col { display: flex; flex-direction: column; gap: 10px; }
.footer__heading {
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-on-dark);
  margin-bottom: 4px;
}
.footer__link {
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 400;
  color: var(--color-muted);
  text-decoration: none;
  padding: 2px 0;
  transition: color 160ms ease;
}
.footer__link:hover { color: var(--color-on-dark); }
.footer__bottom {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 12px;
  padding-top: 24px;
  font-family: var(--font-ui);
  font-size: 12px;
  color: var(--color-muted);
}
</style>