import axios from 'axios'
import { getApiBaseUrl } from '@/app/config/env'
import { setupInterceptors } from './interceptors'

/**
 * Single axios instance for the entire application
 */
export const axiosInstance = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
  withCredentials: true, // Required for cookies to be sent/received in cross-origin requests
})

// Setup interceptors
setupInterceptors(axiosInstance)

