'use client'

import { useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts'
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

// Custom label component
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  
  // Only show label if percentage is greater than 5%
  if (percent < 0.05) return null
  
  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-xs font-semibold drop-shadow-lg"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function StatusBreakdownChart({ data, loading = false }: StatusBreakdownChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  
  const activeData = activeIndex !== null ? data[activeIndex] : null
  const activePercent = activeData && total > 0 ? ((activeData.value / total) * 100).toFixed(1) : null
  
  return (
    <ChartCard title="상태별 분포" loading={loading}>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-slate-500">
          데이터가 없습니다.
        </div>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={360}>
            <PieChart>
              <defs>
                {data.map((entry, index) => (
                  <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={CustomLabel}
                outerRadius={130}
                innerRadius={70}
                fill="#8884d8"
                dataKey="value"
                paddingAngle={3}
                stroke="white"
                strokeWidth={2}
                activeIndex={activeIndex ?? undefined}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {data.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={`url(#gradient-${index})`}
                    style={{
                      filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                    }}
                  />
                ))}
              </Pie>
              <Legend 
                verticalAlign="bottom" 
                height={60}
                iconType="circle"
                wrapperStyle={{ paddingTop: '24px' }}
                formatter={(value, entry: any) => {
                  const entryData = entry.payload as StatusData
                  return (
                    <span className="text-sm font-medium text-slate-700">
                      {value} ({entryData.value}개)
                    </span>
                  )
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center display - shows active item on hover, otherwise shows total */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {activeData ? (
              <div className="text-center bg-white rounded-xl shadow-lg border border-slate-200 px-6 py-4 min-w-[160px]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: activeData.color }}
                  />
                  <span className="text-sm font-semibold text-slate-900">{activeData.name}</span>
                </div>
                <div className="text-2xl font-bold text-slate-900 mb-1" style={{ color: activeData.color }}>
                  {activeData.value}
                </div>
                <div className="text-xs text-slate-600">전체 프로그램</div>
                <div className="text-lg font-semibold text-slate-700 mt-1">{activePercent}%</div>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">{total.toLocaleString()}</div>
                <div className="text-sm text-slate-600 font-medium">전체 프로그램</div>
              </div>
            )}
          </div>
        </div>
      )}
    </ChartCard>
  )
}

