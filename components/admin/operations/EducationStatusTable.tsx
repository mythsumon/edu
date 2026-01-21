'use client'

import { Table, Checkbox, Dropdown, Button, Tooltip, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import type { MenuProps } from 'antd'
import { ChevronDown, Edit2, Clock } from 'lucide-react'
import dayjs from 'dayjs'
import { 
  getAllowedNextStatuses, 
  statusDescriptions, 
  statusIcons,
  type EducationStatus 
} from './statusTransitions'

export interface EducationStatusItem {
  key: string
  status: string
  educationId: string
  name: string
  institution: string
  gradeClass: string
  mainInstructorsCount: number
  mainInstructorsRequired?: number // 필요 수
  assistantInstructorsCount: number
  assistantInstructorsRequired?: number // 필요 수
  mainInstructorNames?: string[] // 주강사 이름 목록
  assistantInstructorNames?: string[] // 보조강사 이름 목록
  periodStart?: string
  periodEnd?: string
  period?: string
  openAt?: string // ISO datetime string
  closeAt?: string // ISO datetime string
  applicationRestriction?: 'MAIN_ONLY' | 'ASSISTANT_ONLY' | 'ALL' // 신청 제한
}

interface EducationStatusTableProps {
  rows: EducationStatusItem[]
  selectedIds: string[]
  onToggleRow: (id: string) => void
  onToggleAll: (selected: boolean) => void
  onRowClick?: (record: EducationStatusItem) => void
  onStatusChange?: (id: string, newStatus: EducationStatus) => void
  currentPage?: number
  pageSize?: number
  total?: number
  onPageChange?: (page: number, size: number) => void
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  '대기': { bg: 'bg-gray-100', text: 'text-gray-700' },
  '교육 예정': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '강사 공개': { bg: 'bg-purple-100', text: 'text-purple-700' },
  '신청 마감': { bg: 'bg-slate-100', text: 'text-slate-600' },
  '확정': { bg: 'bg-green-100', text: 'text-green-700' },
  '교육 진행 중': { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  '종료': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  '중지': { bg: 'bg-orange-100', text: 'text-orange-700' },
  '취소': { bg: 'bg-red-100', text: 'text-red-700' },
  '신청 중': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  '진행중': { bg: 'bg-blue-100', text: 'text-blue-700' },
  '완료': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

export function EducationStatusTable({
  rows,
  selectedIds,
  onToggleRow,
  onToggleAll,
  onRowClick,
  onStatusChange,
  currentPage = 1,
  pageSize = 10,
  total,
  onPageChange,
}: EducationStatusTableProps) {
  const getStatusStyle = (status: string) => {
    return statusStyle[status] || { bg: 'bg-slate-100', text: 'text-slate-600' }
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-'
    // If already formatted, return as is
    if (dateStr.includes('.')) return dateStr
    // Otherwise format it
    return dateStr.replace(/-/g, '.')
  }

  const getPeriodDisplay = (item: EducationStatusItem) => {
    if (item.period) return item.period
    if (item.periodStart && item.periodEnd) {
      return `${formatDate(item.periodStart)} ~ ${formatDate(item.periodEnd)}`
    }
    if (item.periodStart) return formatDate(item.periodStart)
    return '-'
  }

  // Get current page rows for select all logic
  const getCurrentPageRows = () => {
    if (!currentPage || !pageSize) return rows
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return rows.slice(start, end)
  }

  const currentPageRows = getCurrentPageRows()
  const currentPageRowKeys = currentPageRows.map(row => row.key)
  const selectedOnCurrentPage = currentPageRowKeys.filter(key => selectedIds.includes(key))
  const allCurrentPageSelected = currentPageRows.length > 0 && selectedOnCurrentPage.length === currentPageRows.length
  const someCurrentPageSelected = selectedOnCurrentPage.length > 0 && selectedOnCurrentPage.length < currentPageRows.length

  const columns: ColumnsType<EducationStatusItem> = [
    {
      title: (
        <Checkbox
          checked={allCurrentPageSelected}
          indeterminate={someCurrentPageSelected}
          onChange={(e) => onToggleAll(e.target.checked)}
        />
      ),
      key: 'selection',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedIds.includes(record.key)}
          onChange={() => onToggleRow(record.key)}
        />
      ),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (status: string, record: EducationStatusItem) => {
        const config = getStatusStyle(status)
        const currentStatus = status as EducationStatus
        const allowedNextStatuses = getAllowedNextStatuses(currentStatus)
        const canChange = allowedNextStatuses.length > 0 && onStatusChange !== undefined
        
        // Create dropdown menu for status change
        const statusMenuItems: MenuProps['items'] = allowedNextStatuses.map((nextStatus) => ({
          key: nextStatus,
          label: (
            <div className="flex items-center gap-2">
              <span>{statusIcons[nextStatus]}</span>
              <span>{nextStatus}</span>
            </div>
          ),
        }))

        const handleStatusMenuClick = ({ key }: { key: string }) => {
          if (onStatusChange) {
            onStatusChange(record.key, key as EducationStatus)
          }
        }

        return (
          <div className="flex items-center gap-2">
            <Tooltip title={statusDescriptions[currentStatus] || '상태 정보'}>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text} cursor-default`}>
                <span className="text-sm">{statusIcons[currentStatus]}</span>
                <span>{status}</span>
              </span>
            </Tooltip>
            {canChange ? (
              <Dropdown
                menu={{ items: statusMenuItems, onClick: handleStatusMenuClick }}
                trigger={['click']}
                placement="bottomLeft"
              >
                <Tooltip title="상태 변경">
                  <Button
                    type="text"
                    size="small"
                    icon={<Edit2 className="w-3 h-3" />}
                    className="h-6 w-6 p-0 flex items-center justify-center hover:bg-blue-50 hover:text-blue-600"
                    onClick={(e) => e.stopPropagation()}
                  />
                </Tooltip>
              </Dropdown>
            ) : (
              <Tooltip title="이 상태에서는 변경할 수 없습니다">
                <Button
                  type="text"
                  size="small"
                  disabled
                  icon={<Edit2 className="w-3 h-3" />}
                  className="h-6 w-6 p-0 flex items-center justify-center opacity-30 cursor-not-allowed"
                  onClick={(e) => e.stopPropagation()}
                />
              </Tooltip>
            )}
          </div>
        )
      },
    },
    {
      title: '교육ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 150,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '교육명',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '교육기관명',
      dataIndex: 'institution',
      key: 'institution',
      width: 150,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '학년학급',
      dataIndex: 'gradeClass',
      key: 'gradeClass',
      width: 120,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '주강사',
      dataIndex: 'mainInstructorNames',
      key: 'mainInstructorNames',
      width: 200,
      render: (names: string[] | undefined, record: EducationStatusItem) => {
        // Show first main instructor name only, or "—" if none
        const mainInstructorName = names && names.length > 0 ? names[0] : null
        return (
          <span className="text-base font-medium text-gray-900">
            {mainInstructorName || '—'}
          </span>
        )
      },
    },
    {
      title: '보조강사',
      dataIndex: 'assistantInstructorNames',
      key: 'assistantInstructorNames',
      width: 200,
      render: (names: string[] | undefined, record: EducationStatusItem) => {
        // Show comma-separated list of assistant instructor names, or "—" if none
        const assistantNames = names && names.length > 0 
          ? names.join(', ') 
          : null
        return (
          <span className="text-base font-medium text-gray-900">
            {assistantNames || '—'}
          </span>
        )
      },
    },
    {
      title: '시작/종료 날짜',
      key: 'period',
      width: 200,
      render: (_, record) => (
        <span className="text-base font-medium text-gray-900">{getPeriodDisplay(record)}</span>
      ),
    },
    {
      title: '스케줄',
      key: 'schedule',
      width: 250,
      render: (_, record) => {
        const now = dayjs()
        const openAt = record.openAt ? dayjs(record.openAt) : null
        const closeAt = record.closeAt ? dayjs(record.closeAt) : null

        return (
          <div className="space-y-1">
            {openAt && (
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-blue-500" />
                <span className="text-gray-600">강사공개 예정:</span>
                {openAt.isBefore(now) ? (
                  <Badge status="success" text="완료" />
                ) : (
                  <span className="text-blue-600 font-medium">
                    {openAt.format('YYYY-MM-DD HH:mm')}
                  </span>
                )}
              </div>
            )}
            {closeAt && (
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-3 h-3 text-orange-500" />
                <span className="text-gray-600">신청마감 예정:</span>
                {closeAt.isBefore(now) ? (
                  <Badge status="success" text="완료" />
                ) : (
                  <span className="text-orange-600 font-medium">
                    {closeAt.format('YYYY-MM-DD HH:mm')}
                  </span>
                )}
              </div>
            )}
            {!openAt && !closeAt && (
              <span className="text-gray-400 text-xs">스케줄 없음</span>
            )}
            {record.applicationRestriction && (
              <div className="flex items-center gap-2 text-xs mt-1">
                <span className="text-gray-500">신청제한:</span>
                <Badge 
                  status={record.applicationRestriction === 'ALL' ? 'default' : 'processing'}
                  text={
                    record.applicationRestriction === 'MAIN_ONLY' ? '주강사만' :
                    record.applicationRestriction === 'ASSISTANT_ONLY' ? '보조강사만' :
                    '모두 가능'
                  }
                />
              </div>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <Table
        columns={columns}
        dataSource={rows}
        rowKey="key"
        onRow={(record) => ({
          onClick: () => onRowClick?.(record),
          className: 'cursor-pointer',
        })}
        scroll={{ x: 'max-content' }}
        className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#3b82f6] [&_.ant-pagination-item-active]:!bg-[#3b82f6] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
        pagination={
          total !== undefined
            ? {
                current: currentPage,
                pageSize: pageSize,
                total: total,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}건`,
                onChange: onPageChange,
                onShowSizeChange: onPageChange,
              }
            : false
        }
      />
  )
}

