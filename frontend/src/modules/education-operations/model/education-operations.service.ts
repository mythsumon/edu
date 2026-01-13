import type { ApiResponse } from '@/shared/http/types/common'
import type { EducationOperations } from './education-operations.types'
import { axiosInstance } from '@/shared/http/axios/instance'

// Placeholder service - to be implemented when API is available
export const getEducationOperationsList = async (): Promise<ApiResponse<EducationOperations[]>> => {
  const response = await axiosInstance.get('/education-operations')
  return response.data
}

