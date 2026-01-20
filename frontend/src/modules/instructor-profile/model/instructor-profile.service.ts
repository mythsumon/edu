import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type {
  MasterCodeResponseDto,
  InstructorResponseDto,
  InstructorUpdateRequestDto,
  InstructorPatchRequestDto,
  MasterCodeChildrenParams,
} from './instructor-profile.types'
import { INSTRUCTOR_PROFILE_ENDPOINTS } from './instructor-profile.endpoints'

/**
 * Get master code by ID
 * Endpoint: GET /api/v1/mastercode/{id}
 */
export const getMasterCodeById = async (id: number): Promise<MasterCodeResponseDto> => {
  const response = await axiosInstance.get<ApiResponse<MasterCodeResponseDto>>(
    INSTRUCTOR_PROFILE_ENDPOINTS.masterCode.byId(id)
  )
  return response.data.data
}

/**
 * Get master code by code
 * Endpoint: GET /api/v1/mastercode/code/{code}
 */
export const getMasterCodeByCode = async (code: string): Promise<MasterCodeResponseDto> => {
  const response = await axiosInstance.get<ApiResponse<MasterCodeResponseDto>>(
    INSTRUCTOR_PROFILE_ENDPOINTS.masterCode.byCode(code)
  )
  return response.data.data
}

/**
 * Get children of master code by code
 * Endpoint: GET /api/v1/mastercode/{code}/children
 */
export const getMasterCodeChildrenByCode = async (
  code: string,
  params?: MasterCodeChildrenParams
): Promise<PageResponse<MasterCodeResponseDto>> => {
  const response = await axiosInstance.get<ApiResponse<PageResponse<MasterCodeResponseDto>>>(
    INSTRUCTOR_PROFILE_ENDPOINTS.masterCode.childrenByCode(code),
    { params }
  )
  return response.data.data
}

/**
 * Get grandchildren of master code by code
 * Endpoint: GET /api/v1/mastercode/{code}/grandchildren
 */
export const getMasterCodeGrandChildrenByCode = async (
  code: string,
  params?: MasterCodeChildrenParams
): Promise<PageResponse<MasterCodeResponseDto>> => {
  const response = await axiosInstance.get<ApiResponse<PageResponse<MasterCodeResponseDto>>>(
    INSTRUCTOR_PROFILE_ENDPOINTS.masterCode.grandchildrenByCode(code),
    { params }
  )
  return response.data.data
}

/**
 * Update instructor (PUT - full update)
 * Endpoint: PUT /api/v1/instructor/{userId}
 */
export const updateInstructor = async (
  userId: number,
  data: InstructorUpdateRequestDto
): Promise<InstructorResponseDto> => {
  const response = await axiosInstance.put<ApiResponse<InstructorResponseDto>>(
    INSTRUCTOR_PROFILE_ENDPOINTS.instructor.update(userId),
    data
  )
  return response.data.data
}

/**
 * Get current instructor profile
 * Endpoint: GET /api/v1/instructor/me
 */
export const getInstructorMe = async (): Promise<InstructorResponseDto> => {
  const response = await axiosInstance.get<ApiResponse<InstructorResponseDto>>(
    INSTRUCTOR_PROFILE_ENDPOINTS.instructor.me()
  )
  return response.data.data
}

/**
 * Patch current instructor profile (PATCH - partial update)
 * Endpoint: PATCH /api/v1/instructor/me
 */
export const patchInstructorMe = async (
  data: InstructorPatchRequestDto
): Promise<InstructorResponseDto> => {
  const response = await axiosInstance.patch<ApiResponse<InstructorResponseDto>>(
    INSTRUCTOR_PROFILE_ENDPOINTS.instructor.patchMe(),
    data
  )
  return response.data.data
}

/**
 * Patch instructor (PATCH - partial update)
 * Endpoint: PATCH /api/v1/instructor/{userId}
 */
export const patchInstructor = async (
  userId: number,
  data: InstructorPatchRequestDto
): Promise<InstructorResponseDto> => {
  const response = await axiosInstance.patch<ApiResponse<InstructorResponseDto>>(
    INSTRUCTOR_PROFILE_ENDPOINTS.instructor.patch(userId),
    data
  )
  return response.data.data
}

/**
 * Upload signature image for current instructor
 * Endpoint: POST /api/v1/instructor/me/signature
 * Content-Type: multipart/form-data
 */
export const uploadSignature = async (file: File): Promise<InstructorResponseDto> => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await axiosInstance.post<ApiResponse<InstructorResponseDto>>(
    INSTRUCTOR_PROFILE_ENDPOINTS.instructor.uploadSignature(),
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  )
  return response.data.data
}
