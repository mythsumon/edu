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

  // Flatten assignments to lessons for table display
  const tableData = useMemo(() => {
    const data: Array<{
      key: string
      educationId: string
      educationName: string
      institution: string
      session: number
      date: string
      startTime: string
      endTime: string
      status: string
      assignmentKey: string
    }> = []
    
    filteredData.forEach((assignment) => {
      if (assignment.lessons && assignment.lessons.length > 0) {
        assignment.lessons.forEach((lesson) => {
          // Check if instructor is in this lesson
          const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
          const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
          
          const isInLesson = mainInstructors.some(inst => inst.name === currentInstructorName) ||
                            assistantInstructors.some(inst => inst.name === currentInstructorName)
          
          if (isInLesson) {
            data.push({
              key: `${assignment.key}-${lesson.session}`,
              educationId: assignment.educationId,
              educationName: assignment.educationName,
              institution: assignment.institution,
              session: lesson.session || 0,
              date: lesson.date || '',
              startTime: lesson.startTime || '',
              endTime: lesson.endTime || '',
              status: assignment.assignmentStatus === 'confirmed' ? '1차 확정' : '대기',
              assignmentKey: assignment.key,
            })
          }
        })
      }
    })
    
    return data
  }, [filteredData, currentInstructorName])

  const getStatusBadge = (status: string) => {
    if (status === '1차 확정') {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
          {status}
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
          {status}
        </span>
      )
    }
  }

  const columns: ColumnsType<any> = [
    {
      title: '교육ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120,
      render: (text: string) => <span className="text-sm font-medium text-gray-900">{text}</span>,
    },
    {
      title: '수업 상태',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusBadge(status),
    },
    {
      title: '교육명',
      dataIndex: 'educationName',
      key: 'educationName',
      width: 200,
      render: (text: string) => <span className="text-sm font-medium text-gray-900">{text}</span>,
    },
    {
      title: '교육기관',
      dataIndex: 'institution',
      key: 'institution',
      width: 150,
      render: (text: string) => <span className="text-sm text-gray-700">{text}</span>,
    },
    {
      title: '수업 차시',
      dataIndex: 'session',
      key: 'session',
      width: 100,
      render: (session: number) => <span className="text-sm text-gray-700">{session}차시</span>,
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => <span className="text-sm text-gray-700">{date}</span>,
    },
    {
      title: '시작 시간',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
      render: (time: string) => <span className="text-sm text-gray-700">{time}</span>,
    },
    {
      title: '교육 출석부',
      key: 'attendance',
      width: 120,
      align: 'center' as const,
      render: (_, record) => (
        <Button
          size="small"
          icon={<Eye className="w-3 h-3" />}
          onClick={(e) => {
            e.stopPropagation()
            router.push(`/instructor/schedule/${record.educationId}/attendance?session=${record.session}`)
          }}
          className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-gray-900"
        >
          상세
        </Button>
      ),
    },
    {
      title: '교육 활동 일지',
      key: 'activity',
      width: 120,
      align: 'center' as const,
      render: (_, record) => (
        <Button
          size="small"
          icon={<Eye className="w-3 h-3" />}
          onClick={(e) => {
            e.stopPropagation()
            // Navigate to activity log detail page using educationId as logId
            // If activity log doesn't exist, it will create a new one
            router.push(`/instructor/activity-logs/${record.educationId}`)
          }}
          className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-gray-900"
        >
          상세
        </Button>
      ),
    },
    {
      title: '교구 확인서',
      key: 'material',
      width: 120,
      align: 'center' as const,
      render: (_, record) => (
        <Button
          size="small"
          icon={<Eye className="w-3 h-3" />}
          onClick={(e) => {
            e.stopPropagation()
            // Navigate to equipment confirmation detail page
            // Use educationId as doc id, create if not exists
            const docId = record.educationId
            router.push(`/instructor/equipment-confirmations/${docId}`)
          }}
          className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 hover:border-gray-400 text-gray-700 hover:text-gray-900"
        >
          상세
        </Button>
      ),
    },
  ]

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
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
              dataSource={tableData}
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



