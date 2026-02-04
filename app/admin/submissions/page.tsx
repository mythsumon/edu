'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { Table, Button, Card, Tabs, Space, message, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Eye, CheckCircle2, XCircle, Search } from 'lucide-react'
import { PageHeaderSticky } from '@/components/admin/operations'
import {
  getAllEducationDocSummaries,
  type EducationDocSummary,
} from '@/entities/submission'
import { DocumentStatusIndicator, EducationDetailDrawer } from '@/components/shared/common'
import { upsertAttendanceDoc } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { upsertActivityLog } from '@/app/instructor/activity-logs/storage'
import { upsertDoc } from '@/app/instructor/equipment-confirmations/storage'
import { upsertEvidenceDoc } from '@/app/instructor/evidence/storage'
import { upsertLessonPlan } from '@/app/instructor/schedule/[educationId]/lesson-plan/storage'
import { getLessonPlans } from '@/app/instructor/schedule/[educationId]/lesson-plan/storage'
import type { ActivityLog } from '@/app/instructor/activity-logs/types'
import { getAttendanceDocs } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { getActivityLogs } from '@/app/instructor/activity-logs/storage'
import { getDocs as getEquipmentDocs } from '@/app/instructor/equipment-confirmations/storage'
import { getEvidenceDocs } from '@/app/instructor/evidence/storage'
import { attendanceSheetStore } from '@/lib/attendanceSheetStore'
import dayjs from 'dayjs'

