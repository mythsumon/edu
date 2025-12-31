'use client'

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ChartCard } from './ChartCard'

interface MonthlyTrendData {
  month: string
  programs: number
  classes: number
}

interface MonthlyProgramTrendChartProps {
  data: MonthlyTrendData[]
  loading?: boolean
}

export function MonthlyProgramTrendChart({ data, loading = false }: MonthlyProgramTrendChartProps) {
  return (
    <ChartCard title="교육 프로그램 월별 추이" loading={loading}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorPrograms" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorClasses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="month" 
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
              iconType="square"
            />
            <Area 
              type="monotone" 
              dataKey="programs" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fill="url(#colorPrograms)"
              name="프로그램 수"
            />
            <Area 
              type="monotone" 
              dataKey="classes" 
              stroke="#10b981" 
              strokeWidth={2}
              fill="url(#colorClasses)"
              name="수업 수"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

