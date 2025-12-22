'use client'

import { useState } from 'react'
import { RegionCard } from './RegionCard'

const regionData = [
  { regionNumber: 1, progress: 60, educationProgress: 60, items: { 도서벽지: 10, '50차시': 50, 특수학급: 1000 } },
  { regionNumber: 2, progress: 75, educationProgress: 70, items: { 도서벽지: 15, '50차시': 60, 특수학급: 1200 } },
  { regionNumber: 3, progress: 45, educationProgress: 50, items: { 도서벽지: 8, '50차시': 40, 특수학급: 800 } },
  { regionNumber: 4, progress: 80, educationProgress: 75, items: { 도서벽지: 20, '50차시': 70, 특수학급: 1500 } },
  { regionNumber: 5, progress: 55, educationProgress: 55, items: { 도서벽지: 12, '50차시': 45, 특수학급: 900 } },
  { regionNumber: 6, progress: 70, educationProgress: 65, items: { 도서벽지: 18, '50차시': 55, 특수학급: 1100 } },
]

export function RegionGrid({ selectedRegion, onRegionSelect }: { selectedRegion?: number; onRegionSelect: (region: number) => void }) {
  return (
    <div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
        {regionData.map((region) => (
          <RegionCard
            key={region.regionNumber}
            region={{
              id: `region${region.regionNumber}`,
              name: region.name,
              totalCount: 0,
              completedCount: 0,
              inProgressCount: 0,
              notStartedCount: 0,
              progress: region.progress,
              institutions: []
            }}
            isSelected={selectedRegion === region.regionNumber}
            onSelect={() => onRegionSelect(region.regionNumber)}
          />
        ))}
      </div>
    </div>
  )
}

