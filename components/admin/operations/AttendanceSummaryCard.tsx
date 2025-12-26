'use client'

import { Card } from 'antd'

interface AttendanceSummaryCardProps {
  attendanceCode: string
  programName: string
  institutionName: string
  grade: string
  class: string
  totalApplicants?: number
  totalGraduates?: number
}

export function AttendanceSummaryCard({
  attendanceCode,
  programName,
  institutionName,
  grade,
  class: className,
  totalApplicants,
  totalGraduates,
}: AttendanceSummaryCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <div className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
            {attendanceCode}
          </span>
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
            {grade}학년 {className}반
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-blue-600 leading-tight mb-3">{programName}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">교육기관</span>
              <span className="text-slate-900 font-medium">{institutionName}</span>
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

