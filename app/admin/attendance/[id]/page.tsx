'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Space, Modal, Input, Table, message, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeft, CheckCircle2, XCircle, CheckCircle, Download } from 'lucide-react'
import { Badge } from 'antd'
import { DetailPageHeaderSticky, DetailSectionCard } from '@/components/admin/operations'
import { getAttendanceDocByEducationId, getAttendanceDocById, getAttendanceDocs, upsertAttendanceDoc, type AttendanceDocument } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { useAuth } from '@/contexts/AuthContext'
import { InstitutionContactAndSignatures } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import { getActivityLogByEducationId } from '@/app/instructor/activity-logs/storage'
import { teacherEducationInfoStore } from '@/lib/teacherStore'
import type { TeacherEducationInfo } from '@/lib/teacherStore'
import dayjs from 'dayjs'
import { generateAttendanceFilename } from '@/lib/filenameGenerator'

const { TextArea } = Input

export default function AdminAttendanceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const educationId = params?.id as string

  const [doc, setDoc] = useState<AttendanceDocument | null>(null)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [teacherEducationInfo, setTeacherEducationInfo] = useState<TeacherEducationInfo | null>(null)

  useEffect(() => {
    // Initialize example data if needed (only in development)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const { initExampleAttendanceDocs } = require('@/app/instructor/schedule/[educationId]/attendance/initExampleData')
      initExampleAttendanceDocs()
    }
  }, [])

  useEffect(() => {
    if (educationId) {
      // Try to find by educationId first
      let attendanceDoc = getAttendanceDocByEducationId(educationId)
      
      // If not found, try to find by id (in case educationId is actually the document id)
      if (!attendanceDoc) {
        attendanceDoc = getAttendanceDocById(educationId)
      }
      
      // If still not found, try with attendance- prefix
      if (!attendanceDoc) {
        attendanceDoc = getAttendanceDocById(`attendance-${educationId}`)
      }
      
      if (attendanceDoc) {
        setDoc(attendanceDoc)
        
        // Load teacher education info
        const docEducationId = attendanceDoc.educationId || educationId
        const teacherInfo = teacherEducationInfoStore.getByEducationId(docEducationId)
        if (teacherInfo) {
          setTeacherEducationInfo(teacherInfo)
        }
      } else {
        const allDocs = getAttendanceDocs()
        
        // Show more helpful error message
        if (allDocs.length === 0) {
          message.warning('출석부 문서가 없습니다. 강사가 먼저 출석부를 생성하고 제출해야 합니다.')
        } else {
          message.warning(`출석부를 찾을 수 없습니다. (ID: ${educationId})`)
          console.log('Available attendance docs:', allDocs.map(d => ({ id: d.id, educationId: d.educationId })))
        }
        
        // Redirect to submissions page instead of going back
        setTimeout(() => {
          router.push('/admin/submissions')
        }, 2000)
      }
    }
  }, [educationId, router])

  // Listen for teacher education info updates
  useEffect(() => {
    if (typeof window === 'undefined' || !doc) return

    const handleTeacherInfoUpdate = () => {
      const docEducationId = doc.educationId || educationId
      if (docEducationId) {
        const teacherInfo = teacherEducationInfoStore.getByEducationId(docEducationId)
        setTeacherEducationInfo(teacherInfo)
      }
    }

    window.addEventListener('teacherEducationInfoUpdated', handleTeacherInfoUpdate)
    return () => {
      window.removeEventListener('teacherEducationInfoUpdated', handleTeacherInfoUpdate)
    }
  }, [doc, educationId])

  const handleApprove = () => {
    if (!doc) return

    Modal.confirm({
      title: '승인 확인',
      content: '이 출석부를 승인하시겠습니까?',
      onOk: () => {
        const updated: AttendanceDocument = {
          ...doc,
          status: 'APPROVED',
          approvedAt: new Date().toISOString(),
          approvedBy: userProfile?.name || '',
          // Clear reject info when approving
          rejectedAt: undefined,
          rejectedBy: undefined,
          rejectReason: undefined,
        }
        const result = upsertAttendanceDoc(updated)
        if (result.success) {
          setDoc(updated)
          // Trigger storage event for other tabs/windows
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'attendance_documents',
              newValue: localStorage.getItem('attendance_documents'),
              oldValue: localStorage.getItem('attendance_documents'),
            }))
          }
          message.success('승인되었습니다.')
        } else {
          message.error(result.error || '승인 처리 중 오류가 발생했습니다.')
        }
      },
    })
  }

  const handleReject = () => {
    if (!rejectReason.trim()) {
      message.warning('반려 사유를 입력해주세요.')
      return
    }

    if (!doc) return

    const updated: AttendanceDocument = {
      ...doc,
      status: 'REJECTED',
      rejectedAt: new Date().toISOString(),
      rejectedBy: userProfile?.name || '',
      rejectReason,
      // Clear approve info when rejecting
      approvedAt: undefined,
      approvedBy: undefined,
    }
    const result = upsertAttendanceDoc(updated)
    if (result.success) {
      setDoc(updated)
      setRejectModalVisible(false)
      setRejectReason('')
      // Trigger storage event for other tabs/windows
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'attendance_documents',
          newValue: localStorage.getItem('attendance_documents'),
          oldValue: localStorage.getItem('attendance_documents'),
        }))
      }
      message.success('반려되었습니다.')
    } else {
      message.error(result.error || '반려 처리 중 오류가 발생했습니다.')
    }
  }

  if (!doc) {
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
    const status = statusMap[doc.status]
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
                    교육 출석부 상세
                  </h1>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
              </div>
              <Space>
                <Button
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => {
                    const firstSession = doc.sessions?.[0]
                    const sessionDate = firstSession?.date
                    const gradeClass = doc.gradeClass || ''
                    const institution = doc.institution || ''
                    
                    const filename = generateAttendanceFilename({
                      sessionDate: sessionDate,
                      schoolName: institution,
                      gradeClass: gradeClass,
                      documentType: '출석부',
                    })
                    
                    // TODO: 실제 파일 다운로드 구현
                    console.log('Download attendance:', filename)
                    message.info(`출석부 다운로드: ${filename}`)
                  }}
                  className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
                >
                  다운로드
                </Button>
                {doc.status === 'SUBMITTED' && (
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

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Teacher Education Info Alert */}
          {teacherEducationInfo && (
            <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    학교 선생님이 입력한 교육 정보가 자동으로 불러와졌습니다.
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* 교육 정보 */}
          <DetailSectionCard title="교육 정보" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">출석부 코드</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {doc.id || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">프로그램명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{doc.programName || '-'}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {doc.institution || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">학년</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {(() => {
                    const match = doc.gradeClass?.match(/(\d+)학년/)
                    return match ? `${match[1]}학년` : '-'
                  })()}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">반</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {(() => {
                    const match = doc.gradeClass?.match(/(\d+)반/)
                    return match ? `${match[1]}반` : '-'
                  })()}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육신청인원</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {doc.students.length}명
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 이름</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.schoolContactName || doc.institutionContact?.name || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 연락처</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {doc.institutionContact?.phone || '-'}
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* 회차별 수업 정보 */}
          {doc.sessions && doc.sessions.length > 0 && (
            <DetailSectionCard title="회차별 수업 정보" className="mb-6">
              <Table
                columns={[
                  {
                    title: '구분',
                    dataIndex: 'label',
                    key: 'label',
                    width: 120,
                    render: (text: string, record: any) => {
                      if (record.subLabel) {
                        return (
                          <div>
                            <div className="font-semibold text-gray-700 dark:text-gray-300">{text || ''}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{record.subLabel}</div>
                          </div>
                        )
                      }
                      return <span className="font-semibold text-gray-700 dark:text-gray-300">{text}</span>
                    },
                  },
                  ...doc.sessions.map((session, index) => ({
                    title: `${session.sessionNumber}회차`,
                    key: `session${index + 1}`,
                    width: 200,
                    align: 'center' as const,
                    render: (_: any, record: any) => record[`session${index + 1}`],
                  })),
                ]}
                dataSource={[
                  {
                    key: 'dateTime',
                    label: '강의날짜 및 시간',
                    ...doc.sessions.reduce((acc, session, index) => {
                      const normalizedDate = session.date.replace(/\./g, '-')
                      const d = dayjs(normalizedDate)
                      const weekdays = ['일', '월', '화', '수', '목', '금', '토']
                      const dateStr = d.isValid() 
                        ? `${d.month() + 1}.${d.date()}(${weekdays[d.day()]})`
                        : session.date
                      acc[`session${index + 1}`] = `${dateStr}, ${session.startTime} ~ ${session.endTime}`
                      return acc
                    }, {} as Record<string, string>),
                  },
                  {
                    key: 'instructorType',
                    label: '참여강사',
                    subLabel: '강사구분',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = (
                        <div className="space-y-2">
                          <div className="text-sm">주강사</div>
                          <div className="text-sm">보조강사</div>
                        </div>
                      )
                      return acc
                    }, {} as Record<string, any>),
                  },
                  {
                    key: 'instructorName',
                    label: '',
                    subLabel: '이름',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = (
                        <div className="space-y-2">
                          <div className="text-sm">{session.mainInstructor || '-'}</div>
                          <div className="text-sm">{session.assistantInstructor || '-'}</div>
                        </div>
                      )
                      return acc
                    }, {} as Record<string, any>),
                  },
                  {
                    key: 'sessions',
                    label: '차시',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = String(session.sessions)
                      return acc
                    }, {} as Record<string, string>),
                  },
                  {
                    key: 'studentCount',
                    label: '학생정원',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = String(session.studentCount)
                      return acc
                    }, {} as Record<string, string>),
                  },
                  {
                    key: 'attendanceCount',
                    label: '출석인원',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = String(session.attendanceCount)
                      return acc
                    }, {} as Record<string, string>),
                  },
                ]}
                pagination={false}
              />
            </DetailSectionCard>
          )}

          {/* 학생별 출석 현황 */}
          {doc.students && doc.students.length > 0 && (
            <DetailSectionCard title="학생별 출석 현황" className="mb-6">
              <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>※ 수료기준 :</strong> 학생 당 출석률 80% 이상
                  </p>
                </div>
              </div>
              <Table
                columns={[
                  {
                    title: '출석번호',
                    dataIndex: 'number',
                    key: 'number',
                    width: 80,
                    align: 'center',
                  },
                  {
                    title: '이름',
                    dataIndex: 'name',
                    key: 'name',
                    width: 120,
                  },
                  {
                    title: '성별',
                    dataIndex: 'gender',
                    key: 'gender',
                    width: 80,
                    align: 'center',
                    render: (gender: '남' | '여') => (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        gender === '남' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {gender}
                      </span>
                    ),
                  },
                  ...doc.sessions.map((session, index) => ({
                    title: `${session.sessionNumber}회차`,
                    key: `session-${index}`,
                    align: 'center' as const,
                    width: 120,
                    render: (_: any, record: any) => {
                      const value = record.sessionAttendances[index] || 0
                      if (record.isTransferred) {
                        return <span className="text-sm text-gray-400">-</span>
                      }
                      return <span className="text-sm font-medium">{value}</span>
                    },
                  })),
                  {
                    title: '수료여부',
                    key: 'completion',
                    width: 100,
                    align: 'center',
                    render: (_: any, record: any) => {
                      if (record.isTransferred) {
                        return <span className="text-sm text-gray-400">-</span>
                      }
                      return (
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-base font-bold ${
                          record.completionStatus === 'O' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        }`}>
                          {record.completionStatus}
                        </span>
                      )
                    },
                  },
                ]}
                dataSource={doc.students}
                rowKey="id"
                pagination={{
                  pageSize: 20,
                  showSizeChanger: true,
                  showTotal: (total) => `총 ${total}명`,
                }}
                scroll={{ x: 'max-content' }}
              />
            </DetailSectionCard>
          )}

          {/* 기관 연락처 및 서명 */}
          <DetailSectionCard title="기관 연락처 및 서명" className="mb-6">
            <InstitutionContactAndSignatures
              institutionContact={doc.institutionContact}
              signatures={doc.signatures}
              session1MainInstructorName={doc.sessions[0]?.mainInstructor || ''}
              session1AssistantInstructorName={doc.sessions[0]?.assistantInstructor || ''}
              session2MainInstructorName={doc.sessions[1]?.mainInstructor || ''}
              session2AssistantInstructorName={doc.sessions[1]?.assistantInstructor || ''}
              isEditMode={false}
              onInstitutionContactChange={() => {}}
              onSignatureApply={() => {}}
              onSignatureDelete={() => {}}
            />
          </DetailSectionCard>

          {/* 수정 버튼 및 활동 일지 이동 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
            <div className="space-y-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  출석부를 수정하려면 아래 버튼을 클릭하세요.
                </p>
                <Button
                  type="primary"
                  onClick={() => {
                    // Use doc.educationId if available, otherwise try to extract from educationId param
                    const targetEducationId = doc.educationId || educationId.replace(/^attendance-/, '')
                    router.push(`/instructor/schedule/${targetEducationId}/attendance`)
                  }}
                >
                  출석부 수정하기
                </Button>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  관련 활동 일지를 확인하려면 아래 버튼을 클릭하세요.
                </p>
                <Button
                  onClick={() => {
                    const targetEducationId = doc.educationId || educationId.replace(/^attendance-/, '')
                    // 교육 출석부 상세 페이지에서 활동 일지로 이동
                    const activityLog = getActivityLogByEducationId(targetEducationId)
                    if (activityLog?.id) {
                      router.push(`/instructor/activity-logs/${activityLog.id}`)
                    } else {
                      // activity log가 없으면 educationId를 사용하여 새로 생성하거나 찾기
                      router.push(`/instructor/activity-logs/${targetEducationId}`)
                    }
                  }}
                >
                  활동 일지 보기
                </Button>
              </div>
            </div>
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
