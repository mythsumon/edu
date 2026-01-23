'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, message, Card, Space, Badge, Modal, Input } from 'antd'
import { ArrowLeft, CheckCircle2, XCircle, Edit, Download, AlertTriangle } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DetailSectionCard } from '@/components/admin/operations'
import {
  getLessonPlanById,
  upsertLessonPlan,
} from '@/app/instructor/schedule/[educationId]/lesson-plan/storage'
import type { LessonPlanDoc, LessonPlanStatus } from '@/app/instructor/schedule/[educationId]/lesson-plan/types'
import { useAuth } from '@/contexts/AuthContext'
import dayjs from 'dayjs'
import { generateLessonPlanFilename } from '@/lib/filenameGenerator'
import { Select, DatePicker } from 'antd'
import { getAllRegionCityCodes } from '@/lib/commonCodeStore'

const { TextArea } = Input

export default function AdminLessonPlanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [doc, setDoc] = useState<LessonPlanDoc | null>(null)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isEditMode, setIsEditMode] = useState(false)

  // Region city options
  const regionCityOptions = getAllRegionCityCodes().map(code => ({
    label: code.label,
    value: code.label,
  }))

  // Load doc
  const loadDoc = async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      const loadedDoc = getLessonPlanById(id)
      if (!loadedDoc) {
        message.error('강의계획서를 찾을 수 없습니다.')
        router.push('/admin/submissions')
        return
      }
      setDoc(loadedDoc)
    } catch (error) {
      console.error('Error loading lesson plan:', error)
      message.error('강의계획서를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoc()
  }, [id])

  // Listen for updates
  useEffect(() => {
    if (typeof window === 'undefined' || !id) return

    const handleUpdate = () => {
      loadDoc()
    }

    window.addEventListener('lessonPlanUpdated', handleUpdate)
    return () => {
      window.removeEventListener('lessonPlanUpdated', handleUpdate)
    }
  }, [id])

  const handleApprove = async () => {
    if (!doc) return

    Modal.confirm({
      title: '강의계획서 승인',
      content: '이 강의계획서를 승인하시겠습니까?',
      okText: '승인',
      cancelText: '취소',
      onOk: async () => {
        try {
          const now = new Date().toISOString()
          const updated: LessonPlanDoc = {
            ...doc,
            status: 'APPROVED',
            approvedAt: now,
            approvedBy: userProfile?.name || '관리자',
            updatedAt: now,
          }
          upsertLessonPlan(updated)
          message.success('강의계획서가 승인되었습니다.')
          setDoc(updated)
          setIsEditMode(false)

          // Trigger event for real-time updates
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('lessonPlanUpdated'))
          }
        } catch (error) {
          console.error('Error approving lesson plan:', error)
          message.error('승인 처리 중 오류가 발생했습니다.')
        }
      },
    })
  }

  const handleReject = () => {
    if (!doc) return
    setRejectModalVisible(true)
  }

  const handleRejectConfirm = async () => {
    if (!doc) return

    if (!rejectReason || rejectReason.trim() === '') {
      message.warning('반려 사유를 입력해주세요.')
      return
    }

    try {
      const now = new Date().toISOString()
      const updated: LessonPlanDoc = {
        ...doc,
        status: 'REJECTED',
        rejectedAt: now,
        rejectedBy: userProfile?.name || '관리자',
        rejectReason: rejectReason.trim(),
        updatedAt: now,
      }
      upsertLessonPlan(updated)
      message.success('강의계획서가 반려되었습니다.')
      setDoc(updated)
      setRejectModalVisible(false)
      setRejectReason('')
      setIsEditMode(false)

      // Trigger event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lessonPlanUpdated'))
      }
    } catch (error) {
      console.error('Error rejecting lesson plan:', error)
      message.error('반려 처리 중 오류가 발생했습니다.')
    }
  }

  const handleSave = async () => {
    if (!doc) return

    try {
      const updated = {
        ...doc,
        updatedAt: new Date().toISOString(),
      }
      upsertLessonPlan(updated)
      message.success('강의계획서가 저장되었습니다.')
      setDoc(updated)
      setIsEditMode(false)
    } catch (error) {
      console.error('Error saving lesson plan:', error)
      message.error('강의계획서 저장 중 오류가 발생했습니다.')
    }
  }

  const handleFieldChange = (field: keyof LessonPlanDoc, value: any) => {
    if (!doc) return
    setDoc({ ...doc, [field]: value })
  }

  const handleGoalChange = (index: number, value: string) => {
    if (!doc) return
    const newGoals = [...doc.goals]
    newGoals[index] = value
    setDoc({ ...doc, goals: newGoals })
  }

  const handleAddGoal = () => {
    if (!doc) return
    setDoc({ ...doc, goals: [...doc.goals, ''] })
  }

  const handleRemoveGoal = (index: number) => {
    if (!doc) return
    const newGoals = doc.goals.filter((_, i) => i !== index)
    setDoc({ ...doc, goals: newGoals.length > 0 ? newGoals : [''] })
  }

  const handleSessionChange = (index: number, field: keyof LessonPlanDoc['sessions'][0], value: any) => {
    if (!doc) return
    const newSessions = [...doc.sessions]
    newSessions[index] = { ...newSessions[index], [field]: value }
    setDoc({ ...doc, sessions: newSessions })
  }

  const handleAddSession = () => {
    if (!doc) return
    const nextSessionNo = doc.sessions.length > 0
      ? Math.max(...doc.sessions.map(s => s.sessionNo)) + 1
      : 1
    const newSession = {
      sessionNo: nextSessionNo,
      date: '',
      topic: '',
      content: '',
      materials: '',
      note: '',
    }
    setDoc({ ...doc, sessions: [...doc.sessions, newSession] })
  }

  const handleRemoveSession = (index: number) => {
    if (!doc) return
    const newSessions = doc.sessions.filter((_, i) => i !== index)
    setDoc({ ...doc, sessions: newSessions })
  }

  const getStatusBadge = (status: LessonPlanStatus) => {
    switch (status) {
      case 'APPROVED':
        return (
          <Badge
            status="success"
            text="승인됨"
            className="text-green-600 font-semibold"
          />
        )
      case 'REJECTED':
        return (
          <Badge
            status="error"
            text="반려됨"
            className="text-red-600 font-semibold"
          />
        )
      case 'SUBMITTED':
        return (
          <Badge
            status="processing"
            text="제출됨"
            className="text-blue-600 font-semibold"
          />
        )
      default:
        return (
          <Badge
            status="default"
            text="임시저장"
            className="text-gray-600 font-semibold"
          />
        )
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
          <div className="p-6">
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">로딩 중...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!doc) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
          <div className="p-6">
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">강의계획서를 불러올 수 없습니다.</p>
                <Button className="mt-4" onClick={() => router.push('/admin/submissions')}>
                  목록으로
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

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
                  onClick={() => router.push('/admin/submissions')}
                  className="flex items-center dark:text-gray-300"
                >
                  돌아가기
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    강의계획서 상세
                  </h1>
                  <div className="mt-1">
                    {getStatusBadge(doc.status)}
                  </div>
                </div>
              </div>
              <Space>
                <Button
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    const firstSession = doc.sessions?.[0]
                    const sessionDate = firstSession?.date
                    const startDate = doc.startDate
                    const endDate = doc.endDate
                    const institutionName = doc.institutionName || ''
                    const gradeClass = doc.className || ''
                    const instructorName = doc.authorInstructorName || ''
                    
                    const filename = generateLessonPlanFilename({
                      sessionDate: sessionDate,
                      startDate: startDate,
                      endDate: endDate,
                      schoolName: institutionName,
                      gradeClass: gradeClass,
                      instructorName: instructorName,
                      documentType: '강의계획서',
                    })
                    
                    // TODO: 실제 파일 다운로드 구현
                    console.log('Download lesson plan:', filename)
                    message.info(`강의계획서 다운로드: ${filename}`)
                  }}
                  className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
                >
                  다운로드
                </Button>
                {!isEditMode ? (
                  <>
                    <Button
                      icon={<Edit className="w-4 h-4" />}
                      onClick={() => setIsEditMode(true)}
                    >
                      수정
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={handleApprove}
                      disabled={doc.status === 'APPROVED'}
                    >
                      승인
                    </Button>
                    <Button
                      danger
                      icon={<XCircle className="w-4 h-4" />}
                      onClick={handleReject}
                      disabled={doc.status === 'REJECTED' || doc.status === 'APPROVED'}
                    >
                      반려
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={() => setIsEditMode(false)}>
                      취소
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleSave}
                    >
                      저장
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>
        </div>

        {/* Submitted banner */}
        {doc.status === 'SUBMITTED' && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  제출 완료 (승인 대기 중)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reject reason banner */}
        {doc.status === 'REJECTED' && doc.rejectReason && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-900 dark:text-red-100 mb-1">반려 사유</div>
                  <div className="text-sm text-red-700 dark:text-red-300">{doc.rejectReason}</div>
                  {doc.rejectedAt && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      반려일시: {dayjs(doc.rejectedAt).format('YYYY-MM-DD HH:mm')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Education Summary */}
          <DetailSectionCard title="교육 정보" className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">교육ID</div>
                <div className="font-medium">{doc.educationId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">교육명</div>
                <div className="font-medium">{doc.educationName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">기관명</div>
                <div className="font-medium">{doc.institutionName}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">기간</div>
                <div className="font-medium">
                  {doc.startDate && doc.endDate
                    ? `${dayjs(doc.startDate).format('YYYY-MM-DD')} ~ ${dayjs(doc.endDate).format('YYYY-MM-DD')}`
                    : '-'}
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* Basic Information - Same as instructor page but admin can edit */}
          <DetailSectionCard title="기본 정보" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* All fields editable by admin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  학급명
                </label>
                {isEditMode ? (
                  <Input
                    value={doc.className}
                    onChange={(e) => handleFieldChange('className', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.className || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  지역(시/군)
                </label>
                {isEditMode ? (
                  <Select
                    className="w-full"
                    value={doc.regionCity}
                    onChange={(value) => handleFieldChange('regionCity', value)}
                    options={regionCityOptions}
                    placeholder="지역 선택"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.regionCity || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  교육시작일 예정
                </label>
                {isEditMode ? (
                  <DatePicker
                    className="w-full"
                    value={doc.startDate ? dayjs(doc.startDate) : null}
                    onChange={(date) => handleFieldChange('startDate', date ? date.format('YYYY-MM-DD') : '')}
                    format="YYYY-MM-DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.startDate ? dayjs(doc.startDate).format('YYYY-MM-DD') : '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  교육종료일 예정
                </label>
                {isEditMode ? (
                  <DatePicker
                    className="w-full"
                    value={doc.endDate ? dayjs(doc.endDate) : null}
                    onChange={(date) => handleFieldChange('endDate', date ? date.format('YYYY-MM-DD') : '')}
                    format="YYYY-MM-DD"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.endDate ? dayjs(doc.endDate).format('YYYY-MM-DD') : '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  총 교육 차시
                </label>
                {isEditMode ? (
                  <Input
                    type="number"
                    value={doc.totalSessions}
                    onChange={(e) => handleFieldChange('totalSessions', parseInt(e.target.value) || 0)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.totalSessions || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  교육인원
                </label>
                {isEditMode ? (
                  <Input
                    type="number"
                    value={doc.expectedStudents}
                    onChange={(e) => handleFieldChange('expectedStudents', parseInt(e.target.value) || 0)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.expectedStudents || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  교육구분
                </label>
                {isEditMode ? (
                  <Select
                    className="w-full"
                    value={doc.educationType}
                    onChange={(value) => handleFieldChange('educationType', value)}
                    options={[
                      { label: '센터교육', value: '센터교육' },
                      { label: '방문교육', value: '방문교육' },
                      { label: '온라인', value: '온라인' },
                    ]}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.educationType || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  기관구분
                </label>
                {isEditMode ? (
                  <Select
                    className="w-full"
                    value={doc.institutionType}
                    onChange={(value) => {
                      handleFieldChange('institutionType', value)
                      if (value !== '기타') {
                        handleFieldChange('institutionTypeEtc', undefined)
                      }
                    }}
                    options={[
                      { label: '일반학교', value: '일반학교' },
                      { label: '도서관', value: '도서관' },
                      { label: '도서벽지', value: '도서벽지' },
                      { label: '지역아동센터', value: '지역아동센터' },
                      { label: '특수학급', value: '특수학급' },
                      { label: '수원센터', value: '수원센터' },
                      { label: '의정부센터', value: '의정부센터' },
                      { label: '온라인', value: '온라인' },
                      { label: '연계거점', value: '연계거점' },
                      { label: '기타', value: '기타' },
                    ]}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.institutionType || '-'}
                  </div>
                )}
              </div>

              {doc.institutionType === '기타' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    기타 상세
                  </label>
                  {isEditMode ? (
                    <Input
                      value={doc.institutionTypeEtc || ''}
                      onChange={(e) => handleFieldChange('institutionTypeEtc', e.target.value)}
                      placeholder="기타 상세 입력"
                    />
                  ) : (
                    <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                      {doc.institutionTypeEtc || '-'}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  교육대상
                </label>
                {isEditMode ? (
                  <Select
                    className="w-full"
                    value={doc.targetLevel}
                    onChange={(value) => handleFieldChange('targetLevel', value)}
                    options={[
                      { label: '초등', value: '초등' },
                      { label: '중등', value: '중등' },
                      { label: '고등', value: '고등' },
                      { label: '혼합', value: '혼합' },
                    ]}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.targetLevel || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  학습기술
                </label>
                {isEditMode ? (
                  <Input
                    value={doc.learningTech}
                    onChange={(e) => handleFieldChange('learningTech', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.learningTech || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  교육교재
                </label>
                {isEditMode ? (
                  <Input
                    value={doc.textbook}
                    onChange={(e) => handleFieldChange('textbook', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.textbook || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  기관 담당자명
                </label>
                {isEditMode ? (
                  <Input
                    value={doc.담당자명}
                    onChange={(e) => handleFieldChange('담당자명', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.담당자명 || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  기관 담당자 연락처
                </label>
                {isEditMode ? (
                  <Input
                    value={doc.담당자연락처}
                    onChange={(e) => handleFieldChange('담당자연락처', e.target.value)}
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.담당자연락처 || '-'}
                  </div>
                )}
              </div>
            </div>
          </DetailSectionCard>

          {/* Education Goals */}
          <DetailSectionCard
            title="교육목표"
            className="mb-6"
          >
            <div className="space-y-3">
              {doc.goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    {isEditMode ? (
                      <TextArea
                        value={goal}
                        onChange={(e) => handleGoalChange(index, e.target.value)}
                        placeholder={`교육목표 ${index + 1}`}
                        rows={2}
                      />
                    ) : (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                        {goal || '-'}
                      </div>
                    )}
                  </div>
                  {isEditMode && doc.goals.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<XCircle className="w-4 h-4" />}
                      onClick={() => handleRemoveGoal(index)}
                    />
                  )}
                </div>
              ))}
            </div>
          </DetailSectionCard>

          {/* Session Plans */}
          <DetailSectionCard
            title="차시별 계획"
            className="mb-6"
          >
            <div className="space-y-4">
              {isEditMode && (
                <div className="flex justify-end mb-4">
                  <Button
                    type="primary"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={handleAddSession}
                  >
                    차시 추가
                  </Button>
                </div>
              )}
              {doc.sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  차시별 계획이 없습니다.
                </div>
              ) : (
                doc.sessions.map((session, index) => (
                  <Card key={index} className="border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {session.sessionNo}회차
                      </h3>
                      {isEditMode && (
                        <Button
                          type="text"
                          danger
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={() => handleRemoveSession(index)}
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          날짜
                        </label>
                        {isEditMode ? (
                          <DatePicker
                            className="w-full"
                            value={session.date ? dayjs(session.date) : null}
                            onChange={(date) =>
                              handleSessionChange(index, 'date', date ? date.format('YYYY-MM-DD') : '')
                            }
                            format="YYYY-MM-DD"
                          />
                        ) : (
                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            {session.date ? dayjs(session.date).format('YYYY-MM-DD') : '-'}
                          </div>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          소주제
                        </label>
                        {isEditMode ? (
                          <Input
                            value={session.topic}
                            onChange={(e) => handleSessionChange(index, 'topic', e.target.value)}
                          />
                        ) : (
                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            {session.topic || '-'}
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          활동내용
                        </label>
                        {isEditMode ? (
                          <TextArea
                            value={session.content}
                            onChange={(e) => handleSessionChange(index, 'content', e.target.value)}
                            rows={3}
                          />
                        ) : (
                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 whitespace-pre-wrap">
                            {session.content || '-'}
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          준비물
                        </label>
                        {isEditMode ? (
                          <Input
                            value={session.materials}
                            onChange={(e) => handleSessionChange(index, 'materials', e.target.value)}
                          />
                        ) : (
                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            {session.materials || '-'}
                          </div>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          비고
                        </label>
                        {isEditMode ? (
                          <Input
                            value={session.note || ''}
                            onChange={(e) => handleSessionChange(index, 'note', e.target.value)}
                          />
                        ) : (
                          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                            {session.note || '-'}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </DetailSectionCard>

          {/* Signature Section */}
          <DetailSectionCard title="서명" className="mb-6">
            <div className="border border-gray-300 dark:border-gray-600 rounded-lg p-6">
              <div className="text-center mb-4">
                <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-4">
                  다음과 같이 강의계획서를 제출합니다.
                </p>
                <div className="mb-6">
                  <p className="text-base text-gray-700 dark:text-gray-300">
                    {doc.signature?.signedAt 
                      ? dayjs(doc.signature.signedAt).format('YYYY. MM. DD.')
                      : doc.submittedAt
                      ? dayjs(doc.submittedAt).format('YYYY. MM. DD.')
                      : dayjs(doc.createdAt).format('YYYY. MM. DD.')}
                  </p>
                </div>
                <div className="flex justify-end items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">작성자</p>
                    {doc.signature ? (
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {doc.signature.signedByUserName}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">(인)</span>
                        {doc.signature.signatureImageUrl && (
                          <img
                            src={doc.signature.signatureImageUrl}
                            alt="서명"
                            className="h-12 object-contain"
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-base font-medium text-gray-900 dark:text-gray-100">
                          {doc.authorInstructorName}
                        </span>
                        <span className="text-sm text-gray-400 dark:text-gray-500">(미서명)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {doc.submittedAt && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>제출일시: {dayjs(doc.submittedAt).format('YYYY-MM-DD HH:mm')}</p>
                    {doc.approvedAt && (
                      <p className="mt-1">승인일시: {dayjs(doc.approvedAt).format('YYYY-MM-DD HH:mm')}</p>
                    )}
                    {doc.rejectedAt && (
                      <p className="mt-1">반려일시: {dayjs(doc.rejectedAt).format('YYYY-MM-DD HH:mm')}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DetailSectionCard>
        </div>

        {/* Reject Modal */}
        <Modal
          title="강의계획서 반려"
          open={rejectModalVisible}
          onOk={handleRejectConfirm}
          onCancel={() => {
            setRejectModalVisible(false)
            setRejectReason('')
          }}
          okText="반려"
          cancelText="취소"
          okButtonProps={{ danger: true }}
        >
          <div className="space-y-2">
            <p>반려 사유를 입력해주세요.</p>
            <TextArea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="반려 사유를 입력하세요..."
              rows={4}
            />
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}
