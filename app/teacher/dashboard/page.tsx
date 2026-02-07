'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Tabs, Table, Button, Space, message, Tag, Badge, Modal, Form, Input, Upload, Timeline, Descriptions } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { FileCheck, ClipboardList, GraduationCap, Edit, CheckCircle, Send, Eye, CheckCircle as CheckCircleIcon, XCircle } from 'lucide-react'
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

export default function TeacherDashboard() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [form] = Form.useForm()
  const [activeTab, setActiveTab] = useState('write')
  const [stats, setStats] = useState({
    toWrite: 0,              // TEACHER_DRAFT
    ready: 0,                // TEACHER_READY
    requestsToSend: 0,       // INSTRUCTOR_REQUESTED
    waitingSignature: 0,     // RETURNED_TO_TEACHER
    completed: 0,            // FINAL_SENT_TO_INSTRUCTOR / SUBMITTED_TO_ADMIN / APPROVED
  })

  // Tab-specific states
  const [writeSheets, setWriteSheets] = useState<AttendanceSheetWithEducation[]>([])
  const [requestSheets, setRequestSheets] = useState<AttendanceSheetWithEducation[]>([])
  const [reviewSheets, setReviewSheets] = useState<AttendanceSheetWithEducation[]>([])
  const [completedSheets, setCompletedSheets] = useState<AttendanceSheetWithEducation[]>([])
  const [loading, setLoading] = useState(false)
  
  // Modal states
  const [reviewModalVisible, setReviewModalVisible] = useState(false)
  const [selectedSheet, setSelectedSheet] = useState<AttendanceSheetWithEducation | null>(null)
  const [signatureType, setSignatureType] = useState<'typed' | 'image'>('typed')
  const [typedName, setTypedName] = useState('')
  const [detailModalVisible, setDetailModalVisible] = useState(false)

  const currentTeacherId = userProfile?.userId || 'teacher-1'
  const currentInstitutionId = 'INST-001' // TODO: Get from teacher profile
  const currentInstitutionName = '평택안일초등학교' // TODO: Get from teacher profile

  const loadStats = useCallback(() => {
    try {
      const allSheets = attendanceSheetStore.getByInstitutionId(currentInstitutionId)
      
      const toWrite = allSheets.filter(s => s.status === 'TEACHER_DRAFT').length
      const ready = allSheets.filter(s => s.status === 'TEACHER_READY').length
      const requestsToSend = allSheets.filter(s => s.status === 'INSTRUCTOR_REQUESTED').length
      const waitingSignature = allSheets.filter(s => s.status === 'RETURNED_TO_TEACHER').length
      const completed = allSheets.filter(s => 
        s.status === 'FINAL_SENT_TO_INSTRUCTOR' ||
        s.status === 'SUBMITTED_TO_ADMIN' ||
        s.status === 'APPROVED'
      ).length

      setStats({
        toWrite,
        ready,
        requestsToSend,
        waitingSignature,
        completed,
      })
    } catch (error) {
      console.error('Error loading teacher dashboard stats:', error)
      setStats({
        toWrite: 0,
        ready: 0,
        requestsToSend: 0,
        waitingSignature: 0,
        completed: 0,
      })
    }
  }, [currentInstitutionId])

  // Load sheets for each tab
  const loadWriteSheets = useCallback(() => {
    setLoading(true)
    try {
      const byInstitution = attendanceSheetStore.getByInstitutionId(currentInstitutionId)
      const draftSheets = byInstitution.filter(sheet => 
        sheet.status === 'TEACHER_DRAFT' || sheet.status === 'TEACHER_READY'
      )
      const enriched = draftSheets
        .map(sheet => {
          const education = dataStore.getEducationById(sheet.educationId)
          if (!education) return null
          return { ...sheet, education }
        })
        .filter((item): item is AttendanceSheetWithEducation => item !== null && item.education !== undefined)
      setWriteSheets(enriched)
    } catch (error) {
      console.error('Error loading write sheets:', error)
    } finally {
      setLoading(false)
    }
  }, [currentInstitutionId])

  const loadRequestSheets = useCallback(() => {
    setLoading(true)
    try {
      const byInstitution = attendanceSheetStore.getByInstitutionId(currentInstitutionId)
      const requestedSheets = byInstitution.filter(sheet => 
        sheet.status === 'INSTRUCTOR_REQUESTED'
      )
      const enriched = requestedSheets
        .map(sheet => {
          const education = dataStore.getEducationById(sheet.educationId)
          if (!education) return null
          return { ...sheet, education }
        })
        .filter((item): item is AttendanceSheetWithEducation => item !== null && item.education !== undefined)
      setRequestSheets(enriched)
    } catch (error) {
      console.error('Error loading request sheets:', error)
    } finally {
      setLoading(false)
    }
  }, [currentInstitutionId])

  const loadReviewSheets = useCallback(() => {
    setLoading(true)
    try {
      const byInstitution = attendanceSheetStore.getByInstitutionId(currentInstitutionId)
      const returnedSheets = byInstitution.filter(sheet => sheet.status === 'RETURNED_TO_TEACHER')
      const enriched = returnedSheets
        .map(sheet => {
          const education = dataStore.getEducationById(sheet.educationId)
          if (!education) return null
          return { ...sheet, education }
        })
        .filter((item): item is AttendanceSheetWithEducation => item !== null && item.education !== undefined)
      setReviewSheets(enriched)
    } catch (error) {
      console.error('Error loading review sheets:', error)
    } finally {
      setLoading(false)
    }
  }, [currentInstitutionId])

  const loadCompletedSheets = useCallback(() => {
    setLoading(true)
    try {
      const byInstitution = attendanceSheetStore.getByInstitutionId(currentInstitutionId)
      const completedSheets = byInstitution.filter(sheet => 
        sheet.status === 'FINAL_SENT_TO_INSTRUCTOR' ||
        sheet.status === 'SUBMITTED_TO_ADMIN' ||
        sheet.status === 'APPROVED' ||
        sheet.status === 'REJECTED'
      )
      const enriched = completedSheets
        .map(sheet => {
          const education = dataStore.getEducationById(sheet.educationId)
          if (!education) return null
          return { ...sheet, education }
        })
        .filter((item): item is AttendanceSheetWithEducation => item !== null && item.education !== undefined)
      setCompletedSheets(enriched)
    } catch (error) {
      console.error('Error loading completed sheets:', error)
    } finally {
      setLoading(false)
    }
  }, [currentInstitutionId])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      attendanceSheetStore.getAll()
    }
    loadStats()
    loadWriteSheets()
    loadRequestSheets()
    loadReviewSheets()
    loadCompletedSheets()

    const handleUpdate = () => {
      loadStats()
      loadWriteSheets()
      loadRequestSheets()
      loadReviewSheets()
      loadCompletedSheets()
    }

    window.addEventListener('attendanceSheetUpdated', handleUpdate)
    window.addEventListener('attendanceSheetStatusChanged', handleUpdate)

    return () => {
      window.removeEventListener('attendanceSheetUpdated', handleUpdate)
      window.removeEventListener('attendanceSheetStatusChanged', handleUpdate)
    }
  }, [loadStats, loadWriteSheets, loadRequestSheets, loadReviewSheets, loadCompletedSheets])

  // Handlers
  const handleEdit = (sheet: AttendanceSheetWithEducation) => {
    router.push(`/teacher/attendance/${sheet.educationId}`)
  }

  const handleMarkAsReady = (sheet: AttendanceSheetWithEducation) => {
    if (!sheet.teacherInfo.grade || !sheet.teacherInfo.className || !sheet.teacherInfo.teacherName) {
      message.warning('기본 정보(학년, 반, 담당 선생님 이름)를 모두 입력해주세요.')
      return
    }
    if (!sheet.students || sheet.students.length === 0) {
      message.warning('학생 명단을 최소 1명 이상 추가해주세요.')
      return
    }
    const actor = {
      role: 'teacher' as const,
      id: currentTeacherId,
      name: userProfile?.name || 'Teacher',
    }
    const updated = attendanceSheetStore.markAsReady(sheet.attendanceId, actor)
    if (updated) {
      message.success('출석부 작성이 완료되었습니다.')
      loadWriteSheets()
      loadStats()
    } else {
      message.error('상태 변경에 실패했습니다.')
    }
  }

  const handleSendToInstructor = (sheet: AttendanceSheetWithEducation) => {
    if (sheet.status !== 'INSTRUCTOR_REQUESTED') {
      message.warning('강사가 요청한 출석부만 전송할 수 있습니다.')
      return
    }
    const actor = {
      role: 'teacher' as const,
      id: currentTeacherId,
      name: userProfile?.name || 'Teacher',
    }
    const updated = attendanceSheetStore.sendToInstructor(sheet.attendanceId, actor)
    if (updated) {
      message.success('출석부가 강사에게 전송되었습니다.')
      loadRequestSheets()
      loadStats()
    } else {
      message.error('전송에 실패했습니다.')
    }
  }

  const handleReview = (sheet: AttendanceSheetWithEducation) => {
    setSelectedSheet(sheet)
    setReviewModalVisible(true)
    setTypedName(sheet.teacherInfo.teacherName || userProfile?.name || '')
    form.setFieldsValue({ comment: '' })
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
      signatureRef: signatureType === 'typed' ? typedName : undefined,
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
      loadReviewSheets()
      loadStats()
    } else {
      message.error('전송에 실패했습니다.')
    }
  }

  const handleViewDetail = (sheet: AttendanceSheetWithEducation) => {
    setSelectedSheet(sheet)
    setDetailModalVisible(true)
  }

  const getStatusTag = (status: AttendanceSheet['status']) => {
    switch (status) {
      case 'FINAL_SENT_TO_INSTRUCTOR':
        return <Tag color="blue">강사에게 전송됨</Tag>
      case 'SUBMITTED_TO_ADMIN':
        return <Tag color="purple">관리자 제출됨</Tag>
      case 'APPROVED':
        return <Tag color="green" icon={<CheckCircleIcon />}>승인됨</Tag>
      case 'REJECTED':
        return <Tag color="red" icon={<XCircle />}>반려됨</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  // Table columns
  const writeColumns: ColumnsType<AttendanceSheetWithEducation> = [
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
      render: (text) => text || '-',
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
      title: '담당 선생님',
      dataIndex: ['teacherInfo', 'teacherName'],
      key: 'teacherName',
    },
    {
      title: '학생 수',
      key: 'studentCount',
      render: (_, record) => (
        <Badge count={record.students?.length || 0} showZero color={record.students && record.students.length > 0 ? 'green' : 'red'} />
      ),
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record) => {
        if (record.status === 'TEACHER_READY') {
          return <Tag color="green">작성 완료</Tag>
        }
        return <Tag color="orange">작성 중</Tag>
      },
    },
    {
      title: '생성일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD') : '-',
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => {
        const isValid = 
          record.teacherInfo.grade && 
          record.teacherInfo.className && 
          record.teacherInfo.teacherName &&
          record.students && 
          record.students.length > 0
        const isCompleted = record.status === 'TEACHER_READY'
        return (
          <Space>
            {!isCompleted && (
              <>
                <Button type="primary" icon={<Edit />} onClick={() => handleEdit(record)}>수정</Button>
                <Button type="default" icon={<CheckCircle />} disabled={!isValid} onClick={() => handleMarkAsReady(record)}>작성 완료</Button>
              </>
            )}
            {isCompleted && <Tag color="green" icon={<CheckCircle />}>작성 완료</Tag>}
          </Space>
        )
      },
    },
  ]

  const requestColumns: ColumnsType<AttendanceSheetWithEducation> = [
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
      title: '상태',
      key: 'status',
      render: () => <Tag color="red">강사 요청됨</Tag>,
    },
    {
      title: '요청일',
      dataIndex: 'updatedAt',
      key: 'requestedAt',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" icon={<Send />} onClick={() => handleSendToInstructor(record)}>강사에게 전송</Button>
      ),
    },
  ]

  const reviewColumns: ColumnsType<AttendanceSheetWithEducation> = [
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
        <Button type="primary" icon={<Eye />} onClick={() => handleReview(record)}>검토 및 서명</Button>
      ),
    },
  ]

  const completedColumns: ColumnsType<AttendanceSheetWithEducation> = [
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
      title: '상태',
      key: 'status',
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: '완료일',
      dataIndex: 'updatedAt',
      key: 'completedAt',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <button onClick={() => handleViewDetail(record)} className="text-blue-600 hover:text-blue-800">
          <Eye className="inline w-4 h-4 mr-1" />
          상세보기
        </button>
      ),
    },
  ]

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              대시보드
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              학교 선생님 대시보드입니다.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-6">
            <Card 
              className="rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab('write')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">작성 필요</div>
                  <div className="text-3xl font-bold text-orange-600">{stats.toWrite}</div>
                </div>
                <FileCheck className="w-8 h-8 text-orange-500" />
              </div>
            </Card>
            <Card 
              className="rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab('write')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">준비 완료</div>
                  <div className="text-3xl font-bold text-blue-600">{stats.ready}</div>
                </div>
                <FileCheck className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card 
              className="rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab('requests')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">전송 대기</div>
                  <div className="text-3xl font-bold text-red-600">{stats.requestsToSend}</div>
                </div>
                <ClipboardList className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            <Card 
              className="rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab('review')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">서명 대기</div>
                  <div className="text-3xl font-bold text-purple-600">{stats.waitingSignature}</div>
                </div>
                <FileCheck className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
            <Card 
              className="rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setActiveTab('completed')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">완료</div>
                  <div className="text-3xl font-bold text-green-600">{stats.completed}</div>
                </div>
                <FileCheck className="w-8 h-8 text-green-500" />
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <Card className="rounded-xl">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'write',
                  label: (
                    <span>
                      <FileCheck className="inline w-4 h-4 mr-2" />
                      출석부 작성
                      {stats.toWrite + stats.ready > 0 && (
                        <Badge count={stats.toWrite + stats.ready} style={{ marginLeft: 8 }} />
                      )}
                    </span>
                  ),
                  children: (
                    <Table
                      columns={writeColumns}
                      dataSource={writeSheets}
                      rowKey="attendanceId"
                      loading={loading}
                      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `총 ${total}개` }}
                      locale={{ emptyText: '작성 중인 출석부가 없습니다.' }}
                    />
                  ),
                },
                {
                  key: 'requests',
                  label: (
                    <span>
                      <ClipboardList className="inline w-4 h-4 mr-2" />
                      요청 및 전송
                      {stats.requestsToSend > 0 && (
                        <Badge count={stats.requestsToSend} style={{ marginLeft: 8 }} />
                      )}
                    </span>
                  ),
                  children: (
                    <Table
                      columns={requestColumns}
                      dataSource={requestSheets}
                      rowKey="attendanceId"
                      loading={loading}
                      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `총 ${total}개` }}
                      locale={{ emptyText: '요청된 출석부가 없습니다.' }}
                    />
                  ),
                },
                {
                  key: 'review',
                  label: (
                    <span>
                      <FileCheck className="inline w-4 h-4 mr-2" />
                      검토 및 서명
                      {stats.waitingSignature > 0 && (
                        <Badge count={stats.waitingSignature} style={{ marginLeft: 8 }} />
                      )}
                    </span>
                  ),
                  children: (
                    <Table
                      columns={reviewColumns}
                      dataSource={reviewSheets}
                      rowKey="attendanceId"
                      loading={loading}
                      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `총 ${total}개` }}
                      locale={{ emptyText: '검토할 출석부가 없습니다.' }}
                    />
                  ),
                },
                {
                  key: 'completed',
                  label: (
                    <span>
                      <CheckCircle className="inline w-4 h-4 mr-2" />
                      완료된 출석부
                      {stats.completed > 0 && (
                        <Badge count={stats.completed} style={{ marginLeft: 8 }} />
                      )}
                    </span>
                  ),
                  children: (
                    <Table
                      columns={completedColumns}
                      dataSource={completedSheets}
                      rowKey="attendanceId"
                      loading={loading}
                      pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `총 ${total}개` }}
                      locale={{ emptyText: '완료된 출석부가 없습니다.' }}
                    />
                  ),
                },
              ]}
            />
          </Card>

          {/* Review Modal */}
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

                {selectedSheet.sessions && selectedSheet.sessions.length > 0 && (
                  <DetailSectionCard title="회차별 수업 정보">
                    <Table
                      columns={[
                        { title: '구분', dataIndex: 'label', key: 'label', width: 120 },
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
                      session1MainInstructor: selectedSheet.instructorSignature ? {
                        signedByUserId: 'instructor',
                        signedByUserName: selectedSheet.instructorSignature.signedBy || '',
                        signedAt: selectedSheet.instructorSignature.signedAt || '',
                        signatureImageUrl: selectedSheet.instructorSignature.signatureRef || '',
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

                {selectedSheet.students && selectedSheet.students.length > 0 && (
                  <DetailSectionCard title="학생별 출석 현황">
                    <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>※ 수료기준 :</strong> 학생 당 출석률 80% 이상
                      </p>
                    </div>
                    <Table
                      columns={[
                        { title: '출석번호', dataIndex: 'no', key: 'no', width: 80, align: 'center' },
                        { title: '이름', dataIndex: 'name', key: 'name', width: 120 },
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
                      <Upload accept="image/*" beforeUpload={() => false}>
                        <Button>이미지 선택</Button>
                      </Upload>
                    )}
                  </Space>
                </DetailSectionCard>

                <Form form={form}>
                  <Form.Item label="비고 (선택)" name="comment">
                    <TextArea rows={3} placeholder="비고를 입력하세요 (선택사항)" />
                  </Form.Item>
                </Form>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button onClick={() => setReviewModalVisible(false)}>취소</Button>
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

          {/* Detail Modal */}
          <Modal
            title="출석부 상세 정보"
            open={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false)
              setSelectedSheet(null)
            }}
            footer={null}
            width={900}
          >
            {selectedSheet && (
              <div className="space-y-4">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="프로그램명">
                    {selectedSheet.programName || selectedSheet.education?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="기관명">
                    {selectedSheet.institutionName}
                  </Descriptions.Item>
                  <Descriptions.Item label="학년/반">
                    {selectedSheet.teacherInfo.grade}학년 {selectedSheet.teacherInfo.className}반
                  </Descriptions.Item>
                  <Descriptions.Item label="담당 선생님">
                    {selectedSheet.teacherInfo.teacherName}
                  </Descriptions.Item>
                  <Descriptions.Item label="학생 수">
                    {selectedSheet.students?.length || 0}명
                  </Descriptions.Item>
                  <Descriptions.Item label="상태">
                    {getStatusTag(selectedSheet.status)}
                  </Descriptions.Item>
                </Descriptions>

                {selectedSheet.adminReview && (
                  <Card title="관리자 검토 결과" size="small">
                    <Descriptions column={1}>
                      <Descriptions.Item label="결과">
                        {selectedSheet.adminReview.status === 'APPROVED' ? (
                          <Tag color="green">승인</Tag>
                        ) : (
                          <Tag color="red">반려</Tag>
                        )}
                      </Descriptions.Item>
                      {selectedSheet.adminReview.reason && (
                        <Descriptions.Item label="사유">
                          {selectedSheet.adminReview.reason}
                        </Descriptions.Item>
                      )}
                      {selectedSheet.adminReview.reviewedAt && (
                        <Descriptions.Item label="검토일">
                          {dayjs(selectedSheet.adminReview.reviewedAt).format('YYYY-MM-DD HH:mm')}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>
                )}

                {selectedSheet.auditLog && selectedSheet.auditLog.length > 0 && (
                  <Card title="처리 이력" size="small">
                    <Timeline>
                      {selectedSheet.auditLog.map((log) => (
                        <Timeline.Item
                          key={log.id}
                          color={
                            log.toState === 'APPROVED' ? 'green' :
                            log.toState === 'REJECTED' ? 'red' :
                            'blue'
                          }
                        >
                          <div>
                            <div className="font-semibold">{log.actorName} ({log.actorRole})</div>
                            <div className="text-sm text-gray-600">
                              {log.fromState} → {log.toState}
                            </div>
                            <div className="text-xs text-gray-500">
                              {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm')}
                            </div>
                            {log.comment && (
                              <div className="text-sm text-gray-700 mt-1">{log.comment}</div>
                            )}
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                )}
              </div>
            )}
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  )
}
