'use client'

import { useState } from 'react'
import { Button, DatePicker, Space, Select } from 'antd'
import { Download, RefreshCw, Search, BarChart3 } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'

const { RangePicker } = DatePicker

type DateRange = 'today' | '7days' | '30days' | 'custom'

interface DashboardHeaderProps {
  onDateRangeChange?: (range: DateRange, dates?: [Dayjs, Dayjs]) => void
  onExport?: () => void
  onRefresh?: () => void
}

export function DashboardHeader({ onDateRangeChange, onExport, onRefresh }: DashboardHeaderProps) {
  const [dateRange, setDateRange] = useState<DateRange>('7days')
  const [customDates, setCustomDates] = useState<[Dayjs, Dayjs] | null>(null)

  const handleDateRangeChange = (value: DateRange) => {
    setDateRange(value)
    if (value !== 'custom') {
      onDateRangeChange?.(value)
    }
  }

  const handleCustomDateChange = (dates: [Dayjs, Dayjs] | null) => {
    setCustomDates(dates)
    if (dates) {
      setDateRange('custom')
      onDateRangeChange?.('custom', dates)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 md:p-6 mb-4 md:mb-6 shadow-md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900 bg-clip-text text-transparent mb-1">
              Admin Dashboard
            </h1>
            <p className="text-xs md:text-sm text-slate-600">전체 교육 프로그램 현황 및 분석</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Space size="middle" className="w-full sm:w-auto">
            <Select
              value={dateRange}
              onChange={handleDateRangeChange}
              style={{ width: '100%' }}
              className="sm:!w-[140px]"
              className="[&_.ant-select-selector]:rounded-lg [&_.ant-select-selector]:border-slate-300"
              options={[
                { label: '오늘', value: 'today' },
                { label: '최근 7일', value: '7days' },
                { label: '최근 30일', value: '30days' },
                { label: '사용자 지정', value: 'custom' },
              ]}
            />
            {dateRange === 'custom' && (
              <RangePicker
                value={customDates}
                onChange={handleCustomDateChange}
                format="YYYY-MM-DD"
                className="[&_.ant-picker]:rounded-lg [&_.ant-picker]:border-slate-300"
              />
            )}
          </Space>
          
          <Space>
            <Button
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={onRefresh}
              className="rounded-lg border-slate-300 hover:border-blue-500 hover:text-blue-600"
            >
              새로고침
            </Button>
            <Button
              type="primary"
              icon={<Download className="w-4 h-4 text-white" />}
              onClick={onExport}
              style={{
                color: 'white',
              }}
              className="rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg !text-white hover:!text-white [&_.anticon]:!text-white [&_.anticon]:hover:!text-white [&>span]:!text-white [&>span]:hover:!text-white [&:hover>span]:!text-white [&:hover_.anticon]:!text-white [&:hover]:!text-white"
            >
              내보내기
            </Button>
          </Space>
        </div>
      </div>
    </div>
  )
}

