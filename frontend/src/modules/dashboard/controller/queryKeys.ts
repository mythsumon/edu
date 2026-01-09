/**
 * React Query keys for dashboard module
 */
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  summary: () => [...dashboardQueryKeys.all, 'summary'] as const,
  chart: () => [...dashboardQueryKeys.all, 'chart'] as const,
}

