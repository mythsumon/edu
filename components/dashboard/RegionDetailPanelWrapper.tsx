'use client'

import { RegionDetailPanel } from './RegionDetailPanel'

interface RegionDetailPanelWrapperProps {
  selectedRegionId: number
  onRegionChange: (regionId: number) => void
}

export function RegionDetailPanelWrapper({ selectedRegionId, onRegionChange }: RegionDetailPanelWrapperProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <RegionDetailPanel 
          selectedRegionId={selectedRegionId} 
          onRegionChange={onRegionChange}
        />
      </div>
    </div>
  )
}
