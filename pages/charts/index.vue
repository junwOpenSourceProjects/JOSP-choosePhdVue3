<script setup lang="ts">
useHead({ title: '数据图表 · 选校系统' })
</script>

<template>
  <div>
    <section class="page-hero page-container">
      <h1 class="page-hero__title">数据图表</h1>
      <p class="page-hero__sub">趋势 · 对比 · 洞察</p>
    </section>
    <section class="page-container placeholder">
      <div class="placeholder__box">
        <UIcon name="i-lucide-construction" class="size-10" />
        <div class="placeholder__title">正在搭建中</div>
        <div class="placeholder__desc">ECharts 趋势可视化将在下一批 commit 交付</div>
        <NuxtLink to="/" class="cta" style="margin-top: 16px; background: #fff; color: #181e25; border: 1px solid #e5e7eb">
          返回首页
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<style scoped>
.page-hero { padding: 56px 0 24px; }
.page-hero__title { font-family: var(--font-display); font-size: 40px; font-weight: 600; color: var(--color-ink-1000); margin: 0; line-height: 1.1; }
.page-hero__sub { font-size: 16px; color: var(--color-ink-700); margin: 8px 0 0; }

.placeholder { padding: 32px 0 80px; }
.placeholder__box {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  padding: 80px 24px; background: #fff; border-radius: 20px; border: 1px solid var(--color-border-light);
  text-align: center; gap: 12px; box-shadow: rgba(0, 0, 0, 0.08) 0px 4px 6px;
}
.placeholder__title { font-family: var(--font-display); font-size: 20px; font-weight: 600; color: var(--color-ink-1000); }
.placeholder__desc { font-size: 14px; color: var(--color-ink-700); }
.placeholder__box :deep(.size-10) { color: var(--color-brand-900); }
</style>
