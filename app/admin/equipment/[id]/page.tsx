'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Input, Select, DatePicker, TimePicker, Switch, Space, Spin, Alert, Table } from 'antd'
import { ArrowLeft, Save, Trash2, X, Plus } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { programService } from '@/services/programService'
import { EquipmentData, RentalItem } from '@/types/program'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import {
  DetailPageHeaderSticky,
  EquipmentSummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
} from '@/components/admin/operations'

const { TextArea } = Input
dayjs.locale('ko')

export default function EquipmentDetailPage() {
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
        if (params && params.id) {
          const id = parseInt(params.id as string)
          const equipmentData = await programService.getEquipmentData(id)
          setData(equipmentData)
          setRentalItems(equipmentData.rentalItems)
        }
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params && params.id) {
      fetchData()
    }
  }, [params?.id])

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleCancel = () => {
    setIsEditMode(false)
    if (data) {
      setRentalItems(data.rentalItems) // Reset to original data
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
    // In real app, show confirmation modal and delete
    console.log('Delete equipment:', data?.id)
  }

  const handleAddRentalItem = () => {
    const newItem: RentalItem = {
      id: `new-${Date.now()}`,
      itemName: '',
      quantity: 1,
    }
    setRentalItems([...rentalItems, newItem])
  }

  const handleDeleteRentalItem = (itemId: string) => {
    setRentalItems(rentalItems.filter(item => item.id !== itemId))
  }

  const handleRentalItemChange = (itemId: string, field: keyof RentalItem, value: any) => {
    setRentalItems(
      rentalItems.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    )
  }

  const handleBack = () => {
    router.back();
  }

  const handleEditFromDetail = () => {
    setIsEditMode(true)
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
          <Alert message="데이터 없음" description="교구 확인서 데이터를 찾을 수 없습니다." type="warning" showIcon />
        </div>
      </ProtectedRoute>
    )
  }

  if (!isEditMode) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="bg-slate-50 min-h-screen px-6 pt-0">
          {/* Sticky Header */}
          <DetailPageHeaderSticky
            onBack={handleBack}
            onEdit={handleEditFromDetail}
            onDelete={handleDelete}
          />

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
            {/* Summary Card */}
            <EquipmentSummaryCard
              assignmentNumber={data.assignmentNumber}
              courseName={data.courseName}
              institution={data.institution}
              educationDate={data.educationDate}
              instructorName={data.instructorName}
              currentSession={data.currentSession}
              totalSessions={data.totalSessions}
            />

            {/* Basic Info Section */}
            <DetailSectionCard title="기본 정보">
              <DefinitionListGrid
                items={[
                  { label: '과제번호', value: data.assignmentNumber },
                  { label: '교육과정명', value: data.courseName },
                  { label: '교육기관', value: data.institution },
                  { label: '교육일자', value: data.educationDate },
                  { label: '담당차시 / 총차시', value: `${data.currentSession} / ${data.totalSessions}` },
                  { label: '당일 참여 강사', value: data.instructorName },
                  { label: '예상 참가 인원', value: `${data.expectedParticipants}명` },
                ]}
                columns={2}
              />
            </DetailSectionCard>

            {/* Rental Info Section */}
            <DetailSectionCard title="대여 정보">
              <DefinitionListGrid
                items={[
                  { label: '대여일자', value: data.rentalDate },
                  { label: '대여시간', value: data.rentalTime },
                  { label: '대여자', value: data.renterName },
                  { label: '비고', value: data.notes || '-', span: 2 },
                ]}
                columns={2}
              />
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">대여 교구 목록</h4>
                <Table
                  columns={[
                    {
                      title: '교구명',
                      dataIndex: 'itemName',
                      key: 'itemName',
                    },
                    {
                      title: '수량',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      render: (text) => `${text}개`,
                    },
                  ]}
                  dataSource={rentalItems}
                  pagination={false}
                  className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm"
                />
              </div>
            </DetailSectionCard>

            {/* Return Info Section */}
            <DetailSectionCard title="반납 정보">
              <DefinitionListGrid
                items={[
                  { label: '반납자', value: data.returnerName },
                  { label: '반납일자', value: data.returnDate },
                  { label: '반납시간', value: data.returnTime },
                  { label: '반납자 확인', value: data.returnerNameConfirm },
                  { label: '반납일자 확인', value: data.returnDateConfirm },
                  { label: '반납시간 확인', value: data.returnTimeConfirm },
                  { label: '반납 상태', value: data.returnStatus },
                  { label: '반납 수량', value: `${data.returnQuantity}개` },
                  { label: '대상 적합 여부', value: data.targetEligible ? '적합' : '부적합' },
                  { label: '비고', value: data.remarks || '-', span: 2 },
                  { label: '서명 생략', value: data.signatureOmitted ? '생략' : '필요' },
                  { label: '서명자', value: data.signatureName || '-' },
                  { label: '서명일', value: data.signatureDate },
                ]}
                columns={2}
              />
            </DetailSectionCard>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Edit Mode
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="bg-slate-50 min-h-screen px-6 pt-0">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              icon={<X className="w-4 h-4" />}
              onClick={handleCancel}
              className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
            >
              취소
            </Button>
            <Space>
              <Button
                type="primary"
                icon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                저장
              </Button>
            </Space>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
          {/* Summary Card */}
          <EquipmentSummaryCard
            assignmentNumber={data.assignmentNumber}
            courseName={data.courseName}
            institution={data.institution}
            educationDate={data.educationDate}
            instructorName={data.instructorName}
            currentSession={data.currentSession}
            totalSessions={data.totalSessions}
          />

          {/* Basic Info Section */}
          <DetailSectionCard title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">과제번호</label>
                <Input
                  value={data.assignmentNumber}
                  onChange={(e) => setData({ ...data, assignmentNumber: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">교육과정명</label>
                <Input
                  value={data.courseName}
                  onChange={(e) => setData({ ...data, courseName: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">교육기관</label>
                <Input
                  value={data.institution}
                  onChange={(e) => setData({ ...data, institution: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">교육일자</label>
                <DatePicker
                  value={dayjs(data.educationDate)}
                  onChange={(date) => setData({ ...data, educationDate: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">담당차시 / 총차시</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={data.currentSession}
                    onChange={(e) => setData({ ...data, currentSession: parseInt(e.target.value) || 0 })}
                    placeholder="담당차시"
                    className="h-11 rounded-xl flex-1"
                  />
                  <span className="text-gray-500">/</span>
                  <Input
                    type="number"
                    value={data.totalSessions}
                    onChange={(e) => setData({ ...data, totalSessions: parseInt(e.target.value) || 0 })}
                    placeholder="총차시"
                    className="h-11 rounded-xl flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">당일 참여 강사</label>
                <Input
                  value={data.instructorName}
                  onChange={(e) => setData({ ...data, instructorName: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">예상 참가 인원</label>
                <Input
                  type="number"
                  value={data.expectedParticipants}
                  onChange={(e) => setData({ ...data, expectedParticipants: parseInt(e.target.value) || 0 })}
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </DetailSectionCard>

          {/* Rental Info Section */}
          <DetailSectionCard title="대여 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">대여일자</label>
                <DatePicker
                  value={dayjs(data.rentalDate)}
                  onChange={(date) => setData({ ...data, rentalDate: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">대여시간</label>
                <TimePicker
                  value={dayjs(data.rentalTime, 'HH:mm')}
                  onChange={(time) => setData({ ...data, rentalTime: time ? time.format('HH:mm') : '' })}
                  format="HH:mm"
                  className="w-full h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">대여자</label>
                <Input
                  value={data.renterName}
                  onChange={(e) => setData({ ...data, renterName: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">비고</label>
                <TextArea
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  rows={1}
                  className="rounded-xl"
                />
              </div>
            </div>

            {/* Rental Items Table */}
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  type="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddRentalItem}
                  className="h-9 px-4 rounded-lg border-0 text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  교구 추가
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table
                  columns={[
                    {
                      title: '교구명',
                      dataIndex: 'itemName',
                      key: 'itemName',
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) => handleRentalItemChange(record.id, 'itemName', e.target.value)}
                          className="h-8 rounded-lg"
                        />
                      ),
                    },
                    {
                      title: '수량',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      render: (text, record) => (
                        <Input
                          type="number"
                          value={text}
                          onChange={(e) => handleRentalItemChange(record.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="h-8 rounded-lg w-24"
                        />
                      ),
                    },
                    {
                      title: '삭제',
                      key: 'action',
                      width: 80,
                      render: (_, record) => (
                        <Button
                          type="text"
                          icon={<Trash2 className="w-4 h-4 text-red-500" />}
                          onClick={() => handleDeleteRentalItem(record.id)}
                          className="h-8 w-8 p-0 flex items-center justify-center"
                        />
                      ),
                    },
                  ]}
                  dataSource={rentalItems}
                  pagination={false}
                  className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm"
                />
              </div>
            </div>
          </DetailSectionCard>

          {/* Return Info Section */}
          <DetailSectionCard title="반납 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납자</label>
                <Input
                  value={data.returnerName}
                  onChange={(e) => setData({ ...data, returnerName: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납일자</label>
                <DatePicker
                  value={dayjs(data.returnDate)}
                  onChange={(date) => setData({ ...data, returnDate: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납시간</label>
                <TimePicker
                  value={dayjs(data.returnTime, 'HH:mm')}
                  onChange={(time) => setData({ ...data, returnTime: time ? time.format('HH:mm') : '' })}
                  format="HH:mm"
                  className="w-full h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납자 확인</label>
                <Input
                  value={data.returnerNameConfirm}
                  onChange={(e) => setData({ ...data, returnerNameConfirm: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납일자 확인</label>
                <DatePicker
                  value={dayjs(data.returnDateConfirm)}
                  onChange={(date) => setData({ ...data, returnDateConfirm: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납시간 확인</label>
                <TimePicker
                  value={dayjs(data.returnTimeConfirm, 'HH:mm')}
                  onChange={(time) => setData({ ...data, returnTimeConfirm: time ? time.format('HH:mm') : '' })}
                  format="HH:mm"
                  className="w-full h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납 상태</label>
                <Select
                  value={data.returnStatus}
                  onChange={(value) => setData({ ...data, returnStatus: value })}
                  className="w-full h-11 rounded-xl"
                  options={[
                    { value: '정상 반납', label: '정상 반납' },
                    { value: '불량 반납', label: '불량 반납' },
                    { value: '분실', label: '분실' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납 수량</label>
                <Input
                  type="number"
                  value={data.returnQuantity}
                  onChange={(e) => setData({ ...data, returnQuantity: parseInt(e.target.value) || 0 })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">대상 적합 여부</label>
                <Switch
                  checked={data.targetEligible}
                  onChange={(checked) => setData({ ...data, targetEligible: checked })}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">비고</label>
                <TextArea
                  value={data.remarks}
                  onChange={(e) => setData({ ...data, remarks: e.target.value })}
                  rows={3}
                  className="rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">서명 생략</label>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={data.signatureOmitted}
                    onChange={(checked) => setData({ ...data, signatureOmitted: checked })}
                  />
                  {data.signatureOmitted && (
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-500 mb-2">서명자</label>
                      <Input
                        value={data.signatureName}
                        onChange={(e) => setData({ ...data, signatureName: e.target.value })}
                        className="h-11 rounded-xl"
                      />
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-500 mb-2">서명일</label>
                  <DatePicker
                    value={dayjs(data.signatureDate)}
                    onChange={(date) => setData({ ...data, signatureDate: date ? date.format('YYYY-MM-DD') : '' })}
                    className="w-full h-11 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </DetailSectionCard>
        </div>
      </div>
    </ProtectedRoute>
  )
}