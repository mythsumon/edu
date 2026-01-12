import type {
  DashboardSummaryDto,
  DashboardSummary,
  DashboardChartDataDto,
  DashboardChartData,
} from './dashboard.types'

/**
 * Map dashboard summary DTO to UI model
 * Currently a pass-through, but kept for consistency and future transformations
 */
export function mapDashboardSummary(dto: DashboardSummaryDto): DashboardSummary {
  return {
    totalUsers: dto.totalUsers,
    totalRevenue: dto.totalRevenue,
    activeProjects: dto.activeProjects,
    pendingTasks: dto.pendingTasks,
  }
}

/**
 * Map dashboard chart data DTO to UI model
 * Converts date string to Date object
 */
export function mapDashboardChartData(dto: DashboardChartDataDto[]): DashboardChartData[] {
  return dto.map((item) => ({
    date: new Date(item.date),
    value: item.value,
    label: item.label,
  }))
}
