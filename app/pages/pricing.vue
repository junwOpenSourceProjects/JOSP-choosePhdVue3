<script setup lang="ts">
const localePath = useLocalePath()
const authStore = useAuthStore()

useHead({ title: '升级方案 · choosePhd' })

const plans = [
  {
    name: '免费版',
    nameEn: 'Free',
    price: '¥0',
    period: '永久免费',
    cta: '当前方案',
    ctaVariant: 'secondary' as const,
    highlight: false,
    features: [
      '每页 30 条院校',
      '每日 500 次查询',
      '3 所院校对比',
      '排名需登录解锁',
      '5 年精度趋势图',
    ]
  },
  {
    name: '标准版',
    nameEn: 'Standard',
    price: '¥29',
    period: '/月',
    cta: authStore.isLoggedIn ? '升级标准版' : '注册后升级',
    ctaVariant: 'secondary' as const,
    highlight: false,
    features: [
      '每页 100 条院校',
      '每日 5,000 次查询',
      '10 所院校对比',
      '完整排名直接查看',
      '按年精度趋势图',
      '无 IP 限制',
      '不含导出功能',
    ]
  },
  {
    name: '高级版',
    nameEn: 'Premium',
    price: '¥49',
    period: '/月',
    cta: authStore.isLoggedIn ? '升级高级版' : '注册后升级',
    ctaVariant: 'primary' as const,
    highlight: true,
    features: [
      '标准版全部功能',
      '选校清单 CSV 导出',
      '每月 20 次导出',
      '导出含：院校名、国家、各榜单排名、优先级、备注',
      '适合机构顾问批量整理选校方案',
    ]
  }
]
</script>

<template>
  <div class="container-page py-[var(--spacing-section)]">
    <div class="text-center mb-[var(--spacing-xl)]">
      <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-sm)]">选择适合你的方案</h1>
      <p class="subtitle text-[var(--color-steel)] max-w-xl mx-auto">
        免费版覆盖 90% 申请者的日常需求。重度使用或机构用户，升级专业版获取完整数据能力。
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-[var(--spacing-lg)] max-w-5xl mx-auto">
      <div
        v-for="plan in plans"
        :key="plan.name"
        class="card-base relative"
        :class="{ 'border-[var(--color-ink)] ring-1 ring-[var(--color-ink)]': plan.highlight }"
      >
        <AppBadge
          v-if="plan.highlight"
          variant="new"
          label="推荐"
          class="absolute -top-3 left-1/2 -translate-x-1/2"
        />

        <div class="text-center mb-[var(--spacing-lg)]">
          <h2 class="heading-sm text-[var(--color-ink)]">{{ plan.name }}</h2>
          <p class="caption text-[var(--color-steel)]">{{ plan.nameEn }}</p>
          <div class="mt-[var(--spacing-md)]">
            <span class="hero-display text-[var(--color-ink)]">{{ plan.price }}</span>
            <span class="body-sm text-[var(--color-steel)]">{{ plan.period }}</span>
          </div>
        </div>

        <ul class="space-y-[var(--spacing-sm)] mb-[var(--spacing-xl)]">
          <li v-for="feat in plan.features" :key="feat" class="flex items-start gap-[var(--spacing-sm)] body-sm text-[var(--color-charcoal)]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="shrink-0 mt-0.5 text-[var(--color-success-text)]">
              <path d="M20 6L9 17l-5-5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ feat }}
          </li>
        </ul>

        <AppButton
          :variant="plan.ctaVariant"
          class="w-full justify-center"
          :to="plan.highlight ? localePath('/register') : undefined"
        >
          {{ plan.cta }}
        </AppButton>
      </div>
    </div>

    <div class="text-center mt-[var(--spacing-xl)] body-sm text-[var(--color-steel)]">
      专业版即将接入在线支付。如需立即升级，请联系 contact@choosephd.com
    </div>
  </div>
</template>
