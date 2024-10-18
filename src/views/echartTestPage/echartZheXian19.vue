<template>
  <div>
    <div id="mychart" class="echartDemo" />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { fetchEchartsData } from '@/api/devDataQuery' // 确保该路径正确
const colors = ['#5470C6', '#EE6666', '#73C0DE', '#3BA272', '#FC8452', '#9A60B4', '#F3A43B']

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
      chartData: [{
        series: {
          name: 'Precipitation(2015)',
          type: 'line',
          xAxisIndex: 1,
          smooth: true,
          emphasis: {
            focus: 'series'
          },
          data: [
            2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
          ]
        }}
      ],
      legendData: [],
      xAxisData: [],
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
        // 检查响应结构
          if (!response.chatData || !response.legendData) {
            throw new Error('响应数据结构不正确')
          }
          // 设置数据
          this.chartData = response.chartData.series
          console.log('chartData', this.chartData)
          this.legendData = response.legendData

          // 计算所有系列中的最大数据长度
          const maxLength = Math.max(...this.chartData.map(series => series.data.length))

          // 生成统一的 x 轴标签
          this.xAxisData = Array.from({ length: maxLength }, (_, i) => `类别${i + 1}`)

          // 为每个系列的数据数组填充 null 以统一长度
          this.chartData = this.chartData.map(series => {
            const paddedData = [...series.data]
            while (paddedData.length < maxLength) {
              paddedData.push(0.0) // 使用 null 填充，ECharts 会处理这些缺失的数据点
            }
            return { ...series, data: paddedData }
          })

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
          // 可以在这里添加错误提示给用户
          // 例如，使用 Element UI 的 Message 组件
          // this.$message.error('获取数据失败，请稍后再试。');
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

      // 配置图表选项
      const option = {
        color: colors,
        tooltip: {
          trigger: 'axis'
        // ,axisPointer: {
        // type: 'cross'
        // }
        },
        legend: {
          data: this.legendData
        },
        grid: [
          {
            bottom: '60%'
          },
          {
            top: '60%'
          }
        ],
        xAxis: {
          type: 'category',
          boundaryGap: false,
          data: this.xAxisData,
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
  height: 600px;
  /* 根据需要调整高度 */
}
</style>
