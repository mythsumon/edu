'use client'

import { Card } from 'antd'

interface EquipmentSummaryCardProps {
  assignmentNumber: string
  courseName: string
  institution: string
  educationDate: string
  instructorName: string
  currentSession?: number
  totalSessions?: number
}

export function EquipmentSummaryCard({
  assignmentNumber,
  courseName,
  institution,
  educationDate,
  instructorName,
  currentSession,
  totalSessions,
}: EquipmentSummaryCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <div className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
            {assignmentNumber}
          </span>
          {currentSession !== undefined && totalSessions !== undefined && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
              {currentSession}/{totalSessions}차시
            </span>
          )}
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-blue-600 leading-tight mb-3">{courseName}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">교육기관</span>
              <span className="text-slate-900 font-medium">{institution}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">교육일자</span>
              <span className="text-slate-900 font-medium">{educationDate}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">담당 강사</span>
              <span className="text-slate-900 font-medium">{instructorName}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}




