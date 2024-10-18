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
          <el-form :inline="true" :model="searchForm" @submit.native.prevent="handleSearch" class="search-form">
            <el-row :gutter="20" type="flex" justify="start">
              <el-col :span="6">
                <el-form-item label="大学名称">
                  <el-input v-model="searchForm.universityName" placeholder="请输入大学名称"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="所在大洲">
                  <el-select v-model="searchForm.universityTagsState" placeholder="请选择大洲" clearable>
                    <el-option label="亚洲" value="亚洲"></el-option>
                    <el-option label="欧洲" value="欧洲"></el-option>
                    <el-option label="北美洲" value="北美洲"></el-option>
                    <el-option label="南美洲" value="南美洲"></el-option>
                    <el-option label="非洲" value="非洲"></el-option>
                    <el-option label="大洋洲" value="大洋洲"></el-option>
                    <el-option label="南极洲" value="南极洲"></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="所在国家">
                  <el-input v-model="searchForm.universityTags" placeholder="请输入所在国家"></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="6">
                <el-form-item label="QS排名高于">
                  <el-input-number v-model="searchForm.currentRank" :min="1" placeholder="请输入排名"></el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20" type="flex" justify="start" class="button-row">
              <el-col :span="6">
                <el-form-item>
                  <el-button type="primary" @click="handleSearch">查询</el-button>
                  <el-button @click="resetSearch">重置</el-button>
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-card>

        <!-- 表格区域 -->
        <el-scrollbar>
          <el-table :data="tableData" style="width: 100%" :loading="loading">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="universityNameChinese" label="中文名称" />
            <el-table-column prop="universityNameEnglish" label="英文名称" />
            <el-table-column prop="universityTags" label="所在国家" />
            <el-table-column prop="universityTagsState" label="所在大洲" />
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
  universityTags: string        // 所在国家
  universityTagsState: string   // 所在大洲
  rankingYear: string
  currentRankIntegerQs: number
  currentRankIntegerQsCs: number
  currentRankIntegerUsnews: number
  currentRankIntegerUsnewsCs: number
}

// 定义搜索表单
const searchForm = ref({
  universityName: '',
  universityTagsState: '', // 所在大洲
  universityTags: '',      // 所在国家
  currentRank: '',         // QS排名高于某个值
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
    const params: Record<string, string> = {
      page: String(currentPage.value),
      limit: String(limit.value),
      universityName: searchForm.value.universityName,
    }

    // 仅添加有值的搜索条件
    if (searchForm.value.universityTagsState) {
      params.universityTagsState = searchForm.value.universityTagsState
    }
    if (searchForm.value.universityTags) {
      params.universityTags = searchForm.value.universityTags
    }
    if (searchForm.value.currentRank) {
      params.currentRank = String(searchForm.value.currentRank)
    }

    const queryString = new URLSearchParams(params).toString()

    // 使用 /api 前缀
    const response = await fetch(`/api/query/queryAll?${queryString}`, {
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

    tableData.value = data.records
    total.value = data.total
  } catch (error: any) {
    ElMessage.error(`获取数据失败: ${error.message}`)
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
  searchForm.value.universityName = ''
  searchForm.value.universityTagsState = ''
  searchForm.value.universityTags = ''
  searchForm.value.currentRank = ''
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
  /* 使用 Flex 布局调整间距 */
  display: flex;
  flex-direction: column;
}

/* 搜索表单样式 */
.search-form {
  width: 100%;
}

/* 按钮行样式 */
.button-row {
  margin-top: 10px;
}

/* 分页样式 */
.pagination {
  margin-top: 20px;
  text-align: right;
}
</style>
