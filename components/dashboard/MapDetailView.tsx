'use client'

import { RegionMap } from './RegionMap'
import { REGIONS } from '@/types/region'

interface MapDetailViewProps {
  selectedRegion?: number
  onRegionSelect: (regionId: number | undefined) => void
}

export function MapDetailView({
  selectedRegion,
  onRegionSelect,
}: MapDetailViewProps) {
  const regionColors = {
    1: { bg: '#2563EB', light: '#DBEAFE', text: '#1E40AF' },
    2: { bg: '#F97316', light: '#FFEDD5', text: '#C2410C' },
    3: { bg: '#EAB308', light: '#FEF9C3', text: '#A16207' },
    4: { bg: '#22C55E', light: '#D1FAE5', text: '#15803D' },
    5: { bg: '#A855F7', light: '#E9D5FF', text: '#7C3AED' },
    6: { bg: '#14B8A6', light: '#CCFBF1', text: '#0D9488' },
  }

  const selectedRegionData = selectedRegion 
    ? REGIONS.find(r => r.id === selectedRegion)
    : null

  const color = selectedRegion 
    ? regionColors[selectedRegion as keyof typeof regionColors] || regionColors[1]
    : null

  return (
    <div className="flex flex-col h-full">
      {/* Result Header */}
      <div className="px-8 py-6 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              권역 지도
            </h2>
            <p className="text-sm text-slate-600">
              지도에서 권역을 선택하여 상세 정보를 확인하세요
            </p>
          </div>
          {selectedRegionData && color && (
            <div className="text-right ml-6">
              <div className="text-5xl font-bold mb-1" style={{ color: color.bg }}>
                {selectedRegionData.educationPercent}%
              </div>
              <div className="text-sm text-slate-600">{selectedRegionData.name} 진행률</div>
            </div>
          )}
        </div>
      </div>

      {/* Visual Summary Section - Map */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white">
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <RegionMap 
            selectedRegion={selectedRegion} 
            onRegionSelect={onRegionSelect} 
          />
        </div>
      </div>

      {/* Detailed Breakdown - Scrollable */}
      {selectedRegionData && (
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">
              {selectedRegionData.name} 상세 현황
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">도서·벽지</div>
                <div className="text-2xl font-bold text-slate-900">
                  {selectedRegionData.summary.bookWall}
                </div>
                <div className="text-xs text-slate-500 mt-1">개</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">50차시</div>
                <div className="text-2xl font-bold text-slate-900">
                  {selectedRegionData.summary.fiftyHours}
                </div>
                <div className="text-xs text-slate-500 mt-1">개</div>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">특수학급</div>
                <div className="text-2xl font-bold text-slate-900">
                  {selectedRegionData.summary.specialClass}
                </div>
                <div className="text-xs text-slate-500 mt-1">개</div>
              </div>
            </div>

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
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {selectedRegionData.locals.map((local, index) => (
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {!selectedRegion && (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">권역을 선택해주세요</p>
            <p className="text-sm text-slate-500 mt-1">지도에서 권역을 클릭하여 상세 정보를 확인하세요</p>
          </div>
        </div>
      )}
    </div>
  )
}

