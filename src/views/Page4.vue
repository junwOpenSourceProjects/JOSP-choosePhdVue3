<!-- src/views/Page4.vue -->
<template>
  <div>
    <!-- 查询卡片，仅保留查询和重置按钮 -->
    <el-card class="search-card">
      <el-form :inline="true" @submit.native.prevent="handleSearch" class="search-form">
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
      <el-table
        ref="tableRef"
        :data="paginatedData"
        style="width: 100%"
        :loading="loading"
        row-key="id"
        @filter-change="handleFilterChange"
      >
        <!-- 表格列定义 -->
        <el-table-column
          prop="universityNameChinese"
          label="大学中文名"
          sortable
          :filters="nameFilters"
          :filter-method="filterHandler"
        >
          <template #filter>
            <el-input v-model="filters.universityNameChinese" placeholder="请输入大学中文名" @input="applyFilter('universityNameChinese')"></el-input>
          </template>
        </el-table-column>

        <el-table-column
          prop="universityTags"
          label="所在国家"
          sortable
          :filters="countryFilters"
          :filter-method="filterHandler"
        >
          <template #default="scope">
            <el-tag :type="getConsiderTagType(scope.row.consider)">{{ scope.row.universityTags }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="universityTagsState"
          label="所在大洲"
          sortable
          :filters="continentFilters"
          :filter-method="filterHandler"
        ></el-table-column>

        <el-table-column prop="rankingQs" label="QS数据" sortable></el-table-column>

        <el-table-column
          prop="statusQs"
          label="QS排名强弱"
          sortable
          :filters="statusFilters"
          :filter-method="filterHandler"
        >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.statusQs)">{{ getStatusText(scope.row.statusQs) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="rankingQsCs" label="QS计算机科学数据" sortable></el-table-column>

        <el-table-column
          prop="statusQsCs"
          label="QS计算机排名强弱"
          sortable
          :filters="statusFilters"
          :filter-method="filterHandler"
        >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.statusQsCs)">{{ getStatusText(scope.row.statusQsCs) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="rankingUsnews" label="US News数据" sortable></el-table-column>

        <el-table-column
          prop="statusUsnews"
          label="US News排名强弱"
          sortable
          :filters="statusFilters"
          :filter-method="filterHandler"
        >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.statusUsnews)">{{ getStatusText(scope.row.statusUsnews) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="rankingUsnewsCs" label="US News计算机科学数据" sortable></el-table-column>

        <el-table-column
          prop="statusUsnewsCs"
          label="US News计算机排名强弱"
          sortable
          :filters="statusFilters"
          :filter-method="filterHandler"
        >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.statusUsnewsCs)">{{ getStatusText(scope.row.statusUsnewsCs) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="statusTotal"
          label="整体排名强弱"
          sortable
          :filters="statusFilters"
          :filter-method="filterHandler"
        >
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.statusTotal)">{{ getStatusText(scope.row.statusTotal) }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="consider"
          label="是否考虑"
          sortable
          :filters="considerFilters"
          :filter-method="filterHandler"
        >
          <template #default="scope">
            <el-tag :type="scope.row.consider === 1 ? 'success' : 'info'">
              {{ scope.row.consider === 1 ? '考虑' : '不考虑' }}
            </el-tag>
          </template>
        </el-table-column>

        <!-- 修改按钮列 -->
        <el-table-column label="操作" fixed="right" width="100">
          <template #default="scope">
            <el-button type="primary" size="mini" @click="openEditDialog(scope.row)">修改</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>

    <!-- 分页组件 -->
    <div class="pagination">
      <el-pagination
        background
        layout="prev, pager, next, jumper, ->, total"
        :current-page="currentPage"
        :page-size="limit"
        :total="filteredData.length"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 修改弹出对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      title="修改大学数据"
      width="500px"
      :before-close="handleDialogClose"
      class="draggable-dialog"
      ref="formDialog"
      @open="enableDrag"
    >
      <el-form :model="formData" ref="formRef" label-width="120px" :rules="formRules" autocomplete="off">
        <el-form-item label="大学中文名" prop="universityNameChinese">
          <el-input v-model="formData.universityNameChinese" placeholder="请输入大学中文名"></el-input>
        </el-form-item>

        <!-- 动态生成状态单选按钮 -->
        <template v-for="(status, key) in statuses" :key="key">
          <el-form-item :label="status.label" :prop="key">
            <el-radio-group v-model="formData[key]">
              <el-radio :value="0">弱</el-radio>
              <el-radio :value="1">中等</el-radio>
              <el-radio :value="2">强</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <el-form-item label="是否考虑" prop="consider">
          <el-radio-group v-model="formData.consider">
            <el-radio :value="1">考虑</el-radio>
            <el-radio :value="0">不考虑</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleCancel">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'

