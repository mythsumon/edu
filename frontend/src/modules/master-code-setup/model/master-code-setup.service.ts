import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type {
  MasterCodeResponseDto,
  MasterCodeCreateDto,
  MasterCodeUpdateDto,
  ListMasterCodesParams,
  MasterCodeTreeDto,
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

/**
 * List root-level master codes only
 */
export async function listRootMasterCodes(
  params?: Omit<ListMasterCodesParams, 'parentId' | 'rootOnly'>
): Promise<PageResponse<MasterCodeResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<MasterCodeResponseDto>>>(
    '/mastercode/roots',
    { params }
  )
  return response.data.data
}

/**
 * Delete master code
 */
export async function deleteMasterCode(id: number): Promise<void> {
  await axiosInstance.delete<ApiResponse<unknown>>(`/mastercode/${id}`)
}

/**
 * Check if master code exists
 * Returns true if code exists, false if available
 * Uses the success field from ApiResponse instead of HTTP status codes
 */
export async function checkCodeExists(code: number): Promise<boolean> {
  try {
    const response = await axiosInstance.get<ApiResponse<unknown>>('/mastercode/check', {
      params: { code },
    })
    // success: true means code is available (doesn't exist) → return false
    // success: false means code exists → return true
    return response.data.success
  } catch (error: unknown) {
    // Handle 400 response (code exists)
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: ApiResponse<unknown>; status?: number } }
      // 400 response with success: false means code exists
      if (axiosError.response?.status === 400 && axiosError.response.data) {
        // success: false means code exists → return true
        return axiosError.response.data.success
      }
    }
    // Re-throw other errors
    throw error
  }
}

/**
 * Get master code tree (hierarchical structure)
 */
export async function getMasterCodeTree(
  rootId?: number,
  depth?: number
): Promise<MasterCodeTreeDto[]> {
  const response = await axiosInstance.get<ApiResponse<MasterCodeTreeDto[]>>('/mastercode/tree', {
    params: { rootId, depth },
  })
  return response.data.data
}

/**
 * Get children of a master code by parent code
 */
export async function getMasterCodeChildrenByCode(
  parentCode: number,
  params?: { q?: string; page?: number; size?: number; sort?: string }
): Promise<PageResponse<MasterCodeResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<MasterCodeResponseDto>>>(
    `/mastercode/${parentCode}/children`,
    { params }
  )
  return response.data.data
}