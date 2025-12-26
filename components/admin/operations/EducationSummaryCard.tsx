'use client'

import { Card } from 'antd'

interface EducationSummaryCardProps {
  educationId: string
  name: string
  schoolName?: string
  institution: string
  period: string
  status: string
  badges?: Array<{ label: string; variant?: 'default' | 'warning' | 'info' }>
}

export function EducationSummaryCard({
  educationId,
  name,
  schoolName,
  institution,
  period,
  status,
  badges = [],
}: EducationSummaryCardProps) {
  const statusStyle: Record<string, { bg: string; text: string }> = {
    '신청 중': { bg: 'bg-blue-100', text: 'text-blue-700' },
    '신청 마감': { bg: 'bg-slate-100', text: 'text-slate-600' },
    '진행 중': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    '완료': { bg: 'bg-slate-100', text: 'text-slate-600' },
  }

  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <div className="space-y-4">
        {/* Badges Row */}
        {(badges.length > 0 || educationId) && (
          <div className="flex flex-wrap items-center gap-2">
            {educationId && (
              <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
                No. {educationId.replace('EDU-', '')}
              </span>
            )}
            {badges.map((badge, idx) => (
              <span
                key={idx}
                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                  badge.variant === 'warning'
                    ? 'text-amber-700 bg-amber-100'
                    : badge.variant === 'info'
                    ? 'text-blue-700 bg-blue-100'
                    : 'text-slate-700 bg-slate-100'
                }`}
              >
                {badge.label}
              </span>
            ))}
            <span
              className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                (statusStyle[status]?.bg || 'bg-slate-100') + ' ' + (statusStyle[status]?.text || 'text-slate-600')
              }`}
            >
              {status}
            </span>
          </div>
        )}

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-blue-600 leading-tight mb-3">{name}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            {schoolName && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">학교</span>
                  <span className="text-slate-900 font-medium">{schoolName}</span>
                </div>
                <div className="h-4 w-px bg-slate-200" />
              </>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">기관</span>
              <span className="text-slate-900 font-medium">{institution}</span>
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

