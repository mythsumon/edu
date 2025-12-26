'use client'

import { Button } from 'antd'
import { StatusDropdown } from './StatusDropdown'

interface StatusChangeToolbarProps {
  selectedCount: number
  onAssignPartial: () => void
  onAssignAll: () => void
  statusValue?: string
  onStatusChange: (value: string) => void
  onApplyStatusChange: () => void
  assignmentMode?: 'partial' | 'full' | null
  onAssignmentModeChange?: (mode: 'partial' | 'full' | null) => void
}

export function StatusChangeToolbar({
  selectedCount,
  onAssignPartial,
  onAssignAll,
  statusValue,
  onStatusChange,
  onApplyStatusChange,
  assignmentMode,
  onAssignmentModeChange,
}: StatusChangeToolbarProps) {
  const canApplyStatusChange = selectedCount > 0 && statusValue

  const handlePartialClick = () => {
    if (onAssignmentModeChange) {
      onAssignmentModeChange(assignmentMode === 'partial' ? null : 'partial')
    }
    onAssignPartial()
  }

  const handleAllClick = () => {
    if (onAssignmentModeChange) {
      onAssignmentModeChange(assignmentMode === 'full' ? null : 'full')
    }
    onAssignAll()
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl px-5 py-4">
      <div className="flex items-center justify-between gap-4">
        {/* Left Group: Primary Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handlePartialClick}
            className={`h-10 px-6 rounded-xl border font-medium transition-all ${
              assignmentMode === 'partial'
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700'
            }`}
          >
            부분 주강사 배정
          </Button>
          <Button
            onClick={handleAllClick}
            className={`h-10 px-6 rounded-xl border font-medium transition-all ${
              assignmentMode === 'full'
                ? 'bg-blue-50 border-blue-300 text-blue-700'
                : 'border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 text-slate-700'
            }`}
          >
            전체 주강사 배정
          </Button>
        </div>

        {/* Right Group: Status Change Controls */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 whitespace-nowrap">
            {selectedCount} 항목 선택됨
          </span>
          <div className="w-[200px]">
            <StatusDropdown
              value={statusValue}
              onChange={onStatusChange}
              placeholder="상태 선택"
            />
          </div>
          <Button
            type="primary"
            onClick={onApplyStatusChange}
            disabled={!canApplyStatusChange}
            className="h-10 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            상태 변경
          </Button>
        </div>
      </div>
    </div>
  )
}

