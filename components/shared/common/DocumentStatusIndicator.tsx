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
        icon: <FileX className="w-4 h-4" />,
        text: '❌',
        color: 'text-gray-400',
        bgColor: 'bg-gray-50',
      }
    }
    if (status === 'APPROVED') {
      return {
        icon: <CheckCircle2 className="w-4 h-4" />,
        text: '✅',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      }
    }
    if (status === 'REJECTED') {
      return {
        icon: <XCircle className="w-4 h-4" />,
        text: '⚠️',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      }
    }
    // SUBMITTED
    return {
      icon: <AlertCircle className="w-4 h-4" />,
      text: '⚠️',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    }
  }

  const display = getStatusDisplay()
  const isClickable = onClick !== undefined

  return (
    <div 
      className={`flex items-center gap-2 ${isClickable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
      onClick={onClick}
    >
      <span className="text-sm">{display.text}</span>
      <span className={`text-sm font-medium ${isClickable ? 'text-blue-600 hover:underline' : 'text-gray-700'}`}>
        {label}
      </span>
      {count > 0 && (
        <span className={`text-xs px-2 py-0.5 rounded-full ${display.bgColor} ${display.color}`}>
          {count}
        </span>
      )}
    </div>
  )
}

