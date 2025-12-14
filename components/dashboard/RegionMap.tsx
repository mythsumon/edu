'use client'

import { useState } from 'react'

interface RegionMapProps {
  selectedRegion?: number
  onRegionSelect: (region: number) => void
}

const regionColors = {
  1: '#2563EB',
  2: '#F97316',
  3: '#EAB308',
  4: '#22C55E',
  5: '#A855F7',
  6: '#14B8A6',
}

const regionData = [
  { id: 1, name: '1권역', progress: 60, institutions: 35, students: 780 },
  { id: 2, name: '2권역', progress: 75, institutions: 42, students: 920 },
  { id: 3, name: '3권역', progress: 45, institutions: 28, students: 650 },
  { id: 4, name: '4권역', progress: 80, institutions: 50, students: 1100 },
  { id: 5, name: '5권역', progress: 55, institutions: 32, students: 720 },
  { id: 6, name: '6권역', progress: 70, institutions: 38, students: 850 },
]

export function RegionMap({ selectedRegion, onRegionSelect }: RegionMapProps) {
  const [hoveredRegion, setHoveredRegion] = useState<number | null>(null)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-2 h-full">
      <div className="relative">
        {/* Simplified map representation - Compact */}
        <svg viewBox="0 0 400 300" className="w-full h-auto">
          {/* 경기도 outline */}
          <path
            d="M 50 50 L 150 40 L 250 60 L 350 80 L 300 150 L 200 200 L 100 180 L 50 120 Z"
            fill="#F3F4F6"
            stroke="#D1D5DB"
            strokeWidth="2"
          />
          
          {/* Region areas - simplified representation */}
          {regionData.map((region, index) => {
            const x = 50 + (index % 3) * 120
            const y = 50 + Math.floor(index / 3) * 100
            const isSelected = selectedRegion === region.id
            const isHovered = hoveredRegion === region.id
            
            return (
              <g key={region.id}>
                <circle
                  cx={x}
                  cy={y}
                  r={isSelected ? 25 : isHovered ? 23 : 20}
                  fill={regionColors[region.id as keyof typeof regionColors]}
                  fillOpacity={isSelected ? 0.8 : isHovered ? 0.7 : 0.6}
                  stroke={isSelected ? '#2563EB' : 'transparent'}
                  strokeWidth={isSelected ? 3 : 0}
                  className="cursor-pointer transition-all"
                  onMouseEnter={() => setHoveredRegion(region.id)}
                  onMouseLeave={() => setHoveredRegion(null)}
                  onClick={() => onRegionSelect(region.id)}
                />
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs font-semibold fill-white pointer-events-none"
                >
                  {region.id}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Tooltip - Compact */}
        {hoveredRegion && (
          <div
            className="absolute bg-white rounded-lg shadow-lg p-2 border border-gray-200 z-10 min-w-[150px]"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="font-semibold text-xs text-gray-900 mb-1">
              {regionData.find((r) => r.id === hoveredRegion)?.name}
            </div>
            <div className="text-[10px] text-gray-600 space-y-0.5">
              <div>진행률: {regionData.find((r) => r.id === hoveredRegion)?.progress}%</div>
              <div>교육기관: {regionData.find((r) => r.id === hoveredRegion)?.institutions}개</div>
              <div>학생수: {regionData.find((r) => r.id === hoveredRegion)?.students}명</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

