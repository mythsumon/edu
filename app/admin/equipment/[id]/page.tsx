'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Input, Select, DatePicker, TimePicker, Switch, Space, Spin, Alert } from 'antd'
import { ArrowLeft, Save, Trash2, X, Plus } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { programService } from '@/services/programService'
import { EquipmentData, RentalItem } from '@/types/program'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Breadcrumb, PageTitle } from '@/components/shared/common'

const { TextArea } = Input
dayjs.locale('ko')

export default function AdminEquipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)
  const [data, setData] = useState<EquipmentData | null>(null)
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const id = parseInt(params.id as string)
        const equipmentData = await programService.getEquipmentData(id)
        setData(equipmentData)
        setRentalItems(equipmentData.rentalItems)
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleCancel = () => {
    setIsEditMode(false)
    if (data) {
      setRentalItems(data.rentalItems)
    }
  }

  const handleSave = async () => {
    if (!data) return
    
    try {
      const updatedData = { ...data, rentalItems }
      await programService.updateEquipmentData(updatedData)
      setData(updatedData)
      setIsEditMode(false)
    } catch (err) {
      setError('데이터 저장 중 오류가 발생했습니다.')
      console.error(err)
    }
  }

  const handleDelete = () => {
    console.log('Delete equipment:', data?.id)
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="p-6 flex items-center justify-center min-h-screen">
          <Spin size="large" />
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="p-6">
          <Alert message="오류" description={error} type="error" showIcon />
        </div>
      </ProtectedRoute>
    )
  }

  if (!data) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="p-6">
          <Alert message="알림" description="장비 데이터를 찾을 수 없습니다." type="warning" showIcon />
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">
        <Breadcrumb />
        
        <div className="flex items-center justify-between mb-6">
          <PageTitle />
          <Space>
            {!isEditMode ? (
              <>
                <Button
                  type="primary"
                  onClick={handleEdit}
                  className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium transition-all shadow-sm hover:shadow-md"
                >
                  수정하기
                </Button>
                <Button
                  danger
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={handleDelete}
                  className="h-11 px-6 rounded-xl font-medium transition-all"
                >
                  삭제
                </Button>
              </>
            ) : (
              <>
                <Button
                  type="primary"
                  icon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                  className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium transition-all shadow-sm hover:shadow-md"
                >
                  저장
                </Button>
                <Button
                  icon={<X className="w-4 h-4" />}
                  onClick={handleCancel}
                  className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                >
                  취소
                </Button>
              </>
            )}
          </Space>
        </div>

        <div className="space-y-6 max-w-7xl mx-auto">
          <Card className="rounded-xl shadow-sm border border-gray-200">
            <div className="space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{data.name}</h2>
                <p className="text-gray-600 mt-2">{data.description}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

