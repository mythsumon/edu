'use client'

import { useState, useMemo } from 'react'
import { Table, Button, Card, Input, Dropdown, MenuProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { Title } from './types'
import { StatusPill } from './StatusPill'

interface TitleTablePanelProps {
  titles: Title[]
  selectedTitleId: string | null
  onSelectTitle: (titleId: string | null) => void
  onAdd: () => void
  onEdit: (title: Title) => void
  onDelete: (titleId: string) => void
}

export function TitleTablePanel({
  titles,
  selectedTitleId,
  onSelectTitle,
  onAdd,
  onEdit,
  onDelete,
}: TitleTablePanelProps) {
  const [searchText, setSearchText] = useState('')

  const filteredTitles = useMemo(() => {
    return titles.filter((title) =>
      title.name.toLowerCase().includes(searchText.toLowerCase())
    )
  }, [titles, searchText])

  const columns: ColumnsType<Title> = [
    {
      title: 'Title Name',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      width: 150,
      render: (text: string) => (
        <span className="text-sm font-medium text-slate-900 whitespace-nowrap overflow-hidden text-ellipsis block">
          {text}
        </span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: 'Active' | 'Inactive') => <StatusPill status={status} />,
    },
    {
      title: 'Count',
      dataIndex: 'groupCount',
      key: 'groupCount',
      width: 80,
      align: 'center' as const,
      render: (count: number) => <span className="text-sm text-slate-600">{count}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right' as const,
      render: (_, record) => {
        const items: MenuProps['items'] = [
          {
            key: 'edit',
            label: '수정',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => onEdit(record),
          },
          {
            key: 'delete',
            label: '삭제',
            icon: <Trash2 className="w-4 h-4" />,
            danger: true,
            onClick: () => onDelete(record.id),
          },
        ]

        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button
              type="text"
              icon={<MoreVertical className="w-4 h-4" />}
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            />
          </Dropdown>
        )
      },
    },
  ]

  return (
    <Card className="rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-semibold text-slate-900">Title</h3>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={onAdd}
          className="h-9 px-4 rounded-xl border-0 font-medium text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          추가
        </Button>
      </div>

      <div className="mb-4">
        <Input
          placeholder="Search title..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
          prefix={<Search className="h-4 w-4 text-slate-400" />}
          className="cc-search-input h-9 w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 transition hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
        />
      </div>

      <div className="flex-1 overflow-hidden">
        <Table
          columns={columns}
          dataSource={filteredTitles}
          rowKey="id"
          size="small"
          pagination={false}
          scroll={{ y: 'calc(100vh - 400px)' }}
          onRow={(record) => ({
            onClick: () => onSelectTitle(record.id === selectedTitleId ? null : record.id),
            className: `cursor-pointer ${record.id === selectedTitleId ? 'bg-slate-100' : 'hover:bg-slate-50/60'}`,
          })}
          className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:whitespace-nowrap [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100 [&_.ant-table-cell]:overflow-hidden [&_.ant-table-cell]:text-ellipsis"
        />
      </div>
    </Card>
  )
}


