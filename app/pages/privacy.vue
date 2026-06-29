<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: t('footer.privacy') })
</script>

<template>
  <div class="container-page py-[var(--spacing-section)] max-w-3xl">
    <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-lg)]">{{ $t('footer.privacy') }}</h1>
    <div class="prose body-md text-[var(--color-charcoal)] space-y-[var(--spacing-md)]">
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">信息收集</h2>
      <p>我们仅收集您主动提供的信息（注册用户名），以及标准的服务器日志（IP 地址、访问时间、浏览器类型），用于安全防护和反爬虫检测。</p>
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">信息使用</h2>
      <p>收集的信息仅用于：提供和改进服务、安全防护与反爬虫、法律合规要求。我们不会将您的个人信息出售给第三方。</p>
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">Cookie</h2>
      <p>我们使用必要的 Cookie 来维持登录状态和语言偏好。不使用第三方追踪 Cookie 或广告 Cookie。</p>
      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">数据安全</h2>
      <p>我们采取合理的技术措施保护您的个人信息安全，包括密码加密存储（BCrypt）和 JWT 令牌认证。</p>
    </div>
  </div>
</template>
