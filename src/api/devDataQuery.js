/*
 * @Author: junw wo1261931780@gmail.com
 * @Date: 2024-02-08 21:00:45
 * @LastEditors: junw wo1261931780@gmail.com
 * @LastEditTime: 2024-10-18 07:27:38
 * @FilePath: \chooseCollegeVue\src\api\devDataQuery.js
 * @Description: 1111
 *
 * Copyright (c) 2024 by ${git_name_email}, All Rights Reserved.
 */
import request from '@/utils/request'

export function fetchEchartsData(query) {
  return request({
    url: '/query/queryPartEcharts',
    method: 'get',
    params: query
  })
}
export function fetchDashboardData(query) {
  return request({
    url: '/bill/queryAll/dashboard',
    method: 'get',
    params: query
  })
}
