<template>
  <div>
    <div
      id="mychart"
      class="echartDemo"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'
import { fetchEchartsData } from '@/api/devDataQuery'
const colors = ['#5470C6', '#EE6666']
export default {
  name: 'EchartZheXian19',
  components: {},
  props: [],
  data() {
    return {
      name: '张雪',
      dataFromBack: [['2000-06-05', 116], ['2000-06-06', 129], ['2000-06-07', 135], ['2000-06-08', 86], ['2000-06-09', 73], ['2000-06-10', 85], ['2000-06-11', 73], ['2000-06-12', 68], ['2000-06-13', 92], ['2000-06-14', 130], ['2000-06-15', 245], ['2000-06-16', 139], ['2000-06-17', 115], ['2000-06-18', 111], ['2000-06-19', 309], ['2000-06-20', 206], ['2000-06-21', 137], ['2000-06-22', 128], ['2000-06-23', 85], ['2000-06-24', 94], ['2000-06-25', 71], ['2000-06-26', 106], ['2000-06-27', 84], ['2000-06-28', 93], ['2000-06-29', 85], ['2000-06-30', 73], ['2000-07-01', 83], ['2000-07-02', 125], ['2000-07-03', 107], ['2000-07-04', 82], ['2000-07-05', 44], ['2000-07-06', 72], ['2000-07-07', 106], ['2000-07-08', 107], ['2000-07-09', 66], ['2000-07-10', 91], ['2000-07-11', 92], ['2000-07-12', 113], ['2000-07-13', 107], ['2000-07-14', 131], ['2000-07-15', 111], ['2000-07-16', 64], ['2000-07-17', 69], ['2000-07-18', 88], ['2000-07-19', 77], ['2000-07-20', 83], ['2000-07-21', 111], ['2000-07-22', 57], ['2000-07-23', 55], ['2000-07-24', 60]],
      dateList: [],
      valueList: [],
      queryParams: {
        universityNameChinese: '',
        universityTagsState: '',
        universityTags: '德国',
        rankVariant: 'usnews'
      }, chartData: [],
      legendData: []
    }
  },
  computed: {},
  watch: {},
  created() {
    this.getList()
  },
  mounted() {
    const fetchDataAndInit = async() => {
      try {
        await this.getList()
        this.initEcharts()
        console.log('chartData', this.chartData)
        console.log('legendData', this.legendData)
      } catch (error) {
        console.error('初始化图表失败:', error)
      }
    }

    fetchDataAndInit()
  },
  methods: {
    getList() {
      this.listLoading = true
      fetchEchartsData(this.queryParams).then(response => {
        this.chartData = response.chartData
        this.legendData = response.legendData

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    initEcharts() {
      this.dateList = this.dataFromBack.map(function(item) {
        return item[0]
      })
      this.valueList = this.dataFromBack.map(function(item) {
        return item[1]
      })
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
          },
          data: [
            '2012',
            '2013',
            '2014',
            '2015',
            '2016',
            '2017',
            '2018',
            '2019',
            '2020',
            '2021',
            '2022',
            '2023',
            '2024',
            '2025'
          ]
        },
        yAxis: {
          type: 'value',
          inverse: true, // 倒置 y 轴
          name: '数值' // 可选：y 轴名称
          // 可选：设置 y 轴的范围
          // min: 0,
          // max: 200,
          // interval: 20
        },
        series: this.chartData
      }
      const myChart = echarts.init(document.getElementById('mychart'))// 图标初始化
      // var chart = echarts.init(document.getElementById('mychart'), 'dark') // 黑暗模式
      myChart.setOption(option)// 渲染页面

      // 随着屏幕大小调节图表
      window.onresize = function() {
        myChart.resize()
      }
    }
  }
}
</script>
<style scoped>
.echartDemo {
  border: 1px;
  border: black;
  background-color: #fff;
  display: inline-block;
  width: 100%;
  height: 400px;
}
</style>
