import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type {
  CommonCodeResponseDto,
  CommonCodeCreateDto,
  CommonCodeUpdateDto,
  ListCommonCodesParams,
  CommonCodeTreeDto,
} from './common-code.types'

/**
 * List common codes with pagination and filters (uses mastercode endpoint)
 */
export async function listCommonCodes(
  params?: ListCommonCodesParams
): Promise<PageResponse<CommonCodeResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<CommonCodeResponseDto>>>(
    '/mastercode',
    { params }
  )
  return response.data.data
}

/**
 * Create common code (uses mastercode endpoint)
 */
export async function createCommonCode(
  request: CommonCodeCreateDto
): Promise<CommonCodeResponseDto> {
  const response = await axiosInstance.post<ApiResponse<CommonCodeResponseDto>>(
    '/mastercode',
    request
  )
  return response.data.data
}

/**
 * Update common code (full update) (uses mastercode endpoint)
 */
export async function updateCommonCode(
  id: number,
  request: CommonCodeUpdateDto
): Promise<CommonCodeResponseDto> {
  const response = await axiosInstance.put<ApiResponse<CommonCodeResponseDto>>(
    `/mastercode/${id}`,
    request
  )
  return response.data.data
}

/**
 * List root-level common codes only (uses mastercode endpoint)
 */
export async function listRootCommonCodes(
  params?: Omit<ListCommonCodesParams, 'parentId' | 'rootOnly'>
): Promise<PageResponse<CommonCodeResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<CommonCodeResponseDto>>>(
    '/mastercode/roots',
    { params }
  )
  return response.data.data
}

/**
 * Delete common code (uses mastercode endpoint)
 */
export async function deleteCommonCode(id: number): Promise<void> {
  await axiosInstance.delete<ApiResponse<unknown>>(`/mastercode/${id}`)
}

/**
 * Check if common code exists (uses mastercode endpoint)
 * Returns true if code exists, false if available
 * Uses the success field from ApiResponse instead of HTTP status codes
 */
export async function checkCodeExists(code: string): Promise<boolean> {
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
 * Get common code tree (hierarchical structure) (uses mastercode endpoint)
 */
export async function getCommonCodeTree(
  rootId?: number,
  depth?: number
): Promise<CommonCodeTreeDto[]> {
  const response = await axiosInstance.get<ApiResponse<CommonCodeTreeDto[]>>('/mastercode/tree', {
    params: { rootId, depth },
  })
  return response.data.data
}

/**
 * Get common code by id (uses mastercode endpoint)
 */
export async function getCommonCodeById(id: number): Promise<CommonCodeResponseDto> {
  const response = await axiosInstance.get<ApiResponse<CommonCodeResponseDto>>(
    `/mastercode/${id}`
  )
  return response.data.data
}

/**
 * Get children of a common code by parent code (uses mastercode endpoint)
 */
export async function getCommonCodeChildrenByCode(
  parentCode: string,
  params?: { q?: string; page?: number; size?: number; sort?: string }
): Promise<PageResponse<CommonCodeResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<CommonCodeResponseDto>>>(
    `/mastercode/${parentCode}/children`,
    { params }
  )
  return response.data.data
}
