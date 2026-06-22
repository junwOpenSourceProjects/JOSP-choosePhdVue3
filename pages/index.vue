<script setup lang="ts">
/**
 * 首页 · MiniMax 大胆版
 */
definePageMeta({
  layout: 'default',
})

interface MatrixItem {
  tone: 'coral' | 'magenta' | 'blue' | 'purple'
  eyebrow: string
  title: string
  subtitle: string
  meta: string
  to: string
}

const matrixItems: MatrixItem[] = [
  {
    tone: 'coral',
    eyebrow: 'WORLD',
    title: 'QS',
    subtitle: '世界大学排名',
    meta: '综合 + 学科',
    to: '/universities?rankTable=qs',
  },
  {
    tone: 'magenta',
    eyebrow: 'GLOBAL',
    title: 'US News',
    subtitle: '全球最佳大学',
    meta: '综合 + CS',
    to: '/universities?rankTable=usnews',
  },
  {
    tone: 'blue',
    eyebrow: 'ACADEMIC',
    title: 'ARWU',
    subtitle: '软科世界排名',
    meta: '学科细分',
    to: '/universities?rankTable=arwu_subject',
  },
  {
    tone: 'purple',
    eyebrow: 'MORE',
    title: 'EduRank\nMOSIUR\nRUR',
    subtitle: '',
    meta: '6+ 补充榜单',
    to: '/universities',
  },
]
</script>

<template>
  <div class="home-page">
    <HomeHero />

    <section class="home-matrix">
      <div class="home-matrix__inner">
        <div class="home-matrix__header">
          <div class="home-matrix__eyebrow">全栈排名矩阵</div>
          <h2 class="home-matrix__title">一个平台，覆盖所有主流排名</h2>
        </div>

        <div class="home-matrix__grid">
          <NuxtLink
            v-for="item in matrixItems"
            :key="item.title"
            :to="item.to"
            class="home-matrix__card"
            :class="`home-matrix__card--${item.tone}`"
          >
            <span class="home-matrix__glow" aria-hidden="true" />
            <div class="home-matrix__body">
              <div class="home-matrix__eyebrow-text">{{ item.eyebrow }}</div>
              <div class="home-matrix__card-title">{{ item.title }}</div>
              <div v-if="item.subtitle" class="home-matrix__subtitle">{{ item.subtitle }}</div>
            </div>
            <div class="home-matrix__foot">
              <span class="home-matrix__meta">{{ item.meta }}</span>
              <span class="home-matrix__arrow">
                <UIcon name="i-lucide-arrow-right" class="size-4" />
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <TrendMovers />
    <CompareTable />

    <section class="home-cta">
      <div class="home-cta__inner">
        <div class="home-cta__card">
          <span class="home-cta__glow" aria-hidden="true" />
          <div class="home-cta__body">
            <h2 class="home-cta__title">开始你的选校决策</h2>
            <p class="home-cta__desc">
              浏览 2,884 所大学的多源排名数据，建立你的专属选校清单。
            </p>
            <NuxtLink to="/universities" class="home-cta__btn">
              免费开始使用
              <UIcon name="i-lucide-arrow-right" class="size-4" />
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  width: 100%;
  min-height: 100vh;
  background: var(--color-canvas);
  color: var(--color-ink);
}
.home-matrix {
  width: 100%;
  background: var(--color-canvas);
  border-bottom: 1px solid var(--color-hairline-soft);
}
.home-matrix__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 32px;
}
@media (min-width: 768px) {
  .home-matrix__inner { padding: 96px 32px; }
}
.home-matrix__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 32px;
}
@media (min-width: 768px) {
  .home-matrix__header { margin-bottom: 40px; }
}
.home-matrix__eyebrow {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  color: var(--color-brand-blue);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.home-matrix__title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  color: var(--color-ink);
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 0;
}
@media (min-width: 768px) {
  .home-matrix__title { font-size: 36px; }
}
.home-matrix__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
}
@media (min-width: 640px) {
  .home-matrix__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .home-matrix__grid { grid-template-columns: repeat(4, 1fr); }
}
.home-matrix__card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 280px;
  padding: 28px;
  border-radius: 32px;
  color: var(--color-on-dark);
  text-decoration: none;
  overflow: hidden;
  isolation: isolate;
  transition: transform 200ms ease, box-shadow 200ms ease;
}
@media (min-width: 768px) {
  .home-matrix__card { min-height: 320px; padding: 32px; }
}
.home-matrix__card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-hover);
}
.home-matrix__card--coral { background: var(--color-brand-coral); }
.home-matrix__card--magenta { background: var(--color-brand-magenta); }
.home-matrix__card--blue { background: var(--color-brand-blue); }
.home-matrix__card--purple { background: var(--color-brand-purple); }
.home-matrix__glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  filter: blur(40px);
  transform: translate(30%, -30%);
  pointer-events: none;
  z-index: 0;
}
.home-matrix__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.home-matrix__eyebrow-text {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  opacity: 0.8;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 4px;
}
.home-matrix__card-title {
  font-family: var(--font-display);
  font-size: 36px;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.02em;
  white-space: pre-line;
}
@media (min-width: 768px) {
  .home-matrix__card-title { font-size: 42px; }
}
.home-matrix__subtitle {
  font-family: var(--font-ui);
  font-size: 15px;
  font-weight: 500;
  opacity: 0.9;
  margin-top: 4px;
}
.home-matrix__foot {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32px;
}
.home-matrix__meta {
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  opacity: 0.8;
}
.home-matrix__arrow {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.20);
  transition: background 160ms ease;
}
.home-matrix__card:hover .home-matrix__arrow { background: rgba(255, 255, 255, 0.30); }
.home-cta {
  width: 100%;
  background: var(--color-canvas);
}
.home-cta__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 32px 96px;
}
@media (min-width: 768px) {
  .home-cta__inner { padding: 80px 32px 120px; }
}
.home-cta__card {
  position: relative;
  padding: 40px 32px;
  border-radius: 32px;
  background: var(--color-brand-blue);
  color: var(--color-on-dark);
  overflow: hidden;
  isolation: isolate;
}
@media (min-width: 768px) {
  .home-cta__card { padding: 64px 48px; }
}
.home-cta__glow {
  position: absolute;
  top: 0;
  right: 0;
  width: 384px;
  height: 384px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.10);
  filter: blur(60px);
  transform: translate(30%, -30%);
  pointer-events: none;
  z-index: 0;
}
.home-cta__body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 560px;
}
.home-cta__title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  line-height: 1.25;
  letter-spacing: -0.02em;
  margin: 0;
}
@media (min-width: 768px) {
  .home-cta__title { font-size: 36px; }
}
.home-cta__desc {
  font-family: var(--font-ui);
  font-size: 16px;
  font-weight: 400;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.80);
  margin: 0;
}
.home-cta__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: flex-start;
  padding: 13px 24px;
  background: var(--color-canvas);
  color: var(--color-brand-blue);
  font-family: var(--font-ui);
  font-size: 15px;
  font-weight: 600;
  border-radius: var(--radius-pill);
  text-decoration: none;
  transition: background 160ms ease;
  margin-top: 8px;
}
.home-cta__btn:hover { background: rgba(255, 255, 255, 0.90); }
@media (max-width: 768px) {
  .home-matrix__inner { padding: 56px 20px; }
  .home-matrix__title { font-size: 24px; }
  .home-cta__inner { padding: 56px 20px 80px; }
  .home-cta__card { padding: 32px 24px; }
  .home-cta__btn { width: 100%; }
}
</style>
