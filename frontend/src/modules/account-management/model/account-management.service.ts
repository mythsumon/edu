import type { ApiResponse } from '@/shared/http/types/common'
import type { AccountManagement } from './account-management.types'
import { axiosInstance } from '@/shared/http/axios/instance'

// Placeholder service - to be implemented when API is available
export const getAccountManagementData = async (): Promise<ApiResponse<AccountManagement>> => {
  const response = await axiosInstance.get('/account-management')
  return response.data
}
