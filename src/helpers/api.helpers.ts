import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

import { getCookie } from './cookie.helpers'

const mode = import.meta.env.MODE
const baseURL =
  mode === 'development'
    ? import.meta.env.VITE_APP_DEV_URL
    : import.meta.env.VITE_APP_PROD_URL
const API_URL = `${baseURL}/api`

// MARK: - instance
const instance: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
  withCredentials: true,
})

// MARK: - interceptor
instance.interceptors.request.use(async (request) => {
  const token = getCookie('@token')
  if (token && request.headers) {
    request.headers.Authorization = `Bearer ${token}`
  }
  return request
})

// MARK: - getParsedUrl
const getParsedUrl = (
  url: string,
  params?: { [key: string]: number | string }
) => {
  if (!params) {
    return url
  }

  let urlString = ''
  Object.keys(params).forEach((key, index, array) => {
    if (params[key] !== undefined && params[key] !== null) {
      urlString += `${index === 0 ? '?' : ''}${key}=${params[key]}${
        index !== array.length - 1 ? '&' : ''
      }`
    }
  })

  return url + urlString
}

// MARK: api
const api =
  <
    ApiResponse,
    // eslint-disable-next-line @typescript-eslint/ban-types
    ApiParams extends { [key: string]: number | string } = {},
    // eslint-disable-next-line @typescript-eslint/ban-types
    ApiBody = {},
  >(
    method: 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch'
  ) =>
  (
    url: string,
    params?: ApiParams,
    data?: ApiBody,
    config?: Omit<
      AxiosRequestConfig<unknown>,
      'baseURL' | 'url' | 'method' | 'data'
    >
  ): Promise<AxiosResponse<ApiResponse>> =>
    instance({ url: getParsedUrl(url, params), method, data, ...config })

export { instance, api }
