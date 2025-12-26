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

            {/* Basic Info Section */}
            <DetailSectionCard title="기본 정보">
              <DefinitionListGrid
                items={[
                  { label: '활동 일지 코드', value: data.activityCode },
                  { label: '교육 유형', value: data.educationType },
                  { label: '교육기관 유형', value: data.institutionType },
                  { label: '지역', value: data.region },
                  { label: '교육기관명', value: data.institutionName },
                  { label: '학년/학급', value: `${data.grade}학년 ${data.class}반` },
                  { label: '교육 기간', value: `${data.startDate} ~ ${data.endDate}` },
                  { label: '작성일/작성자', value: `${data.createdAt} / ${data.createdBy}` },
                ]}
              />
            </DetailSectionCard>

            {/* Statistics Section */}
            <DetailSectionCard title="통계 정보">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">총 신청자 수</p>
                  <p className="text-2xl font-bold text-blue-600">{data.totalApplicants}명</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">총 수료자 수</p>
                  <p className="text-2xl font-bold text-green-600">{data.totalGraduates}명</p>
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">남자 수료자</p>
                  <p className="text-2xl font-bold text-indigo-600">{data.maleGraduates}명</p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">여자 수료자</p>
                  <p className="text-2xl font-bold text-pink-600">{data.femaleGraduates}명</p>
                </div>
              </div>
            </DetailSectionCard>

            {/* Session Info Section */}
            <DetailSectionCard title="차시별 활동 정보">
              <div className="overflow-x-auto">
                <Table
                  columns={[
                    {
                      title: '차시',
                      dataIndex: 'sessionNumber',
                      key: 'sessionNumber',
                      width: 80,
                      render: (text) => `${text}차시`,
                    },
                    {
                      title: '활동일자',
                      dataIndex: 'date',
                      key: 'date',
                      width: 120,
                    },
                    {
                      title: '활동시간',
                      key: 'time',
                      width: 150,
                      render: (_, record: Session) => `${record.startTime} ~ ${record.endTime}`,
                    },
                    {
                      title: '활동명',
                      dataIndex: 'activityName',
                      key: 'activityName',
                    },
                  ]}
                  dataSource={sessions}
                  pagination={false}
                  className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm"
                />
              </div>
            </DetailSectionCard>

            {/* Photos Section */}
            <DetailSectionCard title="활동 사진">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={photo.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 text-sm text-gray-700 truncate">{photo.name}</div>
                  </div>
                ))}
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

          {/* Basic Info Section */}
          <DetailSectionCard title="기본 정보">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">활동 일지 코드</label>
                <Input
                  value={data.activityCode}
                  onChange={(e) => setData({ ...data, activityCode: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">교육 유형</label>
                <Select
                  value={data.educationType}
                  onChange={(value) => setData({ ...data, educationType: value })}
                  className="w-full h-11 rounded-xl"
                  options={[
                    { value: '정규교육', label: '정규교육' },
                    { value: '특별교육', label: '특별교육' },
                    { value: '방과후교육', label: '방과후교육' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">교육기관 유형</label>
                <Select
                  value={data.institutionType}
                  onChange={(value) => setData({ ...data, institutionType: value })}
                  className="w-full h-11 rounded-xl"
                  options={[
                    { value: '초등학교', label: '초등학교' },
                    { value: '중학교', label: '중학교' },
                    { value: '고등학교', label: '고등학교' },
                  ]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">지역</label>
                <Input
                  value={data.region}
                  onChange={(e) => setData({ ...data, region: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">교육기관명</label>
                <Input
                  value={data.institutionName}
                  onChange={(e) => setData({ ...data, institutionName: e.target.value })}
                  className="h-11 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">학년/학급</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={parseInt(data.grade)}
                    onChange={(e) => setData({ ...data, grade: e.target.value })}
                    className="h-11 rounded-xl flex-1"
                  />
                  <span className="text-gray-500">학년</span>
                  <Input
                    type="number"
                    value={parseInt(data.class)}
                    onChange={(e) => setData({ ...data, class: e.target.value })}
                    className="h-11 rounded-xl flex-1"
                  />
                  <span className="text-gray-500">반</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">교육 기간</label>
                <div className="flex items-center gap-2">
                  <DatePicker
                    value={dayjs(data.startDate)}
                    onChange={(date) => setData({ ...data, startDate: date ? date.format('YYYY-MM-DD') : '' })}
                    className="h-11 rounded-xl flex-1"
                  />
                  <span className="text-gray-500">~</span>
                  <DatePicker
                    value={dayjs(data.endDate)}
                    onChange={(date) => setData({ ...data, endDate: date ? date.format('YYYY-MM-DD') : '' })}
                    className="h-11 rounded-xl flex-1"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-2">작성일/작성자</label>
                <p className="text-base text-gray-900">{data.createdAt} / {data.createdBy}</p>
              </div>
            </div>
          </DetailSectionCard>

          {/* Statistics Section */}
          <DetailSectionCard title="통계 정보">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">총 신청자 수</p>
                <p className="text-2xl font-bold text-blue-600">{data.totalApplicants}명</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">총 수료자 수</p>
                <p className="text-2xl font-bold text-green-600">{data.totalGraduates}명</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">남자 수료자</p>
                <p className="text-2xl font-bold text-indigo-600">{data.maleGraduates}명</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">여자 수료자</p>
                <p className="text-2xl font-bold text-pink-600">{data.femaleGraduates}명</p>
              </div>
            </div>
          </DetailSectionCard>

          {/* Session Info Section */}
          <DetailSectionCard title="차시별 활동 정보">
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button
                  type="primary"
                  onClick={handleAddSession}
                  className="h-9 px-4 rounded-lg border-0 text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  차시 추가
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table
                  columns={[
                    {
                      title: '차시',
                      dataIndex: 'sessionNumber',
                      key: 'sessionNumber',
                      width: 80,
                      render: (text, record) => (
                        <Input
                          type="number"
                          value={text}
                          onChange={(e) => handleSessionChange(record.id, 'sessionNumber', parseInt(e.target.value) || 0)}
                          className="h-8 w-16 rounded text-center"
                        />
                      ),
                    },
                    {
                      title: '활동일자',
                      dataIndex: 'date',
                      key: 'date',
                      width: 120,
                      render: (text, record) => (
                        <DatePicker
                          value={dayjs(text)}
                          onChange={(date) => handleSessionChange(record.id, 'date', date ? date.format('YYYY-MM-DD') : '')}
                          className="h-8 rounded w-32"
                        />
                      ),
                    },
                    {
                      title: '활동시간',
                      key: 'time',
                      width: 150,
                      render: (_, record: Session) => (
                        <div className="flex items-center gap-1">
                          <Input
                            value={record.startTime}
                            onChange={(e) => handleSessionChange(record.id, 'startTime', e.target.value)}
                            className="h-8 rounded w-20 text-center"
                          />
                          <span className="text-gray-500">~</span>
                          <Input
                            value={record.endTime}
                            onChange={(e) => handleSessionChange(record.id, 'endTime', e.target.value)}
                            className="h-8 rounded w-20 text-center"
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
                          className="h-8 rounded"
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
                          onClick={() => handleDeleteSession(record.id)}
                          className="h-8 w-8 p-0 flex items-center justify-center"
                        />
                      ),
                    },
                  ]}
                  dataSource={sessions}
                  pagination={false}
                  className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm"
                />
              </div>
            </div>
          </DetailSectionCard>

          {/* Photos Section */}
          <DetailSectionCard title="활동 사진">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img 
                      src={photo.url} 
                      alt={photo.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-700 truncate">{photo.name}</div>
                  <Button
                    type="text"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => {
                      setPhotos(photos.filter(p => p.id !== photo.id));
                    }}
                    className="absolute top-2 right-2 h-8 w-8 p-0 flex items-center justify-center bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              ))}
              <Upload
                beforeUpload={() => false}
                showUploadList={false}
                multiple
              >
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                  <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">사진 추가</span>
                </div>
              </Upload>
            </div>
          </DetailSectionCard>
        </div>
      </div>
    </ProtectedRoute>
  )
}