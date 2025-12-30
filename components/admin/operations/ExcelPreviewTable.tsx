'use client'

import { useState } from 'react'
import { Table, Switch, Tag } from 'antd'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import dayjs from 'dayjs'

export interface ExcelRowData {
  회차: number
  일자: string
  시작시간: string
  종료시간: string
  주강사수: number
  보조강사수: number
  _rowIndex?: number
}

export interface ValidationError {
  rowIndex: number
  field: string
  message: string
}

interface ExcelPreviewTableProps {
  data: ExcelRowData[]
  errors: ValidationError[]
  onErrorsOnlyChange?: (errorsOnly: boolean) => void
}

export function ExcelPreviewTable({ data, errors, onErrorsOnlyChange }: ExcelPreviewTableProps) {
  const [showErrorsOnly, setShowErrorsOnly] = useState(false)

  const handleToggle = (checked: boolean) => {
    setShowErrorsOnly(checked)
    onErrorsOnlyChange?.(checked)
  }

  const getRowErrors = (rowIndex: number) => {
    return errors.filter(err => err.rowIndex === rowIndex)
  }

  const hasRowError = (rowIndex: number) => {
    return errors.some(err => err.rowIndex === rowIndex)
  }

  const filteredData = showErrorsOnly
    ? data.filter((row, idx) => hasRowError(row._rowIndex ?? idx))
    : data

  const columns = [
    {
      title: '회차',
      dataIndex: '회차',
      key: '회차',
      width: 80,
      render: (value: number, record: ExcelRowData, index: number) => {
        const rowIndex = record._rowIndex ?? index
        const rowErrors = getRowErrors(rowIndex)
        return (
          <div className="flex items-center gap-2">
            {hasRowError(rowIndex) ? (
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
            )}
            <span className={hasRowError(rowIndex) ? 'text-red-600 font-medium' : ''}>
              {value}
            </span>
          </div>
        )
      },
    },
    {
      title: '일자',
      dataIndex: '일자',
      key: '일자',
      width: 120,
      render: (value: string, record: ExcelRowData, index: number) => {
        const rowIndex = record._rowIndex ?? index
        const fieldErrors = getRowErrors(rowIndex).filter(e => e.field === '일자')
        return (
          <div>
            <div className={hasRowError(rowIndex) && fieldErrors.length > 0 ? 'text-red-600' : ''}>
              {value || '-'}
            </div>
            {fieldErrors.length > 0 && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors[0].message}</div>
            )}
          </div>
        )
      },
    },
    {
      title: '시작시간',
      dataIndex: '시작시간',
      key: '시작시간',
      width: 120,
      render: (value: string, record: ExcelRowData, index: number) => {
        const rowIndex = record._rowIndex ?? index
        const fieldErrors = getRowErrors(rowIndex).filter(e => e.field === '시작시간')
        return (
          <div>
            <div className={hasRowError(rowIndex) && fieldErrors.length > 0 ? 'text-red-600' : ''}>
              {value || '-'}
            </div>
            {fieldErrors.length > 0 && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors[0].message}</div>
            )}
          </div>
        )
      },
    },
    {
      title: '종료시간',
      dataIndex: '종료시간',
      key: '종료시간',
      width: 120,
      render: (value: string, record: ExcelRowData, index: number) => {
        const rowIndex = record._rowIndex ?? index
        const fieldErrors = getRowErrors(rowIndex).filter(e => e.field === '종료시간')
        return (
          <div>
            <div className={hasRowError(rowIndex) && fieldErrors.length > 0 ? 'text-red-600' : ''}>
              {value || '-'}
            </div>
            {fieldErrors.length > 0 && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors[0].message}</div>
            )}
          </div>
        )
      },
    },
    {
      title: '주강사수',
      dataIndex: '주강사수',
      key: '주강사수',
      width: 100,
      render: (value: number, record: ExcelRowData, index: number) => {
        const rowIndex = record._rowIndex ?? index
        const fieldErrors = getRowErrors(rowIndex).filter(e => e.field === '주강사수')
        return (
          <div>
            <div className={hasRowError(rowIndex) && fieldErrors.length > 0 ? 'text-red-600' : ''}>
              {value ?? '-'}
            </div>
            {fieldErrors.length > 0 && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors[0].message}</div>
            )}
          </div>
        )
      },
    },
    {
      title: '보조강사수',
      dataIndex: '보조강사수',
      key: '보조강사수',
      width: 100,
      render: (value: number, record: ExcelRowData, index: number) => {
        const rowIndex = record._rowIndex ?? index
        const fieldErrors = getRowErrors(rowIndex).filter(e => e.field === '보조강사수')
        return (
          <div>
            <div className={hasRowError(rowIndex) && fieldErrors.length > 0 ? 'text-red-600' : ''}>
              {value ?? '-'}
            </div>
            {fieldErrors.length > 0 && (
              <div className="text-xs text-red-500 mt-1">{fieldErrors[0].message}</div>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-gray-700">
            미리보기 ({filteredData.length}건)
          </span>
          {errors.length > 0 && (
            <Tag color="red" className="text-xs">
              오류 {errors.length}건
            </Tag>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">오류만 보기</span>
          <Switch
            checked={showErrorsOnly}
            onChange={handleToggle}
            size="small"
          />
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredData.map((row, idx) => ({ ...row, key: idx }))}
          pagination={false}
          scroll={{ x: 'max-content' }}
          size="small"
          className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr>td]:text-sm"
        />
      </div>
    </div>
  )
}





