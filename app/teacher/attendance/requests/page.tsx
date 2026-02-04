'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Table, Space, message, Tag, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Send, FileCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dataStore } from '@/lib/dataStore'
import { attendanceSheetStore, type AttendanceSheet } from '@/lib/attendanceSheetStore'
import dayjs from 'dayjs'

type AttendanceSheetWithEducation = AttendanceSheet & { education: NonNullable<ReturnType<typeof dataStore.getEducationById>> }

export default function RequestsAndSendPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [sheets, setSheets] = useState<AttendanceSheetWithEducation[]>([])
  const [loading, setLoading] = useState(false)

  const currentTeacherId = userProfile?.userId || 'teacher-1'
  const currentInstitutionId = 'INST-001' // TODO: Get from teacher profile

  const loadSheets = () => {
    setLoading(true)
    try {
      // Force initialization if needed
      const allSheets = attendanceSheetStore.getAll()
      console.log('All attendance sheets:', allSheets.length)
      
      const byInstitution = attendanceSheetStore.getByInstitutionId(currentInstitutionId)
      console.log('Sheets for institution:', byInstitution.length)
      
      // Filter for INSTRUCTOR_REQUESTED (primary) - 강사가 요청한 출석부만 표시
      const requestedSheets = byInstitution.filter(sheet => 
        sheet.status === 'INSTRUCTOR_REQUESTED'
      )
      console.log('INSTRUCTOR_REQUESTED sheets:', requestedSheets.length)
      
      // Enrich with education data
      const enriched = requestedSheets
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
      title: '상태',
      key: 'status',
      render: (_, record) => (
        <Tag color="red">강사 요청됨</Tag>
      ),
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
        <Button
          type="primary"
          icon={<Send />}
          onClick={() => handleSendToInstructor(record)}
        >
          강사에게 전송
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              요청 및 전송
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              강사가 요청한 출석부를 확인하고 전송하세요.
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
                emptyText: '요청된 출석부가 없습니다.',
              }}
            />
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
