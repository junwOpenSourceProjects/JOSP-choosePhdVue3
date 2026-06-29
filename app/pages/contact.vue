<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: t('footer.contact') })
</script>

<template>
  <div class="container-page py-[var(--spacing-section)] max-w-3xl">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-lg)]">{{ $t('footer.contact') }}</h1>
    <div class="prose body-md text-[var(--color-charcoal)] space-y-[var(--spacing-md)]">
      <p>如有任何问题、建议或合作意向，欢迎通过以下方式联系我们：</p>
      <ul class="list-disc pl-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
        <li>邮箱：contact@choosephd.com</li>
        <li>GitHub：<a href="https://github.com/junw/choosephd" class="text-[var(--color-brand-blue-deep)] hover:underline" target="_blank">github.com/junw/choosephd</a></li>
      </ul>
      <p class="mt-[var(--spacing-lg)]">我们通常会在 2-3 个工作日内回复。</p>
    </div>
  </div>
</template>
