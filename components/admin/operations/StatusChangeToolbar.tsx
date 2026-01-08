'use client'

import { Button, Tooltip } from 'antd'
import { StatusDropdown } from './StatusDropdown'
import { getAllowedNextStatuses, type EducationStatus } from './statusTransitions'

interface StatusChangeToolbarProps {
  selectedCount: number
  selectedRows?: Array<{ status: string }>
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
  selectedRows = [],
  onAssignPartial,
  onAssignAll,
  statusValue,
  onStatusChange,
  onApplyStatusChange,
  assignmentMode,
  onAssignmentModeChange,
}: StatusChangeToolbarProps) {
  // Calculate valid statuses for bulk change
  const getValidBulkStatuses = (): EducationStatus[] => {
    if (selectedRows.length === 0) return []
    
    // Get unique current statuses
    const uniqueStatuses = new Set(selectedRows.map(r => r.status))
    
    // If mixed statuses, return empty (can't bulk change)
    if (uniqueStatuses.size > 1) return []
    
    // Get allowed next statuses for the common status
    const commonStatus = Array.from(uniqueStatuses)[0] as EducationStatus
    return getAllowedNextStatuses(commonStatus)
  }

  const validBulkStatuses = getValidBulkStatuses()
  const hasMixedStatuses = selectedRows.length > 0 && new Set(selectedRows.map(r => r.status)).size > 1
  const canApplyStatusChange = selectedCount > 0 && statusValue && !hasMixedStatuses && validBulkStatuses.includes(statusValue as EducationStatus)

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
            {selectedCount}개 교육 선택됨
          </span>
          <Tooltip 
            title={
              selectedCount === 0 
                ? "교육을 선택하면 일괄 변경이 가능합니다"
                : hasMixedStatuses
                ? "선택한 교육의 상태가 서로 달라 일괄 변경할 수 없습니다"
                : validBulkStatuses.length === 0
                ? "선택한 교육은 더 이상 상태를 변경할 수 없습니다"
                : undefined
            }
          >
            <div className="w-[200px]">
              <StatusDropdown
                value={statusValue}
                onChange={onStatusChange}
                placeholder="상태 선택"
                disabled={selectedCount === 0 || hasMixedStatuses || validBulkStatuses.length === 0}
                allowedStatuses={validBulkStatuses}
              />
            </div>
          </Tooltip>
          <Tooltip title={!canApplyStatusChange && selectedCount > 0 ? "유효한 상태를 선택해주세요" : undefined}>
            <Button
              type="primary"
              onClick={onApplyStatusChange}
              disabled={!canApplyStatusChange}
              className="h-10 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              상태 변경
            </Button>
          </Tooltip>
        </div>
      </div>
    </div>
  )
}

