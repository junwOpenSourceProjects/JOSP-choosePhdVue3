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

export default {
  name: 'EchartZheXian16',
  components: {},
  props: [],
  data() {
    return {
      xDate: []
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
        series: {
          type: 'sankey',
          layout: 'none',
          emphasis: {
            focus: 'adjacency'
          },
          data: [
            {
              name: 'a'
            },
            {
              name: 'b'
            },
            {
              name: 'a1'
            },
            {
              name: 'a2'
            },
            {
              name: 'b1'
            },
            {
              name: 'c'
            }
          ],
          links: [
            {
              source: 'a',
              target: 'a1',
              value: 5
            },
            {
              source: 'a',
              target: 'a2',
              value: 3
            },
            {
              source: 'b',
              target: 'b1',
              value: 8
            },
            {
              source: 'a',
              target: 'b1',
              value: 3
            },
            {
              source: 'b1',
              target: 'a1',
              value: 1
            },
            {
              source: 'b1',
              target: 'c',
              value: 2
            }
          ]
        }
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
