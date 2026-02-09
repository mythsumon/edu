'use client'

import { type SpecialCategory } from '@/types/region'
import { RegionDetailPanel } from './RegionDetailPanel'
import { SpecialItemDetailPanel } from './SpecialItemDetailPanel'
import { SpecialItemDefaultView } from './SpecialItemDefaultView'

interface ResultPanelProps {
  selectedRegion?: number
  selectedSpecialCategory?: SpecialCategory
  onRegionChange: (regionId: number | undefined) => void
  onCategoryClose: () => void
  onCategorySelect?: (category: SpecialCategory | undefined) => void
}

export function ResultPanel({
  selectedRegion,
  selectedSpecialCategory,
  onRegionChange,
  onCategoryClose,
  onCategorySelect,
}: ResultPanelProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-slate-200 flex flex-col h-full min-h-[600px]">
      {/* Result Panel Label */}
      <div className="flex items-center justify-between p-4 lg:p-6 shrink-0 border-b border-gray-200 bg-gray-50">
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
          조회 결과
        </span>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedRegion ? (
          <div className="h-full">
            <RegionDetailPanel
              selectedRegionId={selectedRegion}
              onRegionChange={(id) => onRegionChange(id)}
              onCategorySelect={onCategorySelect}
            />
          </div>
        ) : selectedSpecialCategory ? (
          <div className="h-full">
            <SpecialItemDetailPanel
              selectedCategory={selectedSpecialCategory}
              onClose={onCategoryClose}
            />
          </div>
        ) : (
          <div className="h-full">
            <SpecialItemDefaultView />
          </div>
        )}
      </div>
    </div>
  )
}

