'use client'

import { ReactNode } from 'react'

interface DefinitionItem {
  label: string
  value: ReactNode
  span?: number // 1 or 2 for grid span
}

interface DefinitionListGridProps {
  items: DefinitionItem[]
  columns?: 1 | 2
}

export function DefinitionListGrid({ items, columns = 2 }: DefinitionListGridProps) {
  return (
    <div className={`grid grid-cols-1 ${columns === 2 ? 'md:grid-cols-2' : ''} gap-x-8 gap-y-5`}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`space-y-1 ${item.span === 2 || (columns === 2 && idx === items.length - 1 && items.length % 2 === 1) ? 'md:col-span-2' : ''}`}
        >
          <div className="text-sm text-slate-500 font-medium">{item.label}</div>
          <div className="text-sm text-slate-900 font-medium">{item.value}</div>
        </div>
      ))}
    </div>
  )
}


