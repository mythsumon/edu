import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type { 
  MasterCodeResponseDto, 
  MasterCodeChildrenParams,
  InstitutionCreateDto,
  InstitutionUpdateDto,
  InstitutionResponseDto,
  ListInstitutionsParams
} from './institution.types'

/**
 * Get children of a master code by parent code
 */
export async function getMasterCodeChildren(
  parentCode: string,
  params?: MasterCodeChildrenParams
): Promise<PageResponse<MasterCodeResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<MasterCodeResponseDto>>>(
    `/mastercode/${parentCode}/children`,
    { params }
  )
  return response.data.data
}

/**
 * Get grandchildren of a master code by parent code
 * Grandchildren are children of children (2 levels deep)
 */
export async function getMasterCodeGrandChildren(
  parentCode: string,
  params?: MasterCodeChildrenParams
): Promise<PageResponse<MasterCodeResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<MasterCodeResponseDto>>>(
    `/mastercode/${parentCode}/grandchildren`,
    { params }
  )
  return response.data.data
}

/**
 * Get master code by ID
 */
export async function getMasterCodeById(id: number): Promise<MasterCodeResponseDto> {
  const response = await axiosInstance.get<ApiResponse<MasterCodeResponseDto>>(
    `/mastercode/${id}`
  )
  return response.data.data
}

/**
 * List institutions with pagination and filters
 */
export async function listInstitutions(
  params?: ListInstitutionsParams
): Promise<PageResponse<InstitutionResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<InstitutionResponseDto>>>(
    '/institutions',
    { params }
  )
  return response.data.data
}

/**
 * Create institution
 */
export async function createInstitution(
  data: InstitutionCreateDto
): Promise<InstitutionResponseDto> {
  const response = await axiosInstance.post<ApiResponse<InstitutionResponseDto>>(
    '/institutions',
    data
  )
  return response.data.data
}

/**
 * Get institution by ID
 */
export async function getInstitutionById(
  id: number
): Promise<InstitutionResponseDto> {
  const response = await axiosInstance.get<ApiResponse<InstitutionResponseDto>>(
    `/institutions/${id}`
  )
  return response.data.data
}

/**
 * Update institution
 */
export async function updateInstitution(
  id: number,
  data: InstitutionUpdateDto
): Promise<InstitutionResponseDto> {
  const response = await axiosInstance.put<ApiResponse<InstitutionResponseDto>>(
    `/institutions/${id}`,
    data
  )
  return response.data.data
}

/**
 * Export institutions to Excel
 * Returns a blob that can be downloaded as a file
 */
export async function exportInstitutionsToExcel(
  params?: Omit<ListInstitutionsParams, 'page' | 'size' | 'sort'>
): Promise<Blob> {
  const response = await axiosInstance.get(
    '/institutions/export',
    {
      params,
      responseType: 'blob', // Important: set responseType to 'blob' for file downloads
    }
  )
  return response.data
}
