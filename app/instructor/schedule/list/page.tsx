'use client'

import { useState, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Select, DatePicker, Input, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { dataStore } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'

const { RangePicker } = DatePicker

export default function MyScheduleListPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)

  // Get assignments for current instructor (mock: using instructor_demo)
  // TODO: Replace with actual instructor ID from auth context
  const currentInstructorId = 'instructor_demo'
  const currentInstructorName = '홍길동' // Mock instructor name

  const allAssignments = dataStore.getInstructorAssignments()
  
  // Filter assignments where instructor is assigned
  const myAssignments = useMemo(() => {
    return allAssignments.filter(assignment => {
      // Check if instructor is in any lesson
      if (!assignment.lessons) return false
      
      const hasInstructor = assignment.lessons.some(lesson => {
        const mainInstructors = Array.isArray(lesson.mainInstructors) 
          ? lesson.mainInstructors 
          : []
        const assistantInstructors = Array.isArray(lesson.assistantInstructors)
          ? lesson.assistantInstructors
          : []
        
        return mainInstructors.some(inst => inst.name === currentInstructorName) ||
               assistantInstructors.some(inst => inst.name === currentInstructorName)
      })
      
      return hasInstructor
    })
  }, [allAssignments, currentInstructorName])

  const filteredData = useMemo(() => {
    return myAssignments.filter((item) => {
      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase()
        const matchesSearch = 
          item.educationName.toLowerCase().includes(searchLower) ||
          item.institution.toLowerCase().includes(searchLower) ||
          item.educationId.toLowerCase().includes(searchLower)
        if (!matchesSearch) return false
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'confirmed' && item.assignmentStatus !== 'confirmed') return false
        if (statusFilter === 'unconfirmed' && item.assignmentStatus !== 'unconfirmed') return false
        if (statusFilter === 'in-progress' && item.status !== '진행중') return false
        if (statusFilter === 'completed' && item.status !== '완료') return false
      }

      // Role filter (check if instructor is main or assistant)
      if (roleFilter !== 'all') {
        const isMain = item.lessons?.some(lesson => {
          const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
          return mainInstructors.some(inst => inst.name === currentInstructorName)
        })
        const isAssistant = item.lessons?.some(lesson => {
          const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
          return assistantInstructors.some(inst => inst.name === currentInstructorName)
        })
        
        if (roleFilter === 'main' && !isMain) return false
        if (roleFilter === 'assistant' && !isAssistant) return false
      }

      // Date range filter
      if (dateRange && dateRange[0] && dateRange[1]) {
        const itemStart = item.periodStart ? dayjs(item.periodStart) : null
        const itemEnd = item.periodEnd ? dayjs(item.periodEnd) : null
        
        if (itemStart && itemEnd) {
          const filterStart = dateRange[0]
          const filterEnd = dateRange[1]
          
          if (!(itemStart.isAfter(filterStart.subtract(1, 'day')) && itemEnd.isBefore(filterEnd.add(1, 'day')))) {
            return false
          }
        }
      }

      return true
    })
  }, [myAssignments, searchText, statusFilter, roleFilter, dateRange, currentInstructorName])

  const getRoleForAssignment = (assignment: InstructorAssignment): string => {
    if (!assignment.lessons) return '-'
    
    const isMain = assignment.lessons.some(lesson => {
      const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
      return mainInstructors.some(inst => inst.name === currentInstructorName)
    })
    
    return isMain ? '주강사' : '보조강사'
  }

  const getStatusBadge = (assignment: InstructorAssignment) => {
    if (assignment.status === '진행중') {
      return <Badge status="processing" text="진행 중" />
    } else if (assignment.status === '완료') {
      return <Badge status="success" text="완료" />
    } else if (assignment.assignmentStatus === 'confirmed') {
      return <Badge status="default" text="확정" />
    } else {
      return <Badge status="warning" text="대기" />
    }
  }

  const columns: ColumnsType<InstructorAssignment> = [
    {
      title: '교육명',
      dataIndex: 'educationName',
      key: 'educationName',
      width: 250,
      render: (text: string) => <span className="font-medium text-gray-900">{text}</span>,
    },
    {
      title: '교육기관',
      dataIndex: 'institution',
      key: 'institution',
      width: 150,
    },
    {
      title: '일정',
      key: 'period',
      width: 200,
      render: (_, record) => (
        <span>{record.periodStart} ~ {record.periodEnd}</span>
      ),
    },
    {
      title: '역할',
      key: 'role',
      width: 100,
      render: (_, record) => (
        <span className="font-medium">{getRoleForAssignment(record)}</span>
      ),
    },
    {
      title: '상태',
      key: 'status',
      width: 120,
      render: (_, record) => getStatusBadge(record),
    },
    {
      title: '작업',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          size="small"
          icon={<Eye className="w-4 h-4" />}
          onClick={() => router.push(`/instructor/schedule/${record.educationId}`)}
        >
          상세 보기
        </Button>
      ),
    },
  ]

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              내 출강 리스트
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              확정된 출강 일정을 확인하고 관리하세요.
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                placeholder="교육명, 기관명 검색"
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full"
              />
              
              <Select
                placeholder="상태 선택"
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-full"
              >
                <Select.Option value="all">전체</Select.Option>
                <Select.Option value="confirmed">확정</Select.Option>
                <Select.Option value="in-progress">진행 중</Select.Option>
                <Select.Option value="completed">완료</Select.Option>
              </Select>

              <Select
                placeholder="역할 선택"
                value={roleFilter}
                onChange={setRoleFilter}
                className="w-full"
              >
                <Select.Option value="all">전체</Select.Option>
                <Select.Option value="main">주강사</Select.Option>
                <Select.Option value="assistant">보조강사</Select.Option>
              </Select>

              <RangePicker
                className="w-full"
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
                placeholder={['시작일', '종료일']}
              />
            </div>
          </Card>

          {/* Table */}
          <Card>
            <Table
              columns={columns}
              dataSource={filteredData}
              rowKey="key"
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 10,
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


