'use client'

import { type SpecialCategory } from '@/types/region'
import { RegionDetailView } from './RegionDetailView'
import { SpecialItemDetailView } from './SpecialItemDetailView'
import { MapDetailView } from './MapDetailView'

interface EnhancedResultPanelProps {
  searchType: 'region' | 'special' | 'map'
  selectedRegion?: number
  selectedSpecialCategory?: SpecialCategory
  onRegionChange: (regionId: number | undefined) => void
  onCategoryClose: () => void
  onCategorySelect?: (category: SpecialCategory | undefined) => void
}

export function EnhancedResultPanel({
  searchType,
  selectedRegion,
  selectedSpecialCategory,
  onRegionChange,
  onCategoryClose,
  onCategorySelect,
}: EnhancedResultPanelProps) {
  return (
    <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
      {searchType === 'region' && selectedRegion ? (
        <RegionDetailView
          selectedRegionId={selectedRegion}
          onRegionChange={onRegionChange}
          onCategorySelect={onCategorySelect}
        />
      ) : (searchType === 'special' || (searchType === 'map' && selectedSpecialCategory)) && selectedSpecialCategory ? (
        <SpecialItemDetailView
          selectedCategory={selectedSpecialCategory}
          onClose={onCategoryClose}
        />
      ) : searchType === 'map' ? (
        <MapDetailView
          selectedRegion={selectedRegion}
          selectedSpecialCategory={selectedSpecialCategory}
          onRegionSelect={onRegionChange}
          onCategorySelect={onCategorySelect}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-slate-600 font-medium">검색 조건을 선택해주세요</p>
            <p className="text-sm text-slate-500 mt-1">왼쪽 패널에서 권역 또는 항목을 선택하세요</p>
          </div>
        </div>
      )}
    </div>
  )
}

