'use client'

import { Card } from 'antd'

interface UserSummaryCardProps {
  userId: string
  name: string
  email: string
  role: string
  status: string
  department: string
  phone?: string
}

export function UserSummaryCard({
  userId,
  name,
  email,
  role,
  status,
  department,
  phone,
}: UserSummaryCardProps) {
  const roleStyle: Record<string, { bg: string; text: string }> = {
    관리자: { bg: 'bg-blue-100', text: 'text-blue-700' },
    운영자: { bg: 'bg-blue-100', text: 'text-blue-700' },
    사용자: { bg: 'bg-slate-100', text: 'text-slate-600' },
  }

  const statusStyle: Record<string, { bg: string; text: string }> = {
    활성: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
    비활성: { bg: 'bg-slate-100', text: 'text-slate-600' },
  }

  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <div className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
            {userId}
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
              roleStyle[role]?.bg || 'bg-slate-100'
            } ${roleStyle[role]?.text || 'text-slate-600'}`}
          >
            {role}
          </span>
          <span
            className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
              statusStyle[status]?.bg || 'bg-slate-100'
            } ${statusStyle[status]?.text || 'text-slate-600'}`}
          >
            {status}
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-blue-600 leading-tight mb-3">{name}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">이메일</span>
              <span className="text-slate-900 font-medium">{email}</span>
            </div>
            {phone && (
              <>
                <div className="h-4 w-px bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-500">전화번호</span>
                  <span className="text-slate-900 font-medium">{phone}</span>
                </div>
              </>
            )}
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">부서</span>
              <span className="text-slate-900 font-medium">{department}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}



