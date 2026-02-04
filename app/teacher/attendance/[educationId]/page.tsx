'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Input, Form, Table, Space, message, Modal, InputNumber, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeft, Save, Plus, Trash2, Send, UserPlus, FileCheck } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dataStore } from '@/lib/dataStore'
import { attendanceSheetStore, type AttendanceSheet } from '@/lib/attendanceSheetStore'
import { teacherEducationInfoStore } from '@/lib/teacherStore'
import { getProgramSessionByValue } from '@/lib/commonCodeStore'
import { DetailSectionCard } from '@/components/admin/operations'
import dayjs from 'dayjs'

const { TextArea } = Input

interface Student {
  no: number | string
  name: string
  gender?: '남' | '여'
  id?: string
}

export default function TeacherAttendancePage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const [form] = Form.useForm()
  
  const educationId = params?.educationId as string
  const currentTeacherId = userProfile?.userId || 'teacher-1'
  const currentInstitutionId = 'INST-001' // TODO: Get from teacher profile
  const currentInstitutionName = '평택안일초등학교' // TODO: Get from teacher profile
  
  const [education, setEducation] = useState<any>(null)
  const [attendanceSheet, setAttendanceSheet] = useState<AttendanceSheet | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [isEditMode, setIsEditMode] = useState(false)

  // Get program options
  const getProgramOptions = (): Array<{ value: string; label: string }> => {
    if (typeof window === 'undefined') return []
    
    try {
      const stored = localStorage.getItem('programs')
      if (stored) {
        const programs = JSON.parse(stored)
        return programs
          .filter((p: any) => p.status === '활성' || p.status === '대기')
          .map((p: any) => {
            let sessionLabel = ''
            if (p.sessionValue) {
              const sessionKey = getProgramSessionByValue(p.sessionValue)
              sessionLabel = sessionKey ? sessionKey.label : ''
            }
            
            const programName = p.programDisplayName || p.name || ''
            const displayLabel = sessionLabel 
              ? `${sessionLabel} ${programName}`
              : programName
            
            return {
              value: p.programId || p.key,
              label: displayLabel,
            }
          })
      }
    } catch (e) {
      console.warn('Failed to load programs from localStorage', e)
    }
    
    // Fallback dummy data
    return [
      { value: 'PROG-2025-001', label: '8차시 도서벽지 프로그램' },
      { value: 'PROG-2025-002', label: '50차시 프로그램' },
      { value: 'PROG-2025-003', label: '16차시 특수학급 프로그램' },
      { value: 'PROG-2025-004', label: '4차시 온라인 교육 프로그램' },
    ]
  }

  const programOptions = useMemo(() => getProgramOptions(), [])

  useEffect(() => {
    loadData()
    
    // Listen for updates
    const handleUpdate = () => {
      loadData()
    }
    
    window.addEventListener('attendanceSheetUpdated', handleUpdate)
    
    return () => {
      window.removeEventListener('attendanceSheetUpdated', handleUpdate)
    }
  }, [educationId])

  const loadData = () => {
    // Load education
    const edu = dataStore.getEducationById(educationId)
    setEducation(edu || null)
    
    // Load or create attendance sheet
    let sheet = attendanceSheetStore.getByEducationId(educationId)
    if (!sheet && edu) {
      // Create new sheet if doesn't exist
      const gradeClass = edu.gradeClass || ''
      const [grade, className] = gradeClass.split('학년').map(s => s.trim())
      sheet = attendanceSheetStore.create(
        educationId, 
        currentInstitutionId, 
        {
          grade: grade || '',
          className: className?.replace('반', '').trim() || '',
          teacherName: userProfile?.name || '',
          teacherContact: '',
        },
        {
          role: 'teacher',
          id: userProfile?.userId || 'teacher-1',
          name: userProfile?.name || 'Teacher',
        }
      )
    }
    
    if (sheet) {
      setAttendanceSheet(sheet)
      setStudents(sheet.students || [])
      
      // Get institution name from education data
      const autoInstitutionName = edu?.institution || currentInstitutionName
      
      form.setFieldsValue({
        attendanceCode: sheet.attendanceId,
        programName: sheet.programName || edu?.programTitle || '',
        institutionName: autoInstitutionName, // Auto-filled from education
        grade: sheet.teacherInfo.grade,
        className: sheet.teacherInfo.className,
        teacherName: sheet.teacherInfo.teacherName,
        teacherContact: sheet.teacherInfo.teacherContact || '',
        totalApplicants: sheet.students?.length || 0,
      })
      
      // Update sheet with auto institution name if not set
      if (!sheet.institutionName && autoInstitutionName) {
        const updatedSheet = {
          ...sheet,
          institutionName: autoInstitutionName,
        }
        attendanceSheetStore.upsert(updatedSheet)
        setAttendanceSheet(updatedSheet)
      }
      
      // Check if teacher can edit (only in TEACHER_DRAFT or REJECTED states)
      setIsEditMode(sheet.status === 'TEACHER_DRAFT' || sheet.status === 'REJECTED')
    }
  }

  const handleSave = () => {
    if (!attendanceSheet || !education) return
    
    const values = form.getFieldsValue()
    
    // Validate students
    if (students.length === 0) {
      message.warning('학생 명단을 입력해주세요.')
      return
    }
    
    const hasEmptyStudent = students.some(s => !s.name || s.name.trim() === '')
    if (hasEmptyStudent) {
      message.warning('모든 학생의 이름을 입력해주세요.')
      return
    }
    
    // Update attendance sheet
    const updated: AttendanceSheet = {
      ...attendanceSheet,
      programName: values.programName || '',
      institutionName: values.institutionName || '',
      teacherInfo: {
        grade: values.grade,
        className: values.className,
        teacherName: values.teacherName,
        teacherContact: values.teacherContact || '',
      },
      students: students.map((s, idx) => ({
        no: s.no,
        name: s.name.trim(),
        gender: s.gender || '남',
        id: s.id || `student-${idx}`,
      })),
      updatedBy: currentTeacherId,
    }
    
    attendanceSheetStore.upsert(updated)
    setAttendanceSheet(updated)
    setIsEditMode(false)
    message.success('출석부 정보가 저장되었습니다.')
  }


  const handleAddStudent = () => {
    const newNo = students.length > 0 
      ? Math.max(...students.map(s => typeof s.no === 'number' ? s.no : parseInt(String(s.no)) || 0)) + 1 
      : 1
    const updatedStudents = [...students, { no: newNo, name: '', gender: '남' as const }]
    setStudents(updatedStudents)
    // Update total applicants count
    form.setFieldsValue({ totalApplicants: updatedStudents.length })
  }

  const handleRemoveStudent = (index: number) => {
    const updatedStudents = students.filter((_, i) => i !== index)
    setStudents(updatedStudents)
    // Update total applicants count
    form.setFieldsValue({ totalApplicants: updatedStudents.length })
  }

  const handleStudentChange = (index: number, field: 'no' | 'name' | 'gender', value: string | number) => {
    const updated = [...students]
    updated[index] = { ...updated[index], [field]: value }
    setStudents(updated)
    // Update total applicants count when student is added/removed
    if (field === 'name' && value) {
      form.setFieldsValue({ totalApplicants: updated.length })
    }
  }

  const studentColumns: ColumnsType<Student> = [
    {
      title: '출석번호',
      dataIndex: 'no',
      key: 'no',
      width: 100,
      render: (no: number | string, _, index) => (
        isEditMode ? (
          <InputNumber
            min={1}
            value={typeof no === 'number' ? no : parseInt(String(no)) || 1}
            onChange={(val) => handleStudentChange(index, 'no', val || 1)}
            className="w-full"
          />
        ) : (
          <span className="font-medium">{no}</span>
        )
      ),
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, _, index) => (
        isEditMode ? (
          <Input
            value={name}
            onChange={(e) => handleStudentChange(index, 'name', e.target.value)}
            placeholder="학생 이름"
          />
        ) : (
          <span>{name || '-'}</span>
        )
      ),
    },
    {
      title: '성별',
      dataIndex: 'gender',
      key: 'gender',
      width: 100,
      render: (gender: '남' | '여' | undefined, _, index) => (
        isEditMode ? (
          <Select
            value={gender || '남'}
            onChange={(val) => handleStudentChange(index, 'gender', val)}
            options={[
              { value: '남', label: '남' },
              { value: '여', label: '여' },
            ]}
            className="w-full"
          />
        ) : (
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
            gender === '남' ? 'bg-blue-100 text-blue-800' : gender === '여' ? 'bg-pink-100 text-pink-800' : 'bg-gray-100 text-gray-800'
          }`}>
            {gender || '-'}
          </span>
        )
      ),
    },
    ...(isEditMode ? [{
      title: '작업',
      key: 'action',
      width: 80,
      render: (_: any, __: any, index: number) => (
        <Button
          size="small"
          danger
          icon={<Trash2 className="w-3 h-3" />}
          onClick={() => handleRemoveStudent(index)}
        />
      ),
    }] : []),
  ]

  const canEdit = attendanceSheet?.status === 'TEACHER_DRAFT' || attendanceSheet?.status === 'REJECTED'

  if (!education) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">교육 정보를 찾을 수 없습니다.</p>
              <p className="text-sm text-gray-400 mb-4">교육ID: {educationId}</p>
              <Button onClick={() => router.push('/teacher/classes')}>
                목록으로 돌아가기
              </Button>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  if (!attendanceSheet) {
    return (
      <ProtectedRoute requiredRole="teacher">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">출석부 정보를 불러올 수 없습니다.</p>
              <p className="text-sm text-gray-400 mb-4">교육ID: {educationId}</p>
              <Button onClick={() => router.push('/teacher/classes')}>
                목록으로 돌아가기
              </Button>
            </div>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

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
                  onClick={() => router.push('/teacher/classes')}
                  className="flex items-center dark:text-gray-300"
                >
                  돌아가기
                </Button>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  출석부 작성
                </h1>
              </div>
              <Space>
                {!isEditMode ? (
                  canEdit && (
                    <Button
                      type="primary"
                      onClick={() => setIsEditMode(true)}
                    >
                      수정하기
                    </Button>
                  )
                ) : (
                  <>
                    <Button onClick={() => {
                      setIsEditMode(false)
                      loadData()
                    }} className="dark:text-gray-300">
                      취소
                    </Button>
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={handleSave}
                    >
                      저장하기
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* SECTION 1: Header (교육 정보) */}
          <DetailSectionCard title="교육 정보" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">출석부 코드</div>
                {isEditMode ? (
                  <Input
                    value={attendanceSheet?.attendanceId || ''}
                    disabled
                    className="w-full bg-gray-50"
                    placeholder="자동 생성"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                    {attendanceSheet?.attendanceId || '-'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">프로그램명</div>
                {isEditMode ? (
                  <Select
                    value={form.getFieldValue('programName')}
                    onChange={(value) => {
                      form.setFieldsValue({ programName: value })
                      if (attendanceSheet) {
                        const selected = programOptions.find(p => p.value === value)
                        const updated = { ...attendanceSheet, programName: selected?.label || value }
                        attendanceSheetStore.upsert(updated)
                        setAttendanceSheet(updated)
                      }
                    }}
                    options={programOptions}
                    placeholder="프로그램명을 선택하세요"
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {attendanceSheet?.programName || form.getFieldValue('programName') || '-'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                {isEditMode ? (
                  <Input
                    value={form.getFieldValue('institutionName')}
                    disabled
                    className="w-full bg-gray-50"
                    placeholder="교육 정보에서 자동으로 가져옵니다"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                    {attendanceSheet?.institutionName || form.getFieldValue('institutionName') || '-'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">학년</div>
                {isEditMode ? (
                  <Input
                    value={form.getFieldValue('grade')}
                    onChange={(e) => {
                      form.setFieldsValue({ grade: e.target.value })
                      if (attendanceSheet) {
                        const updated = {
                          ...attendanceSheet,
                          teacherInfo: {
                            ...attendanceSheet.teacherInfo,
                            grade: e.target.value,
                          }
                        }
                        attendanceSheetStore.upsert(updated)
                        setAttendanceSheet(updated)
                      }
                    }}
                    placeholder="예: 5"
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {attendanceSheet?.teacherInfo?.grade || form.getFieldValue('grade') || '-'}학년
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">반</div>
                {isEditMode ? (
                  <Input
                    value={form.getFieldValue('className')}
                    onChange={(e) => {
                      form.setFieldsValue({ className: e.target.value })
                      if (attendanceSheet) {
                        const updated = {
                          ...attendanceSheet,
                          teacherInfo: {
                            ...attendanceSheet.teacherInfo,
                            className: e.target.value,
                          }
                        }
                        attendanceSheetStore.upsert(updated)
                        setAttendanceSheet(updated)
                      }
                    }}
                    placeholder="예: 6"
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {attendanceSheet?.teacherInfo?.className || form.getFieldValue('className') || '-'}반
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육신청인원</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {students.length}명
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 이름</div>
                {isEditMode ? (
                  <Input
                    value={form.getFieldValue('teacherName')}
                    onChange={(e) => {
                      form.setFieldsValue({ teacherName: e.target.value })
                      if (attendanceSheet) {
                        const updated = {
                          ...attendanceSheet,
                          teacherInfo: {
                            ...attendanceSheet.teacherInfo,
                            teacherName: e.target.value,
                          }
                        }
                        attendanceSheetStore.upsert(updated)
                        setAttendanceSheet(updated)
                      }
                    }}
                    placeholder="담임 선생님 이름"
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {attendanceSheet?.teacherInfo?.teacherName || form.getFieldValue('teacherName') || '-'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 연락처</div>
                {isEditMode ? (
                  <Input
                    value={form.getFieldValue('teacherContact')}
                    onChange={(e) => {
                      form.setFieldsValue({ teacherContact: e.target.value })
                      if (attendanceSheet) {
                        const updated = {
                          ...attendanceSheet,
                          teacherInfo: {
                            ...attendanceSheet.teacherInfo,
                            teacherContact: e.target.value,
                          }
                        }
                        attendanceSheetStore.upsert(updated)
                        setAttendanceSheet(updated)
                      }
                    }}
                    placeholder="010-1234-5678"
                    className="w-full"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {attendanceSheet?.teacherInfo?.teacherContact || form.getFieldValue('teacherContact') || '-'}
                  </div>
                )}
              </div>
            </div>
          </DetailSectionCard>

          {/* SECTION 2: 학생 명단 */}
          <DetailSectionCard title="학생별 출석 현황" className="mb-6">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>※ 수료기준 :</strong> 학생 당 출석률 80% 이상
                </p>
              </div>
              {isEditMode && (
                <Button
                  type="primary"
                  icon={<UserPlus className="w-4 h-4" />}
                  onClick={handleAddStudent}
                  className="flex items-center"
                >
                  학생 추가
                </Button>
              )}
            </div>
            <Table
              columns={studentColumns}
              dataSource={students}
              rowKey={(record, index) => `student-${index}`}
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}명`,
              }}
              scroll={{ x: 'max-content' }}
              locale={{
                emptyText: '학생이 없습니다. 학생을 추가해주세요.',
              }}
            />
          </DetailSectionCard>
        </div>
      </div>
    </ProtectedRoute>
  )
}
