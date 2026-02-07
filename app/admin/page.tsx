'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from 'antd'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ModernKPICard, KPIData } from '@/components/dashboard/ModernKPICard'
import { StatusBreakdownChart } from '@/components/dashboard/StatusBreakdownChart'
import { PendingApplicationsPanel } from '@/components/dashboard/PendingApplicationsPanel'
import { PendingEvidencePanel } from '@/components/dashboard/PendingEvidencePanel'
import { Table, Badge, Space, Tabs, Button, Input, Tooltip } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Eye, Search } from 'lucide-react'
import { getAttendanceDocs } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { getActivityLogs } from '@/app/instructor/activity-logs/storage'
import { getDocs as getEquipmentDocs } from '@/app/instructor/equipment-confirmations/storage'
import { getEvidenceDocs, upsertEvidenceDoc } from '@/app/instructor/evidence/storage'
import {
  getAllEducationDocSummaries,
  type EducationDocSummary,
} from '@/entities/submission'
import { DocumentStatusIndicator, EducationDetailDrawer } from '@/components/shared/common'
import { upsertAttendanceDoc } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { upsertActivityLog } from '@/app/instructor/activity-logs/storage'
import { upsertDoc } from '@/app/instructor/equipment-confirmations/storage'
import { getLessonPlans, upsertLessonPlan } from '@/app/instructor/schedule/[educationId]/lesson-plan/storage'
import dayjs from 'dayjs'
import { SearchPanel } from '@/components/dashboard/SearchPanel'
import { ResultPanel } from '@/components/dashboard/ResultPanel'
import { RegionMap } from '@/components/dashboard/RegionMap'
import { ErrorToast } from '@/components/dashboard/ErrorToast'
import { EntryCards } from '@/components/dashboard/EntryCards'
import { CompactSearchControls } from '@/components/dashboard/CompactSearchControls'
import { EnhancedResultPanel } from '@/components/dashboard/EnhancedResultPanel'
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection'
import { ArrowLeft, BookOpen, Users, MapPin, ChevronDown, ChevronUp, FileCheck, GraduationCap, TrendingUp } from 'lucide-react'
import { 
  statusBreakdownData, 
  kpiMetrics 
} from '@/mock/dashboardAnalytics'
import { dataStore } from '@/lib/dataStore'
import { message } from 'antd'
import { type SpecialCategory } from '@/types/region'

// KPI Tooltip Helper Function
const getKpiTooltip = (
  type: 'REGION' | 'CATEGORY_REMOTE' | 'CATEGORY_SPECIAL' | 'SESSIONS_50',
  payload?: { regionNumber?: number; regionName?: string }
) => {
  switch (type) {
    case 'REGION': {
      const regionName = payload?.regionName || `${payload?.regionNumber || ''}권역`
      return {
        title: '집계 기준',
        lines: [
          `교육기관 관리에서 등록된 권역(${regionName}) 기준`,
          '해당 권역 교육기관으로 생성된 교육만 포함',
          '교육 상태를 기준으로 진행률/건수를 계산',
        ],
      }
    }
    case 'CATEGORY_REMOTE':
      return {
        title: '집계 기준',
        lines: [
          '교육기관 분류(2분류=도서벽지) 기준',
          '해당 분류 기관에서 생성된 교육만 포함',
        ],
      }
    case 'CATEGORY_SPECIAL':
      return {
        title: '집계 기준',
        lines: [
          '교육기관 분류(2분류=특수학급/일반학교 내 특수학급) 기준',
          '해당 분류 기관에서 생성된 교육만 포함',
        ],
      }
    case 'SESSIONS_50':
      return {
        title: '집계 기준',
        lines: [
          '교육 차시(totalSessions)=50 기준',
          '기관 분류/권역과 무관하게 50차시 교육만 포함',
        ],
      }
    default:
      return { title: '집계 기준', lines: [] }
  }
}

interface SubmissionItem {
  id: string
  type: 'attendance' | 'activity' | 'equipment' | 'evidence'
  educationId: string
  educationName: string
  institutionName: string
  instructorName: string
  submittedAt: string
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  rejectReason?: string
}

