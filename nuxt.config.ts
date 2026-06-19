import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  modules: ['@nuxt/ui'],

  alias: {
    '~': fileURLToPath(new URL('./', import.meta.url)),
    '@': fileURLToPath(new URL('./', import.meta.url))
  },

  app: {
    head: {
      title: '选校系统 · PhD 申请助手',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'PhD 申请选校系统 · 多源排名数据 · 选校清单管理 · 趋势可视化' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:8081'
    }
  },

  // nuxt 4 + h3 1.15: routeRules.proxy 替代 nitro.devProxy
  // target 必须包含被剥前缀 + /** 收尾 (memory 06-09 devDashboard 立)
  // 用 /api/v1/** narrow, 避免误伤 /api/_nuxt_icon/:collection
  routeRules: {
    '/api/v1/**': {
      proxy: 'http://localhost:8081/api/v1/**'
    }
  },

  ui: {
    primary: '#1456f0',
    gray: 'neutral',
    icons: 'lucide',
    fonts: false,
    colorMode: false
  }
})
