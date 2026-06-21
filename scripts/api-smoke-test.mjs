const BASE = process.env.BASE || 'http://localhost:3001/api/v1'

const endpoints = [
  { name: 'listEchartsUniversities', method: 'GET', url: '/status/listEchartsUniversities' },
  { name: 'queryRankingStatus', method: 'GET', url: '/status/queryRankingStatus' },
  { name: 'trendAllVariants', method: 'GET', url: '/status/trendAllVariants?universityNameChinese=麻省理工学院' },
  { name: 'drawerData', method: 'POST', url: '/status/drawerData', body: '麻省理工学院' },
  { name: 'backup2 tables', method: 'GET', url: '/backup2/listTables' },
  { name: 'backup2 years (arwu)', method: 'GET', url: '/backup2/listYears?rankTable=arwu_subject' },
  { name: 'backup2 list (arwu)', method: 'GET', url: '/backup2/list?rankTable=arwu_subject&page=1&limit=5' },
  { name: 'queryQs', method: 'GET', url: '/query/queryQs?rankVariant=qs&page=1&limit=5' },
  { name: 'queryAll', method: 'GET', url: '/query/queryAll?currentRank=50&page=1&limit=5' },
  { name: 'queryAllEcharts', method: 'GET', url: '/query/queryAllEcharts?currentRank=50' },
  { name: 'queryPartEcharts', method: 'GET', url: '/query/queryPartEcharts?rankVariant=qs' },
  { name: 'import stats', method: 'GET', url: '/import/rankings/stats', needsAuth: true },
  { name: 'import history', method: 'GET', url: '/import/rankings/history?page=1&pageSize=5', needsAuth: true },
  { name: 'user info', method: 'GET', url: '/vue-element-admin/user/info' }
]

async function login(cookieJar) {
  const res = await fetch(BASE + '/vue-element-admin/user/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin' })
  })
  const setCookie = res.headers.get('set-cookie') || ''
  cookieJar.cookie = setCookie
  return res.ok
}

async function run() {
  const cookieJar = { cookie: '' }
  await login(cookieJar)

  let ok = 0
  let fail = 0
  for (const e of endpoints) {
    try {
      const headers = { ...(e.body ? { 'Content-Type': 'text/plain' } : {}) }
      if (e.needsAuth && cookieJar.cookie) headers.cookie = cookieJar.cookie
      const res = await fetch(BASE + e.url, {
        method: e.method,
        headers,
        body: e.body
      })
      const text = await res.text()
      const okStatus = res.ok
      const hasBody = text.length > 0
      if (okStatus && hasBody) {
        console.log(`✅ ${e.name}: ${res.status} ${text.slice(0, 80)}`)
        ok++
      } else {
        console.log(`❌ ${e.name}: ${res.status} ${text.slice(0, 200)}`)
        fail++
      }
    } catch (err) {
      console.log(`❌ ${e.name}: ${err.message}`)
      fail++
    }
  }
  console.log(`\n结果: ${ok} 通过, ${fail} 失败`)
  process.exit(fail > 0 ? 1 : 0)
}

run()
