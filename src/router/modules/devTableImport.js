/*
 * @Author: junw wo1261931780@gmail.com
 * @Date: 2024-02-06 23:02:56
 * @LastEditors: junw wo1261931780@gmail.com
 * @LastEditTime: 2024-10-18 07:19:15
 * @FilePath: \chooseCollegeVue\src\router\modules\devTableImport.js
 * @Description: 1111
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const devTableImportRouter = {
  path: '/echartTestPage',
  component: Layout,
  redirect: '/echartTestPage/EchartsTestPage',
  name: 'echartTestPage',
  meta: {
    title: 'echart测试页面',
    icon: 'table'
  },
  children: [
    {
      path: 'EchartZheXian1',
      component: () => import('@/views/echartTestPage/echartZheXian1.vue'),
      name: 'EchartZheXian1',
      meta: { title: 'Echart折线图' }
    }, {
      path: 'EchartZheXian2',
      component: () => import('@/views/echartTestPage/echartZheXian2.vue'),
      name: 'EchartZheXian2',
      meta: { title: 'Echart折线加长方形图' }
    }, {
      path: 'EchartZheXian3',
      component: () => import('@/views/echartTestPage/echartZheXian3.vue'),
      name: 'EchartZheXian3',
      meta: { title: 'Echart折线面积图' }
    }, {
      path: 'EchartZheXian4',
      component: () => import('@/views/echartTestPage/echartZheXian4.vue'),
      name: 'EchartZheXian4',
      meta: { title: 'Echart折线加饼图' }
    }, {
      path: 'EchartZheXian5',
      component: () => import('@/views/echartTestPage/echartZheXian5.vue'),
      name: 'EchartZheXian5',
      meta: { title: 'Echart蓝色条形图' }
    }, {
      path: 'EchartZheXian6',
      component: () => import('@/views/echartTestPage/echartZheXian6.vue'),
      name: 'EchartZheXian6',
      meta: { title: 'Echart彩色趋势条形图' }
    }, {
      path: 'EchartZheXian7',
      component: () => import('@/views/echartTestPage/echartZheXian7.vue'),
      name: 'EchartZheXian7',
      meta: { title: 'Echart正负条形图' }
    }, {
      path: 'EchartZheXian8',
      component: () => import('@/views/echartTestPage/echartZheXian8.vue'),
      name: 'EchartZheXian8',
      meta: { title: 'Echart动态条形图' }
    }, {
      path: 'EchartZheXian9',
      component: () => import('@/views/echartTestPage/echartZheXian9.vue'),
      name: 'EchartZheXian9',
      meta: { title: 'Echart南丁格尔玫瑰图' }
    }, {
      path: 'EchartZheXian10',
      component: () => import('@/views/echartTestPage/echartZheXian10.vue'),
      name: 'EchartZheXian10',
      meta: { title: 'Echart单轴散点图' }
    }, {
      path: 'EchartZheXian11',
      component: () => import('@/views/echartTestPage/echartZheXian11.vue'),
      name: 'EchartZheXian11',
      meta: { title: 'Echart打卡极坐标图' }
    }, {
      path: 'EchartZheXian12',
      component: () => import('@/views/echartTestPage/echartZheXian12.vue'),
      name: 'EchartZheXian12',
      meta: { title: 'Echart热力日历图' }
    }, {
      path: 'EchartZheXian13',
      component: () => import('@/views/echartTestPage/echartZheXian13.vue'),
      name: 'EchartZheXian13',
      meta: { title: 'Echart拼色雷达图' }
    }, {
      path: 'EchartZheXian14',
      component: () => import('@/views/echartTestPage/echartZheXian14.vue'),
      name: 'EchartZheXian14',
      meta: { title: 'Echart纵向日历图' }
    }, {
      path: 'EchartZheXian15',
      component: () => import('@/views/echartTestPage/echartZheXian15.vue'),
      name: 'EchartZheXian15',
      meta: { title: 'Echart旭日图' }
    }, {
      path: 'EchartZheXian16',
      component: () => import('@/views/echartTestPage/echartZheXian16.vue'),
      name: 'EchartZheXian16',
      meta: { title: 'Echart桑基图' }
    }, {
      path: 'EchartZheXian17',
      component: () => import('@/views/echartTestPage/echartZheXian17.vue'),
      name: 'EchartZheXian17',
      meta: { title: 'Echart漏斗图' }
    }, {
      path: 'EchartZheXian18',
      component: () => import('@/views/echartTestPage/echartZheXian18.vue'),
      name: 'EchartZheXian18',
      meta: { title: 'Echart文字描边图' }
    }, {
      path: 'EchartZheXian19',
      component: () => import('@/views/echartTestPage/echartZheXian19.vue'),
      name: 'EchartZheXian19',
      meta: { title: '测试查询院校' }
    }
  ]
}
export default devTableImportRouter
