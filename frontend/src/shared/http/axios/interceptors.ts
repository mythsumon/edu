import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { normalizeError } from './errors'
import { refreshToken } from '@/modules/auth/model/auth.service'

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (error?: unknown) => void
}> = []

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  
  failedQueue = []
}

/**
 * Setup request and response interceptors
 */
export function setupInterceptors(instance: AxiosInstance): void {
  // Request interceptor - attach auth token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Get access_token from sessionStorage
      const accessToken = sessionStorage.getItem('access_token')
      
      if (accessToken && config.headers) {
        config.headers.Authorization = `Bearer ${accessToken}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - handle token refresh on 401
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      // Skip token refresh for auth endpoints (login, logout, refresh)
      const isAuthEndpoint = originalRequest.url?.includes('/auth/login') || 
                            originalRequest.url?.includes('/auth/logout') ||
                            originalRequest.url?.includes('/auth/token/refresh')

      // If error is 401 and we haven't already retried, and it's not an auth endpoint
      if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`
              }
              return instance(originalRequest)
            })
            .catch((err) => {
              return Promise.reject(err)
            })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          // Call refresh token endpoint (reads from cookie)
          const refreshData = await refreshToken()
          
          // Update access_token in sessionStorage
          if (refreshData.access_token) {
            sessionStorage.setItem('access_token', refreshData.access_token)
          }

          // Process queued requests
          processQueue(null, refreshData.access_token)

          // Retry original request with new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${refreshData.access_token}`
          }
          
          const response = await instance(originalRequest)
          isRefreshing = false
          return response
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          processQueue(refreshError as AxiosError, null)
          sessionStorage.removeItem('access_token')
          localStorage.removeItem('user')
          
          // Redirect to login if not already there
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          
          isRefreshing = false
          return Promise.reject(refreshError)
        }
      }

      // For other errors, convert to Error instance and reject
      // This ensures React Query can properly handle the error
      const apiError = normalizeError(error)
      const errorInstance = new Error(apiError.message)
      // Attach additional properties for debugging
      if (apiError.statusCode) {
        (errorInstance as any).statusCode = apiError.statusCode
      }
      if (apiError.code) {
        (errorInstance as any).code = apiError.code
      }
      return Promise.reject(errorInstance)
    }
  )
}

