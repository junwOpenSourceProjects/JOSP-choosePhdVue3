<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="app-footer">
    <div class="app-footer__inner page-container">
      <div class="app-footer__top">
        <div class="app-footer__brand">
          <div class="app-footer__logo">
            <UIcon name="i-lucide-graduation-cap" class="size-5" />
          </div>
          <div>
            <div class="app-footer__title">选校系统</div>
            <div class="app-footer__desc">PhD 申请选校助手 · 多源排名数据 · 选校清单 · 趋势可视化</div>
          </div>
        </div>

        <div class="app-footer__columns">
          <div class="app-footer__col">
            <div class="app-footer__col-title">数据来源</div>
            <a class="app-footer__link" href="https://www.topuniversities.com/" target="_blank" rel="noopener">QS World University Rankings</a>
            <a class="app-footer__link" href="https://www.usnews.com/education/best-global-universities" target="_blank" rel="noopener">US News Global Universities</a>
          </div>
          <div class="app-footer__col">
            <div class="app-footer__col-title">功能模块</div>
            <NuxtLink to="/universities" class="app-footer__link">学校库</NuxtLink>
            <NuxtLink to="/choices" class="app-footer__link">我的选校</NuxtLink>
            <NuxtLink to="/charts" class="app-footer__link">数据图表</NuxtLink>
          </div>
          <div class="app-footer__col">
            <div class="app-footer__col-title">项目</div>
            <a class="app-footer__link" href="https://github.com/" target="_blank" rel="noopener">GitHub 源码</a>
            <span class="app-footer__link is-muted">v1.0.0</span>
          </div>
        </div>
      </div>

      <div class="app-footer__bottom">
        <span>© {{ year }} 选校系统. All rights reserved.</span>
        <span>Built with Nuxt 4 + @nuxt/ui v4</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  margin-top: 80px;
  background: var(--color-surface-dark);
  color: rgba(255, 255, 255, 0.85);
}

.app-footer__inner {
  padding: 56px 24px 28px;
}

.app-footer__top {
  display: grid;
  grid-template-columns: 1.2fr 2fr;
  gap: 48px;
  padding-bottom: 36px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.app-footer__brand {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}
.app-footer__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: var(--color-brand-900);
  color: #fff;
  flex-shrink: 0;
}
.app-footer__title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  color: #fff;
}
.app-footer__desc {
  font-size: 13px;
  line-height: 1.5;
  margin-top: 6px;
  color: rgba(255, 255, 255, 0.6);
  max-width: 320px;
}

.app-footer__columns {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

.app-footer__col {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.app-footer__col-title {
  font-size: 13px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
}
.app-footer__link {
  font-size: 13px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
  transition: color 160ms ease;
}
.app-footer__link:hover {
  color: #fff;
}
.app-footer__link.is-muted {
  cursor: default;
}

.app-footer__bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

@media (max-width: 768px) {
  .app-footer__top { grid-template-columns: 1fr; gap: 32px; }
  .app-footer__columns { grid-template-columns: repeat(2, 1fr); gap: 24px; }
  .app-footer__bottom { flex-direction: column; gap: 8px; text-align: center; }
}
</style>
