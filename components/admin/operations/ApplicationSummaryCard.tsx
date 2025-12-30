'use client'

import { Card } from 'antd'

interface ApplicationSummaryCardProps {
  educationId: string
  educationName: string
  institution: string
  region: string
  gradeClass: string
  role: string
  applicationDate: string
  status: '수락됨' | '거절됨' | '대기'
}

export function ApplicationSummaryCard({
  educationId,
  educationName,
  institution,
  region,
  gradeClass,
  role,
  applicationDate,
  status,
}: ApplicationSummaryCardProps) {
  const statusStyle: Record<string, { bg: string; text: string }> = {
    '수락됨': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    '거절됨': { bg: 'bg-red-100', text: 'text-red-700' },
    '대기': { bg: 'bg-amber-100', text: 'text-amber-700' },
  }

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <div className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
            {educationId}
          </span>
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
            {role}
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
              (statusStyle[status]?.bg || 'bg-slate-100') + ' ' + (statusStyle[status]?.text || 'text-slate-600')
            }`}
          >
            {status}
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-blue-600 leading-tight mb-3">{educationName}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">교육기관</span>
              <span className="text-slate-900 font-medium">{institution}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">구역</span>
              <span className="text-slate-900 font-medium">{region}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">학년·반</span>
              <span className="text-slate-900 font-medium">{gradeClass}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">신청일</span>
              <span className="text-slate-900 font-medium">{applicationDate}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}





