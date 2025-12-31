'use client'

import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ChartCard } from './ChartCard'

interface AssignmentRateData {
  region: string
  assigned: number
  required: number
  rate: number
}

interface InstructorAssignmentRateChartProps {
  data: AssignmentRateData[]
  loading?: boolean
}

export function InstructorAssignmentRateChart({ data, loading = false }: InstructorAssignmentRateChartProps) {
  return (
    <ChartCard title="권역별 강사 배정률" loading={loading}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              <linearGradient id="colorAssigned" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={1}/>
              </linearGradient>
              <linearGradient id="colorRequired" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#e2e8f0" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#e2e8f0" stopOpacity={1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="region" 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickLine={false}
            />
            <YAxis 
              yAxisId="left"
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickLine={false}
              label={{ value: '강사 수', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#64748b' } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickLine={false}
              domain={[0, 100]}
              label={{ value: '배정률 (%)', angle: 90, position: 'insideRight', style: { fontSize: '12px', fill: '#64748b' } }}
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
            <Bar 
              yAxisId="left"
              dataKey="assigned" 
              fill="url(#colorAssigned)" 
              name="배정된 강사"
              radius={[8, 8, 0, 0]}
            />
            <Bar 
              yAxisId="left"
              dataKey="required" 
              fill="url(#colorRequired)" 
              name="필요한 강사"
              radius={[8, 8, 0, 0]}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="rate" 
              stroke="#ef4444" 
              strokeWidth={3}
              name="배정률 (%)"
              dot={{ fill: '#ef4444', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

