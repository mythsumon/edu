'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Input, InputNumber, Form, Table, Badge, message, Modal, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeft, Save, Plus, Trash2, Eye } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dataStore } from '@/lib/dataStore'
import type { Education } from '@/lib/dataStore'
import { teacherEducationInfoStore, attendanceInfoRequestStore } from '@/lib/teacherStore'
import type { TeacherEducationInfo, AttendanceInfoRequest } from '@/lib/teacherStore'
import { DetailSectionCard } from '@/components/admin/operations'
import dayjs from 'dayjs'

const { TextArea } = Input

interface Student {
  no: number
  name: string
}

export default function TeacherClassDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { userProfile } = useAuth()
  const [form] = Form.useForm()
  
  const educationId = params?.educationId as string
  const currentTeacherId = userProfile?.userId || 'teacher-1'
  const currentInstitutionName = '평택안일초등학교' // TODO: Get from teacher profile
  
  const [education, setEducation] = useState<Education | null>(null)
  const [educationInfo, setEducationInfo] = useState<TeacherEducationInfo | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [requests, setRequests] = useState<AttendanceInfoRequest[]>([])

  useEffect(() => {
    loadData()
    
    // Listen for updates
    const handleUpdate = () => {
      loadData()
    }
    
    window.addEventListener('teacherEducationInfoUpdated', handleUpdate)
    window.addEventListener('attendanceInfoRequestUpdated', handleUpdate)
    
    return () => {
      window.removeEventListener('teacherEducationInfoUpdated', handleUpdate)
      window.removeEventListener('attendanceInfoRequestUpdated', handleUpdate)
    }
  }, [educationId])

  const loadData = () => {
    // Load education
    const edu = dataStore.getEducationById(educationId)
    setEducation(edu || null)
    
    if (!edu) {
      console.warn(`Education not found: ${educationId}`)
      return
    }
    
    // Load education info
    const info = teacherEducationInfoStore.getByEducationId(educationId)
    setEducationInfo(info)
    
    if (info) {
      setStudents(info.students || [])
      form.setFieldsValue({
        grade: info.grade,
        className: info.className,
        teacherName: info.teacherName,
        teacherContact: info.teacherContact,
        notes: info.notes,
      })
    } else {
      // Initialize from education if available
      if (edu) {
        form.setFieldsValue({
          grade: edu.gradeClass?.split('학년')[0] || '',
          className: edu.gradeClass?.split('학년')[1]?.trim() || '',
        })
      }
    }
    
    // Load requests - get all requests for this education, not just OPEN
    const eduRequests = attendanceInfoRequestStore.getByEducationId(educationId)
    console.log(`Loaded ${eduRequests.length} requests for education ${educationId}:`, eduRequests)
    setRequests(eduRequests.filter(r => r.status === 'OPEN'))
  }

  const handleSave = () => {
    if (!education) return
    
    const values = form.getFieldsValue()
    
    const info: TeacherEducationInfo = {
      id: educationInfo?.id || `info-${Date.now()}`,
      educationId: educationId,
      institutionId: 'INST-001', // TODO: Get from teacher profile
      institutionName: currentInstitutionName,
      grade: values.grade,
      className: values.className,
      students: students,
      teacherName: values.teacherName,
      teacherContact: values.teacherContact,
      notes: values.notes,
      updatedAt: new Date().toISOString(),
      updatedBy: currentTeacherId,
    }
    
    teacherEducationInfoStore.upsert(info)
    setEducationInfo(info)
    setIsEditMode(false)
    message.success('교육 정보가 저장되었습니다.')
  }

  const handleAddStudent = () => {
    const newNo = students.length > 0 ? Math.max(...students.map(s => s.no)) + 1 : 1
    setStudents([...students, { no: newNo, name: '' }])
  }

  const handleRemoveStudent = (index: number) => {
    setStudents(students.filter((_, i) => i !== index))
  }

  const handleStudentChange = (index: number, field: 'no' | 'name', value: string | number) => {
    const updated = [...students]
    updated[index] = { ...updated[index], [field]: value }
    setStudents(updated)
  }

  const handleRequestComplete = (requestId: string) => {
    attendanceInfoRequestStore.update(requestId, { status: 'DONE' })
    message.success('요청이 완료 처리되었습니다.')
    loadData()
  }

  const studentColumns: ColumnsType<Student> = [
    {
      title: '출석번호',
      dataIndex: 'no',
      key: 'no',
      width: 100,
      render: (no: number, _, index) => (
        isEditMode ? (
          <InputNumber
            min={1}
            value={no}
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

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-4 mb-4">
              <Button
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={() => router.push('/teacher/classes')}
              >
                돌아가기
              </Button>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {education.name}
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Badge status="processing" text={education.status || education.educationStatus} />
              <span className="text-gray-600 dark:text-gray-400">
                {education.periodStart} ~ {education.periodEnd}
              </span>
            </div>
          </div>

          {/* Education Summary */}
          <Card className="rounded-xl mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">교육 정보</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">교육ID</div>
                <div className="font-medium">{education.educationId}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">기관명</div>
                <div className="font-medium">{education.institution}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">지역</div>
                <div className="font-medium">{education.region}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">교육 기간</div>
                <div className="font-medium">{education.periodStart} ~ {education.periodEnd}</div>
              </div>
            </div>
          </Card>

          {/* Education Info Form */}
          <Card className="rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">교육 정보 입력/수정</h2>
              {!isEditMode ? (
                <Button
                  type="primary"
                  onClick={() => setIsEditMode(true)}
                >
                  수정하기
                </Button>
              ) : (
                <Space>
                  <Button onClick={() => {
                    setIsEditMode(false)
                    loadData()
                  }}>
                    취소
                  </Button>
                  <Button
                    type="primary"
                    icon={<Save className="w-4 h-4" />}
                    onClick={handleSave}
                  >
                    저장하기
                  </Button>
                </Space>
              )}
            </div>

            <Form form={form} layout="vertical" disabled={!isEditMode}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <Form.Item label="학년" name="grade" rules={[{ required: true, message: '학년을 입력해주세요' }]}>
                  <Input placeholder="예: 5" disabled={!isEditMode} />
                </Form.Item>
                <Form.Item label="반" name="className" rules={[{ required: true, message: '반을 입력해주세요' }]}>
                  <Input placeholder="예: 6반" disabled={!isEditMode} />
                </Form.Item>
                <Form.Item label="담임/담당자 이름" name="teacherName" rules={[{ required: true, message: '이름을 입력해주세요' }]}>
                  <Input placeholder="담임 선생님 이름" disabled={!isEditMode} />
                </Form.Item>
                <Form.Item label="담임/담당자 연락처" name="teacherContact" rules={[{ required: true, message: '연락처를 입력해주세요' }]}>
                  <Input placeholder="010-1234-5678" disabled={!isEditMode} />
                </Form.Item>
              </div>

              <Form.Item label="학생 명단" required>
                <div className="space-y-4">
                  {isEditMode && (
                    <Button
                      type="dashed"
                      icon={<Plus className="w-4 h-4" />}
                      onClick={handleAddStudent}
                      block
                    >
                      학생 추가
                    </Button>
                  )}
                  <Table
                    columns={studentColumns}
                    dataSource={students}
                    rowKey={(record, index) => `student-${index}`}
                    pagination={false}
                    locale={{
                      emptyText: '학생이 없습니다. 학생을 추가해주세요.',
                    }}
                  />
                </div>
              </Form.Item>

              <Form.Item label="기타 학교측 전달사항" name="notes">
                <TextArea
                  rows={4}
                  placeholder="강사에게 전달할 사항을 입력하세요"
                  disabled={!isEditMode}
                />
              </Form.Item>
            </Form>

            {educationInfo && (
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  마지막 수정: {dayjs(educationInfo.updatedAt).format('YYYY-MM-DD HH:mm')}
                </div>
              </div>
            )}
          </Card>

          {/* Requests Section */}
          <Card className="rounded-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">요청함</h2>
              {requests.length > 0 && (
                <Badge count={requests.length} showZero style={{ backgroundColor: '#1890ff' }} />
              )}
            </div>
            {requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="p-4 border border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-900/20"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge status="processing" text="요청 중" />
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {request.requesterInstructorName || '강사'} 강사님의 요청
                          </span>
                        </div>
                        {request.message ? (
                          <div className="p-3 bg-white dark:bg-gray-800 rounded mb-2">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {request.message}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-2">
                            (메시지 없음)
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                          <span>요청일: {dayjs(request.createdAt).format('YYYY-MM-DD HH:mm')}</span>
                          <span>요청ID: {request.id}</span>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        onClick={() => {
                          Modal.confirm({
                            title: '요청 완료',
                            content: '출석부 정보 입력을 완료하셨나요? 완료 처리하면 강사에게 알림이 전송됩니다.',
                            onOk: () => handleRequestComplete(request.id),
                          })
                        }}
                      >
                        완료 처리
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  현재 요청된 출석부 정보가 없습니다.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  강사가 출석부 정보를 요청하면 여기에 표시됩니다.
                </p>
              </div>
            )}
          </Card>

          {/* Attendance Sign Section */}
          <Card className="rounded-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">출석부 서명</h2>
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                출석부 서명은 "출석부 서명/확인" 페이지에서 진행하세요.
              </p>
              <Button
                type="primary"
                onClick={() => router.push('/teacher/attendance-sign')}
              >
                출석부 서명 페이지로 이동
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
