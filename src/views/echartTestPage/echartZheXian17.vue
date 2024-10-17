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
  name: 'EchartZheXian17',
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
        title: {
          text: 'Funnel',
          left: 'left',
          top: 'bottom'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c}%'
        },
        toolbox: {
          orient: 'vertical',
          top: 'center',
          feature: {
            dataView: { readOnly: false },
            restore: {},
            saveAsImage: {}
          }
        },
        legend: {
          orient: 'vertical',
          left: 'left',
          data: ['Show', 'Click', 'Visit', 'Inquiry', 'Order']
        },
        series: [
          {
            name: 'Funnel',
            type: 'funnel',
            width: '40%',
            height: '45%',
            left: '5%',
            top: '50%',
            data: [
              { value: 60, name: 'Visit' },
              { value: 30, name: 'Inquiry' },
              { value: 10, name: 'Order' },
              { value: 80, name: 'Click' },
              { value: 100, name: 'Show' }
            ]
          },
          {
            name: 'Pyramid',
            type: 'funnel',
            width: '40%',
            height: '45%',
            left: '5%',
            top: '5%',
            sort: 'ascending',
            data: [
              { value: 60, name: 'Visit' },
              { value: 30, name: 'Inquiry' },
              { value: 10, name: 'Order' },
              { value: 80, name: 'Click' },
              { value: 100, name: 'Show' }
            ]
          },
          {
            name: 'Funnel',
            type: 'funnel',
            width: '40%',
            height: '45%',
            left: '55%',
            top: '5%',
            label: {
              position: 'left'
            },
            data: [
              { value: 60, name: 'Visit' },
              { value: 30, name: 'Inquiry' },
              { value: 10, name: 'Order' },
              { value: 80, name: 'Click' },
              { value: 100, name: 'Show' }
            ]
          },
          {
            name: 'Pyramid',
            type: 'funnel',
            width: '40%',
            height: '45%',
            left: '55%',
            top: '50%',
            sort: 'ascending',
            label: {
              position: 'left'
            },
            data: [
              { value: 60, name: 'Visit' },
              { value: 30, name: 'Inquiry' },
              { value: 10, name: 'Order' },
              { value: 80, name: 'Click' },
              { value: 100, name: 'Show' }
            ]
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
