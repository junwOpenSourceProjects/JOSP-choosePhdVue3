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
let date = ''
let end = ''
const dayTime = 3600 * 24 * 1000
const data = []
export default {
  name: 'EchartZheXian14',
  components: {},
  props: [],
  data() {
    return {
      xDate: []
    }
  },
  computed: {},
  watch: {},
  created() {
  },
  mounted() {
    this.initEcharts()
  },
  methods: {
    getVirtualData(year) {
      for (let time = date; time < end; time += dayTime) {
        date = +echarts.time.parse(year + '-01-01')
        end = +echarts.time.parse(+year + 1 + '-01-01')
        data.push([
          echarts.time.format(time, '{yyyy}-{MM}-{dd}', false),
          Math.floor(Math.random() * 1000)
        ])
      }
      return data
    },
    initEcharts() {
      const option = {
        tooltip: {
          position: 'top',
          formatter: function(p) {
            const format = echarts.time.format(p.data[0], '{yyyy}-{MM}-{dd}', false)
            return format + ': ' + p.data[1]
          }
        },
        visualMap: {
          min: 0,
          max: 1000,
          calculable: true,
          orient: 'vertical',
          left: '670',
          top: 'center'
        },
        calendar: [
          {
            orient: 'vertical',
            range: '2015'
          },
          {
            left: 300,
            orient: 'vertical',
            range: '2016'
          },
          {
            left: 520,
            cellSize: [20, 'auto'],
            bottom: 10,
            orient: 'vertical',
            range: '2017',
            dayLabel: {
              margin: 5
            }
          }
        ],
        series: [
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            calendarIndex: 0,
            data: this.getVirtualData('2015')
          },
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            calendarIndex: 1,
            data: this.getVirtualData('2016')
          },
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            calendarIndex: 2,
            data: this.getVirtualData('2017')
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
  height: 800px;
}
</style>
