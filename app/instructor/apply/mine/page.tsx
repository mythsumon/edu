'use client'

import { useState, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Card, Input, Badge } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { dataStore } from '@/lib/dataStore'
import type { InstructorApplication, InstructorAssignment } from '@/lib/dataStore'

export default function MyApplicationsPage() {
  const router = useRouter()
  const [searchText, setSearchText] = useState('')
  const currentInstructorName = '홍길동' // Mock instructor name - TODO: Get from auth context
  
  // Get applications for current instructor
  const allApplications = dataStore.getInstructorApplications()
  const allAssignments = dataStore.getInstructorAssignments()
  
  const myApplications = useMemo(() => {
    return allApplications.filter(app => app.instructorName === currentInstructorName)
  }, [allApplications, currentInstructorName])

  // Enhance applications with assignment status (확정됨, 삭제됨)
  const enhancedApplications = useMemo(() => {
    return myApplications.map(app => {
      const assignment = allAssignments.find(a => a.educationId === app.educationId)
      
      // Check if instructor is confirmed in assignment
      let finalStatus: '수락됨' | '거절됨' | '대기' | '삭제됨' | '확정됨' = app.status
      let isDeleted = false
      
      if (assignment && assignment.lessons) {
        const isConfirmed = assignment.lessons.some(lesson => {
          const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
          const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
          
          const isMainConfirmed = mainInstructors.some(
            inst => inst.name === currentInstructorName && inst.status === 'confirmed'
          )
          const isAssistantConfirmed = assistantInstructors.some(
            inst => inst.name === currentInstructorName && inst.status === 'confirmed'
          )
          
          return isMainConfirmed || isAssistantConfirmed
        })
        
        // Check if instructor was removed (was in application but not in assignment)
        const wasInApplication = app.status === '수락됨' || app.status === '대기'
        const isInAssignment = assignment.lessons.some(lesson => {
          const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
          const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
          
          return mainInstructors.some(inst => inst.name === currentInstructorName) ||
                 assistantInstructors.some(inst => inst.name === currentInstructorName)
        })
        
        if (wasInApplication && !isInAssignment && assignment.assignmentStatus === 'confirmed') {
          isDeleted = true
          finalStatus = '삭제됨'
        } else if (isConfirmed) {
          finalStatus = '확정됨'
        }
      }
      
      return {
        ...app,
        finalStatus,
        isDeleted,
      }
    })
  }, [myApplications, allAssignments, currentInstructorName])

  const filteredData = useMemo(() => {
    return enhancedApplications.filter((item) => {
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
  }, [enhancedApplications, searchText])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case '확정됨':
        return <Badge status="success" text="확정됨" />
      case '수락됨':
        return <Badge status="success" text="수락됨" />
      case '대기':
        return <Badge status="processing" text="대기" />
      case '거절됨':
        return <Badge status="error" text="거절됨" />
      case '삭제됨':
        return <Badge status="default" text="삭제됨" />
      default:
        return <Badge status="default" text={status} />
    }
  }

  const columns: ColumnsType<any> = [
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
      title: '신청 역할',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => (
        <span className="font-medium">{role}</span>
      ),
    },
    {
      title: '신청일',
      dataIndex: 'applicationDate',
      key: 'applicationDate',
      width: 120,
    },
    {
      title: '상태',
      key: 'status',
      width: 120,
      render: (_, record) => getStatusBadge(record.finalStatus),
    },
    {
      title: '작업',
      key: 'action',
      width: 120,
      render: (_, record) => (
        <span
          className="text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
          onClick={() => router.push(`/instructor/apply/mine/${record.key}`)}
        >
          <Eye className="w-4 h-4" />
          상세 보기
        </span>
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
              내가 신청한 교육들
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              신청한 교육의 상태를 확인하세요.
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
                onClick: () => router.push(`/instructor/apply/mine/${record.key}`),
                className: 'cursor-pointer',
              })}
            />
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}



