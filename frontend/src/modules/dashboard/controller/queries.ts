import { useQuery } from '@tanstack/react-query'
import { getDashboardSummary, getDashboardChartData } from '../model/dashboard.service'
import { mapDashboardSummary, mapDashboardChartData } from '../model/mapper'
import { dashboardQueryKeys } from './queryKeys'

/**
 * Query hook for dashboard summary
 */
export const useDashboardSummaryQuery = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.summary(),
    queryFn: async () => {
      const dto = await getDashboardSummary()
      return mapDashboardSummary(dto)
    },
  })
}

/**
 * Query hook for dashboard chart data
 */
export const useDashboardChartQuery = () => {
  return useQuery({
    queryKey: dashboardQueryKeys.chart(),
    queryFn: async () => {
      const dto = await getDashboardChartData()
      return mapDashboardChartData(dto)
    },
  })
}

