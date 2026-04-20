'use client'

import { Button, Table, Input, DatePicker, Space } from 'antd'
import { Plus, Trash2 } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { ActivityLogSessionRow } from '../types'
import dayjs from 'dayjs'

interface SessionRowsTableProps {
  sessions: ActivityLogSessionRow[]
  onChange: (sessions: ActivityLogSessionRow[]) => void
  disabled?: boolean
  /** 특정 날짜로 필터링. 'ALL' 또는 undefined이면 전체 표시 */
  filterDate?: string
  /** 섹션 헤더 숨김 (외부에서 헤더 제공 시) */
  hideHeader?: boolean
}

export function SessionRowsTable({
  sessions,
  onChange,
  disabled = false,
  filterDate,
  hideHeader = false,
}: SessionRowsTableProps) {
  const isFiltered = !!filterDate && filterDate !== 'ALL'
  const displayedSessions = isFiltered
    ? sessions.filter((s) => s.date === filterDate)
    : sessions

  const handleAddRow = () => {
    const newSession: ActivityLogSessionRow = {
      id: `session-${Date.now()}`,
      sessionNumber: sessions.length + 1,
      // 날짜 필터가 활성화되어 있으면 해당 날짜로 자동 세팅
      date: isFiltered ? (filterDate as string) : '',
      time: '',
      activityName: '',
    }
    onChange([...sessions, newSession])
  }

  const handleRemoveRow = (id: string) => {
    const updated = sessions
      .filter(s => s.id !== id)
      .map((s, index) => ({ ...s, sessionNumber: index + 1 }))
    onChange(updated)
  }

  const handleFieldChange = (id: string, field: keyof ActivityLogSessionRow, value: string) => {
    const updated = sessions.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    )
    onChange(updated)
  }

  const columns: ColumnsType<ActivityLogSessionRow> = [
    {
      title: '차시',
      dataIndex: 'sessionNumber',
      key: 'sessionNumber',
      width: 80,
      align: 'center',
      render: (_, record) => (
        <span className="font-medium">{record.sessionNumber}</span>
      ),
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (_, record) =>
        disabled ? (
          <span>{record.date || '-'}</span>
        ) : (
          <DatePicker
            value={record.date ? dayjs(record.date) : null}
            onChange={(date) =>
              handleFieldChange(record.id, 'date', date ? date.format('YYYY-MM-DD') : '')
            }
            format="YYYY-MM-DD"
            className="w-full"
            placeholder="일자 선택"
          />
        ),
    },
    {
      title: '시간',
      dataIndex: 'time',
      key: 'time',
      width: 150,
      render: (_, record) =>
        disabled ? (
          <span>{record.time || '-'}</span>
        ) : (
          <Input
            value={record.time}
            onChange={(e) => handleFieldChange(record.id, 'time', e.target.value)}
            placeholder="예: 09:00 ~ 12:10"
            className="w-full"
          />
        ),
    },
    {
      title: '교육명(활동내용)',
      dataIndex: 'activityName',
      key: 'activityName',
      render: (_, record) =>
        disabled ? (
          <span>{record.activityName || '-'}</span>
        ) : (
          <Input
            value={record.activityName}
            onChange={(e) => handleFieldChange(record.id, 'activityName', e.target.value)}
            placeholder="교육명 또는 활동내용을 입력하세요"
            className="w-full"
          />
        ),
    },
    {
      title: '작업',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, record) =>
        !disabled && (
          <Button
            type="text"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => handleRemoveRow(record.id)}
            aria-label="삭제"
          />
        ),
    },
  ]

  return (
    <div className="space-y-4">
      {!hideHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            차시 목록
          </h3>
          {!disabled && (
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddRow}
            >
              차시 추가
            </Button>
          )}
        </div>
      )}
      {hideHeader && !disabled && (
        <div className="flex justify-end">
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddRow}
          >
            {isFiltered ? `${dayjs(filterDate).format('M/D')} 차시 추가` : '차시 추가'}
          </Button>
        </div>
      )}
      <Table
        columns={columns}
        dataSource={displayedSessions}
        rowKey="id"
        pagination={false}
        className="bg-white dark:bg-gray-800"
        locale={{
          emptyText: isFiltered
            ? '선택한 날짜에 등록된 차시가 없습니다. 우측 상단의 "차시 추가"를 눌러 추가하세요.'
            : '등록된 차시가 없습니다',
        }}
      />
    </div>
  )
}



