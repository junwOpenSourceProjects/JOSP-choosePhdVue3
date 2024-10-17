<template>
  <div>
    <div
      id="mychar2"
      class="echartDemo"
    />
    <div
      id="mychart"
      class="echartDemo"
    />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  name: 'EchartsTestPage',
  components: {},
  props: [],
  data() {
    return {
      name: '张雪',
      xData: ['2020-02', '2020-03', '2020-04', '2020-05'], // 横坐标数据
      yData: [30, 132, 80, 134] // 纵坐标数据，与横坐标对应
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
      var color1 = ['#1ABC9C', '#2ECC71', '#3498DB', '#9B59B6', '#34495E']

      const option = {
        color: color1,
        title: {
          text: '业务完成压力近一小时实时监控（与基准相比）',
          // right: '50%', // 距离居中会导致不准，必须使用center属性
          right: 'center' // 不设置属性的情况下，默认在左边顶格
        },
        tooltip: {},
        // 把下面这里放开，就是数据的标签
        // legend: {
        //   data: ['销量'],
        //   // Try 'horizontal'
        //   orient: 'vertical',
        //   right: 0,
        //   top: 'center'
        // },
        xAxis: {
          data: ['福建战略服务部', '总行', '绍兴分行', '上海战略服务部', '测试1', '测试2'],
          // axisLine: {
          //   onZero: false,
          //   lineStyle: {
          //     color: color1[1]
          //   }
          // }
          tooltip: {
            valueFormatter: function(value) {
              return value + ' °C'
            }
          },
          axisLabel: {
            interval: 0, // 刻度间隔为0，显示全部刻度
            // rotate: 40, // 让x轴文字旋转40度
            formatter: function(value) { // 自定义x轴文字，让x轴标签垂直显示
              return value.split('').join('\n')
            }
          }
        },
        yAxis: {
          // y轴开启百分号的格式化
          axisLabel: {
            formatter: '{value} %'
          }
        },
        series: [
          {
            name: '销量',
            type: 'bar', // 类型为柱状图
            data: [5, 20, 36, {
              value: 21,
              itemStyle: {
                color: '#a90000'
              }
            }, 10, 20],
            label: {
              show: true, // 开启显示
              position: 'top'// 在上方显示
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

      // *************************************************************
      var myChart2 = echarts.init(document.getElementById('mychar2'))// 获取图标的dom元素
      const colors = ['#001871', '#ff585d', '#ffb549', '#41b6e6'] // 设置折线图颜色
      var option2 = {
        title: {
          text: '业务完成压力监控',
          right: 'center'

        },
        color: colors,
        tooltip: {
          trigger: 'none',
          axisPointer: {
            type: 'cross'
          }
        },
        // legend: {}, // 图例，表示横纵轴的名称
        legend: {
          // data: ['销量'],
          // Try 'horizontal'
          orient: 'vertical',
          right: 0, // 距离右边的距离
          // icon: 'rect', // 修改图例的图标和样式
          top: 'center'
        },
        grid: {
          top: 70,
          bottom: 50
        },
        xAxis: [
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            // 配置横轴的字段颜色
            // axisLine: {
            //   onZero: false,
            //   lineStyle: {
            //     color: colors[1]
            //   }
            // },
            axisPointer: {
              label: {
                formatter: function(params) {
                  return (
                    '压力数据2  ' +
                    params.value +
                    (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                  )
                }
              }
            },
            // prettier-ignore
            data: ['2016-1', '2016-2', '2016-3', '2016-4', '2016-5', '2016-6', '2016-7', '2016-8', '2016-9', '2016-10', '2016-11', '2016-12']
          },
          {
            type: 'category',
            axisLabel: {
              interval: 0 // 刻度间隔为0，显示全部刻度
              // rotate: 40, // 让x轴文字旋转40度
              // formatter: function(value) { // 自定义x轴文字，让x轴标签垂直显示
              //   return value.split('').join('\n')
              // }
            },

            axisTick: {
              alignWithLabel: true
            },
            // 横轴两个，表示上下两个横坐标
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[0]
              }
            },
            axisPointer: {
              label: {
                formatter: function(params) {
                  // var demo = params.seriesData[0].data // 获取横轴的数据
                  // console.log(params.seriesData[0])
                  return (
                    // params.seriesData[0].seriesName +
                    '压力数据1  ' +
                    params.value +
                    (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                  )
                }
              }
            },
            // prettier-ignore
            data: ['2015-1', '2015-2', '2015-3', '2015-4', '2015-5', '2015-6', '2015-7', '2015-8', '2015-9', '2015-10', '2015-11', '2015-12']
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: '福建战略服务部',
            type: 'line',
            xAxisIndex: 1,
            smooth: true,
            emphasis: {
              focus: 'series'
            },
            data: [
              2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
            ]
          }
          // {
          //   name: '总行',
          //   type: 'line',
          //   smooth: true,
          //   emphasis: {
          //     focus: 'series'
          //   },
          //   data: [
          //     3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 231.6, 46.6, 55.4, 18.4, 10.3, 0.7
          //   ]
          // },
          // {
          //   name: '绍兴分行',
          //   type: 'line',
          //   smooth: true,
          //   emphasis: {
          //     focus: 'series'
          //   },
          //   data: [
          //     3.9, 4.9, 9.1, 12.7, 22.3, 43.2, 211.6, 4.6, 53.4, 18.4, 10.3, 0.7
          //   ]
          // },
          // {
          //   name: '上海战略服务部',
          //   type: 'line',
          //   smooth: true,
          //   emphasis: {
          //     focus: 'series'
          //   },
          //   data: [
          //     3.9, 5.9, 19.1, 11.7, 41.3, 79.2, 91.6, 4.6, 125.4, 8.4, 8.3, 7.7
          //   ]
          // }
        ]
      }
      myChart2.setOption(option2)
      window.onresize = function() {
        myChart2.resize()
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
  width: 50%;
  height: 400px;
}
</style>
