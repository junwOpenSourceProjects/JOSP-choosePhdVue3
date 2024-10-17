/*
 * @Author: junw wo1261931780@gmail.com
 * @Date: 2024-02-06 23:02:56
 * @LastEditors: junw wo1261931780@gmail.com
 * @LastEditTime: 2024-10-17 14:24:18
 * @FilePath: \chooseCollegeVue\src\router\modules\devEchartShow.js
 * @Description: 1111
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const devEchartShowRouter = {
  path: '/testTable',
  component: Layout,
  redirect: '/showDevTable/TestTable',
  name: 'testTable',
  meta: {
    title: 'dev三张表',
    icon: 'table'
  },
  children: [
    {
      path: 'dashboard',
      component: () => import('@/views/showDevTable/dashboard.vue'),
      name: 'dashboard',
      meta: { title: '测试看板视图' }
    }
  ]
}
export default devEchartShowRouter
