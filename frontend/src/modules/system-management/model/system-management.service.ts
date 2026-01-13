import type { ApiResponse } from '@/shared/http/types/common'
import type { SystemManagement } from './system-management.types'
import { axiosInstance } from '@/shared/http/axios/instance'

// Placeholder service - to be implemented when API is available
export const getSystemManagementList = async (): Promise<ApiResponse<SystemManagement[]>> => {
  const response = await axiosInstance.get('/system-management')
  return response.data
}

