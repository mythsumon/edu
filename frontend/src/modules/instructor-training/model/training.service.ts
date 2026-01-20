import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse, PageResponse } from '@/shared/http/types/common'
import type { ScheduleResponseDto, ListSchedulesParams } from './training.types'

/**
 * Fetch instructor schedule list
 */
export const getInstructorScheduleList = async (
  params?: ListSchedulesParams
): Promise<PageResponse<ScheduleResponseDto>> => {
  const response = await axiosInstance.get<
    ApiResponse<PageResponse<ScheduleResponseDto>>
  >('/instructor/schedule/list', { params })
  return response.data.data
}
