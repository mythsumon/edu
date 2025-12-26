'use client'

import { Card } from 'antd'

interface InstitutionSummaryCardProps {
  institutionId: string
  name: string
  region: string
  address: string
  phone: string
  manager: string
}

export function InstitutionSummaryCard({
  institutionId,
  name,
  region,
  address,
  phone,
  manager,
}: InstitutionSummaryCardProps) {
  return (
    <Card className="rounded-2xl border border-gray-200 shadow-sm">
      <div className="space-y-4">
        {/* Badges Row */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full">
            {institutionId}
          </span>
          <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full">
            {region}
          </span>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl font-semibold text-blue-600 leading-tight mb-3">{name}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">주소</span>
              <span className="text-slate-900 font-medium">{address}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">전화번호</span>
              <span className="text-slate-900 font-medium">{phone}</span>
            </div>
            <div className="h-4 w-px bg-slate-200" />
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500">담당자</span>
              <span className="text-slate-900 font-medium">{manager}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}


