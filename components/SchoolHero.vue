<script setup lang="ts">
/**
 * DESIGN.md §school-hero (基于 hero-band 范本)
 * 院校详情页头部综合信息区
 *
 * 一眼看完 5 件事:
 *   1. 中英文校名 (H1)
 *   2. Logo + 地理位置 + 建校年 + 学生数 (徽章行, 关键事实)
 *   3. 4 维最新排名 (1 行 4 大数字)
 *   4. 行动 CTA (加入对比 / 看趋势 / 收藏)
 *   5. 面包屑
 */
import type { UniversityAllDTO } from '~/types'

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

const REGION_COLORS: Record<string, { bg: string; fg: string; dot: string }> = {
  '亚洲':   { bg: '#fce7f3', fg: '#be185d', dot: '#ea5ec1' },
  '欧洲':   { bg: '#dbeafe', fg: '#1d4ed8', dot: '#1456f0' },
  '北美洲': { bg: '#fef3c7', fg: '#b45309', dot: '#f59e0b' },
  '南美洲': { bg: '#dcfce7', fg: '#15803d', dot: '#22c55e' },
  '大洋洲': { bg: '#ede9fe', fg: '#7c3aed', dot: '#a855f7' },
  '非洲':   { bg: '#fee2e2', fg: '#b91c1c', dot: '#ef4444' }
}

function regionStyle(r?: string) {
  if (!r) return { background: 'var(--color-surface-soft)', color: 'var(--color-slate)' }
  const c = REGION_COLORS[r]
  if (!c) return { background: 'var(--color-surface-soft)', color: 'var(--color-slate)' }
  return { background: c.bg, color: c.fg }
}
function regionDot(r?: string) {
  if (!r) return '#8e8e93'
  return REGION_COLORS[r]?.dot ?? '#8e8e93'
}

function rankCount(d: UniversityAllDTO | null | undefined): number {
  if (!d) return 0
  let n = 0
  if (d.currentQsAllRank != null) n++
  if (d.currentUsnewsAllRank != null) n++
  if (d.currentQsComputerRank != null) n++
  if (d.currentUsnewsComputerRank != null) n++
  return n
}
</script>

