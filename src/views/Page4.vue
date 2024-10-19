<template>
  <div>
    <!-- 查询卡片，仅保留查询和重置按钮 -->
    <el-card class="search-card">
      <el-form :inline="true" @submit.prevent="handleSearch" class="search-form">
        <el-row :gutter="20" type="flex" justify="start" class="button-row">
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
              <el-button @click="toggleDataColumns" style="margin-left: 10px">
                {{ showDataColumns ? '隐藏数据' : '展示数据' }}
              </el-button>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 多选控制按钮 -->
    <div style="margin-bottom: 20px;">
      <el-button @click="toggleSelection([tableData[0], tableData[1]])" type="primary" size="small">选择前两行</el-button>
      <el-button @click="clearSelection" type="danger" size="small">清除选择</el-button>
    </div>

    <!-- 表格区域 -->
    <el-scrollbar>
      <el-table
        ref="multipleTableRef"
        :data="filteredData"
        style="width: 100%"
        :loading="loading"
        row-key="id"
        @selection-change="handleSelectionChange"
        @filter-change="handleFilterChange"
      >
        <!-- 多选列 -->
        <el-table-column
          type="selection"
          width="55"
          :selectable="selectable"
        />

        <!-- 大学中文名列，带有自定义表头搜索 -->
        <el-table-column
          prop="universityNameChinese"
          label="大学中文名"
          sortable
          :filters="nameFilters"
          :filter-method="filterHandler"
        >
          <template #header>
            <el-input v-model="searchName" size="small" placeholder="搜索中文名" @input="handleSearch" />
          </template>
          <template #default="scope">
            {{ scope.row.universityNameChinese }}
          </template>
        </el-table-column>

        <!-- 所在国家列，带有筛选 -->
        <el-table-column
          prop="universityTags"
          label="所在国家"
          sortable
          :filters="countryFilters"
          :filter-method="filterHandler"
        >
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.universityTags)">{{ scope.row.universityTags || '无' }}</el-tag>
          </template>
        </el-table-column>

        <!-- 所在大洲列，带有筛选 -->
        <el-table-column
          prop="universityTagsState"
          label="所在大洲"
          sortable
          :filters="continentFilters"
          :filter-method="filterHandler"
        >
          <template #default="scope">
            {{ scope.row.universityTagsState || '无' }}
          </template>
        </el-table-column>

        <!-- QS数据列 -->
        <el-table-column
          v-if="showDataColumns"
          prop="rankingQs"
          label="QS数据"
          sortable
          :formatter="formatRanking"
        />

        <!-- QS排名强弱列，带有筛选 -->
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

        <!-- QS计算机科学数据列 -->
        <el-table-column
          v-if="showDataColumns"
          prop="rankingQsCs"
          label="QS计算机科学数据"
          sortable
          :formatter="formatRanking"
        />

        <!-- QS计算机排名强弱列，带有筛选 -->
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

        <!-- US News数据列 -->
        <el-table-column
          v-if="showDataColumns"
          prop="rankingUsnews"
          label="US News数据"
          sortable
          :formatter="formatRanking"
        />

        <!-- US News排名强弱列，带有筛选 -->
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

        <!-- US News计算机科学数据列 -->
        <el-table-column
          v-if="showDataColumns"
          prop="rankingUsnewsCs"
          label="US News计算机科学数据"
          sortable
          :formatter="formatRanking"
        />

        <!-- US News计算机排名强弱列，带有筛选 -->
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

        <!-- 整体排名强弱列，带有筛选 -->
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

        <!-- 是否考虑列，带有筛选 -->
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

        <!-- 操作列 -->
        <el-table-column label="操作" fixed="right" width="160">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openEditDialog(scope.row)">修改</el-button>
            <el-button type="warning" size="small" @click="hideRow(scope.row)" style="margin-left: 5px">隐藏</el-button>
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

<script lang="ts" setup>
import { ref, onMounted, reactive, computed } from 'vue'
import axios from 'axios'
import { ElMessage } from 'element-plus'
import type { TableInstance, TableColumnCtx } from 'element-plus'

interface University {
  id: number
  universityNameChinese: string
  universityTags: string | null
  universityTagsState: string | null
  rankingQs: string
  rankingQsCs: string
  rankingUsnews: string
  rankingUsnewsCs: string
  statusQs: number
  statusQsCs: number
  statusUsnews: number
  statusUsnewsCs: number
  statusTotal: number
  consider: number
}

// 表格数据
const tableData = ref<University[]>([])

// 搜索中文名
const searchName = ref('')

// 分页相关
const currentPage = ref(1)
const limit = ref(10)

// 加载状态
const loading = ref(false)

// 筛选条件（仅用于自定义搜索）
const filters = reactive({
  universityNameChinese: '',
  universityTags: '',
  universityTagsState: '',
})

// 筛选选项（动态生成）
const countryFilters = ref<{ text: string; value: string }[]>([])
const continentFilters = ref<{ text: string; value: string }[]>([])
const statusFilters = ref([
  { text: '弱', value: 0 },
  { text: '中等', value: 1 },
  { text: '强', value: 2 },
])
const considerFilters = ref([
  { text: '考虑', value: 1 },
  { text: '不考虑', value: 0 },
])
const nameFilters = ref<{ text: string; value: string }[]>([]) // 动态生成大学中文名的筛选选项

