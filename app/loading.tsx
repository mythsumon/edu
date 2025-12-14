import { KPISkeleton, TableRowSkeleton } from '@/components/dashboard/LoadingSkeleton'

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[1440px] mx-auto px-6 md:px-8 py-6 md:py-8">
        {/* Page Header Skeleton */}
        <div className="mb-8">
          <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
          <div className="h-8 w-64 bg-gray-200 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse"></div>
        </div>

        {/* KPI Skeleton */}
        <KPISkeleton />

        {/* Region Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-[60%_40%] gap-6 mb-8">
          <div className="bg-white rounded-card p-6 shadow-card">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-100 rounded-card p-4 h-48 animate-pulse"></div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-card p-6 shadow-card">
            <div className="h-6 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
          </div>
        </div>

        {/* Special Items Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-card p-6 shadow-card">
              <div className="h-4 w-32 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-10 w-20 bg-gray-200 rounded mb-2 animate-pulse"></div>
              <div className="h-3 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
              <div className="h-2 w-full bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Table Skeleton */}
        <div className="bg-white rounded-card shadow-card">
          <div className="p-6 border-b border-gray-200">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4 animate-pulse"></div>
            <div className="h-10 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <th key={i} className="px-6 py-3">
                      <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5].map((i) => (
                  <TableRowSkeleton key={i} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}