<template>
  <section class="school-hero">
    <div class="page-container">
      <!-- 面包屑 + 返回 -->
      <div class="school-hero__top">
        <UButton
          icon="i-lucide-arrow-left"
          color="neutral"
          variant="ghost"
          size="sm"
          label="返回学校库"
          class="rounded-full"
          @click="emit('back')"
        />
        <nav class="school-hero__breadcrumb" aria-label="breadcrumb">
          <NuxtLink to="/universities">学校库</NuxtLink>
          <UIcon name="i-lucide-chevron-right" class="school-hero__crumb-sep" />
          <span class="school-hero__crumb-current">{{ name }}</span>
        </nav>
      </div>

      <div class="school-hero__body">
        <!-- 左: 校徽 + 校名 -->
        <div class="school-hero__main">
          <div class="school-hero__logo">
            <UIcon name="i-lucide-graduation-cap" class="size-6" />
          </div>
          <div class="school-hero__title-wrap">
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
                <UIcon name="i-lucide-map-pin" class="size-3.5" />
                {{ detail.universityTagsState }}
              </span>
              <span
                v-if="detail?.rankingYear"
                class="school-hero__chip school-hero__chip--muted"
              >
                <UIcon name="i-lucide-calendar" class="size-3.5" />
                {{ detail.rankingYear }} 年最新
              </span>
            </div>
            <div class="school-hero__eyebrow">
              <span class="school-hero__dot" />
              <span class="school-hero__eyebrow-text">学术档案 · {{ rankCount(detail) }} 维最新</span>
            </div>
            <h1 class="school-hero__title">
              {{ name.slice(0, name.length - 2) }}<span class="school-hero__title-accent">{{ name.slice(-2) }}</span>
            </h1>
            <p v-if="detail" class="school-hero__sub">
              综合 + 计算机 双维度对比 · 4 大榜单历年趋势 · 多源覆盖
            </p>
          </div>
        </div>

        <!-- 右: CTA -->
        <div class="school-hero__cta">
          <UButton
            color="primary"
            variant="solid"
            size="md"
            icon="i-lucide-list-plus"
            label="加入对比"
            class="rounded-full"
            @click="emit('toggleCompare')"
          />
          <UButton
            to="/charts"
            color="primary"
            variant="outline"
            size="md"
            icon="i-lucide-line-chart"
            label="看趋势"
            class="rounded-full"
          />
        </div>
      </div>

      <!-- 4 大榜单大数字 (用户思维: 一眼看完"这学校多强") -->
      <div v-if="detail" class="school-hero__ranks">
        <div class="school-hero__rank">
          <div class="school-hero__rank-label">QS 综合</div>
          <div class="school-hero__rank-value">#{{ detail.currentQsAllRank ?? '—' }}</div>
        </div>
        <div class="school-hero__rank">
          <div class="school-hero__rank-label">US News 综合</div>
          <div class="school-hero__rank-value">#{{ detail.currentUsnewsAllRank ?? '—' }}</div>
        </div>
        <div class="school-hero__rank">
          <div class="school-hero__rank-label">QS 计算机</div>
          <div class="school-hero__rank-value">#{{ detail.currentQsComputerRank ?? '—' }}</div>
        </div>
        <div class="school-hero__rank">
          <div class="school-hero__rank-label">US News 计算机</div>
          <div class="school-hero__rank-value">#{{ detail.currentUsnewsComputerRank ?? '—' }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.school-hero {
  padding: 32px 0 24px;
  background: var(--color-canvas);
  border-bottom: 1px solid var(--color-hairline);
}
.school-hero__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
.school-hero__breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: var(--font-ui);
  font-size: 13px;
  color: var(--color-stone);
}
.school-hero__breadcrumb a {
  color: var(--color-slate);
  text-decoration: none;
  transition: color 150ms ease;
}
.school-hero__breadcrumb a:hover { color: var(--color-brand-blue); }
.school-hero__crumb-sep {
  width: 12px;
  height: 12px;
  color: var(--color-stone);
}
.school-hero__crumb-current {
  color: var(--color-ink);
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
.school-hero__logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: var(--radius-xl);
  background: var(--color-brand-blue);
  color: white;
  flex-shrink: 0;
}
.school-hero__title-wrap {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
  flex: 1;
}
.school-hero__meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.school-hero__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  padding: 3px 10px;
  border-radius: 9999px;
}
.school-hero__chip--muted {
  background: var(--color-surface-1);
  color: var(--color-slate);
}
.school-hero__chip-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 9999px;
}
.school-hero__title {
  font-family: var(--font-display);
  font-size: 56px;
  font-weight: 600;
  line-height: 1.10;
  letter-spacing: -1.5px;
  margin: 0;
  color: var(--color-ink);
}
@media (min-width: 1024px) {
  .school-hero__title { font-size: 80px; letter-spacing: -2px; }
}
.school-hero__title-accent {
  font-style: italic;
  font-weight: 600;
  color: var(--color-brand-coral);
  position: relative;
  display: inline-block;
}
.school-hero__title-accent::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  height: 4px;
  background: var(--color-brand-coral);
  border-radius: 9999px;
  opacity: 0.85;
  z-index: -1;
}
.school-hero__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 9999px;
  background: var(--color-surface);
  border: 1px solid var(--color-hairline);
  margin-bottom: 16px;
}
.school-hero__dot {
  width: 6px;
  height: 6px;
  border-radius: 9999px;
  background: var(--color-brand-coral);
}
.school-hero__eyebrow-text {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-ink);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.school-hero__sub {
  font-family: var(--font-ui);
  font-size: 14px;
  line-height: 1.5;
  color: var(--color-slate);
  margin: 0;
}

.school-hero__cta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  flex-shrink: 0;
}

.school-hero__ranks {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 32px;
}
@media (min-width: 768px) {
  .school-hero__ranks { grid-template-columns: repeat(4, 1fr); }
}
.school-hero__rank {
  background: var(--color-canvas);
  border: 1px solid var(--color-hairline);
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 200ms ease;
}
.school-hero__rank:hover {
  border-color: var(--color-ink);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}
.school-hero__rank-label {
  font-family: var(--font-ui);
  font-size: 12px;
  font-weight: 500;
  color: var(--color-stone);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.school-hero__rank-value {
  font-family: var(--font-display);
  font-size: 48px;
  font-weight: 700;
  line-height: 1.0;
  color: var(--color-brand-blue);
  letter-spacing: -1px;
  text-align: left;
  font-variant-numeric: tabular-nums;
}
@media (min-width: 1024px) {
  .school-hero__rank-value { font-size: 64px; }
}
</style>
