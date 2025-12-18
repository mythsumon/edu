'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { useLanguage } from '@/components/localization/LanguageContext'

interface KPICardProps {
  label: string
  value: string | number
  trend?: {
    value: string
    isPositive: boolean
  }
}

function KPICard({ label, value, trend }: KPICardProps) {
  return (
    <div className="flex flex-col gap-1 px-2">
      <div className="text-xs font-semibold text-gray-500">{label}</div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      {trend && (
        <div className={`flex items-center gap-1 text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
          {trend.isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{trend.value}</span>
        </div>
      )}
    </div>
  )
}

export function KPIStrip() {
  const { t } = useLanguage()

  const kpis = [
    {
      label: t('kpi.totalPrograms'),
      value: '72개',
      trend: { value: t('kpi.trendUp', { value: '8개' }), isPositive: true },
    },
    {
      label: t('kpi.progressRate'),
      value: '72%',
      trend: { value: t('kpi.trendUp', { value: '5%' }), isPositive: true },
    },
    {
      label: t('kpi.completedThisMonth'),
      value: '12개 / 100개',
      trend: { value: t('kpi.trendUp', { value: '3개' }), isPositive: true },
    },
    {
      label: t('kpi.participatingInstitutions'),
      value: '250개',
      trend: { value: t('kpi.trendUp', { value: '15개' }), isPositive: true },
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  )
}