/*
 * @Author: junw wo1261931780@gmail.com
 * @Date: 2024-10-18 08:44:03
 * @LastEditors: junw wo1261931780@gmail.com
 * @LastEditTime: 2024-10-18 11:53:58
 * @FilePath: \chooseCollegeVue\vitest.config.js
 * @Description: 1111
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig, configDefaults } from 'vitest/config'
import viteConfig from './vite.config'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import ElementPlus from 'unplugin-element-plus/vite'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      exclude: [...configDefaults.exclude, 'e2e/**'],
      root: fileURLToPath(new URL('./', import.meta.url))
    }, plugins: [
      // ...
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
      ElementPlus(),
    ],
  })
)
