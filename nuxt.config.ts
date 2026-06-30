// nuxt.config.ts
// choosePhd Web - Nuxt 4 配置

export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    '@nuxtjs/i18n'
  ],

  css: [
    '~/assets/css/tokens.css',
    '~/assets/css/main.css'
  ],

  i18n: {
    strategy: 'prefix',
    defaultLocale: 'zh-CN',
    locales: [
      { code: 'zh-CN', name: '简体中文', file: 'zh-CN.json' },
      { code: 'en-US', name: 'English', file: 'en-US.json' },
      { code: 'ja-JP', name: '日本語', file: 'ja-JP.json' },
      { code: 'ko-KR', name: '한국어', file: 'ko-KR.json' }
    ],
    langDir: 'i18n/locales',
    lazy: true,
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'choosephd_lang',
      redirectOn: 'root',
      fallbackLocale: 'zh-CN'
    }
  },

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
        { property: 'og:description', content: '整合 QS、US News、ARWU、CSRankings 等公开榜单数据，提供跨榜单对比与选校建议。' },
        { property: 'og:type', content: 'website' },
        { property: 'og:image', content: 'https://choosephd.com/og-cover.png' },
        { property: 'og:url', content: 'https://choosephd.com' },
        { property: 'og:locale', content: 'zh_CN' },
        { property: 'og:locale:alternate', content: 'en_US' },
        { property: 'og:locale:alternate', content: 'ja_JP' },
        { property: 'og:locale:alternate', content: 'ko_KR' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'choosePhd · PhD 选校助手' },
        { name: 'twitter:description', content: '整合 QS、US News、ARWU、CSRankings 等公开榜单数据，提供跨榜单对比与选校建议。' },
        { name: 'twitter:image', content: 'https://choosephd.com/og-cover.png' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&display=swap', media: 'print', onload: 'this.media=\'all\'' }
      ]
    }
  },

  // 运行时配置
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:56586/api/v1',
    }
  },

  // @nuxt/ui v4 配置
  ui: {
    colorMode: false,
    fonts: false
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

  ssr: true,

  typescript: {
    strict: true,
    typeCheck: false
  },

  experimental: {
    payloadExtraction: false
  },

  nitro: {
    compressPublicAssets: true
  }
})
