import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ElMessage } from 'element-plus'

const TIMEOUT = 10000
const TOKEN = 'token'

export interface Result<T> {
  code: number
  message: string
  result: T
}

export class Request {
  instance: AxiosInstance

  baseConfig: AxiosRequestConfig = {
    baseURL: import.meta.env.BASE_URL,
    timeout: TIMEOUT,
  }

  cancelAbortControllerMap = new Map<string, AbortController>()

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(Object.assign(this.baseConfig, config))

    this.instance.interceptors.request.use(
      (config: AxiosRequestConfig) => {
        const token = localStorage.getItem(TOKEN) as string
        const url = config.url as string
        if (token) {
          config.headers!.Authorization = token
        }

        // 存在则取消请求
        if (this.cancelAbortControllerMap.has(url)) {
          this.cancelAbortControllerMap.get(url)?.abort()
        }

        if (url) {
          const abortCon = new AbortController()
          config.signal = abortCon.signal
          this.cancelAbortControllerMap.set(url, abortCon)
        }

        return config
      },
      (err: any) => {
        // 请求错误，这里可以用全局提示框进行提示
        return Promise.reject(err)
      },
    )

    this.instance.interceptors.response.use(
      (res: AxiosResponse) => {
        return res
      },
      (err: any) => {
        // 这里用来处理http常见错误，进行全局提示
        let message = ''
        switch (err.response.status) {
          case 400:
            message = '请求错误(400)'
            break
          case 401:
            // TODO 清除数据跳转到登录页
            message = '未授权，请重新登录(401)'
            break
          case 403:
            message = '拒绝访问(403)'
            break
          case 404:
            message = '请求出错(404)'
            break
          case 408:
            message = '请求超时(408)'
            break
          case 500:
            message = '服务器错误(500)'
            break
          case 501:
            message = '服务未实现(501)'
            break
          case 502:
            message = '网络错误(502)'
            break
          case 503:
            message = '服务不可用(503)'
            break
          case 504:
            message = '网络超时(504)'
            break
          case 505:
            message = 'HTTP版本不受支持(505)'
            break
          default:
            message = `连接出错(${err.response.status})!`
        }
        ElMessage({
          showClose: true,
          message: `${message}，请检查网络或联系管理员！`,
          type: 'error',
        })
        return Promise.reject(err.response)
      },
    )
  }

  // 取消请求
  cancelRequest(url: string) {
    // 取消单个请求
    this.cancelAbortControllerMap.get(url)?.abort()
    this.cancelAbortControllerMap.delete(url)
  }

  // 取消全部请求
  cancelAllRequest() {
    this.cancelAbortControllerMap.forEach(abortCon => {
      abortCon.abort()
    })
  }

  // 定义请求方法
  public request(config: AxiosRequestConfig): Promise<AxiosResponse> {
    return this.instance.request(config)
  }

  public get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.get(url, config)
  }

  public post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.post(url, data, config)
  }

  public put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.put(url, data, config)
  }

  public delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<Result<T>>> {
    return this.instance.delete(url, config)
  }
}

// 默认导出Request实例
export default new Request({})
