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
    <div className="group relative overflow-hidden bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all duration-300">
      {/* Subtle gradient accent */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`} />
      
      {/* Icon with clean background */}
      <div className="flex items-start justify-between mb-4">
        {kpi.icon && (
          <div className={`p-2.5 rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}>
            <div className="text-white text-base">{kpi.icon}</div>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="space-y-3">
        {/* Label */}
        <p className="text-sm font-semibold text-slate-700 leading-tight">{kpi.label}</p>
        
        {/* Value */}
        <p className="text-3xl font-bold text-slate-900 leading-none">{kpi.value}</p>
        
        {/* Delta */}
        {kpi.delta && (
          <div className="flex items-center gap-1.5">
            {kpi.delta.isPositive ? (
              <TrendingUp className={`w-4 h-4 ${kpi.delta.isPositive ? 'text-green-600' : 'text-red-600'}`} />
            ) : (
              <TrendingDown className={`w-4 h-4 ${kpi.delta.isPositive ? 'text-green-600' : 'text-red-600'}`} />
            )}
            <span className={`text-xs font-medium ${
              kpi.delta.isPositive 
                ? 'text-green-600' 
                : 'text-red-600'
            }`}>
              {kpi.delta.value}
            </span>
          </div>
        )}
        
        {/* Description */}
        {kpi.description && (
          <p className="text-xs text-slate-500 leading-relaxed pt-1 border-t border-slate-50">
            {kpi.description}
          </p>
        )}
      </div>
      
      {/* Hover effect overlay */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.02] transition-opacity duration-300 pointer-events-none`} />
    </div>
  )
}
