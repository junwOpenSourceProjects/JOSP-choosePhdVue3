/*
 * @Author: junw wo1261931780@gmail.com
 * @Date: 2024-10-18 08:44:03
 * @LastEditors: junw wo1261931780@gmail.com
 * @LastEditTime: 2024-10-18 16:42:07
 * @FilePath: \chooseCollegeVue\src\main.js
 * @Description: 1111
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)
app.mount('#app')
