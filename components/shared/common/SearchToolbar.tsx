'use client'

import React from 'react'
import { Input, Select, Button, Space } from 'antd'
import { Search, RotateCcw, ChevronRight } from 'lucide-react'
import type { SelectProps } from 'antd'

interface SearchToolbarFilter {
  placeholder: string
  value: string | undefined
  onChange: (value: string | undefined) => void
  options: { value: string; label: string }[]
  width?: number
}

interface SearchToolbarProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onSearch?: () => void
  filters?: SearchToolbarFilter[]
  onReset?: () => void
  searchPlaceholder?: string
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchValue,
  onSearchChange,
  onSearch,
  filters = [],
  onReset,
  searchPlaceholder = "Search by name, ID, or email...",
}) => {
  return (
    <div
      className="
        flex items-center
        h-16
        px-4
        py-3
        bg-white
        border border-[#ECECF3]
        rounded-2xl
        shadow-[0_8px_24px_rgba(15,15,30,0.06)]
        mb-4
        gap-3
        flex-wrap
      "
    >
      {/* Search Input - Primary, flex-grow */}
      <div className="flex-1 min-w-[200px]">
        <div
          className="
            relative
            h-11
            rounded-xl
            bg-white
            border border-[#E6E6EF]
            transition-all
            duration-200
            focus-within:border-[#ff8a65]
            focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)]
            hover:border-[#D3D3E0]
          "
        >
          <Input
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onPressEnter={onSearch}
            allowClear
            placeholder={searchPlaceholder}
            prefix={<Search className="w-4 h-4 text-[#9AA0AE]" />}
            className="
              h-11
              border-0
              bg-transparent
              text-[#151827]
              placeholder:text-[#9AA0AE]
              [&_.ant-input]:!h-11
              [&_.ant-input]:!px-4
              [&_.ant-input]:!py-0
              [&_.ant-input]:!bg-transparent
              [&_.ant-input]:!border-0
              [&_.ant-input]:!outline-none
              [&_.ant-input]:!shadow-none
              [&_.ant-input-wrapper]:!border-0
              [&_.ant-input-wrapper]:!shadow-none
              [&_.ant-input-prefix]:!mr-2
            "
          />
        </div>
      </div>

      {/* Filters - Fixed width dropdowns */}
      {filters.map((filter, index) => (
        <div key={index} className="w-[220px]">
          <div
            className="
              h-11
              bg-white
              border border-[#E6E6EF]
              transition-all
              duration-200
              focus-within:border-[#ff8a65]
              focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)]
              hover:border-[#D3D3E0]
            "
          >
            <Select
              placeholder={filter.placeholder}
              value={filter.value}
              onChange={filter.onChange}
              options={filter.options}
              className="
                w-full
                [&_.ant-select-selector]:!h-11
                [&_.ant-select-selector]:!border-0
                [&_.ant-select-selector]:!bg-transparent
                [&_.ant-select-selector]:!rounded-xl
                [&_.ant-select-selector]:!shadow-none
                [&_.ant-select-selector]:!px-4
                [&_.ant-select-selection-item]:!text-[#151827]
                [&_.ant-select-selection-item]:!font-medium
                [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]
              "
              suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
            />
          </div>
        </div>
      ))}

      {/* Icon Buttons - Right side cluster */}
      {onReset && (
        <div className="flex items-center gap-2 ml-auto">
          <Button
            type="text"
            icon={<RotateCcw className="w-4 h-4 text-[#151827]" />}
            onClick={onReset}
            className="
              w-10
              h-10
              p-0
              bg-transparent
              border border-[#EDEDF5]
              hover:bg-[#FFF3ED]
              flex
              items-center
              justify-center
              transition-all
            "
          />
        </div>
      )}
    </div>
  )
}

