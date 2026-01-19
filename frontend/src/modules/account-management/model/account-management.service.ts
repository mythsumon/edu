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
  const response = await axiosInstance.get<ApiResponse<PageResponse<AdminResponseDto>>>(
    '/admin',
    { params }
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
  const response = await axiosInstance.get<ApiResponse<PageResponse<InstructorResponseDto>>>(
    '/instructor',
    { params }
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