import { useDashboardSummaryQuery, useDashboardChartQuery } from '../../controller/queries'
import { LoadingState } from '@/shared/components/LoadingState'
import { ErrorState } from '@/shared/components/ErrorState'
import { EmptyState } from '@/shared/components/EmptyState'
import { formatCurrency } from '@/shared/lib/format'

export const DashboardPage = () => {
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useDashboardSummaryQuery()
  const { data: chartData, isLoading: chartLoading, error: chartError } = useDashboardChartQuery()

  if (summaryLoading || chartLoading) {
    return <LoadingState />
  }

  if (summaryError || chartError) {
    return <ErrorState error={summaryError ?? chartError ?? undefined} />
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-6 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground mb-2">Total Users</p>
            <p className="text-2xl font-bold">{summary.totalUsers}</p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground mb-2">Total Revenue</p>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground mb-2">Active Projects</p>
            <p className="text-2xl font-bold">{summary.activeProjects}</p>
          </div>
          <div className="p-6 border rounded-lg bg-card">
            <p className="text-sm text-muted-foreground mb-2">Pending Tasks</p>
            <p className="text-2xl font-bold">{summary.pendingTasks}</p>
          </div>
        </div>
      )}

      {/* Chart Section */}
      <div className="p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Chart Data</h2>
        {chartData && chartData.length > 0 ? (
          <div className="space-y-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex justify-between items-center p-2 border-b">
                <span className="text-sm">{item.label}</span>
                <span className="text-sm font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No chart data" description="Chart data will appear here" />
        )}
      </div>
    </div>
  )
}

