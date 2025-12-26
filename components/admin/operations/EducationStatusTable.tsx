'use client'

import { Table, Checkbox } from 'antd'
import type { ColumnsType } from 'antd/es/table'

export interface EducationStatusItem {
  key: string
  status: string
  educationId: string
  name: string
  institution: string
  gradeClass: string
  mainInstructorsCount: number
  assistantInstructorsCount: number
  periodStart?: string
  periodEnd?: string
  period?: string
}

interface EducationStatusTableProps {
  rows: EducationStatusItem[]
  selectedIds: string[]
  onToggleRow: (id: string) => void
  onToggleAll: (selected: boolean) => void
  onRowClick?: (record: EducationStatusItem) => void
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
      width: 120,
      render: (status: string) => {
        const config = getStatusStyle(status)
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {status}
          </span>
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
      title: '주강사수',
      dataIndex: 'mainInstructorsCount',
      key: 'mainInstructorsCount',
      width: 100,
      render: (count: number) => <span className="text-base font-medium text-gray-900">{count}</span>,
    },
    {
      title: '보조강사수',
      dataIndex: 'assistantInstructorsCount',
      key: 'assistantInstructorsCount',
      width: 100,
      render: (count: number) => <span className="text-base font-medium text-gray-900">{count}</span>,
    },
    {
      title: '시작/종료 날짜',
      key: 'period',
      width: 200,
      render: (_, record) => (
        <span className="text-base font-medium text-gray-900">{getPeriodDisplay(record)}</span>
      ),
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

