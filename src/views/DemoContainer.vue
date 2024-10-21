<template>
  <el-container class="layout-container-demo">
    <!-- 顶部 Header -->
    <el-header class="header">
      <el-menu
        :default-active="activeIndex"
        class="el-menu-demo"
        mode="horizontal"
        :ellipsis="false"
        @select="handleSelect"
      >
        <el-menu-item index="1">Home</el-menu-item>
        <el-sub-menu index="2">
          <template #title>Pages</template>
          <el-menu-item index="page1">Page 1</el-menu-item>
          <el-menu-item index="page2">Page 2</el-menu-item>
          <el-menu-item index="page3">Page 3</el-menu-item>
          <el-menu-item index="page4">Page 4</el-menu-item>
        </el-sub-menu>
        <el-menu-item index="3">About</el-menu-item>
        <el-menu-item index="4">Contact</el-menu-item>
      </el-menu>
    </el-header>

    <!-- 主体部分，包含侧边栏和主内容 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="200px" class="aside">
        <el-scrollbar>
          <el-menu
            default-active="home"
            class="el-menu-vertical-demo"
            @select="handleSelect"
            router
          >
            <el-sub-menu index="1">
              <template #title>
                <el-icon><Message /></el-icon>
                <span>Navigator One</span>
              </template>
              <el-menu-item-group>
                <template #title>Group 1</template>
                <el-menu-item index="page1">我是page1</el-menu-item>
                <el-menu-item index="page2">我是page2</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group title="Group 2">
                <el-menu-item index="page3">我是page3</el-menu-item>
              </el-menu-item-group>
              <el-sub-menu index="1-4">
                <template #title>Option4</template>
                <el-menu-item index="page4">我是page4</el-menu-item>
              </el-sub-menu>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <el-page-header @back="onBack">
          <template #breadcrumb>
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">homepage</el-breadcrumb-item>
              <el-breadcrumb-item>Dashboard</el-breadcrumb-item>
            </el-breadcrumb>
          </template>
          <template #content>
            <div class="flex items-center">
              <span class="text-large font-600 mr-3"> Dashboard </span>
              <span class="text-sm mr-2" style="color: var(--el-text-color-regular)">
                Overview of tasks
              </span>
              <el-tag>Active</el-tag>
            </div>
          </template>
        </el-page-header>

        <div v-if="loading">Loading tasks...</div>
        <el-card v-for="(task, index) in tasks" :key="index" class="task-card">
          <h3>{{ task }}</h3>
        </el-card>

        <h2>Project Description</h2>
        <p>This project is designed to manage tasks efficiently and effectively...</p>
        <router-view />
      </el-main>
    </el-container>

    <!-- 底部 Footer -->
    <el-footer class="footer">
      <span>? 2023 My App. All rights reserved.</span>
    </el-footer>
  </el-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message } from '@element-plus/icons-vue'
import axios from 'axios'

const router = useRouter()
const activeIndex = ref('1')

const handleSelect = (key) => {
  if (key === '0') {
    router.push('/')
  } else {
    router.push(`/${key}`).catch((err) => {
      if (err.name !== 'NavigationDuplicated') {
        ElMessage.error(err.message)
      }
    })
  }
}

const tasks = ref([])
const loading = ref(true)

const fetchTasks = async () => {
  try {
    const response = await axios.get('/api/status/tasks')
    tasks.value = response.data
  } catch (error) {
    ElMessage.error('Failed to load tasks')
  } finally {
    loading.value = false
  }
}

const onBack = () => {
  ElMessage.info('Back')
}

onMounted(() => {
  fetchTasks()
})
</script>

<style scoped>
.layout-container-demo {
  height: 100%;
}

/* Header 样式 */
.header {
  background-color: var(--el-color-primary);
  color: white;
}

.avatar {
  display: none;
}

/* 侧边栏样式 */
.aside {
  background: var(--el-color-primary-light-8);
  color: var(--el-text-color-primary);
}

/* 主内容区样式 */
.main-content {
  padding: 20px;
  background-color: #f0f2f5;
}

.task-card {
  margin-bottom: 20px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  padding: 16px;
  background-color: white;
}

/* Footer 样式 */
.footer {
  background-color: var(--el-color-primary-dark-3);
  color: white;
  text-align: center;
  padding: 10px 0;
}
</style>
