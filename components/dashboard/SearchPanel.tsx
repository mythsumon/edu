'use client'

import { type SpecialCategory } from '@/types/region'
import { RegionMap } from './RegionMap'

interface SearchPanelProps {
  selectedRegion?: number
  selectedSpecialCategory?: SpecialCategory
  onRegionSelect: (region: number) => void
  onCategorySelect: (category: SpecialCategory) => void
  onReset?: () => void
}

export function SearchPanel({
  selectedRegion,
  selectedSpecialCategory,
  onRegionSelect,
  onCategorySelect,
  onReset,
}: SearchPanelProps) {

  return (
    <div className="bg-white rounded-card p-4 lg:p-5 border border-slate-200 shadow-card relative">
      {/* Search Panel Label */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
          검색
        </span>
      </div>

      <div className="space-y-4">
        {/* 6 Region Cards - Compact */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">권역별 교육 진행 현황</h3>
          <div className="grid grid-cols-2 gap-2">
            {[1, 2, 3, 4, 5, 6].map((regionNumber) => {
              const regionData = [
                { regionNumber: 1, progress: 60, educationProgress: 60, items: { 도서벽지: 10, '50차시': 50, 특수학급: 1000 } },
                { regionNumber: 2, progress: 75, educationProgress: 70, items: { 도서벽지: 15, '50차시': 60, 특수학급: 1200 } },
                { regionNumber: 3, progress: 45, educationProgress: 50, items: { 도서벽지: 8, '50차시': 40, 특수학급: 800 } },
                { regionNumber: 4, progress: 80, educationProgress: 75, items: { 도서벽지: 20, '50차시': 70, 특수학급: 1500 } },
                { regionNumber: 5, progress: 55, educationProgress: 55, items: { 도서벽지: 12, '50차시': 45, 특수학급: 900 } },
                { regionNumber: 6, progress: 70, educationProgress: 65, items: { 도서벽지: 18, '50차시': 55, 특수학급: 1100 } },
              ]
              const region = regionData.find(r => r.regionNumber === regionNumber)
              if (!region) return null

              const regionColor = regionNumber === 1 ? '#2563EB' :
                                 regionNumber === 2 ? '#F97316' :
                                 regionNumber === 3 ? '#EAB308' :
                                 regionNumber === 4 ? '#22C55E' :
                                 regionNumber === 5 ? '#A855F7' :
                                 '#14B8A6'

              return (
                <div
                  key={regionNumber}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    try {
                      onRegionSelect(regionNumber)
                      onCategorySelect(undefined as SpecialCategory)
                    } catch (error) {
                      console.error('Error selecting region:', error)
                    }
                  }}
                  className={`bg-white rounded-card shadow-sm border-2 p-2.5 cursor-pointer transition-all duration-200 hover:shadow-card-hover ${
                    selectedRegion === regionNumber ? 'border-primary shadow-card-hover bg-primary-light' : 'border-slate-100 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold" style={{ color: regionColor }}>
                      {regionNumber}권역
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-500 mb-1.5">교육: {region.educationProgress}%</div>
                  
                  {/* Circular Progress - Compact */}
                  <div className="flex justify-center mb-1.5">
                    <div className="relative w-10 h-10">
                      {(() => {
                        const radius = 16
                        const circumference = 2 * Math.PI * radius
                        const offset = circumference - (region.progress / 100) * circumference
                        return (
                          <svg className="transform -rotate-90 w-10 h-10">
                            <circle
                              cx="20"
                              cy="20"
                              r={radius}
                              stroke="#E5E7EB"
                              strokeWidth="3"
                              fill="none"
                            />
                            <circle
                              cx="20"
                              cy="20"
                              r={radius}
                              stroke={regionColor}
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray={circumference}
                              strokeDashoffset={offset}
                              strokeLinecap="round"
                            />
                          </svg>
                        )
                      })()}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-[10px] font-bold" style={{ color: regionColor }}>
                          {region.progress}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-0.5 text-[9px] text-gray-600">
                    <div>도서·벽지: {region.items.도서벽지}</div>
                    <div>50차시: {region.items['50차시']}</div>
                    <div>특수학급: {region.items.특수학급}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Region Map - Common between sections */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">권역 지도</h3>
          <RegionMap 
            selectedRegion={selectedRegion} 
            onRegionSelect={(id) => {
              try {
                onRegionSelect(id)
                onCategorySelect(undefined as SpecialCategory)
              } catch (error) {
                console.error('Error selecting region from map:', error)
              }
            }} 
          />
        </div>

        {/* Special Items - Compact */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">특수 항목별 세부조회</h3>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: '도서·벽지 진행률', category: '도서·벽지' as SpecialCategory, progress: 50, completed: 10, target: 20, color: '#F97316' },
              { label: '50차시 진행률', category: '50차시' as SpecialCategory, progress: 75, completed: 15, target: 20, color: '#22C55E' },
              { label: '특수학급 진행률', category: '특수학급' as SpecialCategory, progress: 60, completed: 12, target: 20, color: '#EC4899' },
            ].map((item) => (
              <div
                key={item.label}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  try {
                    onCategorySelect(item.category)
                    onRegionSelect(undefined as number)
                  } catch (error) {
                    console.error('Error selecting category:', error)
                  }
                }}
                className={`bg-white rounded-card shadow-sm border-2 p-2.5 cursor-pointer transition-all duration-200 hover:shadow-card-hover ${
                  selectedSpecialCategory === item.category ? 'border-primary shadow-card-hover bg-primary-light' : 'border-slate-100 hover:border-gray-300'
                }`}
              >
                <div className="mb-2">
                  <div className="text-xs text-gray-500 mb-0.5">{item.label}</div>
                  <div className="text-lg font-semibold text-gray-900 mb-0.5">{item.progress}%</div>
                  <div className="text-[10px] text-gray-600">목표 {item.target}개 중 {item.completed}개 완료</div>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${item.progress}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