// 状态标签
const statuses = {
  statusQs: { label: 'QS排名强弱' },
  statusQsCs: { label: 'QS计算机排名强弱' },
  statusUsnews: { label: 'US News排名强弱' },
  statusUsnewsCs: { label: 'US News计算机排名强弱' },
  statusTotal: { label: '整体排名强弱' },
}

// 表格引用，用于操作筛选和多选
const tableRef = ref<TableInstance>()
const multipleTableRef = ref<TableInstance>()

// 多选选中的行
const multipleSelection = ref<University[]>([])

// 用于隐藏行的ID集合
const hiddenRowIds = ref<Set<number>>(new Set())

// 用于控制数据列的显示与隐藏
const showDataColumns = ref(false)

// 筛选函数
const filterHandler = (value: any, row: University, column: TableColumnCtx<University>) => {
  return row[column.property as keyof University] === value
}

// 获取状态标签文本
const getStatusText = (status: number) => {
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
const getStatusTagType = (status: number) => {
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

// 获取所在国家标签类型（可根据需求自定义）
const getTagType = (tag: string | null) => {
  return tag ? 'primary' : 'info'
}

// 打开修改对话框
const formDialogVisible = ref(false)
const formData = reactive({
  id: 0,
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
const openEditDialog = (row: University) => {
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
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        // 发送更新请求到后端
        const response = await axios.post('/api/status/insertOrUpdate', formData)

        if (response.data.success) {
          ElMessage.success('更新成功')
          formDialogVisible.value = false
          fetchData()
        } else {
          throw new Error(response.data.message || '更新失败')
        }
      } catch (error: any) {
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
  searchName.value = ''
  handleSearch()
  if (tableRef.value) {
    tableRef.value.clearFilter()
  }
  clearSelection()
}

// 处理搜索（重新获取数据）
const handleSearch = () => {
  currentPage.value = 1
  // applyFilters()  --> 已经在 computed 中处理
}

// 处理分页变化
const handlePageChange = (page: number) => {
  currentPage.value = page
}

// 处理筛选变化
const handleFilterChange = () => {
  currentPage.value = 1
}

// 选择不可选择的行
const selectable = (row: University) => {
  // 例如：不允许选择 id 为 1 和 2 的行
  return row.id !== 1 && row.id !== 2
}

// 处理多选变化
const handleSelectionChange = (val: University[]) => {
  multipleSelection.value = val
}

// 切换选择状态
const toggleSelection = (rows: University[], ignoreSelectable?: boolean) => {
  rows.forEach((row) => {
    multipleTableRef.value.toggleRowSelection(row, ignoreSelectable)
  })
}

// 清除所有选择
const clearSelection = () => {
  multipleTableRef.value.clearSelection()
}

// 切换数据列的显示与隐藏
const toggleDataColumns = () => {
  showDataColumns.value = !showDataColumns.value
}

// 隐藏某一行
const hideRow = (row: University) => {
  hiddenRowIds.value.add(row.id)
}

// 计算过滤后的数据（包括搜索和筛选）
const filteredData = computed(() => {
  let data = tableData.value

  // 排除隐藏的行
  data = data.filter(row => !hiddenRowIds.value.has(row.id))

  // 搜索中文名
  if (searchName.value) {
    data = data.filter(row => row.universityNameChinese.toLowerCase().includes(searchName.value.toLowerCase()))
  }

  return data
})

// 格式化排名数据（将字符串转换为展示更友好的格式）
const formatRanking = (row: University, column: any, cellValue: string) => {
  // 这里简单地返回原始字符串，你可以根据需要进行格式化
  return cellValue
}

// 获取动态生成的大学中文名筛选选项
const generateNameFilters = () => {
  const nameSet = new Set<string>()
  tableData.value.forEach(item => {
    if (item.universityNameChinese) {
      nameSet.add(item.universityNameChinese)
    }
  })
  nameFilters.value = Array.from(nameSet).map(name => ({ text: name, value: name }))
}

// 动态生成国家和大洲筛选选项
const generateCountryAndContinentFilters = () => {
  const countrySet = new Set<string>()
  const continentSet = new Set<string>()

  tableData.value.forEach(item => {
    if (item.universityTags) {
      countrySet.add(item.universityTags)
    }
    if (item.universityTagsState) {
      continentSet.add(item.universityTagsState)
    }
  })

  countryFilters.value = Array.from(countrySet).map(country => ({ text: country, value: country }))
  continentFilters.value = Array.from(continentSet).map(continent => ({ text: continent, value: continent }))
}

// 获取数据的函数
const fetchData = async () => {
  loading.value = true
  try {
    // 使用 axios 调用查询接口，不传递任何参数
    const response = await axios.get<University[]>('/api/status/queryRankingStatus')

    tableData.value = response.data || []

    // 生成筛选选项
    generateNameFilters()
    generateCountryAndContinentFilters()
  } catch (error: any) {
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
  const dialog = document.querySelector('.draggable-dialog .el-dialog') as HTMLElement
  const header = dialog.querySelector('.el-dialog__header') as HTMLElement
  dialog.style.top = '100px'

  header.style.cursor = 'move'

  let isDragging = false
  let startX = 0
  let startY = 0
  let initialX = 0
  let initialY = 0

  const onMouseDown = (e: MouseEvent) => {
    isDragging = true
    startX = e.clientX
    startY = e.clientY
    const rect = dialog.getBoundingClientRect()
    initialX = rect.left
    initialY = rect.top
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const onMouseMove = (e: MouseEvent) => {
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
