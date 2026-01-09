import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import { normalizeError } from './errors'

/**
 * Setup request and response interceptors
 */
export function setupInterceptors(instance: AxiosInstance): void {
  // Request interceptor - attach auth token
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Get token from auth store if available
      const token = localStorage.getItem('auth_token')
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // Response interceptor - normalize errors
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      return response
    },
    (error) => {
      const normalizedError = normalizeError(error)
      return Promise.reject(normalizedError)
    }
  )
}