export default {
  name: 'Page4',
  setup() {
    // 定义表格数据
    const tableData = ref([])

    // 定义搜索表单（仅保留查询和重置按钮）
    const searchForm = ref({})

    // 分页相关
    const currentPage = ref(1)
    const limit = ref(10)
    // total 不再需要，因为分页在客户端处理

    // 加载状态
    const loading = ref(false)

    // 筛选条件
    const filters = reactive({
      universityNameChinese: '',
      universityTags: '',
      universityTagsState: '',
    })

    // 定义筛选选项
    const countryFilters = ref([
      { text: '中国', value: '中国' },
      { text: '美国', value: '美国' },
      // 根据实际数据添加更多国家
    ])

    const continentFilters = ref([
      { text: '亚洲', value: '亚洲' },
      { text: '欧洲', value: '欧洲' },
      { text: '北美洲', value: '北美洲' },
      { text: '南美洲', value: '南美洲' },
      { text: '非洲', value: '非洲' },
      { text: '大洋洲', value: '大洋洲' },
      { text: '南极洲', value: '南极洲' },
    ])

    const statusFilters = ref([
      { text: '弱', value: 0 },
      { text: '中等', value: 1 },
      { text: '强', value: 2 },
    ])

    const considerFilters = ref([
      { text: '考虑', value: 1 },
      { text: '不考虑', value: 0 },
    ])

    const nameFilters = ref([]) // 动态生成大学中文名的筛选选项

    // 定义状态标签
    const statuses = {
      statusQs: { label: 'QS排名强弱' },
      statusQsCs: { label: 'QS计算机排名强弱' },
      statusUsnews: { label: 'US News排名强弱' },
      statusUsnewsCs: { label: 'US News计算机排名强弱' },
      statusTotal: { label: '整体排名强弱' },
    }

    // 表格引用，用于操作筛选
    const tableRef = ref(null)

    // 筛选函数
    const filterHandler = (value, row, column) => {
      return row[column.property] === value
    }

    // 获取状态标签文本
    const getStatusText = (status) => {
      switch (status) {
        case 0:
          return '弱'
        case 1:
          return '中等'
        case 2:
          return '强'
        default:
          return '-'
      }
    }

    // 获取状态标签类型
    const getStatusTagType = (status) => {
      switch (status) {
        case 0:
          return 'info'
        case 1:
          return 'warning'
        case 2:
          return 'success'
        default:
          return 'default'
      }
    }

    // 获取是否考虑标签类型
    const getConsiderTagType = (consider) => {
      return consider === 1 ? 'success' : 'info'
    }

    // 打开修改对话框
    const formDialogVisible = ref(false)
    const formData = reactive({
      id: '',
      universityNameChinese: '',
      statusQs: 1,
      statusQsCs: 1,
      statusUsnews: 1,
      statusUsnewsCs: 1,
      statusTotal: 1,
      consider: 1,
    })
    const formRef = ref(null)

    const formRules = {
      universityNameChinese: [
        { required: true, message: '请输入大学中文名', trigger: 'blur' },
      ],
      statusQs: [
        { required: true, message: '请选择QS排名强弱', trigger: 'change' },
      ],
      statusQsCs: [
        { required: true, message: '请选择QS计算机排名强弱', trigger: 'change' },
      ],
      statusUsnews: [
        { required: true, message: '请选择US News排名强弱', trigger: 'change' },
      ],
      statusUsnewsCs: [
        { required: true, message: '请选择US News计算机排名强弱', trigger: 'change' },
      ],
      statusTotal: [
        { required: true, message: '请选择整体排名强弱', trigger: 'change' },
      ],
      consider: [
        { required: true, message: '请选择是否考虑', trigger: 'change' },
      ],
    }

    // 打开编辑对话框
    const openEditDialog = (row) => {
      Object.assign(formData, {
        id: row.id,
        universityNameChinese: row.universityNameChinese,
        statusQs: row.statusQs,
        statusQsCs: row.statusQsCs,
        statusUsnews: row.statusUsnews,
        statusUsnewsCs: row.statusUsnewsCs,
        statusTotal: row.statusTotal,
        consider: row.consider,
      })
      formDialogVisible.value = true
    }

    // 关闭对话框
    const handleDialogClose = () => {
      formDialogVisible.value = false
    }

    // 提交表单
    const submitForm = () => {
      formRef.value.validate(async (valid) => {
        if (valid) {
          try {
            // 发送更新请求到后端
            const response = await fetch(`/api/status/insertOrUpdate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(formData),
            })

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`)
            }

            const data = await response.json()

            if (data.success) {
              ElMessage.success('更新成功')
              formDialogVisible.value = false
              fetchData()
            } else {
              throw new Error(data.message || '更新失败')
            }
          } catch (error) {
            ElMessage.error(`更新失败: ${error.message}`)
            console.error(error)
          }
        } else {
          console.log('表单验证失败')
          return false
        }
      })
    }

    // 重置搜索
    const resetSearch = () => {
      // 清空所有筛选
      filters.universityNameChinese = ''
      filters.universityTags = ''
      filters.universityTagsState = ''
      handleSearch()
      // 清空表格的筛选
      tableRef.value.clearFilter()
    }

    // 处理搜索（重新获取数据）
    const handleSearch = () => {
      currentPage.value = 1
      fetchData()
    }

    // 处理分页变化
    const handlePageChange = (page) => {
      currentPage.value = page
    }

    // 处理筛选变化
    const handleFilterChange = () => {
      currentPage.value = 1
    }

    // 计算过滤后的数据
    const filteredData = computed(() => {
      return tableData.value.filter(row => {
        const matchName = filters.universityNameChinese
          ? row.universityNameChinese.includes(filters.universityNameChinese)
          : true
        const matchCountry = filters.universityTags
          ? row.universityTags === filters.universityTags
          : true
        const matchContinent = filters.universityTagsState
          ? row.universityTagsState === filters.universityTagsState
          : true
        return matchName && matchCountry && matchContinent
      })
    })

    // 计算分页后的数据
    const paginatedData = computed(() => {
      const start = (currentPage.value - 1) * limit.value
      const end = start + limit.value
      return filteredData.value.slice(start, end)
    })

    // 获取数据的函数
    const fetchData = async () => {
      loading.value = true
      try {
        // 直接调用查询接口，不传递任何参数
        const response = await fetch(`/api/status/queryRankingStatus`, {
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
        // }
        tableData.value = data.records || []

        // 动态生成大学中文名的筛选选项
        const nameSet = new Set()
        tableData.value.forEach(item => {
          nameSet.add(item.universityNameChinese)
        })
        nameFilters.value = Array.from(nameSet).map(name => ({ text: name, value: name }))
      } catch (error) {
        ElMessage.error(`获取数据失败: ${error.message}`)
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    // 初始化获取数据
    onMounted(() => {
      fetchData()
    })

    // 可拖拽对话框逻辑
    const enableDrag = () => {
      const dialog = document.querySelector('.draggable-dialog .el-dialog')
      const header = dialog.querySelector('.el-dialog__header')
      dialog.style.top = '100px'

      header.style.cursor = 'move'

      let isDragging = false
      let startX, startY, initialX, initialY

      const onMouseDown = (e) => {
        isDragging = true
        startX = e.clientX
        startY = e.clientY
        const rect = dialog.getBoundingClientRect()
        initialX = rect.left
        initialY = rect.top
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
      }

      const onMouseMove = (e) => {
        if (isDragging) {
          const dx = e.clientX - startX
          const dy = e.clientY - startY
          dialog.style.left = `${initialX + dx}px`
          dialog.style.top = `${initialY + dy}px`
        }
      }

      const onMouseUp = () => {
        isDragging = false
        document.removeEventListener('mousemove', onMouseMove)
        document.removeEventListener('mouseup', onMouseUp)
      }

      header.addEventListener('mousedown', onMouseDown)
    }

    return {
      tableData,
      searchForm,
      currentPage,
      limit,
      loading,
      handleSearch,
      resetSearch,
      handlePageChange,
      handleFilterChange,
      tableRef,
      countryFilters,
      continentFilters,
      statusFilters,
      considerFilters,
      nameFilters,
      filters,
      filterHandler,
      statuses,
      openEditDialog,
      formDialogVisible,
      formData,
      formRef,
      formRules,
      getStatusText,
      getStatusTagType,
      getConsiderTagType,
      submitForm,
      handleDialogClose,
      enableDrag,
      paginatedData,
      filteredData,
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

/* 表格内标签样式调整 */
.el-table th,
.el-table td {
  text-align: center;
}

/* 可拖拽对话框样式 */
.draggable-dialog .el-dialog {
  position: absolute;
}
</style>
