<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: t('footer.terms') })
</script>

<template>
  <div class="container-page py-[var(--spacing-section)] max-w-3xl">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-lg)]">{{ $t('footer.terms') }}</h1>
    <div class="prose body-md text-[var(--color-charcoal)] space-y-[var(--spacing-md)]">
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">服务说明</h2>
      <p>choosePhd 提供院校排名查询、榜单对比和选校清单管理服务。所有排名数据来源于官方公开发布的榜单结果，仅供参考，不构成任何形式的录取保证。</p>
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">用户责任</h2>
      <p>用户不得：批量爬取或抓取网站数据（违反限流策略）、利用本站数据进行任何商业用途（除非获得书面授权）、干扰或破坏网站的正常运行。</p>
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">知识产权</h2>
      <p>choosePhd 的代码、设计和原创内容受版权保护。排名数据归各榜单发布机构所有。引用本站数据请注明来源。</p>
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">免责声明</h2>
      <p>我们力求数据的准确性和及时性，但不对因使用本站数据而产生的任何决策后果承担责任。选校决策应综合考虑多种因素。</p>
    </div>
  </div>
</template>
