'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, message, Card, Space, Badge, Modal, Input } from 'antd'
import { ArrowLeft, CheckCircle2, XCircle, Download, Edit, AlertTriangle } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DetailSectionCard } from '@/components/admin/operations'
import { EvidenceUploader } from '@/app/instructor/evidence/components/EvidenceUploader'
import {
  getEvidenceDocById,
  upsertEvidenceDoc,
} from '@/app/instructor/evidence/storage'
import type { EvidenceDoc, EvidenceStatus } from '@/app/instructor/evidence/types'
import { useAuth } from '@/contexts/AuthContext'
import { downloadAllImages } from '@/app/instructor/evidence/utils/imageUtils'
import dayjs from 'dayjs'
import { generatePhotoFilename } from '@/lib/filenameGenerator'
import { dataStore } from '@/lib/dataStore'

const { TextArea } = Input

export default function AdminEvidenceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const id = params?.id as string

  const [loading, setLoading] = useState(true)
  const [doc, setDoc] = useState<EvidenceDoc | null>(null)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectReason, setRejectReason] = useState('')

  // Load doc
  const loadDoc = async () => {
    if (!id) {
      setLoading(false)
      return
    }
    
    try {
      const loadedDoc = getEvidenceDocById(id)
      if (!loadedDoc) {
        message.error('증빙자료를 찾을 수 없습니다.')
        router.push('/admin/submissions')
        return
      }
      setDoc(loadedDoc)
    } catch (error) {
      console.error('Error loading evidence doc:', error)
      message.error('증빙자료를 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDoc()
  }, [id])

  const handleApprove = async () => {
    if (!doc) return

    Modal.confirm({
      title: '증빙자료 승인',
      content: '이 증빙자료를 승인하시겠습니까?',
      okText: '승인',
      cancelText: '취소',
      onOk: async () => {
        try {
          const now = new Date().toISOString()
          const updated: EvidenceDoc = {
            ...doc,
            status: 'APPROVED',
            approvedAt: now,
            approvedBy: userProfile?.name || '관리자',
            updatedAt: now,
          }
          upsertEvidenceDoc(updated)
          message.success('증빙자료가 승인되었습니다.')
          setDoc(updated)
          
          // Trigger event for real-time updates
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('evidenceUpdated'))
          }
        } catch (error) {
          console.error('Error approving evidence doc:', error)
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
      const updated: EvidenceDoc = {
        ...doc,
        status: 'REJECTED',
        rejectedAt: now,
        rejectedBy: userProfile?.name || '관리자',
        rejectReason: rejectReason.trim(),
        updatedAt: now,
      }
      upsertEvidenceDoc(updated)
      message.success('증빙자료가 반려되었습니다.')
      setDoc(updated)
      setRejectModalVisible(false)
      setRejectReason('')
      
      // Trigger event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('evidenceUpdated'))
      }
    } catch (error) {
      console.error('Error rejecting evidence doc:', error)
      message.error('반려 처리 중 오류가 발생했습니다.')
    }
  }

  const getStatusBadge = (status: EvidenceStatus) => {
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
            text="제출됨 (승인 대기)"
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center py-20">
              <p className="text-gray-500">증빙자료를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (!doc) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center py-20">
              <p className="text-gray-500">증빙자료를 찾을 수 없습니다.</p>
              <Button
                className="mt-4"
                onClick={() => router.push('/admin/submissions')}
              >
                목록으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }


  const handleDownloadAll = async () => {
    if (!doc || doc.items.length === 0) {
      message.warning('다운로드할 증빙자료가 없습니다.')
      return
    }

    try {
      message.loading({ content: '증빙자료를 낮은 해상도로 변환 중...', key: 'download' })
      
      // 교육 정보에서 날짜 및 학급 정보 가져오기
      const education = doc.educationId ? dataStore.getEducationById(doc.educationId) : null
      const firstLesson = education?.lessons?.[0]
      const sessionDate = firstLesson?.date
      const startDate = education?.periodStart
      const endDate = education?.periodEnd
      const gradeClass = education?.gradeClass || ''
      
      const imageUrls = doc.items.map(item => item.fileUrl)
      const filenames = doc.items.map((item, index) => {
        const extension = item.fileName.split('.').pop() || 'jpg'
        const filename = generatePhotoFilename({
          sessionDate: sessionDate,
          startDate: startDate,
          endDate: endDate,
          schoolName: doc.institutionName || '',
          gradeClass: gradeClass,
          photoIndex: index + 1,
          totalPhotos: doc.items.length,
          documentType: '활동사진',
        })
        return `${filename}.${extension}`
      })

      await downloadAllImages(imageUrls, filenames)
      
      message.success({ content: '증빙자료 다운로드가 완료되었습니다.', key: 'download' })
    } catch (error) {
      console.error('다운로드 중 오류:', error)
      message.error({ content: '다운로드 중 오류가 발생했습니다.', key: 'download' })
    }
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
                  onClick={() => router.back()}
                  className="flex items-center dark:text-gray-300"
                >
                  돌아가기
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    증빙자료 확인
                  </h1>
                  <div className="mt-1">{getStatusBadge(doc.status)}</div>
                </div>
              </div>
              <Space>
                {doc.items.length > 0 && (
                  <Button
                    icon={<Download className="w-4 h-4" />}
                    onClick={handleDownloadAll}
                    className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
                  >
                    다운로드
                  </Button>
                )}
                <Button
                  icon={<Edit className="w-4 h-4" />}
                  onClick={() => {
                    const targetEducationId = doc.educationId || id
                    router.push(`/instructor/evidence/${targetEducationId}?educationId=${targetEducationId}`)
                  }}
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

          {/* Education Info */}
          <DetailSectionCard title="교육 정보" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">교육명</label>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{doc.educationName || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">기관명</label>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{doc.institutionName || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">주강사</label>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{doc.instructorName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">보조강사</label>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">{doc.assistantInstructorName}</p>
              </div>
            </div>
          </DetailSectionCard>

          {/* Evidence Items */}
          <DetailSectionCard title="증빙자료" className="mb-6">
            <EvidenceUploader
              items={doc.items}
              onChange={() => {}} // Read-only for admin
              disabled={true}
              uploadedBy={doc.assistantInstructorName}
            />
            {doc.items.length === 0 && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  업로드된 증빙자료가 없습니다.
                </p>
              </div>
            )}
          </DetailSectionCard>

          {/* Submission Info */}
          {doc.submittedAt && (
            <DetailSectionCard title="제출 정보" className="mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">제출일</label>
                  <p className="text-base text-gray-900">
                    {dayjs(doc.submittedAt).format('YYYY-MM-DD HH:mm')}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">제출자</label>
                  <p className="text-base text-gray-900">{doc.submittedBy || doc.assistantInstructorName}</p>
                </div>
              </div>
            </DetailSectionCard>
          )}

          {/* Reject Reason */}
          {doc.status === 'REJECTED' && doc.rejectReason && (
            <DetailSectionCard title="반려 사유" className="mb-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{doc.rejectReason}</p>
                {doc.rejectedAt && (
                  <p className="text-xs text-red-600 mt-2">
                    반려일: {dayjs(doc.rejectedAt).format('YYYY-MM-DD HH:mm')} | 
                    반려자: {doc.rejectedBy || '관리자'}
                  </p>
                )}
              </div>
            </DetailSectionCard>
          )}

          {/* Approval Info */}
          {doc.status === 'APPROVED' && (
            <DetailSectionCard title="승인 정보" className="mb-6">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  관리자에 의해 승인되었습니다.
                </p>
                {doc.approvedAt && (
                  <p className="text-xs text-green-600 mt-2">
                    승인일: {dayjs(doc.approvedAt).format('YYYY-MM-DD HH:mm')} | 
                    승인자: {doc.approvedBy || '관리자'}
                  </p>
                )}
              </div>
            </DetailSectionCard>
          )}


          {/* Reject Modal */}
          <Modal
            title="증빙자료 반려"
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
            <div className="space-y-4">
              <p className="text-gray-700">
                반려 사유를 입력해주세요.
              </p>
              <TextArea
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="반려 사유를 입력하세요..."
                maxLength={500}
                showCount
              />
            </div>
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  )
}
