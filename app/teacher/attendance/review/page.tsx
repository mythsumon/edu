'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Table, Space, message, Tag, Modal, Form, Input, Upload } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FileCheck, Send, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dataStore } from '@/lib/dataStore'
import { attendanceSheetStore, type AttendanceSheet } from '@/lib/attendanceSheetStore'
import { DetailSectionCard } from '@/components/admin/operations'
import { InstitutionContactAndSignatures } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import type { InstitutionContact, AttendanceSignatures } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import dayjs from 'dayjs'

const { TextArea } = Input

type AttendanceSheetWithEducation = AttendanceSheet & { education: NonNullable<ReturnType<typeof dataStore.getEducationById>> }

export default function ReviewAndSignPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [form] = Form.useForm()
  const [sheets, setSheets] = useState<AttendanceSheetWithEducation[]>([])
  const [loading, setLoading] = useState(false)
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [selectedSheet, setSelectedSheet] = useState<AttendanceSheetWithEducation | null>(null)
  const [signatureType, setSignatureType] = useState<'typed' | 'image'>('typed')
  const [typedName, setTypedName] = useState('')

  const currentTeacherId = userProfile?.userId || 'teacher-1'
  const currentInstitutionId = 'INST-001' // TODO: Get from teacher profile

  const loadSheets = () => {
    setLoading(true)
    try {
      // Force initialization if needed
      const allSheets = attendanceSheetStore.getAll()
      console.log('All attendance sheets:', allSheets.length)
      
      const byInstitution = attendanceSheetStore.getByInstitutionId(currentInstitutionId)
      console.log('Sheets for institution:', byInstitution.length, 'institutionId:', currentInstitutionId)
      
      // Filter for RETURNED_TO_TEACHER status
      const returnedSheets = byInstitution.filter(sheet => sheet.status === 'RETURNED_TO_TEACHER')
      console.log('RETURNED_TO_TEACHER sheets:', returnedSheets.length)
      
      // Enrich with education data
      const enriched = returnedSheets
        .map(sheet => {
          const education = dataStore.getEducationById(sheet.educationId)
          if (!education) {
            console.warn(`Education not found for ${sheet.educationId}`)
            return null
          }
          return {
            ...sheet,
            education,
          }
        })
        .filter((item): item is AttendanceSheetWithEducation => item !== null && item.education !== undefined)

      console.log('Enriched sheets:', enriched.length)
      setSheets(enriched)
    } catch (error) {
      console.error('Error loading attendance sheets:', error)
      message.error('출석부 목록을 불러오는 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Force initialization on mount
    if (typeof window !== 'undefined') {
      // Ensure dummy data is loaded
      attendanceSheetStore.getAll()
    }
    
    loadSheets()

    const handleUpdate = () => {
      loadSheets()
    }

    window.addEventListener('attendanceSheetUpdated', handleUpdate)
    window.addEventListener('attendanceSheetStatusChanged', handleUpdate)

    return () => {
      window.removeEventListener('attendanceSheetUpdated', handleUpdate)
      window.removeEventListener('attendanceSheetStatusChanged', handleUpdate)
    }
  }, [currentInstitutionId])

  const handleReview = (sheet: AttendanceSheetWithEducation) => {
    setSelectedSheet(sheet)
    setReviewModalVisible(true)
    setTypedName(sheet.teacherInfo.teacherName || userProfile?.name || '')
    form.setFieldsValue({
      comment: '',
    })
  }

  const handleFinalSend = async () => {
    if (!selectedSheet) return

    if (signatureType === 'typed' && !typedName.trim()) {
      message.warning('서명할 이름을 입력해주세요.')
      return
    }

    const signature = {
      method: signatureType === 'typed' ? 'TYPED' as const : 'PNG' as const,
      signedBy: typedName || userProfile?.name || 'Teacher',
      signedAt: new Date().toISOString(),
      signatureRef: signatureType === 'typed' ? typedName : undefined, // TODO: Handle image upload
    }

    const comment = form.getFieldValue('comment')

    const actor = {
      role: 'teacher' as const,
      id: currentTeacherId,
      name: userProfile?.name || 'Teacher',
    }

    const updated = attendanceSheetStore.addTeacherSignature(
      selectedSheet.attendanceId,
      signature,
      actor,
      comment
    )

    if (updated) {
      message.success('출석부가 강사에게 최종 전송되었습니다.')
      setReviewModalVisible(false)
      setSelectedSheet(null)
      loadSheets()
    } else {
      message.error('전송에 실패했습니다.')
    }
  }

  const columns: ColumnsType<AttendanceSheetWithEducation> = [
    {
      title: '프로그램명',
      dataIndex: ['education', 'name'],
      key: 'programName',
      render: (text, record) => record.education?.name || record.programName || '-',
    },
    {
      title: '기관명',
      dataIndex: 'institutionName',
      key: 'institutionName',
    },
    {
      title: '학년/반',
      key: 'gradeClass',
      render: (_, record) => {
        const { grade, className } = record.teacherInfo
        return grade && className ? `${grade}학년 ${className}반` : '-'
      },
    },
    {
      title: '학생 수',
      key: 'studentCount',
      render: (_, record) => record.students?.length || 0,
    },
    {
      title: '반환일',
      dataIndex: 'updatedAt',
      key: 'returnedAt',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<Eye />}
          onClick={() => handleReview(record)}
        >
          검토 및 서명
        </Button>
      ),
    },
  ]

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  검토 및 서명
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  강사가 반환한 출석부를 검토하고 서명한 후 최종 전송하세요.
                </p>
              </div>
              {process.env.NODE_ENV === 'development' && (
                <Button
                  size="small"
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('attendance_sheets')
                      attendanceSheetStore.getAll()
                      loadSheets()
                      message.success('데이터가 초기화되었습니다.')
                    }
                  }}
                >
                  데이터 초기화 (개발용)
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          <Card className="rounded-xl">
            <Table
              columns={columns}
              dataSource={sheets}
              rowKey="attendanceId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}개`,
              }}
              locale={{
                emptyText: '검토할 출석부가 없습니다.',
              }}
            />
          </Card>

          {/* Review Modal - 강사 출석부 레이아웃과 동일한 읽기 전용 버전 */}
          <Modal
            title="출석부 검토 및 서명"
            open={reviewModalVisible}
            onCancel={() => {
              setReviewModalVisible(false)
              setSelectedSheet(null)
            }}
            footer={null}
            width={1200}
            style={{ top: 20 }}
          >
            {selectedSheet && (
              <div className="space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
                {/* SECTION 1: 교육 정보 */}
                <DetailSectionCard title="교육 정보">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">출석부 코드</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                        {selectedSheet.attendanceId || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">프로그램명</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {selectedSheet.programName || selectedSheet.education?.name || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                        {selectedSheet.institutionName || selectedSheet.education?.institution || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">학년</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {selectedSheet.teacherInfo.grade || '-'}학년
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">반</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {selectedSheet.teacherInfo.className || '-'}반
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육신청인원</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                        {selectedSheet.students?.length || 0}명
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 이름</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {selectedSheet.teacherInfo.teacherName || '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 연락처</div>
                      <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                        {selectedSheet.teacherInfo.teacherContact || '-'}
                      </div>
                    </div>
                  </div>
                </DetailSectionCard>

                {/* SECTION 2: 회차별 수업 정보 */}
                {selectedSheet.sessions && selectedSheet.sessions.length > 0 && (
                  <DetailSectionCard title="회차별 수업 정보">
                    <Table
                      columns={[
                        {
                          title: '구분',
                          dataIndex: 'label',
                          key: 'label',
                          width: 120,
                        },
                        ...selectedSheet.sessions.map((session, index) => ({
                          title: `${session.sessionNo}회차`,
                          key: `session${index}`,
                          width: 200,
                          align: 'center' as const,
                          render: (_: any, record: any) => record[`session${index + 1}`],
                        })),
                      ]}
                      dataSource={[
                        {
                          key: 'date',
                          label: '수업일자',
                          ...selectedSheet.sessions.reduce((acc, session, idx) => {
                            acc[`session${idx + 1}`] = dayjs(session.date).format('YYYY-MM-DD')
                            return acc
                          }, {} as Record<string, any>),
                        },
                        {
                          key: 'time',
                          label: '수업시간',
                          ...selectedSheet.sessions.reduce((acc, session, idx) => {
                            acc[`session${idx + 1}`] = `${session.startTime || ''} ~ ${session.endTime || ''}`
                            return acc
                          }, {} as Record<string, any>),
                        },
                        {
                          key: 'mainInstructor',
                          label: '주강사',
                          ...selectedSheet.sessions.reduce((acc, session, idx) => {
                            acc[`session${idx + 1}`] = session.mainInstructor || '-'
                            return acc
                          }, {} as Record<string, any>),
                        },
                        {
                          key: 'assistantInstructor',
                          label: '보조강사',
                          ...selectedSheet.sessions.reduce((acc, session, idx) => {
                            acc[`session${idx + 1}`] = session.assistantInstructor || '-'
                            return acc
                          }, {} as Record<string, any>),
                        },
                      ]}
                      rowKey="key"
                      pagination={false}
                      size="small"
                    />
                  </DetailSectionCard>
                )}

                {/* SECTION 3: 기관 연락처 및 서명 (읽기 전용) */}
                <div>
                  <InstitutionContactAndSignatures
                    institutionContact={{
                      name: selectedSheet.teacherInfo.teacherName || '',
                      phone: selectedSheet.teacherInfo.teacherContact || '',
                    }}
                    signatures={{
                      school: selectedSheet.teacherSignature ? {
                        signedByUserId: 'teacher',
                        signedByUserName: selectedSheet.teacherSignature.signedBy || '',
                        signedAt: selectedSheet.teacherSignature.signedAt || '',
                        signatureImageUrl: selectedSheet.teacherSignature.signatureRef || '',
                      } : undefined,
                      session1MainInstructor: selectedSheet.sessions?.[0]?.instructorSignature ? {
                        signedByUserId: 'instructor',
                        signedByUserName: selectedSheet.sessions[0].instructorSignature.signedBy || '',
                        signedAt: selectedSheet.sessions[0].instructorSignature.signedAt || '',
                        signatureImageUrl: selectedSheet.sessions[0].instructorSignature.signatureRef || '',
                      } : undefined,
                    }}
                    session1MainInstructorName={selectedSheet.sessions?.[0]?.mainInstructor || ''}
                    session1AssistantInstructorName={selectedSheet.sessions?.[0]?.assistantInstructor || ''}
                    session2MainInstructorName={selectedSheet.sessions?.[1]?.mainInstructor || ''}
                    session2AssistantInstructorName={selectedSheet.sessions?.[1]?.assistantInstructor || ''}
                    isEditMode={false}
                    onInstitutionContactChange={() => {}}
                    onSignatureApply={() => {}}
                    onSignatureDelete={() => {}}
                  />
                </div>

                {/* SECTION 4: 학생별 출석 현황 */}
                {selectedSheet.students && selectedSheet.students.length > 0 && (
                  <DetailSectionCard title="학생별 출석 현황">
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>※ 수료기준 :</strong> 학생 당 출석률 80% 이상
                      </p>
                    </div>
                    <Table
                      columns={[
                        {
                          title: '출석번호',
                          dataIndex: 'no',
                          key: 'no',
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
                        ...(selectedSheet.sessions || []).map((session, index) => ({
                          title: `${session.sessionNo}회차`,
                          key: `session-${index}`,
                          align: 'center' as const,
                          width: 120,
                          render: (_: any, record: any) => {
                            const attendance = session.attendanceByStudent?.[record.id] || 0
                            return <span className="text-sm font-medium">{attendance}</span>
                          },
                        })),
                        {
                          title: '수료여부',
                          key: 'completion',
                          align: 'center',
                          width: 100,
                          render: (_: any, record: any) => {
                            const totalSessions = selectedSheet.sessions?.length || 0
                            const attendedSessions = selectedSheet.sessions?.filter(s => 
                              (s.attendanceByStudent?.[record.id] || 0) > 0
                            ).length || 0
                            const rate = totalSessions > 0 ? (attendedSessions / totalSessions) * 100 : 0
                            const completionStatus = rate >= 80 ? 'O' : 'X'
                            return (
                              <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-base font-bold ${
                                completionStatus === 'O' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}>
                                {completionStatus}
                              </span>
                            )
                          },
                        },
                      ]}
                      dataSource={selectedSheet.students}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                  </DetailSectionCard>
                )}

                {/* 서명 섹션 */}
                <DetailSectionCard title="서명">
                  <Space direction="vertical" className="w-full">
                    <Space>
                      <Button
                        type={signatureType === 'typed' ? 'primary' : 'default'}
                        onClick={() => setSignatureType('typed')}
                      >
                        이름 입력
                      </Button>
                      <Button
                        type={signatureType === 'image' ? 'primary' : 'default'}
                        onClick={() => setSignatureType('image')}
                      >
                        이미지 업로드
                      </Button>
                    </Space>
                    {signatureType === 'typed' ? (
                      <Input
                        placeholder="서명할 이름"
                        value={typedName}
                        onChange={(e) => setTypedName(e.target.value)}
                      />
                    ) : (
                      <Upload
                        accept="image/*"
                        beforeUpload={() => false}
                        // TODO: Handle image upload
                      >
                        <Button>이미지 선택</Button>
                      </Upload>
                    )}
                  </Space>
                </DetailSectionCard>

                {/* Comment */}
                <Form form={form}>
                  <Form.Item label="비고 (선택)" name="comment">
                    <TextArea rows={3} placeholder="비고를 입력하세요 (선택사항)" />
                  </Form.Item>
                </Form>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button onClick={() => setReviewModalVisible(false)}>
                    취소
                  </Button>
                  <Button
                    type="primary"
                    icon={<Send />}
                    onClick={handleFinalSend}
                    disabled={signatureType === 'typed' && !typedName.trim()}
                  >
                    최종 전송
                  </Button>
                </div>
              </div>
            )}
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  )
}
