import { API_CONFIG } from './config'

// 标准API响应格式
export interface ApiResponse<T = any> {
  statusCode: number
  message: string
  data: T
}

// API错误类
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// 请求配置接口
export interface RequestConfig {
  headers?: Record<string, string>
  timeout?: number
  requiresAuth?: boolean
  requiresAgentToken?: boolean
  retries?: number
}

// 基础API服务类
export class BaseApiService {
  private baseURL: string
  private defaultHeaders: Record<string, string>
  private bearerToken?: string
  private agentToken?: string

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL
    this.defaultHeaders = { ...API_CONFIG.DEFAULT_HEADERS }
    console.log('BaseApiService initialized with BASE_URL:', this.baseURL)
  }

  // 设置Bearer Token
  setBearerToken(token: string) {
    this.bearerToken = token
  }

  // 设置Agent Token
  setAgentToken(token: string) {
    this.agentToken = token
  }

  // 获取完整的请求头
  private async getHeaders(config?: RequestConfig): Promise<Record<string, string>> {
    const headers = {
      ...this.defaultHeaders,
      ...config?.headers,
    }

    // 添加Bearer Token
    if (config?.requiresAuth && this.bearerToken) {
      headers[API_CONFIG.BEARER_TOKEN_HEADER] = `Bearer ${this.bearerToken}`
    }

    // 添加Agent Token
    if (config?.requiresAgentToken && this.agentToken) {
      headers[API_CONFIG.AGENT_TOKEN_HEADER] = this.agentToken
    }

    return headers
  }

  // 构建完整URL
  private buildURL(endpoint: string, params?: Record<string, any>): string {
    // 处理相对路径的 baseURL
    let baseURL = this.baseURL
    if (baseURL.startsWith('/')) {
      baseURL = window.location.origin + baseURL
    }

    // 确保baseURL以/结尾
    if (!baseURL.endsWith('/')) {
      baseURL += '/'
    }

    // 去掉endpoint开头的/，避免new URL()忽略baseURL
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint

    const url = new URL(cleanEndpoint, baseURL)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value))
        }
      })
    }

    console.log(`Building URL - baseURL: ${baseURL}, endpoint: ${cleanEndpoint}, final: ${url.toString()}`)

    return url.toString()
  }

  // 处理响应
  private async handleResponse<T>(response: Response): Promise<T> {
    let data: any

    // 尝试解析JSON
    try {
      data = await response.json()
    } catch (error) {
      throw new ApiError(
        response.status,
        `Failed to parse response: ${response.statusText}`
      )
    }

    // 检查响应状态
    if (!response.ok) {
      throw new ApiError(
        data.statusCode || response.status,
        data.message || response.statusText,
        data.data
      )
    }

    // 返回data字段或整个响应
    return data.data !== undefined ? data.data : data
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // 通用请求方法
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit,
    config?: RequestConfig
  ): Promise<T> {
    const headers = await this.getHeaders(config)
    const timeout = config?.timeout || API_CONFIG.TIMEOUT
    const maxRetries = config?.retries || API_CONFIG.RETRY.ATTEMPTS

    let lastError: Error

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(endpoint, {
          ...options,
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)
        return await this.handleResponse<T>(response)

      } catch (error) {
        lastError = error as Error

        // 如果不是最后一次尝试，等待后重试
        if (attempt < maxRetries) {
          await this.delay(API_CONFIG.RETRY.DELAY * (attempt + 1))
          continue
        }

        break
      }
    }

    // 抛出最后的错误
    throw lastError!
  }

  // GET请求
  async get<T>(
    endpoint: string,
    params?: Record<string, any>,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildURL(endpoint, params)
    return this.makeRequest<T>(url, { method: 'GET' }, config)
  }

  // POST请求
  async post<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildURL(endpoint)
    return this.makeRequest<T>(
      url,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    )
  }

  // PUT请求
  async put<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildURL(endpoint)
    return this.makeRequest<T>(
      url,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    )
  }

  // PATCH请求
  async patch<T>(
    endpoint: string,
    data?: any,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildURL(endpoint)
    return this.makeRequest<T>(
      url,
      {
        method: 'PATCH',
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    )
  }

  // DELETE请求
  async delete<T>(
    endpoint: string,
    config?: RequestConfig
  ): Promise<T> {
    const url = this.buildURL(endpoint)
    return this.makeRequest<T>(url, { method: 'DELETE' }, config)
  }

  // 文件上传
  async upload<T>(
    endpoint: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<T> {
    const headers = await this.getHeaders(config)
    // 移除Content-Type，让浏览器自动设置
    delete headers['Content-Type']

    const url = this.buildURL(endpoint)
    return this.makeRequest<T>(
      url,
      {
        method: 'POST',
        body: formData,
      },
      { ...config, headers }
    )
  }
}

// 导出单例实例
export const apiService = new BaseApiService()