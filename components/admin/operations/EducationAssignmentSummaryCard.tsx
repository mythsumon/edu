'use client'

import { Card } from 'antd'

interface EducationAssignmentSummaryCardProps {
  educationId: string
  educationName: string
  institution: string
  region: string
  gradeClass: string
  period: string
  assignmentStatus: string
}

export function EducationAssignmentSummaryCard({
  educationId,
  educationName,
  institution,
  region,
  gradeClass,
  period,
  assignmentStatus,
}: EducationAssignmentSummaryCardProps) {
  const statusStyle: Record<string, { bg: string; text: string }> = {
    '배정 완료': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    '배정 중': { bg: 'bg-blue-100', text: 'text-blue-700' },
    '미배정': { bg: 'bg-slate-100', text: 'text-slate-600' },
    '부분 배정': { bg: 'bg-amber-100', text: 'text-amber-700' },
  }

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <div className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          {educationId && (
            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
              No. {educationId.replace('EDU-', '')}
            </span>
          )}
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
              (statusStyle[assignmentStatus]?.bg || 'bg-slate-100') + ' ' + (statusStyle[assignmentStatus]?.text || 'text-slate-600')
            }`}
          >
            {assignmentStatus}
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-blue-600 leading-tight mb-3">{educationName}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">기관</span>
              <span className="text-slate-900 font-medium">{institution}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">권역</span>
              <span className="text-slate-900 font-medium">{region}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">학년·학급</span>
              <span className="text-slate-900 font-medium">{gradeClass}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">기간</span>
              <span className="text-slate-900 font-medium">{period}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

