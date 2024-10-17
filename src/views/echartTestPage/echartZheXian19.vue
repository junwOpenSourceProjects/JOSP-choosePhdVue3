<template>
  <div>
    <div id="mychart" class="echartDemo" />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { fetchEchartsData } from '@/api/devDataQuery' // 确保该路径正确
const colors = ['#5470C6', '#EE6666']

export default {
  name: 'EchartZheXian19',
  data() {
    return {
      // 查询参数
      queryParams: {
        universityNameChinese: '',
        universityTagsState: '',
        universityTags: '德国',
        rankVariant: 'usnews'
      },
      // 存储从后端获取的数据
      chartData: [],
      legendData: [],
      // 加载状态（可选）
      listLoading: false
    }
  },
  mounted() {
    this.fetchDataAndInit()
  },
  methods: {
    /**
     * 获取数据的方法
     * 确保返回一个 Promise，以便在 mounted 中可以使用 await
     */
    getList() {
      this.listLoading = true
      return fetchEchartsData(this.queryParams)
        .then(response => {
          // 假设返回的数据结构包含 chartData 和 legendData
          this.chartData = response.data.chartData
          this.legendData = response.data.legendData
          // 模拟延迟（可根据实际情况移除）
          return new Promise(resolve => {
            setTimeout(() => {
              this.listLoading = false
              resolve()
            }, 1500)
          })
        })
        .catch(error => {
          this.listLoading = false
          console.error('获取数据失败:', error)
          // 抛出错误以便在 mounted 中捕获
          throw error
        })
    },

    /**
     * 异步获取数据并初始化图表
     */
    async fetchDataAndInit() {
      try {
        await this.getList()
        this.initEcharts()
        console.log('chartData', this.chartData)
        console.log('legendData', this.legendData)
      } catch (error) {
        console.error('初始化图表失败:', error)
      }
    },

    /**
     * 初始化 ECharts
     */
    initEcharts() {
      // 确保 chartData 有数据并且格式正确
      if (!this.chartData || !Array.isArray(this.chartData) || this.chartData.length === 0) {
        console.error('chartData 数据为空或格式不正确')
        return
      }

      // 假设 chartData 的每一项包含 name 和 data
      // 例如: [{ name: '系列1', type: 'line', data: [120, 132, 101, ...] }, ...]

      // 提取 x 轴数据（假设所有系列的 x 轴数据相同，以第一个系列为准）
      const xAxisData = this.chartData[0].data.map((item, index) => `类别${index + 1}`)

      const option = {
        color: colors,
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {
          data: this.legendData
        },
        grid: {
          top: 70,
          bottom: 50
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: xAxisData,
          axisTick: {
            alignWithLabel: true
          },
          axisLine: {
            lineStyle: {
              color: colors[1]
            }
          },
          axisPointer: {
            label: {
              formatter: function(params) {
                return (
                  params.seriesName +
                  '  ' +
                  params.value +
                  (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                )
              }
            }
          }
        },
        yAxis: {
          type: 'value',
          name: '数值'
        },
        series: this.chartData
      }

      // 初始化 ECharts 实例
      const myChart = echarts.init(document.getElementById('mychart'))
      myChart.setOption(option)

      // 监听窗口大小变化，自动调整图表大小
      window.onresize = () => {
        myChart.resize()
      }
    }
  }
}
</script>

<style scoped>
.echartDemo {
  border: 1px solid black;
  background-color: #fff;
  display: inline-block;
  width: 100%;
  height: 400px;
}
</style>
