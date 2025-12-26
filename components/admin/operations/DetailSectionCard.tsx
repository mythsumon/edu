'use client'

import { Card } from 'antd'
import { ReactNode } from 'react'

interface DetailSectionCardProps {
  title: string
  helperText?: string
  children: ReactNode
  className?: string
}

export function DetailSectionCard({ title, helperText, children, className = '' }: DetailSectionCardProps) {
  return (
    <Card className={`rounded-2xl border border-gray-200 shadow-sm ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-900 border-b-2 border-blue-500 pb-2 inline-block">{title}</h3>
          {helperText && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
        </div>

        {/* Content */}
        <div className="px-6 pb-6">{children}</div>
      </div>
    </Card>
  )
}

