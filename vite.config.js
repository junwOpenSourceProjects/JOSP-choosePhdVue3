// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuejsx from '@vitejs/plugin-vue-jsx'
// import vueDevTools from 'vite-plugin-vue-dev-tools'
// import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// import AutoImport from 'unplugin-auto-import/vite'
// import Components from 'unplugin-vue-components/vite'
import ElementPlus from 'unplugin-element-plus/vite'

export default defineConfig({
  plugins: [
    vue(),
    vuejsx(),
    // vueDevTools(),
    // AutoImport({
    //   resolvers: [ElementPlusResolver()],
    // }),
    // Components({
    //   resolvers: [ElementPlusResolver()],
    // }),
    ElementPlus(),
  ],
  server: {
    proxy: {
      // 代理 /api 请求到后端服务器
      '/api': {
        target: 'http://localhost:8081', // 后端服务器地址
        changeOrigin: true, // 改变请求源
        rewrite: (path) => path.replace(/^\/api/, ''), // 重写路径，例如 /api/universities => /universities
      },
    },
    port: 5173, // 可选：指定前端开发服务器端口
  },
})
