'use client'

interface SpecialItem {
  id: string
  name: string
  totalCount: number
  completedCount: number
  inProgressCount: number
  notStartedCount: number
  progress: number
  target: string
}

interface SpecialItemCardProps {
  item: SpecialItem
  isSelected?: boolean
  onClick: () => void
}

function SpecialItemCard({ item, isSelected, onClick }: SpecialItemCardProps) {
  // Calculate progress percentage for display
  const progress = item.progress
  
  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-card shadow-sm border border-slate-100 p-2.5 cursor-pointer transition-all duration-200 hover:shadow-card-hover border-2 ${
        isSelected ? 'border-primary shadow-card-hover bg-primary-light' : 'border-slate-100 hover:border-gray-300'
      }`}
    >
      <div className="mb-2">
        <div className="text-xs text-gray-500 mb-0.5">{item.name}</div>
        <div className="text-lg font-semibold text-gray-900 mb-0.5">{progress.toFixed(0)}%</div>
        <div className="text-[10px] text-gray-600">목표 {item.totalCount}개 중 {item.completedCount}개 완료</div>
      </div>
      
      {/* Progress Bar - Compact */}
      <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            backgroundColor: '#2563EB', // blue
          }}
        />
      </div>
    </div>
  )
}

interface SpecialItemCardsProps {
  items: SpecialItem[]
  selectedItemId?: string
  onSelect: (id: string) => void
}

export function SpecialItemCards({ items = [], selectedItemId, onSelect }: SpecialItemCardsProps) {
  // Safety check: if items is undefined or not an array, return empty div
  if (!items || !Array.isArray(items) || items.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        <div className="text-sm text-gray-500 text-center py-4">데이터가 없습니다.</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <SpecialItemCard
          key={item.id}
          item={item}
          isSelected={selectedItemId === item.id}
          onClick={() => onSelect(item.id)}
        />
      ))}
    </div>
  )
}