'use client'

import { Check } from 'lucide-react'

interface RegionCardProps {
  region: {
    id: string
    name: string
    totalCount: number
    completedCount: number
    inProgressCount: number
    notStartedCount: number
    progress: number
    institutions: {
      id: string
      name: string
      progress: number
    }[]
  }
  isSelected?: boolean
  onSelect?: () => void
}

const regionColors = {
  1: 'text-region-1',
  2: 'text-region-2',
  3: 'text-region-3',
  4: 'text-region-4',
  5: 'text-region-5',
  6: 'text-region-6',
}

const regionBorderColors = {
  1: 'border-region-1',
  2: 'border-region-2',
  3: 'border-region-3',
  4: 'border-region-4',
  5: 'border-region-5',
  6: 'border-region-6',
}

export function RegionCard({
  region,
  isSelected = false,
  onSelect,
}: RegionCardProps) {
  // Safety check for undefined region
  if (!region) {
    return null
  }

  // Extract region number from name (e.g., "1권역" -> 1)
  const regionNumber = parseInt(region.name.charAt(0))
  const radius = 20 // Smaller radius for compact version
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (region.progress / 100) * circumference

  return (
    <div
      onClick={onSelect}
      className={`bg-white rounded-card shadow-sm border border-slate-100 p-2 hover:shadow-card-hover transition-all duration-200 cursor-pointer border-2 ${
        isSelected ? 'border-primary shadow-card-hover bg-primary-light' : 'border-slate-100 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold ${regionColors[regionNumber as keyof typeof regionColors]}`}>
          {region.name}
        </span>
        {isSelected && (
          <div className={`${regionColors[regionNumber as keyof typeof regionColors]}`}>
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>

      <div className="text-[10px] text-gray-500 mb-1.5">교육: {region.progress.toFixed(1)}%</div>

      {/* Circular Progress - Compact */}
      <div className="flex justify-center mb-1.5">
        <div className="relative w-12 h-12">
          <svg className="transform -rotate-90 w-12 h-12">
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="4"
              fill="none"
            />
            <circle
              cx="24"
              cy="24"
              r={radius}
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={regionColors[regionNumber as keyof typeof regionColors]}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xs font-semibold ${regionColors[regionNumber as keyof typeof regionColors]}`}>
              {region.progress.toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Items - Compact */}
      <div className="space-y-0.5 text-[10px] text-gray-600">
        <div>총 교육: {region.totalCount}</div>
        <div>완료: {region.completedCount}</div>
        <div>진행 중: {region.inProgressCount}</div>
      </div>
    </div>
  )
}