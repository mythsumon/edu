'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Card, Input, Button, DatePicker, Badge, Space, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Calendar, RefreshCw, Info } from 'lucide-react'
import { getInventory, getInventoryByDate } from '@/app/instructor/equipment-confirmations/admin-helpers'
import { getAllEquipmentConfirmations } from '@/app/instructor/equipment-confirmations/storage-v2'
import type { InventoryItem } from '@/app/instructor/equipment-confirmations/types'
import dayjs, { Dayjs } from 'dayjs'

/**
 * 교구 확인서 위시리스트 페이지
 * 교구 확인서 데이터를 기반으로 현재 어떤 교구가 몇 대 대여중이고 몇 대의 여유가 있는지 파악
 */
export default function EquipmentWishlistPage() {
  const router = useRouter()
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null)
  const [searchText, setSearchText] = useState('')
  const [loading, setLoading] = useState(false)

  // Load inventory data
  useEffect(() => {
    refreshInventory()
  }, [selectedDate])

  const refreshInventory = () => {
    setLoading(true)
    try {
      let data: InventoryItem[]
      
      if (selectedDate) {
        // 특정 날짜의 재고 현황
        data = getInventoryByDate(selectedDate.toDate())
      } else {
        // 현재 재고 현황 (모든 대여중인 교구 확인서 기반)
        data = getInventory()
      }
      
      setInventory(data)
    } catch (error) {
      console.error('Error loading inventory:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter by search text
  const filteredInventory = useMemo(() => {
    if (!searchText) return inventory
    
    const lowerSearch = searchText.toLowerCase()
    return inventory.filter(item => 
      item.name.toLowerCase().includes(lowerSearch)
    )
  }, [inventory, searchText])

  // Calculate summary statistics
  const summary = useMemo(() => {
    const total = filteredInventory.length
    const available = filteredInventory.filter(item => item.availableQty > 0).length
    const shortage = filteredInventory.filter(item => item.availableQty < 0).length
    const outOfStock = filteredInventory.filter(item => item.availableQty === 0).length
    const totalRented = filteredInventory.reduce((sum, item) => sum + item.rentedQty, 0)
    const totalAvailable = filteredInventory.reduce((sum, item) => sum + Math.max(0, item.availableQty), 0)

    return {
      total,
      available,
      shortage,
      outOfStock,
      totalRented,
      totalAvailable,
    }
  }, [filteredInventory])

  const columns: ColumnsType<InventoryItem> = [
    {
      title: '교구명',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text) => (
        <span className="font-semibold text-slate-900">{text}</span>
      ),
    },
    {
      title: '총 재고',
      dataIndex: 'totalQty',
      key: 'totalQty',
      align: 'center',
      width: 100,
      render: (text) => (
        <span className="text-slate-700">{text}</span>
      ),
    },
    {
      title: '파손',
      dataIndex: 'brokenQty',
      key: 'brokenQty',
      align: 'center',
      width: 80,
      render: (text) => (
        <span className="text-orange-600">{text}</span>
      ),
    },
    {
      title: '대여중',
      dataIndex: 'rentedQty',
      key: 'rentedQty',
      align: 'center',
      width: 100,
      render: (text) => (
        <span className="text-blue-600 font-semibold">{text}</span>
      ),
    },
    {
      title: '가용 재고',
      dataIndex: 'availableQty',
      key: 'availableQty',
      align: 'center',
      width: 120,
      render: (text) => (
        <span className={`font-semibold ${
          text < 0 ? 'text-red-600' : 
          text === 0 ? 'text-orange-600' : 
          'text-green-600'
        }`}>
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
          return (
            <Tooltip title={`재고 부족: ${Math.abs(record.availableQty)}개 부족`}>
              <Badge status="error" text="부족" />
            </Tooltip>
          )
        } else if (record.availableQty === 0) {
          return (
            <Tooltip title="가용 재고 없음">
              <Badge status="warning" text="없음" />
            </Tooltip>
          )
        } else {
          return (
            <Tooltip title={`${record.availableQty}개 대여 가능`}>
              <Badge status="success" text="가능" />
            </Tooltip>
          )
        }
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  교구 확인서 위시리스트
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  교구 확인서 데이터를 기반으로 현재 대여 현황 및 가용 재고를 확인합니다
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="text-center">
              <div className="text-sm text-gray-500 mb-1">전체 교구</div>
              <div className="text-2xl font-bold text-gray-900">{summary.total}종</div>
            </Card>
            <Card className="text-center">
              <div className="text-sm text-gray-500 mb-1">대여 가능</div>
              <div className="text-2xl font-bold text-green-600">{summary.available}종</div>
            </Card>
            <Card className="text-center">
              <div className="text-sm text-gray-500 mb-1">재고 부족</div>
              <div className="text-2xl font-bold text-red-600">{summary.shortage}종</div>
            </Card>
            <Card className="text-center">
              <div className="text-sm text-gray-500 mb-1">총 대여중</div>
              <div className="text-2xl font-bold text-blue-600">{summary.totalRented}대</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              <div className="flex-1 w-full md:w-auto">
                <Input
                  prefix={<Search className="w-4 h-4 text-gray-400" />}
                  placeholder="교구명으로 검색..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </div>
              <div className="flex items-center gap-2">
                <DatePicker
                  placeholder="날짜 선택 (선택사항)"
                  value={selectedDate}
                  onChange={(date) => setSelectedDate(date)}
                  allowClear
                  format="YYYY-MM-DD"
                  suffixIcon={<Calendar className="w-4 h-4" />}
                />
                <Tooltip title="특정 날짜의 대여 현황을 확인하려면 날짜를 선택하세요. 선택하지 않으면 현재 대여중인 모든 교구를 표시합니다.">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <Button
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={refreshInventory}
                loading={loading}
              >
                새로고침
              </Button>
            </div>
            {selectedDate && (
              <div className="mt-3 text-sm text-gray-600">
                <span className="font-medium">{selectedDate.format('YYYY년 MM월 DD일')}</span> 기준 대여 현황을 표시합니다.
              </div>
            )}
          </Card>

          {/* Table */}
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  교구 재고 현황
                </h2>
                <Tooltip title="교구 확인서에서 '대여중' 상태인 교구 확인서의 교구 수량을 합산하여 대여중 수량을 계산합니다. 가용 재고 = 총 재고 - 파손 - 대여중">
                  <Info className="w-4 h-4 text-gray-400 cursor-help" />
                </Tooltip>
              </div>
              <div className="text-sm text-gray-500">
                총 {filteredInventory.length}건
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={filteredInventory}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}건`,
              }}
              scroll={{ x: 'max-content' }}
            />
          </Card>

          {/* Info Box */}
          <Card className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800 dark:text-blue-200">
                <div className="font-semibold mb-1">재고 계산 기준</div>
                <ul className="list-disc list-inside space-y-1 text-blue-700 dark:text-blue-300">
                  <li>대여중: 교구 확인서 상태가 '대여중(BORROWED)'인 모든 확인서의 교구 수량 합계</li>
                  <li>가용 재고 = 총 재고 - 파손 수량 - 대여중 수량</li>
                  <li>날짜를 선택하면 해당 날짜에 대여 기간이 포함된 교구 확인서만 계산됩니다</li>
                  <li>날짜를 선택하지 않으면 현재 '대여중' 상태인 모든 확인서를 기준으로 계산됩니다</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
