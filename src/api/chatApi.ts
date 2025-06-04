import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
} from 'axios'

// 从环境变量中读取 API Key 和 Base URL
const API_KEY = import.meta.env.VITE_API_KEY
const BASE_URL = import.meta.env.VITE_BASE_URL

// 创建 Axios 实例
const service: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 1000 * 60 * 5, // 请求超时时间
  maxBodyLength: Infinity,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器 - 自动添加 API Key 到 headers
service.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 设置 Authorization 头
    config.headers['Authorization'] = `Bearer ${API_KEY}`
    return config
  },
  error => Promise.reject(error),
)

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => response.data, // 直接返回数据
  error => {
    console.error('API 请求错误:', error.response || error.message)
    return Promise.reject(error)
  },
)

// 封装fetch
export const fetcher = async (
  url: string,
  method: string,
  data: any = null,
  options: any = {},
) => {
  const response = await fetch(BASE_URL + url, {
    ...options,
    method,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: data ? JSON.stringify(data) : null,
  })
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`)
  }

  return response
}

// 封装 API 请求方法
// 列出模型
export const listModels = () => {
  return service.get('/models')
}

// 对话补全
export const chatCompletion = (
  data: CompletionRequest,
): Promise<CompletionResponse> => {
  return service.post('/chat/completions', data, {
    headers: { Accept: 'application/json' },
  })
}
// 流式对话补全
export const streamChatCompletion = (
  signal: AbortSignal,
  data: CompletionRequest,
): Promise<Response> => {
  return fetcher('/chat/completions', 'POST', data, {
    headers: { Accept: 'application/json' },
    signal,
  })
}

export default service
