'use client'

import { Check } from 'lucide-react'

interface RegionCardProps {
  regionNumber: number
  progress: number
  educationProgress: number
  items: {
    도서벽지: number
    '50차시': number
    특수학급: number
  }
  isSelected?: boolean
  onClick?: () => void
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
  regionNumber,
  progress,
  educationProgress,
  items,
  isSelected = false,
  onClick,
}: RegionCardProps) {
  const radius = 20 // Smaller radius for compact version
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-100 p-2 hover:shadow-md transition-all cursor-pointer border-2 ${
        isSelected ? 'border-primary shadow-md bg-blue-50' : 'border-slate-100 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <span className={`text-xs font-semibold ${regionColors[regionNumber as keyof typeof regionColors]}`}>
          {regionNumber}권역
        </span>
        {isSelected && (
          <div className={`${regionColors[regionNumber as keyof typeof regionColors]}`}>
            <Check className="w-3 h-3" />
          </div>
        )}
      </div>

      <div className="text-[10px] text-gray-500 mb-1.5">교육: {educationProgress}%</div>

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
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Items - Compact */}
      <div className="space-y-0.5 text-[10px] text-gray-600">
        <div>도서·벽지: {items.도서벽지}</div>
        <div>50차시: {items['50차시']}</div>
        <div>특수학급: {items.특수학급}</div>
      </div>
    </div>
  )
}

