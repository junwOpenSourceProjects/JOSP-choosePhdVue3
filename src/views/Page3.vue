<template>
  <div>
    <!-- 查询区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" label-width="100px">
        <!-- 查询表单内容保持不变 -->
        <el-row :gutter="20">
          <el-col :span="6">
            <el-form-item label="大学名称">
              <el-input v-model="searchForm.universityNameChinese" placeholder="请输入大学名称"></el-input>
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
            <el-form-item label="排名类型">
              <el-select v-model="searchForm.rankVariant" placeholder="请选择排名类型" clearable>
                <el-option label="QS" value="qs"></el-option>
                <el-option label="QS CS" value="qs_cs"></el-option>
                <el-option label="US News" value="usnews"></el-option>
                <el-option label="US News CS" value="usnews_cs"></el-option>
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 10px;">
          <el-col :span="6">
            <el-form-item>
              <el-button type="primary" @click="handleSearch">查询</el-button>
              <el-button @click="resetSearch">重置</el-button>
              <!-- 新增按钮：打开弹出表单 -->
              <el-button type="success" @click="openFormDialog" style="margin-left: 10px;">新增数据</el-button>
            </el-form-item>
          </el-col>
        </el-row>
        <!-- 多选框区域 -->
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-form-item label="选择图例">
              <el-checkbox-group v-model="selectedLegends">
                <el-checkbox
                  v-for="legend in allLegends"
                  :key="legend"
                  :value="legend"
                  style="margin-right: 10px;">
                  {{ legend }}
                </el-checkbox>
              </el-checkbox-group>
              <!-- 新增：全选和清空选择按钮 -->
              <div style="margin-top: 10px;">
                <el-button size="mini" @click="selectAll">全选</el-button>
                <el-button size="mini" @click="clearSelection" style="margin-left: 10px;">清空选择</el-button>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- ECharts 图表区域 -->
    <el-card class="chart-card">
      <!-- 新增：深色模式切换按钮 -->
      <el-button @click="toggleDarkMode" size="mini" style="margin-bottom: 10px;">
        {{ darkMode ? '浅色模式' : '深色模式' }}
      </el-button>
      <v-chart :option="chartOption" autoresize style="width: 100%; height: 800px;" v-if="chartLoaded"></v-chart>
    </el-card>

    <!-- 修改后的弹出表单对话框 -->
    <el-dialog
      v-model="formDialogVisible"
      title="新增/更新大学数据"
      width="500px"
      :before-close="handleDialogClose"
      class="draggable-dialog"
      ref="formDialog"
      @open="enableDrag">
      <el-form :model="formData" ref="formRef" label-width="120px" :rules="formRules" autocomplete="off">
        <el-form-item label="大学中文名" prop="universityNameChinese">
          <el-input v-model="formData.universityNameChinese" placeholder="请输入大学中文名"></el-input>
        </el-form-item>

        <!-- 动态生成状态单选按钮 -->
        <template v-for="(status, key) in statuses" :key="key">
          <el-form-item :label="status.label" :prop="key">
            <el-radio-group v-model="formData[key]">
              <el-radio :value="0">弱</el-radio>
              <el-radio :value="1">中</el-radio>
              <el-radio :value="2">强</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>
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
import { ref, onMounted, computed, watch, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import axios from 'axios' // 导入 axios
import {
  CanvasRenderer
} from 'echarts/renderers'
import {
  LineChart
} from 'echarts/charts'
import {
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

// 注册必须的组件
use([
  CanvasRenderer,
  LineChart,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

export default {
  name: 'Page3',
  components: {
    VChart,
  },
  setup() {
    const searchFormRef = ref(null)

    const searchForm = ref({
      universityNameChinese: '',
      universityTagsState: '',
      universityTags: '',
      rankVariant: '',
    })

    const currentPage = ref(1)
    const limit = ref(10)
    const total = ref(0)
    const loading = ref(false)

    const chartOption = ref({})
    const chartLoaded = ref(false)

    const allSeries = ref([]) // 存储所有系列数据
    const allLegends = ref([]) // 存储所有图例名称
    const selectedLegends = ref([]) // 用户选中的图例

    const xAxisData = computed(() => {
      const years = []
      for (let year = 2012; year <= 2025; year++) {
        years.push(year.toString())
      }
      return years
    })

    // 默认数据
    // const defaultSeries = {
    //   name: "亚利桑那州立大学",
    //   type: "line",
    //   smooth: true,
    //   emphasis: {
    //     focus: "series"
    //   },
    //   data: [
    //     330.0, 293.0, 294.0, 249.0, 222.0, 209.0, 212.0, 215.0, 220.0, 216.0, 219.0, 179.0, 200.0, 210.0
    //   ],
    //   xaxisIndex: null
    // }
        const defaultSeries = {
      name: "测试数据",
      type: "line",
      smooth: true,
      emphasis: {
        focus: "series"
      },
      data: [
        0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0
      ],
      xaxisIndex: null
    }

    // 新增：深色模式状态
    const darkMode = ref(false)

    // 更新图表选项
    const updateChartOption = () => {
      const filteredSeries = allSeries.value.filter(series => selectedLegends.value.includes(series.name))
      chartOption.value = {
        backgroundColor: darkMode.value ? '#2c3e50' : '#ffffff', // 设置背景色
        color: ['#5470C6', '#EE6666', '#91CC75', '#FAC858', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#FF69B4', '#CD5C5C'], // 扩展颜色以支持更多系列
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          },
          textStyle: {
            color: darkMode.value ? '#ffffff' : '#000000'
          }
        },
        legend: {
          type: 'scroll', // 使用滚动模式
          orient: 'horizontal',
          top: 'top', // 将图例放置在顶部
          data: allLegends.value,
          textStyle: {
            color: darkMode.value ? '#ffffff' : '#000000'
          },
          tooltip: {
            show: true
          }
        },
        grid: {
          top: 80, // 增加 top 以避免与 legend 重叠
          bottom: 50
        },
        xAxis: {
          type: 'category',
          data: xAxisData.value,
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            lineStyle: {
              color: darkMode.value ? '#ffffff' : '#5470C6'
            }
          },
          axisLabel: {
            color: darkMode.value ? '#ffffff' : '#000000'
          }
        },
        yAxis: {
          type: 'value',
          inverse: true,
          axisLine: {
            lineStyle: {
              color: darkMode.value ? '#ffffff' : '#000000'
            }
          },
          axisLabel: {
            color: darkMode.value ? '#ffffff' : '#000000'
          }
        },
        series: filteredSeries
      }
    }

    const fetchData = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          limit: limit.value,
          universityNameChinese: searchForm.value.universityNameChinese,
          universityTagsState: searchForm.value.universityTagsState,
          universityTags: searchForm.value.universityTags,
          rankVariant: searchForm.value.rankVariant,
        }

        const response = await axios.get('/api/query/queryPartEcharts', { params })

        // 检查响应状态
        if (response.status !== 200) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const data = response.data

        // 确保 data.chatData.series 和 data.legendData 存在
        if (!data.chatData || !data.chatData.series || !data.legendData) {
          throw new Error('后端返回的数据结构不正确')
        }

        // 添加默认数据
        const combinedSeries = [...data.chatData.series, defaultSeries]
        const combinedLegends = [...data.legendData, defaultSeries.name]

        allSeries.value = combinedSeries
        allLegends.value = combinedLegends
        selectedLegends.value = [...combinedLegends] // 默认选中所有

        updateChartOption()

        chartLoaded.value = true

      } catch (error) {
        ElMessage.error(`获取数据失败: ${error.message}`)
        console.error(error)
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      currentPage.value = 1
      fetchData()
    }

    const resetSearch = () => {
      searchForm.value.universityNameChinese = ''
      searchForm.value.universityTagsState = ''
      searchForm.value.universityTags = ''
      searchForm.value.rankVariant = ''
      handleSearch()
    }

    // 监听 selectedLegends 的变化，更新图表
    watch(selectedLegends, () => {
      updateChartOption()
    })

    onMounted(() => {
      fetchData()
    })

    // 弹出表单相关逻辑

    // 控制对话框的可见性
    const formDialogVisible = ref(false)

    // 表单数据
    const formData = ref({
      universityNameChinese: '',
      statusQs: null,
      statusQsCs: null,
      statusUsnews: null,
      statusUsnewsCs: null,
      statusTotal: null,
      consider: null,
    })

    // 表单引用
    const formRef = ref(null)

    // 定义状态字段及其标签
    const statuses = {
      statusQs: { label: 'QS' },
      statusQsCs: { label: 'QS CS' },
      statusUsnews: { label: 'US News' },
      statusUsnewsCs: { label: 'US News CS' },
      statusTotal: { label: '总计' },
      consider: { label: '考虑' },
    }

    // 表单验证规则
    const formRules = {
      universityNameChinese: [
        { required: true, message: '大学中文名不能为空', trigger: 'blur' }
      ],
      statusQs: [
        { required: true, message: 'QS 状态不能为空', trigger: 'change' }
      ],
      statusQsCs: [
        { required: true, message: 'QS CS 状态不能为空', trigger: 'change' }
      ],
      statusUsnews: [
        { required: true, message: 'US News 状态不能为空', trigger: 'change' }
      ],
      statusUsnewsCs: [
        { required: true, message: 'US News CS 状态不能为空', trigger: 'change' }
      ],
      statusTotal: [
        { required: true, message: '总计 状态不能为空', trigger: 'change' }
      ],
      consider: [
        { required: true, message: '考虑 状态不能为空', trigger: 'change' }
      ],
    }

    // 打开表单对话框
    const openFormDialog = () => {
      console.log('openFormDialog 被调用') // 调试日志
      formDialogVisible.value = true
      nextTick(() => {
        // 聚焦到第一个输入框
        if (formRef.value) {
          const input = formRef.value.$el.querySelector('input')
          if (input) {
            input.focus()
          }
        }
      })
    }

    // 重置表单数据
    const resetForm = () => {
      formData.value = {
        universityNameChinese: '',
        statusQs: null,
        statusQsCs: null,
        statusUsnews: null,
        statusUsnewsCs: null,
        statusTotal: null,
        consider: null,
      }
      if (formRef.value) {
        formRef.value.resetFields()
      }
      formDialogVisible.value = false
    }

    // 处理取消按钮，增加确认提示
    const handleCancel = () => {
      ElMessageBox.confirm('是否确认取消并关闭表单？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }).then(() => {
        resetForm()
      }).catch(() => {
        // 用户取消关闭，不做任何操作
      })
    }

    // 处理关闭对话框前的确认
    const handleDialogClose = (done) => {
      // 检查表单是否有更改（可选：需要实现 hasChanged 的逻辑）
      // 这里假设表单每次打开都会重置，因此无需额外判断
      done()
      resetForm()
    }

    // 提交表单数据
    const submitForm = () => {
      formRef.value.validate(async (valid) => {
        if (valid) {
          console.log('Submitting formData:', formData.value) // 调试日志
          try {
            // 发送数据到后端
            const response = await axios.post('/api/status/insertOrUpdate', formData.value, {
              headers: {
                'Content-Type': 'application/json',
              },
            })

            if (response.status !== 200) {
              const errorText = response.statusText || '未知错误'
              throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
            }

            const result = response.data

            // 假设后端返回 { message: 'inserted' } 或 { message: 'updated' }
            if (result.data === '成功') {
              ElMessage.success('数据已成功提交')
            } else if (result.data === '失败') {
              ElMessage.error('数据提交失败')
            } else {
              ElMessage.info(result.data)
            }

            // 关闭对话框并刷新数据
            resetForm()
            fetchData()

          } catch (error) {
            ElMessage.error(`提交失败: ${error.message}`)
            console.error(error)
          }
        } else {
          console.log('验证失败') // 调试日志
          return false
        }
      })
    }

    // 实现对话框的拖动功能
    const enableDrag = () => {
      const dialogHeaderEl = document.querySelector('.el-dialog.draggable-dialog .el-dialog__header')
      const dialogEl = document.querySelector('.el-dialog.draggable-dialog')

      if (dialogHeaderEl && dialogEl) {
        dialogHeaderEl.style.cursor = 'move'
        dialogHeaderEl.onmousedown = (e) => {
          e.preventDefault()
          const disX = e.clientX - dialogEl.offsetLeft
          const disY = e.clientY - dialogEl.offsetTop

          const onMouseMove = (e) => {
            dialogEl.style.left = (e.clientX - disX) + 'px'
            dialogEl.style.top = (e.clientY - disY) + 'px'
          }

          const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
          }

          document.addEventListener('mousemove', onMouseMove)
          document.addEventListener('mouseup', onMouseUp)
        }
      }
    }

    // 新增：全选按钮处理方法
    const selectAll = () => {
      selectedLegends.value = [...allLegends.value]
    }

    // 新增：清空选择按钮处理方法
    const clearSelection = () => {
      selectedLegends.value = []
    }

    // 新增：深色模式切换处理方法
    const toggleDarkMode = () => {
      darkMode.value = !darkMode.value
      updateChartOption()
    }

    return {
      searchForm,
      currentPage,
      limit,
      total,
      loading,
      handleSearch,
      resetSearch,
      chartOption,
      chartLoaded,
      searchFormRef,
      allLegends,
      selectedLegends,
      // 新增返回的数据
      formDialogVisible,
      formData,
      formRef,
      statuses,
      formRules,
      openFormDialog,
      resetForm,
      submitForm,
      handleCancel,       // 新增的取消处理方法
      handleDialogClose,  // 新增的 before-close 处理方法
      enableDrag,
      // 新增的方法和状态
      selectAll,
      clearSelection,
      darkMode,
      toggleDarkMode,
    }
  },
}
</script>

<style scoped>
.search-card {
  margin-bottom: 20px;
  padding: 20px;
}

.chart-card {
  margin-bottom: 20px;
  padding: 20px;
  /* 增加图表区域的宽度，如需要可调整 */
  width: 100%;
}

.el-table th,
.el-table td {
  text-align: center;
}

/* 可选：调整图表的 Legend 样式 */
.chart-card .echarts {
  /* 确保 ECharts 组件充满整个容器 */
  width: 100%;
  height: 100%;
}

/* 新增：调整对话框样式使其支持拖动 */
.draggable-dialog >>> .el-dialog__header {
  cursor: move;
}

.dialog-footer {
  text-align: right;
}

/* 可选：根据深色模式调整整体背景色 */
body {
  background-color: var(--background-color);
}
</style>
