'use client'

import { RotateCcw, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { Select, Button } from 'antd'
import { useLanguage } from '@/components/localization/LanguageContext'

export function PageHeader() {
  const { locale, t } = useLanguage()
  const [selectedYear, setSelectedYear] = useState('2025')
  const [selectedMonth, setSelectedMonth] = useState('all')

  const yearOptions = [
    { value: '2025', label: `2025${locale === 'ko' ? t('pageHeader.yearLabel') : ''}` },
    { value: '2024', label: `2024${locale === 'ko' ? t('pageHeader.yearLabel') : ''}` },
    { value: '2023', label: `2023${locale === 'ko' ? t('pageHeader.yearLabel') : ''}` },
  ]
  
  const monthOptions = [
    { value: 'all', label: `${t('pageHeader.months.all')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'jan', label: `${t('pageHeader.months.jan')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'feb', label: `${t('pageHeader.months.feb')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'mar', label: `${t('pageHeader.months.mar')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'apr', label: `${t('pageHeader.months.apr')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'may', label: `${t('pageHeader.months.may')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'jun', label: `${t('pageHeader.months.jun')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'jul', label: `${t('pageHeader.months.jul')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'aug', label: `${t('pageHeader.months.aug')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'sep', label: `${t('pageHeader.months.sep')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'oct', label: `${t('pageHeader.months.oct')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'nov', label: `${t('pageHeader.months.nov')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
    { value: 'dec', label: `${t('pageHeader.months.dec')}${locale === 'ko' ? t('pageHeader.monthLabel') : ''}` },
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
          <div className="w-[220px]">
            <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
              <Select
                value={selectedYear}
                onChange={setSelectedYear}
                options={yearOptions}
                className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
              />
            </div>
          </div>

          <div className="w-[220px]">
            <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
              <Select
                value={selectedMonth}
                onChange={setSelectedMonth}
                options={monthOptions}
                className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
              />
            </div>
          </div>

          <Button
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={handleReset}
            className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
          >
            {t('pageHeader.resetFilter')}
          </Button>
        </div>
      </div>
    </div>
  )
}