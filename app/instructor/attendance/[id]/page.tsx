'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Space, Table, message, Input, InputNumber, DatePicker, Card, Modal } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeft, Save, Edit, X, CheckCircle } from 'lucide-react'
import { Badge } from 'antd'
import { DetailPageHeaderSticky, DetailSectionCard } from '@/components/admin/operations'
import { getAttendanceDocByEducationId, getAttendanceDocById, getAttendanceDocs, upsertAttendanceDoc, type AttendanceDocument } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { InstitutionContactAndSignatures } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import type { InstitutionContact, AttendanceSignatures, Signature } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import { getActivityLogByEducationId } from '@/app/instructor/activity-logs/storage'
import { teacherEducationInfoStore, attendanceInfoRequestStore } from '@/lib/teacherStore'
import type { TeacherEducationInfo } from '@/lib/teacherStore'
import { useAuth } from '@/contexts/AuthContext'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function InstructorAttendanceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile, userRole } = useAuth()
  const id = params?.id as string
  const isAdmin = userRole === 'admin'

  const [doc, setDoc] = useState<AttendanceDocument | null>(null)
  const [loading, setLoading] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editedDoc, setEditedDoc] = useState<AttendanceDocument | null>(null)
  const [institutionContact, setInstitutionContact] = useState<InstitutionContact>({
    name: '',
    phone: '',
    email: '',
  })
  const [signatures, setSignatures] = useState<AttendanceSignatures>({})
  const [teacherEducationInfo, setTeacherEducationInfo] = useState<TeacherEducationInfo | null>(null)
  const [requestModalVisible, setRequestModalVisible] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')

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
        setEditedDoc({ ...attendanceDoc })
        setInstitutionContact(attendanceDoc.institutionContact || { name: '', phone: '', email: '' })
        setSignatures(attendanceDoc.signatures || {})
        
        // Load teacher education info
        const educationId = attendanceDoc.educationId || id
        const teacherInfo = teacherEducationInfoStore.getByEducationId(educationId)
        if (teacherInfo) {
          setTeacherEducationInfo(teacherInfo)
        }
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

  // Listen for teacher education info updates
  useEffect(() => {
    if (typeof window === 'undefined' || !doc) return

    const handleTeacherInfoUpdate = () => {
      const educationId = doc.educationId || id
      const teacherInfo = teacherEducationInfoStore.getByEducationId(educationId)
      setTeacherEducationInfo(teacherInfo)
    }

    window.addEventListener('teacherEducationInfoUpdated', handleTeacherInfoUpdate)
    return () => {
      window.removeEventListener('teacherEducationInfoUpdated', handleTeacherInfoUpdate)
    }
  }, [doc, id])

  // Request attendance info from teacher
  const handleRequestAttendanceInfo = () => {
    if (!doc) return
    
    const educationId = doc.educationId || id
    if (!educationId) return
    
    attendanceInfoRequestStore.create({
      educationId,
      requesterInstructorId: userProfile?.userId || 'instructor-1',
      requesterInstructorName: userProfile?.name || '강사',
      status: 'OPEN',
      message: requestMessage || '출석부 정보 입력을 요청드립니다.',
    })
    
    message.success('출석부 정보 요청이 전송되었습니다.')
    setRequestModalVisible(false)
    setRequestMessage('')
  }

  // Calculate completion status based on attendance rate (80% 이상이면 O, 미만이면 X)
  const calculateCompletionStatus = (attendedSessions: number, totalSessions: number): 'O' | 'X' => {
    if (totalSessions === 0) return 'X'
    const rate = (attendedSessions / totalSessions) * 100
    return rate >= 80 ? 'O' : 'X'
  }

  const handleEditClick = () => {
    if (doc) {
      setEditedDoc({ ...doc })
      setInstitutionContact(doc.institutionContact || { name: '', phone: '', email: '' })
      setSignatures(doc.signatures || {})
      setIsEditMode(true)
    }
  }

  const handleCancel = () => {
    if (doc) {
      setEditedDoc({ ...doc })
      setInstitutionContact(doc.institutionContact || { name: '', phone: '', email: '' })
      setSignatures(doc.signatures || {})
    }
    setIsEditMode(false)
  }

  const handleSave = async () => {
    if (!editedDoc) return

    try {
      setLoading(true)
      
      const docToSave: AttendanceDocument = {
        ...editedDoc,
        institutionContact: {
          name: institutionContact.name,
          phone: institutionContact.phone || '',
          email: institutionContact.email || '',
        },
        signatures,
        updatedAt: new Date().toISOString(),
      }
      
      const saveResult = upsertAttendanceDoc(docToSave)
      if (saveResult.success) {
        setDoc(docToSave)
        setEditedDoc(docToSave)
        setIsEditMode(false)
        message.success('출석 정보가 저장되었습니다.')
      } else {
        message.error(saveResult.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Save error:', error)
      message.error('저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleStudentAttendanceChange = (studentId: string, sessionIndex: number, value: number) => {
    if (!editedDoc) return
    
    setEditedDoc({
      ...editedDoc,
      students: editedDoc.students.map(student => {
        if (student.id === studentId && !student.isTransferred) {
          const newSessionAttendances = [...student.sessionAttendances]
          newSessionAttendances[sessionIndex] = value
          
          // Calculate completion status
          const totalAttended = newSessionAttendances.reduce((sum, val) => sum + val, 0)
          const totalSessions = editedDoc.totalSessions
          const completionStatus = calculateCompletionStatus(totalAttended, totalSessions)
          
          return {
            ...student,
            sessionAttendances: newSessionAttendances,
            completionStatus,
          }
        }
        return student
      }),
    })
  }

  const handleSessionDataChange = useCallback((field: string, sessionIndex: number, value: string | number) => {
    if (!editedDoc) return
    
    setEditedDoc({
      ...editedDoc,
      sessions: editedDoc.sessions.map((session, index) => {
        if (index === sessionIndex) {
          return {
            ...session,
            [field]: value,
          }
        }
        return session
      }),
    })
  }, [editedDoc])

  const handleInstitutionContactChange = (contact: InstitutionContact) => {
    setInstitutionContact(contact)
  }
  
  const handleSignatureApply = (role: 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor', signature: Signature) => {
    setSignatures(prev => ({
      ...prev,
      [role]: signature,
    }))
  }
  
  const handleSignatureDelete = (role: 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor') => {
    setSignatures(prev => {
      const updated = { ...prev }
      delete updated[role]
      return updated
    })
  }

  const currentDoc = isEditMode ? editedDoc : doc

  const getStatusBadge = () => {
    const statusMap = {
      DRAFT: { color: 'default', text: '초안' },
      SUBMITTED: { color: 'processing', text: '제출됨' },
      APPROVED: { color: 'success', text: '승인됨' },
      REJECTED: { color: 'error', text: '반려됨' },
    }
    const status = statusMap[currentDoc?.status || 'DRAFT']
    return <Badge status={status.color as any} text={status.text} />
  }

  if (!doc) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 flex items-center justify-center">
          <div>로딩 중...</div>
        </div>
      </ProtectedRoute>
    )
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
                {isEditMode ? (
                  <>
                    <Button onClick={handleCancel} icon={<X className="w-4 h-4" />}>
                      취소
                    </Button>
                    <Button
                      type="primary"
                      onClick={handleSave}
                      loading={loading}
                      icon={<Save className="w-4 h-4" />}
                    >
                      저장
                    </Button>
                  </>
                ) : (
                  <Button
                    type="primary"
                    onClick={handleEditClick}
                    icon={<Edit className="w-4 h-4" />}
                    disabled={doc?.status === 'APPROVED'}
                  >
                    수정하기
                  </Button>
                )}
              </Space>
            </div>
          </div>
        </div>

        {/* Status banner */}
        {currentDoc && currentDoc.status === 'SUBMITTED' && (
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

        {currentDoc && currentDoc.status === 'REJECTED' && currentDoc.rejectReason && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-900 dark:text-red-100">
                  반려됨: {currentDoc.rejectReason}
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

          {/* Request Info Button */}
          {!teacherEducationInfo && !isAdmin && (
            <Card className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-yellow-900 dark:text-yellow-100">
                    학교 선생님의 교육 정보가 아직 입력되지 않았습니다.
                  </span>
                </div>
                <Button
                  type="primary"
                  onClick={() => setRequestModalVisible(true)}
                >
                  출석부 정보 요청
                </Button>
              </div>
            </Card>
          )}

          {/* 교육 정보 */}
          {currentDoc && (
            <DetailSectionCard title="교육 정보" className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">출석부 코드</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                    {currentDoc.id || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">프로그램명</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">{currentDoc.programName || '-'}</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                    {currentDoc.institution || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">학년</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {(() => {
                      const match = currentDoc.gradeClass?.match(/(\d+)학년/)
                      return match ? `${match[1]}학년` : '-'
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">반</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {(() => {
                      const match = currentDoc.gradeClass?.match(/(\d+)반/)
                      return match ? `${match[1]}반` : '-'
                    })()}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육신청인원</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                    {currentDoc.students.length}명
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 이름</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {currentDoc.schoolContactName || currentDoc.institutionContact?.name || '-'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 연락처</div>
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {currentDoc.institutionContact?.phone || '-'}
                  </div>
                </div>
              </div>
            </DetailSectionCard>
          )}

          {/* 회차별 수업 정보 */}
          {currentDoc?.sessions && currentDoc.sessions.length > 0 && (
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
                  ...currentDoc.sessions.map((session, index) => ({
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
                    ...currentDoc.sessions.reduce((acc, session, index) => {
                      if (isEditMode) {
                        acc[`session${index + 1}`] = (
                          <div className="space-y-2">
                            <DatePicker
                              value={dayjs(session.date, 'YYYY-MM-DD').isValid() ? dayjs(session.date, 'YYYY-MM-DD') : dayjs(session.date)}
                              onChange={(date) => {
                                if (date) {
                                  handleSessionDataChange('date', index, date.format('YYYY-MM-DD'))
                                }
                              }}
                              format="YYYY-MM-DD"
                              className="w-full"
                              placeholder="날짜 선택"
                            />
                            <div className="flex gap-1 items-center">
                              <Input
                                value={session.startTime}
                                onChange={(e) => handleSessionDataChange('startTime', index, e.target.value)}
                                className="w-full"
                                placeholder="시작시간"
                              />
                              <span>~</span>
                              <Input
                                value={session.endTime}
                                onChange={(e) => handleSessionDataChange('endTime', index, e.target.value)}
                                className="w-full"
                                placeholder="종료시간"
                              />
                            </div>
                          </div>
                        )
                      } else {
                        const normalizedDate = session.date.replace(/\./g, '-')
                        const d = dayjs(normalizedDate)
                        const weekdays = ['일', '월', '화', '수', '목', '금', '토']
                        const dateStr = d.isValid() 
                          ? `${d.month() + 1}.${d.date()}(${weekdays[d.day()]})`
                          : session.date
                        acc[`session${index + 1}`] = `${dateStr}, ${session.startTime} ~ ${session.endTime}`
                      }
                      return acc
                    }, {} as Record<string, any>),
                  },
                  {
                    key: 'instructorType',
                    label: '참여강사',
                    subLabel: '강사구분',
                    ...currentDoc.sessions.reduce((acc, session, index) => {
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
                    ...currentDoc.sessions.reduce((acc, session, index) => {
                      if (isEditMode) {
                        acc[`session${index + 1}`] = (
                          <div className="space-y-2">
                            <Input
                              value={session.mainInstructor}
                              onChange={(e) => handleSessionDataChange('mainInstructor', index, e.target.value)}
                              className="w-full"
                              placeholder="주강사 이름"
                            />
                            <Input
                              value={session.assistantInstructor}
                              onChange={(e) => handleSessionDataChange('assistantInstructor', index, e.target.value)}
                              className="w-full"
                              placeholder="보조강사 이름"
                            />
                          </div>
                        )
                      } else {
                        acc[`session${index + 1}`] = (
                          <div className="space-y-2">
                            <div className="text-sm">{session.mainInstructor || '-'}</div>
                            <div className="text-sm">{session.assistantInstructor || '-'}</div>
                          </div>
                        )
                      }
                      return acc
                    }, {} as Record<string, any>),
                  },
                  {
                    key: 'sessions',
                    label: '차시',
                    ...currentDoc.sessions.reduce((acc, session, index) => {
                      if (isEditMode) {
                        acc[`session${index + 1}`] = (
                          <InputNumber
                            min={0}
                            max={10}
                            value={session.sessions}
                            onChange={(val) => handleSessionDataChange('sessions', index, val || 0)}
                            className="w-full"
                          />
                        )
                      } else {
                        acc[`session${index + 1}`] = session.sessions
                      }
                      return acc
                    }, {} as Record<string, any>),
                  },
                  {
                    key: 'studentCount',
                    label: '학생정원',
                    ...currentDoc.sessions.reduce((acc, session, index) => {
                      if (isEditMode) {
                        acc[`session${index + 1}`] = (
                          <InputNumber
                            min={0}
                            value={session.studentCount}
                            onChange={(val) => handleSessionDataChange('studentCount', index, val || 0)}
                            className="w-full"
                          />
                        )
                      } else {
                        acc[`session${index + 1}`] = session.studentCount
                      }
                      return acc
                    }, {} as Record<string, any>),
                  },
                  {
                    key: 'attendanceCount',
                    label: '출석인원',
                    ...currentDoc.sessions.reduce((acc, session, index) => {
                      if (isEditMode) {
                        acc[`session${index + 1}`] = (
                          <InputNumber
                            min={0}
                            value={session.attendanceCount}
                            onChange={(val) => handleSessionDataChange('attendanceCount', index, val || 0)}
                            className="w-full"
                          />
                        )
                      } else {
                        acc[`session${index + 1}`] = session.attendanceCount
                      }
                      return acc
                    }, {} as Record<string, any>),
                  },
                ]}
                pagination={false}
              />
            </DetailSectionCard>
          )}

          {/* 학생별 출석 정보 */}
          {currentDoc?.students && currentDoc.students.length > 0 && (
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
                  ...(currentDoc.sessions || []).map((session, index) => ({
                    title: `${session.sessionNumber}회차`,
                    key: `session-${index}`,
                    align: 'center' as const,
                    width: 120,
                    render: (_: any, record: any) => {
                      const value = record.sessionAttendances[index] || 0
                      if (record.isTransferred) {
                        return <span className="text-sm text-gray-400">-</span>
                      }
                      return isEditMode ? (
                        <InputNumber
                          min={0}
                          max={4}
                          value={value}
                          onChange={(val) => handleStudentAttendanceChange(record.id, index, val || 0)}
                          className="w-full"
                          disabled={record.isTransferred}
                        />
                      ) : (
                        <span className="text-sm font-medium">{value}</span>
                      )
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
                dataSource={currentDoc.students}
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
          {currentDoc && (
            <DetailSectionCard title="기관 연락처 및 서명" className="mb-6">
              <InstitutionContactAndSignatures
                institutionContact={institutionContact}
                signatures={signatures}
                session1MainInstructorName={currentDoc.sessions[0]?.mainInstructor || ''}
                session1AssistantInstructorName={currentDoc.sessions[0]?.assistantInstructor || ''}
                session2MainInstructorName={currentDoc.sessions[1]?.mainInstructor || ''}
                session2AssistantInstructorName={currentDoc.sessions[1]?.assistantInstructor || ''}
                isEditMode={isEditMode}
                onInstitutionContactChange={handleInstitutionContactChange}
                onSignatureApply={handleSignatureApply}
                onSignatureDelete={handleSignatureDelete}
              />
            </DetailSectionCard>
          )}

          {/* 활동 일지 이동 */}
          {!isEditMode && doc && (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm mb-6">
              <div className="space-y-4">
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
          )}

          {/* Request Info Modal */}
          <Modal
            title="출석부 정보 요청"
            open={requestModalVisible}
            onOk={handleRequestAttendanceInfo}
            onCancel={() => {
              setRequestModalVisible(false)
              setRequestMessage('')
            }}
            okText="요청 전송"
            cancelText="취소"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                학교 선생님에게 출석부 정보 입력을 요청합니다.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  요청 메시지 (선택)
                </label>
                <TextArea
                  rows={4}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="요청 메시지를 입력하세요 (선택사항)"
                />
              </div>
            </div>
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  )
}
