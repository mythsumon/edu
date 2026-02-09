'use client'

import { REGIONS, type SpecialCategory } from '@/types/region'

interface SpecialItemDetailViewProps {
  selectedCategory: SpecialCategory
  onClose: () => void
}

export function SpecialItemDetailView({
  selectedCategory,
  onClose,
}: SpecialItemDetailViewProps) {
  const categoryColors = {
    '도서·벽지': '#F97316',
    '50차시': '#22C55E',
    '특수학급': '#3B82F6',
  }

  const categoryLabels = {
    '도서·벽지': '도서·벽지',
    '50차시': '50차시',
    '특수학급': '특수학급',
  }

  const color = categoryColors[selectedCategory]
  const label = categoryLabels[selectedCategory]

  // Calculate totals across all regions for all categories
  const allTotals = REGIONS.reduce(
    (acc, region) => {
      acc.bookWall += region.summary.bookWall
      acc.fiftyHours += region.summary.fiftyHours
      acc.specialClass += region.summary.specialClass
      return acc
    },
    { bookWall: 0, fiftyHours: 0, specialClass: 0 }
  )

  // Calculate progress percentage
  const progressPercentMap = {
    '도서·벽지': 50,
    '50차시': 75,
    '특수학급': 60,
  }
  const progressPercent = progressPercentMap[selectedCategory]

  return (
    <div className="flex flex-col h-full">
      {/* Result Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-slate-900" style={{ color }}>
              {label}
            </h2>
            <span className="text-2xl font-semibold" style={{ color }}>
              {progressPercent}%
            </span>
          </div>
          <div className="text-sm text-slate-600 mb-3">교육 진행률: {progressPercent}%</div>
          <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: color,
              }}
            />
          </div>
        </div>
      </div>

      {/* Summary Table - 구분/수치 */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
            요약
          </h3>
          <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">구분</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-slate-700 uppercase tracking-wider">수치</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">교육 퍼센트</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{progressPercent}%</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">도서·벽지</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{allTotals.bookWall}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">50차시</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{allTotals.fiftyHours}</td>
                  </tr>
                  <tr className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-slate-700">특수학급</td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{allTotals.specialClass}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

