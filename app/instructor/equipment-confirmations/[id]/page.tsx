'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Input, InputNumber, Select, Space, message, Modal, Badge } from 'antd'
import { ArrowLeft, Save, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DetailSectionCard } from '@/components/admin/operations'
import { EquipmentItemsTable } from '../components/EquipmentItemsTable'
import { AttachmentUploader } from '../components/AttachmentUploader'
import { SignatureSlot } from '../components/SignatureSlot'
import {
  getDocById,
  upsertDoc,
  createDocFromDefault,
  getSignatureUrl,
} from '../storage'
import {
  validateForApprove,
  validateForReturn,
  deriveInventory,
  getInventory,
  getAllDocs,
  appendAuditLog,
  getAuditLogs,
} from '../admin-helpers'
import type {
  EquipmentConfirmationDoc,
  EquipmentConfirmationStatus,
  InventoryItem,
  AuditLogEntry,
} from '../types'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function EquipmentConfirmationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile, userRole } = useAuth()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [doc, setDoc] = useState<EquipmentConfirmationDoc | null>(null)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [inventoryCheck, setInventoryCheck] = useState<InventoryItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])

  const isAdmin = userRole === 'admin'

  // Load doc
  const loadDoc = async () => {
    if (!id) {
      setLoading(false)
      return
    }
    
    try {
      let loadedDoc = getDocById(id)
      if (!loadedDoc) {
        // Create from default if not exists
        loadedDoc = createDocFromDefault({ 
          id,
          createdByName: userProfile?.name || '홍길동',
        })
        upsertDoc(loadedDoc)
      }
      setDoc(loadedDoc)
      
      // Load inventory check and audit logs
      if (isAdmin && loadedDoc) {
        const baseInventory = getInventory()
        const allDocs = getAllDocs()
        const derived = deriveInventory(loadedDoc.items, allDocs, baseInventory)
        setInventoryCheck(derived)
        
        const logs = getAuditLogs(loadedDoc.id)
        setAuditLogs(logs)
      }
    } catch (error) {
      console.error('Error loading equipment confirmation:', error)
      // Delay message to ensure component is mounted
      setTimeout(() => {
        message.error('문서를 불러오는 중 오류가 발생했습니다.')
      }, 100)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoc()
  }, [id, userProfile?.name, isAdmin])

  // Listen for localStorage changes (when admin updates status)
  useEffect(() => {
    if (typeof window === 'undefined' || !id) return

    const handleStorageChange = (e: StorageEvent) => {
      // Check if equipment_confirmation_docs storage was updated
      if (e.key === 'equipment_confirmation_docs' && e.newValue) {
        try {
          const docs = JSON.parse(e.newValue) as EquipmentConfirmationDoc[]
          const updatedDoc = docs.find(doc => doc.id === id)
          if (updatedDoc) {
            setDoc(updatedDoc)
            if (updatedDoc.rejectReason) {
              message.warning(`반려되었습니다: ${updatedDoc.rejectReason}`)
            } else if (updatedDoc.status === 'APPROVED') {
              message.success('승인되었습니다.')
            }
            // Reload inventory check and audit logs if admin
            if (isAdmin) {
              const baseInventory = getInventory()
              const allDocs = getAllDocs()
              const derived = deriveInventory(updatedDoc.items, allDocs, baseInventory)
              setInventoryCheck(derived)
              const logs = getAuditLogs(updatedDoc.id)
              setAuditLogs(logs)
            }
          }
        } catch (error) {
          console.error('Error parsing updated equipment doc:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [id, isAdmin])

  if (loading || !doc) {
    return (
      <ProtectedRoute requiredRole={isAdmin ? ['admin', 'instructor'] : 'instructor'}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
          <div>로딩 중...</div>
        </div>
      </ProtectedRoute>
    )
  }

  // Role-based editability
  // Admin can always edit regardless of status
  const isEditable = isAdmin 
    ? true // Admin can always edit
    : (doc.status === 'DRAFT' || doc.status === 'REJECTED')
  const isReadonly = !isAdmin && (doc.status === 'SUBMITTED' || doc.status === 'APPROVED' || doc.status === 'RETURNED')
  const canEditReturn = doc.status === 'BORROWED' && !isAdmin
  const canAdminEdit = isAdmin // Admin can always edit

  const handleFieldChange = (field: keyof EquipmentConfirmationDoc, value: any) => {
    setDoc({ ...doc, [field]: value })
  }

  const handleScheduleChange = (field: keyof typeof doc.schedule, value: string) => {
    setDoc({
      ...doc,
      schedule: { ...doc.schedule, [field]: value },
    })
  }

  const handleItemsChange = (items: typeof doc.items) => {
    setDoc({ ...doc, items })
  }

  const handleAttachmentsChange = (attachments: string[]) => {
    setDoc({ ...doc, attachments })
  }

  const handleSignatureApply = (
    type: 'manager' | 'borrower' | 'returner',
    signature: NonNullable<EquipmentConfirmationDoc['signatures'][typeof type]>
  ) => {
    setDoc({
      ...doc,
      signatures: { ...doc.signatures, [type]: signature },
    })
  }

  const handleSignatureDelete = (type: 'manager' | 'borrower' | 'returner') => {
    const newSignatures = { ...doc.signatures }
    delete newSignatures[type]
    setDoc({ ...doc, signatures: newSignatures })
  }

  const validateSubmit = (): { valid: boolean; error?: string } => {
    if (!doc.schedule.plannedBorrowText || !doc.schedule.plannedReturnText) {
      return { valid: false, error: '대여/반납 일정을 입력해주세요.' }
    }
    if (!doc.equipmentManagerName || !doc.borrowerName) {
      return { valid: false, error: '담당자 및 대여자 이름을 입력해주세요.' }
    }
    if (!doc.items.length || doc.items.some(item => item.quantity < 1)) {
      return { valid: false, error: '교구 목록을 입력해주세요.' }
    }
    if (!doc.signatures.manager || !doc.signatures.borrower) {
      return { valid: false, error: '담당자 및 대여자 서명이 필요합니다.' }
    }
    if (doc.attachments.length < 1) {
      return { valid: false, error: '최소 1장의 첨부 이미지가 필요합니다.' }
    }
    return { valid: true }
  }

  const validateReturn = (): { valid: boolean; error?: string } => {
    if (doc.returnConditionOk !== 'Y') {
      return { valid: false, error: '반납 상태를 확인해주세요.' }
    }
    if (!doc.actualReturnerName) {
      return { valid: false, error: '실제 반납자 이름을 입력해주세요.' }
    }
    if (!doc.signatures.returner) {
      return { valid: false, error: '반납자 서명이 필요합니다.' }
    }
    return { valid: true }
  }

  const handleSave = () => {
    upsertDoc(doc)
    message.success('저장되었습니다.')
  }

  const handleSubmit = () => {
    const validation = validateSubmit()
    if (!validation.valid) {
      message.error(validation.error)
      return
    }
    const updated = { ...doc, status: 'SUBMITTED' as EquipmentConfirmationStatus }
    upsertDoc(updated)
    setDoc(updated)
    message.success('제출되었습니다.')
  }

  const handleCancelSubmit = () => {
    Modal.confirm({
      title: '제출 취소',
      content: '제출을 취소하고 초안으로 되돌리시겠습니까?',
      onOk: () => {
        const updated = { ...doc, status: 'DRAFT' as EquipmentConfirmationStatus }
        upsertDoc(updated)
        setDoc(updated)
        message.success('초안으로 되돌렸습니다.')
      },
    })
  }

  const handleApprove = () => {
    const baseInventory = getInventory()
    const validation = validateForApprove(doc, baseInventory)
    if (!validation.valid) {
      message.error(validation.errors.join('\n'))
      return
    }
    
    const updated: EquipmentConfirmationDoc = {
      ...doc,
      status: 'APPROVED' as EquipmentConfirmationStatus,
      approvedAt: new Date().toISOString(),
      approvedBy: userProfile?.userId || '',
    }
    upsertDoc(updated)
    setDoc(updated)
    appendAuditLog('approved', doc.id, userProfile?.userId || '', userProfile?.name || '')
    setAuditLogs(getAuditLogs(doc.id))
    message.success('승인되었습니다.')
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      message.warning('반려 사유를 입력해주세요.')
      return
    }
    
    const updated: EquipmentConfirmationDoc = {
      ...doc,
      status: 'REJECTED' as EquipmentConfirmationStatus,
      rejectReason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: userProfile?.userId || '',
    }
    upsertDoc(updated)
    setDoc(updated)
    appendAuditLog('rejected', doc.id, userProfile?.userId || '', userProfile?.name || '', rejectReason)
    setAuditLogs(getAuditLogs(doc.id))
    setRejectModalVisible(false)
    setRejectReason('')
    message.success('반려되었습니다.')
  }

  const handleBorrowComplete = () => {
    if (!isAdmin) {
      // Instructor can only mark when BORROWED status
      const updated = { ...doc, status: 'BORROWED' as EquipmentConfirmationStatus }
      upsertDoc(updated)
      setDoc(updated)
      message.success('대여 완료 처리되었습니다.')
      return
    }
    
    // Admin marks as BORROWED
    const updated: EquipmentConfirmationDoc = {
      ...doc,
      status: 'BORROWED' as EquipmentConfirmationStatus,
      schedule: {
        ...doc.schedule,
        actualBorrowAt: new Date().toISOString(),
      },
    }
    upsertDoc(updated)
    setDoc(updated)
    appendAuditLog('borrowed', doc.id, userProfile?.userId || '', userProfile?.name || '')
    setAuditLogs(getAuditLogs(doc.id))
    
    // Update inventory check
    const baseInventory = getInventory()
    const allDocs = getAllDocs()
    const derived = deriveInventory(updated.items, allDocs, baseInventory)
    setInventoryCheck(derived)
    
    message.success('대여 완료 처리되었습니다.')
  }

  const handleReturnComplete = () => {
    const validation = validateReturn()
    if (!validation.valid) {
      message.error(validation.error)
      return
    }
    
    const updated: EquipmentConfirmationDoc = {
      ...doc,
      status: 'RETURNED' as EquipmentConfirmationStatus,
      schedule: {
        ...doc.schedule,
        actualReturnAt: new Date().toISOString(),
      },
    }
    upsertDoc(updated)
    setDoc(updated)
    appendAuditLog('returned', doc.id, userProfile?.userId || '', userProfile?.name || '')
    setAuditLogs(getAuditLogs(doc.id))
    
    // Update inventory check
    const baseInventory = getInventory()
    const allDocs = getAllDocs()
    const derived = deriveInventory(updated.items, allDocs, baseInventory)
    setInventoryCheck(derived)
    
    message.success('반납 완료 처리되었습니다.')
  }

  const handleBack = () => {
    router.back()
  }

  const getStatusBadge = () => {
    const statusMap = {
      DRAFT: { color: 'default', text: '초안' },
      SUBMITTED: { color: 'processing', text: '제출됨' },
      APPROVED: { color: 'success', text: '승인됨' },
      BORROWED: { color: 'warning', text: '대여중' },
      RETURNED: { color: 'success', text: '반납완료' },
      REJECTED: { color: 'error', text: '반려됨' },
    }
    const status = statusMap[doc.status]
    return <Badge status={status.color as any} text={status.text} />
  }

  // Calculate allowance
  const ratePerVisit = 0 // From localStorage config (default 0)
  const visitCount = doc.status === 'RETURNED' ? 2 : 1
  const totalAllowance = ratePerVisit * visitCount

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
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    교구 확인서 상세
                  </h1>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
              </div>
              <Space>
                {/* Instructor actions */}
                {!isAdmin && (
                  <>
                    {isEditable && (
                      <Button
                        type="primary"
                        icon={<Save className="w-4 h-4" />}
                        onClick={handleSave}
                        loading={loading}
                      >
                        저장
                      </Button>
                    )}
                    {doc.status === 'DRAFT' && (
                      <Button
                        type="primary"
                        icon={<CheckCircle2 className="w-4 h-4" />}
                        onClick={handleSubmit}
                        loading={loading}
                      >
                        제출
                      </Button>
                    )}
                    {doc.status === 'SUBMITTED' && (
                      <Button onClick={handleCancelSubmit} loading={loading}>
                        제출 취소
                      </Button>
                    )}
                    {doc.status === 'BORROWED' && (
                      <Button
                        type="primary"
                        onClick={handleReturnComplete}
                        loading={loading}
                      >
                        반납완료 처리
                      </Button>
                    )}
                  </>
                )}
                
                {/* Admin actions */}
                {isAdmin && (
                  <>
                    {/* Admin can always edit */}
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      저장
                    </Button>
                    {doc.status === 'SUBMITTED' && (
                      <>
                        <Button
                          type="primary"
                          icon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={handleApprove}
                          loading={loading}
                        >
                          승인
                        </Button>
                        <Button
                          danger
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={() => setRejectModalVisible(true)}
                          loading={loading}
                        >
                          반려
                        </Button>
                      </>
                    )}
                    {doc.status === 'APPROVED' && (
                      <Button
                        type="primary"
                        onClick={handleBorrowComplete}
                        loading={loading}
                      >
                        대여완료 처리
                      </Button>
                    )}
                    {doc.status === 'BORROWED' && (
                      <Button
                        type="primary"
                        onClick={handleReturnComplete}
                        loading={loading}
                      >
                        반납완료 처리
                      </Button>
                    )}
                  </>
                )}
              </Space>
            </div>
          </div>
        </div>
        
        {/* Reject reason banner for instructor */}
        {!isAdmin && doc.status === 'REJECTED' && doc.rejectReason && (
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
        
        {/* Submitted banner for instructor */}
        {!isAdmin && doc.status === 'SUBMITTED' && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  제출 완료 — 관리자 승인 대기
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 기본 정보 */}
          <DetailSectionCard title="기본 정보" className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                {isEditable ? (
                  <Input
                    value={doc.organizationName}
                    onChange={(e) => handleFieldChange('organizationName', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.organizationName}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">강의일자</div>
                {isEditable ? (
                  <Input
                    value={doc.lectureDateText}
                    onChange={(e) => handleFieldChange('lectureDateText', e.target.value)}
                    className="w-full"
                    placeholder="25. 01. 05."
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.lectureDateText}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교재명</div>
                {isEditable ? (
                  <Input
                    value={doc.materialName}
                    onChange={(e) => handleFieldChange('materialName', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.materialName}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">차시</div>
                {isEditable ? (
                  <Input
                    value={doc.sessionsText}
                    onChange={(e) => handleFieldChange('sessionsText', e.target.value)}
                    className="w-full"
                    placeholder="4차시 / 4차시"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.sessionsText}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">수강생 수</div>
                {isEditable ? (
                  <InputNumber
                    value={doc.studentCount}
                    onChange={(value) => handleFieldChange('studentCount', value || 0)}
                    className="w-full"
                    min={0}
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.studentCount}명
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">강사</div>
                {isEditable ? (
                  <Input
                    value={doc.instructorsText}
                    onChange={(e) => handleFieldChange('instructorsText', e.target.value)}
                    className="w-full"
                    placeholder="하미라 / 최인정"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.instructorsText}
                  </div>
                )}
              </div>
            </div>
          </DetailSectionCard>

          {/* 대여/반납 정보 */}
          <DetailSectionCard title="대여/반납 정보" className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">대여 예정</div>
                {isEditable ? (
                  <Input
                    value={doc.schedule.plannedBorrowText}
                    onChange={(e) => handleScheduleChange('plannedBorrowText', e.target.value)}
                    className="w-full"
                    placeholder="1일 13시"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.schedule.plannedBorrowText}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">반납 예정</div>
                {isEditable ? (
                  <Input
                    value={doc.schedule.plannedReturnText}
                    onChange={(e) => handleScheduleChange('plannedReturnText', e.target.value)}
                    className="w-full"
                    placeholder="2일 00분"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.schedule.plannedReturnText}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교구 담당자</div>
                {isEditable ? (
                  <Input
                    value={doc.equipmentManagerName}
                    onChange={(e) => handleFieldChange('equipmentManagerName', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.equipmentManagerName || '-'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">대여자</div>
                {isEditable ? (
                  <Input
                    value={doc.borrowerName}
                    onChange={(e) => handleFieldChange('borrowerName', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.borrowerName}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">반납 예정자</div>
                {isEditable ? (
                  <Input
                    value={doc.plannedReturnerName}
                    onChange={(e) => handleFieldChange('plannedReturnerName', e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.plannedReturnerName}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">실제 반납자</div>
                {(isEditable || canEditReturn || (isAdmin && doc.status === 'BORROWED')) ? (
                  <Input
                    value={doc.actualReturnerName}
                    onChange={(e) => handleFieldChange('actualReturnerName', e.target.value)}
                    className="w-full"
                    disabled={!canEditReturn && !isEditable && !(isAdmin && doc.status === 'BORROWED')}
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.actualReturnerName || '-'}
                  </div>
                )}
              </div>
            </div>
          </DetailSectionCard>

          {/* 교구 목록 */}
          <DetailSectionCard title="교구 목록" className="mb-6">
            <EquipmentItemsTable
              items={doc.items}
              onChange={handleItemsChange}
              disabled={!isEditable && !canAdminEdit}
            />
          </DetailSectionCard>

          {/* 반납 확인 */}
          <DetailSectionCard title="반납 확인" className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">반납 상태</div>
                {(isEditable || canEditReturn || (isAdmin && doc.status === 'BORROWED')) ? (
                  <Select
                    value={doc.returnConditionOk}
                    onChange={(value) => handleFieldChange('returnConditionOk', value)}
                    className="w-full"
                    disabled={!canEditReturn && !isEditable && !(isAdmin && doc.status === 'BORROWED')}
                    options={[
                      { value: 'Y', label: '양호' },
                      { value: 'N', label: '불량' },
                    ]}
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.returnConditionOk === 'Y' ? '양호' : '불량'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">수당 대상</div>
                {(isEditable || canEditReturn || (isAdmin && doc.status === 'BORROWED')) ? (
                  <Select
                    value={doc.allowanceTarget}
                    onChange={(value) => handleFieldChange('allowanceTarget', value)}
                    className="w-full"
                    disabled={!canEditReturn && !isEditable && !(isAdmin && doc.status === 'BORROWED')}
                    options={[
                      { value: 'Y', label: '예' },
                      { value: 'N', label: '아니오' },
                    ]}
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.allowanceTarget === 'Y' ? '예' : '아니오'}
                  </div>
                )}
              </div>
            </div>
          </DetailSectionCard>

          {/* 서명 */}
          <DetailSectionCard title="서명" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <SignatureSlot
                label="담당자"
                signature={doc.signatures.manager}
                signerName={doc.equipmentManagerName || ''}
                onApply={(sig) => handleSignatureApply('manager', sig)}
                onDelete={() => handleSignatureDelete('manager')}
                disabled={!isEditable && !isAdmin}
                userProfile={userProfile || undefined}
              />
              <SignatureSlot
                label="대여자"
                signature={doc.signatures.borrower}
                signerName={doc.borrowerName || ''}
                onApply={(sig) => handleSignatureApply('borrower', sig)}
                onDelete={() => handleSignatureDelete('borrower')}
                disabled={!isEditable && !canAdminEdit}
                userProfile={userProfile || undefined}
              />
              <SignatureSlot
                label="반납자"
                signature={doc.signatures.returner}
                signerName={doc.actualReturnerName || doc.plannedReturnerName || ''}
                onApply={(sig) => handleSignatureApply('returner', sig)}
                onDelete={() => handleSignatureDelete('returner')}
                disabled={!canEditReturn && !isEditable && !isAdmin}
                userProfile={userProfile || undefined}
              />
            </div>
          </DetailSectionCard>

          {/* 수당 */}
          <DetailSectionCard title="수당" className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">회당 수당</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {ratePerVisit.toLocaleString()}원
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">방문 횟수</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {visitCount}회
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">총 수당</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {totalAllowance.toLocaleString()}원
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* 첨부 이미지 */}
          <DetailSectionCard title="첨부 이미지">
            <AttachmentUploader
              attachments={doc.attachments || []}
              onChange={handleAttachmentsChange}
              disabled={!isEditable && !canAdminEdit}
              minRequired={1}
            />
          </DetailSectionCard>

          {/* 재고 확인 (Admin only) */}
          {isAdmin && inventoryCheck.length > 0 && (
            <DetailSectionCard title="재고 확인" className="mb-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    요청된 교구의 재고 현황
                  </span>
                  <Button
                    type="link"
                    onClick={() => router.push('/admin/teaching-aids/inventory')}
                  >
                    재고 페이지로 이동 →
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">품명</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">요청 수량</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">총 재고</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">파손</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">대여중</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">가용 재고</th>
                        <th className="text-center py-2 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">상태</th>
                      </tr>
                    </thead>
                    <tbody>
                      {doc.items.map((item) => {
                        const inv = inventoryCheck.find(i => i.name === item.name)
                        const available = inv?.availableQty || 0
                        const isShortage = available < item.quantity
                        return (
                          <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                            <td className="py-2 px-4 text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                            <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">{item.quantity}</td>
                            <td className="py-2 px-4 text-sm text-center text-gray-600 dark:text-gray-400">{inv?.totalQty || 0}</td>
                            <td className="py-2 px-4 text-sm text-center text-gray-600 dark:text-gray-400">{inv?.brokenQty || 0}</td>
                            <td className="py-2 px-4 text-sm text-center text-gray-600 dark:text-gray-400">{inv?.rentedQty || 0}</td>
                            <td className={`py-2 px-4 text-sm text-center font-medium ${isShortage ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-gray-100'}`}>
                              {available}
                            </td>
                            <td className="py-2 px-4 text-center">
                              {isShortage ? (
                                <Badge status="error" text="부족" />
                              ) : (
                                <Badge status="success" text="가능" />
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </DetailSectionCard>
          )}

          {/* 처리 이력 (Admin only) */}
          {isAdmin && auditLogs.length > 0 && (
            <DetailSectionCard title="처리 이력">
              <div className="space-y-3">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {log.action === 'approved' && '승인'}
                          {log.action === 'rejected' && '반려'}
                          {log.action === 'borrowed' && '대여완료'}
                          {log.action === 'returned' && '반납완료'}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm')}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        처리자: {log.actorName}
                      </div>
                      {log.reason && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          사유: {log.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </DetailSectionCard>
          )}
        </div>
      </div>

      {/* 반려 모달 */}
      <Modal
        title="반려 사유 입력"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => {
          setRejectModalVisible(false)
          setRejectReason('')
        }}
        okText="반려"
        okButtonProps={{ danger: true }}
        cancelText="취소"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            반려 사유를 입력해주세요. 강사에게 표시됩니다.
          </p>
          <TextArea
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="반려 사유를 입력하세요..."
          />
        </div>
      </Modal>
    </ProtectedRoute>
  )
}

