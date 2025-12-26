'use client'

import { useState } from 'react'
import { Modal, DatePicker, Button, Select } from 'antd'
import { X, RotateCcw } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import { statusOptions } from './StatusDropdown'

const { RangePicker } = DatePicker

interface EducationStatusFilterProps {
  open: boolean
  onClose: () => void
  onApply: (filters: FilterValues) => void
  onReset: () => void
  initialFilters?: FilterValues
}

export interface FilterValues {
  status?: string
  dateRange?: [Dayjs | null, Dayjs | null] | null
}

export function EducationStatusFilter({
  open,
  onClose,
  onApply,
  onReset,
  initialFilters,
}: EducationStatusFilterProps) {
  const [status, setStatus] = useState<string>(initialFilters?.status || '')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(
    initialFilters?.dateRange || null
  )

  const handleApply = () => {
    onApply({
      status,
      dateRange,
    })
    onClose()
  }

  const handleReset = () => {
    setStatus('')
    setDateRange(null)
    onReset()
    onClose()
  }

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={480}
      closable={false}
      className="[&_.ant-modal-content]:!p-0 [&_.ant-modal-body]:!p-0"
    >
      <div className="bg-white rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">교육 상태 변경 필터링</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Filter Fields */}
        <div className="px-6 py-4 space-y-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
            <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
              <Select
                placeholder="전체"
                value={status || undefined}
                onChange={(value) => setStatus(value || '')}
                options={statusOptions}
                className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
              />
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
            <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                format="MM/DD/YYYY"
                className="w-full h-11 rounded-xl [&_.ant-picker-input]:!h-11 [&_.ant-picker-input]:!border-0"
                placeholder={['시작일', '종료일']}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
          <Button
            type="text"
            icon={<RotateCcw className="w-4 h-4" />}
            onClick={handleReset}
            className="h-9 px-4 text-sm"
          >
            초기화
          </Button>
          <Button
            type="primary"
            onClick={handleApply}
            className="h-9 px-4 text-sm bg-slate-900 hover:bg-slate-800 active:bg-slate-900 border-0 text-white hover:text-white active:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            적용
          </Button>
        </div>
      </div>
    </Modal>
  )
}

