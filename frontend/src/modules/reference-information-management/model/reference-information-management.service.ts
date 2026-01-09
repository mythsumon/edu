import type { ApiResponse } from '@/shared/http/types/common'
import type { ReferenceInformation } from './reference-information-management.types'
import { axiosInstance } from '@/shared/http/axios/instance'

// Placeholder service - to be implemented when API is available
export const getReferenceInformationManagementList = async (): Promise<ApiResponse<ReferenceInformation[]>> => {
  const response = await axiosInstance.get('/reference-information-management')
  return response.data
}

