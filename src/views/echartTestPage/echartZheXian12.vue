<template>
  <div>
    <div
      id="mychart"
      class="echartDemo"
    />
    <div>有点数据问题</div>
  </div>
</template>

<script>
import * as echarts from 'echarts'
let date = ''
let end = ''
const dayTime = 3600 * 24 * 1000
let links = []
let data = []
const graphData = [
  ['2017-02-01', 260],
  ['2017-02-04', 200],
  ['2017-02-09', 279],
  ['2017-02-13', 847],
  ['2017-02-18', 241],
  ['2017-02-23', 411],
  ['2017-02-27', 985]
]
export default {
  name: 'EchartZheXian12',
  components: {},
  props: [],
  data() {
    return {

    }
  },
  computed: {},
  watch: {},
  created() {
    links = graphData.map((item, idx) => {
      return {
        source: idx,
        target: idx + 1
      }
    })
    links.pop()
  },
  mounted() {
    this.initEcharts()
  },
  methods: {
    getVirtualData(year) {
      date = +echarts.time.parse(year + '-01-01')
      end = +echarts.time.parse(+year + 1 + '-01-01')
      data = []
      for (let time = date; time < end; time += dayTime) {
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
          position: 'top'
        },
        visualMap: [
          {
            min: 0,
            max: 1000,
            calculable: true,
            seriesIndex: [2, 3, 4],
            orient: 'horizontal',
            left: '55%',
            bottom: 20
          },
          {
            min: 0,
            max: 1000,
            inRange: {
              color: ['grey'],
              opacity: [0, 0.3]
            },
            controller: {
              inRange: {
                opacity: [0.3, 0.6]
              },
              outOfRange: {
                color: '#ccc'
              }
            },
            seriesIndex: [1],
            orient: 'horizontal',
            left: '10%',
            bottom: 20
          }
        ],
        calendar: [
          {
            orient: 'vertical',
            yearLabel: {
              margin: 40
            },
            monthLabel: {
              nameMap: 'cn',
              margin: 20
            },
            dayLabel: {
              firstDay: 1,
              nameMap: 'cn'
            },
            cellSize: 40,
            range: '2017-02'
          },
          {
            orient: 'vertical',
            yearLabel: {
              margin: 40
            },
            monthLabel: {
              margin: 20
            },
            cellSize: 40,
            left: 460,
            range: '2017-01'
          },
          {
            orient: 'vertical',
            yearLabel: {
              margin: 40
            },
            monthLabel: {
              margin: 20
            },
            cellSize: 40,
            top: 350,
            range: '2017-03'
          },
          {
            orient: 'vertical',
            yearLabel: {
              margin: 40
            },
            dayLabel: {
              firstDay: 1,
              nameMap: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
            },
            monthLabel: {
              nameMap: 'cn',
              margin: 20
            },
            cellSize: 40,
            top: 350,
            left: 460,
            range: '2017-04'
          }
        ],
        series: [
          {
            type: 'graph',
            edgeSymbol: ['none', 'arrow'],
            coordinateSystem: 'calendar',
            links: links,
            symbolSize: 10,
            calendarIndex: 0,
            data: graphData
          },
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            data: this.getVirtualData('2017')
          },
          {
            type: 'effectScatter',
            coordinateSystem: 'calendar',
            calendarIndex: 1,
            symbolSize: function(val) {
              return val[1] / 40
            },
            data: this.getVirtualData('2017')
          },
          {
            type: 'scatter',
            coordinateSystem: 'calendar',
            calendarIndex: 2,
            symbolSize: function(val) {
              return val[1] / 60
            },
            data: this.getVirtualData('2017')
          },
          {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            calendarIndex: 3,
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
