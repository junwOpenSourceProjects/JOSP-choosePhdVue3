<!-- src/views/Page3.vue -->
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
        <!-- 多选框区域 -->
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="24">
            <el-form-item label="选择图例">
              <el-checkbox-group v-model="selectedLegends">
                <el-checkbox
                  v-for="legend in allLegends"
                  :key="legend"
                  :label="legend"
                  style="margin-right: 10px;">
                  {{ legend }}
                </el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- ECharts 图表区域 -->
    <el-card class="chart-card">
      <v-chart :option="chartOption" autoresize style="width: 100%; height: 800px;" v-if="chartLoaded"></v-chart>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
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

    // 更新图表选项
    const updateChartOption = () => {
      const filteredSeries = allSeries.value.filter(series => selectedLegends.value.includes(series.name))
      chartOption.value = {
        color: ['#5470C6', '#EE6666', '#91CC75', '#FAC858', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#EA7CCC', '#FF69B4', '#CD5C5C'], // 扩展颜色以支持更多系列
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          type: 'scroll', // 使用滚动模式
          orient: 'horizontal',
          top: 'top', // 将图例放置在顶部
          data: allLegends.value,
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
              color: '#5470C6'
            }
          }
        },
        yAxis: {
          type: 'value',
          inverse: true
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
</style>
