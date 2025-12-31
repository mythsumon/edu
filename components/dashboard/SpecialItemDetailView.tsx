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

  // Calculate progress percentage
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
    <div className="flex flex-col h-full">
      {/* Result Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {label} 진행 현황
            </h2>
            <p className="text-sm text-slate-600">
              특수 항목별 교육 진행률 및 권역별 통계
            </p>
          </div>
          <div className="text-right ml-6">
            <div className="text-5xl font-bold mb-1" style={{ color }}>
              {progressPercent}%
            </div>
            <div className="text-sm text-slate-600">교육 진행률</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-6">
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

      {/* Visual Summary Section */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">전체 현황</h3>
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <div className="flex items-end gap-6">
            <div>
              <div className="text-sm text-slate-600 mb-1">총 {label}</div>
              <div className="text-4xl font-bold text-slate-900">{totals.total}</div>
              <div className="text-xs text-slate-500 mt-1">개</div>
            </div>
            <div className="ml-auto">
              <div className="text-sm text-slate-600 mb-1">권역 수</div>
              <div className="text-2xl font-bold text-slate-900">{REGIONS.length}</div>
              <div className="text-xs text-slate-500 mt-1">개</div>
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">권역별 상세 현황</h3>
          
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      권역
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      {label}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      비율
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {regionBreakdown.map((item, index) => {
                    const percentage = totals.total > 0 
                      ? Math.round((item.value / totals.total) * 100) 
                      : 0
                    
                    return (
                      <tr
                        key={index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm font-medium">
                          <span style={{ color: item.color }}>{item.region}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {item.value}개
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  backgroundColor: item.color,
                                }}
                              />
                            </div>
                            <span className="text-sm text-slate-600 w-12 text-right">
                              {percentage}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

