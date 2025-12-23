'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Input, Select, DatePicker, Space, Upload, Spin, Alert } from 'antd'
import { ArrowLeft, Save, Trash2, X, Upload as UploadIcon, Image as ImageIcon } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { programService } from '@/services/programService'
import { ActivityData, Session, Photo } from '@/types/program'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

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
  const [activeSection, setActiveSection] = useState<string>('basic')
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const scrollToSection = (sectionKey: string) => {
    setActiveSection(sectionKey)
    if (sectionRefs.current[sectionKey]) {
      sectionRefs.current[sectionKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

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

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <Button
            type="text"
            icon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-900 px-0"
          >
            목록으로
          </Button>
          <Space>
            {!isEditMode ? (
              <>
                <Button
                  type="primary"
                  onClick={handleEdit}
                  className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white"
                  style={{
                    backgroundColor: '#1a202c',
                    borderColor: '#1a202c',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    color: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d3748'
                    e.currentTarget.style.borderColor = '#2d3748'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a202c'
                    e.currentTarget.style.borderColor = '#1a202c'
                  }}
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
                  className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white"
                  style={{
                    backgroundColor: '#1a202c',
                    borderColor: '#1a202c',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    color: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d3748'
                    e.currentTarget.style.borderColor = '#2d3748'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a202c'
                    e.currentTarget.style.borderColor = '#1a202c'
                  }}
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

      <div className="space-y-6">
        <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2 items-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#3a2e2a] leading-tight text-center">2025 소프트웨어(SW) 미래채움 교육 활동 일지</h2>
          </div>
        </div>

      <div className="flex gap-6">
        {/* Sticky Section Navigation */}
        <div className="w-64 flex-shrink-0">
          <Card className="rounded-2xl shadow-sm border border-gray-200 sticky top-6">
            <div className="space-y-2">
              {[
                { key: 'basic', label: '기본 정보' },
                { key: 'statistics', label: '통계 정보' },
                { key: 'session', label: '차시별 활동 정보' },
                { key: 'photos', label: '활동 사진' },
              ].map((section) => (
                <button
                  key={section.key}
                  onClick={() => scrollToSection(section.key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeSection === section.key
                      ? 'bg-blue-50 text-blue-700 font-medium'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
        <div ref={(el) => { sectionRefs.current['basic'] = el }}>
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">기본 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  활동 일지 코드
                </label>
                {isEditMode ? (
                  <Input
                    value={data.activityCode}
                    onChange={(e) => setData({ ...data, activityCode: e.target.value })}
                    className="h-10 rounded-lg"
                  />
                ) : (
                  <p className="text-base text-gray-900">{data.activityCode}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  교육 유형
                </label>
                {isEditMode ? (
                  <Select
                    value={data.educationType}
                    onChange={(value) => setData({ ...data, educationType: value })}
                    className="w-full h-10 rounded-lg"
                    options={[
                      { value: '정규교육', label: '정규교육' },
                      { value: '특별교육', label: '특별교육' },
                      { value: '방과후교육', label: '방과후교육' },
                    ]}
                  />
                ) : (
                  <p className="text-base text-gray-900">{data.educationType}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  교육기관 유형
                </label>
                {isEditMode ? (
                  <Select
                    value={data.institutionType}
                    onChange={(value) => setData({ ...data, institutionType: value })}
                    className="w-full h-10 rounded-lg"
                    options={[
                      { value: '초등학교', label: '초등학교' },
                      { value: '중학교', label: '중학교' },
                      { value: '고등학교', label: '고등학교' },
                    ]}
                  />
                ) : (
                  <p className="text-base text-gray-900">{data.institutionType}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  지역
                </label>
                {isEditMode ? (
                  <Input
                    value={data.region}
                    onChange={(e) => setData({ ...data, region: e.target.value })}
                    className="h-10 rounded-lg"
                  />
                ) : (
                  <p className="text-base text-gray-900">{data.region}</p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  교육기관명
                </label>
                {isEditMode ? (
                  <Input
                    value={data.institutionName}
                    onChange={(e) => setData({ ...data, institutionName: e.target.value })}
                    className="h-10 rounded-lg"
                  />
                ) : (
                  <p className="text-base text-gray-900">{data.institutionName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  학년/학급
                </label>
                {isEditMode ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={parseInt(data.grade)}
                      onChange={(e) => setData({ ...data, grade: e.target.value })}
                      className="h-10 rounded-lg flex-1"
                    />
                    <span className="text-gray-500">학년</span>
                    <Input
                      type="number"
                      value={parseInt(data.class)}
                      onChange={(e) => setData({ ...data, class: e.target.value })}
                      className="h-10 rounded-lg flex-1"
                    />
                    <span className="text-gray-500">반</span>
                  </div>
                ) : (
                  <p className="text-base text-gray-900">{data.grade}학년 {data.class}반</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  교육 기간
                </label>
                {isEditMode ? (
                  <div className="flex items-center gap-2">
                    <DatePicker
                      value={dayjs(data.startDate)}
                      onChange={(date) => setData({ ...data, startDate: date ? date.format('YYYY-MM-DD') : '' })}
                      className="h-10 rounded-lg flex-1"
                    />
                    <span className="text-gray-500">~</span>
                    <DatePicker
                      value={dayjs(data.endDate)}
                      onChange={(date) => setData({ ...data, endDate: date ? date.format('YYYY-MM-DD') : '' })}
                      className="h-10 rounded-lg flex-1"
                    />
                  </div>
                ) : (
                  <p className="text-base text-gray-900">{data.startDate} ~ {data.endDate}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  작성일/작성자
                </label>
                <p className="text-base text-gray-900">{data.createdAt} / {data.createdBy}</p>
              </div>
            </div>
          </div>
        </Card>
        </div>

        <div ref={(el) => { sectionRefs.current['statistics'] = el }}>
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">통계 정보</h3>
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
        </Card>
        </div>

        <div ref={(el) => { sectionRefs.current['session'] = el }}>
        <Card 
          className="rounded-xl shadow-sm border border-gray-200"
          title={
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#3a2e2a] m-0">차시별 활동 정보</h3>
              {isEditMode && (
                <Button
                  type="primary"
                  onClick={handleAddSession}
                  className="h-9 px-4 rounded-lg border-0 text-white"
                  style={{
                    backgroundColor: '#1a202c',
                    borderColor: '#1a202c',
                    color: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#2d3748'
                    e.currentTarget.style.borderColor = '#2d3748'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#1a202c'
                    e.currentTarget.style.borderColor = '#1a202c'
                  }}
                >
                  차시 추가
                </Button>
              )}
            </div>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">차시</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">활동일자</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">활동시간</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">활동명</th>
                  {isEditMode && (
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">삭제</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={session.sessionNumber}
                          onChange={(e) => handleSessionChange(session.id, 'sessionNumber', parseInt(e.target.value) || 0)}
                          className="h-8 w-16 rounded text-center"
                        />
                      ) : (
                        `${session.sessionNumber}차시`
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {isEditMode ? (
                        <DatePicker
                          value={dayjs(session.date)}
                          onChange={(date) => handleSessionChange(session.id, 'date', date ? date.format('YYYY-MM-DD') : '')}
                          className="h-8 rounded w-32"
                        />
                      ) : (
                        session.date
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {isEditMode ? (
                        <div className="flex items-center gap-1">
                          <Input
                            value={session.startTime}
                            onChange={(e) => handleSessionChange(session.id, 'startTime', e.target.value)}
                            className="h-8 rounded w-20 text-center"
                          />
                          <span className="text-gray-500">~</span>
                          <Input
                            value={session.endTime}
                            onChange={(e) => handleSessionChange(session.id, 'endTime', e.target.value)}
                            className="h-8 rounded w-20 text-center"
                          />
                        </div>
                      ) : (
                        `${session.startTime} ~ ${session.endTime}`
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {isEditMode ? (
                        <Input
                          value={session.activityName}
                          onChange={(e) => handleSessionChange(session.id, 'activityName', e.target.value)}
                          className="h-8 rounded"
                        />
                      ) : (
                        session.activityName
                      )}
                    </td>
                    {isEditMode && (
                      <td className="py-3 px-4 text-center">
                        <Button
                          type="text"
                          icon={<Trash2 className="w-4 h-4 text-red-500" />}
                          onClick={() => handleDeleteSession(session.id)}
                          className="h-8 w-8 p-0 flex items-center justify-center"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
        </div>

        <div ref={(el) => { sectionRefs.current['photos'] = el }}>
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">활동 사진</h3>
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
                {isEditMode && (
                  <Button
                    type="text"
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={() => {
                      setPhotos(photos.filter(p => p.id !== photo.id));
                    }}
                    className="absolute top-2 right-2 h-8 w-8 p-0 flex items-center justify-center bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                )}
              </div>
            ))}
            {isEditMode && (
              <Upload
                beforeUpload={() => false} // Prevent automatic upload
                showUploadList={false}
                multiple
              >
                <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                  <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">사진 추가</span>
                </div>
              </Upload>
            )}
          </div>
        </Card>
        </div>
        </div>
      </div>
      </div>
      </div>
    </ProtectedRoute>
  )
}