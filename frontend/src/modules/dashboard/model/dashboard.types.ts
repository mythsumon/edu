/**
 * Dashboard summary DTO
 */
export interface DashboardSummaryDto {
  totalUsers: number
  totalRevenue: number
  activeProjects: number
  pendingTasks: number
}

/**
 * Dashboard chart data DTO
 */
export interface DashboardChartDataDto {
  date: string
  value: number
  label: string
}

/**
 * Dashboard UI model (after mapping)
 */
export interface DashboardSummary {
  totalUsers: number
  totalRevenue: number
  activeProjects: number
  pendingTasks: number
}

export interface DashboardChartData {
  date: Date
  value: number
  label: string
}

