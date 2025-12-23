'use client'

import { REGIONS, type SpecialCategory } from '@/types/region'

interface SpecialItemDetailPanelProps {
  selectedCategory: SpecialCategory
  onClose: () => void
}

export function SpecialItemDetailPanel({ selectedCategory, onClose }: SpecialItemDetailPanelProps) {
  const categoryColors = {
    '도서·벽지': '#F97316',
    '50차시': '#22C55E',
    '특수학급': '#EC4899',
  }

  const categoryLabels = {
    '도서·벽지': '도서·벽지',
    '50차시': '50차시',
    '특수학급': '특수학급',
  }

  const color = categoryColors[selectedCategory]
  const label = categoryLabels[selectedCategory]

  // Calculate totals across all regions
  const totals = REGIONS.reduce(
    (acc, region) => {
      switch (selectedCategory) {
        case '도서·벽지':
          acc.total += region.summary.bookWall
          break
        case '50차시':
          acc.total += region.summary.fiftyHours
          break
        case '특수학급':
          acc.total += region.summary.specialClass
          break
      }
      return acc
    },
    { total: 0 }
  )

  // Calculate progress percentage based on category
  // Using the same values as SpecialItemCards component
  const progressPercentMap = {
    '도서·벽지': 50,
    '50차시': 75,
    '특수학급': 60,
  }
  const progressPercent = progressPercentMap[selectedCategory]

  // Get region-wise breakdown
  const regionBreakdown = REGIONS.map((region) => {
    let value = 0
    switch (selectedCategory) {
      case '도서·벽지':
        value = region.summary.bookWall
        break
      case '50차시':
        value = region.summary.fiftyHours
        break
      case '특수학급':
        value = region.summary.specialClass
        break
    }
    return {
      region: region.name,
      value,
      color: region.color,
    }
  })

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full">
      {/* Header - Fixed */}
      <div className="flex items-center justify-between p-4 lg:p-6 shrink-0 border-b border-gray-200">
        <h3 className="text-lg font-bold text-[#3a2e2a]">
          {label} 상세 정보
        </h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
        >
          ✕
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 lg:p-6">
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">교육 진행률</span>
            <span className="text-xl font-semibold" style={{ color }}>
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPercent}%`,
                backgroundColor: color,
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
                  <td className="px-3 py-2 text-sm text-gray-900 font-semibold">{progressPercent}%</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2 text-sm text-gray-700">{label}</td>
                  <td className="px-3 py-2 text-sm text-gray-900 font-semibold">{totals.total}개</td>
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
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 uppercase">{label}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {regionBreakdown.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-2 text-sm text-gray-900 font-medium">
                      <span style={{ color: item.color }}>{item.region}</span>
                    </td>
                    <td className="px-3 py-2 text-sm text-gray-700">{item.value}개</td>
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

