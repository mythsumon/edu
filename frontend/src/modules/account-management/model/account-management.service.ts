import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type {
  AdminResponseDto,
  InstructorResponseDto,
  ListAccountsParams,
  CreateAdminRequestDto,
  CreateInstructorRequestDto,
  UpdateInstructorRequestDto,
} from './account-management.types'

/**
 * Create a new admin
 */
export async function createAdmin(
  data: CreateAdminRequestDto
): Promise<AdminResponseDto> {
  const response = await axiosInstance.post<ApiResponse<AdminResponseDto>>(
    '/admin/register',
    data
  )
  return response.data.data
}

/**
 * List admins with pagination and filters
 */
export async function listAdmins(
  params?: ListAccountsParams
): Promise<PageResponse<AdminResponseDto>> {
  // Build clean params object - filter out undefined and empty arrays
  const queryParams: Record<string, unknown> = {}
  
  if (params?.q) {
    queryParams.q = params.q
  }
  if (params?.page !== undefined) {
    queryParams.page = params.page
  }
  if (params?.size !== undefined) {
    queryParams.size = params.size
  }
  if (params?.sort) {
    queryParams.sort = params.sort
  }

  const response = await axiosInstance.get<ApiResponse<PageResponse<AdminResponseDto>>>(
    '/admin',
    { params: queryParams }
  )
  return response.data.data
}

/**
 * Create a new instructor
 */
export async function createInstructor(
  data: CreateInstructorRequestDto
): Promise<InstructorResponseDto> {
  const response = await axiosInstance.post<ApiResponse<InstructorResponseDto>>(
    '/instructor/register',
    data
  )
  return response.data.data
}

/**
 * List instructors with pagination and filters
 */
export async function listInstructors(
  params?: ListAccountsParams
): Promise<PageResponse<InstructorResponseDto>> {
  // Build clean params object - filter out undefined and empty arrays
  // Axios will serialize arrays as repeated query parameters: regionIds=1&regionIds=2
  const queryParams: Record<string, unknown> = {}
  
  if (params?.q) {
    queryParams.q = params.q
  }
  if (params?.page !== undefined) {
    queryParams.page = params.page
  }
  if (params?.size !== undefined) {
    queryParams.size = params.size
  }
  if (params?.sort) {
    queryParams.sort = params.sort
  }
  
  // Only include array parameters if they have values
  // This prevents sending empty arrays which might confuse the backend
  if (params?.regionIds && Array.isArray(params.regionIds) && params.regionIds.length > 0) {
    queryParams.regionIds = params.regionIds
  }
  if (params?.classificationIds && Array.isArray(params.classificationIds) && params.classificationIds.length > 0) {
    queryParams.classificationIds = params.classificationIds
  }
  if (params?.statusIds && Array.isArray(params.statusIds) && params.statusIds.length > 0) {
    queryParams.statusIds = params.statusIds
  }
  if (params?.zoneIds && Array.isArray(params.zoneIds) && params.zoneIds.length > 0) {
    queryParams.zoneIds = params.zoneIds
  }

  // Debug: Log the params being sent (remove in production if not needed)
  if (Object.keys(queryParams).length > 0) {
    console.log('[listInstructors] Query params:', queryParams)
  }

  const response = await axiosInstance.get<ApiResponse<PageResponse<InstructorResponseDto>>>(
    '/instructor',
    { 
      params: queryParams,
      // Custom params serializer to ensure arrays are sent as repeated params: param=value1&param=value2
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              // For arrays, append each value multiple times: param=value1&param=value2
              value.forEach((item) => {
                searchParams.append(key, String(item))
              })
            } else {
              searchParams.append(key, String(value))
            }
          }
        })
        const serialized = searchParams.toString()
        console.log('[listInstructors] Serialized params:', serialized)
        return serialized
      },
    }
  )
  return response.data.data
}

/**
 * Get a single instructor by ID
 */
export async function getInstructorById(id: number): Promise<InstructorResponseDto> {
  const response = await axiosInstance.get<ApiResponse<InstructorResponseDto>>(
    `/instructor/${id}`
  )
  return response.data.data
}

/**
 * Update an existing instructor
 */
export async function updateInstructor(
  id: number,
  data: UpdateInstructorRequestDto
): Promise<InstructorResponseDto> {
  const response = await axiosInstance.put<ApiResponse<InstructorResponseDto>>(
    `/instructor/${id}`,
    data
  )
  return response.data.data
}

/**
 * Export instructors to Excel
 * Returns a blob that can be downloaded as a file
 */
export async function exportInstructorsToExcel(
  params?: Omit<ListAccountsParams, 'page' | 'size' | 'sort'>
): Promise<Blob> {
  // Build clean params object - filter out undefined and empty arrays
  const queryParams: Record<string, unknown> = {}
  
  if (params?.q) {
    queryParams.q = params.q
  }
  
  // Only include array parameters if they have values
  if (params?.regionIds && Array.isArray(params.regionIds) && params.regionIds.length > 0) {
    queryParams.regionIds = params.regionIds
  }
  if (params?.classificationIds && Array.isArray(params.classificationIds) && params.classificationIds.length > 0) {
    queryParams.classificationIds = params.classificationIds
  }
  if (params?.statusIds && Array.isArray(params.statusIds) && params.statusIds.length > 0) {
    queryParams.statusIds = params.statusIds
  }
  if (params?.zoneIds && Array.isArray(params.zoneIds) && params.zoneIds.length > 0) {
    queryParams.zoneIds = params.zoneIds
  }

  const response = await axiosInstance.get(
    '/instructor/export',
    {
      params: queryParams,
      // Custom params serializer to ensure arrays are sent as repeated params: param=value1&param=value2
      paramsSerializer: (params) => {
        const searchParams = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            if (Array.isArray(value)) {
              // For arrays, append each value multiple times: param=value1&param=value2
              value.forEach((item) => {
                searchParams.append(key, String(item))
              })
            } else {
              searchParams.append(key, String(value))
            }
          }
        })
        return searchParams.toString()
      },
      responseType: 'blob', // Important: set responseType to 'blob' for file downloads
    }
  )
  return response.data
}