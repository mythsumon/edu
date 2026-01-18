'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Table, message, Modal, Form, Input, Select, Card } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeft, FileCheck } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { attendanceSheetStore, type AttendanceSheet } from '@/lib/attendanceSheetStore'
import { dataStore } from '@/lib/dataStore'
import { DetailSectionCard } from '@/components/admin/operations'
import { InstitutionContactAndSignatures } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import type { InstitutionContact, AttendanceSignatures } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import dayjs from 'dayjs'

export default function TeacherAttendanceSignDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const attendanceId = params?.attendanceId as string
  
  const [attendanceSheet, setAttendanceSheet] = useState<AttendanceSheet | null>(null)
  const [signatureModalVisible, setSignatureModalVisible] = useState(false)
  const [signatureType, setSignatureType] = useState<'image' | 'typed'>('typed')
  const [typedName, setTypedName] = useState('')
  const [signatureImageUrl, setSignatureImageUrl] = useState('')

  useEffect(() => {
    if (attendanceId) {
      const sheet = attendanceSheetStore.getById(attendanceId)
      if (sheet) {
        setAttendanceSheet(sheet)
        setTypedName(userProfile?.name || sheet.teacherInfo.teacherName || '')
        setSignatureImageUrl(userProfile?.signatureImageUrl || '')
        setSignatureType(userProfile?.signatureImageUrl ? 'image' : 'typed')
      } else {
        message.error('출석부를 찾을 수 없습니다.')
        router.push('/teacher/attendance-sign')
      }
    }
  }, [attendanceId, router, userProfile])

  const education = attendanceSheet ? dataStore.getEducationById(attendanceSheet.educationId) : null

  // Calculate completion status based on attendance rate (80% 이상이면 O, 미만이면 X)
  const calculateCompletionStatus = (attendedSessions: number, totalSessions: number): 'O' | 'X' => {
    if (totalSessions === 0) return 'X'
    const rate = (attendedSessions / totalSessions) * 100
    return rate >= 80 ? 'O' : 'X'
  }

  // Calculate completion status for each student
  const studentsWithCompletion = useMemo(() => {
    if (!attendanceSheet?.students || !attendanceSheet.sessions || attendanceSheet.sessions.length === 0) {
      return attendanceSheet?.students?.map(student => ({ ...student, completionStatus: 'X' as const })) || []
    }
    
    return attendanceSheet.students.map(student => {
      let totalAttended = 0
      attendanceSheet.sessions.forEach(session => {
        const attendance = session.attendanceByStudent[student.id || String(student.no)]
        if (typeof attendance === 'number' && attendance > 0) {
          totalAttended += 1
        }
      })
      
      const totalSessions = attendanceSheet.sessions.length
      const completionStatus = calculateCompletionStatus(totalAttended, totalSessions)
      
      return { ...student, completionStatus }
    })
  }, [attendanceSheet])

  // Prepare institution contact and signatures for InstitutionContactAndSignatures component
  const institutionContact: InstitutionContact = {
    name: attendanceSheet?.teacherInfo?.teacherName || '',
    phone: attendanceSheet?.teacherInfo?.teacherContact || '',
    email: '',
  }

  const signatures: AttendanceSignatures = {
    school: attendanceSheet?.teacherSignature ? {
      signedByUserId: attendanceSheet.teacherSignature.signedBy,
      signedByUserName: attendanceSheet.teacherSignature.signedBy,
      signedAt: attendanceSheet.teacherSignature.signedAt,
      signatureImageUrl: attendanceSheet.teacherSignature.method === 'PNG' ? (attendanceSheet.teacherSignature.signatureRef || '') : '',
    } : undefined,
  }

  const handleSignatureSubmit = () => {
    if (!attendanceSheet) return

    if (signatureType === 'typed' && !typedName.trim()) {
      message.warning('이름을 입력해주세요.')
      return
    }

    if (signatureType === 'image' && !signatureImageUrl) {
      message.warning('서명 이미지를 선택해주세요.')
      return
    }

    const signature = {
      method: (signatureType === 'image' ? 'PNG' : 'TYPED') as 'PNG' | 'TYPED',
      signedBy: userProfile?.name || attendanceSheet.teacherInfo.teacherName || '학교선생님',
      signedAt: new Date().toISOString(),
      signatureRef: signatureType === 'typed' ? typedName : signatureImageUrl,
    }

    // Allow signature for any status
    if (attendanceSheet.teacherSignature) {
      const updated = {
        ...attendanceSheet,
        teacherSignature: signature,
        updatedAt: new Date().toISOString(),
      }
      attendanceSheetStore.upsert(updated)
      setAttendanceSheet(updated)
      message.success('서명이 업데이트되었습니다.')
    } else {
      const result = attendanceSheetStore.addTeacherSignature(attendanceSheet.attendanceId, signature)
      if (result) {
        setAttendanceSheet(result)
        message.success('서명이 완료되었습니다.')
      } else {
        // Direct update if status doesn't allow transition
        const updated = {
          ...attendanceSheet,
          teacherSignature: signature,
          updatedAt: new Date().toISOString(),
        }
        attendanceSheetStore.upsert(updated)
        setAttendanceSheet(updated)
        message.success('서명이 완료되었습니다.')
      }
    }
    setSignatureModalVisible(false)
  }

  if (!attendanceSheet) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
          <div>로딩 중...</div>
        </div>
      </ProtectedRoute>
    )
  }

  // Build session table data source
  const sessionTableDataSource = attendanceSheet.sessions && attendanceSheet.sessions.length > 0 ? [
    {
      key: 'dateTime',
      label: '강의날짜 및 시간',
      ...attendanceSheet.sessions.reduce((acc, session, index) => {
        const normalizedDate = session.date.replace(/\./g, '-')
        const d = dayjs(normalizedDate)
        const weekdays = ['일', '월', '화', '수', '목', '금', '토']
        const dateStr = d.isValid() 
          ? `${d.month() + 1}.${d.date()}(${weekdays[d.day()]})`
          : session.date
        acc[`session${index + 1}`] = `${dateStr}, ${session.startTime} ~ ${session.endTime}`
        return acc
      }, {} as Record<string, any>),
    },
    {
      key: 'instructorType',
      label: '참여강사',
      subLabel: '강사구분',
      ...attendanceSheet.sessions.reduce((acc, session, index) => {
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
       ...attendanceSheet.sessions.reduce((acc, session, index) => {
         const mainInstructor = session.mainInstructor || '-'
         const assistantInstructor = session.assistantInstructor || '-'
         acc[`session${index + 1}`] = (
           <div className="space-y-2">
             <div className="text-sm">{mainInstructor}</div>
             <div className="text-sm">{assistantInstructor}</div>
           </div>
         )
         return acc
       }, {} as Record<string, any>),
     },
    {
      key: 'sessions',
      label: '차시',
      ...attendanceSheet.sessions.reduce((acc, session, index) => {
        acc[`session${index + 1}`] = session.sessionNo || '-'
        return acc
      }, {} as Record<string, any>),
    },
    {
      key: 'studentCount',
      label: '학생정원',
      ...attendanceSheet.sessions.reduce((acc, session, index) => {
        acc[`session${index + 1}`] = attendanceSheet.students?.length || 0
        return acc
      }, {} as Record<string, any>),
    },
    {
      key: 'attendanceCount',
      label: '출석인원',
      ...attendanceSheet.sessions.reduce((acc, session, index) => {
        const attendedCount = Object.values(session.attendanceByStudent || {}).filter((val: any) => typeof val === 'number' && val > 0).length
        acc[`session${index + 1}`] = attendedCount
        return acc
      }, {} as Record<string, any>),
    },
  ] : []

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={() => router.push('/teacher/attendance-sign')}
                  className="flex items-center dark:text-gray-300"
                >
                  돌아가기
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  출석부 서명
                </h1>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<FileCheck className="w-4 h-4" />}
                onClick={() => setSignatureModalVisible(true)}
              >
                {attendanceSheet.teacherSignature ? '서명 수정' : '서명하기'}
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* 교육 정보 */}
          <DetailSectionCard title="교육 정보" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">출석부 코드</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {attendanceSheet.attendanceId || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">프로그램명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {attendanceSheet.programName || education?.name || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {attendanceSheet.institutionName || education?.institution || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">학년</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {attendanceSheet.teacherInfo.grade}학년
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">반</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {attendanceSheet.teacherInfo.className}반
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육신청인원</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {attendanceSheet.students?.length || 0}명
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 이름</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {attendanceSheet.teacherInfo.teacherName || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 연락처</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                  {attendanceSheet.teacherInfo.teacherContact || '-'}
                </div>
              </div>
              {education && (
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육 기간</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {education.periodStart} ~ {education.periodEnd}
                  </div>
                </div>
              )}
            </div>
          </DetailSectionCard>

          {/* 회차별 수업 정보 */}
          {attendanceSheet.sessions && attendanceSheet.sessions.length > 0 && (
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
                  ...attendanceSheet.sessions.map((session, index) => ({
                    title: `${session.sessionNo}회차`,
                    key: `session${index + 1}`,
                    width: 200,
                    align: 'center' as const,
                    render: (_: any, record: any) => record[`session${index + 1}`],
                  })),
                ]}
                dataSource={sessionTableDataSource}
                pagination={false}
              />
            </DetailSectionCard>
          )}

          {/* 학생별 출석 정보 */}
          {attendanceSheet.students && attendanceSheet.students.length > 0 && (
            <DetailSectionCard title="학생별 출석 정보" className="mb-6">
              <Table
                columns={[
                  {
                    title: '출석번호',
                    dataIndex: 'no',
                    key: 'no',
                    width: 80,
                    align: 'center',
                    render: (no: number | string) => <span className="font-medium">{no}</span>,
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
                    render: (gender: '남' | '여' | undefined) => (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        gender === '남' ? 'bg-blue-100 text-blue-800' : gender === '여' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {gender || '-'}
                      </span>
                    ),
                  },
                  ...(attendanceSheet.sessions || []).map((session, index) => ({
                    title: `${session.sessionNo}회차`,
                    key: `session-${index}`,
                    align: 'center' as const,
                    width: 100,
                    render: (_: any, record: any) => {
                      const attendance = session.attendanceByStudent[record.id || String(record.no)]
                      return attendance !== undefined ? attendance : '-'
                    },
                  })),
                   {
                     title: '수료여부',
                     key: 'completion',
                     width: 100,
                     align: 'center',
                     render: (_: any, record: any) => {
                       return (
                         <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-base font-bold ${
                           record.completionStatus === 'O' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                         }`}>
                           {record.completionStatus || 'X'}
                         </span>
                       )
                     },
                   },
                 ]}
                 dataSource={studentsWithCompletion}
                 rowKey={(record: any, index?: number) => record.id || `student-${index ?? 0}`}
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
           {attendanceSheet && (
             <DetailSectionCard title="기관 연락처 및 서명" className="mb-6">
               <InstitutionContactAndSignatures
                 institutionContact={institutionContact}
                 signatures={signatures}
                 session1MainInstructorName={attendanceSheet.sessions?.[0]?.mainInstructor || ''}
                 session1AssistantInstructorName={attendanceSheet.sessions?.[0]?.assistantInstructor || ''}
                 session2MainInstructorName={attendanceSheet.sessions?.[1]?.mainInstructor || ''}
                 session2AssistantInstructorName={attendanceSheet.sessions?.[1]?.assistantInstructor || ''}
                 isEditMode={false}
                 onInstitutionContactChange={() => {}}
                 onSignatureApply={() => {}}
                 onSignatureDelete={() => {}}
               />
             </DetailSectionCard>
           )}
        </div>

        {/* 서명 모달 */}
        <Modal
          title="출석부 서명"
          open={signatureModalVisible}
          onOk={handleSignatureSubmit}
          onCancel={() => {
            setSignatureModalVisible(false)
          }}
          okText="서명하기"
          cancelText="취소"
        >
          {attendanceSheet && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">교육 정보</div>
                <div className="font-medium">{attendanceSheet.programName || education?.name}</div>
                <div className="text-sm text-gray-500">
                  {attendanceSheet.institutionName || education?.institution} - {attendanceSheet.teacherInfo.grade}학년 {attendanceSheet.teacherInfo.className}반
                </div>
              </div>

              <Form.Item label="서명 방식">
                <Select
                  value={signatureType}
                  onChange={setSignatureType}
                  options={[
                    { value: 'typed', label: '이름 입력' },
                    { value: 'image', label: '서명 이미지' },
                  ]}
                />
              </Form.Item>

              {signatureType === 'typed' ? (
                <Form.Item label="이름" required>
                  <Input
                    value={typedName}
                    onChange={(e) => setTypedName(e.target.value)}
                    placeholder="서명할 이름을 입력하세요"
                  />
                </Form.Item>
              ) : (
                <Form.Item label="서명 이미지">
                  {signatureImageUrl ? (
                    <div className="space-y-2">
                      <img
                        src={signatureImageUrl}
                        alt="서명"
                        className="max-w-[200px] max-h-[80px] object-contain border border-gray-300 rounded p-2"
                      />
                      <Button
                        size="small"
                        onClick={() => {
                          if (userProfile?.signatureImageUrl) {
                            setSignatureImageUrl(userProfile.signatureImageUrl)
                          }
                        }}
                      >
                        내 서명 사용
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      {userProfile?.signatureImageUrl ? (
                        <Button
                          onClick={() => setSignatureImageUrl(userProfile.signatureImageUrl || '')}
                        >
                          내 서명 이미지 사용
                        </Button>
                      ) : (
                        <span>서명 이미지가 없습니다. 이름 입력 방식을 사용하세요.</span>
                      )}
                    </div>
                  )}
                </Form.Item>
              )}

              <div className="text-xs text-gray-500">
                서명 후에는 수정할 수 있습니다. 확인 후 진행해주세요.
              </div>
            </div>
          )}
        </Modal>
      </div>
    </ProtectedRoute>
  )
}
