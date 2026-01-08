'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Badge, Card, Space, Button, Tabs } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Eye } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getInstructorSubmissions,
} from '@/entities/submission'
import dayjs from 'dayjs'

interface SubmissionItem {
  id: string
  type: 'attendance' | 'activity' | 'equipment'
  educationId: string
  educationName: string
  institutionName: string
  instructorName: string
  submittedAt: string
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  rejectReason?: string
}

export default function InstructorSubmissionsPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'attendance' | 'activity' | 'equipment'>('attendance')
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([])

  useEffect(() => {
    loadSubmissions()
  }, [])

  const loadSubmissions = () => {
    const instructorName = userProfile?.name || '미상'
    const mySubmissions = getInstructorSubmissions(instructorName)
    setSubmissions(mySubmissions)
  }

  const handleView = (item: SubmissionItem) => {
    if (item.type === 'attendance') {
      router.push(`/instructor/schedule/${item.educationId}/attendance`)
    } else if (item.type === 'activity') {
      router.push(`/instructor/activity-logs/${item.id}`)
    } else if (item.type === 'equipment') {
      router.push(`/instructor/equipment-confirmations/${item.id}`)
    }
  }

  const getStatusBadge = (status: string) => {
    if (status === 'APPROVED') {
      return <Badge status="success" text="승인됨" />
    }
    if (status === 'REJECTED') {
      return <Badge status="error" text="반려됨" />
    }
    return <Badge status="processing" text="제출됨" />
  }

  const getTypeLabel = (type: string) => {
    if (type === 'attendance') return '교육 출석부'
    if (type === 'activity') return '교육 활동 일지'
    if (type === 'equipment') return '교구 확인서'
    return type
  }

  const columns: ColumnsType<SubmissionItem> = [
    {
      title: '문서 유형',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => (
        <span className="font-medium">{getTypeLabel(type)}</span>
      ),
    },
    {
      title: '교육명',
      dataIndex: 'educationName',
      key: 'educationName',
      width: 200,
    },
    {
      title: '기관명',
      dataIndex: 'institutionName',
      key: 'institutionName',
      width: 150,
    },
    {
      title: '강사명',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 120,
    },
    {
      title: '제출일시',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 180,
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: '관리',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<Eye className="w-3 h-3" />}
            onClick={() => handleView(record)}
          >
            상세
          </Button>
        </Space>
      ),
    },
  ]

  const pendingCount = submissions.filter(s => s.status === 'SUBMITTED').length
  const approvedCount = submissions.filter(s => s.status === 'APPROVED').length
  const rejectedCount = submissions.filter(s => s.status === 'REJECTED').length

  const attendanceCount = submissions.filter(s => s.type === 'attendance').length
  const activityCount = submissions.filter(s => s.type === 'activity').length
  const equipmentCount = submissions.filter(s => s.type === 'equipment').length

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              문서 제출 현황
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              강사가 제출한 문서를 확인할 수 있습니다.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">승인 대기</div>
              <div className="text-3xl font-bold text-blue-600">{pendingCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">승인 완료</div>
              <div className="text-3xl font-bold text-green-600">{approvedCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">반려</div>
              <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
            </Card>
          </div>

          {/* Tabs */}
          <Card className="rounded-xl">
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as any)}
              items={[
                {
                  key: 'attendance',
                  label: `교육 출석부 (${attendanceCount})`,
                },
                {
                  key: 'activity',
                  label: `교육 활동 일지 (${activityCount})`,
                },
                {
                  key: 'equipment',
                  label: `교구 확인서 (${equipmentCount})`,
                },
              ]}
            />

            <Table
              columns={columns}
              dataSource={submissions.filter(s => s.type === activeTab)}
              rowKey="id"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}건`,
              }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}

