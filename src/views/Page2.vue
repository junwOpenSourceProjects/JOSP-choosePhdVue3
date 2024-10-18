<!-- src/views/Page2.vue -->
<template>
  <div>
    <!-- 查询区域 -->
    <el-card class="search-card">
      <el-form :inline="true" :model="searchForm" ref="searchFormRef" label-width="100px">
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
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- ECharts 图表区域 -->
    <el-card class="chart-card">
      <v-chart :option="chartOption" autoresize style="width: 100%; height: 400px;" v-if="chartLoaded"></v-chart>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <el-table :data="tableData" style="width: 100%" :loading="loading">
        <el-table-column prop="universityNameChinese" label="大学名称" />
        <el-table-column prop="rank" label="排名" />
      </el-table>
    </el-card>

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
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
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
  name: 'Page2',
  components: {
    VChart,
  },
  setup() {
    const searchFormRef = ref(null)

    const tableData = ref([])
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

    const xAxisData = computed(() => {
      const years = []
      for (let year = 2012; year <= 2025; year++) {
        years.push(year.toString())
      }
      return years
    })

    // 默认数据
    const defaultSeries = {
      name: "亚利桑那州立大学",
      type: "line",
      smooth: true,
      emphasis: {
        focus: "series"
      },
      data: [
        330.0, 293.0, 294.0, 249.0, 222.0, 209.0, 212.0, 215.0, 220.0, 216.0, 219.0, 179.0, 200.0, 210.0
      ],
      xaxisIndex: null
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

        const queryString = new URLSearchParams(params).toString()

        const response = await fetch(`/api/query/queryPartEcharts?${queryString}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (!response.ok) {
          const errorText = await response.text()
          throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
        }

        const data = await response.json()

        // 确保 data.chatData.series 和 data.legendData 存在
        if (!data.chatData || !data.chatData.series || !data.legendData) {
          throw new Error('后端返回的数据结构不正确')
        }

        // 添加默认数据
        const combinedSeries = [...data.chatData.series, defaultSeries]
        const combinedLegend = [...data.legendData, defaultSeries.name]

        // 构建 ECharts 配置
        chartOption.value = {
          color: ['#5470C6', '#EE6666', '#91CC75', '#FAC858', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC'],
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'cross'
            }
          },
          legend: {
            data: combinedLegend
          },
          grid: {
            top: 50,
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
                color: '#5470C6'
              }
            }
          },
          yAxis: {
            type: 'value',
            inverse: true
          },
          series: combinedSeries
        }

        chartLoaded.value = true

        // 组装表格数据
        const allSeries = combinedSeries
        total.value = allSeries.length

        const start = (currentPage.value - 1) * limit.value
        const end = start + limit.value
        tableData.value = allSeries.slice(start, end).map(series => ({
          universityNameChinese: series.name,
          rank: series.data[0] // 可根据需求调整
        }))
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

    const handlePageChange = (page) => {
      currentPage.value = page
      fetchData()
    }

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
      chartOption,
      chartLoaded,
      searchFormRef,
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
}

.table-card {
  margin-bottom: 20px;
  padding: 20px;
}

.pagination {
  text-align: right;
  margin-top: 20px;
}

.el-table th,
.el-table td {
  text-align: center;
}
</style>
