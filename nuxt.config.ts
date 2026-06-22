import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: false },

  // 项目结构是 root 布局,不用 Nuxt 4 默认的 srcDir='app/'
  // 显式设 srcDir='.' 后, ~ / @ alias 必须显式配 (memory 06-18 billDesktop 立)
  // + pages/components/composables 等目录也需显式配 (Nuxt 4 srcDir 默认从 app/ 推, 不跟 srcDir 走)
  srcDir: '.',
  dir: {
    pages: 'pages',
    layouts: 'layouts',
    middleware: 'middleware',
    plugins: 'plugins',
    assets: 'assets',
    public: 'public'
  },

  modules: ['@nuxt/ui', '@pinia/nuxt'],

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
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap' }
      ]
    }
  },

  css: ['~/assets/css/main.css'],

  vite: {
    build: {
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          manualChunks(id: string) {
            // 把 ECharts 拆到独立 chunk，避免污染首屏 bundle
            if (id.includes('node_modules/echarts') || id.includes('node_modules/vue-echarts')) {
              return 'echarts'
            }
            // ⚠️ 不要把 @iconify 拆到独立 chunk!
            // Nuxt Icon 的 SSR 渲染依赖 @iconify/utils / @iconify/vue 在首屏可用,
            // 拆成 async chunk 会导致:SSR 阶段 SVG 渲染成空骨架(占位框),
            // client hydrate 时 chunk 还没下载完 → 显示成几何方块,
            // hydration mismatch 后部分 icon 永久缺字。
            // 详见 T-01 hotfix (commit 见后续)。图标集合走 @iconify-json/lucide
            // 单独打包(约 1-2MB),会被 tree-shake 到具体使用的 icon 名。
          }
        }
      }
    }
  },

  runtimeConfig: {
    public: {
      baseURL: process.env.NUXT_PUBLIC_BASE_URL || 'http://localhost:8081'
    }
  },

  // nuxt 4 + h3 1.15: routeRules.proxy 替代 nitro.devProxy
  // target 必须包含被剥前缀 + /** 收尾
  // 用 /api/v1/** narrow, 避免误伤 /api/_nuxt_icon/:collection
  routeRules: {
    '/api/v1/**': {
      proxy: 'http://localhost:8081/api/v1/**'
    }
  },

  ui: {
    // @ts-ignore @nuxt/ui v4 types omit legacy primary string, runtime still accepts it
    primary: '#0a0a0a',
    gray: 'neutral',
    icons: 'lucide',
    fonts: false,
    colorMode: false
  }
})
