// nuxt.config.ts
// choosePhd Web - Nuxt 4 配置
// 严格遵循 dev-plan §3.2: icons <= 20px, deep gray + indigo 强调色, SSR-safe ECharts

export default defineNuxtConfig({
  // Nuxt 4 默认 srcDir 为 'app',与 dev-plan §3.2.2 一致
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/main.css'
  ],

  // 全局 app 元信息
  app: {
    head: {
      title: 'choosePhd · 院校选择',
      titleTemplate: '%s · choosePhd',
      htmlAttrs: { lang: 'zh-CN' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '5,365 所大学,113K 条排名记录,跨 10 个榜单的真实排名对比,帮你选对博士/硕士项目。' },
        { property: 'og:title', content: 'choosePhd · 院校选择' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        // 字体 preconnect (DM Sans)
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' }
      ]
    }
  },

  // 运行时配置 (后端 API 基地址)
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8081/api/v1',
    }
  },

  // @nuxt/ui v4 配置
  ui: {
    colorMode: false, // MVP 暂不启用暗色模式
    fonts: false      // 禁用 @nuxt/ui 自动字体下载，避免国内/无网络环境请求 fontsource/fontshare/googleicons 失败；页面字体通过 app.head 手动引入 DM Sans
  },

  // Vite: ECharts / vue-echarts 拆 chunk
  vite: {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            echarts: ['echarts', 'echarts/core', 'echarts/charts', 'echarts/components', 'echarts/renderers', 'vue-echarts']
          }
        }
      }
    }
  },

  // SSR 配置
  ssr: true,

  // TypeScript
  typescript: {
    strict: true,
    typeCheck: false // dev 不开,build 走 vue-tsc
  },

  experimental: {
    payloadExtraction: false
  },

  nitro: {
    compressPublicAssets: true
  }
})