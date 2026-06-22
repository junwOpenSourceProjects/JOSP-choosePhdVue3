<script setup lang="ts">
/**
 * DataScaleFooter · 数据规模 (footer)
 *
 * 简洁 1 段:
 *   - 4 个数字 (11 体系 / 263K 数据 / 16 年 / 9 排名体系)
 *   - 数据来源: QS / US News / ARWU / EduRank / MOSiUR / RUR
 *   - 2026 © 选校系统
 */
</script>

<template>
  <section class="data-scale">
    <div class="data-scale__inner">
      <div class="data-scale__grid">
        <div class="data-scale__item">
          <div class="data-scale__num">11</div>
          <div class="data-scale__label">排名体系</div>
        </div>
        <div class="data-scale__sep" aria-hidden="true" />
        <div class="data-scale__item">
          <div class="data-scale__num">263K</div>
          <div class="data-scale__label">数据点</div>
        </div>
        <div class="data-scale__sep" aria-hidden="true" />
        <div class="data-scale__item">
          <div class="data-scale__num">16y</div>
          <div class="data-scale__label">历年跨度</div>
        </div>
        <div class="data-scale__sep" aria-hidden="true" />
        <div class="data-scale__item">
          <div class="data-scale__num">9</div>
          <div class="data-scale__label">权威来源</div>
        </div>
      </div>

      <div class="data-scale__src">
        <span class="data-scale__src-label">数据来源</span>
        <span class="data-scale__src-list">
          QS · US News · ARWU · EduRank · MOSiUR · RUR · QS Sustainability · US News Subject · Declining Trend
        </span>
      </div>

      <div class="data-scale__copy">© 2026 选校系统 · 数据驱动选校决策</div>
    </div>
  </section>
</template>

<style scoped>
.data-scale {
  width: 100%;
  background: var(--ui-text, #0a0a0a);
  color: var(--ui-bg, #ffffff);
}

.data-scale__inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 64px 32px 48px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.data-scale__grid {
  display: flex;
  align-items: center;
  gap: 32px;
}

.data-scale__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.data-scale__num {
  font-family: 'DM Sans', 'Roboto', system-ui, sans-serif;
  font-size: 48px;
  font-weight: 600;
  line-height: 1;
  letter-spacing: -0.03em;
  color: #ffffff;
  font-variant-numeric: tabular-nums;
}

.data-scale__label {
  font-size: 12px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.data-scale__sep {
  width: 1px;
  height: 48px;
  background: rgba(255, 255, 255, 0.12);
}

.data-scale__src {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 32px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.data-scale__src-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.5);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.data-scale__src-list {
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
}

.data-scale__copy {
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
  padding-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

@media (max-width: 768px) {
  .data-scale__inner {
    padding: 48px 20px 32px;
  }
  .data-scale__grid {
    flex-wrap: wrap;
    gap: 24px;
  }
  .data-scale__sep {
    display: none;
  }
  .data-scale__num {
    font-size: 32px;
  }
}
</style>
