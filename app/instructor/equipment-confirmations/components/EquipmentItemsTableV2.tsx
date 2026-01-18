'use client'

import { Button, Input, InputNumber } from 'antd'
import { Plus, Minus } from 'lucide-react'

interface EquipmentItemRow {
  id: string
  leftItemName?: string
  leftQty?: number
  rightItemName?: string
  rightQty?: number
}

interface EquipmentItemsTableV2Props {
  items: EquipmentItemRow[]
  onChange: (items: EquipmentItemRow[]) => void
  disabled?: boolean
}

export function EquipmentItemsTableV2({
  items,
  onChange,
  disabled = false,
}: EquipmentItemsTableV2Props) {
  const handleAddRow = () => {
    const newItem: EquipmentItemRow = {
      id: `item-${Date.now()}-${Math.random()}`,
    }
    onChange([...items, newItem])
  }

  const handleRemoveRow = (id: string) => {
    onChange(items.filter(item => item.id !== id))
  }

  const handleItemChange = (id: string, field: keyof EquipmentItemRow, value: string | number | undefined) => {
    onChange(
      items.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    )
  }

  // Ensure at least 5 rows
  const displayItems: EquipmentItemRow[] = items.length < 5
    ? [...items, ...Array(5 - items.length).fill(null).map((_, i) => ({
        id: `placeholder-${i}`,
        leftItemName: undefined,
        leftQty: undefined,
        rightItemName: undefined,
        rightQty: undefined,
      }))]
    : items

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="grid grid-cols-4 gap-4 border-b-2 border-gray-300 pb-2">
        <div className="text-sm font-semibold text-gray-700 text-center">품명</div>
        <div className="text-sm font-semibold text-gray-700 text-center">수량</div>
        <div className="text-sm font-semibold text-gray-700 text-center">품명</div>
        <div className="text-sm font-semibold text-gray-700 text-center">수량</div>
      </div>

      {/* Table Rows */}
      <div className="space-y-2">
        {displayItems.map((item, index) => {
          const isPlaceholder = item.id.startsWith('placeholder-')
          
          return (
            <div key={item.id} className="grid grid-cols-4 gap-4 items-center">
              <Input
                value={item.leftItemName || ''}
                onChange={(e) => handleItemChange(item.id, 'leftItemName', e.target.value)}
                placeholder="품명"
                disabled={disabled || isPlaceholder}
                className="rounded-lg"
              />
              <InputNumber
                value={item.leftQty}
                onChange={(value) => handleItemChange(item.id, 'leftQty', value || undefined)}
                placeholder="수량"
                disabled={disabled || isPlaceholder}
                min={0}
                className="w-full rounded-lg"
              />
              <Input
                value={item.rightItemName || ''}
                onChange={(e) => handleItemChange(item.id, 'rightItemName', e.target.value)}
                placeholder="품명"
                disabled={disabled || isPlaceholder}
                className="rounded-lg"
              />
              <div className="flex items-center gap-2">
                <InputNumber
                  value={item.rightQty}
                  onChange={(value) => handleItemChange(item.id, 'rightQty', value || undefined)}
                  placeholder="수량"
                  disabled={disabled || isPlaceholder}
                  min={0}
                  className="flex-1 rounded-lg"
                />
                {!isPlaceholder && !disabled && (
                  <Button
                    type="text"
                    danger
                    icon={<Minus className="w-4 h-4" />}
                    onClick={() => handleRemoveRow(item.id)}
                    className="flex-shrink-0"
                  />
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Add Row Button */}
      {!disabled && (
        <div className="flex justify-end pt-2">
          <Button
            type="dashed"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddRow}
            className="rounded-lg"
          >
            + 행 추가
          </Button>
        </div>
      )}
    </div>
  )
}
