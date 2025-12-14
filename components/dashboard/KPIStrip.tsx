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
  onClick?: () => void
}

function KPICard({ label, value, trend, onClick }: KPICardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-card px-5 py-4 shadow-card hover:shadow-card-hover transition-all cursor-pointer border border-transparent hover:border-primary-light"
    >
      <div className="text-[13px] text-[#6B7280] mb-2">{label}</div>
      <div className="text-[26px] font-semibold text-gray-900 mb-1">{value}</div>
      {trend && (
        <div className={`flex items-center gap-1 text-[12px] ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  )
}