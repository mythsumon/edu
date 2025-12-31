'use client'

import { Card } from 'antd'

interface ActivitySummaryCardProps {
  activityCode: string
  educationType: string
  institutionName: string
  grade: string
  class: string
  period: string
  totalApplicants?: number
  totalGraduates?: number
}

export function ActivitySummaryCard({
  activityCode,
  educationType,
  institutionName,
  grade,
  class: className,
  period,
  totalApplicants,
  totalGraduates,
}: ActivitySummaryCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <div className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
            {activityCode}
          </span>
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
            {educationType}
          </span>
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full">
            {grade}학년 {className}반
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-blue-600 leading-tight mb-3">{institutionName}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">교육 기간</span>
              <span className="text-slate-900 font-medium">{period}</span>
            </div>
            {totalApplicants !== undefined && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">총 신청자</span>
                  <span className="text-slate-900 font-medium">{totalApplicants}명</span>
                </div>
              </>
            )}
            {totalGraduates !== undefined && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">총 수료자</span>
                  <span className="text-slate-900 font-medium">{totalGraduates}명</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}





