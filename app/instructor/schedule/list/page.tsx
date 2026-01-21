'use client'

import { useState, useMemo, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Select, DatePicker, Input, Badge, Tabs, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, Eye } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import dayjs from 'dayjs'
import { getAttendanceDocs } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { getActivityLogs, getActivityLogByEducationId } from '@/app/instructor/activity-logs/storage'
import { getDocs as getEquipmentDocs, getDocByEducationId, createDocFromDefault, upsertDoc } from '@/app/instructor/equipment-confirmations/storage'
import { getEvidenceDocByEducationId } from '@/app/instructor/evidence/storage'
import { getLessonPlanByEducationId } from '@/app/instructor/schedule/[educationId]/lesson-plan/storage'
import {
  getEducationDocSummariesByInstructor,
  type EducationDocSummary,
} from '@/entities/submission'
import { DocumentStatusIndicator, EducationDetailDrawer } from '@/components/shared/common'
import { dataStore } from '@/lib/dataStore'
import type { AttendanceDocument } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import type { ActivityLog } from '@/app/instructor/activity-logs/types'
import type { EquipmentConfirmationDoc } from '@/app/instructor/equipment-confirmations/types'

const { RangePicker } = DatePicker

export default function MyScheduleListPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'rejected' | 'approved'>('all')
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null)
  const [summaries, setSummaries] = useState<EducationDocSummary[]>([])
  const [selectedEducationId, setSelectedEducationId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  // Get current instructor info
  const currentInstructorName = userProfile?.name || '홍길동' // Mock instructor name

  // Check URL params for educationId and open drawer if present
  useEffect(() => {
    const educationIdParam = searchParams?.get('educationId')
    if (educationIdParam && summaries.length > 0) {
      const summary = summaries.find(s => s.educationId === educationIdParam)
      if (summary) {
        setSelectedEducationId(educationIdParam)
        setDrawerOpen(true)
        // Clean up URL parameter
        const newUrl = window.location.pathname
        router.replace(newUrl)
      }
    }
  }, [searchParams, summaries, router])

  useEffect(() => {
    // Initialize dummy data in development mode
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      // Check if we need to reset localStorage (if old data exists)
      const attendanceKey = 'attendance_documents'
      const activityKey = 'activity_logs'
      const equipmentKey = 'equipment_confirmation_docs'
      
      const attendanceStored = localStorage.getItem(attendanceKey)
      const activityStored = localStorage.getItem(activityKey)
      const equipmentStored = localStorage.getItem(equipmentKey)
      
      // If stored data exists, check if it has old educationId format (edu-001, etc.)
      // If so, reset to new dummy data
      if (attendanceStored || activityStored || equipmentStored) {
        try {
          const attendanceData = attendanceStored ? JSON.parse(attendanceStored) : []
          const hasOldFormat = attendanceData.some((doc: any) => doc.educationId?.startsWith('edu-'))
          
          if (hasOldFormat) {
            // Reset all storage to new dummy data
            localStorage.removeItem(attendanceKey)
            localStorage.removeItem(activityKey)
            localStorage.removeItem(equipmentKey)
            console.log('Reset localStorage to new dummy data format')
          }
        } catch (e) {
          console.warn('Failed to check localStorage format', e)
        }
      }
    }
    
    loadSummaries()

    // Listen for storage changes to update data in real-time
    const handleStorageChange = () => {
      loadSummaries()
    }

    // Listen for custom storage events (triggered when data is updated)
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events from same window
    const handleCustomStorageChange = () => {
      loadSummaries()
    }
    
    window.addEventListener('attendanceUpdated', handleCustomStorageChange)
    window.addEventListener('activityUpdated', handleCustomStorageChange)
    window.addEventListener('equipmentUpdated', handleCustomStorageChange)
    window.addEventListener('evidenceUpdated', handleCustomStorageChange)
    window.addEventListener('lessonPlanUpdated', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('attendanceUpdated', handleCustomStorageChange)
      window.removeEventListener('activityUpdated', handleCustomStorageChange)
      window.removeEventListener('equipmentUpdated', handleCustomStorageChange)
      window.removeEventListener('evidenceUpdated', handleCustomStorageChange)
      window.removeEventListener('lessonPlanUpdated', handleCustomStorageChange)
    }
  }, [currentInstructorName, userProfile])

  const loadSummaries = () => {
    const allSummaries = getEducationDocSummariesByInstructor(currentInstructorName)
    
    // Filter: Only show educations where current instructor is assigned as main or assistant instructor
    const assignedSummaries = allSummaries.filter(summary => {
      if (!userProfile) return false
      
      const assignment = dataStore.getInstructorAssignmentByEducationId(summary.educationId)
      if (!assignment || !assignment.lessons || assignment.lessons.length === 0) {
        return false // No assignment data = not assigned
      }

      // Check if user is main or assistant instructor in any lesson
      let isAssigned = false

      assignment.lessons.forEach(lesson => {
        // Check main instructors
        if (lesson.mainInstructors && lesson.mainInstructors.length > 0) {
          const isMain = lesson.mainInstructors.some(instructor => {
            return instructor.id === userProfile.userId || 
                   instructor.name === userProfile.name ||
                   (instructor.id && userProfile.userId && 
                    instructor.id.replace('instructor-', '') === userProfile.userId.replace('instructor-', ''))
          })
          if (isMain) isAssigned = true
        }

        // Check assistant instructors
        if (lesson.assistantInstructors && lesson.assistantInstructors.length > 0) {
          const isAssistant = lesson.assistantInstructors.some(instructor => {
            return instructor.id === userProfile.userId || 
                   instructor.name === userProfile.name ||
                   (instructor.id && userProfile.userId && 
                    instructor.id.replace('instructor-', '') === userProfile.userId.replace('instructor-', ''))
          })
          if (isAssistant) isAssigned = true
        }
      })

      return isAssigned
    })
    
    setSummaries(assignedSummaries)
  }

  const filteredSummaries = useMemo(() => {
    let filtered = summaries

    // Tab filter
    if (activeTab === 'pending') {
      filtered = filtered.filter(s => s.overallStatus === 'ALL_SUBMITTED' || s.overallStatus === 'PARTIAL')
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(s => s.overallStatus === 'REJECTED')
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(s => s.overallStatus === 'ALL_APPROVED')
    }

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(s => {
        return (
          s.educationId.toLowerCase().includes(searchLower) ||
          s.educationName.toLowerCase().includes(searchLower) ||
          s.institutionName.toLowerCase().includes(searchLower) ||
          s.instructorName.toLowerCase().includes(searchLower)
        )
      })
    }

    return filtered
  }, [summaries, activeTab, searchText])

  const handleViewDetail = (educationId: string) => {
    setSelectedEducationId(educationId)
    setDrawerOpen(true)
  }

  const handleViewAttendance = (educationId: string) => {
    // 교육 출석부 상세보기를 누르면 /instructor/attendance/[id]로 이동
    // 먼저 출석부 문서를 찾고, 없으면 /instructor/schedule/[educationId]/attendance로 이동
    const { getAttendanceDocByEducationId } = require('@/app/instructor/schedule/[educationId]/attendance/storage')
    const attendanceDoc = getAttendanceDocByEducationId(educationId)
    
    if (attendanceDoc?.id) {
      router.push(`/instructor/attendance/${attendanceDoc.id}`)
    } else {
      // 출석부가 없으면 작성 페이지로 이동
      router.push(`/instructor/schedule/${educationId}/attendance`)
    }
  }

  const handleViewActivity = (id: string) => {
    // id가 educationId 형태일 수도 있으므로 확인
    const activityLog = getActivityLogByEducationId(id)
    if (activityLog?.id) {
      router.push(`/instructor/activity-logs/${activityLog.id}`)
    } else {
      // activity log가 없으면 id를 사용하여 새로 생성하거나 찾기
      router.push(`/instructor/activity-logs/${id}`)
    }
  }

  const handleViewEquipment = (id: string) => {
    // id가 educationId 형태일 수도 있으므로 확인
    const existingDoc = getDocByEducationId(id)
    if (existingDoc) {
      router.push(`/instructor/equipment-confirmations/${existingDoc.id}`)
    } else {
      // educationId로 새로 생성
      const newDoc = createDocFromDefault({ educationId: id })
      upsertDoc(newDoc)
      router.push(`/instructor/equipment-confirmations/${newDoc.id}`)
    }
  }

  const handleViewEvidence = (id: string) => {
    const evidenceDoc = getEvidenceDocByEducationId(id)
    if (evidenceDoc?.id) {
      router.push(`/instructor/evidence/${evidenceDoc.id}`)
    } else {
      router.push(`/instructor/evidence/new?educationId=${id}`)
    }
  }

  const handleViewLessonPlan = (id: string) => {
    router.push(`/instructor/schedule/${id}/lesson-plan`)
  }

  // Get instructor role for a specific education
  const getInstructorRole = (educationId: string): '주강사' | '보조강사' | '-' => {
    if (!userProfile) return '-'
    
    const assignment = dataStore.getInstructorAssignmentByEducationId(educationId)
    if (!assignment || !assignment.lessons || assignment.lessons.length === 0) {
      return '-'
    }

    // Check all lessons to find if user is main or assistant instructor
    let isMainInstructor = false
    let isAssistantInstructor = false

    assignment.lessons.forEach(lesson => {
      // Check main instructors
      if (lesson.mainInstructors && lesson.mainInstructors.length > 0) {
        const isMain = lesson.mainInstructors.some(instructor => {
          return instructor.id === userProfile.userId || 
                 instructor.name === userProfile.name ||
                 (instructor.id && userProfile.userId && 
                  instructor.id.replace('instructor-', '') === userProfile.userId.replace('instructor-', ''))
        })
        if (isMain) isMainInstructor = true
      }

      // Check assistant instructors
      if (lesson.assistantInstructors && lesson.assistantInstructors.length > 0) {
        const isAssistant = lesson.assistantInstructors.some(instructor => {
          return instructor.id === userProfile.userId || 
                 instructor.name === userProfile.name ||
                 (instructor.id && userProfile.userId && 
                  instructor.id.replace('instructor-', '') === userProfile.userId.replace('instructor-', ''))
        })
        if (isAssistant) isAssistantInstructor = true
      }
    })

    if (isMainInstructor) return '주강사'
    if (isAssistantInstructor) return '보조강사'
    return '-'
  }

  const getOverallStatusBadge = (status: string) => {
    if (status === 'ALL_APPROVED') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200">
          전체 승인
        </span>
      )
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200">
          반려됨
        </span>
      )
    }
    if (status === 'ALL_SUBMITTED') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
          전체 제출
        </span>
      )
    }
    if (status === 'PARTIAL') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 border border-amber-200">
          일부 제출
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-gray-50 to-gray-100 text-gray-700 border border-gray-200">
        대기
      </span>
    )
  }

  const columns: ColumnsType<EducationDocSummary> = [
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
      title: '기관명',
      dataIndex: 'institutionName',
      key: 'institutionName',
      width: 150,
    },
    {
      title: '역할',
      key: 'role',
      width: 100,
      align: 'center',
      render: (_, record) => {
        const role = getInstructorRole(record.educationId)
        if (role === '주강사') {
          return (
            <Badge
              status="success"
              text={
                <span className="font-semibold text-blue-600 dark:text-blue-400">주강사</span>
              }
            />
          )
        }
        if (role === '보조강사') {
          return (
            <Badge
              status="default"
              text={
                <span className="font-semibold text-gray-600 dark:text-gray-400">보조강사</span>
              }
            />
          )
        }
        return <span className="text-gray-400">-</span>
      },
    },
    {
      title: '문서 상태',
      key: 'docStatus',
      width: 300,
      render: (_, record) => (
        <div className="flex flex-col gap-2">
          <DocumentStatusIndicator
            status={record.attendance?.status}
            count={record.attendance?.count}
            label="출석부"
            onClick={() => {
              if (record.attendance?.id) {
                router.push(`/instructor/schedule/${record.educationId}/attendance`)
              } else {
                router.push(`/instructor/schedule/${record.educationId}/attendance`)
              }
            }}
            educationId={record.educationId}
            documentId={record.attendance?.id}
          />
          <DocumentStatusIndicator
            status={record.activity?.status}
            count={record.activity?.count}
            label="활동일지"
            onClick={() => {
              if (record.activity?.id) {
                router.push(`/instructor/activity-logs/${record.activity.id}`)
              } else {
                // Create new activity log
                const { getActivityLogByEducationId } = require('@/app/instructor/activity-logs/storage')
                const existingLog = getActivityLogByEducationId(record.educationId)
                if (existingLog && existingLog.id) {
                  router.push(`/instructor/activity-logs/${existingLog.id}`)
                } else {
                  router.push(`/instructor/activity-logs/new?educationId=${record.educationId}`)
                }
              }
            }}
            educationId={record.educationId}
            documentId={record.activity?.id}
          />
          <DocumentStatusIndicator
            status={record.equipment?.status}
            count={record.equipment?.count}
            label="교구확인서"
            onClick={() => {
              if (record.equipment?.id) {
                router.push(`/instructor/equipment-confirmations/${record.equipment.id}`)
              } else {
                // Create new equipment doc
                const { getDocByEducationId, createDocFromDefault, upsertDoc } = require('@/app/instructor/equipment-confirmations/storage')
                const existingDoc = getDocByEducationId(record.educationId)
                if (existingDoc) {
                  router.push(`/instructor/equipment-confirmations/${existingDoc.id}`)
                } else {
                  const newDoc = createDocFromDefault({ educationId: record.educationId })
                  upsertDoc(newDoc)
                  router.push(`/instructor/equipment-confirmations/${newDoc.id}`)
                }
              }
            }}
            educationId={record.educationId}
            documentId={record.equipment?.id}
          />
          <DocumentStatusIndicator
            status={record.evidence?.status}
            count={record.evidence?.count}
            label="증빙자료"
            onClick={() => {
              if (record.evidence?.id) {
                router.push(`/instructor/evidence/${record.evidence.id}`)
              } else {
                router.push(`/instructor/evidence/new?educationId=${record.educationId}`)
              }
            }}
            educationId={record.educationId}
            documentId={record.evidence?.id}
          />
        </div>
      ),
    },
    {
      title: '전체 상태',
      dataIndex: 'overallStatus',
      key: 'overallStatus',
      width: 120,
      render: (status: string) => getOverallStatusBadge(status),
    },
    {
      title: '최종 수정일',
      dataIndex: 'lastUpdatedAt',
      key: 'lastUpdatedAt',
      width: 150,
      render: (date?: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
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
            onClick={() => handleViewDetail(record.educationId)}
          >
            상세
          </Button>
        </Space>
      ),
    },
  ]

  const pendingCount = summaries.filter(s => s.overallStatus === 'ALL_SUBMITTED' || s.overallStatus === 'PARTIAL').length
  const approvedCount = summaries.filter(s => s.overallStatus === 'ALL_APPROVED').length
  const rejectedCount = summaries.filter(s => s.overallStatus === 'REJECTED').length
  const allCount = summaries.length

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              내 강의 스케줄
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              강사의 수업 스케줄을 확인하고 문서를 관리할 수 있습니다.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체</div>
              <div className="text-3xl font-bold text-slate-600">{allCount}</div>
            </Card>
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

          {/* Tabs as Filters */}
          <Card className="rounded-xl">
            {/* Search Bar */}
            <div className="mb-4">
              <Input
                placeholder="교육ID, 교육명, 기관명으로 검색"
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="max-w-md"
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
                  key: 'pending',
                  label: `미제출 있음 (${pendingCount})`,
                },
                {
                  key: 'rejected',
                  label: `반려 있음 (${rejectedCount})`,
                },
                {
                  key: 'approved',
                  label: `승인 완료 (${approvedCount})`,
                },
              ]}
            />

            <Table
              columns={columns}
              dataSource={filteredSummaries}
              rowKey="educationId"
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}건`,
              }}
            />
          </Card>

          {/* Detail Drawer */}
          {selectedEducationId && (
            <EducationDetailDrawer
              open={drawerOpen}
              onClose={() => {
                setDrawerOpen(false)
                setSelectedEducationId(null)
              }}
              educationId={selectedEducationId}
              summary={summaries.find(s => s.educationId === selectedEducationId) || null}
              isAdmin={false}
              onViewAttendance={handleViewAttendance}
              onViewActivity={handleViewActivity}
              onViewEquipment={handleViewEquipment}
              onViewEvidence={handleViewEvidence}
              onViewLessonPlan={handleViewLessonPlan}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}



