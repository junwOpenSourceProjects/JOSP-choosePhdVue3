<script setup lang="ts">
/**
 * SchoolHero · 院校详情页头部（MiniMax 大胆版）
 *
 * 黑底白字 + 玻璃态 4 维排名大数字
 * 一眼看完：校名、地理位置、4 维最新排名、行动 CTA
 */
import type { UniversityAllDTO } from '~/types'
import { regionStyle, regionDot } from '~/utils/region'

interface RankItem {
  label: string
  field: keyof UniversityAllDTO
  color: string
}

const RANK_ITEMS: RankItem[] = [
  { label: 'QS 综合', field: 'currentQsAllRank', color: '#ff5530' },
  { label: 'US News 综合', field: 'currentUsnewsAllRank', color: '#ea5ec1' },
  { label: 'QS 计算机', field: 'currentQsComputerRank', color: '#1456f0' },
  { label: 'US News 计算机', field: 'currentUsnewsComputerRank', color: '#a855f7' },
]

defineProps<{
  name: string
  detail: UniversityAllDTO | null
  loading?: boolean
}>()

const emit = defineEmits<{
  back: []
  toggleCompare: []
  toggleBookmark: []
}>()

function rankCount(d: UniversityAllDTO | null | undefined): number {
  if (!d) return 0
  let n = 0
  if (d.currentQsAllRank != null) n++
  if (d.currentUsnewsAllRank != null) n++
  if (d.currentQsComputerRank != null) n++
  if (d.currentUsnewsComputerRank != null) n++
  return n
}

function getRank(d: UniversityAllDTO | null, field: keyof UniversityAllDTO): number | null {
  if (!d) return null
  const v = d[field]
  return typeof v === 'number' ? v : null
}
</script>

<template>
  <section class="school-hero">
    <div class="page-container">
      <!-- 面包屑 + 返回 -->
      <div class="school-hero__top">
        <button type="button" class="school-hero__back" @click="emit('back')">
          <UIcon name="i-lucide-arrow-left" class="size-4" />
          <span>返回学校库</span>
        </button>
        <nav class="school-hero__breadcrumb" aria-label="breadcrumb">
          <NuxtLink to="/universities">学校库</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="size-4" />
          <span class="school-hero__crumb-current">{{ name }}</span>
        </nav>
      </div>

      <div class="school-hero__body">
        <!-- 左: 校名 + 副标题 -->
        <div class="school-hero__main">
          <div class="school-hero__title-wrap">
            <div class="school-hero__eyebrow">
              <span class="school-hero__eyebrow-dot" />
              <span>学术档案 · {{ rankCount(detail) }} 维最新</span>
            </div>
            <h1 class="school-hero__title">{{ name }}</h1>
            <p class="school-hero__sub">
              综合 + 计算机 双维度对比 · 4 大榜单历年趋势 · 多源覆盖
            </p>
            <div class="school-hero__meta-row">
              <span
                v-if="detail?.universityTags"
                class="school-hero__chip"
                :style="regionStyle(detail.universityTags)"
              >
                <span class="school-hero__chip-dot" :style="{ background: regionDot(detail.universityTags) }" />
                {{ detail.universityTags }}
              </span>
              <span
                v-if="detail?.universityTagsState"
                class="school-hero__chip school-hero__chip--muted"
              >
                <UIcon name="i-lucide-map-pin" class="size-4" />
                {{ detail.universityTagsState }}
              </span>
              <span
                v-if="detail?.rankingYear"
                class="school-hero__chip school-hero__chip--muted"
              >
                <UIcon name="i-lucide-calendar" class="size-4" />
                {{ detail.rankingYear }} 年最新
              </span>
            </div>
          </div>
        </div>

        <!-- 右: CTA -->
        <div class="school-hero__cta">
          <button
            type="button"
            class="school-hero__btn school-hero__btn--primary"
            @click="emit('toggleCompare')"
          >
            <UIcon name="i-lucide-list-plus" class="size-4" />
            加入对比
          </button>
          <NuxtLink to="/charts" class="school-hero__btn school-hero__btn--secondary">
            <UIcon name="i-lucide-line-chart" class="size-4" />
            看趋势
          </NuxtLink>
        </div>
      </div>

      <!-- 4 大榜单玻璃态排名卡 -->
      <div v-if="detail" class="school-hero__ranks">
        <div
          v-for="item in RANK_ITEMS"
          :key="item.label"
          class="school-hero__rank"
        >
          <div class="school-hero__rank-label">
            <span class="school-hero__rank-dot" :style="{ background: item.color }" />
            {{ item.label }}
          </div>
          <div class="school-hero__rank-value">
            <template v-if="getRank(detail, item.field) != null">
              #{{ getRank(detail, item.field) }}
            </template>
            <template v-else>—</template>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.school-hero {
  padding: 32px 0 48px;
  background: var(--color-ink);
  color: var(--color-on-dark);
}
@media (min-width: 768px) {
  .school-hero { padding: 48px 0 72px; }
}

