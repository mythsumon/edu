'use client'

import React from 'react'
import { CheckCircle2, AlertCircle, XCircle, FileX, Clock, PauseCircle } from 'lucide-react'

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
    // 미작성: X 표시 (status가 없고 documentId도 없을 때)
    if (!status && !documentId) {
      return {
        icon: <XCircle className="w-3.5 h-3.5" />,
        text: '✗',
        color: 'text-gray-500',
        bgColor: 'bg-gray-50',
      }
    }
    // 작성중: ⏳ (DRAFT 상태이거나 documentId가 있지만 아직 제출 전)
    if (!status || status === 'DRAFT') {
      return {
        icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
        text: '⏳',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      }
    }
    // 통과: 초록색 체크마크
    if (status === 'APPROVED') {
      return {
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        text: '✓',
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
      }
    }
    // 반려: ! 표시
    if (status === 'REJECTED') {
      return {
        icon: <AlertCircle className="w-3.5 h-3.5 text-red-600" />,
        text: '!',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      }
    }
    // 작성완료(검토 대기중): ⏸️ 또는 ⏱️
    // SUBMITTED
    return {
      icon: <PauseCircle className="w-3.5 h-3.5 text-blue-600" />,
      text: '⏸',
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
      <span className={`text-sm font-semibold ${display.color}`}>{display.text}</span>
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

