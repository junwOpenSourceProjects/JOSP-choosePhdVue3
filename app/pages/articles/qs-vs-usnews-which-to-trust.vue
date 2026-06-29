<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: 'QS vs US News：哪个榜单更值得信赖？' })
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'QS vs US News：哪个榜单更值得信赖？',
  description: '深度对比两大全球大学排名体系的评价标准、权重差异和适用场景。',
  datePublished: '2026-06-27',
  author: { '@type': 'Organization', name: 'choosePhd' }
})
</script>

<template>
  <div class="container-page py-[var(--spacing-section)] max-w-3xl">
    <article class="prose body-md text-[var(--color-charcoal)] space-y-[var(--spacing-md)]">
      <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">QS vs US News：哪个榜单更值得信赖？</h1>
      <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">深度对比两大全球大学排名体系的差异与适用场景</p>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">QS 排名体系</h2>
      <p>QS 世界大学排名由 Quacquarelli Symonds 发布，核心指标包括：</p>
      <ul class="list-disc pl-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
        <li>学术声誉 (40%)：全球学者问卷调查</li>
        <li>雇主声誉 (10%)：全球雇主问卷调查</li>
        <li>师生比 (20%)：教学质量指标</li>
        <li>论文引用率 (20%)：研究影响力</li>
        <li>国际教师/学生比例 (各 5%)：国际化程度</li>
      </ul>
      <p>QS 排名对雇主声誉和国际化程度赋予较高权重，适合关注就业前景和国际化体验的申请者参考。</p>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">US News 排名体系</h2>
      <p>US News 全球大学排名由 U.S. News & World Report 发布，更侧重学术研究指标：</p>
      <ul class="list-disc pl-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
        <li>全球研究声誉 (12.5%) + 区域研究声誉 (12.5%)</li>
        <li>出版物 (10%) + 书籍 (2.5%) + 会议 (2.5%)</li>
        <li>标准化引用影响力 (10%) + 总引用次数 (7.5%)</li>
        <li>前 10% 高被引论文 (12.5%) + 前 1% 高被引论文 (5%)</li>
        <li>国际合作 (5% 国家层面 + 5% 国际层面)</li>
      </ul>
      <p>US News 更适合以学术研究为导向的博士申请者，其对论文产出和引用影响力的权重远高于 QS。</p>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">如何选择</h2>
      <ul class="list-disc pl-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
        <li><strong>偏学术研究</strong> → 优先参考 US News、ARWU</li>
        <li><strong>偏就业导向</strong> → 优先参考 QS</li>
        <li><strong>关注教学质量</strong> → 参考 THE（教学环境占 30%）</li>
        <li><strong>综合判断</strong> → 使用 choosePhd 跨榜单对比，多维度评估</li>
      </ul>
    </article>
  </div>
</template>
