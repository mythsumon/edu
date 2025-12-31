'use client'

import { Select } from 'antd'
import { ChevronRight } from 'lucide-react'

export interface StatusOption {
  value: string
  label: string
}

const statusOptions: StatusOption[] = [
  { value: '대기', label: '대기' },
  { value: '교육 예정', label: '교육 예정' },
  { value: '강사 공개', label: '강사 공개' },
  { value: '신청 마감', label: '신청 마감' },
  { value: '확정', label: '확정' },
  { value: '교육 진행 중', label: '교육 진행 중' },
  { value: '종료', label: '종료' },
  { value: '중지', label: '중지' },
  { value: '취소', label: '취소' },
]

interface StatusDropdownProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  className?: string
  disabled?: boolean
}

export function StatusDropdown({
  value,
  onChange,
  placeholder = '상태를 선택하세요',
  className = '',
  disabled = false,
}: StatusDropdownProps) {
  return (
    <div className={`h-11 rounded-xl bg-white border border-slate-200 transition-all duration-200 hover:border-slate-300 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200 ${className}`}>
      <Select
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        options={statusOptions}
        disabled={disabled}
        className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-gray-900 [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-gray-400"
        suffixIcon={<ChevronRight className="w-4 h-4 text-gray-400 rotate-90" />}
      />
    </div>
  )
}

export { statusOptions }





