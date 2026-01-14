import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type {
  AdminResponseDto,
  InstructorResponseDto,
  ListAccountsParams,
} from './account-management.types'

/**
 * List admins with pagination and filters
 */
export async function listAdmins(
  params?: ListAccountsParams
): Promise<PageResponse<AdminResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<AdminResponseDto>>>(
    '/admin',
    { params }
  )
  return response.data.data
}

/**
 * List instructors with pagination and filters
 */
export async function listInstructors(
  params?: ListAccountsParams
): Promise<PageResponse<InstructorResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<InstructorResponseDto>>>(
    '/instructor',
    { params }
  )
  return response.data.data
}
