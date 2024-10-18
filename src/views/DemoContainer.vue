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
          <el-menu :default-openeds="['1']" router>
            <el-sub-menu index="1">
              <template #title>
                <el-icon><Message /></el-icon> Navigator One
              </template>
              <el-menu-item-group>
                <template #title>Group 1</template>
                <el-menu-item index="1-1">Option 1</el-menu-item>
                <el-menu-item index="1-2">Option 2</el-menu-item>
              </el-menu-item-group>
              <el-menu-item-group title="Group 2">
                <el-menu-item index="1-3">Option 3</el-menu-item>
              </el-menu-item-group>
              <el-sub-menu index="1-4">
                <template #title>Option4</template>
                <el-menu-item index="1-4-1">Option 4-1</el-menu-item>
              </el-sub-menu>
            </el-sub-menu>
          </el-menu>
        </el-scrollbar>
      </el-aside>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <!-- 查询区域 -->
        <el-card class="search-card">
          <el-form :inline="true" :model="searchForm" @submit.native.prevent="handleSearch">
            <el-form-item label="大学名称">
              <el-input v-model="searchForm.universityNameChinese" placeholder="请输入大学名称"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <!-- 表格区域 -->
        <el-scrollbar>
          <el-table :data="tableData" style="width: 100%" :loading="loading">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="universityNameChinese" label="中文名称" />
            <el-table-column prop="universityNameEnglish" label="英文名称" />
            <el-table-column prop="universityTags" label="标签" />
            <el-table-column prop="universityTagsState" label="标签状态" />
            <el-table-column prop="rankingYear" label="排名年份" />
            <el-table-column prop="currentRankIntegerQs" label="QS当前排名" />
            <el-table-column prop="currentRankIntegerQsCs" label="QS CS排名" />
            <el-table-column prop="currentRankIntegerUsnews" label="US News排名" />
            <el-table-column prop="currentRankIntegerUsnewsCs" label="US News CS排名" />
          </el-table>
        </el-scrollbar>

        <!-- 分页组件 -->
        <div class="pagination">
          <el-pagination
            background
            layout="prev, pager, next, jumper, ->, total"
            :current-page.sync="currentPage"
            :page-size="limit"
            :total="total"
            @current-change="handlePageChange"
          />
        </div>
      </el-main>
    </el-container>
  </el-container>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Menu as IconMenu,
  Message,
  Setting,
} from '@element-plus/icons-vue'

// 定义表格数据接口
interface UniversityData {
  id: number
  universityNameChinese: string
  universityNameEnglish: string
  universityTags: string
  universityTagsState: string
  rankingYear: string
  currentRankIntegerQs: number
  currentRankIntegerQsCs: number
  currentRankIntegerUsnews: number
  currentRankIntegerUsnewsCs: number
}

// 定义搜索表单
const searchForm = ref({
  universityNameChinese: '',
})

// 表格数据
const tableData = ref<UniversityData[]>([])

// 分页相关
const currentPage = ref(1)
const limit = ref(10)
const total = ref(0)

// 加载状态
const loading = ref(false)

// 获取数据的函数
const fetchData = async () => {
  loading.value = true
  try {
    // 构建查询参数
    const params = new URLSearchParams({
      page: String(currentPage.value),
      limit: String(limit.value),
      universityNameChinese: searchForm.value.universityNameChinese,
    })

    // 发送请求
    const response = await fetch(`/api/query/queryAll?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 如果需要认证，可以在这里添加认证头，例如：
        // 'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    // 假设 API 返回的数据结构如下：
    // {
    //   data: [...], // 数据数组
    //   total: 100,  // 总记录数
    // }

    tableData.value = data.data
    total.value = data.total
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchData()
}

// 重置搜索
const resetSearch = () => {
  searchForm.value.universityNameChinese = ''
  handleSearch()
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
  fetchData()
}

// 初始化获取数据
onMounted(() => {
  fetchData()
})
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

/* 查询卡片样式 */
.search-card {
  margin-bottom: 20px;
  padding: 20px;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
