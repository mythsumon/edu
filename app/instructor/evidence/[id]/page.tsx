'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button, Input, message, Card, Space, Badge } from 'antd'
import { ArrowLeft, Save, CheckCircle2, XCircle, Download } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DetailSectionCard } from '@/components/admin/operations'
import { EvidenceUploader } from '../components/EvidenceUploader'
import {
  getEvidenceDocById,
  getEvidenceDocByEducationId,
  upsertEvidenceDoc,
} from '../storage'
import type { EvidenceDoc, EvidenceStatus } from '../types'
import { dataStore } from '@/lib/dataStore'
import { downloadAllImages } from '../utils/imageUtils'
import dayjs from 'dayjs'

export default function EvidenceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userProfile } = useAuth()
  const id = params?.id as string
  const educationId = searchParams?.get('educationId') || undefined

  const [loading, setLoading] = useState(true)
  const [doc, setDoc] = useState<EvidenceDoc | null>(null)
  const [saving, setSaving] = useState(false)

  // Load doc
  const loadDoc = async () => {
    try {
      let loadedDoc: EvidenceDoc | null = null

      if (id && id !== 'new') {
        loadedDoc = getEvidenceDocById(id) ?? null
      }

      // If not found and educationId exists, try to find by educationId
      if (!loadedDoc && educationId) {
        loadedDoc = getEvidenceDocByEducationId(educationId) ?? null
      }

      // Create new doc if not exists
      if (!loadedDoc) {
        const education = dataStore.getEducationById(educationId || '')
        const assignment = dataStore.getInstructorAssignmentByEducationId(educationId || '')
        
        // Get assistant instructor name (보조강사)
        let assistantInstructorName = userProfile?.name || '보조강사'
        if (assignment?.lessons && assignment.lessons.length > 0) {
          const assistantInstructors = assignment.lessons
            .flatMap(lesson => lesson.assistantInstructors || [])
            .map(inst => inst.name)
          if (assistantInstructors.length > 0) {
            assistantInstructorName = assistantInstructors[0]
          }
        }

        const now = new Date().toISOString()
        loadedDoc = {
          id: id === 'new' ? `evidence-${Date.now()}` : id,
          educationId: educationId || '',
          educationName: education?.name || assignment?.educationName || '',
          institutionName: education?.institution || assignment?.institution || '',
          instructorName: assignment?.instructorName || userProfile?.name || '강사',
          assistantInstructorName: assistantInstructorName,
          items: [],
          status: 'DRAFT',
          createdAt: now,
          updatedAt: now,
        }
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
  }, [id, educationId])

  const handleSave = async () => {
    if (!doc) return

    if (doc.items.length === 0) {
      message.warning('최소 1장 이상의 증빙자료를 업로드해주세요.')
      return
    }

    if (doc.items.length > 5) {
      message.warning('증빙자료는 최대 5장까지만 업로드 가능합니다.')
      return
    }

    setSaving(true)
    try {
      const updated = {
        ...doc,
        updatedAt: new Date().toISOString(),
      }
      upsertEvidenceDoc(updated)
      message.success('증빙자료가 저장되었습니다.')
      setDoc(updated)
    } catch (error) {
      console.error('Error saving evidence doc:', error)
      message.error('증빙자료 저장 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleSubmit = async () => {
    if (!doc) return

    if (doc.items.length === 0) {
      message.warning('최소 1장 이상의 증빙자료를 업로드해주세요.')
      return
    }

    if (doc.items.length > 5) {
      message.warning('증빙자료는 최대 5장까지만 업로드 가능합니다.')
      return
    }

    setSaving(true)
    try {
      const now = new Date().toISOString()
      const updated: EvidenceDoc = {
        ...doc,
        status: 'SUBMITTED',
        submittedAt: now,
        submittedBy: doc.assistantInstructorName,
        updatedAt: now,
      }
      upsertEvidenceDoc(updated)
      message.success('증빙자료가 제출되었습니다. 관리자 승인을 기다려주세요.')
      setDoc(updated)
      
      // Navigate back after a short delay
      setTimeout(() => {
        router.push('/instructor/submissions')
      }, 1500)
    } catch (error) {
      console.error('Error submitting evidence doc:', error)
      message.error('증빙자료 제출 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleItemsChange = (items: typeof doc.items) => {
    if (!doc) return
    setDoc({
      ...doc,
      items,
      updatedAt: new Date().toISOString(),
    })
  }

  const handleDownloadAll = async () => {
    if (!doc || doc.items.length === 0) {
      message.warning('다운로드할 증빙자료가 없습니다.')
      return
    }

    if (doc.items.length < 5) {
      message.warning('증빙자료 5장을 모두 업로드한 후 다운로드할 수 있습니다.')
      return
    }

    try {
      message.loading({ content: '증빙자료를 낮은 해상도로 변환 중...', key: 'download' })
      
      const imageUrls = doc.items.map(item => item.fileUrl)
      const filenames = doc.items.map((item, index) => {
        const extension = item.fileName.split('.').pop() || 'jpg'
        return `증빙자료_${doc.educationName || '교육'}_${index + 1}.${extension}`
      })

      await downloadAllImages(imageUrls, filenames)
      
      message.success({ content: '증빙자료 다운로드가 완료되었습니다.', key: 'download' })
    } catch (error) {
      console.error('다운로드 중 오류:', error)
      message.error({ content: '다운로드 중 오류가 발생했습니다.', key: 'download' })
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
      <ProtectedRoute requiredRole="instructor">
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
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="text-center py-20">
              <p className="text-gray-500">증빙자료를 찾을 수 없습니다.</p>
              <Button
                className="mt-4"
                onClick={() => router.push('/instructor/submissions')}
              >
                목록으로 돌아가기
              </Button>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  const canEdit = doc.status === 'DRAFT' || doc.status === 'REJECTED'
  const canSubmit = doc.status === 'DRAFT' || doc.status === 'REJECTED'

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
                    증빙자료 제출
                  </h1>
                  <div className="mt-1">{getStatusBadge(doc.status)}</div>
                </div>
              </div>
              <Space>
                {doc.items.length === 5 && (
                  <Button
                    icon={<Download className="w-4 h-4" />}
                    onClick={handleDownloadAll}
                    className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-green-600 hover:text-white font-medium transition-all text-slate-700"
                  >
                    다운로드 (낮은 해상도)
                  </Button>
                )}
                {canEdit && (
                  <>
                    <Button
                      onClick={handleSave}
                      loading={saving}
                      disabled={doc.items.length === 0}
                      className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
                    >
                      임시저장
                    </Button>
                    <Button
                      type="primary"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={handleSubmit}
                      loading={saving}
                      disabled={doc.items.length === 0 || doc.items.length > 5}
                      className="h-11 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg !text-white"
                    >
                      제출하기
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>
        </div>

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

          {/* Evidence Upload */}
          <DetailSectionCard title="증빙자료 업로드" className="mb-6">
            <EvidenceUploader
              items={doc.items}
              onChange={handleItemsChange}
              disabled={!canEdit}
              uploadedBy={doc.assistantInstructorName}
            />
            {doc.items.length === 0 && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  최소 1장 이상의 증빙자료를 업로드해주세요.
                </p>
              </div>
            )}
            {doc.items.length > 0 && doc.items.length < 5 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  증빙자료 {doc.items.length}/5장 업로드됨. 5장 모두 업로드하면 다운로드할 수 있습니다.
                </p>
              </div>
            )}
            {doc.items.length === 5 && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-semibold">
                  ✓ 증빙자료 5장 모두 업로드 완료! 헤더의 "다운로드" 버튼을 클릭하여 낮은 해상도로 다운로드할 수 있습니다.
                </p>
              </div>
            )}
          </DetailSectionCard>

          {/* Reject Reason */}
          {doc.status === 'REJECTED' && doc.rejectReason && (
            <DetailSectionCard title="반려 사유" className="mb-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{doc.rejectReason}</p>
                {doc.rejectedAt && (
                  <p className="text-xs text-red-600 mt-2">
                    반려일: {dayjs(doc.rejectedAt).format('YYYY-MM-DD HH:mm')}
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

          {!canEdit && (
            <DetailSectionCard title="알림" className="mb-6">
              <div className="text-center py-4">
                <p className="text-gray-600 dark:text-gray-400">
                  {doc.status === 'SUBMITTED' && '제출 완료. 관리자 승인을 기다리는 중입니다.'}
                  {doc.status === 'APPROVED' && '승인 완료된 증빙자료입니다.'}
                </p>
              </div>
            </DetailSectionCard>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
