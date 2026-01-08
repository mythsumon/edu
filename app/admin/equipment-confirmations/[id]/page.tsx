'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Space, Modal, Input, message, Badge } from 'antd'
import { ArrowLeft, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { DetailPageHeaderSticky, DetailSectionCard } from '@/components/admin/operations'
import { useAuth } from '@/contexts/AuthContext'
import {
  getDocById,
  getDocByEducationId,
  upsertDoc,
} from '@/app/instructor/equipment-confirmations/storage'
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
import { AttachmentUploader } from '@/app/instructor/equipment-confirmations/components/AttachmentUploader'
import { SignatureSlot } from '@/app/instructor/equipment-confirmations/components/SignatureSlot'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function AdminEquipmentConfirmationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [doc, setDoc] = useState<EquipmentConfirmationDoc | null>(null)
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
        // Try by ID first, then by educationId
        let loadedDoc = getDocById(id)
        if (!loadedDoc) {
          loadedDoc = getDocByEducationId(id)
        }
        
        if (!loadedDoc) {
          message.warning(`교구 확인서를 찾을 수 없습니다. (ID: ${id})`)
          setTimeout(() => {
            router.push('/admin/submissions-by-education')
          }, 2000)
          return
        }
        
        setDoc(loadedDoc)
        
        // Load inventory check and audit logs
        const baseInventory = getInventory()
        const allDocs = getAllDocs()
        const derived = deriveInventory(loadedDoc.items, allDocs, baseInventory)
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

  const handleApprove = () => {
    if (!doc) return

    const baseInventory = getInventory()
    const validation = validateForApprove(doc, baseInventory)
    if (!validation.valid) {
      message.error(validation.errors.join('\n'))
      return
    }

    Modal.confirm({
      title: '승인 확인',
      content: '이 교구 확인서를 승인하시겠습니까?',
      onOk: () => {
        const updated: EquipmentConfirmationDoc = {
          ...doc,
          status: 'APPROVED' as EquipmentConfirmationStatus,
          approvedAt: new Date().toISOString(),
          approvedBy: userProfile?.name || '관리자',
        }
        upsertDoc(updated)
        setDoc(updated)
        appendAuditLog('approved', doc.id, userProfile?.userId || '', userProfile?.name || '')
        setAuditLogs(getAuditLogs(doc.id))
        
        // Update inventory check
        const baseInventory = getInventory()
        const allDocs = getAllDocs()
        const derived = deriveInventory(updated.items, allDocs, baseInventory)
        setInventoryCheck(derived)
        
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

    const updated: EquipmentConfirmationDoc = {
      ...doc,
      status: 'REJECTED' as EquipmentConfirmationStatus,
      rejectReason,
      rejectedAt: new Date().toISOString(),
      rejectedBy: userProfile?.name || '관리자',
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
    if (!doc) return

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
    if (!doc) return

    if (doc.returnConditionOk !== 'Y') {
      message.warning('반납 상태를 확인해주세요.')
      return
    }
    if (!doc.actualReturnerName) {
      message.warning('실제 반납자 이름을 입력해주세요.')
      return
    }
    if (!doc.signatures.returner) {
      message.warning('반납자 서명이 필요합니다.')
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.organizationName}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">강의일자</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.lectureDateText}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교재명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.materialName}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">차시</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.sessionsText}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">수강생 수</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.studentCount}명
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">강사</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.instructorsText}
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

          {/* 교구 목록 */}
          <DetailSectionCard title="교구 목록" className="mb-6">
            <EquipmentItemsTable
              items={doc.items}
              onChange={() => {}} // Read-only for admin
              readOnly={true}
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
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">담당자 서명</div>
                  <SignatureSlot
                    signature={doc.signatures.manager}
                    onApply={() => {}}
                    onDelete={() => {}}
                    readOnly={true}
                  />
                </div>
              )}
              {doc.signatures.borrower && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">대여자 서명</div>
                  <SignatureSlot
                    signature={doc.signatures.borrower}
                    onApply={() => {}}
                    onDelete={() => {}}
                    readOnly={true}
                  />
                </div>
              )}
              {doc.signatures.returner && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-2">반납자 서명</div>
                  <SignatureSlot
                    signature={doc.signatures.returner}
                    onApply={() => {}}
                    onDelete={() => {}}
                    readOnly={true}
                  />
                </div>
              )}
            </div>
          </DetailSectionCard>

          {/* 첨부 파일 */}
          {doc.attachments && doc.attachments.length > 0 && (
            <DetailSectionCard title="첨부 파일" className="mb-6">
              <AttachmentUploader
                attachments={doc.attachments}
                onChange={() => {}}
                readOnly={true}
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

