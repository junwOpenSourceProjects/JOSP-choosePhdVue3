import axios from 'axios'

const request = axios.create({
  baseURL: 'http://localhost:8081',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' }
})

request.interceptors.request.use((config) => {
  const token = process.client ? localStorage.getItem('token') : null
  if (token) config.headers['X-Token'] = token
  return config
})

request.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error('[request error]', error?.config?.url, error?.message)
    return Promise.reject(error)
  }
)

export default request
