'use client'

import { useState, useMemo, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Card, Input, Select, Badge, Button, Tabs } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dataStore } from '@/lib/dataStore'
import type { Education } from '@/lib/dataStore'
import { teacherEducationInfoStore } from '@/lib/teacherStore'
import { attendanceSheetStore } from '@/lib/attendanceSheetStore'
import dayjs from 'dayjs'

export default function TeacherClassesPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'all' | 'scheduled' | 'in-progress' | 'completed'>('all')

  const currentInstitutionName = '평택안일초등학교' // TODO: Get from teacher profile

  // Get educations for this institution
  const allEducations = useMemo(() => {
    return dataStore.getEducations().filter(edu => edu.institution === currentInstitutionName)
  }, [])

  const filteredEducations = useMemo(() => {
    let filtered = allEducations

    // Tab filter
    const now = dayjs()
    if (activeTab === 'scheduled') {
      filtered = filtered.filter(edu => {
        if (!edu.periodStart) return false
        return dayjs(edu.periodStart).isAfter(now)
      })
    } else if (activeTab === 'in-progress') {
      filtered = filtered.filter(edu => {
        if (!edu.periodStart || !edu.periodEnd) return false
        const start = dayjs(edu.periodStart)
        const end = dayjs(edu.periodEnd)
        return now.isAfter(start) && now.isBefore(end)
      })
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(edu => {
        if (!edu.periodEnd) return false
        return dayjs(edu.periodEnd).isBefore(now)
      })
    }

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(edu => {
        return (
          edu.educationId.toLowerCase().includes(searchLower) ||
          edu.name.toLowerCase().includes(searchLower) ||
          edu.institution.toLowerCase().includes(searchLower)
        )
      })
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(edu => {
        if (statusFilter === '강사공개') return edu.status === '강사공개'
        if (statusFilter === '신청마감') return edu.status === '신청마감' || edu.educationStatus === '신청 마감'
        if (statusFilter === '확정') {
          // Check if there's a confirmed assignment
          const assignments = dataStore.getInstructorAssignments()
          return assignments.some(a => a.educationId === edu.educationId && a.assignmentStatus === 'confirmed')
        }
        return edu.status === statusFilter || edu.educationStatus === statusFilter
      })
    }

    return filtered
  }, [allEducations, activeTab, searchText, statusFilter])

  const getStatusBadge = (education: Education) => {
    const now = dayjs()
    if (education.status === '강사공개') {
      return <Badge status="processing" text="강사공개" />
    }
    if (education.status === '신청마감' || education.educationStatus === '신청 마감') {
      return <Badge status="default" text="신청마감" />
    }
    if (education.periodStart && education.periodEnd) {
      const start = dayjs(education.periodStart)
      const end = dayjs(education.periodEnd)
      if (now.isAfter(end)) {
        return <Badge status="success" text="종료" />
      }
      if (now.isAfter(start) && now.isBefore(end)) {
        return <Badge status="processing" text="진행중" />
      }
      if (now.isBefore(start)) {
        return <Badge status="default" text="예정" />
      }
    }
    return <Badge status="default" text={education.status || education.educationStatus || '미설정'} />
  }

  const getInfoStatus = (educationId: string) => {
    const info = teacherEducationInfoStore.getByEducationId(educationId)
    return info ? '작성완료' : '미작성'
  }

  const columns: ColumnsType<Education> = [
    {
      title: '교육ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120,
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '교육명',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: '상태',
      key: 'status',
      width: 120,
      render: (_, record) => getStatusBadge(record),
    },
    {
      title: '교육 정보',
      key: 'infoStatus',
      width: 120,
      render: (_, record) => {
        const status = getInfoStatus(record.educationId)
        return (
          <Badge
            status={status === '작성완료' ? 'success' : 'warning'}
            text={status}
          />
        )
      },
    },
    {
      title: '교육 기간',
      key: 'period',
      width: 200,
      render: (_, record) => (
        <span>{record.periodStart} ~ {record.periodEnd}</span>
      ),
    },
    {
      title: '관리',
      key: 'actions',
      width: 200,
      align: 'center',
      render: (_, record) => {
        return (
          <Button
            size="small"
            icon={<Eye className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/teacher/attendance/${record.educationId}`)
            }}
          >
            상세
          </Button>
        )
      },
    },
  ]

  const allCount = allEducations.length
  const scheduledCount = allEducations.filter(edu => {
    if (!edu.periodStart) return false
    return dayjs(edu.periodStart).isAfter(dayjs())
  }).length
  const inProgressCount = allEducations.filter(edu => {
    if (!edu.periodStart || !edu.periodEnd) return false
    const now = dayjs()
    const start = dayjs(edu.periodStart)
    const end = dayjs(edu.periodEnd)
    return now.isAfter(start) && now.isBefore(end)
  }).length
  const completedCount = allEducations.filter(edu => {
    if (!edu.periodEnd) return false
    return dayjs(edu.periodEnd).isBefore(dayjs())
  }).length

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              내 학교 수업 목록
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {currentInstitutionName}의 교육 목록입니다.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체</div>
              <div className="text-3xl font-bold text-slate-600">{allCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">예정</div>
              <div className="text-3xl font-bold text-blue-600">{scheduledCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">진행중</div>
              <div className="text-3xl font-bold text-green-600">{inProgressCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">종료</div>
              <div className="text-3xl font-bold text-gray-600">{completedCount}</div>
            </Card>
          </div>

          {/* Search and Table */}
          <Card className="rounded-xl">
            {/* Search and Filters */}
            <div className="mb-4 flex gap-4">
              <Input
                placeholder="교육ID, 교육명으로 검색"
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="max-w-md"
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-40"
                options={[
                  { value: 'all', label: '전체 상태' },
                  { value: '오픈예정', label: '오픈예정' },
                  { value: '강사공개', label: '강사공개' },
                  { value: '신청마감', label: '신청마감' },
                  { value: '확정', label: '확정' },
                  { value: '진행중', label: '진행중' },
                  { value: '종료', label: '종료' },
                ]}
              />
            </div>

            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as any)}
              items={[
                {
                  key: 'all',
                  label: `전체 (${allCount})`,
                },
                {
                  key: 'scheduled',
                  label: `예정 (${scheduledCount})`,
                },
                {
                  key: 'in-progress',
                  label: `진행중 (${inProgressCount})`,
                },
                {
                  key: 'completed',
                  label: `종료 (${completedCount})`,
                },
              ]}
            />

            <Table
              columns={columns}
              dataSource={filteredEducations}
              rowKey="key"
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
