/**
 * API 客户端
 * 
 * 这个模块展示了如何在 oclif 项目中实现 API 客户端
 * 包括 HTTP 请求、错误处理、重试机制等
 */

// #region 类型定义
/**
 * HTTP 方法
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

/**
 * 请求配置
 */
export interface RequestConfig {
  method: HttpMethod
  url: string
  headers?: Record<string, string>
  body?: unknown
  timeout?: number
}

/**
 * 响应数据
 */
export interface Response<T = unknown> {
  status: number
  statusText: string
  data: T
  headers: Record<string, string>
}

/**
 * API 客户端配置
 */
export interface ApiClientConfig {
  baseUrl: string
  timeout: number
  retries: number
  headers?: Record<string, string>
}
// #endregion

// #region API 客户端类
/**
 * API 客户端类
 * 提供统一的 HTTP 请求接口
 */
export class ApiClient {
  private config: ApiClientConfig

  constructor(config: ApiClientConfig) {
    this.config = config
  }

  /**
   * 发送 GET 请求
   */
  async get<T = unknown>(url: string, headers?: Record<string, string>): Promise<Response<T>> {
    return this.request<T>({
      method: 'GET',
      url,
      headers,
    })
  }

  /**
   * 发送 POST 请求
   */
  async post<T = unknown>(
    url: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<Response<T>> {
    return this.request<T>({
      method: 'POST',
      url,
      body,
      headers,
    })
  }

  /**
   * 发送 PUT 请求
   */
  async put<T = unknown>(
    url: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<Response<T>> {
    return this.request<T>({
      method: 'PUT',
      url,
      body,
      headers,
    })
  }

  /**
   * 发送 DELETE 请求
   */
  async delete<T = unknown>(url: string, headers?: Record<string, string>): Promise<Response<T>> {
    return this.request<T>({
      method: 'DELETE',
      url,
      headers,
    })
  }

  /**
   * 发送 PATCH 请求
   */
  async patch<T = unknown>(
    url: string,
    body?: unknown,
    headers?: Record<string, string>,
  ): Promise<Response<T>> {
    return this.request<T>({
      method: 'PATCH',
      url,
      body,
      headers,
    })
  }

  /**
   * 核心请求方法
   */
  private async request<T>(config: RequestConfig): Promise<Response<T>> {
    const fullUrl = this.buildUrl(config.url)
    const headers = this.buildHeaders(config.headers)
    const timeout = config.timeout || this.config.timeout

    let lastError: Error | null = null

    // 重试机制
    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      try {
        return await this.executeRequest<T>(fullUrl, config.method, headers, config.body, timeout)
      } catch (error) {
        lastError = error as Error

        // 如果是最后一次尝试，抛出错误
        if (attempt === this.config.retries) {
          break
        }

        // 等待后重试
        await this.delay(this.calculateRetryDelay(attempt))
      }
    }

    throw new ApiError(`请求失败: ${lastError?.message}`, {
      url: fullUrl,
      method: config.method,
      cause: lastError || undefined,
    })
  }

  /**
   * 执行 HTTP 请求
   */
  private async executeRequest<T>(
    url: string,
    method: HttpMethod,
    headers: Record<string, string>,
    body?: unknown,
    timeout?: number,
  ): Promise<Response<T>> {
    // 这里使用 fetch API 作为示例
    // 在实际项目中，你可能需要使用 node-fetch 或其他 HTTP 库
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      })

      const data = (await response.json()) as T

      return {
        status: response.status,
        statusText: response.statusText,
        data,
        headers: this.parseHeaders(response.headers),
      }
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new ApiError('请求超时', {url, method})
      }

      throw error
    } finally {
      clearTimeout(timeoutId)
    }
  }

  /**
   * 构建完整 URL
   */
  private buildUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }

    return `${this.config.baseUrl}${url.startsWith('/') ? url : `/${url}`}`
  }

  /**
   * 构建请求头
   */
  private buildHeaders(customHeaders?: Record<string, string>): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      ...this.config.headers,
      ...customHeaders,
    }
  }

  /**
   * 解析响应头
   */
  private parseHeaders(headers: Headers): Record<string, string> {
    const result: Record<string, string> = {}
    headers.forEach((value, key) => {
      result[key] = value
    })
    return result
  }

  /**
   * 计算重试延迟时间（指数退避）
   */
  private calculateRetryDelay(attempt: number): number {
    return Math.min(1000 * 2 ** attempt, 10_000)
  }

  /**
   * 延迟函数
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
// #endregion

// #region API 错误类
/**
 * API 错误类
 */
export class ApiError extends Error {
  url?: string
  method?: HttpMethod
  cause?: Error

  constructor(
    message: string,
    options?: {
      url?: string
      method?: HttpMethod
      cause?: Error
    },
  ) {
    super(message)
    this.name = 'ApiError'
    this.url = options?.url
    this.method = options?.method
    this.cause = options?.cause
  }
}
// #endregion