export default function AdminDashboardPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState<number | undefined>()
  const [loading, setLoading] = useState(false)
  const [kpiData, setKpiData] = useState<KPIData[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [submissionTab, setSubmissionTab] = useState<'all' | 'pending' | 'rejected' | 'approved'>('pending')
  const [summaries, setSummaries] = useState<EducationDocSummary[]>([])
  const [selectedEducationId, setSelectedEducationId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchText, setSearchText] = useState<string>('')
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    operational: false,
  })
  
  // Regional status states
  const [selectedSpecialCategory, setSelectedSpecialCategory] = useState<SpecialCategory | undefined>()
  const [error, setError] = useState<string | null>(null)
  const [showRegionSelection, setShowRegionSelection] = useState(true)
  const [searchType, setSearchType] = useState<'region' | 'special' | 'map' | null>(null)

  // Initialize region from URL parameter
  useEffect(() => {
    if (searchParams) {
      const regionParam = searchParams.get('region')
      if (regionParam) {
        const regionId = parseInt(regionParam, 10)
        if (!isNaN(regionId) && regionId >= 1 && regionId <= 6) {
          setSelectedRegion(regionId)
        }
      }
    }
  }, [searchParams])

  // Load dashboard data
  useEffect(() => {
    const loadData = async () => {
      setLoading(false) // Remove loading state
      try {
        // Remove API call delay

        // Calculate KPIs from dataStore
        const educations = dataStore.getEducations()
        const applications = dataStore.getInstructorApplications()
        const assignments = dataStore.getInstructorAssignments()

        const totalPrograms = educations.length
        const assignedInstructors = new Set(
          assignments.flatMap(a => 
            a.lessons?.flatMap(l => 
              [
                ...(Array.isArray(l.mainInstructors) ? l.mainInstructors.map(i => i.id) : []),
                ...(Array.isArray(l.assistantInstructors) ? l.assistantInstructors.map(i => i.id) : [])
              ]
            ) || []
          ) || []
        ).size

        // Get actual pending evidence count from storage
        const evidenceDocs = getEvidenceDocs()
        const pendingEvidence = evidenceDocs.filter(doc => doc.status === 'SUBMITTED').length

        // Calculate status breakdown from educations
        const statusCounts: { [key: string]: number } = {}
        educations.forEach(edu => {
          const status = edu.educationStatus || edu.status || '대기'
          statusCounts[status] = (statusCounts[status] || 0) + 1
        })
        
        const statusBreakdown = [
          { name: '대기', value: statusCounts['INIT'] || statusCounts['대기'] || 0, color: '#94a3b8' },
          { name: 'Open 예정', value: 0, color: '#3b82f6' },
          { name: '강사공개', value: 0, color: '#10b981' },
          { name: '신청마감', value: statusCounts['신청 마감'] || 0, color: '#f59e0b' },
          { name: '확정', value: 0, color: '#8b5cf6' },
          { name: '진행중', value: statusCounts['OPEN'] || statusCounts['진행중'] || 0, color: '#06b6d4' },
          { name: '종료', value: 0, color: '#84cc16' },
          { name: '취소', value: statusCounts['CANCEL'] || statusCounts['취소'] || 0, color: '#ef4444' },
        ].filter(item => item.value > 0)

        // Update KPIs with icons and gradients - Main cards only
        const kpis: KPIData[] = [
          {
            label: '전체 프로그램',
            value: totalPrograms.toString(),
            delta: { value: '지난 주 대비 +8개', isPositive: true },
            description: '총 등록된 교육 프로그램 수',
            icon: <BookOpen className="w-5 h-5" />,
            gradient: 'from-blue-500 via-blue-600 to-blue-700',
          },
          {
            label: '배정된 강사',
            value: assignedInstructors.toString(),
            delta: { value: '지난 주 대비 +12명', isPositive: true },
            description: '현재 배정된 강사 수',
            icon: <Users className="w-5 h-5" />,
            gradient: 'from-purple-500 via-purple-600 to-purple-700',
          },
          {
            label: '검토 대기 증빙',
            value: pendingEvidence.toString(),
            delta: { value: '지난 주 대비 +8개', isPositive: false },
            description: '검토가 필요한 증빙 자료',
            icon: <FileCheck className="w-5 h-5" />,
            gradient: 'from-purple-500 via-purple-600 to-purple-700',
          },
        ]

        setKpiData(kpis)
        setStatusData(statusBreakdown)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        message.error('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
    loadSummaries()
  }, [])

  const loadSummaries = () => {
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
    const allSummaries = getAllEducationDocSummaries()
    setSummaries(allSummaries)
  }

  const filteredSummaries = useMemo(() => {
    let filtered = summaries

    // Tab filter
    if (submissionTab === 'pending') {
      filtered = filtered.filter(s => {
        const hasSubmitted = s.attendance?.status === 'SUBMITTED' || 
                            s.activity?.status === 'SUBMITTED' || 
                            s.equipment?.status === 'SUBMITTED' ||
                            s.evidence?.status === 'SUBMITTED' ||
                            s.lessonPlan?.status === 'SUBMITTED'
        return hasSubmitted
      })
    } else if (submissionTab === 'rejected') {
      filtered = filtered.filter(s => s.overallStatus === 'REJECTED')
    } else if (submissionTab === 'approved') {
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
  }, [summaries, submissionTab, searchText])

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
            approvedBy: '관리자',
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
            rejectedBy: '관리자',
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

  // Tooltip texts for each document type (same as instructor dashboard)
  const attendanceTooltip = (
    <div className="text-sm">
      <div className="font-semibold mb-1">출석부 작성 가이드</div>
      <div className="space-y-1">
        <div>• 수업 전: 강사가 학교에 학생 명단 요청</div>
        <div>• 학교 교사: 수업 전 기본 정보 및 학생 명단 입력</div>
        <div>• 수업 중: 보조강사가 출석 체크 (실시간 또는 수업 후 입력 가능)</div>
        <div>• 출석률: 총 차시의 80% 이상 출석 시 수료</div>
        <div>• 서명: 학교 교사, 주강사, 보조강사 서명 필요</div>
      </div>
    </div>
  )
  
  const activityLogTooltip = (
    <div className="text-sm">
      <div className="font-semibold mb-1">활동일지 작성 가이드</div>
      <div className="space-y-1">
        <div>• 주강사와 보조강사는 각각 별도로 활동일지를 작성합니다</div>
        <div>• 각 강사는 자신의 문서에만 서명합니다</div>
        <div>• 수업 내용, 활동 사항, 특이사항 등을 기록합니다</div>
      </div>
    </div>
  )
  
  const lessonPlanTooltip = (
    <div className="text-sm">
      <div className="font-semibold mb-1">강의계획서 작성 가이드</div>
      <div className="space-y-1">
        <div>• 주강사만 작성합니다</div>
        <div>• 교육 시작 전에 제출해야 합니다</div>
        <div>• 교육 목표, 차시별 계획 등을 포함합니다</div>
      </div>
    </div>
  )
  
  const equipmentTooltip = (
    <div className="text-sm">
      <div className="font-semibold mb-1">교구확인서 작성 가이드</div>
      <div className="space-y-1">
        <div>• 별도의 독립적인 양식입니다</div>
        <div>• 수업 시작 전에 완료해야 합니다</div>
        <div>• 승인되지 않으면 수업을 진행할 수 없습니다</div>
        <div>• 대여/반납 정보 및 교구 상태를 기록합니다</div>
      </div>
    </div>
  )
  
  const evidenceTooltip = (
    <div className="text-sm">
      <div className="font-semibold mb-1">증빙자료 업로드 가이드</div>
      <div className="space-y-1">
        <div>• 보조강사가 최소 5장 이상의 사진을 업로드해야 합니다</div>
        <div>• 수업 중 촬영한 사진을 수업 종료 후 업로드합니다</div>
        <div>• 활동 사진은 교육 활동의 증빙 자료로 사용됩니다</div>
      </div>
    </div>
  )

  const submissionColumns: ColumnsType<EducationDocSummary> = [
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
            tooltip={attendanceTooltip}
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
            tooltip={activityLogTooltip}
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
            tooltip={equipmentTooltip}
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
            tooltip={evidenceTooltip}
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
            tooltip={lessonPlanTooltip}
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

  const pendingCount = summaries.filter(s => {
    const hasSubmitted = s.attendance?.status === 'SUBMITTED' || 
                        s.activity?.status === 'SUBMITTED' || 
                        s.equipment?.status === 'SUBMITTED' ||
                        s.evidence?.status === 'SUBMITTED' ||
                        s.lessonPlan?.status === 'SUBMITTED'
    return hasSubmitted
  }).length
  const approvedCount = summaries.filter(s => s.overallStatus === 'ALL_APPROVED').length
  const rejectedCount = summaries.filter(s => s.overallStatus === 'REJECTED').length
  const allCount = summaries.length

  const handleDateRangeChange = (range: string, dates?: any) => {
    console.log('Date range changed:', range, dates)
  }

  const handleExport = () => {
    message.info('내보내기 기능은 준비 중입니다.')
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleBackClick = () => {
    setShowRegionSelection(true)
    setSearchType(null)
    setSelectedRegion(undefined)
    setSelectedSpecialCategory(undefined)
  }

  const handleEntryCardClick = (type: 'region' | 'special' | 'map') => {
    setSearchType(type)
    setShowRegionSelection(false)
    if (type === 'region' || type === 'map') {
      setSelectedSpecialCategory(undefined)
    } else {
      setSelectedRegion(undefined)
    }
  }

  const handleResetSearch = () => {
    setSelectedRegion(undefined)
    setSelectedSpecialCategory(undefined)
  }

  const handleBackToEntry = () => {
    setShowRegionSelection(true)
    setSearchType(null)
    setSelectedRegion(undefined)
    setSelectedSpecialCategory(undefined)
  }

  const regionGradients = {
    1: 'from-blue-500 via-blue-600 to-blue-700',
    2: 'from-orange-500 via-orange-600 to-orange-700',
    3: 'from-yellow-500 via-yellow-600 to-yellow-700',
    4: 'from-green-500 via-green-600 to-green-700',
    5: 'from-purple-500 via-purple-600 to-purple-700',
    6: 'from-cyan-500 via-cyan-600 to-cyan-700',
  }

  const regionColors = {
    1: { bg: '#2563EB', light: '#DBEAFE', text: '#1E40AF' },
    2: { bg: '#F97316', light: '#FFEDD5', text: '#C2410C' },
    3: { bg: '#EAB308', light: '#FEF9C3', text: '#A16207' },
    4: { bg: '#22C55E', light: '#D1FAE5', text: '#15803D' },
    5: { bg: '#A855F7', light: '#E9D5FF', text: '#7C3AED' },
    6: { bg: '#14B8A6', light: '#CCFBF1', text: '#0D9488' },
  }

  const specialItemGradients = {
    '도서·벽지': 'from-orange-400 via-orange-500 to-orange-600',
    '50차시': 'from-green-400 via-green-500 to-green-600',
    '특수학급': 'from-blue-400 via-blue-500 to-blue-600',
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="admin-page p-4 md:p-6">
          {/* Header */}
          <DashboardHeader
            onDateRangeChange={handleDateRangeChange}
            onExport={handleExport}
            onRefresh={handleRefresh}
          />

          {/* Toggle Tabs */}
          <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-1.5 mb-4 md:mb-6 inline-flex gap-1 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 md:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeTab === 'dashboard'
                  ? 'bg-slate-800 text-white shadow-lg scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              대시보드
            </button>
            <button
              onClick={() => setActiveTab('regional')}
              className={`flex-1 md:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeTab === 'regional'
                  ? 'bg-slate-800 text-white shadow-lg scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              권역별 현황
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 md:flex-none px-4 md:px-8 py-2.5 md:py-3 rounded-xl font-semibold text-sm md:text-base transition-all duration-300 ${
                activeTab === 'submissions'
                  ? 'bg-slate-800 text-white shadow-lg scale-105'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              문서 제출 현황
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'submissions' ? (
            /* 문서 제출 현황 탭 */
            <Card className="rounded-2xl shadow-lg border border-slate-200 mb-6">
              <div className="mb-6 pt-6 px-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  문서 제출 현황
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  교육별로 제출된 문서를 확인하고 승인/반려할 수 있습니다.
                </p>
              </div>

              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 px-6">
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

              {/* Search Bar */}
              <div className="mb-4 px-6">
                <Input
                  placeholder="교육ID, 교육명, 기관명, 강사명으로 검색"
                  prefix={<Search className="w-4 h-4 text-gray-400" />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  className="max-w-md"
                />
              </div>

              {/* Tabs as Filters */}
              <div className="px-6 mb-4">
                <Tabs
                  activeKey={submissionTab}
                  onChange={(key) => setSubmissionTab(key as any)}
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
              </div>
              <div className="px-6 pb-6">
                <Table
                  columns={submissionColumns}
                  dataSource={filteredSummaries}
                  rowKey="educationId"
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `총 ${total}건`,
                  }}
                  scroll={{ x: 'max-content' }}
                />
              </div>
            </Card>
          ) : (
            <Card className="rounded-2xl shadow-lg border border-slate-200 mb-6 bg-gradient-to-br from-white to-slate-50/50">
              <div className="pt-8 px-2">
                {activeTab === 'dashboard' ? (
                <div className="space-y-8 px-4 pb-8">
                  {/* Welcome Header Section */}
                  <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 rounded-3xl p-8 text-white shadow-xl">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h1 className="text-3xl font-bold mb-2">전체 프로그램 현황</h1>
                        <p className="text-blue-100 text-lg">실시간 교육 프로그램 운영 현황을 한눈에 확인하세요</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
                          <div className="text-sm text-blue-100 mb-1">마지막 업데이트</div>
                          <div className="text-xl font-semibold">{dayjs().format('YYYY년 MM월 DD일 HH:mm')}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main KPI Cards - Enhanced Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {kpiData.map((kpi, index) => (
                      <ModernKPICard key={index} kpi={kpi} loading={loading} />
                    ))}
                    
                    {/* Additional Stat Cards */}
                    {!loading && (
                      <>
                        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl border border-emerald-200/60 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                          <div className="flex items-start justify-between mb-4">
                            <p className="text-sm font-medium text-emerald-700">진행률</p>
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg">
                              <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="mb-4">
                            <p className="text-4xl font-bold text-emerald-900">72%</p>
                          </div>
                          <div className="w-full bg-emerald-200 rounded-full h-2.5 mb-3">
                            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2.5 rounded-full" style={{ width: '72%' }}></div>
                          </div>
                          <p className="text-xs text-emerald-600">전체 프로그램 진행률</p>
                        </div>
                        
                        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl border border-amber-200/60 p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                          <div className="flex items-start justify-between mb-4">
                            <p className="text-sm font-medium text-amber-700">이번 달 완료</p>
                            <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 shadow-lg">
                              <FileCheck className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="mb-4">
                            <p className="text-4xl font-bold text-amber-900">12</p>
                            <p className="text-sm text-amber-600 mt-1">/ 100개 프로그램</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-amber-600" />
                            <span className="text-xs font-semibold text-amber-700">지난 달 대비 +3개</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Statistics Overview Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart Section - Takes 2 columns */}
                    <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">프로그램 상태 분석</h3>
                              <p className="text-sm text-slate-600 mt-1">교육 프로그램별 상태 분포 현황</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-8 pb-8 pt-8">
                        <StatusBreakdownChart data={statusData} loading={loading} />
                      </div>
                    </div>

                    {/* Quick Stats Panel */}
                    <div className="space-y-6">
                      {/* Status Summary Card */}
                      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                          <h3 className="text-lg font-bold text-slate-900">상태 요약</h3>
                        </div>
                        <div className="p-6 space-y-4">
                          {statusData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full shadow-sm"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                              </div>
                              <span className="text-lg font-bold text-slate-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl border border-indigo-200/60 p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">빠른 작업</h3>
                        <div className="space-y-3">
                          <button 
                            onClick={() => router.push('/admin/education')}
                            className="w-full bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-left transition-colors flex items-center gap-3"
                          >
                            <BookOpen className="w-5 h-5 text-indigo-600" />
                            <span className="font-medium text-slate-700">새 프로그램 등록</span>
                          </button>
                          <button 
                            onClick={() => setActiveTab('submissions')}
                            className="w-full bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-left transition-colors flex items-center gap-3"
                          >
                            <FileCheck className="w-5 h-5 text-indigo-600" />
                            <span className="font-medium text-slate-700">문서 검토하기</span>
                          </button>
                          <button 
                            onClick={() => router.push('/admin/instructor')}
                            className="w-full bg-white hover:bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-3 text-left transition-colors flex items-center gap-3"
                          >
                            <Users className="w-5 h-5 text-indigo-600" />
                            <span className="font-medium text-slate-700">강사 관리</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Operational Panels - Enhanced */}
                  <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
                            <Users className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-slate-900">운영 현황</h3>
                            <p className="text-sm text-slate-600 mt-1">대기 중인 신청서 및 증빙 자료</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setCollapsedSections({ ...collapsedSections, operational: !collapsedSections.operational })}
                          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          {collapsedSections.operational ? (
                            <ChevronDown className="w-5 h-5 text-slate-500" />
                          ) : (
                            <ChevronUp className="w-5 h-5 text-slate-500" />
                          )}
                        </button>
                      </div>
                    </div>
                    {!collapsedSections.operational && (
                      <div className="px-8 pb-8 pt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <PendingApplicationsPanel />
                          <PendingEvidencePanel />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  {error && (
                    <ErrorToast
                      message={error}
                      onClose={() => setError(null)}
                    />
                  )}
                  
                  <div className="mb-6">
                    <div className="w-full flex items-center p-5 bg-white rounded-card shadow-card mb-6 border border-gray-100">
                      <h2 className="text-[20px] font-bold">
                        <span className="text-slate-900 font-semibold">주요 지표</span>{' '}
                        <span className="text-blue-600 font-medium">
                          (경기 미래채움 권역별 데이터를 한 눈에 보기)
                        </span>
                      </h2>
                    </div>
                    
                    {/* Stage 1: Entry Cards */}
                    {showRegionSelection && !searchType ? (
                      <div className="bg-white rounded-card shadow-card p-8 border border-gray-200">
                        <EntryCards
                          onRegionSelect={() => handleEntryCardClick('region')}
                          onSpecialItemSelect={() => handleEntryCardClick('special')}
                          onMapSelect={() => handleEntryCardClick('map')}
                        />
                      </div>
                    ) : searchType ? (
                      /* Stage 2: Search Mode Layout */
                      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 transition-all duration-300 ease-in-out">
                        {/* Left: Compact Search Controls */}
                        <CompactSearchControls
                          searchType={searchType}
                          selectedRegion={selectedRegion}
                          selectedSpecialCategory={selectedSpecialCategory}
                          onRegionSelect={(id) => {
                            setSelectedRegion(id)
                            setSelectedSpecialCategory(undefined)
                          }}
                          onCategorySelect={(category) => {
                            setSelectedSpecialCategory(category)
                            setSelectedRegion(undefined)
                          }}
                          onReset={handleResetSearch}
                          onBack={handleBackToEntry}
                        />
                        
                        {/* Right: Enhanced Result Panel */}
                        <div className="flex-1 min-w-0">
                          <EnhancedResultPanel
                            searchType={searchType}
                            selectedRegion={selectedRegion}
                            selectedSpecialCategory={selectedSpecialCategory}
                            onRegionChange={(id) => {
                              setSelectedRegion(id)
                              setSelectedSpecialCategory(undefined)
                            }}
                            onCategoryClose={() => {
                              setSelectedSpecialCategory(undefined)
                            }}
                            onCategorySelect={(category) => {
                              setSelectedSpecialCategory(category)
                              setSelectedRegion(undefined)
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      /* Legacy fallback - keeping for compatibility */
                      <div className="bg-white rounded-card shadow-card p-6 border border-gray-200">
                        <div className="space-y-8">
                      {/* Enhanced Divider */}
                      <div className="relative py-4">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t-2 border-gradient-to-r from-transparent via-blue-300 to-transparent"></div>
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-gradient-to-r from-blue-50 to-slate-50 px-6 py-2 text-sm font-semibold text-slate-700 rounded-full border border-blue-200 shadow-sm">
                            권역별 교육 진행 현황
                          </span>
                        </div>
                      </div>

                      {/* Region Selection Mode */}
                      {showRegionSelection ? (
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-slate-200/50 p-8 lg:p-10">
                          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-8">
                            {/* Left Side - Region Cards */}
                            <div className="space-y-8">
                              {/* Region Cards */}
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                  <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                                  권역별 교육 진행 현황
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {[1, 2, 3, 4, 5, 6].map((regionNumber) => {
                                    const regionData = [
                                      { regionNumber: 1, progress: 60, educationProgress: 60, items: { 도서벽지: 10, '50차시': 50, 특수학급: 1000 } },
                                      { regionNumber: 2, progress: 75, educationProgress: 70, items: { 도서벽지: 15, '50차시': 60, 특수학급: 1200 } },
                                      { regionNumber: 3, progress: 45, educationProgress: 50, items: { 도서벽지: 8, '50차시': 40, 특수학급: 800 } },
                                      { regionNumber: 4, progress: 80, educationProgress: 75, items: { 도서벽지: 20, '50차시': 70, 특수학급: 1500 } },
                                      { regionNumber: 5, progress: 55, educationProgress: 55, items: { 도서벽지: 12, '50차시': 45, 특수학급: 900 } },
                                      { regionNumber: 6, progress: 70, educationProgress: 65, items: { 도서벽지: 18, '50차시': 55, 특수학급: 1100 } },
                                    ]
                                    const region = regionData.find(r => r.regionNumber === regionNumber)
                                    if (!region) return null
                                    
                                    const color = regionColors[regionNumber as keyof typeof regionColors]
                                    const isSelected = selectedRegion === regionNumber
                                    
                                    const tooltipContent = getKpiTooltip('REGION', { regionNumber })
                                    
                                    return (
                                      <Tooltip
                                        key={regionNumber}
                                        title={
                                          <div className="py-1">
                                            <div className="font-semibold text-white mb-2">{tooltipContent.title}</div>
                                            <ul className="list-none space-y-1 m-0 p-0">
                                              {tooltipContent.lines.map((line, idx) => (
                                                <li key={idx} className="text-white text-sm before:content-['•'] before:mr-2">
                                                  {line}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        }
                                        placement="top"
                                        overlayStyle={{ maxWidth: '300px' }}
                                      >
                                        <div
                                          onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            try {
                                              setSelectedRegion(regionNumber)
                                              setSelectedSpecialCategory(undefined)
                                              setShowRegionSelection(false)
                                            } catch (error) {
                                              console.error('Error selecting region:', error)
                                            }
                                          }}
                                          className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
                                            isSelected 
                                              ? 'shadow-2xl scale-105 ring-4 ring-offset-2' 
                                              : 'shadow-lg hover:shadow-xl hover:scale-[1.02]'
                                          }`}
                                          style={{
                                            background: isSelected 
                                              ? `linear-gradient(135deg, ${color.light} 0%, white 100%)`
                                              : 'white',
                                            border: isSelected ? `3px solid ${color.bg}` : '2px solid #e2e8f0',
                                          }}
                                        >
                                        <div 
                                          className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${regionGradients[regionNumber as keyof typeof regionGradients]} opacity-10 rounded-bl-full transition-opacity duration-300 group-hover:opacity-20`}
                                        />
                                        
                                        <div className="relative p-4">
                                          <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-1.5">
                                              <div 
                                                className="w-2.5 h-2.5 rounded-full shadow-sm"
                                                style={{ backgroundColor: color.bg }}
                                              />
                                              <span className="text-base font-bold" style={{ color: color.text }}>
                                                {regionNumber}권역
                                              </span>
                                            </div>
                                            {isSelected && (
                                              <div className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                                                선택됨
                                              </div>
                                            )}
                                          </div>

                                          <div className="flex justify-center mb-3">
                                            <div className="relative w-20 h-20">
                                              <svg className="transform -rotate-90 w-20 h-20">
                                                <circle
                                                  cx="40"
                                                  cy="40"
                                                  r="32"
                                                  stroke="#e2e8f0"
                                                  strokeWidth="6"
                                                  fill="none"
                                                />
                                                <circle
                                                  cx="40"
                                                  cy="40"
                                                  r="32"
                                                  stroke={color.bg}
                                                  strokeWidth="6"
                                                  fill="none"
                                                  strokeDasharray={`${2 * Math.PI * 32}`}
                                                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - region.progress / 100)}`}
                                                  strokeLinecap="round"
                                                  className="transition-all duration-500"
                                                />
                                              </svg>
                                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-xl font-bold" style={{ color: color.text }}>
                                                  {region.progress}%
                                                </span>
                                                <span className="text-[10px] text-slate-500">진행률</span>
                                              </div>
                                            </div>
                                          </div>

                                          <div className="mb-3">
                                            <div className="flex items-center justify-between mb-1.5">
                                              <span className="text-xs text-slate-600">교육 진행률</span>
                                              <span className="text-xs font-semibold" style={{ color: color.text }}>
                                                {region.educationProgress}%
                                              </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                              <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                  width: `${region.educationProgress}%`,
                                                  background: `linear-gradient(90deg, ${color.bg} 0%, ${color.bg}CC 100%)`,
                                                }}
                                              />
                                            </div>
                                          </div>

                                          <div className="space-y-1.5 pt-3 border-t border-slate-100">
                                            <Tooltip
                                              title={
                                                <div className="py-1">
                                                  <div className="font-semibold text-white mb-2">{getKpiTooltip('CATEGORY_REMOTE').title}</div>
                                                  <ul className="list-none space-y-1 m-0 p-0">
                                                    {getKpiTooltip('CATEGORY_REMOTE').lines.map((line, idx) => (
                                                      <li key={idx} className="text-white text-sm before:content-['•'] before:mr-2">
                                                        {line}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              }
                                              placement="top"
                                              overlayStyle={{ maxWidth: '300px' }}
                                            >
                                              <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600">도서·벽지</span>
                                                <span className="font-semibold text-slate-900">{region.items.도서벽지}</span>
                                              </div>
                                            </Tooltip>
                                            <Tooltip
                                              title={
                                                <div className="py-1">
                                                  <div className="font-semibold text-white mb-2">{getKpiTooltip('SESSIONS_50').title}</div>
                                                  <ul className="list-none space-y-1 m-0 p-0">
                                                    {getKpiTooltip('SESSIONS_50').lines.map((line, idx) => (
                                                      <li key={idx} className="text-white text-sm before:content-['•'] before:mr-2">
                                                        {line}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              }
                                              placement="top"
                                              overlayStyle={{ maxWidth: '300px' }}
                                            >
                                              <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600">50차시</span>
                                                <span className="font-semibold text-slate-900">{region.items['50차시']}</span>
                                              </div>
                                            </Tooltip>
                                            <Tooltip
                                              title={
                                                <div className="py-1">
                                                  <div className="font-semibold text-white mb-2">{getKpiTooltip('CATEGORY_SPECIAL').title}</div>
                                                  <ul className="list-none space-y-1 m-0 p-0">
                                                    {getKpiTooltip('CATEGORY_SPECIAL').lines.map((line, idx) => (
                                                      <li key={idx} className="text-white text-sm before:content-['•'] before:mr-2">
                                                        {line}
                                                      </li>
                                                    ))}
                                                  </ul>
                                                </div>
                                              }
                                              placement="top"
                                              overlayStyle={{ maxWidth: '300px' }}
                                            >
                                              <div className="flex items-center justify-between text-xs">
                                                <span className="text-slate-600">특수학급</span>
                                                <span className="font-semibold text-slate-900">{region.items.특수학급}</span>
                                              </div>
                                            </Tooltip>
                                          </div>
                                        </div>
                                      </div>
                                      </Tooltip>
                                    )
                                  })}
                                </div>
                              </div>
                              
                              {/* Special Items Cards */}
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                  <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                                  특수 항목별 세부조회
                                </h3>
                                <div className="grid grid-cols-1 gap-3">
                                  {[
                                    { label: '도서·벽지 진행률', category: '도서·벽지' as SpecialCategory, progress: 50, completed: 10, target: 20, color: '#F97316', icon: BookOpen },
                                    { label: '50차시 진행률', category: '50차시' as SpecialCategory, progress: 75, completed: 15, target: 20, color: '#22C55E', icon: GraduationCap },
                                    { label: '특수학급 진행률', category: '특수학급' as SpecialCategory, progress: 60, completed: 12, target: 20, color: '#3B82F6', icon: Users },
                                  ].map((item) => {
                                    const isSelected = selectedSpecialCategory === item.category
                                    const Icon = item.icon
                                    
                                    // Determine tooltip type based on category
                                    let tooltipType: 'CATEGORY_REMOTE' | 'CATEGORY_SPECIAL' | 'SESSIONS_50' = 'CATEGORY_REMOTE'
                                    if (item.category === '특수학급') {
                                      tooltipType = 'CATEGORY_SPECIAL'
                                    } else if (item.category === '50차시') {
                                      tooltipType = 'SESSIONS_50'
                                    }
                                    
                                    const tooltipContent = getKpiTooltip(tooltipType)
                                    
                                    return (
                                      <Tooltip
                                        key={item.label}
                                        title={
                                          <div className="py-1">
                                            <div className="font-semibold text-white mb-2">{tooltipContent.title}</div>
                                            <ul className="list-none space-y-1 m-0 p-0">
                                              {tooltipContent.lines.map((line, idx) => (
                                                <li key={idx} className="text-white text-sm before:content-['•'] before:mr-2">
                                                  {line}
                                                </li>
                                              ))}
                                            </ul>
                                          </div>
                                        }
                                        placement="top"
                                        overlayStyle={{ maxWidth: '300px' }}
                                      >
                                        <div
                                          onClick={(e) => {
                                            e.preventDefault()
                                            e.stopPropagation()
                                            try {
                                              setSelectedSpecialCategory(item.category)
                                              setSelectedRegion(undefined)
                                              setShowRegionSelection(false)
                                            } catch (error) {
                                              console.error('Error selecting special category:', error)
                                            }
                                          }}
                                          className={`group relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ${
                                            isSelected 
                                              ? 'shadow-2xl scale-105 ring-4 ring-offset-2' 
                                              : 'shadow-lg hover:shadow-xl hover:scale-[1.02]'
                                          }`}
                                          style={{
                                            background: isSelected 
                                              ? `linear-gradient(135deg, ${item.color}15 0%, white 100%)`
                                              : 'white',
                                            border: isSelected ? `3px solid ${item.color}` : '2px solid #e2e8f0',
                                          }}
                                        >
                                        <div 
                                          className={`absolute top-0 right-0 w-40 h-40 bg-gradient-to-br ${specialItemGradients[item.category as keyof typeof specialItemGradients]} opacity-10 rounded-bl-full transition-opacity duration-300 group-hover:opacity-20`}
                                        />
                                        
                                            <div className="relative p-4">
                                              <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                  <div 
                                                    className="p-2 rounded-lg shadow-sm"
                                                    style={{ backgroundColor: `${item.color}20` }}
                                                  >
                                                    <Icon className="w-4 h-4" style={{ color: item.color }} />
                                                  </div>
                                                  <div>
                                                    <div className="text-xs text-slate-600 mb-0.5">{item.label}</div>
                                                    <div className="text-2xl font-bold text-slate-900">{item.progress}%</div>
                                                  </div>
                                                </div>
                                                {isSelected && (
                                                  <div className="px-1.5 py-0.5 text-xs font-semibold rounded-full" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                                                    선택됨
                                                  </div>
                                                )}
                                              </div>
                                              
                                              <div className="mb-2">
                                                <div className="flex items-center justify-between text-xs text-slate-600 mb-1.5">
                                                  <span>목표 {item.target}개 중 {item.completed}개 완료</span>
                                                  <span className="font-semibold">{item.completed}/{item.target}</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                                  <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                      width: `${item.progress}%`,
                                                      background: `linear-gradient(90deg, ${item.color} 0%, ${item.color}DD 100%)`,
                                                    }}
                                                  />
                                                </div>
                                              </div>
                                            </div>
                                        </div>
                                      </Tooltip>
                                    )
                                  })}
                                </div>
                              </div>
                            </div>
                            
                            {/* Right Side - Map */}
                            <div>
                              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                                권역 지도
                              </h3>
                              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-slate-200/50 p-6">
                                <RegionMap 
                                  selectedRegion={selectedRegion} 
                                  onRegionSelect={(id) => {
                                    setSelectedRegion(id)
                                    setSelectedSpecialCategory(undefined)
                                    setShowRegionSelection(false)
                                  }} 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Search Panel + Result Panel Layout */
                        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.6fr] gap-6">
                          <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
                            <div className="mb-4">
                              <Button
                                icon={<ArrowLeft className="w-4 h-4" />}
                                onClick={handleBackClick}
                                className="w-full h-11 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-medium transition-all shadow-lg hover:shadow-xl"
                              >
                                뒤로
                              </Button>
                            </div>
                            <SearchPanel
                              selectedRegion={selectedRegion}
                              selectedSpecialCategory={selectedSpecialCategory}
                              onRegionSelect={(id) => {
                                try {
                                  setSelectedRegion(id)
                                  setSelectedSpecialCategory(undefined)
                                  setShowRegionSelection(false)
                                } catch (error) {
                                  console.error('Error selecting region:', error)
                                }
                              }}
                              onCategorySelect={(category) => {
                                try {
                                  setSelectedSpecialCategory(category)
                                  setSelectedRegion(undefined)
                                } catch (error) {
                                  console.error('Error selecting category:', error)
                                }
                              }}
                              onReset={() => {
                                try {
                                  setSelectedRegion(undefined)
                                  setSelectedSpecialCategory(undefined)
                                } catch (error) {
                                  console.error('Error resetting selection:', error)
                                }
                              }}
                            />
                          </div>

                          <div className="min-h-[600px]">
                            <ResultPanel
                              selectedRegion={selectedRegion}
                              selectedSpecialCategory={selectedSpecialCategory}
                              onRegionChange={(id) => {
                                try {
                                  setSelectedRegion(id)
                                  setSelectedSpecialCategory(undefined)
                                } catch (error) {
                                  console.error('Error changing region:', error)
                                }
                              }}
                              onCategoryClose={() => {
                                try {
                                  setSelectedSpecialCategory(undefined)
                                } catch (error) {
                                  console.error('Error closing category:', error)
                                }
                              }}
                              onCategorySelect={(category) => {
                                try {
                                  setSelectedSpecialCategory(category)
                                  setSelectedRegion(undefined)
                                } catch (error) {
                                  console.error('Error selecting category:', error)
                                }
                              }}
                            />
                          </div>
                        </div>
                      )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Card>
          )}


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
    </ProtectedRoute>
  )
}
