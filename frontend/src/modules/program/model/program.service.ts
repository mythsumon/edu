import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type { ProgramResponseDto, ListProgramsParams, ProgramCreateDto, ProgramUpdateDto, MasterCodeResponseDto, MasterCodeChildrenParams, ExportProgramsParams } from './program.types'

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
 * Get program by ID
 */
export async function getProgramById(
  id: number
): Promise<ProgramResponseDto> {
  const response = await axiosInstance.get<ApiResponse<ProgramResponseDto>>(
    `/programs/${id}`
  )
  return response.data.data
}

/**
 * Create program
 */
export async function createProgram(
  data: ProgramCreateDto
): Promise<ProgramResponseDto> {
  const response = await axiosInstance.post<ApiResponse<ProgramResponseDto>>(
    '/programs',
    data
  )
  return response.data.data
}

/**
 * Update program
 */
export async function updateProgram(
  id: number,
  data: ProgramUpdateDto
): Promise<ProgramResponseDto> {
  const response = await axiosInstance.put<ApiResponse<ProgramResponseDto>>(
    `/programs/${id}`,
    data
  )
  return response.data.data
}

/**
 * Export programs to Excel
 * Returns a blob that can be downloaded as a file
 */
export async function exportProgramsToExcel(
  params?: ExportProgramsParams
): Promise<Blob> {
  const response = await axiosInstance.get(
    '/programs/export',
    {
      params,
      responseType: 'blob', // Important: set responseType to 'blob' for file downloads
    }
  )
  return response.data
}
