'use client'

import { type SpecialCategory } from '@/types/region'
import { RegionGrid } from './RegionGrid'
import { RegionMap } from './RegionMap'
import { SpecialItemCards } from './SpecialItemCards'

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
    <div className="bg-slate-50 rounded-2xl p-4 lg:p-5 border border-slate-200 shadow-sm relative">
      {/* Search Panel Label */}
      <div className="mb-4">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
          검색
        </span>
      </div>

      <div className="space-y-4">
        {/* Region Grid - Compact */}
        <div>
          <h2 className="text-xs font-semibold text-gray-700 mb-2">권역별 교육 진행 현황</h2>
          <RegionGrid 
            selectedRegion={selectedRegion} 
            onRegionSelect={(id) => {
              onRegionSelect(id)
              onCategorySelect(undefined as any)
            }} 
          />
        </div>

        {/* Region Map - Common between sections */}
        <div>
          <h2 className="text-xs font-semibold text-gray-700 mb-2">권역 지도</h2>
          <RegionMap 
            selectedRegion={selectedRegion} 
            onRegionSelect={(id) => {
              onRegionSelect(id)
              onCategorySelect(undefined as any)
            }} 
          />
        </div>

        {/* Special Items - Compact */}
        <div>
          <h3 className="text-xs font-semibold text-gray-700 mb-2">특수 항목별 세부조회</h3>
          <SpecialItemCards 
            selectedCategory={selectedSpecialCategory}
            onCategorySelect={(category) => {
              onCategorySelect(category)
              onRegionSelect(undefined as any)
            }}
          />
        </div>
      </div>
    </div>
  )
}

