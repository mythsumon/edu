'use client'

import { Card } from 'antd'

interface InstructorSummaryCardProps {
  instructorId: string
  name: string
  account: string
  status: string
  registeredAt: string
}

export function InstructorSummaryCard({
  instructorId,
  name,
  account,
  status,
  registeredAt,
}: InstructorSummaryCardProps) {
  const statusStyle: Record<string, { bg: string; text: string }> = {
    '활성': { bg: 'bg-blue-100', text: 'text-blue-700' },
    '비활성': { bg: 'bg-red-100', text: 'text-red-700' },
  }

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <div className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
            No. {instructorId.replace('INST-', '')}
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
          <h2 className="text-xl font-semibold text-blue-600 leading-tight mb-3">{name}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">계정</span>
              <span className="text-slate-900 font-medium">{account}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">등록일시</span>
              <span className="text-slate-900 font-medium">{registeredAt}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}


