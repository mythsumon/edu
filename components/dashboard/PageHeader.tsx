'use client'

import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useLanguage } from '@/components/localization/LanguageContext'

export function PageHeader() {
  const { locale, t } = useLanguage()
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedMonth, setSelectedMonth] = useState('all')

  const years = ['2025', '2024', '2023']
  const months = [
    { value: 'all', label: t('pageHeader.months.all') },
    { value: 'jan', label: t('pageHeader.months.jan') },
    { value: 'feb', label: t('pageHeader.months.feb') },
    { value: 'mar', label: t('pageHeader.months.mar') },
    { value: 'apr', label: t('pageHeader.months.apr') },
    { value: 'may', label: t('pageHeader.months.may') },
    { value: 'jun', label: t('pageHeader.months.jun') },
    { value: 'jul', label: t('pageHeader.months.jul') },
    { value: 'aug', label: t('pageHeader.months.aug') },
    { value: 'sep', label: t('pageHeader.months.sep') },
    { value: 'oct', label: t('pageHeader.months.oct') },
    { value: 'nov', label: t('pageHeader.months.nov') },
    { value: 'dec', label: t('pageHeader.months.dec') },
  ]

  const handleReset = () => {
    setSelectedYear('2025')
    setSelectedMonth('all')
  }

  return (
    <div className="mb-6">
      {/* Title Row */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <p className="text-sm text-gray-600">{t('pageHeader.description')}</p>
        </div>

        {/* Filter Group */}
        <div className="flex items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="h-11 px-3 text-sm border border-gray-300 rounded-xl bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}{locale === 'ko' ? t('pageHeader.yearLabel') : ''}
              </option>
            ))}
          </select>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="h-11 px-3 text-sm border border-gray-300 rounded-xl bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          >
            {months.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}{locale === 'ko' ? t('pageHeader.monthLabel') : ''}
              </option>
            ))}
          </select>

          <button
            onClick={handleReset}
            className="flex items-center gap-2 h-11 px-4 text-sm text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            {t('pageHeader.resetFilter')}
          </button>
        </div>
      </div>
    </div>
  )
}