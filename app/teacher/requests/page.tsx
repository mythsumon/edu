'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Table, Input, Badge, Button, Modal, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Edit } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { attendanceInfoRequestStore } from '@/lib/teacherStore'
import type { AttendanceInfoRequest } from '@/lib/teacherStore'
import { dataStore } from '@/lib/dataStore'
import dayjs from 'dayjs'

export default function TeacherRequestsPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [searchText, setSearchText] = useState('')

  const currentInstitutionId = 'INST-001' // TODO: Get from teacher profile

  const allRequests = useMemo(() => {
    return attendanceInfoRequestStore.getOpenRequests(currentInstitutionId)
  }, [])

  const filteredRequests = useMemo(() => {
    let filtered = allRequests

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(req => {
        const education = dataStore.getEducationById(req.educationId)
        return (
          req.educationId.toLowerCase().includes(searchLower) ||
          req.requesterInstructorName.toLowerCase().includes(searchLower) ||
          education?.name.toLowerCase().includes(searchLower) ||
          ''
        )
      })
    }

    return filtered.sort((a, b) => 
      dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf()
    )
  }, [allRequests, searchText])

  useEffect(() => {
    // Listen for updates
    const handleUpdate = () => {
      window.location.reload()
    }

    window.addEventListener('attendanceInfoRequestUpdated', handleUpdate)
    window.addEventListener('attendanceInfoRequestCreated', handleUpdate)

    return () => {
      window.removeEventListener('attendanceInfoRequestUpdated', handleUpdate)
      window.removeEventListener('attendanceInfoRequestCreated', handleUpdate)
    }
  }, [])


  const columns: ColumnsType<AttendanceInfoRequest> = [
    {
      title: '교육ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120,
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '교육명',
      key: 'educationName',
      width: 250,
      render: (_, record) => {
        const education = dataStore.getEducationById(record.educationId)
        return education?.name || '-'
      },
    },
    {
      title: '요청 강사',
      dataIndex: 'requesterInstructorName',
      key: 'requesterInstructorName',
      width: 150,
    },
    {
      title: '요청 메시지',
      dataIndex: 'message',
      key: 'message',
      width: 300,
      render: (text: string) => text || '-',
    },
    {
      title: '상태',
      key: 'status',
      width: 100,
      render: (_, record) => (
        <Badge
          status={record.status === 'DONE' ? 'success' : 'processing'}
          text={record.status === 'DONE' ? '완료' : '요청 중'}
        />
      ),
    },
    {
      title: '요청일',
      key: 'createdAt',
      width: 150,
      render: (_, record) => dayjs(record.createdAt).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '관리',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<Edit className="w-3 h-3" />}
          onClick={() => router.push(`/teacher/classes/${record.educationId}`)}
        >
          작성하기
        </Button>
      ),
    },
  ]

  const openCount = allRequests.filter(r => r.status === 'OPEN').length
  const doneCount = allRequests.filter(r => r.status === 'DONE').length

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              요청함
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              강사가 출석부 정보를 요청한 건을 확인하고 입력하세요.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">요청 중</div>
              <div className="text-3xl font-bold text-blue-600">{openCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">완료</div>
              <div className="text-3xl font-bold text-green-600">{doneCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체</div>
              <div className="text-3xl font-bold text-slate-600">{allRequests.length}</div>
            </Card>
          </div>

          {/* Search and Table */}
          <Card className="rounded-xl">
            <div className="mb-4">
              <Input
                placeholder="교육ID, 교육명, 강사명으로 검색"
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="max-w-md"
              />
            </div>

            <Table
              columns={columns}
              dataSource={filteredRequests}
              rowKey="id"
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}건`,
              }}
            />
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
