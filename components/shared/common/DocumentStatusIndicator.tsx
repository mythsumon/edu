'use client'

import React from 'react'
import { CheckCircle2, AlertCircle, XCircle, FileX } from 'lucide-react'

interface DocumentStatusIndicatorProps {
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  count?: number
  label: string
  onClick?: () => void
  educationId?: string
  documentId?: string
}

export const DocumentStatusIndicator: React.FC<DocumentStatusIndicatorProps> = ({
  status,
  count = 0,
  label,
  onClick,
  educationId,
  documentId,
}) => {
  const getStatusDisplay = () => {
    if (!status || status === 'DRAFT') {
      return {
        icon: <FileX className="w-3 h-3" />,
        text: '❌',
        color: 'text-gray-400',
        bgColor: 'bg-gray-50',
      }
    }
    if (status === 'APPROVED') {
      return {
        icon: <CheckCircle2 className="w-3 h-3" />,
        text: '✅',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      }
    }
    if (status === 'REJECTED') {
      return {
        icon: <XCircle className="w-3 h-3" />,
        text: '⚠️',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      }
    }
    // SUBMITTED
    return {
      icon: <AlertCircle className="w-3 h-3" />,
      text: '⚠️',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    }
  }

  const display = getStatusDisplay()
  const isClickable = onClick !== undefined

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      e.stopPropagation()
      onClick()
    }
  }

  return (
    <div 
      className={`flex items-center gap-1.5 ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={handleClick}
    >
      <span className="text-xs">{display.text}</span>
      <span className={`text-xs font-medium ${isClickable ? 'text-blue-600 hover:underline' : 'text-gray-700'}`}>
        {label}
      </span>
      {count > 0 && (
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${display.bgColor} ${display.color}`}>
          {count}
        </span>
      )}
    </div>
  )
}

