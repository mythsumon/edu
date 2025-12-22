'use client'

import { Check } from 'lucide-react'

interface RegionCardLargeProps {
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

export function RegionCardLarge({
  regionNumber,
  progress,
  educationProgress,
  items,
  isSelected = false,
  onClick,
}: RegionCardLargeProps) {
  const radius = 40 // Larger radius for big card version
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-card shadow-card border border-slate-100 p-6 hover:shadow-card-hover transition-all duration-200 cursor-pointer border-2 ${
        isSelected ? 'border-primary shadow-card-hover bg-primary-light' : 'border-slate-100 hover:border-gray-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className={`text-lg font-bold ${regionColors[regionNumber as keyof typeof regionColors]}`}>
          {regionNumber}권역
        </span>
        {isSelected && (
          <div className={`${regionColors[regionNumber as keyof typeof regionColors]}`}>
            <Check className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="text-sm text-gray-500 mb-4">교육: {educationProgress}%</div>

      {/* Circular Progress - Large */}
      <div className="flex justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="transform -rotate-90 w-24 h-24">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="currentColor"
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className={regionColors[regionNumber as keyof typeof regionColors]}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-xl font-bold ${regionColors[regionNumber as keyof typeof regionColors]}`}>
              {progress}%
            </span>
          </div>
        </div>
      </div>

      {/* Items - Large */}
      <div className="space-y-1 text-sm text-gray-600">
        <div>도서·벽지: {items.도서벽지}</div>
        <div>50차시: {items['50차시']}</div>
        <div>특수학급: {items.특수학급}</div>
      </div>
    </div>
  )
}

