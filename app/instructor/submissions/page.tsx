'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Card, Tabs, Button, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Eye } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import {
  getEducationDocSummariesByInstructor,
  type EducationDocSummary,
} from '@/entities/submission'
import { DocumentStatusIndicator, EducationDetailDrawer } from '@/components/shared/common'
import { getActivityLogByEducationId } from '@/app/instructor/activity-logs/storage'
import dayjs from 'dayjs'

export default function InstructorSubmissionsPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'rejected' | 'approved'>('all')
  const [summaries, setSummaries] = useState<EducationDocSummary[]>([])
  const [selectedEducationId, setSelectedEducationId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    loadSummaries()
  }, [])

  const loadSummaries = () => {
    const instructorName = userProfile?.name || '홍길동'
    const mySummaries = getEducationDocSummariesByInstructor(instructorName)
    setSummaries(mySummaries)
  }

  const filteredSummaries = useMemo(() => {
    if (activeTab === 'all') return summaries
    if (activeTab === 'pending') {
      return summaries.filter(s => s.overallStatus === 'ALL_SUBMITTED' || s.overallStatus === 'PARTIAL')
    }
    if (activeTab === 'rejected') {
      return summaries.filter(s => s.overallStatus === 'REJECTED')
    }
    if (activeTab === 'approved') {
      return summaries.filter(s => s.overallStatus === 'ALL_APPROVED')
    }
    return summaries
  }, [summaries, activeTab])

  const handleViewDetail = (educationId: string) => {
    setSelectedEducationId(educationId)
    setDrawerOpen(true)
  }

  const handleViewAttendance = (educationId: string) => {
    // 교육 출석부 상세보기를 누르면 강사의 activity-logs logId page로 이동
    const activityLog = getActivityLogByEducationId(educationId)
    if (activityLog?.id) {
      router.push(`/instructor/activity-logs/${activityLog.id}`)
    } else {
      // activity log가 없으면 educationId를 사용하여 새로 생성하거나 찾기
      router.push(`/instructor/activity-logs/${educationId}`)
    }
  }

  const handleViewActivity = (id: string) => {
    router.push(`/instructor/activity-logs/${id}`)
  }

  const handleViewEquipment = (id: string) => {
    router.push(`/instructor/equipment-confirmations/${id}`)
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
              // 교육 출석부 상세보기를 누르면 강사의 activity-logs logId page로 이동
              const activityLog = getActivityLogByEducationId(record.educationId)
              if (activityLog?.id) {
                router.push(`/instructor/activity-logs/${activityLog.id}`)
              } else {
                // activity log가 없으면 educationId를 사용하여 새로 생성하거나 찾기
                router.push(`/instructor/activity-logs/${record.educationId}`)
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
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              문서 제출 현황
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              교육별로 제출한 문서의 상태를 확인할 수 있습니다.
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
              isAdmin={false}
              onViewAttendance={handleViewAttendance}
              onViewActivity={handleViewActivity}
              onViewEquipment={handleViewEquipment}
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
