<!--
 * @Author: junw wo1261931780@gmail.com
 * @Date: 2024-02-15 14:09:20
 * @LastEditors: junw wo1261931780@gmail.com
 * @LastEditTime: 2024-02-21 15:08:20
 * @FilePath: \JOSP-BillDesktopVue\src\views\showDevTable\dashboard.vue
 * @Description: 1111
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
-->
<template>
  <div class="dashboard-editor-container">
    <github-corner class="github-corner" />

    <!-- <panel-group @handleSetLineChartData="handleSetLineChartData" /> -->

    <el-row style="background:#fff;padding:16px 16px 0;margin-bottom:32px;">
      <!-- 折线图 -->
      <div id="mychart0" class="echartDemo" />
    </el-row>

    <el-row :gutter="32">
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <!-- 正负条形图 -->
          <div id="mychart" class="echartDemo" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <!-- 雷达图 -->
          <div id="mychart2" class="echartDemo" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="8">
        <div class="chart-wrapper">
          <!-- 玫瑰图 -->
          <div id="mychart3" class="echartDemo3" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import GithubCorner from '@/components/GithubCorner'
// import PanelGroup from './components/PanelGroup'
import { fetchDashboardData } from '@/api/devDataQuery'
// 线段的数据来源
// 这里干脆设置根据type的类型，发送不同的请求，然后自动获得数据
// const lineChartData = {
//   newVisitis: {
//     expectedData: [100, 120, 161, 134, 105, 160, 165],
//     actualData: [120, 82, 91, 154, 162, 140, 145]
//   },
//   messages: {
//     expectedData: [200, 192, 120, 144, 160, 130, 140],
//     actualData: [180, 160, 151, 106, 145, 150, 130]
//   },
//   purchases: {
//     expectedData: [80, 100, 121, 104, 105, 90, 100],
//     actualData: [120, 90, 100, 138, 142, 130, 130]
//   },
//   shoppings: {
//     expectedData: [130, 140, 141, 142, 145, 150, 160],
//     actualData: [120, 82, 91, 154, 162, 140, 130]
//   }
// }
const colors = ['#5470C6', '#EE6666']
export default {
  name: 'EchartsTestPage',
  components: {
    GithubCorner
    // PanelGroup

  },
  props: [],
  data() {
    return {
      listQuery: {
        page: 1,
        limit: 20
      },
      yMax: 500,
      // lineChartData: lineChartData.newVisitis,
      // 折线图数据
      lineDataOne: ['2016-1', '2016-2', '2016-3', '2016-4', '2016-5', '2016-6', '2016-7', '2016-8', '2016-9', '2016-10', '2016-11', '2016-12'],
      lineDataTwo: ['2016-1', '2016-2', '2016-3', '2016-4', '2016-5', '2016-6', '2016-7', '2016-8', '2016-9', '2016-10', '2016-11', '2016-12'],
      lineDataSeriesOne: [
        2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3
      ],
      lineDataSeriesTwo: [
        3.9, 5.9, 11.1, 18.7, 48.3, 69.2, 231.6, 46.6, 55.4, 18.4, 10.3, 0.7
      ],
      dataShadow: [], // 正负条形图数据
      mychartxAxis: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      mychartxAxisProfit: [200, 170, 240, 244, 200, 220, 210],
      mychartxAxisIncome: [320, 302, 341, 374, 390, 450, 420],
      mychartxAxisExpense: [-120, -132, -101, -134, -190, -230, -210],
      txtData: [220, 182, 191, 234, 290, 330, 310, 123, 442, 321, 90, 149, 210, 122, 133, 334, 198, 123, 125, 220],

      radarData: [
        {
          value: [120, 118, 130, 100, 99, 70],
          name: 'Data C',
          symbol: 'rect',
          symbolSize: 12,
          lineStyle: {
            type: 'dashed'
          },
          label: {
            show: true,
            formatter: function(params) {
              return params.value
            }
          }
        },
        {
          value: [100, 93, 50, 90, 70, 60],
          name: 'Data D',
          areaStyle: {
            color: new echarts.graphic.RadialGradient(0.1, 0.6, 1, [
              {
                color: 'rgba(255, 145, 124, 0.1)',
                offset: 0
              },
              {
                color: 'rgba(255, 145, 124, 0.9)',
                offset: 1
              }
            ])
          }
        }
      ],
      roseData: [
        { value: 40, name: '玫瑰 1' },
        { value: 38, name: 'rose 2' },
        { value: 32, name: 'rose 3' },
        { value: 30, name: 'rose 4' },
        { value: 28, name: 'rose 5' },
        { value: 26, name: 'rose 6' },
        { value: 22, name: 'rose 7' },
        { value: 18, name: 'rose 8' }
      ]

    }
  },
  computed: {},
  watch: {},
  created() {
    this.getData()
  },
  mounted() {
    this.initEcharts()
  },
  methods: {
    getData() {
      this.listLoading = true
      console.log('我是list' + JSON.stringify(this.listQuery))
      fetchDashboardData(this.listQuery).then(response => {
        // todo 设置数据回调到上面
        // this.list = response.data.records
        // this.total = response.data.total

        // Just to simulate the time of the request
        setTimeout(() => {
          this.listLoading = false
        }, 1.5 * 1000)
      })
    },
    initEcharts() {
      // 折线图
      // 变成折现面积图，收入支出线放到一起，默认展示所有的数据，根据按钮选择，分类展示每种类型的数据
      const option0 = {
        color: colors,
        tooltip: {
          trigger: 'none',
          axisPointer: {
            type: 'cross'
          }
        },
        legend: {},
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
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[1]
              }
            },
            axisPointer: {
              label: {
                formatter: function(params) {
                  return (
                    'Precipitation  ' +
                    params.value +
                    (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                  )
                }
              }
            },
            // prettier-ignore
            data: this.lineDataOne
          },
          {
            type: 'category',
            axisTick: {
              alignWithLabel: true
            },
            axisLine: {
              onZero: false,
              lineStyle: {
                color: colors[0]
              }
            },
            axisPointer: {
              label: {
                formatter: function(params) {
                  return (
                    'Precipitation  ' +
                    params.value +
                    (params.seriesData.length ? '：' + params.seriesData[0].data : '')
                  )
                }
              }
            },
            // prettier-ignore
            data: this.lineDataTwo
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: 'Precipitation(2015)',
            type: 'line',
            xAxisIndex: 1,
            smooth: true,
            emphasis: {
              focus: 'series'
            },
            data: this.lineDataSeriesOne
          },
          {
            name: 'Precipitation(2016)',
            type: 'line',
            smooth: true,
            emphasis: {
              focus: 'series'
            },
            data: this.lineDataSeriesTwo
          }
        ]
      }
      const myChart0 = echarts.init(document.getElementById('mychart0'))// 图标初始化
      // var chart = echarts.init(document.getElementById('mychart'), 'dark') // 黑暗模式
      myChart0.setOption(option0)// 渲染页面

      // 随着屏幕大小调节图表
      window.onresize = function() {
        myChart0.resize()
      }

      // *************************************************************
      // 正负条形图
      for (let i = 0; i < this.txtData.length; i++) {
        this.dataShadow.push(this.yMax)
      }
      const option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        legend: {
          data: ['Profit', 'Expenses', 'Income']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        // 这里的xy轴是可以互换的，对应的数据展示形式也不一样
        xAxis: [
          {
            type: 'category',
            axisTick: {
              show: false
            },
            data: this.mychartxAxis
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            name: 'Profit',
            type: 'bar',
            label: {
              show: true,
              position: 'inside'
            },
            emphasis: {
              focus: 'series'
            },
            data: this.mychartxAxisProfit
          },
          {
            name: 'Income',
            type: 'bar',
            stack: 'Total',
            label: {
              show: true
            },
            emphasis: {
              focus: 'series'
            },
            data: this.mychartxAxisIncome
          },
          {
            name: 'Expenses',
            type: 'bar',
            stack: 'Total',
            label: {
              show: true,
              position: 'left'
            },
            emphasis: {
              focus: 'series'
            },
            data: this.mychartxAxisExpense
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
      // 雷达图
      // 底盘用衡量家庭财富的六个指标
      // 底盘的范围用个人的预算去写死
      // 蓝色线用每个月的预算单写死
      // 红色线用每个月的分类开销计算结果，展示到前端
      // 汇总展示图，需要一个折现面积图，上面的折现用收入曲线， 下面的用每日的支出曲线
      // 旭日图用全年超过1k的支出，然后换数据得到
      var myChart2 = echarts.init(document.getElementById('mychart2'))// 获取图标的dom元素
      // const colors = ['#001871', '#ff585d', '#ffb549', '#41b6e6'] // 设置折线图颜色
      var option2 = {
        color: ['#67F9D8', '#FFE434', '#56A3F1', '#FF917C'],
        title: {
          // text: 'Customized Radar Chart'
        },
        legend: {},
        radar: [
          {
            indicator: [
              { text: '趋势1' },
              { text: 'Indicator2' },
              { text: 'Indicator3' },
              { text: 'Indicator4' },
              { text: 'Indicator5' }
            ],
            center: ['25%', '50%'],
            radius: 120,
            startAngle: 90,
            splitNumber: 4,
            shape: 'circle',
            axisName: {
              formatter: '【{value}】',
              color: '#428BD4'
            },
            splitArea: {
              areaStyle: {
                color: ['#77EADF', '#26C3BE', '#64AFE9', '#428BD4'],
                shadowColor: 'rgba(0, 0, 0, 0.2)',
                shadowBlur: 10
              }
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(211, 253, 250, 0.8)'
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(211, 253, 250, 0.8)'
              }
            }
          },
          {
            indicator: [
              { text: '维度1', max: 150 },
              { text: 'Indicator2', max: 150 },
              { text: 'Indicator3', max: 150 },
              { text: 'Indicator4', max: 120 },
              { text: 'Indicator5', max: 108 },
              { text: 'Indicator6', max: 72 }
            ],
            center: ['75%', '50%'],
            radius: 120,
            axisName: {
              color: '#fff',
              backgroundColor: '#666',
              borderRadius: 3,
              padding: [3, 5]
            }
          }
        ],
        series: [
          {
            type: 'radar',
            emphasis: {
              lineStyle: {
                width: 4
              }
            },
            data: [
              {
                value: [100, 8, 0.4, -80, 2000],
                name: 'Data A'
              },
              {
                value: [60, 5, 0.3, -100, 1500],
                name: 'Data B',
                areaStyle: {
                  color: 'rgba(255, 228, 52, 0.6)'
                }
              }
            ]
          },
          {
            type: 'radar',
            radarIndex: 1,
            data: this.radarData
          }
        ]
      }
      myChart2.setOption(option2)
      window.onresize = function() {
        myChart2.resize()
      }
      // *************************************************************
      // 玫瑰图
      // 只看支出，每个与的分类支出汇总，按照大小进行排序
      // 然后直接返回到前端即可
      // 需要一个每月报告看板：
      // 最上面是收入支出的图
      // 第二个是收入支出的占比图，加上趋势线
      // 第三个是雷达图，玫瑰图
      // 第四个桑基图，左边总计-银行卡分类-支出备注-消费大类
      // 额外的图：收入漏斗图
      // 客户流水-个人收入-用电成本-餐饮日均开销-日利润，右边出日均时薪

      const option3 = {
        legend: {
          top: 'bottom'
        },
        toolbox: {
          show: true,
          feature: {
            mark: { show: true },
            dataView: { show: true, readOnly: false },
            restore: { show: true },
            saveAsImage: { show: true }
          }
        },
        series: [
          {
            name: 'Nightingale Chart',
            type: 'pie',
            radius: [50, 250],
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 8
            },
            data: this.roseData
          }
        ]
      }
      const myChart3 = echarts.init(document.getElementById('mychart3'))// 图标初始化
      // var chart = echarts.init(document.getElementById('mychart'), 'dark') // 黑暗模式
      myChart3.setOption(option3)// 渲染页面

      // 随着屏幕大小调节图表
      window.onresize = function() {
        myChart3.resize({
          width: 100,
          height: 400
        })
      }
    }
    // handleSetLineChartData(type) {
    //   this.lineChartData = lineChartData[type]
    // }
  }
}
</script>
<style scoped>
.echartDemo {
  background-color: #fff;
  border: black;
  border: 1px;
  display: inline-block;
  height: 400px;
  width: 100%;
}

.echartDemo3 {
  background-color: #fff;
  border: black;
  border: 1px;
  display: inline-block;
  height: 400px;
  width: 100%;
}

.cardStyle {
  clear: both;
  content: "";
  display: table;
  font-size: 14px;
  margin-bottom: 18px;
  width: 33%;
}

.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}

.clearfix:before,
.clearfix:after {
  content: "";
  display: table;
}

.clearfix:after {
  clear: both;
}

.box-card {
  display: inline-block;
  height: 20%;
  margin: 1.5%;
  width: 30%;
}

.box-card1 {
  display: inline-block;
  height: 20%;
  margin: 1.5%;
  width: 96%;
}

.box-card2 {
  display: inline-block;
  height: 10%;
  margin: 1.5%;
  width: 15%;
}

.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }

  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}</style>