export default function SubmissionsPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'rejected' | 'approved'>('pending')
  const [searchText, setSearchText] = useState('')
  const [summaries, setSummaries] = useState<EducationDocSummary[]>([])
  const [selectedEducationId, setSelectedEducationId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    // Initialize example data if needed (only in development)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      try {
        const { initExampleAttendanceDocs } = require('@/app/instructor/schedule/[educationId]/attendance/initExampleData')
        initExampleAttendanceDocs()
      } catch (error) {
        console.error('Failed to initialize attendance docs:', error)
      }
      try {
        const { initExampleActivityLogs } = require('@/app/instructor/activity-logs/initExampleData')
        initExampleActivityLogs()
      } catch (error) {
        console.error('Failed to initialize activity logs:', error)
      }
      try {
        const { initExampleEquipmentDocs } = require('@/app/instructor/equipment-confirmations/initExampleData')
        initExampleEquipmentDocs()
      } catch (error) {
        console.error('Failed to initialize equipment docs:', error)
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
    window.addEventListener('attendanceSheetUpdated', handleCustomStorageChange)
    window.addEventListener('activityUpdated', handleCustomStorageChange)
    window.addEventListener('equipmentUpdated', handleCustomStorageChange)
    window.addEventListener('evidenceUpdated', handleCustomStorageChange)
    window.addEventListener('lessonPlanUpdated', handleCustomStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('attendanceUpdated', handleCustomStorageChange)
      window.removeEventListener('attendanceSheetUpdated', handleCustomStorageChange)
      window.removeEventListener('activityUpdated', handleCustomStorageChange)
      window.removeEventListener('equipmentUpdated', handleCustomStorageChange)
      window.removeEventListener('evidenceUpdated', handleCustomStorageChange)
      window.removeEventListener('lessonPlanUpdated', handleCustomStorageChange)
    }
  }, [])

  const loadSummaries = () => {
    const allSummaries = getAllEducationDocSummaries()
    setSummaries(allSummaries)
  }

  const filteredSummaries = useMemo(() => {
    let filtered = summaries

    // Tab filter - 강사 페이지와 동일한 로직 사용
    if (activeTab === 'pending') {
      filtered = filtered.filter(s => s.overallStatus === 'ALL_SUBMITTED' || s.overallStatus === 'PARTIAL')
    } else if (activeTab === 'rejected') {
      filtered = filtered.filter(s => s.overallStatus === 'REJECTED')
    } else if (activeTab === 'approved') {
      filtered = filtered.filter(s => s.overallStatus === 'ALL_APPROVED')
    }

    // Search filter - 강사 페이지와 동일한 로직 사용
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
    router.push(`/admin/attendance/${educationId}`)
  }

  const handleViewActivity = (id: string) => {
    router.push(`/admin/activity-logs/${id}`)
  }

  const handleViewEquipment = (id: string) => {
    router.push(`/admin/equipment-confirmations/${id}`)
  }

  const handleViewEvidence = (id: string) => {
    router.push(`/admin/evidence/${id}`)
  }

  const handleViewLessonPlan = (id: string) => {
    router.push(`/admin/lesson-plans/${id}`)
  }

  const handleApprove = async (type: 'attendance' | 'activity' | 'equipment' | 'evidence' | 'lessonPlan', id: string) => {
    try {
      // Check if this is an AttendanceSheet
      if (type === 'attendance') {
        const sheet = attendanceSheetStore.getByEducationId(id) ?? attendanceSheetStore.getById(id)
        if (sheet && sheet.status === 'SUBMITTED_TO_ADMIN') {
          const result = attendanceSheetStore.adminReview(
            sheet.attendanceId,
            { status: 'APPROVED' },
            {
              role: 'admin',
              id: userProfile?.userId || 'admin-1',
              name: userProfile?.name || '관리자',
            }
          )
          if (result) {
            message.success('출석부가 승인되었습니다.')
            loadSummaries()
            setDrawerOpen(false)
            setSelectedEducationId(null)
            return
          }
        }
      }
      
      // Fallback to old system
      if (type === 'attendance') {
        const docs = getAttendanceDocs()
        const doc = docs.find(d => d.id === id)
        if (doc) {
          const updated = {
            ...doc,
            status: 'APPROVED' as const,
            approvedAt: new Date().toISOString(),
            approvedBy: '관리자',
          }
          upsertAttendanceDoc(updated)
          message.success('출석부가 승인되었습니다.')
        }
      } else if (type === 'activity') {
        const logs = getActivityLogs()
        const log = logs.find(l => l.id === id)
        if (log) {
          const updated = {
            ...log,
            status: 'APPROVED' as const,
            approvedAt: new Date().toISOString(),
            approvedBy: '관리자',
          }
          upsertActivityLog(updated)
          message.success('활동 일지가 승인되었습니다.')
        }
      } else if (type === 'equipment') {
        const docs = getEquipmentDocs()
        const doc = docs.find(d => d.id === id)
        if (doc) {
          const updated = {
            ...doc,
            status: 'APPROVED' as const,
            approvedAt: new Date().toISOString(),
            approvedBy: '관리자',
          }
          upsertDoc(updated)
          message.success('교구 확인서가 승인되었습니다.')
        }
      } else if (type === 'evidence') {
        const docs = getEvidenceDocs()
        const doc = docs.find(d => d.id === id)
        if (doc) {
          const updated = {
            ...doc,
            status: 'APPROVED' as const,
            approvedAt: new Date().toISOString(),
            approvedBy: '관리자',
          }
          upsertEvidenceDoc(updated)
          message.success('증빙자료가 승인되었습니다.')
        }
      } else if (type === 'lessonPlan') {
        const docs = getLessonPlans()
        const doc = docs.find(d => d.id === id)
        if (doc) {
          const updated = {
            ...doc,
            status: 'APPROVED' as const,
            approvedAt: new Date().toISOString(),
            approvedBy: userProfile?.name || '관리자',
            updatedAt: new Date().toISOString(),
          }
          upsertLessonPlan(updated)
          message.success('강의계획서가 승인되었습니다.')
        }
      }
      // Trigger custom events for real-time updates
      if (typeof window !== 'undefined') {
        if (type === 'attendance') {
          window.dispatchEvent(new CustomEvent('attendanceUpdated'))
        } else if (type === 'activity') {
          window.dispatchEvent(new CustomEvent('activityUpdated'))
        } else if (type === 'equipment') {
          window.dispatchEvent(new CustomEvent('equipmentUpdated'))
        } else if (type === 'evidence') {
          window.dispatchEvent(new CustomEvent('evidenceUpdated'))
        } else if (type === 'lessonPlan') {
          window.dispatchEvent(new CustomEvent('lessonPlanUpdated'))
        }
      }
      loadSummaries()
      setDrawerOpen(false)
      setSelectedEducationId(null)
    } catch (error) {
      message.error('승인 처리 중 오류가 발생했습니다.')
    }
  }

  const handleReject = async (type: 'attendance' | 'activity' | 'equipment' | 'evidence' | 'lessonPlan', id: string, reason: string) => {
    if (!reason || reason.trim() === '') {
      message.warning('반려 사유를 입력해주세요.')
      return
    }

    try {
      if (type === 'attendance') {
        const docs = getAttendanceDocs()
        const doc = docs.find(d => d.id === id)
        if (doc) {
          const updated = {
            ...doc,
            status: 'REJECTED' as const,
            rejectedAt: new Date().toISOString(),
            rejectedBy: '관리자',
            rejectReason: reason,
          }
          upsertAttendanceDoc(updated)
          message.success('출석부가 반려되었습니다.')
        }
      } else if (type === 'activity') {
        const logs = getActivityLogs()
        const log = logs.find(l => l.id === id)
        if (log) {
          const updated = {
            ...log,
            status: 'REJECTED' as const,
            rejectedAt: new Date().toISOString(),
            rejectedBy: '관리자',
            rejectReason: reason,
          }
          upsertActivityLog(updated)
          message.success('활동 일지가 반려되었습니다.')
        }
      } else if (type === 'equipment') {
        const docs = getEquipmentDocs()
        const doc = docs.find(d => d.id === id)
        if (doc) {
          const updated = {
            ...doc,
            status: 'REJECTED' as const,
            rejectedAt: new Date().toISOString(),
            rejectedBy: '관리자',
            rejectReason: reason,
          }
          upsertDoc(updated)
          message.success('교구 확인서가 반려되었습니다.')
        }
      } else if (type === 'evidence') {
        const docs = getEvidenceDocs()
        const doc = docs.find(d => d.id === id)
        if (doc) {
          const updated = {
            ...doc,
            status: 'REJECTED' as const,
            rejectedAt: new Date().toISOString(),
            rejectedBy: '관리자',
            rejectReason: reason,
          }
          upsertEvidenceDoc(updated)
          message.success('증빙자료가 반려되었습니다.')
        }
      } else if (type === 'lessonPlan') {
        const docs = getLessonPlans()
        const doc = docs.find(d => d.id === id)
        if (doc) {
          const updated = {
            ...doc,
            status: 'REJECTED' as const,
            rejectedAt: new Date().toISOString(),
            rejectedBy: userProfile?.name || '관리자',
            rejectReason: reason,
            updatedAt: new Date().toISOString(),
          }
          upsertLessonPlan(updated)
          message.success('강의계획서가 반려되었습니다.')
        }
      }
      // Trigger custom events for real-time updates
      if (typeof window !== 'undefined') {
        if (type === 'attendance') {
          window.dispatchEvent(new CustomEvent('attendanceUpdated'))
        } else if (type === 'activity') {
          window.dispatchEvent(new CustomEvent('activityUpdated'))
        } else if (type === 'equipment') {
          window.dispatchEvent(new CustomEvent('equipmentUpdated'))
        } else if (type === 'evidence') {
          window.dispatchEvent(new CustomEvent('evidenceUpdated'))
        } else if (type === 'lessonPlan') {
          window.dispatchEvent(new CustomEvent('lessonPlanUpdated'))
        }
      }
      loadSummaries()
      setDrawerOpen(false)
      setSelectedEducationId(null)
    } catch (error) {
      message.error('반려 처리 중 오류가 발생했습니다.')
    }
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
      title: '강사명',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 120,
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
                router.push(`/admin/attendance/${record.educationId}`)
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
                router.push(`/admin/activity-logs/${record.activity.id}`)
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
                router.push(`/admin/equipment-confirmations/${record.equipment.id}`)
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
                router.push(`/admin/evidence/${record.evidence.id}`)
              }
            }}
            educationId={record.educationId}
            documentId={record.evidence?.id}
          />
          <DocumentStatusIndicator
            status={record.lessonPlan?.status}
            count={record.lessonPlan?.count}
            label="강의계획서"
            onClick={() => {
              if (record.lessonPlan?.id) {
                router.push(`/admin/lesson-plans/${record.lessonPlan.id}`)
              }
            }}
            educationId={record.educationId}
            documentId={record.lessonPlan?.id}
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

  const selectedSummary = selectedEducationId 
    ? summaries.find(s => s.educationId === selectedEducationId) || null
    : null

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <PageHeaderSticky
          mode="list"
          onCancel={() => router.back()}
        />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              문서 제출 관리
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              교육별로 제출된 문서를 확인하고 승인/반려할 수 있습니다.
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
                placeholder="교육ID, 교육명, 기관명, 강사명으로 검색"
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
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}건`,
              }}
              scroll={{ x: 'max-content' }}
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
              summary={selectedSummary}
              isAdmin={true}
              onViewAttendance={handleViewAttendance}
              onViewActivity={handleViewActivity}
              onViewEquipment={handleViewEquipment}
              onViewEvidence={handleViewEvidence}
              onViewLessonPlan={handleViewLessonPlan}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
