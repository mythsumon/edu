/**
 * RegionAssignmentMap 사용 예시
 */

import { RegionAssignmentMap } from './RegionAssignmentMap'
import { useState } from 'react'

export function RegionAssignmentMapExample() {
  const [selectedRegionIds, setSelectedRegionIds] = useState<number[]>([])

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">권역 선택</h2>
      
      {/* PARTIAL 모드: 개별 권역 선택 가능 */}
      <RegionAssignmentMap
        mode="PARTIAL"
        value={selectedRegionIds}
        onChange={setSelectedRegionIds}
        className="mb-4"
      />

      <div className="mt-4">
        <p>선택된 권역 ID: {selectedRegionIds.join(', ')}</p>
      </div>

      {/* FULL 모드: 모든 권역 자동 선택 */}
      <RegionAssignmentMap
        mode="FULL"
        value={[]}
        onChange={(ids) => console.log('FULL mode selected:', ids)}
        className="mt-8"
      />
    </div>
  )
}
