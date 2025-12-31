'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ChartCard } from './ChartCard'

interface ReviewDataPoint {
  status: string
  pending: number
  approved: number
  rejected: number
}

interface EvidenceReviewChartProps {
  data: ReviewDataPoint[]
  loading?: boolean
}

export function EvidenceReviewChart({ data, loading = false }: EvidenceReviewChartProps) {
  return (
    <ChartCard title="증빙 검토 현황" loading={loading}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorPending" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="status" 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="square"
            />
            <Bar dataKey="pending" fill="url(#colorPending)" name="대기" radius={[8, 8, 0, 0]} />
            <Bar dataKey="approved" fill="url(#colorApproved)" name="승인" radius={[8, 8, 0, 0]} />
            <Bar dataKey="rejected" fill="url(#colorRejected)" name="거절" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

