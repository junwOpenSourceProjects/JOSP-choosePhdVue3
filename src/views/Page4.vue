<template>
  <div>
    <!-- 查询卡片 -->
    <el-card class="search-card">
      <el-form :inline="true" class="search-form">
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
      <el-button @click="hideSelectedRows" type="warning" size="small" style="margin-left: 10px">隐藏选中</el-button>
      <el-button @click="showAllRows" type="success" size="small" style="margin-left: 5px">展示所有</el-button>
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
      >
        <!-- 多选列 -->
        <el-table-column
          type="selection"
          width="55"
          :selectable="selectable"
        />

        <!-- 大学中文名列 -->
        <el-table-column
          prop="universityNameChinese"
          label="大学中文名"
          sortable
          :filters="nameFilters"
          :filter-method="filterHandler"
          @filter-change="handleFilterChange"
        >
          <template #header>
            <el-input v-model="searchName" size="small" placeholder="搜索中文名" @input="handleSearch" />
          </template>
          <template #default="scope">
            {{ scope.row.universityNameChinese }}
          </template>
        </el-table-column>

        <!-- 所在国家列 -->
        <el-table-column
          prop="universityTags"
          label="所在国家"
          sortable
          :filters="countryFilters"
          :filter-method="filterHandler"
          @filter-change="handleFilterChange"
        >
          <template #default="scope">
            <el-tag :type="getTagType(scope.row.universityTags)">{{ scope.row.universityTags || '无' }}</el-tag>
          </template>
        </el-table-column>

        <!-- 所在大洲列 -->
        <el-table-column
          prop="universityTagsState"
          label="所在大洲"
          sortable
          :filters="continentFilters"
          :filter-method="filterHandler"
          @filter-change="handleFilterChange"
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

        <!-- QS排名强弱列 -->
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

        <!-- QS计算机排名强弱列 -->
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

        <!-- US News排名强弱列 -->
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

        <!-- US News计算机排名强弱列 -->
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

        <!-- 整体排名强弱列 -->
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

        <!-- 是否考虑列 -->
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
            <el-button type="primary" size="small" @click="openEditDrawer(scope.row)">修改</el-button>
            <el-button type="warning" size="small" @click="hideRow(scope.row)" style="margin-left: 5px">隐藏</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-scrollbar>

    <!-- 修改抽屉 -->
    <el-drawer
      v-model="editDrawerVisible"
      title="修改大学数据"
      direction="rtl"
      size="50%"
      :before-close="handleDrawerClose"
      class="draggable-drawer"
      ref="editDrawer"
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

      <!-- 嵌套表格展示 -->
      <el-table :data="[formData]">
        <el-table-column property="universityNameChinese" label="大学名称" />
        <el-table-column property="rankingQs" label="QS数据" />
        <el-table-column property="rankingQsCs" label="QS计算机科学数据" />
        <el-table-column property="rankingUsnews" label="US News数据" />
        <el-table-column property="rankingUsnewsCs" label="US News计算机科学数据" />
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleDrawerClose">取消</el-button>
          <el-button type="primary" @click="submitForm">提交</el-button>
        </div>
      </template>
    </el-drawer>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
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

const tableData = ref<University[]>([])
const searchName = ref('')
const loading = ref(false)
const filters = reactive({
  universityNameChinese: '',
  universityTags: '',
  universityTagsState: '',
})
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
const nameFilters = ref<{ text: string; value: string }[]>([])

const statuses = {
  statusQs: { label: 'QS排名强弱' },
  statusQsCs: { label: 'QS计算机排名强弱' },
  statusUsnews: { label: 'US News排名强弱' },
  statusUsnewsCs: { label: 'US News计算机排名强弱' },
  statusTotal: { label: '整体排名强弱' },
}

const tableRef = ref<TableInstance>()
const multipleTableRef = ref<TableInstance>()
const multipleSelection = ref<University[]>([])
const hiddenRowIds = ref<Set<number>>(new Set())
const showDataColumns = ref(false)

const filterHandler = (value: any, row: University, column: TableColumnCtx<University>) => {
  return row[column.property as keyof University] === value
}

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

const getTagType = (tag: string | null) => {
  return tag ? 'primary' : 'info'
}

const editDrawerVisible = ref(false)
const formData = reactive<University>({
  id: 0,
  universityNameChinese: '',
  universityTags: '',
  universityTagsState: '',
  rankingQs: '',
  rankingQsCs: '',
  rankingUsnews: '',
  rankingUsnewsCs: '',
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

const openEditDrawer = (row: University) => {
  Object.assign(formData, row)
  editDrawerVisible.value = true
}

const handleDrawerClose = () => {
  editDrawerVisible.value = false
}

const submitForm = () => {
  formRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        const response = await axios.post('/api/status/insertOrUpdate', formData)

        if (response.data.success) {
          ElMessage.success('更新成功')
          editDrawerVisible.value = false
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

const resetSearch = () => {
  searchName.value = ''
  if (tableRef.value) {
    tableRef.value.clearFilter()
  }
  clearSelection()
  fetchData() // 刷新数据
}

const handleSearch = async () => {
  fetchData() // 调用数据获取
}

const fetchData = async () => {
  loading.value = true
  try {
    const response = await axios.get('/api/status/queryRankingStatus', {
      params: {
        name: searchName.value
      }
    })
    tableData.value = response.data
    updateFilters()
  } catch (error) {
    ElMessage.error('查询失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const updateFilters = () => {
  const nameSet = new Set<string>()
  const countrySet = new Set<string>()
  const continentSet = new Set<string>()

  tableData.value.forEach(item => {
    if (item.universityNameChinese) {
      nameSet.add(item.universityNameChinese)
    }
    if (item.universityTags) {
      countrySet.add(item.universityTags)
    }
    if (item.universityTagsState) {
      continentSet.add(item.universityTagsState)
    }
  })

  nameFilters.value = Array.from(nameSet).map(name => ({ text: name, value: name }))
  countryFilters.value = Array.from(countrySet).map(country => ({ text: country, value: country }))
  continentFilters.value = Array.from(continentSet).map(continent => ({ text: continent, value: continent }))
}

const selectable = (row: University) => {
  return row.id !== 1 && row.id !== 2
}

const handleSelectionChange = (val: University[]) => {
  multipleSelection.value = val
}

const toggleSelection = (rows: University[], ignoreSelectable?: boolean) => {
  rows.forEach((row) => {
    multipleTableRef.value.toggleRowSelection(row, ignoreSelectable)
  })
}

const clearSelection = () => {
  multipleTableRef.value.clearSelection()
}

const toggleDataColumns = () => {
  showDataColumns.value = !showDataColumns.value
}

const hideRow = (row: University) => {
  hiddenRowIds.value.add(row.id)
}

const hideSelectedRows = () => {
  multipleSelection.value.forEach(row => {
    hiddenRowIds.value.add(row.id)
  })
  clearSelection()
}

const showAllRows = () => {
  hiddenRowIds.value.clear()
}

const filteredData = computed(() => {
  let data = tableData.value
  data = data.filter(row => !hiddenRowIds.value.has(row.id))
  if (searchName.value) {
    data = data.filter(row => row.universityNameChinese.toLowerCase().includes(searchName.value.toLowerCase()))
  }
  return data
})

const handleFilterChange = () => {
  // 手动刷新数据以更新筛选后的视图
  fetchData()
}

onMounted(() => {
  fetchData()
})

</script>

<style scoped>
.search-card {
  margin-bottom: 20px;
}
.button-row {
  margin-bottom: 10px;
}
.dialog-footer {
  text-align: right;
}
</style>