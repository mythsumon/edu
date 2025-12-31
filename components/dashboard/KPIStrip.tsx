'use client'

import { TrendingUp, TrendingDown, BookOpen, GraduationCap, Users, Building2 } from 'lucide-react'
import { useLanguage } from '@/components/localization/LanguageContext'

interface KPICardProps {
  label: string
  value: string | number
  trend?: {
    value: string
    isPositive: boolean
  }
  icon?: React.ReactNode
  gradient?: string
}

function KPICard({ label, value, trend, icon, gradient = 'from-blue-500 to-blue-600' }: KPICardProps) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-6 shadow-lg hover:shadow-xl transition-all duration-300 group`}>
      {/* Decorative Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity" />
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-white/90 mb-2">{label}</p>
            <p className="text-3xl font-bold text-white mb-2">{value}</p>
            {trend && (
              <div className={`flex items-center gap-1.5 text-sm font-medium ${
                trend.isPositive ? 'text-green-100' : 'text-red-100'
              }`}>
                {trend.isPositive ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span>{trend.value}</span>
              </div>
            )}
          </div>
          {icon && (
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              {icon}
            </div>
          )}
        </div>
      </div>
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
      icon: <BookOpen className="w-6 h-6 text-white" />,
      gradient: 'from-blue-500 via-blue-600 to-blue-700',
    },
    {
      label: t('kpi.progressRate'),
      value: '72%',
      trend: { value: t('kpi.trendUp', { value: '5%' }), isPositive: true },
      icon: <TrendingUp className="w-6 h-6 text-white" />,
      gradient: 'from-green-500 via-green-600 to-green-700',
    },
    {
      label: t('kpi.completedThisMonth'),
      value: '12개 / 100개',
      trend: { value: t('kpi.trendUp', { value: '3개' }), isPositive: true },
      icon: <GraduationCap className="w-6 h-6 text-white" />,
      gradient: 'from-purple-500 via-purple-600 to-purple-700',
    },
    {
      label: t('kpi.participatingInstitutions'),
      value: '250개',
      trend: { value: t('kpi.trendUp', { value: '15개' }), isPositive: true },
      icon: <Building2 className="w-6 h-6 text-white" />,
      gradient: 'from-orange-500 via-orange-600 to-orange-700',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
      {kpis.map((kpi, index) => (
        <KPICard key={index} {...kpi} />
      ))}
    </div>
  )
}
