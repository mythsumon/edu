'use client'

import { REGIONS } from '@/types/region'

export function SpecialItemDefaultView() {
  // Calculate totals for all special items
  const totals = REGIONS.reduce(
    (acc, region) => {
      acc.bookWall += region.summary.bookWall
      acc.fiftyHours += region.summary.fiftyHours
      acc.specialClass += region.summary.specialClass
      return acc
    },
    { bookWall: 0, fiftyHours: 0, specialClass: 0 }
  )

  // Calculate average progress
  const avgProgress = Math.round(
    REGIONS.reduce((sum, r) => sum + r.educationPercent, 0) / REGIONS.length
  )

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 lg:p-6 shrink-0 border-b border-gray-200">
        <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">특수 항목별 세부조회</h3>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">전체 교육 진행률</span>
            <span className="text-xl font-semibold text-gray-900">
              {avgProgress}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 bg-gray-400"
              style={{
                width: `${avgProgress}%`,
              }}
            />
          </div>
        </div>

        {/* Summary Table */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">요약</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">구분</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">수치</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-sm text-gray-700">교육 진행률</td>
                  <td className="px-3 py-2 text-sm text-gray-900 font-semibold">{avgProgress}%</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-sm text-gray-700">도서·벽지</td>
                  <td className="px-3 py-2 text-sm text-gray-900 font-semibold">{totals.bookWall}개</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-sm text-gray-700">50차시</td>
                  <td className="px-3 py-2 text-sm text-gray-900 font-semibold">{totals.fiftyHours}개</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-sm text-gray-700">특수학급</td>
                  <td className="px-3 py-2 text-sm text-gray-900 font-semibold">{totals.specialClass}개</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Region Breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">권역별 현황</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">권역</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">도서·벽지</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">50차시</th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">특수학급</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {REGIONS.map((region, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                      <span style={{ color: region.color }}>{region.name}</span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">{region.summary.bookWall}개</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{region.summary.fiftyHours}개</td>
                    <td className="px-3 py-2 text-sm text-gray-700">{region.summary.specialClass}개</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}


