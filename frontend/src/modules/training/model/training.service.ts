import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type {
  TrainingResponseDto,
  ListTrainingsParams,
  TrainingCreateDto,
  TrainingUpdateDto,
  MasterCodeResponseDto,
  MasterCodeChildrenParams,
  ProgramResponseDto,
  ListProgramsParams,
  InstitutionResponseDto,
  ListInstitutionsParams,
} from './training.types'

/**
 * List trainings with pagination and filters
 */
export async function listTrainings(
  params?: ListTrainingsParams
): Promise<PageResponse<TrainingResponseDto>> {
  const response = await axiosInstance.get<ApiResponse<PageResponse<TrainingResponseDto>>>(
    '/trainings',
    { params }
  )
  return response.data.data
}

/**
 * Get training by ID
 */
export async function getTrainingById(id: number): Promise<TrainingResponseDto> {
  const response = await axiosInstance.get<ApiResponse<TrainingResponseDto>>(
    `/trainings/${id}`
  )
  return response.data.data
}

/**
 * Create training
 */
export async function createTraining(
  data: TrainingCreateDto
): Promise<TrainingResponseDto> {
  const response = await axiosInstance.post<ApiResponse<TrainingResponseDto>>(
    '/trainings',
    data
  )
  return response.data.data
}

/**
 * Update training
 */
export async function updateTraining(
  id: number,
  data: TrainingUpdateDto
): Promise<TrainingResponseDto> {
  const response = await axiosInstance.put<ApiResponse<TrainingResponseDto>>(
    `/trainings/${id}`,
    data
  )
  return response.data.data
}

/**
 * Delete training
 */
export async function deleteTraining(id: number): Promise<void> {
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
