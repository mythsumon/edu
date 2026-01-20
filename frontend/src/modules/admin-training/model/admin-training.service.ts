import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type {
  AdminTrainingResponseDto,
  ListAdminTrainingsParams,
  AdminTrainingCreateDto,
  AdminTrainingUpdateDto,
  MasterCodeResponseDto,
  MasterCodeChildrenParams,
  ProgramResponseDto,
  ListProgramsParams,
  InstitutionResponseDto,
  ListInstitutionsParams,
} from './admin-training.types'

/**
 * List admin trainings with pagination and filters
 */
export async function listAdminTrainings(
  params?: ListAdminTrainingsParams
): Promise<PageResponse<AdminTrainingResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<AdminTrainingResponseDto>>>(
    '/trainings',
    { params }
  )
  return response.data.data
}

/**
 * Get admin training by ID
 */
export async function getAdminTrainingById(id: number): Promise<AdminTrainingResponseDto> {
  const response = await axiosInstance.get<ApiResponse<AdminTrainingResponseDto>>(
    `/trainings/${id}`
  )
  return response.data.data
}

/**
 * Create admin training
 */
export async function createAdminTraining(
  data: AdminTrainingCreateDto
): Promise<AdminTrainingResponseDto> {
  const response = await axiosInstance.post<ApiResponse<AdminTrainingResponseDto>>(
    '/trainings',
    data
  )
  return response.data.data
}

/**
 * Update admin training
 */
export async function updateAdminTraining(
  id: number,
  data: AdminTrainingUpdateDto
): Promise<AdminTrainingResponseDto> {
  const response = await axiosInstance.put<ApiResponse<AdminTrainingResponseDto>>(
    `/trainings/${id}`,
    data
  )
  return response.data.data
}

/**
 * Delete admin training
 */
export async function deleteAdminTraining(id: number): Promise<void> {
  await axiosInstance.delete(`/trainings/${id}`)
}

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
 * List programs with pagination and filters
 */
export async function listPrograms(
  params?: ListProgramsParams
): Promise<PageResponse<ProgramResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<ProgramResponseDto>>>(
    '/programs',
    { params }
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
