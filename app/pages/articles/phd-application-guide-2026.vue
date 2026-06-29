<script setup lang="ts">
const { t } = useI18n()
const localePath = useLocalePath()
useHead({ title: 'PhD 申请完整指南 2026' })
useJsonLd({
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'PhD 申请完整指南 2026',
  description: '覆盖选校、套磁、文书、面试、奖学金全流程的博士申请指南。',
  datePublished: '2026-06-27',
  author: { '@type': 'Organization', name: 'choosePhd' }
})
</script>

<template>
  <div class="container-page py-[var(--spacing-section)] max-w-3xl">
    <article class="prose body-md text-[var(--color-charcoal)] space-y-[var(--spacing-md)]">
      <h1 class="heading-lg text-[var(--color-ink)] mb-[var(--spacing-md)]">PhD 申请完整指南 2026</h1>
      <p class="subtitle text-[var(--color-steel)] mb-[var(--spacing-xl)]">覆盖选校、套磁、文书、面试、奖学金全流程</p>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">1. 选校策略</h2>
      <p>博士选校不同于硕士申请，核心是匹配导师研究方向。我们建议按以下梯度构建选校清单：</p>
      <ul class="list-disc pl-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
        <li><strong>冲刺校 (2-3 所)</strong>：综合排名前 20，导师方向高度匹配</li>
        <li><strong>匹配校 (3-5 所)</strong>：综合排名 20-100，导师有招生名额且有 funding</li>
        <li><strong>保底校 (2-3 所)</strong>：综合排名 100+，但导师活跃、项目资源充足</li>
      </ul>
      <p>使用 choosePhd 的榜单对比功能，可以直观地看到同一所大学在 QS、US News、ARWU 等不同榜单中的排名差异，帮助你更全面地评估院校实力。</p>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">2. 套磁（联系导师）</h2>
      <p>套磁是博士申请中最关键的一步。一封好的套磁信应包括：</p>
      <ul class="list-disc pl-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
        <li>简要介绍你的学术背景和研究兴趣</li>
        <li>说明你对导师近期研究的了解和兴趣（引用 1-2 篇近期论文）</li>
        <li>提出 1-2 个你希望探索的研究问题</li>
        <li>附上 CV 和成绩单</li>
      </ul>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">3. 申请文书</h2>
      <p>核心文书包括：</p>
      <ul class="list-disc pl-[var(--spacing-lg)] space-y-[var(--spacing-sm)]">
        <li><strong>Statement of Purpose (SOP)</strong>：研究经历、研究兴趣、为什么选这个项目</li>
        <li><strong>Personal Statement</strong>：个人成长故事、diversity 贡献</li>
        <li><strong>Research Proposal</strong>（部分项目需要）：具体的研究计划</li>
      </ul>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">4. 面试准备</h2>
      <p>博士面试通常为 30-60 分钟的视频通话，重点考察：研究经历的深度、研究兴趣与导师方向的匹配度、沟通能力和学术潜力。</p>

      <h2 class="heading-sm text-[var(--color-ink)] mt-[var(--spacing-xl)]">5. 奖学金与 Funding</h2>
      <p>主要 funding 来源：全额奖学金（Tuition Waiver + Stipend）、TA/RA 助学金、CSC 国家公派（中国学生）、大学内部奖学金、外部基金资助。</p>
    </article>
  </div>
</template>
