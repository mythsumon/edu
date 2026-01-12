'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Space, Table, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeft } from 'lucide-react'
import { Badge } from 'antd'
import { DetailPageHeaderSticky, DetailSectionCard } from '@/components/admin/operations'
import { getAttendanceDocByEducationId, getAttendanceDocById, getAttendanceDocs, type AttendanceDocument } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { InstitutionContactAndSignatures } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import { getActivityLogByEducationId } from '@/app/instructor/activity-logs/storage'
import dayjs from 'dayjs'

export default function InstructorAttendanceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [doc, setDoc] = useState<AttendanceDocument | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      // Try to find by educationId first
      let attendanceDoc = getAttendanceDocByEducationId(id)
      
      // If not found, try to find by id (in case id is actually the document id)
      if (!attendanceDoc) {
        attendanceDoc = getAttendanceDocById(id)
      }
      
      // If still not found, try with attendance- prefix
      if (!attendanceDoc) {
        attendanceDoc = getAttendanceDocById(`attendance-${id}`)
      }
      
      if (attendanceDoc) {
        setDoc(attendanceDoc)
      } else {
        const allDocs = getAttendanceDocs()
        
        // Show more helpful error message
        if (allDocs.length === 0) {
          message.warning('출석부 문서가 없습니다. 먼저 출석부를 생성해주세요.')
        } else {
          message.warning(`출석부를 찾을 수 없습니다. (ID: ${id})`)
          console.log('Available attendance docs:', allDocs.map(d => ({ id: d.id, educationId: d.educationId })))
        }
        
        // Redirect to schedule list page
        setTimeout(() => {
          router.push('/instructor/schedule/list')
        }, 2000)
      }
    }
  }, [id, router])

  if (!doc) {
    return (
      <ProtectedRoute requiredRole="instructor">
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
                    교육 출석부 상세
                  </h1>
                  <div className="mt-1">{getStatusBadge()}</div>
                </div>
              </div>
              <Space>
                <Button
                  type="primary"
                  onClick={() => {
                    // Navigate to edit page
                    const targetEducationId = doc.educationId || id.replace(/^attendance-/, '')
                    router.push(`/instructor/schedule/${targetEducationId}/attendance`)
                  }}
                >
                  수정하기
                </Button>
              </Space>
            </div>
          </div>
        </div>

        {/* Status banner */}
        {doc.status === 'SUBMITTED' && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  제출 완료 (승인 대기 중)
                </span>
              </div>
            </div>
          </div>
        )}

        {doc.status === 'REJECTED' && doc.rejectReason && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-900 dark:text-red-100">
                  반려됨: {doc.rejectReason}
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
                    const targetEducationId = doc.educationId || id.replace(/^attendance-/, '')
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
                    const targetEducationId = doc.educationId || id.replace(/^attendance-/, '')
                    const activityLog = getActivityLogByEducationId(targetEducationId)
                    if (activityLog?.id) {
                      router.push(`/instructor/activity-logs/${activityLog.id}`)
                    } else {
                      router.push(`/instructor/activity-logs/${targetEducationId}`)
                    }
                  }}
                >
                  활동 일지 보기
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
