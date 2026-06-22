<script setup lang="ts">
/**
 * HomeHero · 首页 Hero
 *
 * 决策仪表盘头部:
 * - DM Sans 80px headline (DESIGN.md hero-display)
 * - 副标: 数据规模 + "0 AI 替你选"
 * - 2 个 CTA: 进入对比 / 浏览学校库
 */

defineProps<{
  stats?: {
    universities?: number
    systems?: number
    years?: number
  }
}>()
</script>

<template>
  <section class="home-hero">
    <div class="home-hero__inner">
      <div class="home-hero__eyebrow">
        <UIcon name="i-lucide-database" class="home-hero__eyebrow-icon" />
        <span>11 排名体系 · 263K 数据 · 16 年 · 0 AI 替你选</span>
      </div>

      <h1 class="home-hero__title">
        <span class="home-hero__title-line1">你的选校</span>
        <span class="home-hero__title-line2">
          <span class="home-hero__title-emph">决策</span>
          <span class="home-hero__title-rest">副驾</span>
        </span>
      </h1>

      <p class="home-hero__sub">
        QS / US News / ARWU 11 个体系 · 历年趋势 + 多维对比 · 数据说话, 你做决策
      </p>

      <div class="home-hero__cta">
        <NuxtLink to="/choices" class="home-hero__cta-primary">
          <UIcon name="i-lucide-git-compare" class="size-4" />
          进入对比
        </NuxtLink>
        <NuxtLink to="/universities" class="home-hero__cta-ghost">
          浏览学校库
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
      </div>

      <div class="home-hero__stats">
        <div class="home-hero__stat">
          <div class="home-hero__stat-num">{{ stats?.universities?.toLocaleString() ?? '2,884' }}</div>
          <div class="home-hero__stat-label">覆盖大学</div>
        </div>
        <div class="home-hero__stat-sep" aria-hidden="true" />
        <div class="home-hero__stat">
          <div class="home-hero__stat-num">{{ stats?.systems ?? '11' }}</div>
          <div class="home-hero__stat-label">排名体系</div>
        </div>
        <div class="home-hero__stat-sep" aria-hidden="true" />
        <div class="home-hero__stat">
          <div class="home-hero__stat-num">{{ stats?.years ?? '16' }}y</div>
          <div class="home-hero__stat-label">历年跨度</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-hero {
  width: 100%;
  background: var(--ui-bg);
  border-bottom: 1px solid var(--ui-border);
}

.home-hero__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 96px 32px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 500;
  color: var(--ui-text-muted);
  letter-spacing: 0.02em;
}

.home-hero__eyebrow-icon {
  width: 14px;
  height: 14px;
  color: var(--ui-primary, #1456f0);
}

.home-hero__title {
  font-family: 'DM Sans', 'Noto Sans SC', system-ui, sans-serif;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.home-hero__title-line1 {
  font-size: 80px;
  color: var(--ui-text);
}

.home-hero__title-line2 {
  font-size: 80px;
  display: flex;
  align-items: baseline;
  gap: 16px;
}

.home-hero__title-emph {
  color: var(--ui-primary, #1456f0);
  font-style: italic;
  font-weight: 700;
}

.home-hero__title-rest {
  color: var(--ui-text);
}

.home-hero__sub {
  font-size: 18px;
  font-weight: 400;
  line-height: 1.5;
  color: var(--ui-text-muted);
  margin: 0;
  max-width: 640px;
}

.home-hero__cta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.home-hero__cta-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #0a0a0a;
  color: #ffffff;
  font-size: 15px;
  font-weight: 600;
  border-radius: 9999px;
  text-decoration: none;
  transition: background 0.15s ease;
}

.home-hero__cta-primary:hover {
  background: #181e25;
}

.home-hero__cta-ghost {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: transparent;
  color: var(--ui-text);
  font-size: 15px;
  font-weight: 600;
  border: 1px solid var(--ui-border);
  border-radius: 9999px;
  text-decoration: none;
  transition: background 0.15s ease;
}

.home-hero__cta-ghost:hover {
  background: var(--ui-bg-elevated, #f7f8fa);
}

.home-hero__stats {
  display: flex;
  align-items: center;
  gap: 32px;
  margin-top: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--ui-border);
}

.home-hero__stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.home-hero__stat-num {
  font-family: 'Roboto', 'DM Sans', system-ui, sans-serif;
  font-size: 32px;
  font-weight: 600;
  color: var(--ui-text);
  letter-spacing: -0.02em;
}

.home-hero__stat-label {
  font-size: 12px;
  font-weight: 500;
  color: var(--ui-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.home-hero__stat-sep {
  width: 1px;
  height: 32px;
  background: var(--ui-border);
}

@media (max-width: 768px) {
  .home-hero__inner {
    padding: 64px 20px 56px;
  }
  .home-hero__title-line1,
  .home-hero__title-line2 {
    font-size: 56px;
  }
  .home-hero__title-line2 {
    flex-wrap: wrap;
  }
  .home-hero__stats {
    gap: 16px;
  }
  .home-hero__stat-num {
    font-size: 24px;
  }
}
</style>
