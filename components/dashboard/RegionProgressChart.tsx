'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ChartCard } from './ChartCard'

interface RegionProgressData {
  region: string
  progress: number
  color: string
}

interface RegionProgressChartProps {
  data: RegionProgressData[]
  loading?: boolean
}

export function RegionProgressChart({ data, loading = false }: RegionProgressChartProps) {
  return (
    <ChartCard title="권역별 교육 진행 현황" loading={loading}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
            <defs>
              {data.map((item, index) => (
                <linearGradient key={`gradient-${index}`} id={`colorRegion${index}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={item.color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={item.color} stopOpacity={1}/>
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis 
              dataKey="region" 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickLine={false}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px', fontWeight: 500 }}
              tickLine={false}
              domain={[0, 100]}
              label={{ value: '진행률 (%)', angle: -90, position: 'insideLeft', style: { fontSize: '12px', fill: '#64748b' } }}
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
              formatter={(value: number) => [`${value}%`, '진행률']}
              cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
            />
            <Bar dataKey="progress" radius={[8, 8, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={`url(#colorRegion${index})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

