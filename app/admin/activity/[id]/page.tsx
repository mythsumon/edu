'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Input, Select, DatePicker, Space, Upload, Spin, Alert, Table } from 'antd'
import { ArrowLeft, Save, Trash2, X, Upload as UploadIcon, Image as ImageIcon } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { programService } from '@/services/programService'
import { ActivityData, Session, Photo } from '@/types/program'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import {
  DetailPageHeaderSticky,
  ActivitySummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
} from '@/components/admin/operations'

dayjs.locale('ko')

export default function ActivityDetailPage() {
  const params = useParams() as { id?: string } | null
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)
  const [data, setData] = useState<ActivityData | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        if (params && params.id) {
          const id = parseInt(params.id as string)
          const activityData = await programService.getActivityData(id)
          setData(activityData)
          setSessions(activityData.sessions)
          setPhotos(activityData.photos)
        }
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
        // console.error(err)
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
      setSessions(data.sessions) // Reset to original data
      setPhotos(data.photos) // Reset to original data
    }
  }

  const handleSave = async () => {
    if (!data) return
    
    try {
      const updatedData = { ...data, sessions, photos }
      await programService.updateActivityData(updatedData)
      setData(updatedData)
      setIsEditMode(false)
    } catch (err) {
      setError('데이터 저장 중 오류가 발생했습니다.')
      console.error(err)
    }
  }

  const handleDelete = () => {
    // In real app, show confirmation modal and delete
    console.log('Delete activity:', data?.id)
  }

  const handleAddSession = () => {
    const newSession: Session = {
      id: `new-${Date.now()}`,
      sessionNumber: sessions.length + 1,
      date: dayjs().format('YYYY-MM-DD'),
      startTime: '09:00',
      endTime: '12:00',
      activityName: '',
    }
    setSessions([...sessions, newSession])
  }

  const handleDeleteSession = (sessionId: string) => {
    setSessions(sessions.filter((s) => s.id !== sessionId))
  }

  const handleSessionChange = (sessionId: string, field: keyof Session, value: any) => {
    setSessions(
      sessions.map((s) => (s.id === sessionId ? { ...s, [field]: value } : s))
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
          <Alert message="데이터 없음" description="활동 일지 데이터를 찾을 수 없습니다." type="warning" showIcon />
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

          {/* Activity Log Title */}
          <div className="bg-white border-b border-slate-200">
            <div className="max-w-7xl mx-auto px-6 py-6">
              <div className="relative text-center">
                {/* Decorative Background */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl opacity-30"></div>
                
                {/* Title Content */}
                <div className="relative">
                  <div className="inline-block mb-3">
                    <div className="px-5 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-md">
                      <span className="text-xs font-semibold text-white uppercase tracking-wider">2025</span>
                    </div>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                    2025 소프트웨어(SW) 미래채움
                  </h1>
                  <h2 className="text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                    교육 활동 일지
                  </h2>
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
            <ActivitySummaryCard
              activityCode={data.activityCode}
              educationType={data.educationType}
              institutionName={data.institutionName}
              grade={data.grade}
              class={data.class}
              period={`${data.startDate} ~ ${data.endDate}`}
              totalApplicants={data.totalApplicants}
              totalGraduates={data.totalGraduates}
            />

            {/* Basic Info Section - Enhanced Design */}
            <DetailSectionCard title="기본 정보">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-1">활동 일지 코드</p>
                  <p className="text-base font-bold text-slate-900">{data.activityCode}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-1">교육 유형</p>
                  <p className="text-base font-bold text-slate-900">{data.educationType}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">교육기관 유형</p>
                  <p className="text-base font-bold text-slate-900">{data.institutionType}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl border border-cyan-100">
                  <p className="text-xs font-semibold text-cyan-600 uppercase tracking-wider mb-1">지역</p>
                  <p className="text-base font-bold text-slate-900">{data.region}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                  <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">교육기관명</p>
                  <p className="text-base font-bold text-slate-900">{data.institutionName}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-100">
                  <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider mb-1">학년/학급</p>
                  <p className="text-base font-bold text-slate-900">{data.grade}학년 {data.class}반</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl border border-orange-100">
                  <p className="text-xs font-semibold text-orange-600 uppercase tracking-wider mb-1">교육 기간</p>
                  <p className="text-base font-bold text-slate-900">{data.startDate} ~ {data.endDate}</p>
                </div>
                <div className="p-4 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl border border-teal-100">
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">작성일/작성자</p>
                  <p className="text-base font-bold text-slate-900">{data.createdAt} / {data.createdBy}</p>
                </div>
              </div>
            </DetailSectionCard>

            {/* Statistics Section - Enhanced Design */}
            <DetailSectionCard title="통계 정보">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-sm text-blue-100 mb-2 font-medium">총 신청자 수</p>
                    <p className="text-3xl font-bold text-white">{data.totalApplicants}</p>
                    <p className="text-xs text-blue-100 mt-1">명</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-sm text-emerald-100 mb-2 font-medium">총 수료자 수</p>
                    <p className="text-3xl font-bold text-white">{data.totalGraduates}</p>
                    <p className="text-xs text-emerald-100 mt-1">명</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-sm text-indigo-100 mb-2 font-medium">남자 수료자</p>
                    <p className="text-3xl font-bold text-white">{data.maleGraduates}</p>
                    <p className="text-xs text-indigo-100 mt-1">명</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                  <div className="relative">
                    <p className="text-sm text-pink-100 mb-2 font-medium">여자 수료자</p>
                    <p className="text-3xl font-bold text-white">{data.femaleGraduates}</p>
                    <p className="text-xs text-pink-100 mt-1">명</p>
                  </div>
                </div>
              </div>
            </DetailSectionCard>

            {/* Session Info Section - Enhanced Design */}
            <DetailSectionCard title="차시별 활동 정보">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-slate-900">활동 차시 목록</h4>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                    총 {sessions.length}차시
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table
                  columns={[
                    {
                      title: '차시',
                      dataIndex: 'sessionNumber',
                      key: 'sessionNumber',
                      width: 100,
                      align: 'center',
                      render: (text) => (
                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-lg bg-blue-100 text-blue-700 font-semibold text-sm">
                          {text}차시
                        </span>
                      ),
                    },
                    {
                      title: '활동일자',
                      dataIndex: 'date',
                      key: 'date',
                      width: 150,
                      render: (text) => (
                        <span className="text-sm font-semibold text-slate-900">{text}</span>
                      ),
                    },
                    {
                      title: '활동시간',
                      key: 'time',
                      width: 180,
                      render: (_, record: Session) => (
                        <span className="text-sm text-slate-700">
                          {record.startTime} ~ {record.endTime}
                        </span>
                      ),
                    },
                    {
                      title: '활동명',
                      dataIndex: 'activityName',
                      key: 'activityName',
                      render: (text) => (
                        <span className="text-sm font-medium text-slate-900">{text || <span className="text-slate-400">-</span>}</span>
                      ),
                    },
                  ]}
                  dataSource={sessions}
                  pagination={false}
                  rowClassName="hover:bg-blue-50/50 transition-colors"
                  className="w-full [&_.ant-table-thead>tr>th]:bg-gradient-to-r [&_.ant-table-thead>tr>th]:from-slate-50 [&_.ant-table-thead>tr>th]:to-slate-100 [&_.ant-table-thead>tr>th]:text-slate-700 [&_.ant-table-thead>tr>th]:text-sm [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:border-b-2 [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-slate-100 [&_.ant-table]:text-sm"
                />
              </div>
            </DetailSectionCard>

            {/* Photos Section - Enhanced Design */}
            <DetailSectionCard title="활동 사진">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-slate-900">활동 사진 갤러리</h4>
                  <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                    총 {photos.length}장
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-slate-200 hover:border-blue-400">
                      <img 
                        src={photo.url} 
                        alt={photo.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-white text-sm font-medium truncate">{photo.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-700 truncate font-medium">{photo.name}</div>
                  </div>
                ))}
                {photos.length === 0 && (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 px-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-xl border-2 border-dashed border-slate-300">
                    <ImageIcon className="w-16 h-16 text-slate-400 mb-4" />
                    <p className="text-base font-semibold text-slate-600 mb-1">활동 사진이 없습니다</p>
                    <p className="text-sm text-slate-500">활동 사진을 추가해주세요</p>
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

        {/* Activity Log Title */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
            <div className="relative text-center">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl opacity-30"></div>
              
              {/* Title Content */}
              <div className="relative">
                <div className="inline-block mb-3">
                  <div className="px-5 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-md">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">2025</span>
                  </div>
                </div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                  2025 소프트웨어(SW) 미래채움
                </h1>
                <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-3 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 bg-clip-text text-transparent">
                  교육 활동 일지
                </h2>
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
          <ActivitySummaryCard
            activityCode={data.activityCode}
            educationType={data.educationType}
            institutionName={data.institutionName}
            grade={data.grade}
            class={data.class}
            period={`${data.startDate} ~ ${data.endDate}`}
            totalApplicants={data.totalApplicants}
            totalGraduates={data.totalGraduates}
          />

          {/* Basic Info Section - Enhanced Design */}
          <DetailSectionCard title="기본 정보">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">활동 일지 코드</label>
                <Input
                  value={data.activityCode}
                  onChange={(e) => setData({ ...data, activityCode: e.target.value })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="활동 일지 코드를 입력하세요"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">교육 유형</label>
                <Select
                  value={data.educationType}
                  onChange={(value) => setData({ ...data, educationType: value })}
                  className="w-full h-11 rounded-xl [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-2 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:focus:!border-blue-500"
                  options={[
                    { value: '정규교육', label: '정규교육' },
                    { value: '특별교육', label: '특별교육' },
                    { value: '방과후교육', label: '방과후교육' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">교육기관 유형</label>
                <Select
                  value={data.institutionType}
                  onChange={(value) => setData({ ...data, institutionType: value })}
                  className="w-full h-11 rounded-xl [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!border-2 [&_.ant-select-selector]:!border-slate-200 [&_.ant-select-selector]:focus:!border-blue-500"
                  options={[
                    { value: '초등학교', label: '초등학교' },
                    { value: '중학교', label: '중학교' },
                    { value: '고등학교', label: '고등학교' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">지역</label>
                <Input
                  value={data.region}
                  onChange={(e) => setData({ ...data, region: e.target.value })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="지역을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">교육기관명</label>
                <Input
                  value={data.institutionName}
                  onChange={(e) => setData({ ...data, institutionName: e.target.value })}
                  className="h-11 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="교육기관명을 입력하세요"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">학년/학급</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={parseInt(data.grade)}
                    onChange={(e) => setData({ ...data, grade: e.target.value })}
                    className="h-11 rounded-xl flex-1 border-2 border-slate-200 focus:border-blue-500 transition-colors"
                    placeholder="학년"
                  />
                  <span className="text-slate-500 font-medium">학년</span>
                  <Input
                    type="number"
                    value={parseInt(data.class)}
                    onChange={(e) => setData({ ...data, class: e.target.value })}
                    className="h-11 rounded-xl flex-1 border-2 border-slate-200 focus:border-blue-500 transition-colors"
                    placeholder="반"
                  />
                  <span className="text-slate-500 font-medium">반</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">교육 기간</label>
                <div className="flex items-center gap-2">
                  <DatePicker
                    value={dayjs(data.startDate)}
                    onChange={(date) => setData({ ...data, startDate: date ? date.format('YYYY-MM-DD') : '' })}
                    className="h-11 rounded-xl flex-1 [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
                  />
                  <span className="text-slate-500 font-medium">~</span>
                  <DatePicker
                    value={dayjs(data.endDate)}
                    onChange={(date) => setData({ ...data, endDate: date ? date.format('YYYY-MM-DD') : '' })}
                    className="h-11 rounded-xl flex-1 [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">작성일/작성자</label>
                <div className="h-11 flex items-center px-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border-2 border-slate-200">
                  <p className="text-base font-semibold text-slate-900">{data.createdAt} / {data.createdBy}</p>
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* Statistics Section - Enhanced Design */}
          <DetailSectionCard title="통계 정보">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                <div className="relative">
                  <p className="text-sm text-blue-100 mb-2 font-medium">총 신청자 수</p>
                  <p className="text-3xl font-bold text-white">{data.totalApplicants}</p>
                  <p className="text-xs text-blue-100 mt-1">명</p>
                </div>
              </div>
              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                <div className="relative">
                  <p className="text-sm text-emerald-100 mb-2 font-medium">총 수료자 수</p>
                  <p className="text-3xl font-bold text-white">{data.totalGraduates}</p>
                  <p className="text-xs text-emerald-100 mt-1">명</p>
                </div>
              </div>
              <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                <div className="relative">
                  <p className="text-sm text-indigo-100 mb-2 font-medium">남자 수료자</p>
                  <p className="text-3xl font-bold text-white">{data.maleGraduates}</p>
                  <p className="text-xs text-indigo-100 mt-1">명</p>
                </div>
              </div>
              <div className="group relative overflow-hidden bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                <div className="relative">
                  <p className="text-sm text-pink-100 mb-2 font-medium">여자 수료자</p>
                  <p className="text-3xl font-bold text-white">{data.femaleGraduates}</p>
                  <p className="text-xs text-pink-100 mt-1">명</p>
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* Session Info Section - Enhanced Design */}
          <DetailSectionCard title="차시별 활동 정보">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h4 className="text-base font-bold text-slate-900">활동 차시 목록</h4>
                  <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">
                    총 {sessions.length}차시
                  </div>
                </div>
                <Button
                  type="primary"
                  onClick={handleAddSession}
                  className="h-10 px-5 rounded-xl border-0 font-medium transition-all duration-200 shadow-md hover:shadow-lg
                           bg-gradient-to-r from-blue-600 to-blue-700 
                           hover:from-blue-700 hover:to-blue-800 
                           text-white hover:text-white active:text-white
                           focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  차시 추가
                </Button>
              </div>
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <Table
                  columns={[
                    {
                      title: '차시',
                      dataIndex: 'sessionNumber',
                      key: 'sessionNumber',
                      width: 100,
                      align: 'center',
                      render: (text, record) => (
                        <Input
                          type="number"
                          value={text}
                          onChange={(e) => handleSessionChange(record.id, 'sessionNumber', parseInt(e.target.value) || 0)}
                          className="h-9 w-16 rounded-lg text-center border-2 border-slate-200 focus:border-blue-500 transition-colors"
                          min={1}
                        />
                      ),
                    },
                    {
                      title: '활동일자',
                      dataIndex: 'date',
                      key: 'date',
                      width: 150,
                      render: (text, record) => (
                        <DatePicker
                          value={dayjs(text)}
                          onChange={(date) => handleSessionChange(record.id, 'date', date ? date.format('YYYY-MM-DD') : '')}
                          className="h-9 rounded-lg w-full [&_.ant-picker-input]:border-2 [&_.ant-picker-input]:border-slate-200 [&_.ant-picker-input]:focus:border-blue-500"
                        />
                      ),
                    },
                    {
                      title: '활동시간',
                      key: 'time',
                      width: 200,
                      render: (_, record: Session) => (
                        <div className="flex items-center gap-2">
                          <Input
                            value={record.startTime}
                            onChange={(e) => handleSessionChange(record.id, 'startTime', e.target.value)}
                            className="h-9 rounded-lg w-24 text-center border-2 border-slate-200 focus:border-blue-500 transition-colors"
                            placeholder="09:00"
                          />
                          <span className="text-slate-500 font-medium">~</span>
                          <Input
                            value={record.endTime}
                            onChange={(e) => handleSessionChange(record.id, 'endTime', e.target.value)}
                            className="h-9 rounded-lg w-24 text-center border-2 border-slate-200 focus:border-blue-500 transition-colors"
                            placeholder="12:00"
                          />
                        </div>
                      ),
                    },
                    {
                      title: '활동명',
                      dataIndex: 'activityName',
                      key: 'activityName',
                      render: (text, record) => (
                        <Input
                          value={text}
                          onChange={(e) => handleSessionChange(record.id, 'activityName', e.target.value)}
                          className="h-9 rounded-lg border-2 border-slate-200 focus:border-blue-500 transition-colors"
                          placeholder="활동명을 입력하세요"
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
                          onClick={() => handleDeleteSession(record.id)}
                          className="h-9 w-9 p-0 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                          danger
                        />
                      ),
                    },
                  ]}
                  dataSource={sessions}
                  pagination={false}
                  rowClassName="hover:bg-blue-50/50 transition-colors"
                  className="w-full [&_.ant-table-thead>tr>th]:bg-gradient-to-r [&_.ant-table-thead>tr>th]:from-slate-50 [&_.ant-table-thead>tr>th]:to-slate-100 [&_.ant-table-thead>tr>th]:text-slate-700 [&_.ant-table-thead>tr>th]:text-sm [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:border-b-2 [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-slate-100 [&_.ant-table]:text-sm"
                />
              </div>
            </div>
          </DetailSectionCard>

          {/* Photos Section - Enhanced Design */}
          <DetailSectionCard title="활동 사진">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h4 className="text-base font-bold text-slate-900">활동 사진 갤러리</h4>
                <div className="px-3 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
                  총 {photos.length}장
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border-2 border-slate-200 hover:border-blue-400">
                    <img 
                      src={photo.url} 
                      alt={photo.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-medium truncate">{photo.name}</p>
                      </div>
                    </div>
                    <Button
                      type="text"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => {
                        setPhotos(photos.filter(p => p.id !== photo.id));
                      }}
                      className="absolute top-2 right-2 h-8 w-8 p-0 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
                      danger
                    />
                  </div>
                  <div className="mt-2 text-sm text-slate-700 truncate font-medium">{photo.name}</div>
                </div>
              ))}
              <Upload
                beforeUpload={() => false}
                showUploadList={false}
                multiple
              >
                <div className="aspect-square border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all duration-300 bg-gradient-to-br from-slate-50 to-blue-50">
                  <UploadIcon className="w-10 h-10 text-slate-400 mb-2 group-hover:text-blue-500 transition-colors" />
                  <span className="text-sm text-slate-600 font-medium">사진 추가</span>
                </div>
              </Upload>
            </div>
          </DetailSectionCard>
        </div>
      </div>
    </ProtectedRoute>
  )
}