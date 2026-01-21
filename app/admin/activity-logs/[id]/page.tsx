'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Modal, Input, message, Image, Badge, Space } from 'antd'
import { ArrowLeft, CheckCircle2, XCircle, Download } from 'lucide-react'
import { DetailPageHeaderSticky, DetailSectionCard } from '@/components/admin/operations'
import { getActivityLogById, upsertActivityLog } from '@/app/instructor/activity-logs/storage'
import type { ActivityLog } from '@/app/instructor/activity-logs/types'
import { useAuth } from '@/contexts/AuthContext'
import { SessionRowsTable } from '@/app/instructor/activity-logs/components/SessionRowsTable'
import dayjs from 'dayjs'
import { generateActivityLogFilename, generatePhotoFilename, generateLessonPlanFilename } from '@/lib/filenameGenerator'

const { TextArea } = Input

export default function AdminActivityLogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const logId = params?.id as string

  const [log, setLog] = useState<ActivityLog | null>(null)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (logId) {
      const activityLog = getActivityLogById(logId)
      if (activityLog) {
        setLog(activityLog)
      } else {
        message.warning('활동 일지를 찾을 수 없습니다.')
        router.back()
      }
    }
  }, [logId, router])

  const handleApprove = () => {
    if (!log) return

    Modal.confirm({
      title: '승인 확인',
      content: '이 활동 일지를 승인하시겠습니까?',
      onOk: () => {
        const updated: ActivityLog = {
          ...log,
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          approvedBy: userProfile?.name || '',
          // Clear reject info when approving
          rejectedAt: undefined,
          rejectedBy: undefined,
          rejectReason: undefined,
        }
        upsertActivityLog(updated)
        setLog(updated)
        // Trigger storage event for other tabs/windows
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new StorageEvent('storage', {
            key: 'activity_logs',
            newValue: localStorage.getItem('activity_logs'),
            oldValue: localStorage.getItem('activity_logs'),
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

    if (!log) return

    const updated: ActivityLog = {
      ...log,
      status: 'REJECTED',
      rejectedAt: new Date().toISOString(),
      rejectedBy: userProfile?.name || '',
      rejectReason,
      // Clear approve info when rejecting
      approvedAt: undefined,
      approvedBy: undefined,
    }
    upsertActivityLog(updated)
    setLog(updated)
    setRejectModalVisible(false)
    setRejectReason('')
    // Trigger storage event for other tabs/windows
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'activity_logs',
        newValue: localStorage.getItem('activity_logs'),
        oldValue: localStorage.getItem('activity_logs'),
      }))
    }
    message.success('반려되었습니다.')
  }

  if (!log) {
    return (
      <ProtectedRoute requiredRole="admin">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
          <div>로딩 중...</div>
        </div>
      </ProtectedRoute>
    )
  }

  const getStatusBadge = () => {
    const statusMap = {
      DRAFT: { color: 'default', text: '초안' },
      SUBMITTED: { color: 'processing', text: '제출됨' },
      APPROVED: { color: 'success', text: '승인됨' },
      REJECTED: { color: 'error', text: '반려됨' },
    }
    const status = statusMap[log.status || 'DRAFT']
    return <Badge status={status.color as any} text={status.text} />
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
                    교육 활동 일지 상세
                  </h1>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
              </div>
              <Space>
                <Button
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    const firstSession = log.sessions?.[0]
                    const sessionDate = firstSession?.date
                    const startDate = log.startDate
                    const endDate = log.endDate
                    const institutionName = log.institutionName || ''
                    const gradeClass = log.grade && log.class ? `${log.grade}학년 ${log.class}반` : ''
                    const instructorName = log.submittedBy || log.createdBy || ''
                    
                    const filename = generateActivityLogFilename({
                      sessionDate: sessionDate,
                      startDate: startDate,
                      endDate: endDate,
                      schoolName: institutionName,
                      gradeClass: gradeClass,
                      instructorName: instructorName,
                      documentType: '교육활동일지',
                    })
                    
                    // TODO: 실제 파일 다운로드 구현
                    console.log('Download activity log:', filename)
                    message.info(`활동일지 다운로드: ${filename}`)
                  }}
                  className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
                >
                  활동일지 다운로드
                </Button>
                {log.photos && log.photos.length > 0 && (
                  <Button
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => {
                      const firstSession = log.sessions?.[0]
                      const sessionDate = firstSession?.date
                      const startDate = log.startDate
                      const endDate = log.endDate
                      const institutionName = log.institutionName || ''
                      const gradeClass = log.grade && log.class ? `${log.grade}학년 ${log.class}반` : ''
                      
                      // 각 사진에 대해 파일명 생성
                      log.photos.forEach((photo, index) => {
                        const filename = generatePhotoFilename({
                          sessionDate: sessionDate,
                          startDate: startDate,
                          endDate: endDate,
                          schoolName: institutionName,
                          gradeClass: gradeClass,
                          photoIndex: index + 1,
                          totalPhotos: log.photos.length,
                          documentType: '활동사진',
                        })
                        console.log(`Download photo ${index + 1}:`, filename)
                      })
                      message.info(`활동사진 ${log.photos.length}개 다운로드 준비됨`)
                    }}
                    className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
                  >
                    활동사진 다운로드
                  </Button>
                )}
                {log.status === 'SUBMITTED' && (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={handleApprove}
                      style={{ background: '#10b981', borderColor: '#10b981' }}
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
              </Space>
            </div>
          </div>
        </div>

        {/* Submitted banner */}
        {log.status === 'SUBMITTED' && (
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

        <div className="max-w-7xl mx-auto px-6 py-8">

          {/* 교육 정보 */}
          <DetailSectionCard title="교육 정보" className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">활동일지 코드</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{log.logCode || '-'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육구분</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{log.educationType || '-'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관구분</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{log.institutionType || '-'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">지역(시/군)</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{log.region || '-'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{log.institutionName || '-'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">학급명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {log.grade && log.class ? `${log.grade}학년 ${log.class}반` : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육시작일</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {log.startDate ? dayjs(log.startDate).format('YYYY-MM-DD') : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육종료일</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {log.endDate ? dayjs(log.endDate).format('YYYY-MM-DD') : '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">전체 신청자 수</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{log.totalApplicants || 0}명</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">수료자 수</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  남 {log.graduateMale || 0}명 / 여 {log.graduateFemale || 0}명
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* 회차별 활동 내용 */}
          {log.sessions && log.sessions.length > 0 && (
            <DetailSectionCard title="회차별 활동 내용" className="mb-6">
              <SessionRowsTable
                sessions={log.sessions}
                onChange={() => {}}
                disabled={true}
              />
            </DetailSectionCard>
          )}

          {/* 활동 사진 */}
          {log.photos && log.photos.length > 0 && (
            <DetailSectionCard title="활동 사진" className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {log.photos.map((photo) => (
                  <div key={photo.id} className="relative">
                    <Image
                      src={photo.url}
                      alt={photo.name}
                      className="w-full h-48 object-cover rounded-lg"
                      preview={{
                        mask: '확대',
                      }}
                    />
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 truncate">
                      {photo.name}
                    </div>
                  </div>
                ))}
              </div>
            </DetailSectionCard>
          )}

          {/* 강사 서명 */}
          {log.createdBy && (
            <DetailSectionCard title="강사 정보" className="mb-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">작성자</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {log.submittedBy || log.createdBy || '-'}
                  </div>
                </div>
                {log.submittedAt && (
                  <div>
                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">제출일시</div>
                    <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                      {dayjs(log.submittedAt).format('YYYY-MM-DD HH:mm')}
                    </div>
                  </div>
                )}
              </div>
            </DetailSectionCard>
          )}

          {/* 수정 버튼 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              활동 일지를 수정하려면 아래 버튼을 클릭하세요.
            </p>
            <Button
              type="primary"
              onClick={() => router.push(`/instructor/activity-logs/${logId}`)}
            >
              활동 일지 수정하기
            </Button>
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
          >
            <TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="반려 사유를 입력하세요."
            />
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  )
}

