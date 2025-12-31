'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ChartCard } from './ChartCard'

interface TrendDataPoint {
  date: string
  assignments: number
  applications: number
}

interface AssignmentsTrendChartProps {
  data: TrendDataPoint[]
  loading?: boolean
}

export function AssignmentsTrendChart({ data, loading = false }: AssignmentsTrendChartProps) {
  return (
    <ChartCard title="배정 추이" loading={loading}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorApplications" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="date" 
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
              cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '5 5' }}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            <Line 
              type="monotone" 
              dataKey="assignments" 
              stroke="#3b82f6" 
              strokeWidth={3}
              name="배정"
              dot={{ fill: '#3b82f6', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7 }}
            />
            <Line 
              type="monotone" 
              dataKey="applications" 
              stroke="#10b981" 
              strokeWidth={3}
              name="신청"
              dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

