'use client'

import { RegionMap } from './RegionMap'
import { REGIONS, type SpecialCategory } from '@/types/region'

interface MapDetailViewProps {
  selectedRegion?: number
  selectedSpecialCategory?: SpecialCategory
  onRegionSelect: (regionId: number | undefined) => void
  onCategorySelect?: (category: SpecialCategory | undefined) => void
}

export function MapDetailView({
  selectedRegion,
  selectedSpecialCategory,
  onRegionSelect,
  onCategorySelect,
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


  if (!selectedRegionData) {
  return (
    <div className="flex flex-col h-full">
        {/* Map Section */}
      <div className="px-8 py-6 border-b border-slate-200 bg-white">
        <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
          <RegionMap 
            selectedRegion={selectedRegion} 
            onRegionSelect={onRegionSelect} 
          />
        </div>
      </div>

        {/* Empty State */}
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
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Region Tabs and Special Category Selection - Top */}
      <div className="px-4 lg:px-6 pt-4 lg:pt-6 pb-4 border-b border-gray-200 space-y-4">
        {/* Region Tabs */}
        <div>
          <div className="flex gap-2 flex-wrap">
            {REGIONS.map((r) => (
              <button
                key={r.id}
                onClick={() => onRegionSelect(r.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedRegion === r.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={
                  selectedRegion === r.id
                    ? { backgroundColor: r.color, color: 'white' }
                    : undefined
                }
              >
                {r.name}
              </button>
            ))}
          </div>
        </div>

        {/* Special Category Selection */}
        {onCategorySelect && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              특수 항목 선택
            </label>
            <div className="flex gap-2 flex-wrap">
              {[
                { category: '도서·벽지' as SpecialCategory, color: '#F97316' },
                { category: '50차시' as SpecialCategory, color: '#22C55E' },
                { category: '특수학급' as SpecialCategory, color: '#3B82F6' },
              ].map((item) => {
                const isSelected = selectedSpecialCategory === item.category
                
                return (
                  <button
                    key={item.category}
                    onClick={() => onCategorySelect(isSelected ? undefined : item.category)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-50 border-2 text-blue-700'
                        : 'bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                    style={isSelected ? { borderColor: item.color } : {}}
                  >
                    {item.category}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Parallel Layout: Map (Left) and Data (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 p-4 lg:p-6 overflow-hidden">
        {/* Left: Map Section */}
        <div className="lg:w-1/2 flex-shrink-0">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 h-full flex items-center justify-center">
            <RegionMap 
              selectedRegion={selectedRegion} 
              onRegionSelect={onRegionSelect} 
            />
          </div>
        </div>

        {/* Right: Data Section */}
        <div className="lg:w-1/2 flex-1 overflow-y-auto">
          {/* Title and Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-slate-900">{selectedRegionData.name} 교육 진행 현황</h3>
              <span className="text-2xl font-semibold" style={{ color: color.bg }}>
                {selectedRegionData.educationPercent}%
              </span>
            </div>
            <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${selectedRegionData.educationPercent}%`,
                  backgroundColor: color.bg,
                }}
              />
            </div>
          </div>

          {/* 자치단체 Table */}
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
              자치단체별 현황
            </h4>
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">자치단체</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">교육기관수</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">학급</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">학생수</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">도서·벽지</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">50차시</th>
                      <th className="px-4 py-3.5 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">특수학급</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-100">
                    {selectedRegionData.locals.map((local, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3.5 text-sm font-medium text-slate-900">{local.name}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{local.institutions}개</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{local.classes}개</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700">{local.students}명</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{local.bookWall}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{local.fiftyHours}</td>
                        <td className="px-4 py-3.5 text-sm text-slate-700 font-medium">{local.specialClass}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Summary Table - Redesigned */}
          <div>
            <h4 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <div className="w-1 h-5 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
              요약
            </h4>
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden">
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
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{selectedRegionData.summary.percent}%</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">도서·벽지</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{selectedRegionData.summary.bookWall}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">50차시</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{selectedRegionData.summary.fiftyHours}</td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">특수학급</td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900">{selectedRegionData.summary.specialClass}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

