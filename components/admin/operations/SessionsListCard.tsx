'use client'

import { Table } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { DetailSectionCard } from './DetailSectionCard'

interface SessionItem {
  title: string
  date: string
  startTime: string
  endTime: string
  mainInstructors?: number
  assistantInstructors?: number
  mainInstructorName?: string
  assistantInstructorName?: string
  mainStatus?: string
  assistantStatus?: string
  note?: string
}

interface SessionsListCardProps {
  sessions: SessionItem[]
  showInstructorInfo?: boolean
}

export function SessionsListCard({ sessions, showInstructorInfo = false }: SessionsListCardProps) {
  const columns: ColumnsType<SessionItem> = [
    {
      title: '회차',
      dataIndex: 'title',
      key: 'title',
      width: 100,
      render: (text: string) => <span className="text-sm font-medium text-slate-900">{text}</span>,
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      width: 130,
      render: (text: string) => <span className="text-sm text-slate-700">{text}</span>,
    },
    {
      title: '시작시간',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
      render: (text: string) => <span className="text-sm text-slate-700">{text}</span>,
    },
    {
      title: '종료시간',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
      render: (text: string) => <span className="text-sm text-slate-700">{text}</span>,
    },
    {
      title: '주강사 수',
      dataIndex: 'mainInstructors',
      key: 'mainInstructors',
      width: 100,
      render: (count: number) => (
        <span className="text-sm text-slate-700">{count !== undefined ? count : '-'}</span>
      ),
    },
    {
      title: '보조강사 수',
      dataIndex: 'assistantInstructors',
      key: 'assistantInstructors',
      width: 100,
      render: (count: number) => (
        <span className="text-sm text-slate-700">{count !== undefined ? count : '-'}</span>
      ),
    },
  ]

  // Add instructor info columns if needed
  if (showInstructorInfo) {
    columns.push(
      {
        title: '주강사',
        dataIndex: 'mainInstructorName',
        key: 'mainInstructorName',
        width: 130,
        render: (text: string) => <span className="text-sm text-slate-700">{text || '-'}</span>,
      },
      {
        title: '보조강사',
        dataIndex: 'assistantInstructorName',
        key: 'assistantInstructorName',
        width: 130,
        render: (text: string) => <span className="text-sm text-slate-700">{text || '-'}</span>,
      }
    )
  }

  return (
    <DetailSectionCard title="수업 정보" helperText={`총 ${sessions.length}건`}>
      <Table
        columns={columns}
        dataSource={sessions.map((session, idx) => ({ ...session, key: `session-${idx}` }))}
        pagination={false}
        size="middle"
        className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-slate-100"
      />
    </DetailSectionCard>
  )
}






