'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ChartCard } from './ChartCard'

interface StatusData {
  name: string
  value: number
  color: string
}

interface StatusBreakdownChartProps {
  data: StatusData[]
  loading?: boolean
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316']

export function StatusBreakdownChart({ data, loading = false }: StatusBreakdownChartProps) {
  return (
    <ChartCard title="상태별 분포" loading={loading}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          데이터가 없습니다.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={110}
              innerRadius={50}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={2}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                padding: '12px'
              }}
            />
            <Legend 
              verticalAlign="bottom" 
              height={40}
              iconType="circle"
              wrapperStyle={{ paddingTop: '20px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </ChartCard>
  )
}

