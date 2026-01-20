'use client'

import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react'

export interface KPIData {
  label: string
  value: string | number
  delta?: {
    value: string
    isPositive: boolean
  }
  description?: string
  icon?: React.ReactNode
  gradient?: string
}

interface ModernKPICardProps {
  kpi: KPIData
  loading?: boolean
}

const cardGradients = [
  'from-blue-500 via-blue-600 to-blue-700',
  'from-emerald-500 via-emerald-600 to-emerald-700',
  'from-purple-500 via-purple-600 to-purple-700',
  'from-orange-500 via-orange-600 to-orange-700',
  'from-purple-500 via-purple-600 to-purple-700',
  'from-indigo-500 via-indigo-600 to-indigo-700',
]

export function ModernKPICard({ kpi, loading = false }: ModernKPICardProps) {
  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-slate-200 rounded w-20 mb-3"></div>
          <div className="h-3 bg-slate-200 rounded w-32"></div>
        </div>
      </div>
    )
  }

  const gradient = kpi.gradient || cardGradients[0]

  return (
    <div className="group relative overflow-hidden bg-white rounded-3xl border border-slate-200/60 p-6 shadow-sm hover:shadow-xl hover:border-slate-300/80 transition-all duration-300 hover:-translate-y-1">
      {/* Gradient background accent */}
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-5 rounded-full blur-3xl group-hover:opacity-10 transition-opacity duration-300`} />
      
      {/* Content Layout */}
      <div className="relative">
        {/* Header: Icon and Label */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{kpi.label}</p>
          </div>
          {kpi.icon && (
            <div className={`p-3 rounded-2xl bg-gradient-to-br ${gradient} shadow-lg flex-shrink-0`}>
              <div className="text-white text-xl">{kpi.icon}</div>
            </div>
          )}
        </div>
        
        {/* Main Value */}
        <div className="mb-4">
          <p className="text-4xl font-bold text-slate-900 leading-tight tracking-tight">{kpi.value}</p>
        </div>
        
        {/* Delta with improved styling */}
        {kpi.delta && (
          <div className="flex items-center gap-2 mb-3">
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${
              kpi.delta.isPositive 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {kpi.delta.isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              <span className={`text-xs font-semibold`}>
                {kpi.delta.value}
              </span>
            </div>
          </div>
        )}
        
        {/* Description */}
        {kpi.description && (
          <p className="text-xs text-slate-500 leading-relaxed pt-3 border-t border-slate-100">
            {kpi.description}
          </p>
        )}
      </div>
      
      {/* Subtle top border accent */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`} />
    </div>
  )
}
