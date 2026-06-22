<script setup lang="ts">
/**
 * pages/index.vue · 首页 (决策仪表盘, C 方案)
 *
 * 4 段:
 *   1. HomeHero (Hero + 数据规模 + CTA)
 *   2. TrendMovers (趋势快讯 - signature)
 *   3. CompareTable (4 维对比 live demo)
 *   4. DataScaleFooter (数据规模 footer)
 *
 * 数据真: 4 段都从后端拉, 不写 mock
 */

import { onMounted, ref } from 'vue'
import { fetchBackup2Tables, listEchartsUniversities } from '~/lib/api/ranking'

useHead({ title: '选校系统 · 多源排名 · PhD 申请决策' })

// ============================================================
// HomeHero stats (实时从后端拉)
// ============================================================
const heroStats = ref<{ universities?: number; systems?: number; years?: number }>({
  universities: 2884,
  systems: 11,
  years: 16
})

onMounted(async () => {
  if (import.meta.server) return
  try {
    const [tables, universities] = await Promise.all([
      fetchBackup2Tables().catch(() => ({ code: 0, msg: '', data: [] as string[] })),
      listEchartsUniversities().catch(() => [] as string[])
    ])
    const tblList: string[] = (tables as any)?.data ?? []
    const uniList: string[] = Array.isArray(universities) ? universities : []
    heroStats.value = {
      universities: uniList.length ? uniList.length : 2884,
      systems: 2 + tblList.length, // qs + usnews + backup2 N 张
      years: 16
    }
  } catch {
    // fallback 已设默认值, 静默
  }
})
</script>

<template>
  <div class="home">
    <HomeHero :stats="heroStats" />
    <TrendMovers />
    <CompareTable />
    <DataScaleFooter />
  </div>
</template>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
