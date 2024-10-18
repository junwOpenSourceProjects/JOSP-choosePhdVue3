<!-- src/views/Home.vue -->
<template>
    <div>
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
          v-model:current-page="currentPage"
          :page-size="limit"
          :total="total"
          @current-change="handlePageChange"
        />
      </div>
    </div>
  </template>

  <script>
  import { ref, onMounted } from 'vue'
  import { ElMessage } from 'element-plus'

  export default {
    name: 'Home',
    setup() {
      // 定义表格数据
      const tableData = ref([])

      // 定义搜索表单
      const searchForm = ref({
        universityName: '',
        universityTagsState: '', // 所在大洲
        universityTags: '',      // 所在国家
        currentRank: '',         // QS排名高于某个值
      })

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
          const params = {
            page: currentPage.value,
            limit: limit.value,
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
            params.currentRank = searchForm.value.currentRank
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
          //   records: [...], // 数据数组
          //   total: 100,  // 总记录数
          // }

          tableData.value = data.records
          total.value = data.total
        } catch (error) {
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
      const handlePageChange = (page) => {
        currentPage.value = page
        fetchData()
      }

      // 初始化获取数据
      onMounted(() => {
        fetchData()
      })

      return {
        tableData,
        searchForm,
        currentPage,
        limit,
        total,
        loading,
        handleSearch,
        resetSearch,
        handlePageChange,
      }
    },
  }
  </script>

  <style scoped>
  /* 查询卡片样式 */
  .search-card {
    margin-bottom: 20px;
    padding: 20px;
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
