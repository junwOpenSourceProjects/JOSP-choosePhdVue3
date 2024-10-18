<!-- src/views/DemoContainer.vue -->
<template>
  <el-container class="layout-container-demo">
    <!-- 顶部 Header -->
    <el-header class="header">
      <div class="toolbar">
        <el-dropdown>
          <el-icon class="dropdown-icon">
            <Setting />
          </el-icon>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>View</el-dropdown-item>
              <el-dropdown-item>Add</el-dropdown-item>
              <el-dropdown-item>Delete</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
        <span>Tom</span>
      </div>
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
                <el-menu-item index="page1">Option 1</el-menu-item>
                <el-menu-item index="page2">Option 2</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group title="Group 2">
                <el-menu-item index="page3">Option 3</el-menu-item>
              </el-menu-item-group>
              <el-sub-menu index="1-4">
                <template #title>Option4</template>
                <el-menu-item index="page4">Option 4-1</el-menu-item>
              </el-sub-menu>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Setting, Message } from '@element-plus/icons-vue'

export default {
  name: 'DemoContainer',
  setup() {
    const router = useRouter()

    const handleSelect = (key, keyPath) => {
      if (key === 'home') {
        router.push('/')
      } else {
        router.push(`/${key}`).catch((err) => {
          if (err.name !== 'NavigationDuplicated') {
            ElMessage.error(err.message)
          }
        })
      }
    }

    return {
      handleSelect,
    }
  },
}
</script>

<style scoped>
.layout-container-demo {
  height: 100vh; /* 使用视口高度，确保全屏 */
}

/* Header 样式 */
.layout-container-demo .el-header {
  background-color: var(--el-color-primary-light-7);
  color: var(--el-text-color-primary);
  display: flex;
  align-items: center;
  padding: 0 20px;
}

/* 侧边栏样式 */
.layout-container-demo .el-aside {
  background: var(--el-color-primary-light-8);
  color: var(--el-text-color-primary);
}

/* 菜单样式 */
.layout-container-demo .el-menu {
  border-right: none;
}

/* 主内容区样式 */
.layout-container-demo .el-main {
  padding: 20px;
  background-color: #f0f2f5;
}

/* 工具栏样式 */
.toolbar {
  display: flex;
  align-items: center;
}

/* 下拉图标样式 */
.dropdown-icon {
  margin-right: 8px;
  margin-top: 1px;
}
</style>
