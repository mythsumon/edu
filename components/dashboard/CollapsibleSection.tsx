'use client'

import { useState, ReactNode } from 'react'
import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  children: ReactNode
  defaultExpanded?: boolean
  className?: string
}

export function CollapsibleSection({ 
  title, 
  children, 
  defaultExpanded = true,
  className = ''
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={className}>
      <div className="w-full flex items-center justify-between p-5 bg-white rounded-card shadow-card mb-6 border border-gray-100">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-between hover:opacity-80 transition-opacity"
        >
          <h2 className="text-[20px] font-bold text-gray-900">{title}</h2>
          <div className={`flex items-center gap-2 transition-transform duration-200 ${isExpanded ? 'rotate-0' : ''}`}>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setIsExpanded(false)
          }}
          className="ml-4 p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="섹션 닫기"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      {isExpanded && (
        <div className="overflow-hidden transition-all duration-300 ease-in-out">
          <div className="bg-white rounded-card shadow-card p-6 border border-gray-200">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

