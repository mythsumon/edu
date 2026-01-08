'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Table, Card, Input, InputNumber, Space, message, Modal, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Plus, Trash2, Edit, Save, X, ArrowLeft } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DetailSectionCard } from '@/components/admin/operations'
import {
  getInventory,
  saveInventory,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from '@/app/instructor/equipment-confirmations/admin-helpers'
import type { InventoryItem } from '@/app/instructor/equipment-confirmations/types'

export default function TeachingAidsInventoryPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<{ name: string; totalQty: number; brokenQty: number } | null>(null)
  const [addModalVisible, setAddModalVisible] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', totalQty: 0, brokenQty: 0 })
  const [searchText, setSearchText] = useState('')

  // Load inventory
  useEffect(() => {
    const loaded = getInventory()
    setInventory(loaded)
  }, [])

  // Refresh inventory when data changes
  const refreshInventory = () => {
    const loaded = getInventory()
    setInventory(loaded)
  }

  // Filter inventory by search text
  const filteredInventory = useMemo(() => {
    if (!searchText) return inventory
    const lowerSearch = searchText.toLowerCase()
    return inventory.filter(item => item.name.toLowerCase().includes(lowerSearch))
  }, [inventory, searchText])

  const handleEdit = (item: InventoryItem) => {
    setEditingId(item.id)
    setEditForm({
      name: item.name,
      totalQty: item.totalQty,
      brokenQty: item.brokenQty,
    })
  }

  const handleSaveEdit = () => {
    if (!editingId || !editForm) return
    
    if (!editForm.name.trim()) {
      message.warning('품명을 입력해주세요.')
      return
    }
    
    if (editForm.brokenQty > editForm.totalQty) {
      message.warning('파손 수량은 총 재고를 초과할 수 없습니다.')
      return
    }

    updateInventoryItem(editingId, editForm)
    setEditingId(null)
    setEditForm(null)
    refreshInventory()
    message.success('재고가 수정되었습니다.')
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  const handleDelete = (id: string, name: string) => {
    Modal.confirm({
      title: '재고 삭제',
      content: `"${name}" 재고를 삭제하시겠습니까?`,
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: () => {
        deleteInventoryItem(id)
        refreshInventory()
        message.success('재고가 삭제되었습니다.')
      },
    })
  }

  const handleAdd = () => {
    if (!newItem.name.trim()) {
      message.warning('품명을 입력해주세요.')
      return
    }
    
    if (newItem.brokenQty > newItem.totalQty) {
      message.warning('파손 수량은 총 재고를 초과할 수 없습니다.')
      return
    }

    addInventoryItem(newItem)
    setNewItem({ name: '', totalQty: 0, brokenQty: 0 })
    setAddModalVisible(false)
    refreshInventory()
    message.success('재고가 추가되었습니다.')
  }

  const columns: ColumnsType<InventoryItem> = [
    {
      title: '품명',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => {
        if (editingId === record.id && editForm) {
          return (
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="품명"
            />
          )
        }
        return <span className="font-medium">{text}</span>
      },
    },
    {
      title: '총 재고',
      dataIndex: 'totalQty',
      key: 'totalQty',
      align: 'center',
      width: 120,
      render: (text, record) => {
        if (editingId === record.id && editForm) {
          return (
            <InputNumber
              value={editForm.totalQty}
              onChange={(value) => setEditForm({ ...editForm, totalQty: value || 0 })}
              min={0}
              className="w-full"
            />
          )
        }
        return <span>{text}</span>
      },
    },
    {
      title: '파손',
      dataIndex: 'brokenQty',
      key: 'brokenQty',
      align: 'center',
      width: 120,
      render: (text, record) => {
        if (editingId === record.id && editForm) {
          return (
            <InputNumber
              value={editForm.brokenQty}
              onChange={(value) => setEditForm({ ...editForm, brokenQty: value || 0 })}
              min={0}
              max={editForm.totalQty}
              className="w-full"
            />
          )
        }
        return <span className={text > 0 ? 'text-orange-600' : ''}>{text}</span>
      },
    },
    {
      title: '대여중',
      dataIndex: 'rentedQty',
      key: 'rentedQty',
      align: 'center',
      width: 120,
      render: (text) => <span className={text > 0 ? 'text-blue-600' : ''}>{text}</span>,
    },
    {
      title: '가용 재고',
      dataIndex: 'availableQty',
      key: 'availableQty',
      align: 'center',
      width: 120,
      render: (text) => (
        <span className={`font-semibold ${text < 0 ? 'text-red-600' : text === 0 ? 'text-orange-600' : 'text-green-600'}`}>
          {text}
        </span>
      ),
    },
    {
      title: '상태',
      key: 'status',
      align: 'center',
      width: 100,
      render: (_, record) => {
        if (record.availableQty < 0) {
          return <Badge status="error" text="부족" />
        } else if (record.availableQty === 0) {
          return <Badge status="warning" text="없음" />
        } else {
          return <Badge status="success" text="가능" />
        }
      },
    },
    {
      title: '관리',
      key: 'actions',
      align: 'center',
      width: 150,
      render: (_, record) => {
        if (editingId === record.id) {
          return (
            <Space>
              <Button
                size="small"
                type="primary"
                icon={<Save className="w-3 h-3" />}
                onClick={handleSaveEdit}
              >
                저장
              </Button>
              <Button
                size="small"
                icon={<X className="w-3 h-3" />}
                onClick={handleCancelEdit}
              >
                취소
              </Button>
            </Space>
          )
        }
        return (
          <Space>
            <Button
              size="small"
              icon={<Edit className="w-3 h-3" />}
              onClick={() => handleEdit(record)}
            >
              수정
            </Button>
            <Button
              size="small"
              danger
              icon={<Trash2 className="w-3 h-3" />}
              onClick={() => handleDelete(record.id, record.name)}
            >
              삭제
            </Button>
          </Space>
        )
      },
    },
  ]

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => router.back()}
                  className="flex items-center dark:text-gray-300"
                >
                  돌아가기
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  교구 재고 관리
                </h1>
              </div>
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => setAddModalVisible(true)}
              >
                재고 추가
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          <DetailSectionCard title="재고 목록">
            <div className="space-y-4">
              {/* Search */}
              <div className="flex items-center gap-4">
                <Input
                  placeholder="품명으로 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="max-w-xs"
                  allowClear
                />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  총 {filteredInventory.length}개 항목
                </div>
              </div>

              {/* Table */}
              <Table
                columns={columns}
                dataSource={filteredInventory}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showTotal: (total) => `총 ${total}개`,
                }}
                bordered
              />
            </div>
          </DetailSectionCard>
        </div>
      </div>

      {/* Add Modal */}
      <Modal
        title="재고 추가"
        open={addModalVisible}
        onOk={handleAdd}
        onCancel={() => {
          setAddModalVisible(false)
          setNewItem({ name: '', totalQty: 0, brokenQty: 0 })
        }}
        okText="추가"
        cancelText="취소"
      >
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              품명 <span className="text-red-500">*</span>
            </label>
            <Input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="품명을 입력하세요"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              총 재고 <span className="text-red-500">*</span>
            </label>
            <InputNumber
              value={newItem.totalQty}
              onChange={(value) => setNewItem({ ...newItem, totalQty: value || 0 })}
              min={0}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              파손 수량
            </label>
            <InputNumber
              value={newItem.brokenQty}
              onChange={(value) => setNewItem({ ...newItem, brokenQty: value || 0 })}
              min={0}
              max={newItem.totalQty}
              className="w-full"
            />
          </div>
        </div>
      </Modal>
    </ProtectedRoute>
  )
}


