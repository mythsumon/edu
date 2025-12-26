'use client'

import { Card } from 'antd'
import { CheckCircle2, XCircle } from 'lucide-react'

interface InstructorConfirmationSummaryCardProps {
  instructorId: string
  instructorName: string
  educationName: string
  status: 'active' | 'pending' | 'inactive'
  assignedLessons: number
  availableLessons: number
  joinDate: string
}

export function InstructorConfirmationSummaryCard({
  instructorId,
  instructorName,
  educationName,
  status,
  assignedLessons,
  availableLessons,
  joinDate,
}: InstructorConfirmationSummaryCardProps) {
  const statusStyle: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    active: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      icon: <CheckCircle2 className="w-3 h-3" />,
    },
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      icon: <XCircle className="w-3 h-3" />,
    },
    inactive: {
      bg: 'bg-gray-100',
      text: 'text-gray-700',
      icon: <XCircle className="w-3 h-3" />,
    },
  }

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <div className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
            {instructorId}
          </span>
          <span
            className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
              statusStyle[status].bg
            } ${statusStyle[status].text}`}
          >
            {statusStyle[status].icon}
            <span className="ml-1">
              {status === 'active' ? '활성' : status === 'pending' ? '대기 중' : '비활성'}
            </span>
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-blue-600 leading-tight mb-3">{instructorName}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">교육명</span>
              <span className="text-slate-900 font-medium">{educationName}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">배정된 수업</span>
              <span className="text-slate-900 font-medium">{assignedLessons}개</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">가능한 수업</span>
              <span className="text-slate-900 font-medium">{availableLessons}개</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">가입일</span>
              <span className="text-slate-900 font-medium">{joinDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

