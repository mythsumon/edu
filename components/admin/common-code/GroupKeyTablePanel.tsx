'use client'

import { useState, useMemo } from 'react'
import { Table, Button, Card, Input, Dropdown, MenuProps, Switch } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Plus, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { GroupKey } from './types'

interface GroupKeyTablePanelProps {
  groupKeys: GroupKey[]
  selectedGroupId: string | null
  onAdd: () => void
  onEdit: (key: GroupKey) => void
  onDelete: (keyId: string) => void
  onToggleEnabled: (keyId: string, enabled: boolean) => void
}

export function GroupKeyTablePanel({
  groupKeys,
  selectedGroupId,
  onAdd,
  onEdit,
  onDelete,
  onToggleEnabled,
}: GroupKeyTablePanelProps) {
  const [searchText, setSearchText] = useState('')

  const filteredKeys = useMemo(() => {
    if (!selectedGroupId) return []
    return groupKeys
      .filter((key) => key.groupId === selectedGroupId)
      .filter(
        (key) =>
          key.label.toLowerCase().includes(searchText.toLowerCase()) ||
          key.value.toLowerCase().includes(searchText.toLowerCase())
      )
      .sort((a, b) => a.sortOrder - b.sortOrder)
  }, [groupKeys, selectedGroupId, searchText])

  const columns: ColumnsType<GroupKey> = [
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      render: (text: string) => <span className="text-sm font-medium text-slate-900">{text}</span>,
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (text: string) => <span className="text-sm text-slate-600">{text}</span>,
    },
    {
      title: 'Sort Order',
      dataIndex: 'sortOrder',
      key: 'sortOrder',
      width: 100,
      align: 'center' as const,
      render: (order: number) => <span className="text-sm text-slate-600">{order}</span>,
    },
    {
      title: 'Enabled',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      align: 'center' as const,
      render: (enabled: boolean, record) => (
        <Switch
          checked={enabled}
          onChange={(checked) => onToggleEnabled(record.id, checked)}
          className="[&_.ant-switch-checked]:bg-blue-600"
          onClick={(e) => e.stopPropagation()}
        />
      ),
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

  if (!selectedGroupId) {
    return (
      <Card className="rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
        <div className="flex items-center justify-between mb-4 px-1">
          <h3 className="text-lg font-semibold text-slate-900">Group Keys</h3>
        </div>
        <div className="flex-1 flex items-center justify-center py-12">
          <p className="text-sm text-slate-500">Select a group to view keys.</p>
        </div>
      </Card>
    )
  }

  return (
    <Card className="rounded-2xl shadow-sm border border-slate-200 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-lg font-semibold text-slate-900">Group Keys</h3>
        <Button
          type="primary"
          icon={<Plus className="w-4 h-4" />}
          onClick={onAdd}
          disabled={!selectedGroupId}
          className="h-9 px-4 rounded-xl border-0 font-medium text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-slate-400 disabled:text-white/70 disabled:cursor-not-allowed"
        >
          추가
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 z-10" />
          <Input
            placeholder="Search key/value..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className="h-9 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition hover:border-slate-300 focus:border-blue-400 focus:ring-2 focus:ring-blue-400 [&_.ant-input]:!h-9 [&_.ant-input]:!px-0 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input]:!text-sm [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-wrapper]:!bg-transparent [&_.ant-input-clear-icon]:!text-slate-400"
          />
        </div>
      </div>

      {filteredKeys.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-sm text-slate-500 mb-2">No results found</p>
            <Button
              type="link"
              onClick={() => setSearchText('')}
              className="text-blue-600 hover:text-blue-700 text-sm"
            >
              Clear filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-hidden">
          <Table
            columns={columns}
            dataSource={filteredKeys}
            rowKey="id"
            size="small"
            pagination={false}
            scroll={{ y: 'calc(100vh - 400px)' }}
            className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100"
          />
        </div>
      )}
    </Card>
  )
}


