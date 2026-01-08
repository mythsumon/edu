'use client'

import { Table, InputNumber, Button, Input } from 'antd'
import { Plus, Trash2 } from 'lucide-react'
import type { ColumnsType } from 'antd/es/table'
import { EquipmentItem } from '../types'

interface EquipmentItemsTableProps {
  items: EquipmentItem[]
  onChange: (items: EquipmentItem[]) => void
  disabled?: boolean
}

export function EquipmentItemsTable({ items, onChange, disabled = false }: EquipmentItemsTableProps) {
  const handleAddItem = () => {
    const newItem: EquipmentItem = {
      id: `item-${Date.now()}`,
      name: '',
      quantity: 1,
    }
    onChange([...items, newItem])
  }

  const handleRemoveItem = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  const handleFieldChange = (id: string, field: keyof EquipmentItem, value: string | number) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    )
    onChange(updated)
  }

  const columns: ColumnsType<EquipmentItem> = [
    {
      title: '품명',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) =>
        disabled ? (
          <span>{text}</span>
        ) : (
          <Input
            value={text}
            onChange={(e) => handleFieldChange(record.id, 'name', e.target.value)}
            placeholder="품명 입력"
            className="w-full"
          />
        ),
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 120,
      align: 'center',
      render: (text, record) =>
        disabled ? (
          <span>{text}</span>
        ) : (
          <InputNumber
            value={text}
            onChange={(value) => handleFieldChange(record.id, 'quantity', value || 1)}
            min={1}
            className="w-full"
          />
        ),
    },
    {
      title: '관리',
      key: 'actions',
      width: 80,
      align: 'center',
      render: (_, record) =>
        !disabled && (
          <Button
            danger
            icon={<Trash2 className="w-3 h-3" />}
            onClick={() => handleRemoveItem(record.id)}
            size="small"
          />
        ),
    },
  ]

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        dataSource={items}
        rowKey="id"
        pagination={false}
        bordered
        size="small"
      />
      {!disabled && (
        <Button
          type="dashed"
          onClick={handleAddItem}
          block
          icon={<Plus className="w-4 h-4" />}
          className="mt-4"
        >
          교구 추가
        </Button>
      )}
    </div>
  )
}


