'use client'

import { type SpecialCategory } from '@/types/region'

interface SpecialItemCardProps {
  label: string
  category: SpecialCategory
  progress: number
  completed: number
  target: number
  color: string
  isSelected?: boolean
  onClick: () => void
}

function SpecialItemCard({ label, progress, completed, target, color, isSelected, onClick }: SpecialItemCardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl shadow-sm border border-slate-100 p-2.5 cursor-pointer transition-all hover:shadow-md border-2 ${
        isSelected ? 'border-primary shadow-md bg-blue-50' : 'border-slate-100 hover:border-gray-300'
      }`}
    >
      <div className="mb-2">
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div className="text-lg font-semibold text-gray-900 mb-0.5">{progress}%</div>
        <div className="text-[10px] text-gray-600">목표 {target}개 중 {completed}개 완료</div>
      </div>
      
      {/* Progress Bar - Compact */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  )
}

interface SpecialItemCardsProps {
  selectedCategory?: SpecialCategory
  onCategorySelect: (category: SpecialCategory) => void
}

export function SpecialItemCards({ selectedCategory, onCategorySelect }: SpecialItemCardsProps) {
  const items = [
    {
      label: '도서·벽지 진행률',
      category: '도서·벽지' as SpecialCategory,
      progress: 50,
      completed: 10,
      target: 20,
      color: '#F97316', // orange
    },
    {
      label: '50차시 진행률',
      category: '50차시' as SpecialCategory,
      progress: 75,
      completed: 15,
      target: 20,
      color: '#22C55E', // green
    },
    {
      label: '특수학급 진행률',
      category: '특수학급' as SpecialCategory,
      progress: 60,
      completed: 12,
      target: 20,
      color: '#EC4899', // pink
    },
  ]

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <SpecialItemCard
          key={item.label}
          {...item}
          isSelected={selectedCategory === item.category}
          onClick={() => onCategorySelect(item.category)}
        />
      ))}
    </div>
  )
}

