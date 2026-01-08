'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Space, Modal, Input, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react'
import { DetailPageHeaderSticky, DetailSectionCard } from '@/components/admin/operations'
import { getAttendanceDocByEducationId, getAttendanceDocById, getAttendanceDocs, upsertAttendanceDoc, type AttendanceDocument } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { useAuth } from '@/contexts/AuthContext'
import { InstitutionContactAndSignatures } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import dayjs from 'dayjs'

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
        }
        const result = upsertAttendanceDoc(updated)
        if (result.success) {
          setDoc(updated)
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
    }
    const result = upsertAttendanceDoc(updated)
    if (result.success) {
      setDoc(updated)
      setRejectModalVisible(false)
      setRejectReason('')
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

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <DetailPageHeaderSticky
          title="교육 출석부 상세"
          onBack={() => router.back()}
        />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              교육 출석부 상세
            </h1>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {doc.status === 'APPROVED' ? '승인됨' :
                 doc.status === 'REJECTED' ? '반려됨' :
                 '제출됨'}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          {doc.status === 'SUBMITTED' && (
            <div className="mb-6 flex gap-4">
              <Button
                type="primary"
                icon={<CheckCircle2 className="w-4 h-4" />}
                onClick={handleApprove}
                size="large"
                style={{ background: '#10b981', borderColor: '#10b981' }}
              >
                승인
              </Button>
              <Button
                danger
                icon={<XCircle className="w-4 h-4" />}
                onClick={() => setRejectModalVisible(true)}
                size="large"
              >
                반려
              </Button>
            </div>
          )}

          {/* 교육 정보 */}
          <DetailSectionCard title="교육 정보" className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">소재지</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{doc.location}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{doc.institution}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">학급명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{doc.gradeClass}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">프로그램명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{doc.programName}</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">총차시</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{doc.totalSessions}차시</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">성별 인원</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  남 {doc.maleCount}명 / 여 {doc.femaleCount}명
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">수강생</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{doc.students.length}명</div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">학교 담당자</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">{doc.schoolContactName}</div>
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
                    render: (text: string) => (
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{text}</span>
                    ),
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
                    key: 'date',
                    label: '강의날짜',
                    ...doc.sessions.reduce((acc, session, index) => {
                      const normalizedDate = session.date.replace(/\./g, '-')
                      const d = dayjs(normalizedDate)
                      const weekdays = ['일', '월', '화', '수', '목', '금', '토']
                      acc[`session${index + 1}`] = d.isValid() 
                        ? `${d.month() + 1}.${d.date()}(${weekdays[d.day()]})`
                        : session.date
                      return acc
                    }, {} as Record<string, string>),
                  },
                  {
                    key: 'time',
                    label: '시간',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = `${session.startTime} ~ ${session.endTime}`
                      return acc
                    }, {} as Record<string, string>),
                  },
                  {
                    key: 'sessions',
                    label: '차시',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = `${session.sessions}차시`
                      return acc
                    }, {} as Record<string, string>),
                  },
                  {
                    key: 'mainInstructor',
                    label: '주강사',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = session.mainInstructor
                      return acc
                    }, {} as Record<string, string>),
                  },
                  {
                    key: 'assistantInstructor',
                    label: '보조강사',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = session.assistantInstructor || '-'
                      return acc
                    }, {} as Record<string, string>),
                  },
                  {
                    key: 'studentCount',
                    label: '수강생 수',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = `${session.studentCount}명`
                      return acc
                    }, {} as Record<string, string>),
                  },
                  {
                    key: 'attendanceCount',
                    label: '출석 수',
                    ...doc.sessions.reduce((acc, session, index) => {
                      acc[`session${index + 1}`] = `${session.attendanceCount}명`
                      return acc
                    }, {} as Record<string, string>),
                  },
                ]}
                pagination={false}
              />
            </DetailSectionCard>
          )}

          {/* 학생별 출석 정보 */}
          {doc.students && doc.students.length > 0 && (
            <DetailSectionCard title="학생별 출석 정보" className="mb-6">
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
                    render: (_: any, record: any) => (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        record.completionStatus === 'O' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {record.completionStatus === 'O' ? '수료' : '미수료'}
                      </span>
                    ),
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

          {/* 수정 버튼 */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
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
