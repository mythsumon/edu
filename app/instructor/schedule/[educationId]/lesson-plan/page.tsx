'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Input, Select, Space, message, Card, Badge, DatePicker, Table, Modal, Upload } from 'antd'
import { ArrowLeft, Save, CheckCircle2, XCircle, Plus, Trash2, AlertTriangle, Upload as UploadIcon } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DetailSectionCard } from '@/components/admin/operations'
import {
  getLessonPlanById,
  getLessonPlanByEducationId,
  upsertLessonPlan,
} from './storage'
import type { LessonPlanDoc, LessonPlanStatus, EducationType, InstitutionType, TargetLevel, LessonPlanSession } from './types'
import { dataStore } from '@/lib/dataStore'
import { getAllRegionCityCodes } from '@/lib/commonCodeStore'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function InstructorLessonPlanPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile, userRole } = useAuth()
  const educationId = params?.educationId as string
  const isAdmin = userRole === 'admin'

  const [loading, setLoading] = useState(true)
  const [doc, setDoc] = useState<LessonPlanDoc | null>(null)
  const [saving, setSaving] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [signatureModalVisible, setSignatureModalVisible] = useState(false)
  const [tempSignatureUrl, setTempSignatureUrl] = useState<string>('')
  const [tempSignatureName, setTempSignatureName] = useState<string>('')
  const [signatureFileList, setSignatureFileList] = useState<any[]>([])

  // Education data
  const education = useMemo(() => {
    return educationId ? dataStore.getEducationById(educationId) : null
  }, [educationId])

  const assignment = useMemo(() => {
    return educationId ? dataStore.getInstructorAssignmentByEducationId(educationId) : null
  }, [educationId])

  // Get main instructor - check all lessons to find if user is main instructor
  const mainInstructor = useMemo(() => {
    if (assignment?.lessons && assignment.lessons.length > 0) {
      return assignment.lessons[0]?.mainInstructors?.[0]
    }
    return null
  }, [assignment])

  // Check if current user is main instructor
  const isMainInstructor = useMemo(() => {
    if (isAdmin) return true
    if (!userProfile) return false
    
    // First, check Education.mainInstructorId if available
    if (education?.mainInstructorId) {
      if (education.mainInstructorId === userProfile.userId) {
        return true
      }
    }

    // Then check assignment lessons
    if (assignment?.lessons && assignment.lessons.length > 0) {
      const isMain = assignment.lessons.some(lesson => {
        if (!lesson.mainInstructors || lesson.mainInstructors.length === 0) return false
        return lesson.mainInstructors.some(instructor => {
          // Match by ID (exact match)
          if (instructor.id === userProfile.userId) return true
          // Match by name (exact match)
          if (instructor.name === userProfile.name) return true
          // Match by ID pattern (instructor-1, instructor-2, etc.)
          if (instructor.id && userProfile.userId) {
            const instructorNum = instructor.id.replace('instructor-', '')
            const userNum = userProfile.userId.replace('instructor-', '')
            if (instructorNum && userNum && instructorNum === userNum) return true
          }
          return false
        })
      })
      if (isMain) return true
    }

    // If no assignment data found, log warning but allow access for testing
    if (!assignment || !assignment.lessons || assignment.lessons.length === 0) {
      console.warn('No assignment data found for education:', educationId, 'User:', userProfile.name)
      // Allow access if user is logged in as instructor (for testing/debugging)
      return true
    }

    return false
  }, [isAdmin, assignment, education, userProfile, educationId])

  // Region city options
  const regionCityOptions = useMemo(() => {
    const codes = getAllRegionCityCodes()
    return codes.map(code => ({
      label: code.label,
      value: code.label, // Use label as value for simplicity
    }))
  }, [])

  // Load doc
  const loadDoc = async () => {
    try {
      let loadedDoc = getLessonPlanByEducationId(educationId)

      // Create new doc if not exists
      if (!loadedDoc) {
        const now = new Date().toISOString()
        
        // Get instructor info - use mainInstructor if available, otherwise use userProfile
        const instructorId = mainInstructor?.id || userProfile?.userId || 'instructor-unknown'
        const instructorName = mainInstructor?.name || userProfile?.name || '강사'

        // Use education data if available, otherwise use defaults
        const startDate = education?.periodStart ? dayjs(education.periodStart).format('YYYY-MM-DD') : ''
        const endDate = education?.periodEnd ? dayjs(education.periodEnd).format('YYYY-MM-DD') : ''
        
        // Parse gradeClass
        const gradeClassMatch = education?.gradeClass?.match(/(\d+)학년\s*(\d+)반/)
        const className = gradeClassMatch ? `${gradeClassMatch[1]}학년 ${gradeClassMatch[2]}반` : education?.gradeClass || ''

        loadedDoc = {
          id: `lp-${Date.now()}`,
          educationId: educationId,
          status: 'DRAFT',
          educationName: education?.name || '',
          institutionName: education?.institution || '',
          className: className,
          regionCity: education?.region || '',
          startDate: startDate,
          endDate: endDate,
          totalSessions: education?.period?.split('차시')[0] ? parseInt(education.period.split('차시')[0]) || 0 : 0,
          expectedStudents: 0,
          educationType: '센터교육',
          institutionType: '일반학교',
          targetLevel: '초등',
          learningTech: '',
          textbook: '',
          담당자명: '',
          담당자연락처: '',
          goals: ['', '', ''],
          sessions: [],
          authorInstructorId: instructorId,
          authorInstructorName: instructorName,
          createdAt: now,
          updatedAt: now,
        }

        // Save the newly created doc
        upsertLessonPlan(loadedDoc)
      }

      setDoc(loadedDoc)
      setIsEditMode(loadedDoc?.status === 'DRAFT' || loadedDoc?.status === 'REJECTED' || isAdmin)
    } catch (error) {
      console.error('Error loading lesson plan:', error)
      message.error('강의계획서를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (educationId) {
      loadDoc()
    }
  }, [educationId, education, mainInstructor, userProfile])

  // Listen for updates
  useEffect(() => {
    if (typeof window === 'undefined' || !educationId) return

    const handleUpdate = () => {
      loadDoc()
    }

    window.addEventListener('lessonPlanUpdated', handleUpdate)
    return () => {
      window.removeEventListener('lessonPlanUpdated', handleUpdate)
    }
  }, [educationId])

  // Role-based editability
  const isEditable = isAdmin
    ? true // Admin can always edit
    : isMainInstructor && (doc?.status === 'DRAFT' || doc?.status === 'REJECTED')
  const isReadonly = !isAdmin && (doc?.status === 'SUBMITTED' || doc?.status === 'APPROVED')

  // Check deadline: must submit before education start
  const canSubmit = (): boolean => {
    if (!doc || !education) return false

    // Admin can always submit
    if (isAdmin) return true

    // Check if education has started
    const startDate = education.periodStart ? dayjs(education.periodStart) : null
    if (startDate && dayjs().isAfter(startDate)) {
      return false
    }

    return true
  }

  const validateDoc = (): string | null => {
    if (!doc) return '문서가 없습니다.'

    // Required fields
    if (!doc.educationType) return '교육구분을 선택해주세요.'
    if (!doc.institutionType) return '기관구분을 선택해주세요.'
    if (doc.institutionType === '기타' && !doc.institutionTypeEtc) {
      return '기타 상세를 입력해주세요.'
    }
    if (!doc.targetLevel) return '교육대상을 선택해주세요.'
    if (!doc.learningTech) return '학습기술을 입력해주세요.'
    if (!doc.textbook) return '교육교재를 입력해주세요.'
    if (!doc.담당자명) return '기관 담당자명을 입력해주세요.'
    if (!doc.담당자연락처) return '기관 담당자 연락처를 입력해주세요.'

    // Goals: at least 1 required
    if (doc.goals.filter(g => g.trim()).length === 0) {
      return '교육목표를 최소 1개 이상 입력해주세요.'
    }

    // Sessions: at least 1 required
    if (doc.sessions.length === 0) {
      return '차시별 계획을 최소 1개 이상 입력해주세요.'
    }

    return null
  }

  const handleSave = async () => {
    if (!doc) return

    const validationError = validateDoc()
    if (validationError) {
      message.warning(validationError)
      return
    }

    setSaving(true)
    try {
      const updated = {
        ...doc,
        status: 'DRAFT' as const,
        updatedAt: new Date().toISOString(),
      }
      upsertLessonPlan(updated)
      message.success('강의계획서가 임시저장되었습니다.')
      setDoc(updated)
    } catch (error) {
      console.error('Error saving lesson plan:', error)
      message.error('강의계획서 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }


  const handleSubmit = async () => {
    if (!doc) return

    // Check deadline
    if (!canSubmit()) {
      Modal.warning({
        title: '제출 불가',
        content: '교육 시작 이후에는 강의계획서를 제출할 수 없습니다. 관리자에게 요청해주세요.',
      })
      return
    }

    const validationError = validateDoc()
    if (validationError) {
      message.warning(validationError)
      return
    }

    setSaving(true)
    try {
      const now = new Date().toISOString()
      const updated: LessonPlanDoc = {
        ...doc,
        status: 'SUBMITTED',
        submittedAt: now,
        submittedBy: doc.authorInstructorName,
        updatedAt: now,
      }
      upsertLessonPlan(updated)
      message.success('강의계획서가 제출되었습니다. 관리자 승인을 기다려주세요.')
      setDoc(updated)
      setIsEditMode(false)

      // Navigate back after a short delay
      setTimeout(() => {
        router.push('/instructor/submissions')
      }, 1500)
    } catch (error) {
      console.error('Error submitting lesson plan:', error)
      message.error('강의계획서 제출 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
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

  const handleSessionChange = (index: number, field: keyof LessonPlanSession, value: any) => {
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
    const newSession: LessonPlanSession = {
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

  // Signature handlers
  const handleOpenSignatureModal = () => {
    if (doc?.signature) {
      setTempSignatureUrl(doc.signature.signatureImageUrl || '')
      setTempSignatureName(doc.signature.signedByUserName)
    } else if (userProfile?.signatureImageUrl) {
      setTempSignatureUrl(userProfile.signatureImageUrl)
      setTempSignatureName(userProfile.name || '')
    } else {
      setTempSignatureUrl('')
      setTempSignatureName(userProfile?.name || '')
    }
    setSignatureModalVisible(true)
  }

  const handleSignatureUpload = (file: File): boolean => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
    if (!isJpgOrPng) {
      message.error('JPG/PNG 파일만 업로드 가능합니다!')
      return false
    }
    const isLt2M = file.size / 1024 / 1024 < 2
    if (!isLt2M) {
      message.error('이미지 크기는 2MB 미만이어야 합니다!')
      return false
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        setTempSignatureUrl(result)
        setSignatureFileList([{
          uid: '-1',
          name: file.name,
          status: 'done',
          url: result,
        }])
      }
    }
    reader.onerror = () => {
      message.error('파일을 읽는 중 오류가 발생했습니다.')
    }
    reader.readAsDataURL(file)
    return false
  }

  const handleSignatureApply = async () => {
    if (!doc || !userProfile) return

    if (!tempSignatureName.trim()) {
      message.warning('서명자 이름을 입력해주세요.')
      return
    }

    const signature = {
      signedByUserId: userProfile.userId,
      signedByUserName: tempSignatureName,
      signedAt: new Date().toISOString(),
      signatureImageUrl: tempSignatureUrl || undefined,
    }

    const updated = {
      ...doc,
      signature,
      updatedAt: new Date().toISOString(),
    }

    // Save to storage
    upsertLessonPlan(updated)
    setDoc(updated)

    setSignatureModalVisible(false)
    setTempSignatureUrl('')
    setTempSignatureName('')
    setSignatureFileList([])
    message.success('서명이 적용되었습니다.')
  }

  const handleSignatureDelete = async () => {
    if (!doc) return
    
    const updated = {
      ...doc,
      signature: undefined,
      updatedAt: new Date().toISOString(),
    }
    
    // Save to storage
    upsertLessonPlan(updated)
    setDoc(updated)
    message.success('서명이 삭제되었습니다.')
  }

  const getStatusBadge = (status: LessonPlanStatus) => {
    switch (status) {
      case 'APPROVED':
        return <Badge status="success" text="승인됨" />
      case 'SUBMITTED':
        return <Badge status="processing" text="제출됨" />
      case 'REJECTED':
        return <Badge status="error" text="반려됨" />
      default:
        return <Badge status="default" text="임시저장" />
    }
  }

  if (loading) {
    return (
      <ProtectedRoute requiredRole="instructor">
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
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
          <div className="p-6">
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400">강의계획서를 불러올 수 없습니다.</p>
                <Button className="mt-4" onClick={() => router.back()}>
                  돌아가기
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Check if user is not main instructor
  if (!isAdmin && !isMainInstructor) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
          <div className="p-6">
            <Card>
              <div className="text-center py-12">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  강의계획서는 주강사만 작성할 수 있습니다.
                </p>
                <Button onClick={() => router.back()}>
                  돌아가기
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="instructor">
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
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    강의계획서
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(doc.status)}
                    {doc.status === 'REJECTED' && doc.rejectReason && (
                      <span className="text-sm text-red-600 dark:text-red-400">
                        반려사유: {doc.rejectReason}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Space>
                {isEditable && (
                  <>
                    <Button
                      icon={<Save className="w-4 h-4" />}
                      onClick={handleSave}
                      loading={saving}
                    >
                      임시저장
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={handleSubmit}
                      loading={saving}
                      disabled={!canSubmit()}
                    >
                      제출하기
                    </Button>
                  </>
                )}
                {isReadonly && (
                  <Button onClick={() => router.back()}>
                    목록으로
                  </Button>
                )}
              </Space>
            </div>
          </div>
        </div>

        {/* Status banner */}
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

        {doc.status === 'REJECTED' && doc.rejectReason && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-900 dark:text-red-100 mb-1">반려 사유</div>
                  <div className="text-sm text-red-700 dark:text-red-300">{doc.rejectReason}</div>
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

          {/* Basic Information */}
          <DetailSectionCard title="기본 정보" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Auto-filled fields (read-only for instructor, editable for admin) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  학급명 <span className="text-red-500">*</span>
                </label>
                {isEditable && isAdmin ? (
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
                  지역(시/군) <span className="text-red-500">*</span>
                </label>
                {isEditable ? (
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
                  교육시작일 예정 <span className="text-red-500">*</span>
                </label>
                {isEditable && isAdmin ? (
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
                  교육종료일 예정 <span className="text-red-500">*</span>
                </label>
                {isEditable && isAdmin ? (
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
                  총 교육 차시 <span className="text-red-500">*</span>
                </label>
                {isEditable && isAdmin ? (
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
                  교육인원 <span className="text-red-500">*</span>
                </label>
                {isEditable && isAdmin ? (
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

              {/* Select fields */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  교육구분 <span className="text-red-500">*</span>
                </label>
                {isEditable ? (
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
                  기관구분 <span className="text-red-500">*</span>
                </label>
                {isEditable ? (
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
                    기타 상세 <span className="text-red-500">*</span>
                  </label>
                  {isEditable ? (
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
                  교육대상 <span className="text-red-500">*</span>
                </label>
                {isEditable ? (
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
                  학습기술 <span className="text-red-500">*</span>
                </label>
                {isEditable ? (
                  <Input
                    value={doc.learningTech}
                    onChange={(e) => handleFieldChange('learningTech', e.target.value)}
                    placeholder="예: 엔트리"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.learningTech || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  교육교재 <span className="text-red-500">*</span>
                </label>
                {isEditable ? (
                  <Input
                    value={doc.textbook}
                    onChange={(e) => handleFieldChange('textbook', e.target.value)}
                    placeholder="예: 컴퓨터"
                  />
                ) : (
                  <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    {doc.textbook || '-'}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  기관 담당자명 <span className="text-red-500">*</span>
                </label>
                {isEditable ? (
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
                  기관 담당자 연락처 <span className="text-red-500">*</span>
                </label>
                {isEditable ? (
                  <Input
                    value={doc.담당자연락처}
                    onChange={(e) => handleFieldChange('담당자연락처', e.target.value)}
                    placeholder="010-1234-5678"
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
          <DetailSectionCard title="교육목표" className="mb-6">
            <div className="flex items-center justify-end mb-4">
              {isEditable && (
                <Button
                  type="dashed"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddGoal}
                >
                  목표 추가
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {doc.goals.map((goal, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-1">
                    {isEditable ? (
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
                  {isEditable && doc.goals.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleRemoveGoal(index)}
                    />
                  )}
                </div>
              ))}
            </div>
          </DetailSectionCard>

          {/* Session Plans */}
          <DetailSectionCard title="차시별 계획" className="mb-6">
            <div className="flex items-center justify-end mb-4">
              {isEditable && (
                <Button
                  type="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddSession}
                >
                  차시 추가
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {doc.sessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  차시별 계획이 없습니다. 차시를 추가해주세요.
                </div>
              ) : (
                doc.sessions.map((session, index) => (
                  <Card key={index} className="border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {session.sessionNo}회차
                      </h3>
                      {isEditable && (
                        <Button
                          type="text"
                          danger
                          icon={<Trash2 className="w-4 h-4" />}
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
                        {isEditable ? (
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
                        {isEditable ? (
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
                        {isEditable ? (
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
                        {isEditable ? (
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
                        {isEditable ? (
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
                      : dayjs().format('YYYY. MM. DD.')}
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
                      <p className="text-base text-gray-400 dark:text-gray-500">미서명</p>
                    )}
                  </div>
                </div>
              </div>
              {isEditable && (
                <div className="flex justify-end gap-2 mt-4">
                  {doc.signature ? (
                    <Button onClick={handleOpenSignatureModal}>
                      서명 수정
                    </Button>
                  ) : (
                    <Button type="primary" onClick={handleOpenSignatureModal}>
                      서명 추가
                    </Button>
                  )}
                  {doc.signature && (
                    <Button danger onClick={handleSignatureDelete}>
                      서명 삭제
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DetailSectionCard>
        </div>
      </div>

      {/* Signature Modal */}
      <Modal
        title="서명 추가"
        open={signatureModalVisible}
        onOk={handleSignatureApply}
        onCancel={() => {
          setSignatureModalVisible(false)
          setTempSignatureUrl('')
          setTempSignatureName('')
          setSignatureFileList([])
        }}
        okText="적용"
        cancelText="취소"
        width={600}
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            서명 이미지를 선택하거나 업로드하세요.
          </p>
          
          {/* 서명 이미지 미리보기 */}
          {tempSignatureUrl && (
            <div className="border border-gray-300 dark:border-gray-600 rounded p-4 flex flex-col items-center justify-center">
              <img
                src={tempSignatureUrl}
                alt="선택된 서명"
                className="max-w-[200px] max-h-[80px] object-contain mb-2"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                선택된 서명 미리보기
              </div>
            </div>
          )}

          {/* 서명자 이름 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              서명자 이름 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="서명자 이름을 입력하세요"
              value={tempSignatureName}
              onChange={(e) => setTempSignatureName(e.target.value)}
            />
          </div>

          {/* 내 서명 사용 버튼 */}
          {userProfile?.signatureImageUrl && (
            <Button
              onClick={() => {
                setTempSignatureUrl(userProfile.signatureImageUrl || '')
                setTempSignatureName(userProfile.name || '')
                setSignatureFileList([{
                  uid: '-1',
                  name: '내 서명',
                  status: 'done',
                  url: userProfile.signatureImageUrl,
                }])
              }}
              className="w-full"
              type={tempSignatureUrl === userProfile.signatureImageUrl ? 'primary' : 'default'}
            >
              내 서명 사용 ({userProfile.name})
            </Button>
          )}

          {/* 서명 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              서명 이미지 업로드
            </label>
            <Upload
              fileList={signatureFileList}
              beforeUpload={handleSignatureUpload}
              onRemove={() => {
                setTempSignatureUrl('')
                setSignatureFileList([])
              }}
              accept="image/png,image/jpeg,image/jpg"
              maxCount={1}
              listType="picture-card"
            >
              {signatureFileList.length < 1 && (
                <div className="flex flex-col items-center justify-center">
                  <UploadIcon className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">서명 업로드</span>
                </div>
              )}
            </Upload>
            <p className="text-xs text-gray-500 mt-2">
              JPG/PNG 파일만 업로드 가능합니다. (최대 2MB)
            </p>
          </div>
        </div>
      </Modal>
    </ProtectedRoute>
  )
}
