'use client'

import { useState, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Card, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { dataStore } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'

export default function ConfirmedClassesPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  
  // Get confirmed assignments for current instructor
  const currentInstructorName = '홍길동' // Mock instructor name
  const allAssignments = dataStore.getInstructorAssignments()
  
  const confirmedAssignments = useMemo(() => {
    return allAssignments.filter(assignment => {
      // Only confirmed assignments
      if (assignment.assignmentStatus !== 'confirmed') return false
      
      // Check if instructor is assigned
      if (!assignment.lessons) return false
      
      return assignment.lessons.some(lesson => {
        const mainInstructors = Array.isArray(lesson.mainInstructors) 
          ? lesson.mainInstructors 
          : []
        const assistantInstructors = Array.isArray(lesson.assistantInstructors)
          ? lesson.assistantInstructors
          : []
        
        return mainInstructors.some(inst => inst.name === currentInstructorName && inst.status === 'confirmed') ||
               assistantInstructors.some(inst => inst.name === currentInstructorName && inst.status === 'confirmed')
      })
    })
  }, [allAssignments, currentInstructorName])

  const filteredData = useMemo(() => {
    return confirmedAssignments.filter((item) => {
      if (searchText) {
        const searchLower = searchText.toLowerCase()
        return (
          item.educationName.toLowerCase().includes(searchLower) ||
          item.institution.toLowerCase().includes(searchLower) ||
          item.educationId.toLowerCase().includes(searchLower)
        )
      }
      return true
    })
  }, [confirmedAssignments, searchText])

  const columns: ColumnsType<InstructorAssignment> = [
    {
      title: '교육ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 150,
    },
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
      title: '지역',
      dataIndex: 'region',
      key: 'region',
      width: 120,
    },
    {
      title: '학년학급',
      dataIndex: 'gradeClass',
      key: 'gradeClass',
      width: 120,
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
      title: '작업',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <span
          className="text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
          onClick={() => router.push(`/instructor/schedule/${record.educationId}`)}
        >
          <Eye className="w-4 h-4" />
          상세 보기
        </span>
      ),
    },
  ]

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              확정된 수업 조회
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              확정된 수업 일정을 조회하세요.
            </p>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <Input
              placeholder="교육명, 기관명 검색"
              prefix={<Search className="w-4 h-4 text-gray-400" />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full max-w-md"
            />
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
              onRow={(record) => ({
                onClick: () => router.push(`/instructor/schedule/${record.educationId}`),
                className: 'cursor-pointer',
              })}
            />
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}



