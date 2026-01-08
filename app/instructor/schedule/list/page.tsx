'use client'

import { useState, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Select, DatePicker, Input, Badge, Tabs, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { getAttendanceDocs } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { getActivityLogs } from '@/app/instructor/activity-logs/storage'
import { getDocs as getEquipmentDocs } from '@/app/instructor/equipment-confirmations/storage'
import type { AttendanceDocument } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import type { ActivityLog } from '@/app/instructor/activity-logs/types'
import type { EquipmentConfirmationDoc } from '@/app/instructor/equipment-confirmations/types'

const { RangePicker } = DatePicker

export default function MyScheduleListPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'attendance' | 'activity' | 'equipment'>('attendance')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)

  // Get current instructor info
  const currentInstructorName = '홍길동' // Mock instructor name

  // Get all submission data for the instructor
  const allAttendanceDocs = getAttendanceDocs().filter(doc => doc.submittedBy === currentInstructorName)
  const allActivityLogs = getActivityLogs().filter(log => log.submittedBy === currentInstructorName || log.createdBy === currentInstructorName)
  const allEquipmentDocs = getEquipmentDocs().filter(doc => doc.createdByName === currentInstructorName)

  // Create unique education list from all submissions
  const uniqueEducations = useMemo(() => {
    const educationMap = new Map<string, {
      educationId: string
      educationName: string
      institutionName: string
      session: number
      date: string
      startTime: string
      endTime: string
      status: string
    }>()

    // From attendance docs
    allAttendanceDocs.forEach(doc => {
      if (!educationMap.has(doc.educationId)) {
        educationMap.set(doc.educationId, {
          educationId: doc.educationId,
          educationName: doc.programName,
          institutionName: doc.institution,
          session: 1, // Default session
          date: doc.submittedAt ? dayjs(doc.submittedAt).format('YYYY-MM-DD') : '',
          startTime: '09:00',
          endTime: '17:00',
          status: doc.status === 'APPROVED' ? '승인됨' : doc.status === 'REJECTED' ? '반려됨' : '제출됨'
        })
      }
    })

    // From activity logs
    allActivityLogs.forEach(log => {
      const educationId = log.educationId || log.id
      if (!educationMap.has(educationId)) {
        educationMap.set(educationId, {
          educationId,
          educationName: log.educationType ? `${log.educationType} - ${log.institutionName}` : log.institutionName,
          institutionName: log.institutionName,
          session: 1,
          date: log.submittedAt ? dayjs(log.submittedAt).format('YYYY-MM-DD') : '',
          startTime: '09:00',
          endTime: '17:00',
          status: log.status === 'APPROVED' ? '승인됨' : log.status === 'REJECTED' ? '반려됨' : '제출됨'
        })
      }
    })

    // From equipment docs
    allEquipmentDocs.forEach(doc => {
      const educationId = doc.educationId || doc.id
      if (!educationMap.has(educationId)) {
        educationMap.set(educationId, {
          educationId,
          educationName: doc.materialName,
          institutionName: doc.organizationName,
          session: 1,
          date: doc.createdAt ? dayjs(doc.createdAt).format('YYYY-MM-DD') : '',
          startTime: '09:00',
          endTime: '17:00',
          status: doc.status === 'APPROVED' ? '승인됨' : doc.status === 'REJECTED' ? '반려됨' : '제출됨'
        })
      }
    })

    return Array.from(educationMap.values())
  }, [allAttendanceDocs, allActivityLogs, allEquipmentDocs])

  // Use unique educations as myAssignments for filtering
  const myAssignments = uniqueEducations

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


  // Create table data from unique educations
  const tableData = useMemo(() => {
    return filteredData.map((education, index) => ({
      key: `${education.educationId}-${index}`,
      educationId: education.educationId,
      educationName: education.educationName,
      institution: education.institutionName,
      session: education.session,
      date: education.date,
      startTime: education.startTime,
      endTime: education.endTime,
      status: education.status,
      assignmentKey: education.educationId,
    }))
  }, [filteredData])

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
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '교육명',
      dataIndex: 'educationName',
      key: 'educationName',
      width: 200,
    },
    {
      title: '교육기관',
      dataIndex: 'institution',
      key: 'institution',
      width: 150,
    },
    {
      title: '수업 차시',
      dataIndex: 'session',
      key: 'session',
      width: 100,
      render: (session: number) => <span>{session}차시</span>,
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      width: 120,
    },
    {
      title: '시작 시간',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
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
            onClick={(e) => {
              e.stopPropagation()
              if (activeTab === 'attendance') {
                router.push(`/instructor/schedule/${record.educationId}/attendance?session=${record.session}`)
              } else if (activeTab === 'activity') {
                router.push(`/instructor/activity-logs/${record.educationId}`)
              } else if (activeTab === 'equipment') {
                router.push(`/instructor/equipment-confirmations/${record.educationId}`)
              }
            }}
          >
            상세
          </Button>
        </Space>
      ),
    },
  ]

  // Calculate counts for statistics using actual submission data (like admin page)
  const attendanceCount = allAttendanceDocs.length
  const activityCount = allActivityLogs.length
  const equipmentCount = allEquipmentDocs.length

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              내 강의 스케줄
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              강사의 수업 스케줄을 확인하고 문서를 관리할 수 있습니다.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">확정 수업</div>
              <div className="text-3xl font-bold text-blue-600">{attendanceCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">활동 일지</div>
              <div className="text-3xl font-bold text-green-600">{activityCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">교구 확인서</div>
              <div className="text-3xl font-bold text-purple-600">{equipmentCount}</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="mb-6 rounded-xl">
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

          {/* Tabs and Table */}
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
              dataSource={tableData}
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



