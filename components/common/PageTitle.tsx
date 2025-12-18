'use client'

import { ReactNode } from 'react'

interface PageTitleProps {
  title: string | ReactNode
  subtitle?: string | ReactNode
  actions?: ReactNode
  className?: string
  gradient?: boolean
}

export function PageTitle({ title, subtitle, actions, className = '', gradient = true }: PageTitleProps) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex-1 text-center">
          <h1 className={`text-2xl font-bold mb-1 ${gradient ? 'bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent' : 'text-gray-900'}`}>
            {title}
          </h1>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  )
}