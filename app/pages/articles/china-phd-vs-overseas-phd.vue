<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: '国内读博 vs 海外读博：如何选择？' })
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: '国内读博 vs 海外读博：如何选择？',
  description: '从学术环境、培养模式、职业发展和生活成本等维度，分析国内与海外博士项目的优劣。',
  datePublished: '2026-06-27',
  author: { '@type': 'Organization', name: 'choosePhd' }
})
</script>

<template>
  <div class="container-page py-[var(--spacing-section)] max-w-3xl">
    <article class="prose body-md text-[var(--color-charcoal)] space-y-[var(--spacing-md)]">
      <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">国内读博 vs 海外读博：如何选择？</h1>
      <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">从学术环境、培养模式、职业发展和生活成本等维度全面分析</p>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">国内博士的优势</h2>
      <ul class="list-disc pl-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
        <li><strong>学术人脉积累</strong>：国内顶级实验室与产业界联系紧密，毕业后直接进入国内学术圈或头部企业</li>
        <li><strong>成本较低</strong>：学费低，生活成本可控，CSC 和校内奖学金覆盖率高</li>
        <li><strong>语言无障碍</strong>：中文环境下的学术交流更高效</li>
        <li><strong>近年学术提升显著</strong>：清华、北大、浙大、上交等校在 QS/US News 排名持续上升</li>
      </ul>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">海外博士的优势</h2>
      <ul class="list-disc pl-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
        <li><strong>国际化学术视野</strong>：接触最前沿的研究方向和方法论</li>
        <li><strong>独立研究训练</strong>：欧美博士项目强调独立思考和原创贡献</li>
        <li><strong>全球学术网络</strong>：国际会议、合作研究和跨国项目机会更多</li>
        <li><strong>职业选择多元</strong>：毕业后可在全球范围内寻找学术或工业界机会</li>
      </ul>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">关键考量因素</h2>
      <ul class="list-disc pl-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
        <li><strong>研究方向</strong>：某些领域（如 AI、生物医学）海外研究资源更丰富</li>
        <li><strong>导师匹配</strong>：导师的研究活跃度和指导风格比学校排名更重要</li>
        <li><strong>职业规划</strong>：计划回国发展还是留海外？这会直接影响选择</li>
        <li><strong>个人与家庭因素</strong>：语言、文化适应、经济压力等</li>
      </ul>
      <p>无论选择国内还是海外，关键是找到真正匹配你研究兴趣和职业目标的导师与项目。使用 choosePhd 的榜单对比功能，可以帮助你从排名数据出发，更理性地评估选项。</p>
    </article>
  </div>
</template>
