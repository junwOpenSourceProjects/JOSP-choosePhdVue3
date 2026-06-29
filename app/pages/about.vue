<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: t('footer.about') })
</script>

<template>
  <div class="container-page py-[var(--spacing-section)] max-w-3xl">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-lg)]">{{ $t('footer.about') }}</h1>
    <div class="prose body-md text-[var(--color-charcoal)] space-y-[var(--spacing-md)]">
      <p>choosePhd 是一个数据驱动的博士选校决策平台，致力于为全球博士申请者提供透明、可靠的院校排名与对比数据。</p>
      <p>我们整合了 QS World University Rankings、US News Global Universities、ARWU (Shanghai Ranking)、THE World University Rankings、CSRankings 等 10 余个权威榜单，覆盖超过 5,000 所世界一流大学，涵盖综合排名、学科排名、地区排名和历年趋势数据。</p>
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">我们的使命</h2>
      <p>让每一个博士申请都建立在可靠数据之上。我们相信，选校决策不应依赖碎片化的信息和主观经验，而应基于全面、可比较、可追溯的公开数据。</p>
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">数据来源</h2>
      <p>所有排名数据均来自官方公开发布的榜单结果。我们不对原始数据进行修改或主观加权，仅提供跨榜单的聚合、对比和可视化呈现。</p>
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">联系方式</h2>
      <p>如有数据问题、合作意向或使用建议，请发送邮件至 contact@choosephd.com。</p>
    </div>
  </div>
</template>
