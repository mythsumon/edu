'use client'

import { Card } from 'antd'
import { Loader2 } from 'lucide-react'

interface ChartCardProps {
  title: string
  children: React.ReactNode
  loading?: boolean
  action?: React.ReactNode
  className?: string
}

export function ChartCard({ title, children, loading = false, action, className = '' }: ChartCardProps) {
  return (
    <Card
      className={`rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 ${className}`}
      bodyStyle={{ padding: '28px' }}
      styles={{
        header: {
          padding: '20px 28px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)',
        }
      }}
      title={
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 m-0 flex items-center gap-2">
            <div className="w-1 h-5 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
            {title}
          </h3>
          {action && <div>{action}</div>}
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      ) : (
        children
      )}
    </Card>
  )
}

