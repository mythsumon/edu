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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm px-6 py-4">
          <DetailPageHeaderSticky
            onBack={handleBack}
            onEdit={handleEditFromDetail}
            onDelete={handleDelete}
          />
          </div>

          {/* Equipment Certificate Title */}
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="relative text-center">
                {/* Decorative Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl opacity-30"></div>
                
                {/* Title Content */}
                <div className="relative">
                  <div className="inline-block mb-3">
                    <div className="px-5 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-md">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">2025</span>
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                    교구 확인서
                  </h1>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-slate-300"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-300 to-slate-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Container */}
          <div className="max-w-7xl mx-auto px-6 pt-8 pb-12 space-y-6">
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

            {/* Basic Info Section - Enhanced Design */}
            <DetailSectionCard title="기본 정보">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">과제번호</p>
                  <p className="text-base font-bold text-slate-900">{data.assignmentNumber}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">교육과정명</p>
                  <p className="text-base font-bold text-slate-900">{data.courseName}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">교육기관</p>
                  <p className="text-base font-bold text-slate-900">{data.institution}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                  <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-1">교육일자</p>
                  <p className="text-base font-bold text-slate-900">{data.educationDate}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">담당차시 / 총차시</p>
                  <p className="text-base font-bold text-slate-900">{data.currentSession} / {data.totalSessions}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">당일 참여 강사</p>
                  <p className="text-base font-bold text-slate-900">{data.instructorName}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">예상 참가 인원</p>
                  <p className="text-base font-bold text-slate-900">{data.expectedParticipants}명</p>
                </div>
              </div>
            </DetailSectionCard>

            {/* Rental Info Section - Enhanced Design */}
            <DetailSectionCard title="대여 정보">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-blue-100 mb-1 font-medium">대여일자</p>
                    <p className="text-lg font-bold text-white">{data.rentalDate}</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-indigo-100 mb-1 font-medium">대여시간</p>
                    <p className="text-lg font-bold text-white">{data.rentalTime}</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-purple-100 mb-1 font-medium">대여자</p>
                    <p className="text-lg font-bold text-white">{data.renterName}</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-purple-100 mb-1 font-medium">총 교구 수</p>
                    <p className="text-lg font-bold text-white">{rentalItems.length}종</p>
                  </div>
                </div>
              </div>
              
              {data.notes && (
                <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">비고</p>
                  <p className="text-sm text-slate-700">{data.notes}</p>
                </div>
              )}

              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-base font-bold text-slate-900">대여 교구 목록</h4>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                    총 {rentalItems.reduce((sum, item) => sum + item.quantity, 0)}개
                  </div>
                </div>
                <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table
                  columns={[
                    {
                      title: '교구명',
                      dataIndex: 'itemName',
                      key: 'itemName',
                        render: (text) => (
                          <span className="text-sm font-semibold text-slate-900">{text}</span>
                        ),
                    },
                    {
                      title: '수량',
                      dataIndex: 'quantity',
                      key: 'quantity',
                        align: 'center',
                        render: (text) => (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm">
                            {text}개
                          </span>
                        ),
                    },
                  ]}
                  dataSource={rentalItems}
                  pagination={false}
                    rowClassName="hover:bg-blue-50/50 transition-colors"
                    className="[&_.ant-table-thead>tr>th]:bg-gradient-to-r [&_.ant-table-thead>tr>th]:from-slate-50 [&_.ant-table-thead>tr>th]:to-slate-100 [&_.ant-table-thead>tr>th]:text-slate-700 [&_.ant-table-thead>tr>th]:text-sm [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:border-b-2 [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-slate-100 [&_.ant-table]:text-sm"
                />
                </div>
              </div>
            </DetailSectionCard>

            {/* Return Info Section - Enhanced Design */}
            <DetailSectionCard title="반납 정보">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-emerald-100 mb-1 font-medium">반납일자</p>
                    <p className="text-lg font-bold text-white">{data.returnDate}</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-teal-100 mb-1 font-medium">반납시간</p>
                    <p className="text-lg font-bold text-white">{data.returnTime}</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-cyan-100 mb-1 font-medium">반납자</p>
                    <p className="text-lg font-bold text-white">{data.returnerName}</p>
                  </div>
                </div>
                <div className={`group relative overflow-hidden rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 ${
                  data.returnStatus === '정상 반납' 
                    ? 'bg-gradient-to-br from-green-500 to-green-600'
                    : data.returnStatus === '불량 반납'
                    ? 'bg-gradient-to-br from-orange-500 to-orange-600'
                    : 'bg-gradient-to-br from-red-500 to-red-600'
                }`}>
                  <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-xs text-white/90 mb-1 font-medium">반납 상태</p>
                    <p className="text-lg font-bold text-white">{data.returnStatus}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">반납 수량</p>
                  <p className="text-2xl font-bold text-slate-900">{data.returnQuantity}개</p>
                </div>
                <div className={`p-4 rounded-xl border ${
                  data.targetEligible 
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200'
                    : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200'
                }`}>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">대상 적합 여부</p>
                  <p className={`text-2xl font-bold ${
                    data.targetEligible ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {data.targetEligible ? '적합' : '부적합'}
                  </p>
                </div>
              </div>

              {data.remarks && (
                <div className="mb-6 p-4 bg-gradient-to-r from-slate-50 to-emerald-50 rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">비고</p>
                  <p className="text-sm text-slate-700">{data.remarks}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">서명 생략</p>
                  <p className="text-base font-semibold text-slate-900">
                    {data.signatureOmitted ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-orange-100 text-orange-700">
                        생략
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-100 text-blue-700">
                        필요
                      </span>
                    )}
                  </p>
                </div>
                {data.signatureName && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">서명자</p>
                    <p className="text-base font-semibold text-slate-900">{data.signatureName}</p>
                  </div>
                )}
                {data.signatureDate && (
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">서명일</p>
                    <p className="text-base font-semibold text-slate-900">{data.signatureDate}</p>
                  </div>
                )}
              </div>
            </DetailSectionCard>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Edit Mode
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm px-4 md:px-6 py-3 md:py-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
            <Button
              icon={<X className="w-4 h-4" />}
              onClick={handleCancel}
              className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700 hover:border-blue-600"
            >
              취소
            </Button>
            <Space>
              <Button
                type="primary"
                icon={<Save className="w-4 h-4 text-white" />}
                onClick={handleSave}
                style={{
                  color: 'white',
                }}
                className="h-11 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg !text-white hover:!text-white [&_.anticon]:!text-white [&_.anticon]:hover:!text-white [&>span]:!text-white [&>span]:hover:!text-white [&:hover>span]:!text-white [&:hover_.anticon]:!text-white [&:hover]:!text-white"
              >
                저장
              </Button>
            </Space>
          </div>
        </div>

        {/* Equipment Certificate Title */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
            <div className="relative text-center">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl opacity-30"></div>
              
              {/* Title Content */}
              <div className="relative">
                <div className="inline-block mb-3">
                  <div className="px-5 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-md">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">2025</span>
                  </div>
                </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  교구 확인서
                </h1>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-slate-300"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-300 to-slate-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-8 md:pb-12 space-y-4 md:space-y-6">
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

          {/* Basic Info Section - Enhanced Design */}
          <DetailSectionCard title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">과제번호</label>
                <Input
                  value={data.assignmentNumber}
                  onChange={(e) => setData({ ...data, assignmentNumber: e.target.value })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="과제번호를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">교육과정명</label>
                <Input
                  value={data.courseName}
                  onChange={(e) => setData({ ...data, courseName: e.target.value })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="교육과정명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">교육기관</label>
                <Input
                  value={data.institution}
                  onChange={(e) => setData({ ...data, institution: e.target.value })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="교육기관을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">교육일자</label>
                <DatePicker
                  value={dayjs(data.educationDate)}
                  onChange={(date) => setData({ ...data, educationDate: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-11 rounded-xl [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">담당차시 / 총차시</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={data.currentSession}
                    onChange={(e) => setData({ ...data, currentSession: parseInt(e.target.value) || 0 })}
                    placeholder="담당차시"
                    className="h-11 rounded-xl flex-1 border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  />
                  <span className="text-slate-500 font-medium">/</span>
                  <Input
                    type="number"
                    value={data.totalSessions}
                    onChange={(e) => setData({ ...data, totalSessions: parseInt(e.target.value) || 0 })}
                    placeholder="총차시"
                    className="h-11 rounded-xl flex-1 border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">당일 참여 강사</label>
                <Input
                  value={data.instructorName}
                  onChange={(e) => setData({ ...data, instructorName: e.target.value })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="강사 이름을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">예상 참가 인원</label>
                <Input
                  type="number"
                  value={data.expectedParticipants}
                  onChange={(e) => setData({ ...data, expectedParticipants: parseInt(e.target.value) || 0 })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="예상 참가 인원"
                  min={0}
                />
              </div>
            </div>
          </DetailSectionCard>

          {/* Rental Info Section - Enhanced Design */}
          <DetailSectionCard title="대여 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">대여일자</label>
                <DatePicker
                  value={dayjs(data.rentalDate)}
                  onChange={(date) => setData({ ...data, rentalDate: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-11 rounded-xl [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">대여시간</label>
                <TimePicker
                  value={dayjs(data.rentalTime, 'HH:mm')}
                  onChange={(time) => setData({ ...data, rentalTime: time ? time.format('HH:mm') : '' })}
                  format="HH:mm"
                  className="w-full h-11 rounded-xl [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
                  popupClassName="tp-popup-primary-ok"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">대여자</label>
                <Input
                  value={data.renterName}
                  onChange={(e) => setData({ ...data, renterName: e.target.value })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="대여자 이름"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">총 교구 수</label>
                <div className="h-11 flex items-center px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                  <span className="text-base font-bold text-blue-700">{rentalItems.length}종</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">비고</label>
                <TextArea
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                rows={3}
                className="rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                placeholder="비고를 입력하세요"
                />
            </div>

            {/* Rental Items Table */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-slate-900">대여 교구 목록</h4>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                    총 {rentalItems.reduce((sum, item) => sum + item.quantity, 0)}개
                  </div>
                </div>
                <Button
                  type="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddRentalItem}
                  className="h-10 px-5 rounded-xl border-0 font-medium transition-all duration-200 shadow-md hover:shadow-lg
                           bg-gradient-to-r from-blue-600 to-blue-700 
                           hover:from-blue-700 hover:to-blue-800 
                           text-white hover:text-white active:text-white
                           [&_.anticon]:text-white [&:hover_.anticon]:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  교구 추가
                </Button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
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
                          className="h-9 rounded-lg border-2 border-slate-200 focus:border-blue-500 transition-colors"
                          placeholder="교구명을 입력하세요"
                        />
                      ),
                    },
                    {
                      title: '수량',
                      dataIndex: 'quantity',
                      key: 'quantity',
                      align: 'center',
                      render: (text, record) => (
                        <Input
                          type="number"
                          value={text}
                          onChange={(e) => handleRentalItemChange(record.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="h-9 rounded-lg w-24 border-2 border-slate-200 focus:border-blue-500 transition-colors text-center"
                          min={1}
                        />
                      ),
                    },
                    {
                      title: '삭제',
                      key: 'action',
                      width: 80,
                      align: 'center',
                      render: (_, record) => (
                        <Button
                          type="text"
                          icon={<Trash2 className="w-4 h-4" />}
                          onClick={() => handleDeleteRentalItem(record.id)}
                          className="h-9 w-9 p-0 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                          danger
                        />
                      ),
                    },
                  ]}
                  dataSource={rentalItems}
                  pagination={false}
                  rowClassName="hover:bg-blue-50/50 transition-colors"
                  className="[&_.ant-table-thead>tr>th]:bg-gradient-to-r [&_.ant-table-thead>tr>th]:from-slate-50 [&_.ant-table-thead>tr>th]:to-slate-100 [&_.ant-table-thead>tr>th]:text-slate-700 [&_.ant-table-thead>tr>th]:text-sm [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:border-b-2 [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-slate-100 [&_.ant-table]:text-sm"
                />
              </div>
            </div>
          </DetailSectionCard>

          {/* Return Info Section - Enhanced Design */}
          <DetailSectionCard title="반납 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-4 md:mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납자</label>
                <Input
                  value={data.returnerName}
                  onChange={(e) => setData({ ...data, returnerName: e.target.value })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납일자</label>
                <DatePicker
                  value={dayjs(data.returnDate)}
                  onChange={(date) => setData({ ...data, returnDate: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-11 rounded-xl [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납시간</label>
                <TimePicker
                  value={dayjs(data.returnTime, 'HH:mm')}
                  onChange={(time) => setData({ ...data, returnTime: time ? time.format('HH:mm') : '' })}
                  format="HH:mm"
                  className="w-full h-11 rounded-xl [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
                  popupClassName="tp-popup-primary-ok"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납자 확인</label>
                <Input
                  value={data.returnerNameConfirm}
                  onChange={(e) => setData({ ...data, returnerNameConfirm: e.target.value })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납일자 확인</label>
                <DatePicker
                  value={dayjs(data.returnDateConfirm)}
                  onChange={(date) => setData({ ...data, returnDateConfirm: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-11 rounded-xl [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납시간 확인</label>
                <TimePicker
                  value={dayjs(data.returnTimeConfirm, 'HH:mm')}
                  onChange={(time) => setData({ ...data, returnTimeConfirm: time ? time.format('HH:mm') : '' })}
                  format="HH:mm"
                  className="w-full h-11 rounded-xl [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
                  popupClassName="tp-popup-primary-ok"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">반납 상태</label>
                <Select
                  value={data.returnStatus}
                  onChange={(value) => setData({ ...data, returnStatus: value })}
                  className="w-full h-11 rounded-xl [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-2 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:focus:!border-blue-500"
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
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  min={0}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">대상 적합 여부</label>
                <div className="flex items-center gap-3">
                <Switch
                  checked={data.targetEligible}
                  onChange={(checked) => setData({ ...data, targetEligible: checked })}
                    className="[&_.ant-switch-checked]:bg-green-500"
                  />
                  <span className={`text-sm font-semibold ${
                    data.targetEligible ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {data.targetEligible ? '적합' : '부적합'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">비고</label>
                <TextArea
                  value={data.remarks}
                  onChange={(e) => setData({ ...data, remarks: e.target.value })}
                  rows={4}
                  className="rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="비고를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">서명 생략</label>
                <div className="flex items-center gap-4 mb-4">
                  <Switch
                    checked={data.signatureOmitted}
                    onChange={(checked) => setData({ ...data, signatureOmitted: checked })}
                    className="[&_.ant-switch-checked]:bg-orange-500"
                  />
                  <span className={`text-sm font-semibold ${
                    data.signatureOmitted ? 'text-orange-700' : 'text-blue-700'
                  }`}>
                    {data.signatureOmitted ? '생략' : '필요'}
                  </span>
                </div>
                  {data.signatureOmitted && (
                  <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-500 mb-2">서명자</label>
                      <Input
                        value={data.signatureName}
                        onChange={(e) => setData({ ...data, signatureName: e.target.value })}
                      className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                      placeholder="서명자 이름"
                      />
                    </div>
                  )}
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">서명일</label>
                  <DatePicker
                    value={dayjs(data.signatureDate)}
                    onChange={(date) => setData({ ...data, signatureDate: date ? date.format('YYYY-MM-DD') : '' })}
                    className="w-full h-11 rounded-xl [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
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