.school-hero__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.school-hero__back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.85);
  font-family: var(--font-ui);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 160ms ease;
}
.school-hero__back:hover {
  background: rgba(255, 255, 255, 0.14);
  color: #ffffff;
}

.school-hero__breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
}
.school-hero__breadcrumb a {
  color: rgba(255, 255, 255, 0.75);
  text-decoration: none;
  transition: color 150ms ease;
}
.school-hero__breadcrumb a:hover { color: #ffffff; }
.school-hero__crumb-current {
  color: #ffffff;
  font-weight: 500;
}

.school-hero__body {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.school-hero__main {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  flex: 1;
  min-width: 0;
}
.school-hero__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.school-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  align-self: flex-start;
  padding: 6px 14px;
  border-radius: var(--radius-pill);
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.85);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.school-hero__eyebrow-dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand-coral);
}

.school-hero__title {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 600;
  line-height: 1.05;
  letter-spacing: -0.03em;
  margin: 0;
  color: #ffffff;
}
@media (min-width: 1024px) {
  .school-hero__title { font-size: 80px; }
}

.school-hero__sub {
  font-family: var(--font-ui);
  font-size: 16px;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.60);
  margin: 0;
  max-width: 560px;
}

.school-hero__meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.school-hero__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 9999px;
}
.school-hero__chip--muted {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.10);
  color: rgba(255, 255, 255, 0.75);
}
.school-hero__chip-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
}

.school-hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  flex-shrink: 0;
}
.school-hero__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  border-radius: var(--radius-pill);
  font-family: var(--font-ui);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  text-decoration: none;
  cursor: pointer;
  transition: all 160ms ease;
  border: 0;
}
.school-hero__btn--primary {
  background: #ffffff;
  color: var(--color-ink);
}
.school-hero__btn--primary:hover {
  background: rgba(255, 255, 255, 0.90);
}
.school-hero__btn--secondary {
  background: transparent;
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.35);
}
.school-hero__btn--secondary:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.55);
}

.school-hero__ranks {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-top: 40px;
}
@media (min-width: 768px) {
  .school-hero__ranks { grid-template-columns: repeat(4, 1fr); gap: 16px; margin-top: 48px; }
}

.school-hero__rank {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px 24px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: var(--radius-xl);
  backdrop-filter: blur(8px);
  transition: all 200ms ease;
}
.school-hero__rank:hover {
  background: rgba(255, 255, 255, 0.10);
  border-color: rgba(255, 255, 255, 0.18);
  transform: translateY(-2px);
}
.school-hero__rank-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.school-hero__rank-dot {
  width: 8px;
  height: 8px;
  border-radius: 9999px;
}
.school-hero__rank-value {
  font-family: var(--font-display);
  font-size: 44px;
  font-weight: 700;
  line-height: 1.0;
  color: #ffffff;
  letter-spacing: -1px;
  text-align: left;
  font-variant-numeric: tabular-nums;
}
@media (min-width: 1024px) {
  .school-hero__rank-value { font-size: 56px; }
}
</style>
