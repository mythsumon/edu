import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse } from '@/shared/http/types/common'
import type { DashboardSummaryDto, DashboardChartDataDto } from './dashboard.types'

/**
 * Get dashboard summary
 */
export async function getDashboardSummary(): Promise<DashboardSummaryDto> {
  const response = await axiosInstance.get<ApiResponse<DashboardSummaryDto>>('/dashboard/summary')
  return response.data.data
}

/**
 * Get dashboard chart data
 */
export async function getDashboardChartData(): Promise<DashboardChartDataDto[]> {
  const response = await axiosInstance.get<ApiResponse<DashboardChartDataDto[]>>('/dashboard/chart')
  return response.data.data
}

