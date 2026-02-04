'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Table, Space, message, Tag, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Edit, FileCheck, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dataStore } from '@/lib/dataStore'
import { attendanceSheetStore, type AttendanceSheet } from '@/lib/attendanceSheetStore'
import dayjs from 'dayjs'

type AttendanceSheetWithEducation = AttendanceSheet & { education: NonNullable<ReturnType<typeof dataStore.getEducationById>> }

export default function WriteAttendanceSheetsPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [sheets, setSheets] = useState<AttendanceSheetWithEducation[]>([])
  const [loading, setLoading] = useState(false)

  const currentTeacherId = userProfile?.userId || 'teacher-1'
  const currentInstitutionId = 'INST-001' // TODO: Get from teacher profile
  const currentInstitutionName = '평택안일초등학교' // TODO: Get from teacher profile

  const loadSheets = () => {
    setLoading(true)
    try {
      // Force initialization if needed
      const allSheets = attendanceSheetStore.getAll()
      console.log('All attendance sheets:', allSheets.length)
      
      const byInstitution = attendanceSheetStore.getByInstitutionId(currentInstitutionId)
      console.log('Sheets for institution:', byInstitution.length)
      
      // Filter for TEACHER_DRAFT and TEACHER_READY status (작성 중 및 작성 완료)
      const draftSheets = byInstitution.filter(sheet => 
        sheet.status === 'TEACHER_DRAFT' || sheet.status === 'TEACHER_READY'
      )
      console.log('Draft/Ready sheets:', draftSheets.length)
      
      // Enrich with education data
      const enriched = draftSheets
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

  const handleEdit = (sheet: AttendanceSheetWithEducation) => {
    router.push(`/teacher/attendance/${sheet.educationId}`)
  }

  const handleMarkAsReady = (sheet: AttendanceSheetWithEducation) => {
    // Validate required fields
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
      loadSheets()
    } else {
      message.error('상태 변경에 실패했습니다.')
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
                <Button
                  type="primary"
                  icon={<Edit />}
                  onClick={() => handleEdit(record)}
                >
                  수정
                </Button>
                <Button
                  type="default"
                  icon={<CheckCircle />}
                  disabled={!isValid}
                  onClick={() => handleMarkAsReady(record)}
                >
                  작성 완료
                </Button>
              </>
            )}
            {isCompleted && (
              <Tag color="green" icon={<CheckCircle />}>작성 완료</Tag>
            )}
          </Space>
        )
      },
    },
  ]

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              출석부 작성
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              출석부를 작성하고 작성 완료로 표시하세요. 기본 정보와 학생 명단을 모두 입력하면 작성 완료가 가능합니다. 작성 완료된 출석부는 강사가 요청할 수 있습니다.
            </p>
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
                emptyText: '작성 중인 출석부가 없습니다.',
              }}
            />
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
