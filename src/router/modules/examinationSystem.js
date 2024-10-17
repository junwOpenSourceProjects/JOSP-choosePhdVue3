/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const examinationSystemRouter = {
  path: '/examinationSystemTable',
  component: Layout,
  redirect: '/examinationSystemTable/testTable',
  name: 'examinationSystemTable',
  meta: {
    title: '页面sample',
    icon: 'table'
  },
  children: [
    {
      path: 'testTable',
      component: () => import('@/views/examinationSystemTable/testTable'),
      name: 'testTable',
      meta: { title: 'testTable' }
    },
    {
      path: 'queryAllTable',
      component: () => import('@/views/examinationSystemTable/queryAllTable.vue'),
      name: 'queryAllTable',
      meta: { title: '查询所有表' }
    }
  ]
}
export default examinationSystemRouter
