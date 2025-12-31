'use client'

import { Card, Progress } from 'antd'
import { CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react'

interface CompletionRateCardProps {
  rate: number
  completed: number
  total: number
  pending: number
  rejected?: number
  loading?: boolean
}

export function CompletionRateCard({ rate, completed, total, pending, rejected = 0, loading = false }: CompletionRateCardProps) {
  if (loading) {
    return (
      <Card className="rounded-2xl border border-slate-200 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-slate-200 rounded w-24 mb-4"></div>
          <div className="space-y-2">
            <div className="h-3 bg-slate-200 rounded"></div>
            <div className="h-3 bg-slate-200 rounded"></div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card
      className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300"
      bodyStyle={{ padding: '28px' }}
      styles={{
        header: {
          padding: '20px 28px',
          borderBottom: '1px solid #e2e8f0',
          background: 'linear-gradient(to right, #f8fafc, #ffffff)',
        }
      }}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-lg">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 m-0">출석 완료율</h3>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <span className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                {rate}%
              </span>
              <span className="text-sm text-slate-600 ml-2">({completed} / {total})</span>
            </div>
          </div>
          <Progress 
            percent={rate} 
            strokeColor={{
              '0%': '#10b981',
              '100%': '#059669',
            }}
            trailColor="#e2e8f0"
            strokeWidth={12}
            showInfo={false}
            className="[&_.ant-progress-bg]:rounded-full"
          />
        </div>
        
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
              <span className="text-slate-700 font-medium">완료</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">{completed}</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-600" />
              <span className="text-slate-700 font-medium">대기</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">{pending}</span>
          </div>
          {rejected > 0 && (
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-slate-700 font-medium">거절</span>
              </div>
              <span className="font-bold text-slate-900 text-lg">{rejected}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

