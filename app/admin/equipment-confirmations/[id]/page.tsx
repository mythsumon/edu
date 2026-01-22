'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Space, Modal, Input, InputNumber, DatePicker, TimePicker, message, Badge } from 'antd'
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react'
import { DetailPageHeaderSticky, DetailSectionCard } from '@/components/admin/operations'
import { useAuth } from '@/contexts/AuthContext'
import {
  getDocById,
  getDocByEducationId,
  upsertDoc,
} from '@/app/instructor/equipment-confirmations/storage'
import {
  getEquipmentConfirmationById,
  getEquipmentConfirmationByEducationId,
  upsertEquipmentConfirmation,
} from '@/app/instructor/equipment-confirmations/storage-v2'
import type { EquipmentConfirmation } from '@/app/instructor/equipment-confirmations/types-v2'
import {
  validateForApprove,
  deriveInventory,
  getInventory,
  getAllDocs,
  appendAuditLog,
  getAuditLogs,
} from '@/app/instructor/equipment-confirmations/admin-helpers'
import type {
  EquipmentConfirmationDoc,
  EquipmentConfirmationStatus,
  InventoryItem,
  AuditLogEntry,
} from '@/app/instructor/equipment-confirmations/types'
import { EquipmentItemsTable } from '@/app/instructor/equipment-confirmations/components/EquipmentItemsTable'
import { EquipmentItemsTableV2 } from '@/app/instructor/equipment-confirmations/components/EquipmentItemsTableV2'
import { AttachmentUploader } from '@/app/instructor/equipment-confirmations/components/AttachmentUploader'
import { SignatureSlot } from '@/app/instructor/equipment-confirmations/components/SignatureSlot'
import { SignatureSlotV2 } from '@/app/instructor/equipment-confirmations/components/SignatureSlotV2'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function AdminEquipmentConfirmationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [doc, setDoc] = useState<EquipmentConfirmation | null>(null)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [inventoryCheck, setInventoryCheck] = useState<InventoryItem[]>([])
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    
    const loadDoc = async () => {
      try {
        // Try v2 type first (EquipmentConfirmation)
        let loadedDoc = getEquipmentConfirmationById(id)
        if (!loadedDoc) {
          loadedDoc = getEquipmentConfirmationByEducationId(id)
        }
        
        // Fallback to old type if v2 not found
        if (!loadedDoc) {
          const oldDoc = getDocById(id) || getDocByEducationId(id)
          if (oldDoc) {
            // Convert old type to new type (basic mapping)
            loadedDoc = {
              id: oldDoc.id,
              educationId: oldDoc.educationId || '',
              status: oldDoc.status,
              assignmentNo: '',
              curriculumName: oldDoc.materialName,
              institutionName: oldDoc.organizationName,
              lectureDateRange: {
                start: oldDoc.lectureDateText.split(' ~ ')[0] || '',
                end: oldDoc.lectureDateText.split(' ~ ')[1] || oldDoc.lectureDateText,
              },
              담당차시_총차시: {
                담당차시: parseInt(oldDoc.sessionsText) || 0,
                총차시: parseInt(oldDoc.sessionsText) || 0,
              },
              담당참여강사: oldDoc.instructorsText,
              expectedParticipants: oldDoc.studentCount,
              borrowPlan: {
                borrowerName: oldDoc.borrowerName,
                borrowerSignature: oldDoc.signatures.borrower,
                borrowDate: oldDoc.schedule.plannedBorrowDate || '',
                borrowTime: oldDoc.schedule.plannedBorrowTime || '',
              },
              returnPlan: {
                plannedReturnerName: oldDoc.plannedReturnerName,
                plannedReturnDate: oldDoc.schedule.plannedReturnDate || '',
                plannedReturnTime: oldDoc.schedule.plannedReturnTime || '',
              },
              items: oldDoc.items.map(item => ({
                id: item.id,
                leftItemName: item.name,
                leftQty: item.quantity,
              })),
              notes: '',
              returnConfirm: {
                returnerName: oldDoc.actualReturnerName,
                returnerSignature: oldDoc.signatures.returner,
                returnDate: oldDoc.returnDate ? dayjs(oldDoc.returnDate).format('YYYY-MM-DD') : '',
                returnTime: oldDoc.returnDate ? dayjs(oldDoc.returnDate).format('HH:mm') : '',
                conditionNote: '',
                allowanceEligible: oldDoc.allowanceTarget === 'Y' ? 'Y' : 'N',
                adminManagerName: oldDoc.equipmentManagerName,
                adminManagerSignature: oldDoc.signatures.manager,
              },
              updatedAt: oldDoc.updatedAt,
              createdAt: oldDoc.createdAt,
              rejectReason: oldDoc.rejectReason,
            }
          }
        }
        
        if (!loadedDoc) {
          message.warning(`교구 확인서를 찾을 수 없습니다. (ID: ${id})`)
          setTimeout(() => {
            router.push('/admin/submissions-by-education')
          }, 2000)
          return
        }
        
        setDoc(loadedDoc)
        
        // Load inventory check and audit logs (using old type items for now)
        const baseInventory = getInventory()
        const allDocs = getAllDocs()
        const itemsForInventory = loadedDoc.items.map(item => ({
          id: item.id,
          name: item.leftItemName || item.rightItemName || '',
          quantity: item.leftQty || item.rightQty || 0,
        }))
        const derived = deriveInventory(itemsForInventory, allDocs, baseInventory)
        setInventoryCheck(derived)
        
        const logs = getAuditLogs(loadedDoc.id)
        setAuditLogs(logs)
      } catch (error) {
        console.error('Error loading equipment confirmation:', error)
        message.error('문서를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }
    
    loadDoc()
  }, [id, router])

  // Handler functions for form fields
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
    if (doc) {
      upsertEquipmentConfirmation(doc)
    }
  }

  const handleBorrowerSignatureDelete = () => {
    if (!doc) return
    const { borrowerSignature, ...rest } = doc.borrowPlan
    setDoc({
      ...doc,
      borrowPlan: rest,
    })
    if (doc) {
      upsertEquipmentConfirmation(doc)
    }
  }

  const handleReturnerSignatureApply = (signature: NonNullable<EquipmentConfirmation['returnConfirm']['returnerSignature']>) => {
    if (!doc) return
    setDoc({
      ...doc,
      returnConfirm: { ...doc.returnConfirm, returnerSignature: signature },
    })
    if (doc) {
      upsertEquipmentConfirmation(doc)
    }
  }

  const handleReturnerSignatureDelete = () => {
    if (!doc) return
    const { returnerSignature, ...rest } = doc.returnConfirm
    setDoc({
      ...doc,
      returnConfirm: rest,
    })
    if (doc) {
      upsertEquipmentConfirmation(doc)
    }
  }

  const handleAdminManagerSignatureApply = (signature: NonNullable<EquipmentConfirmation['returnConfirm']['adminManagerSignature']>) => {
    if (!doc) return
    setDoc({
      ...doc,
      returnConfirm: { ...doc.returnConfirm, adminManagerSignature: signature },
    })
    if (doc) {
      upsertEquipmentConfirmation(doc)
    }
  }

  const handleAdminManagerSignatureDelete = () => {
    if (!doc) return
    const { adminManagerSignature, ...rest } = doc.returnConfirm
    setDoc({
      ...doc,
      returnConfirm: rest,
    })
    if (doc) {
      upsertEquipmentConfirmation(doc)
    }
  }

  const handleApprove = () => {
    if (!doc) return

    // Save before approve
    upsertEquipmentConfirmation(doc)

    const baseInventory = getInventory()
    // Convert items for validation
    const itemsForValidation = doc.items.map(item => ({
      id: item.id,
      name: item.leftItemName || item.rightItemName || '',
      quantity: item.leftQty || item.rightQty || 0,
    }))
    const validation = validateForApprove({ ...doc, items: itemsForValidation } as any, baseInventory)
    if (!validation.valid) {
      message.error(validation.errors.join('\n'))
      return
    }

    Modal.confirm({
      title: '승인 확인',
      content: '이 교구 확인서를 승인하시겠습니까?',
      onOk: () => {
        const updated: EquipmentConfirmation = {
          ...doc,
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          approvedBy: userProfile?.name || '관리자',
        }
        upsertEquipmentConfirmation(updated)
        setDoc(updated)
        appendAuditLog('approved', doc.id, userProfile?.userId || '', userProfile?.name || '')
        setAuditLogs(getAuditLogs(doc.id))
        
        // Update inventory check
        const baseInventory = getInventory()
        const allDocs = getAllDocs()
        const derived = deriveInventory(updated.items, allDocs, baseInventory)
        setInventoryCheck(derived)
        
        // Trigger storage event for other tabs/windows
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'equipment_confirmations',
            newValue: localStorage.getItem('equipment_confirmations'),
            oldValue: localStorage.getItem('equipment_confirmations'),
          }))
        }
        
        message.success('승인되었습니다.')
      },
    })
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
      rejectReason,
      updatedAt: new Date().toISOString(),
    }
    upsertEquipmentConfirmation(updated)
    setDoc(updated)
    appendAuditLog('rejected', doc.id, userProfile?.userId || '', userProfile?.name || '', rejectReason)
    setAuditLogs(getAuditLogs(doc.id))
    setRejectModalVisible(false)
    setRejectReason('')
    
    // Trigger storage event for other tabs/windows
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'equipment_confirmation_v2_docs',
        newValue: localStorage.getItem('equipment_confirmation_v2_docs'),
        oldValue: localStorage.getItem('equipment_confirmation_v2_docs'),
      }))
    }
    
    message.success('반려되었습니다.')
  }

  const handleBorrowComplete = () => {
    if (!doc) return

    const updated: EquipmentConfirmation = {
      ...doc,
      status: 'BORROWED',
      updatedAt: new Date().toISOString(),
    }
    upsertEquipmentConfirmation(updated)
    setDoc(updated)
    appendAuditLog('borrowed', doc.id, userProfile?.userId || '', userProfile?.name || '')
    setAuditLogs(getAuditLogs(doc.id))
    
    // Update inventory check
    const baseInventory = getInventory()
    const allDocs = getAllDocs()
    const itemsForInventory = updated.items.map(item => ({
      id: item.id,
      name: item.leftItemName || item.rightItemName || '',
      quantity: item.leftQty || item.rightQty || 0,
    }))
    const derived = deriveInventory(itemsForInventory, allDocs, baseInventory)
    setInventoryCheck(derived)
    
    message.success('대여 완료 처리되었습니다.')
  }

  const handleReturnComplete = () => {
    if (!doc) return

    if (doc.returnConfirm.allowanceEligible !== 'Y' && doc.returnConfirm.conditionNote) {
      // Check condition note for return status
      const conditionOk = doc.returnConfirm.conditionNote?.toLowerCase().includes('양호') || doc.returnConfirm.conditionNote?.toLowerCase().includes('정상')
      if (!conditionOk) {
        message.warning('반납 상태를 확인해주세요.')
        return
      }
    }
    if (!doc.returnConfirm.returnerName) {
      message.warning('실제 반납자 이름을 입력해주세요.')
      return
    }
    if (!doc.returnConfirm.returnerSignature) {
      message.warning('반납자 서명이 필요합니다.')
      return
    }

    const updated: EquipmentConfirmation = {
      ...doc,
      status: 'RETURNED',
      updatedAt: new Date().toISOString(),
    }
    upsertEquipmentConfirmation(updated)
    setDoc(updated)
    appendAuditLog('returned', doc.id, userProfile?.userId || '', userProfile?.name || '')
    setAuditLogs(getAuditLogs(doc.id))
    
    // Update inventory check
    const baseInventory = getInventory()
    const allDocs = getAllDocs()
    const itemsForInventory = updated.items.map(item => ({
      id: item.id,
      name: item.leftItemName || item.rightItemName || '',
      quantity: item.leftQty || item.rightQty || 0,
    }))
    const derived = deriveInventory(itemsForInventory, allDocs, baseInventory)
    setInventoryCheck(derived)
    
    message.success('반납 완료 처리되었습니다.')
  }

  const getStatusBadge = () => {
    if (!doc) return null
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

  if (loading || !doc) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
          <div>로딩 중...</div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <DetailPageHeaderSticky
          title="교구 확인서 상세"
          onBack={() => router.back()}
        />

        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="mb-6 flex items-center gap-4">
            {getStatusBadge()}
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={() => {
                // TODO: 실제 파일 다운로드 구현
                const filename = `교구확인서_${doc.organizationName}_${doc.lectureDateText || ''}.pdf`
                console.log('Download equipment confirmation:', filename)
                message.info(`교구확인서 다운로드: ${filename}`)
              }}
              className="h-10 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
            >
              다운로드
            </Button>
            {doc.status === 'SUBMITTED' && (
              <div className="flex gap-4">
                <Button
                  icon={<CheckCircle2 className="w-4 h-4" />}
                  onClick={handleApprove}
                  loading={loading}
                  className="h-10 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  승인
                </Button>
                <Button
                  icon={<XCircle className="w-4 h-4" />}
                  onClick={() => setRejectModalVisible(true)}
                  loading={loading}
                  className="h-10 px-6 rounded-xl border border-red-300 font-medium transition-all text-red-700 hover:bg-red-600 hover:text-white hover:border-red-600"
                >
                  반려
                </Button>
              </div>
            )}
            {doc.status === 'APPROVED' && (
              <Button
                type="primary"
                onClick={handleBorrowComplete}
                loading={loading}
                className="h-10 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                대여완료 처리
              </Button>
            )}
            {doc.status === 'BORROWED' && (
              <Button
                type="primary"
                onClick={handleReturnComplete}
                loading={loading}
                className="h-10 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                반납완료 처리
              </Button>
            )}
          </div>
        </div>

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

          {/* 기본 정보 */}
          <DetailSectionCard title="기본 정보" className="mb-6">
            <div className="space-y-4">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">배정번호</label>
                  <Input
                    value={doc.assignmentNo || ''}
                    onChange={(e) => {
                      handleFieldChange('assignmentNo', e.target.value)
                      if (doc) {
                        upsertEquipmentConfirmation({ ...doc, assignmentNo: e.target.value })
                      }
                    }}
                    className="w-full rounded-lg"
                    placeholder="배정번호 (선택사항)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">교육과정명</label>
                  <Input
                    value={doc.curriculumName}
                    onChange={(e) => {
                      handleFieldChange('curriculumName', e.target.value)
                      if (doc) {
                        upsertEquipmentConfirmation({ ...doc, curriculumName: e.target.value })
                      }
                    }}
                    className="w-full rounded-lg"
                    placeholder="교육과정명"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-gray-200 pb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">강의기관</label>
                  <Input
                    value={doc.institutionName}
                    onChange={(e) => {
                      handleFieldChange('institutionName', e.target.value)
                      if (doc) {
                        upsertEquipmentConfirmation({ ...doc, institutionName: e.target.value })
                      }
                    }}
                    className="w-full rounded-lg"
                    placeholder="강의기관"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">강의일자</label>
                  <div className="flex items-center gap-2">
                    <DatePicker
                      value={doc.lectureDateRange.start ? dayjs(doc.lectureDateRange.start) : null}
                      onChange={(date) => {
                        handleLectureDateRangeChange('start', date ? date.format('YYYY-MM-DD') : '')
                        if (doc) {
                          upsertEquipmentConfirmation({
                            ...doc,
                            lectureDateRange: {
                              ...doc.lectureDateRange,
                              start: date ? date.format('YYYY-MM-DD') : '',
                            },
                          })
                        }
                      }}
                      className="flex-1 rounded-lg"
                      placeholder="시작일"
                    />
                    <span className="text-gray-500">~</span>
                    <DatePicker
                      value={doc.lectureDateRange.end ? dayjs(doc.lectureDateRange.end) : null}
                      onChange={(date) => {
                        handleLectureDateRangeChange('end', date ? date.format('YYYY-MM-DD') : '')
                        if (doc) {
                          upsertEquipmentConfirmation({
                            ...doc,
                            lectureDateRange: {
                              ...doc.lectureDateRange,
                              end: date ? date.format('YYYY-MM-DD') : '',
                            },
                          })
                        }
                      }}
                      className="flex-1 rounded-lg"
                      placeholder="종료일"
                    />
                  </div>
                </div>
              </div>

              {/* Row 3 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-gray-200 pb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">담당차시</label>
                  <InputNumber
                    value={doc.담당차시_총차시.담당차시}
                    onChange={(value) => {
                      handle담당차시_총차시Change('담당차시', value || 0)
                      if (doc) {
                        upsertEquipmentConfirmation({
                          ...doc,
                          담당차시_총차시: { ...doc.담당차시_총차시, 담당차시: value || 0 },
                        })
                      }
                    }}
                    className="w-full rounded-lg"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">총차시</label>
                  <InputNumber
                    value={doc.담당차시_총차시.총차시}
                    onChange={(value) => {
                      handle담당차시_총차시Change('총차시', value || 0)
                      if (doc) {
                        upsertEquipmentConfirmation({
                          ...doc,
                          담당차시_총차시: { ...doc.담당차시_총차시, 총차시: value || 0 },
                        })
                      }
                    }}
                    className="w-full rounded-lg"
                    min={0}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">담당참여강사</label>
                  <Input
                    value={doc.담당참여강사}
                    onChange={(e) => {
                      handleFieldChange('담당참여강사', e.target.value)
                      if (doc) {
                        upsertEquipmentConfirmation({ ...doc, 담당참여강사: e.target.value })
                      }
                    }}
                    className="w-full rounded-lg"
                    placeholder="담당참여강사"
                  />
                </div>
              </div>

              {/* Row 4 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">예상 참여 인원</label>
                  <InputNumber
                    value={doc.expectedParticipants}
                    onChange={(value) => {
                      handleFieldChange('expectedParticipants', value || 0)
                      if (doc) {
                        upsertEquipmentConfirmation({ ...doc, expectedParticipants: value || 0 })
                      }
                    }}
                    className="w-full rounded-lg"
                    min={0}
                    addonAfter="명"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">교구대여자</label>
                  <Input
                    value={doc.borrowPlan.borrowerName}
                    onChange={(e) => {
                      handleBorrowPlanChange('borrowerName', e.target.value)
                      if (doc) {
                        upsertEquipmentConfirmation({
                          ...doc,
                          borrowPlan: { ...doc.borrowPlan, borrowerName: e.target.value },
                        })
                      }
                    }}
                    className="w-full rounded-lg mb-2"
                    placeholder="교구대여자 이름"
                  />
                  <SignatureSlotV2
                    label="교구대여자 서명"
                    signature={doc.borrowPlan.borrowerSignature}
                    signerName={doc.borrowPlan.borrowerName}
                    onApply={handleBorrowerSignatureApply}
                    onDelete={handleBorrowerSignatureDelete}
                    disabled={false}
                    userProfile={userProfile ? { userId: userProfile.userId || '', name: userProfile.name || '', signatureImageUrl: userProfile.signatureImageUrl } : undefined}
                  />
                </div>
              </div>

              {/* Row 5: 대여 일정 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">대여 날짜</label>
                  <DatePicker
                    value={doc.borrowPlan.borrowDate ? dayjs(doc.borrowPlan.borrowDate) : null}
                    onChange={(date) => {
                      handleBorrowPlanChange('borrowDate', date ? date.format('YYYY-MM-DD') : '')
                      if (doc) {
                        upsertEquipmentConfirmation({
                          ...doc,
                          borrowPlan: { ...doc.borrowPlan, borrowDate: date ? date.format('YYYY-MM-DD') : '' },
                        })
                      }
                    }}
                    className="w-full rounded-lg"
                    placeholder="대여 날짜"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">대여 시간</label>
                  <TimePicker
                    value={doc.borrowPlan.borrowTime ? dayjs(doc.borrowPlan.borrowTime, 'HH:mm') : null}
                    onChange={(time) => {
                      handleBorrowPlanChange('borrowTime', time ? time.format('HH:mm') : '')
                      if (doc) {
                        upsertEquipmentConfirmation({
                          ...doc,
                          borrowPlan: { ...doc.borrowPlan, borrowTime: time ? time.format('HH:mm') : '' },
                        })
                      }
                    }}
                    className="w-full rounded-lg"
                    format="HH:mm"
                    placeholder="대여 시간"
                  />
                </div>
              </div>

              {/* Row 6: 반납 예정 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-gray-200 pt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">반납예정자</label>
                  <Input
                    value={doc.returnPlan.plannedReturnerName}
                    onChange={(e) => {
                      handleReturnPlanChange('plannedReturnerName', e.target.value)
                      if (doc) {
                        upsertEquipmentConfirmation({
                          ...doc,
                          returnPlan: { ...doc.returnPlan, plannedReturnerName: e.target.value },
                        })
                      }
                    }}
                    className="w-full rounded-lg"
                    placeholder="반납예정자"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">반납 예정 날짜</label>
                  <DatePicker
                    value={doc.returnPlan.plannedReturnDate ? dayjs(doc.returnPlan.plannedReturnDate) : null}
                    onChange={(date) => {
                      handleReturnPlanChange('plannedReturnDate', date ? date.format('YYYY-MM-DD') : '')
                      if (doc) {
                        upsertEquipmentConfirmation({
                          ...doc,
                          returnPlan: { ...doc.returnPlan, plannedReturnDate: date ? date.format('YYYY-MM-DD') : '' },
                        })
                      }
                    }}
                    className="w-full rounded-lg"
                    placeholder="반납 예정 날짜"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">반납 예정 시간</label>
                  <TimePicker
                    value={doc.returnPlan.plannedReturnTime ? dayjs(doc.returnPlan.plannedReturnTime, 'HH:mm') : null}
                    onChange={(time) => {
                      handleReturnPlanChange('plannedReturnTime', time ? time.format('HH:mm') : '')
                      if (doc) {
                        upsertEquipmentConfirmation({
                          ...doc,
                          returnPlan: { ...doc.returnPlan, plannedReturnTime: time ? time.format('HH:mm') : '' },
                        })
                      }
                    }}
                    className="w-full rounded-lg"
                    format="HH:mm"
                    placeholder="반납 예정 시간"
                  />
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* 대여/반납 정보 */}
          <DetailSectionCard title="대여/반납 정보" className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">대여 예정</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.schedule.plannedBorrowText}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">반납 예정</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.schedule.plannedReturnText}
                </div>
              </div>
              {doc.schedule.actualBorrowAt && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">실제 대여</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {dayjs(doc.schedule.actualBorrowAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>
              )}
              {doc.schedule.actualReturnAt && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">실제 반납</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {dayjs(doc.schedule.actualReturnAt).format('YYYY-MM-DD HH:mm')}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">대여자</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.borrowerName}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">예정 반납자</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.plannedReturnerName}
                </div>
              </div>
              {doc.actualReturnerName && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">실제 반납자</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {doc.actualReturnerName}
                  </div>
                </div>
              )}
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">반납 상태</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.returnConditionOk === 'Y' ? '양호' : '불량'}
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* 대여 교구 목록 및 수량 */}
          <DetailSectionCard title="대여 교구 목록 및 수량" className="mb-6">
            <EquipmentItemsTableV2
              items={doc.items}
              onChange={(items) => {
                handleItemsChange(items)
                if (doc) {
                  upsertEquipmentConfirmation({ ...doc, items })
                }
              }}
              disabled={false}
            />
          </DetailSectionCard>

          {/* 공유사항/특이사항 */}
          <DetailSectionCard title="공유사항/특이사항" className="mb-6">
            <TextArea
              value={doc.notes || ''}
              onChange={(e) => {
                handleFieldChange('notes', e.target.value)
                if (doc) {
                  upsertEquipmentConfirmation({ ...doc, notes: e.target.value })
                }
              }}
              rows={4}
              className="rounded-lg"
              placeholder="공유사항이나 특이사항을 입력하세요"
            />
          </DetailSectionCard>

          {/* 재고 확인 */}
          {inventoryCheck.length > 0 && (
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
                      {inventoryCheck.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 px-4 text-sm text-gray-900 dark:text-gray-100">{item.name}</td>
                          <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">{item.rentedQty}</td>
                          <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">{item.totalQty}</td>
                          <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">{item.brokenQty}</td>
                          <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">{item.rentedQty}</td>
                          <td className="py-2 px-4 text-sm text-center text-gray-900 dark:text-gray-100">{item.availableQty}</td>
                          <td className="py-2 px-4 text-sm text-center">
                            {item.availableQty >= item.rentedQty ? (
                              <Badge status="success" text="가능" />
                            ) : (
                              <Badge status="error" text="부족" />
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </DetailSectionCard>
          )}

          {/* 서명 */}
          <DetailSectionCard title="서명" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {doc.signatures.manager && (
                  <SignatureSlot
                  label="담당자"
                    signature={doc.signatures.manager}
                  signerName={doc.equipmentManagerName || ''}
                    onApply={() => {}}
                    onDelete={() => {}}
                  disabled={true}
                  />
              )}
              {doc.signatures.borrower && (
                  <SignatureSlot
                  label="대여자"
                    signature={doc.signatures.borrower}
                  signerName={doc.borrowerName || ''}
                    onApply={() => {}}
                    onDelete={() => {}}
                  disabled={true}
                  />
              )}
              {doc.signatures.returner && (
                  <SignatureSlot
                  label="반납자"
                    signature={doc.signatures.returner}
                  signerName={doc.actualReturnerName || doc.plannedReturnerName || ''}
                    onApply={() => {}}
                    onDelete={() => {}}
                  disabled={true}
                  />
              )}
            </div>
          </DetailSectionCard>

          {/* 첨부 파일 */}
          {doc.attachments && doc.attachments.length > 0 && (
            <DetailSectionCard title="첨부 파일" className="mb-6">
              <AttachmentUploader
                attachments={doc.attachments}
                onChange={() => {}}
                disabled={true}
              />
            </DetailSectionCard>
          )}

          {/* 이력 로그 */}
          {auditLogs.length > 0 && (
            <DetailSectionCard title="처리 이력" className="mb-6">
              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-gray-100">
                        {log.action === 'approved' && '승인'}
                        {log.action === 'rejected' && '반려'}
                        {log.action === 'borrowed' && '대여 완료'}
                        {log.action === 'returned' && '반납 완료'}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {log.actorName} · {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm')}
                      </div>
                      {log.reason && (
                        <div className="text-sm text-red-600 dark:text-red-400 mt-1">
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

        {/* Reject Modal */}
        <Modal
          title="반려 사유 입력"
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
          <div className="mt-4">
            <p className="mb-2">반려 사유를 입력해주세요:</p>
            <TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="반려 사유를 입력하세요"
            />
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}

