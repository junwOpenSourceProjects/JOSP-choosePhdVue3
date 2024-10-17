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
// const dateList = this.dataFromBack.map(function (item) {
//   return item[0]
// })
// const valueList = this.dataFromBack.map(function (item) {
//   return item[1]
// })
export default {
  name: 'EchartZheXian2',
  components: {},
  props: [],
  data() {
    return {
      xData: ['00:00', '01:15', '02:30', '03:45', '05:00', '06:15', '07:30', '08:45', '10:00', '11:15', '12:30', '13:45', '15:00', '16:15', '17:30', '18:45', '20:00', '21:15', '22:30', '23:45'],
      seriesData: [300, 280, 250, 260, 270, 300, 550, 500, 400, 390, 380, 390, 400, 500, 600, 750, 800, 700, 600, 400]
    }
  },
  computed: {},
  watch: {},
  created() { },
  mounted() {
    this.initEcharts()
  },
  methods: {
    initEcharts() {
      const option = {
        title: {
          text: 'Distribution of Electricity',
          subtext: 'Fake Data'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross'
          }
        },
        toolbox: {
          show: true,
          feature: {
            saveAsImage: {}
          }
        },
        xAxis: {
          type: 'category',
          boundaryGap: false,
          // prettier-ignore
          data: this.xData
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            formatter: '{value} W'
          },
          axisPointer: {
            snap: true
          }
        },
        visualMap: {
          show: false,
          dimension: 0,
          pieces: [
            {
              lte: 6,
              color: 'green'
            },
            {
              gt: 6,
              lte: 8,
              color: 'red'
            },
            {
              gt: 8,
              lte: 14,
              color: 'green'
            },
            {
              gt: 14,
              lte: 17,
              color: 'red'
            },
            {
              gt: 17,
              color: 'green'
            }
          ]
        },
        series: [
          {
            name: 'Electricity',
            type: 'line',
            smooth: true,
            // prettier-ignore
            data: this.seriesData,
            markArea: {
              // 这里感觉还是用函数标记出来比较方便
              itemStyle: {
                color: 'rgba(255, 173, 177, 0.4)'
              },
              data: [
                [
                  {
                    name: 'Morning Peak',
                    xAxis: '07:30'
                  },
                  {
                    xAxis: '10:00'
                  }
                ],
                [
                  {
                    name: 'Evening Peak',
                    xAxis: '17:30'
                  },
                  {
                    xAxis: '21:15'
                  }
                ]
              ]
            }
          }
        ]
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
