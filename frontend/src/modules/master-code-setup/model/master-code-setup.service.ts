import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type {
  MasterCodeResponseDto,
  MasterCodeCreateDto,
  MasterCodeUpdateDto,
  ListMasterCodesParams,
} from './master-code-setup.types'

/**
 * List master codes with pagination and filters
 */
export async function listMasterCodes(
  params?: ListMasterCodesParams
): Promise<PageResponse<MasterCodeResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<MasterCodeResponseDto>>>(
    '/mastercode',
    { params }
  )
  return response.data.data
}

/**
 * Create master code (root or child)
 */
export async function createMasterCode(
  request: MasterCodeCreateDto
): Promise<MasterCodeResponseDto> {
  const response = await axiosInstance.post<ApiResponse<MasterCodeResponseDto>>(
    '/mastercode',
    request
  )
  return response.data.data
}

/**
 * Update master code (full update)
 */
export async function updateMasterCode(
  id: number,
  request: MasterCodeUpdateDto
): Promise<MasterCodeResponseDto> {
  const response = await axiosInstance.put<ApiResponse<MasterCodeResponseDto>>(
    `/mastercode/${id}`,
    request
  )
  return response.data.data
}
