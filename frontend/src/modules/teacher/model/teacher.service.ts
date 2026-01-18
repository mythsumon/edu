import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type { TeacherResponseDto, ListTeachersParams } from './teacher.types'

/**
 * List teachers with pagination and filters
 */
export async function listTeachers(
  params?: ListTeachersParams
): Promise<PageResponse<TeacherResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<TeacherResponseDto>>>(
    '/teacher',
    { params }
  )
  return response.data.data
}

/**
 * Get teacher by userId
 */
export async function getTeacherById(userId: number): Promise<TeacherResponseDto> {
  const response = await axiosInstance.get<ApiResponse<TeacherResponseDto>>(
    `/teacher/${userId}`
  )
  return response.data.data
}
