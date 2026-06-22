<script setup lang="ts">
/**
 * HomeHero · 首页 Hero（MiniMax 大胆版）
 *
 * 黑底白字 + 大标题 + 双 CTA + 4 列玻璃态 stats
 */

interface Props {
  stats?: {
    universities?: number
    systems?: number
    years?: number
    dimensions?: number
  }
}

const props = withDefaults(defineProps<Props>(), {
  stats: () => ({}),
})

interface HeroStat {
  value: string
  label: string
}

const statsList = computed<HeroStat[]>(() => [
  { value: (props.stats.universities ?? 2884).toLocaleString(), label: '覆盖大学' },
  { value: String(props.stats.systems ?? 9), label: '排名体系' },
  { value: `${props.stats.years ?? 8}+`, label: '历史年份' },
  { value: String(props.stats.dimensions ?? 4), label: '评估维度' },
])
</script>

<template>
  <section class="home-hero">
    <div class="home-hero__noise" aria-hidden="true" />
    <div class="home-hero__inner">
      <div class="home-hero__eyebrow">
        <span class="home-hero__eyebrow-dot" aria-hidden="true" />
        <span>多源排名 · 历年趋势 · 选校决策</span>
      </div>

      <h1 class="home-hero__title">
        <span class="home-hero__title-line">让数据帮你</span>
        <span class="home-hero__title-line">
          找到<span class="home-hero__title-emph">理想</span>的 PhD
        </span>
      </h1>

      <p class="home-hero__sub">
        QS / US News / ARWU 等 9 大排名体系 · 综合 + 计算机双维度 · 历年趋势可视化 · 院校对比工作台
      </p>

      <div class="home-hero__cta">
        <NuxtLink to="/choices" class="home-hero__cta-primary">
          <UIcon name="i-lucide-bar-chart-2" class="size-4" />
          进入对比
        </NuxtLink>
        <NuxtLink to="/universities" class="home-hero__cta-secondary">
          浏览学校库
          <UIcon name="i-lucide-arrow-right" class="size-4" />
        </NuxtLink>
      </div>

      <div class="home-hero__stats">
        <div
          v-for="s in statsList"
          :key="s.label"
          class="home-hero__stat"
        >
          <div class="home-hero__stat-num">{{ s.value }}</div>
          <div class="home-hero__stat-label">{{ s.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.home-hero {
  position: relative;
  width: 100%;
  background: var(--color-ink);
  color: var(--color-on-dark);
  overflow: hidden;
  isolation: isolate;
}
.home-hero__noise {
  position: absolute;
  inset: 0;
  opacity: 0.06;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  z-index: 0;
}
.home-hero__inner {
  position: relative;
  z-index: 1;
  max-width: 1280px;
  margin: 0 auto;
  padding: 96px 32px 80px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}
@media (min-width: 768px) {
  .home-hero__inner { padding: 120px 32px 96px; }
}
@media (min-width: 1024px) {
  .home-hero__inner { padding: 140px 32px 110px; }
}
.home-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.10);
  border: 1px solid rgba(255, 255, 255, 0.18);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.90);
  letter-spacing: 0.01em;
}
.home-hero__eyebrow-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-brand-coral);
  flex-shrink: 0;
}
.home-hero__title {
  font-family: var(--font-display);
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.home-hero__title-line {
  font-size: 48px;
}
@media (min-width: 640px) {
  .home-hero__title-line { font-size: 56px; }
}
@media (min-width: 1024px) {
  .home-hero__title-line { font-size: 80px; letter-spacing: -0.03em; }
}
.home-hero__title-emph {
  color: var(--color-brand-coral);
  font-style: italic;
  font-weight: 700;
  margin-right: 8px;
}
.home-hero__sub {
  font-family: var(--font-ui);
  font-size: 17px;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.65);
  margin: 0;
  max-width: 640px;
}
@media (min-width: 768px) {
  .home-hero__sub { font-size: 19px; }
}
.home-hero__cta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 8px;
}
.home-hero__cta-primary,
.home-hero__cta-secondary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 13px 24px;
  font-family: var(--font-ui);
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  text-decoration: none;
  transition: all 160ms ease;
}
.home-hero__cta-primary {
  background: var(--color-canvas);
  color: var(--color-ink);
}
.home-hero__cta-primary:hover { background: rgba(255, 255, 255, 0.90); }
.home-hero__cta-secondary {
  background: transparent;
  color: var(--color-on-dark);
  border: 1px solid rgba(255, 255, 255, 0.30);
}
.home-hero__cta-secondary:hover { background: rgba(255, 255, 255, 0.08); }
.home-hero__stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 40px;
}
@media (min-width: 768px) {
  .home-hero__stats {
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-top: 64px;
  }
}
.home-hero__stat {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(8px);
}
@media (min-width: 768px) {
  .home-hero__stat { padding: 24px; border-radius: var(--radius-2xl); }
}
.home-hero__stat-num {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 700;
  color: var(--color-on-dark);
  letter-spacing: -0.02em;
  line-height: 1.1;
}
@media (min-width: 768px) {
  .home-hero__stat-num { font-size: 36px; }
}
.home-hero__stat-label {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.55);
}
@media (max-width: 768px) {
  .home-hero__inner { padding: 80px 20px 64px; }
  .home-hero__title-line { font-size: 42px; }
  .home-hero__sub { font-size: 16px; }
  .home-hero__cta-primary,
  .home-hero__cta-secondary { width: 100%; }
}
</style>
