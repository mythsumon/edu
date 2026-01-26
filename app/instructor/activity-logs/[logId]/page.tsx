'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Input, Select, DatePicker, InputNumber, Space, message, Modal, Upload, Badge, Tooltip } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { ArrowLeft, Save, Trash2, Edit, X, CheckCircle2, XCircle, Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DetailSectionCard } from '@/components/admin/operations'
import { PhotoUploader } from '../components/PhotoUploader'
import { SessionRowsTable } from '../components/SessionRowsTable'
import { ActivityLog, ActivityLogSessionRow, UploadedImage } from '../types'
import { upsertActivityLog, getActivityLogById, getActivityLogByEducationId } from '../storage'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function ActivityLogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile, userRole } = useAuth()
  const logId = params?.logId as string
  const isNew = logId === 'new'
  const isAdmin = userRole === 'admin' || userRole === 'operator'

  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(isNew) // New logs start in edit mode
  const [formData, setFormData] = useState<ActivityLog>({
    logCode: '',
    educationType: '',
    institutionType: '',
    region: '',
    institutionName: '',
    grade: '',
    class: '',
    startDate: '',
    endDate: '',
    totalApplicants: 0,
    graduateMale: 0,
    graduateFemale: 0,
    sessions: [],
    photos: [],
    status: 'DRAFT',
  })
  
  // Signature state
  const [signatureImageUrl, setSignatureImageUrl] = useState<string>('')
  const [signatureSignedAt, setSignatureSignedAt] = useState<string>('')
  const [signatureSignedBy, setSignatureSignedBy] = useState<string>('')
  const [signatureModalVisible, setSignatureModalVisible] = useState(false)
  const [tempSignatureUrl, setTempSignatureUrl] = useState<string>('')
  const [tempSignatureName, setTempSignatureName] = useState<string>('')

  // Auto-load profile signature when modal opens
  useEffect(() => {
    if (signatureModalVisible && userProfile?.signatureImageUrl && !tempSignatureUrl) {
      setTempSignatureUrl(userProfile.signatureImageUrl)
      setTempSignatureName(userProfile.name || '')
    }
  }, [signatureModalVisible, userProfile?.signatureImageUrl, userProfile?.name, tempSignatureUrl])

  // Load existing data
  const loadActivityLog = () => {
    if (!isNew && logId) {
      // Try to find by ID first
      let savedLog = getActivityLogById(logId)
      
      // If not found and logId looks like an educationId (starts with EDU-), try by educationId
      if (!savedLog && logId.startsWith('EDU-')) {
        savedLog = getActivityLogByEducationId(logId)
      }
      
      if (savedLog) {
        setFormData(savedLog)
      } else {
        // If still not found, create a new log with educationId set
        const newLogData: ActivityLog = {
          id: `log-${Date.now()}`,
          logCode: `2025-${String(Date.now()).slice(-4)}`,
          educationType: '',
          institutionType: '',
          region: '',
          institutionName: '',
          grade: '',
          class: '',
          startDate: '',
          endDate: '',
          totalApplicants: 0,
          graduateMale: 0,
          graduateFemale: 0,
          sessions: [],
          photos: [],
          createdAt: new Date().toISOString(),
          createdBy: userProfile?.name || '',
          status: 'DRAFT',
          educationId: logId.startsWith('EDU-') ? logId : undefined,
        }
        setFormData(newLogData)
        setIsEditMode(true) // Start in edit mode for new logs
      }
    } else if (isNew) {
      // Initialize new log with default values
      setFormData({
        ...formData,
        id: `log-${Date.now()}`,
        logCode: `2025-${String(Date.now()).slice(-4)}`,
        createdAt: new Date().toISOString(),
        createdBy: userProfile?.name || '',
        status: 'DRAFT',
      })
    }
  }

  useEffect(() => {
    loadActivityLog()
  }, [logId, isNew, userProfile])

  // Listen for localStorage changes (when admin updates status)
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleStorageChange = (e: StorageEvent) => {
      // Check if activity_logs storage was updated
      if (e.key === 'activity_logs' && e.newValue) {
        // Reload the activity log if it matches current logId
        if (!isNew && logId) {
          try {
            const logs = JSON.parse(e.newValue) as ActivityLog[]
            const updatedLog = logs.find(log => log.id === logId || (logId.startsWith('EDU-') && log.educationId === logId))
            if (updatedLog) {
              setFormData(updatedLog)
              message.info('데이터가 업데이트되었습니다.')
            }
          } catch (error) {
            console.error('Error parsing updated activity log:', error)
          }
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [logId, isNew])

  // Validation
  const validateForm = (): { valid: boolean; error?: string } => {
    // Check instructor fullName
    if (!userProfile?.name) {
      return {
        valid: false,
        error: '강사 성명이 등록되어야 저장할 수 있습니다.',
      }
    }

    // Check signature
    if (!userProfile?.signatureImageUrl) {
      return {
        valid: false,
        error: '서명이 등록되어야 저장할 수 있습니다.',
      }
    }

    // Check required fields
    if (!formData.educationType || !formData.institutionType || !formData.institutionName) {
      return {
        valid: false,
        error: '필수 항목을 모두 입력해주세요.',
      }
    }

    // Check photo count
    if (formData.photos.length < 5) {
      return {
        valid: false,
        error: '최소 5장의 사진을 업로드해주세요.',
      }
    }

    return { valid: true }
  }

  const handleSave = async () => {
    const validation = validateForm()
    if (!validation.valid) {
      message.error(validation.error)
      return
    }

    try {
      setLoading(true)
      
      const logToSave: ActivityLog = {
        ...formData,
        id: formData.id || `log-${Date.now()}`,
        status: formData.status || 'DRAFT',
      }
      
      upsertActivityLog(logToSave)
      setFormData(logToSave)
      
      message.success('저장되었습니다.')
      setIsEditMode(false)
    } catch (error) {
      message.error('저장 중 오류가 발생했습니다.')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    const validation = validateForm()
    if (!validation.valid) {
      message.error(validation.error)
      return
    }

    const isResubmit = formData.status === 'REJECTED'
    const confirmTitle = isResubmit ? '재제출 확인' : '제출 확인'
    const confirmContent = isResubmit 
      ? '수정한 교육 활동 일지를 재제출하시겠습니까? 재제출 후에는 관리자 승인을 기다려야 합니다.'
      : '교육 활동 일지를 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.'

    Modal.confirm({
      title: confirmTitle,
      content: confirmContent,
      onOk: async () => {
        try {
          setLoading(true)
          
          const logToSubmit: ActivityLog = {
            ...formData,
            id: formData.id || `log-${Date.now()}`,
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            submittedBy: userProfile?.name || '',
            // 재제출 시 반려 관련 정보 초기화
            rejectReason: undefined,
            rejectedAt: undefined,
            rejectedBy: undefined,
          }
          
          upsertActivityLog(logToSubmit)
          setFormData(logToSubmit)
          
          message.success(isResubmit ? '재제출되었습니다.' : '제출되었습니다.')
          setIsEditMode(false)
        } catch (error) {
          message.error('제출 중 오류가 발생했습니다.')
          console.error(error)
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const handleDelete = () => {
    Modal.confirm({
      title: '삭제 확인',
      content: '이 활동 일지를 삭제하시겠습니까?',
      okText: '삭제',
      okType: 'danger',
      cancelText: '취소',
      onOk: async () => {
        try {
          setLoading(true)
          // TODO: Call API to delete
          // await deleteActivityLog(logId)
          
          message.success('삭제되었습니다.')
          router.push('/instructor/activity-logs')
        } catch (error) {
          message.error('삭제 중 오류가 발생했습니다.')
          console.error(error)
        } finally {
          setLoading(false)
        }
      },
    })
  }

  const handleBack = () => {
    router.back()
  }

  const handleCancel = () => {
    setIsEditMode(false)
    // TODO: Reload original data if needed
  }

  const handleSignatureApply = () => {
    if (!tempSignatureUrl) {
      message.warning('서명 이미지를 선택해주세요.')
      return
    }
    if (!tempSignatureName) {
      message.warning('서명자 이름을 입력해주세요.')
      return
    }
    setSignatureImageUrl(tempSignatureUrl)
    setSignatureSignedBy(tempSignatureName)
    setSignatureSignedAt(dayjs().toISOString())
    setSignatureModalVisible(false)
    setTempSignatureUrl('')
    setTempSignatureName('')
    message.success('서명이 적용되었습니다.')
  }

  const handleSignatureDelete = () => {
    setSignatureImageUrl('')
    setSignatureSignedBy('')
    setSignatureSignedAt('')
    message.success('서명이 삭제되었습니다.')
  }

  const totalGraduates = formData.graduateMale + formData.graduateFemale

  return (
    <ProtectedRoute requiredRole={['instructor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={handleBack}
                  className="flex items-center dark:text-gray-300"
                >
                  돌아가기
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      2025 소프트웨어(SW) 미래채움 – 교육 활동 일지
                    </h1>
                    <Tooltip
                      title={
                        <div className="text-sm">
                          <div className="font-semibold mb-1">활동일지 작성 가이드</div>
                          <div className="space-y-1">
                            <div>• 주강사와 보조강사는 각각 별도로 활동일지를 작성합니다</div>
                            <div>• 각 강사는 자신의 문서에만 서명합니다</div>
                            <div>• 수업 내용, 활동 사항, 특이사항 등을 기록합니다</div>
                          </div>
                        </div>
                      }
                      placement="right"
                    >
                      <Info className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="mt-1">
                    {(() => {
                      const statusMap = {
                        DRAFT: { color: 'default', text: '초안' },
                        SUBMITTED: { color: 'processing', text: '제출됨' },
                        APPROVED: { color: 'success', text: '승인됨' },
                        REJECTED: { color: 'error', text: '반려됨' },
                      }
                      const status = statusMap[formData.status || 'DRAFT']
                      return <Badge status={status.color as any} text={status.text} />
                    })()}
                  </div>
                </div>
              </div>
              <Space>
                {!isEditMode ? (
                  <>
                    {/* Admin can always edit */}
                    {isAdmin && (
                      <Button
                        type="primary"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => setIsEditMode(true)}
                      >
                        수정하기
                      </Button>
                    )}
                    {/* Instructor actions */}
                    {!isAdmin && (
                      <>
                        {formData.status === 'DRAFT' && (
                          <>
                            <Button
                              type="primary"
                              icon={<Edit className="w-4 h-4" />}
                              onClick={() => setIsEditMode(true)}
                            >
                              수정하기
                            </Button>
                            <Button
                              type="primary"
                              onClick={handleSubmit}
                              loading={loading}
                              style={{ background: '#10b981', borderColor: '#10b981' }}
                            >
                              제출하기
                            </Button>
                          </>
                        )}
                        {formData.status === 'SUBMITTED' && (
                          <span className="text-blue-600 font-medium">제출 완료 (승인 대기 중)</span>
                        )}
                        {formData.status === 'APPROVED' && (
                          <span className="text-green-600 font-medium">승인 완료</span>
                        )}
                        {formData.status === 'REJECTED' && (
                          <>
                            <Button
                              type="primary"
                              icon={<Edit className="w-4 h-4" />}
                              onClick={() => setIsEditMode(true)}
                            >
                              수정하기
                            </Button>
                            <Button
                              type="primary"
                              onClick={handleSubmit}
                              loading={loading}
                              style={{ background: '#10b981', borderColor: '#10b981' }}
                            >
                              재제출하기
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Button onClick={handleCancel} className="dark:text-gray-300">
                      취소
                    </Button>
                    {!isNew && (
                      <Button
                        danger
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={handleDelete}
                        loading={loading}
                      >
                        삭제
                      </Button>
                    )}
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      저장하기
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>
        </div>

        {/* Submitted banner for instructor */}
        {!isAdmin && formData.status === 'SUBMITTED' && (
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

        {/* Rejected banner for instructor */}
        {!isAdmin && formData.status === 'REJECTED' && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-900 dark:text-red-100">
                    반려됨
                  </span>
                </div>
                {formData.rejectReason && (
                  <div className="mt-2 pl-7">
                    <div className="text-xs font-semibold text-red-800 dark:text-red-200 mb-1">
                      반려 사유:
                    </div>
                    <div className="text-sm text-red-900 dark:text-red-100 bg-white dark:bg-gray-800 rounded p-3 border border-red-200 dark:border-red-700">
                      {formData.rejectReason}
                    </div>
                  </div>
                )}
                <div className="mt-2 pl-7 text-xs text-red-700 dark:text-red-300">
                  수정 후 재제출해주세요.
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* SECTION 1: 교육 정보 */}
          <DetailSectionCard title="교육 정보" className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">활동일지 코드</div>
                {isEditMode ? (
                  <Input
                    value={formData.logCode}
                    readOnly
                    className="bg-gray-50 dark:bg-gray-700"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">{formData.logCode || '-'}</div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육구분</div>
                {isEditMode ? (
                  <Select
                    value={formData.educationType}
                    onChange={(value) => setFormData({ ...formData, educationType: value })}
                    className="w-full"
                    placeholder="교육구분 선택"
                    options={[
                      { value: '소프트웨어(SW)', label: '소프트웨어(SW)' },
                      { value: '로봇', label: '로봇' },
                      { value: '인공지능', label: '인공지능' },
                    ]}
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">{formData.educationType || '-'}</div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관구분</div>
                {isEditMode ? (
                  <Select
                    value={formData.institutionType}
                    onChange={(value) => setFormData({ ...formData, institutionType: value })}
                    className="w-full"
                    placeholder="기관구분 선택"
                    options={[
                      { value: '초등학교', label: '초등학교' },
                      { value: '중학교', label: '중학교' },
                      { value: '고등학교', label: '고등학교' },
                    ]}
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">{formData.institutionType || '-'}</div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">지역(시/군)</div>
                {isEditMode ? (
                  <Input
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="지역 입력"
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">{formData.region || '-'}</div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                {isEditMode ? (
                  <Select
                    value={formData.institutionName}
                    onChange={(value) => setFormData({ ...formData, institutionName: value })}
                    className="w-full"
                    placeholder="기관명 선택"
                    showSearch
                    options={[
                      { value: '평택안일초등학교', label: '평택안일초등학교' },
                      { value: '평택초등학교', label: '평택초등학교' },
                    ]}
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">{formData.institutionName || '-'}</div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">학급명</div>
                {isEditMode ? (
                  <div className="flex gap-2">
                    <Input
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      placeholder="학년"
                      className="flex-1"
                    />
                    <Input
                      value={formData.class}
                      onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                      placeholder="반"
                      className="flex-1"
                    />
                  </div>
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {formData.grade && formData.class ? `${formData.grade}학년 ${formData.class}반` : '-'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육시작일</div>
                {isEditMode ? (
                  <DatePicker
                    value={formData.startDate ? dayjs(formData.startDate) : null}
                    onChange={(date) =>
                      setFormData({ ...formData, startDate: date ? date.format('YYYY-MM-DD') : '' })
                    }
                    className="w-full"
                    format="YYYY-MM-DD"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {formData.startDate ? dayjs(formData.startDate).format('YYYY-MM-DD') : '-'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육종료일</div>
                {isEditMode ? (
                  <DatePicker
                    value={formData.endDate ? dayjs(formData.endDate) : null}
                    onChange={(date) =>
                      setFormData({ ...formData, endDate: date ? date.format('YYYY-MM-DD') : '' })
                    }
                    className="w-full"
                    format="YYYY-MM-DD"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {formData.endDate ? dayjs(formData.endDate).format('YYYY-MM-DD') : '-'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육신청인원</div>
                {isEditMode ? (
                  <InputNumber
                    value={formData.totalApplicants}
                    onChange={(value) => setFormData({ ...formData, totalApplicants: value || 0 })}
                    className="w-full"
                    min={0}
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">{formData.totalApplicants}명</div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">수료인원</div>
                {isEditMode ? (
                  <div className="flex gap-2">
                    <InputNumber
                      value={formData.graduateMale}
                      onChange={(value) => setFormData({ ...formData, graduateMale: value || 0 })}
                      className="w-full"
                      min={0}
                      addonBefore="남"
                    />
                    <InputNumber
                      value={formData.graduateFemale}
                      onChange={(value) => setFormData({ ...formData, graduateFemale: value || 0 })}
                      className="w-full"
                      min={0}
                      addonBefore="여"
                    />
                  </div>
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    남 {formData.graduateMale}명 / 여 {formData.graduateFemale}명
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">총 수료인원</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{totalGraduates}명</div>
              </div>
            </div>
          </DetailSectionCard>

          {/* SECTION 2: 차시 목록 */}
          <DetailSectionCard title="차시 목록" className="mb-6">
            <SessionRowsTable
              sessions={formData.sessions}
              onChange={(sessions) => setFormData({ ...formData, sessions })}
              disabled={!isEditMode}
            />
          </DetailSectionCard>

          {/* SECTION 3: 사진자료 */}
          <DetailSectionCard title="사진자료" className="mb-6">
            <PhotoUploader
              photos={formData.photos}
              onChange={(photos) => setFormData({ ...formData, photos })}
              disabled={!isEditMode}
            />
          </DetailSectionCard>

          {/* SECTION 4: 작성 정보 */}
          <DetailSectionCard title="작성 정보">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">작성일</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {formData.createdAt ? dayjs(formData.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">작성자</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {formData.createdBy || userProfile?.name || '-'}
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">(인) 서명</div>
                <div className="max-w-xs">
                  {signatureImageUrl ? (
                    <div className="space-y-2">
                      <div className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 p-2 flex items-center justify-center min-h-[80px]">
                        <img
                          src={signatureImageUrl}
                          alt="서명"
                          className="max-w-[200px] max-h-[80px] object-contain"
                        />
                      </div>
                      {signatureSignedAt && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                          {dayjs(signatureSignedAt).format('YYYY-MM-DD HH:mm')}
                        </div>
                      )}
                      {signatureSignedBy && (
                        <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                          {signatureSignedBy}
                        </div>
                      )}
                      {isEditMode && (
                        <Button
                          size="small"
                          danger
                          icon={<X className="w-3 h-3" />}
                          onClick={handleSignatureDelete}
                          className="w-full mt-2"
                        >
                          삭제
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center min-h-[80px]">
                        <span className="text-sm text-gray-400 dark:text-gray-500">서명 없음</span>
                      </div>
                      {isEditMode && (
                        <Button
                          size="small"
                          type="default"
                          icon={<Edit className="w-3 h-3" />}
                          onClick={() => {
                            // Auto-load profile signature if available
                            if (userProfile?.signatureImageUrl) {
                              setTempSignatureUrl(userProfile.signatureImageUrl)
                              setTempSignatureName(userProfile.name || '')
                            } else {
                              setTempSignatureUrl('')
                              setTempSignatureName('')
                            }
                            setSignatureModalVisible(true)
                          }}
                          className="w-full"
                        >
                          서명 선택/적용
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* 서명 선택 모달 */}
          <Modal
            title="서명 선택"
            open={signatureModalVisible}
            onOk={handleSignatureApply}
            onCancel={() => {
              setSignatureModalVisible(false)
              setTempSignatureUrl('')
              setTempSignatureName('')
            }}
            okText="적용"
            cancelText="취소"
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
                  }}
                  className="w-full"
                  type={tempSignatureUrl === userProfile.signatureImageUrl ? 'primary' : 'default'}
                >
                  내 서명 사용 ({userProfile.name})
                </Button>
              )}

              {/* 서명 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  서명 이미지 업로드
                </label>
                <Upload
                  beforeUpload={(file) => {
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
                      setTempSignatureUrl(result)
                    }
                    reader.readAsDataURL(file)
                    return false
                  }}
                  accept=".png,.jpg,.jpeg"
                  maxCount={1}
                  onRemove={() => {
                    setTempSignatureUrl('')
                  }}
                >
                  <Button icon={<UploadOutlined />} className="w-full">
                    서명 이미지 업로드 (JPG/PNG, 최대 2MB)
                  </Button>
                </Upload>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  다른 사람의 서명을 업로드할 수 있습니다.
                </p>
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  )
}


