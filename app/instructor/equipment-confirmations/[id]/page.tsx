'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Input, InputNumber, Select, Space, message, Modal, Badge, DatePicker, Radio, TimePicker, Tooltip } from 'antd'
import { ArrowLeft, Save, CheckCircle2, XCircle, AlertTriangle, Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DetailSectionCard } from '@/components/admin/operations'
import { EducationBasicInfoForm, type EducationBasicInfoData } from '@/components/shared/common'
import { EquipmentItemsTableV2 } from '../components/EquipmentItemsTableV2'
import { SignatureSlotV2 } from '../components/SignatureSlotV2'
import {
  getEquipmentConfirmationById,
  getEquipmentConfirmationByEducationId,
  upsertEquipmentConfirmation,
  createMockEquipmentConfirmation,
} from '../storage-v2'
import type { EquipmentConfirmation } from '../types-v2'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function EquipmentConfirmationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile, userRole } = useAuth()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [doc, setDoc] = useState<EquipmentConfirmation | null>(null)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  const isAdmin = userRole === 'admin'

  // Load doc
  const loadDoc = async () => {
    if (!id) {
      setLoading(false)
      return
    }
    
    try {
      let loadedDoc = getEquipmentConfirmationById(id)
      
      // If not found and id looks like educationId, try by educationId
      if (!loadedDoc && id.startsWith('EDU-')) {
        loadedDoc = getEquipmentConfirmationByEducationId(id)
      }

      // Create new doc if not exists
      if (!loadedDoc) {
        loadedDoc = createMockEquipmentConfirmation()
        loadedDoc.id = id
        loadedDoc.educationId = id.startsWith('EDU-') ? id : ''
        upsertEquipmentConfirmation(loadedDoc)
      }
      
      setDoc(loadedDoc)
    } catch (error) {
      console.error('Error loading equipment confirmation:', error)
        message.error('문서를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoc()
  }, [id])

  // Listen for localStorage changes
  useEffect(() => {
    if (typeof window === 'undefined' || !id) return

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'equipment_confirmation_v2_docs' && e.newValue) {
        try {
          const docs = JSON.parse(e.newValue) as EquipmentConfirmation[]
          const updatedDoc = docs.find(doc => doc.id === id)
          if (updatedDoc) {
            setDoc(updatedDoc)
            if (updatedDoc.status === 'REJECTED' && updatedDoc.rejectReason) {
              message.warning(`반려되었습니다: ${updatedDoc.rejectReason}`)
            } else if (updatedDoc.status === 'APPROVED') {
              message.success('승인되었습니다.')
            }
          }
        } catch (error) {
          console.error('Error parsing updated doc:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [id])

  // Role-based editability
  const isEditable = isAdmin 
    ? true // Admin can always edit
    : (doc?.status === 'DRAFT' || doc?.status === 'REJECTED')
  const isReadonly = !isAdmin && (doc?.status === 'SUBMITTED' || doc?.status === 'APPROVED' || doc?.status === 'BORROWED')
  const canEditReturn = doc?.status === 'BORROWED' && !isAdmin

  const handleFieldChange = (field: keyof EquipmentConfirmation, value: any) => {
    if (!doc) return
    setDoc({ ...doc, [field]: value })
  }

  const handleBorrowPlanChange = (field: keyof EquipmentConfirmation['borrowPlan'], value: any) => {
    if (!doc) return
    setDoc({
      ...doc,
      borrowPlan: { ...doc.borrowPlan, [field]: value },
    })
  }

  const handleReturnPlanChange = (field: keyof EquipmentConfirmation['returnPlan'], value: any) => {
    if (!doc) return
    setDoc({
      ...doc,
      returnPlan: { ...doc.returnPlan, [field]: value },
    })
  }

  const handleReturnConfirmChange = (field: keyof EquipmentConfirmation['returnConfirm'], value: any) => {
    if (!doc) return
    setDoc({
      ...doc,
      returnConfirm: { ...doc.returnConfirm, [field]: value },
    })
  }

  const handleItemsChange = (items: EquipmentConfirmation['items']) => {
    if (!doc) return
    setDoc({ ...doc, items })
  }

  const handle담당차시_총차시Change = (field: '담당차시' | '총차시', value: number) => {
    if (!doc) return
    setDoc({
      ...doc,
      담당차시_총차시: { ...doc.담당차시_총차시, [field]: value },
    })
  }

  const handleLectureDateRangeChange = (field: 'start' | 'end', value: string) => {
    if (!doc) return
    setDoc({
      ...doc,
      lectureDateRange: { ...doc.lectureDateRange, [field]: value },
    })
  }

  const handleBorrowerSignatureApply = (signature: NonNullable<EquipmentConfirmation['borrowPlan']['borrowerSignature']>) => {
    if (!doc) return
    setDoc({
      ...doc,
      borrowPlan: { ...doc.borrowPlan, borrowerSignature: signature },
    })
  }

  const handleBorrowerSignatureDelete = () => {
    if (!doc) return
    const { borrowerSignature, ...rest } = doc.borrowPlan
    setDoc({
      ...doc,
      borrowPlan: rest,
    })
  }

  const handleReturnerSignatureApply = (signature: NonNullable<EquipmentConfirmation['returnConfirm']['returnerSignature']>) => {
    if (!doc) return
    setDoc({
      ...doc,
      returnConfirm: { ...doc.returnConfirm, returnerSignature: signature },
    })
  }

  const handleReturnerSignatureDelete = () => {
    if (!doc) return
    const { returnerSignature, ...rest } = doc.returnConfirm
    setDoc({
      ...doc,
      returnConfirm: rest,
    })
  }

  const handleAdminManagerSignatureApply = (signature: NonNullable<EquipmentConfirmation['returnConfirm']['adminManagerSignature']>) => {
    if (!doc) return
    setDoc({
      ...doc,
      returnConfirm: { ...doc.returnConfirm, adminManagerSignature: signature },
    })
  }

  const handleAdminManagerSignatureDelete = () => {
    if (!doc) return
    const { adminManagerSignature, ...rest } = doc.returnConfirm
    setDoc({
      ...doc,
      returnConfirm: rest,
    })
  }

  const validateSubmit = (): { valid: boolean; error?: string } => {
    if (!doc) return { valid: false, error: '문서를 불러올 수 없습니다.' }
    
    if (!doc.curriculumName) {
      return { valid: false, error: '교육과정명을 입력해주세요.' }
    }
    if (!doc.institutionName) {
      return { valid: false, error: '강의기관을 입력해주세요.' }
    }
    if (!doc.borrowPlan.borrowerName) {
      return { valid: false, error: '교구대여자 이름을 입력해주세요.' }
    }
    if (!doc.borrowPlan.borrowDate || !doc.borrowPlan.borrowTime) {
      return { valid: false, error: '대여 일정을 입력해주세요.' }
    }
    if (!doc.returnPlan.plannedReturnerName) {
      return { valid: false, error: '반납예정자를 입력해주세요.' }
    }
    if (!doc.returnPlan.plannedReturnDate || !doc.returnPlan.plannedReturnTime) {
      return { valid: false, error: '반납 예정 일정을 입력해주세요.' }
    }
    if (doc.items.length === 0 || !doc.items.some(item => item.leftItemName || item.rightItemName)) {
      return { valid: false, error: '최소 1개 이상의 교구를 입력해주세요.' }
    }
    
    return { valid: true }
  }

  const handleSave = () => {
    if (!doc) return
    upsertEquipmentConfirmation(doc)
    message.success('저장되었습니다.')
  }

  const handleSubmit = () => {
    const validation = validateSubmit()
    if (!validation.valid) {
      message.error(validation.error)
      return
    }
    if (!doc) return
    
    const updated: EquipmentConfirmation = {
      ...doc,
      status: 'SUBMITTED',
      updatedAt: new Date().toISOString(),
    }
    upsertEquipmentConfirmation(updated)
    setDoc(updated)
    message.success('제출되었습니다.')
  }

  const handleApprove = () => {
    if (!doc) return
    
    const updated: EquipmentConfirmation = {
      ...doc,
      status: 'APPROVED',
      updatedAt: new Date().toISOString(),
    }
    upsertEquipmentConfirmation(updated)
    setDoc(updated)
    message.success('승인되었습니다.')
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      message.warning('반려 사유를 입력해주세요.')
      return
    }
    if (!doc) return
    
    const updated: EquipmentConfirmation = {
      ...doc,
      status: 'REJECTED',
      rejectReason: rejectReason.trim(),
      updatedAt: new Date().toISOString(),
    }
    upsertEquipmentConfirmation(updated)
    setDoc(updated)
    setRejectModalVisible(false)
    setRejectReason('')
    message.success('반려되었습니다.')
  }

  const handleBack = () => {
    router.back()
  }

  const getStatusBadge = () => {
    if (!doc) return null
    const statusMap = {
      DRAFT: { color: 'default', text: '임시저장' },
      SUBMITTED: { color: 'processing', text: '제출됨' },
      APPROVED: { color: 'success', text: '승인됨' },
      BORROWED: { color: 'warning', text: '대여중' },
      RETURNED: { color: 'success', text: '반납완료' },
      REJECTED: { color: 'error', text: '반려됨' },
    }
    const status = statusMap[doc.status]
    return <Badge status={status.color as any} text={status.text} />
  }

  if (loading || !doc) {
    return (
      <ProtectedRoute requiredRole={isAdmin ? ['admin', 'instructor'] : 'instructor'}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
          <div>로딩 중...</div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={isAdmin ? ['admin', 'instructor'] : 'instructor'}>
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
                      교구 확인서
                    </h1>
                    <Tooltip
                      title={
                        <div className="text-sm">
                          <div className="font-semibold mb-1">교구확인서 작성 가이드</div>
                          <div className="space-y-1">
                            <div>• 별도의 독립적인 양식입니다</div>
                            <div>• 수업 시작 전에 완료해야 합니다</div>
                            <div>• 승인되지 않으면 수업을 진행할 수 없습니다</div>
                            <div>• 대여/반납 정보 및 교구 상태를 기록합니다</div>
                          </div>
                        </div>
                      }
                      placement="right"
                    >
                      <Info className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                    </Tooltip>
                  </div>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
              </div>
              <Space>
                {!isAdmin && (
                  <>
                    {isEditable && (
                      <Button
                        type="primary"
                        icon={<Save className="w-4 h-4" />}
                        onClick={handleSave}
                      >
                        저장
                      </Button>
                    )}
                    {doc.status === 'DRAFT' && (
                      <Button
                        type="primary"
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        onClick={handleSubmit}
                      >
                        제출
                      </Button>
                    )}
                  </>
                )}
                
                {isAdmin && (
                  <>
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={handleSave}
                    >
                      저장
                    </Button>
                    {doc.status === 'SUBMITTED' && (
                      <>
                        <Button
                          type="primary"
                          icon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={handleApprove}
                        >
                          승인
                        </Button>
                        <Button
                          danger
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={() => setRejectModalVisible(true)}
                        >
                          반려
                        </Button>
                      </>
                    )}
                  </>
                )}
              </Space>
            </div>
          </div>
        </div>

        {/* Submitted banner */}
        {!isAdmin && doc.status === 'SUBMITTED' && (
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
        {!isAdmin && doc.status === 'REJECTED' && doc.rejectReason && (
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
        
        {/* Reject reason banner for admin */}
        {isAdmin && doc.status === 'REJECTED' && doc.rejectReason && (
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
          {/* Section 1: 기본 정보 */}
          <DetailSectionCard title="기본 정보" className="mb-6">
            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">배정번호</label>
                {isEditable ? (
                  <Input
                      value={doc.assignmentNo || ''}
                      onChange={(e) => handleFieldChange('assignmentNo', e.target.value)}
                      className="w-full rounded-lg"
                      placeholder="배정번호 (선택사항)"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.assignmentNo || '-'}
                  </div>
                )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">교육과정명</label>
                {isEditable ? (
                  <Input
                      value={doc.curriculumName}
                      onChange={(e) => handleFieldChange('curriculumName', e.target.value)}
                      className="w-full rounded-lg"
                      placeholder="교육과정명"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.curriculumName}
                  </div>
                )}
              </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">강의기관</label>
                {isEditable ? (
                  <Input
                      value={doc.institutionName}
                      onChange={(e) => handleFieldChange('institutionName', e.target.value)}
                      className="w-full rounded-lg"
                      placeholder="강의기관"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.institutionName}
                  </div>
                )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">강의일자</label>
                {isEditable ? (
                    <div className="flex items-center gap-2">
                      <DatePicker
                        value={doc.lectureDateRange.start ? dayjs(doc.lectureDateRange.start) : null}
                        onChange={(date) => handleLectureDateRangeChange('start', date ? date.format('YYYY-MM-DD') : '')}
                        className="flex-1 rounded-lg"
                        placeholder="시작일"
                      />
                      <span className="text-gray-500">~</span>
                      <DatePicker
                        value={doc.lectureDateRange.end ? dayjs(doc.lectureDateRange.end) : null}
                        onChange={(date) => handleLectureDateRangeChange('end', date ? date.format('YYYY-MM-DD') : '')}
                        className="flex-1 rounded-lg"
                        placeholder="종료일"
                      />
                    </div>
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.lectureDateRange.start && doc.lectureDateRange.end
                        ? `${dayjs(doc.lectureDateRange.start).format('YYYY.MM.DD')} ~ ${dayjs(doc.lectureDateRange.end).format('YYYY.MM.DD')}`
                        : '-'}
                  </div>
                )}
              </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200 pb-4">
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">담당차시</label>
                {isEditable ? (
                  <InputNumber
                      value={doc.담당차시_총차시.담당차시}
                      onChange={(value) => handle담당차시_총차시Change('담당차시', value || 0)}
                      className="w-full rounded-lg"
                    min={0}
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.담당차시_총차시.담당차시}
                  </div>
                )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">총차시</label>
                {isEditable ? (
                    <InputNumber
                      value={doc.담당차시_총차시.총차시}
                      onChange={(value) => handle담당차시_총차시Change('총차시', value || 0)}
                      className="w-full rounded-lg"
                      min={0}
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.담당차시_총차시.총차시}
                  </div>
                )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">담당참여강사</label>
                {isEditable ? (
                  <Input
                      value={doc.담당참여강사}
                      onChange={(e) => handleFieldChange('담당참여강사', e.target.value)}
                      className="w-full rounded-lg"
                      placeholder="담당참여강사"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.담당참여강사}
                  </div>
                )}
              </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">예상 참여 인원</label>
                {isEditable ? (
                    <InputNumber
                      value={doc.expectedParticipants}
                      onChange={(value) => handleFieldChange('expectedParticipants', value || 0)}
                      className="w-full rounded-lg"
                      min={0}
                      addonAfter="명"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.expectedParticipants}명
                  </div>
                )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">교구대여자</label>
                {isEditable ? (
                  <Input
                      value={doc.borrowPlan.borrowerName}
                      onChange={(e) => handleBorrowPlanChange('borrowerName', e.target.value)}
                      className="w-full rounded-lg mb-2"
                      placeholder="교구대여자 이름"
                  />
                ) : (
                    <div className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {doc.borrowPlan.borrowerName || '-'}
                  </div>
                )}
                  <SignatureSlotV2
                    label="교구대여자 서명"
                    signature={doc.borrowPlan.borrowerSignature}
                    signerName={doc.borrowPlan.borrowerName}
                    onApply={handleBorrowerSignatureApply}
                    onDelete={handleBorrowerSignatureDelete}
                    disabled={!isEditable}
                    userProfile={userProfile ? { userId: userProfile.userId || '', name: userProfile.name || '', signatureImageUrl: userProfile.signatureImageUrl } : undefined}
                  />
              </div>
              </div>

              {/* Row 5: 대여 일정 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">대여 날짜</label>
                {isEditable ? (
                    <DatePicker
                      value={doc.borrowPlan.borrowDate ? dayjs(doc.borrowPlan.borrowDate) : null}
                      onChange={(date) => handleBorrowPlanChange('borrowDate', date ? date.format('YYYY-MM-DD') : '')}
                      className="w-full rounded-lg"
                      placeholder="대여 날짜"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.borrowPlan.borrowDate ? dayjs(doc.borrowPlan.borrowDate).format('YYYY-MM-DD') : '-'}
                  </div>
                )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">대여 시간</label>
                {isEditable ? (
                    <TimePicker
                      value={doc.borrowPlan.borrowTime ? dayjs(doc.borrowPlan.borrowTime, 'HH:mm') : null}
                      onChange={(time) => handleBorrowPlanChange('borrowTime', time ? time.format('HH:mm') : '')}
                      className="w-full rounded-lg"
                      format="HH:mm"
                      placeholder="대여 시간"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.borrowPlan.borrowTime || '-'}
                  </div>
                )}
              </div>
              </div>

              {/* Row 6: 반납 예정 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">반납예정자</label>
                  {isEditable ? (
                  <Input
                      value={doc.returnPlan.plannedReturnerName}
                      onChange={(e) => handleReturnPlanChange('plannedReturnerName', e.target.value)}
                      className="w-full rounded-lg"
                      placeholder="반납예정자"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.returnPlan.plannedReturnerName}
                  </div>
                )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">반납 예정 날짜</label>
                  {isEditable ? (
                    <DatePicker
                      value={doc.returnPlan.plannedReturnDate ? dayjs(doc.returnPlan.plannedReturnDate) : null}
                      onChange={(date) => handleReturnPlanChange('plannedReturnDate', date ? date.format('YYYY-MM-DD') : '')}
                      className="w-full rounded-lg"
                      placeholder="반납 예정 날짜"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.returnPlan.plannedReturnDate ? dayjs(doc.returnPlan.plannedReturnDate).format('YYYY-MM-DD') : '-'}
                  </div>
                )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">반납 예정 시간</label>
                  {isEditable ? (
                    <TimePicker
                      value={doc.returnPlan.plannedReturnTime ? dayjs(doc.returnPlan.plannedReturnTime, 'HH:mm') : null}
                      onChange={(time) => handleReturnPlanChange('plannedReturnTime', time ? time.format('HH:mm') : '')}
                      className="w-full rounded-lg"
                      format="HH:mm"
                      placeholder="반납 예정 시간"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.returnPlan.plannedReturnTime || '-'}
                  </div>
                )}
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* 교육 기본 정보 */}
          <DetailSectionCard title="교육 기본 정보" className="mb-6">
            <EducationBasicInfoForm
              data={{
                className: '',
                regionCity: '',
                startDate: doc.lectureDateRange.start,
                endDate: doc.lectureDateRange.end,
                totalSessions: doc.담당차시_총차시.총차시,
                expectedStudents: doc.expectedParticipants,
                educationType: '',
                institutionType: '',
                targetLevel: '',
                learningTech: '',
                textbook: '',
                담당자명: '',
                담당자연락처: '',
              }}
              isEditable={isEditable}
              isAdmin={isAdmin}
              onChange={(field, value) => {
                if (field === 'startDate') {
                  handleFieldChange('lectureDateRange', { ...doc.lectureDateRange, start: value })
                } else if (field === 'endDate') {
                  handleFieldChange('lectureDateRange', { ...doc.lectureDateRange, end: value })
                } else if (field === 'totalSessions') {
                  handleFieldChange('담당차시_총차시', { ...doc.담당차시_총차시, 총차시: value })
                } else if (field === 'expectedStudents') {
                  handleFieldChange('expectedParticipants', value)
                }
              }}
            />
          </DetailSectionCard>

          {/* Section 2: 대여 교구 목록 및 수량 */}
          <DetailSectionCard title="대여 교구 목록 및 수량" className="mb-6">
            <EquipmentItemsTableV2
              items={doc.items}
              onChange={handleItemsChange}
              disabled={!isEditable}
            />
          </DetailSectionCard>

          {/* 공유사항/특이사항 */}
          <DetailSectionCard title="공유사항/특이사항" className="mb-6">
            {isEditable ? (
              <TextArea
                value={doc.notes || ''}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                rows={4}
                className="rounded-lg"
                placeholder="공유사항이나 특이사항을 입력하세요"
              />
            ) : (
              <div className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                {doc.notes || '-'}
            </div>
            )}
          </DetailSectionCard>

          {/* Section 3: 교구 반납 확인 */}
          <DetailSectionCard title="교구 반납 확인" className="mb-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">교구 반납자</label>
                  {(isEditable || canEditReturn) ? (
                    <Input
                      value={doc.returnConfirm.returnerName}
                      onChange={(e) => handleReturnConfirmChange('returnerName', e.target.value)}
                      className="w-full rounded-lg mb-2"
                      placeholder="교구 반납자 이름"
                      disabled={!canEditReturn && !isEditable}
                    />
                  ) : (
                    <div className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {doc.returnConfirm.returnerName || '-'}
                </div>
                  )}
                  <SignatureSlotV2
                    label="교구 반납자 서명"
                    signature={doc.returnConfirm.returnerSignature}
                    signerName={doc.returnConfirm.returnerName}
                    onApply={handleReturnerSignatureApply}
                    onDelete={handleReturnerSignatureDelete}
                    disabled={!canEditReturn && !isEditable}
                    userProfile={userProfile ? { userId: userProfile.userId || '', name: userProfile.name || '', signatureImageUrl: userProfile.signatureImageUrl } : undefined}
                  />
              </div>
              <div>
                  {/* Empty space for layout balance */}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">교구반납 날짜</label>
                  {(isEditable || canEditReturn) ? (
                    <DatePicker
                      value={doc.returnConfirm.returnDate ? dayjs(doc.returnConfirm.returnDate) : null}
                      onChange={(date) => handleReturnConfirmChange('returnDate', date ? date.format('YYYY-MM-DD') : '')}
                      className="w-full rounded-lg"
                      placeholder="반납 날짜"
                      disabled={!canEditReturn && !isEditable}
                    />
                  ) : (
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.returnConfirm.returnDate ? dayjs(doc.returnConfirm.returnDate).format('YYYY-MM-DD') : '-'}
                </div>
                  )}
              </div>
              <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">교구반납 시간</label>
                  {(isEditable || canEditReturn) ? (
                    <TimePicker
                      value={doc.returnConfirm.returnTime ? dayjs(doc.returnConfirm.returnTime, 'HH:mm') : null}
                      onChange={(time) => handleReturnConfirmChange('returnTime', time ? time.format('HH:mm') : '')}
                      className="w-full rounded-lg"
                      format="HH:mm"
                      placeholder="반납 시간"
                      disabled={!canEditReturn && !isEditable}
                    />
                  ) : (
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.returnConfirm.returnTime || '-'}
                </div>
                  )}
              </div>
            </div>

              <div>
                <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">반납 교구 상태 확인</label>
                {(isEditable || canEditReturn) ? (
                  <TextArea
                    value={doc.returnConfirm.conditionNote || ''}
                    onChange={(e) => handleReturnConfirmChange('conditionNote', e.target.value)}
                    rows={3}
                    className="rounded-lg"
                    placeholder="반납 교구 상태를 입력하세요"
                    disabled={!canEditReturn && !isEditable}
                  />
                ) : (
                  <div className="text-base text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                    {doc.returnConfirm.conditionNote || '-'}
                </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">교구반납 수당 지급 대상 여부</label>
                  {(isEditable || canEditReturn) ? (
                    <Radio.Group
                      value={doc.returnConfirm.allowanceEligible}
                      onChange={(e) => handleReturnConfirmChange('allowanceEligible', e.target.value)}
                      disabled={!canEditReturn && !isEditable}
                    >
                      <Radio value="Y">Y</Radio>
                      <Radio value="N">N</Radio>
                    </Radio.Group>
                  ) : (
                    <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {doc.returnConfirm.allowanceEligible}
                      </div>
                  )}
                      </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">사업담당자</label>
                  {isEditable ? (
                    <Input
                      value={doc.returnConfirm.adminManagerName || ''}
                      onChange={(e) => handleReturnConfirmChange('adminManagerName', e.target.value)}
                      className="w-full rounded-lg mb-2"
                      placeholder="사업담당자 이름"
                    />
                  ) : (
                    <div className="text-base font-medium text-gray-900 dark:text-gray-100 mb-2">
                      {doc.returnConfirm.adminManagerName || '-'}
                        </div>
                      )}
                  <SignatureSlotV2
                    label="사업담당자 서명"
                    signature={doc.returnConfirm.adminManagerSignature}
                    signerName={doc.returnConfirm.adminManagerName || ''}
                    onApply={handleAdminManagerSignatureApply}
                    onDelete={handleAdminManagerSignatureDelete}
                    disabled={!isEditable}
                    userProfile={userProfile ? { userId: userProfile.userId || '', name: userProfile.name || '', signatureImageUrl: userProfile.signatureImageUrl } : undefined}
                  />
                    </div>
                  </div>
              </div>
            </DetailSectionCard>
      </div>

        {/* Reject Modal */}
      <Modal
          title="반려 사유"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false)
          setRejectReason('')
        }}
        okText="반려"
        cancelText="취소"
          okButtonProps={{ danger: true }}
      >
          <TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="반려 사유를 입력하세요..."
            maxLength={500}
            showCount
          />
      </Modal>
      </div>
    </ProtectedRoute>
  )
}
