import { AxiosError } from 'axios'
import type { ApiError } from '../types/common'

/**
 * Normalize AxiosError to ApiError
 */
export function normalizeError(error: unknown): ApiError {
  if (error instanceof AxiosError) {
    const apiError: ApiError = {
      message: error.response?.data?.message || error.message || 'An error occurred',
      code: error.response?.data?.code,
      statusCode: error.response?.status,
      errors: error.response?.data?.errors,
    }
    return apiError
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    }
  }

  return {
    message: 'An unknown error occurred',
  }
}

