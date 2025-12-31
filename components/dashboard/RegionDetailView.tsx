'use client'

import { REGIONS, type RegionData, type SpecialCategory } from '@/types/region'

interface RegionDetailViewProps {
  selectedRegionId: number
  onRegionChange: (regionId: number | undefined) => void
  onCategorySelect?: (category: SpecialCategory) => void
}

export function RegionDetailView({
  selectedRegionId,
  onRegionChange,
  onCategorySelect,
}: RegionDetailViewProps) {
  const region = REGIONS.find((r) => r.id === selectedRegionId)
  if (!region) return null

  const regionColors = {
    1: { bg: '#2563EB', light: '#DBEAFE', text: '#1E40AF' },
    2: { bg: '#F97316', light: '#FFEDD5', text: '#C2410C' },
    3: { bg: '#EAB308', light: '#FEF9C3', text: '#A16207' },
    4: { bg: '#22C55E', light: '#D1FAE5', text: '#15803D' },
    5: { bg: '#A855F7', light: '#E9D5FF', text: '#7C3AED' },
    6: { bg: '#14B8A6', light: '#CCFBF1', text: '#0D9488' },
  }

  const color = regionColors[selectedRegionId as keyof typeof regionColors] || regionColors[1]

  return (
    <div className="flex flex-col h-full">
      {/* Result Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              {region.name} 교육 진행 현황
            </h2>
            <p className="text-sm text-slate-600">
              권역별 교육 진행률 및 상세 통계
            </p>
          </div>
          <div className="text-right ml-6">
            <div className="text-5xl font-bold mb-1" style={{ color: color.bg }}>
              {region.educationPercent}%
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
                width: `${region.educationPercent}%`,
                backgroundColor: color.bg,
              }}
            />
          </div>
        </div>
      </div>

      {/* Visual Summary Section */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">주요 지표</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">도서·벽지</div>
            <div className="text-2xl font-bold text-slate-900">{region.summary.bookWall}</div>
            <div className="text-xs text-slate-500 mt-1">개</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">50차시</div>
            <div className="text-2xl font-bold text-slate-900">{region.summary.fiftyHours}</div>
            <div className="text-xs text-slate-500 mt-1">개</div>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
            <div className="text-sm text-slate-600 mb-1">특수학급</div>
            <div className="text-2xl font-bold text-slate-900">{region.summary.specialClass}</div>
            <div className="text-xs text-slate-500 mt-1">개</div>
          </div>
        </div>
      </div>

      {/* Detailed Breakdown - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-8 py-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">자치단체별 상세 현황</h3>
          
          <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200 sticky top-0">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      자치단체
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      교육기관수
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      학급
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      학생수
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      도서·벽지
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      50차시
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                      특수학급
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {region.locals.map((local, index) => (
                    <tr
                      key={index}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {local.name}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {local.institutions}개
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {local.classes}개
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {local.students}명
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {local.bookWall}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {local.fiftyHours}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700">
                        {local.specialClass}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

