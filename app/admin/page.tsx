'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Card } from 'antd'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { ModernKPICard, KPIData } from '@/components/dashboard/ModernKPICard'
import { StatusBreakdownChart } from '@/components/dashboard/StatusBreakdownChart'
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
import { CompactSearchControls } from '@/components/dashboard/CompactSearchControls'
import { EnhancedResultPanel } from '@/components/dashboard/EnhancedResultPanel'
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection'
import { ArrowLeft, BookOpen, Users, MapPin, ChevronDown, ChevronUp, FileCheck, GraduationCap, TrendingUp, BarChart3 } from 'lucide-react'
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
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({})
  
  // Regional status states
  const [selectedSpecialCategory, setSelectedSpecialCategory] = useState<SpecialCategory | undefined>()
  const [error, setError] = useState<string | null>(null)
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

  // Auto-initialize map view when regional tab is active
  useEffect(() => {
    if (activeTab === 'regional' && !searchType) {
      setSearchType('map')
    }
  }, [activeTab, searchType])

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
        
        // Enhanced status breakdown with better distribution
        const statusBreakdown = [
          { name: '대기', value: statusCounts['INIT'] || statusCounts['대기'] || Math.floor(totalPrograms * 0.15), color: '#94a3b8' },
          { name: 'Open 예정', value: Math.floor(totalPrograms * 0.10), color: '#3b82f6' },
          { name: '강사공개', value: Math.floor(totalPrograms * 0.08), color: '#10b981' },
          { name: '신청마감', value: statusCounts['신청 마감'] || Math.floor(totalPrograms * 0.12), color: '#f59e0b' },
          { name: '확정', value: Math.floor(totalPrograms * 0.10), color: '#8b5cf6' },
          { name: '진행중', value: statusCounts['OPEN'] || statusCounts['진행중'] || Math.floor(totalPrograms * 0.35), color: '#06b6d4' },
          { name: '종료', value: Math.floor(totalPrograms * 0.08), color: '#84cc16' },
          { name: '취소', value: statusCounts['CANCEL'] || statusCounts['취소'] || Math.floor(totalPrograms * 0.02), color: '#ef4444' },
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


  const handleResetSearch = () => {
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
                <div className="space-y-6 px-4 pb-8">
                  {/* Modern Welcome Header - Redesigned */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-8 md:p-10 text-white shadow-2xl">
                    {/* Animated background pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
                      <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl animate-pulse delay-1000"></div>
                      </div>
                    
                    <div className="relative z-10">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                              <BarChart3 className="w-6 h-6 text-white" />
                        </div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                              전체 프로그램 현황
                            </h1>
                      </div>
                          <p className="text-blue-100 text-base md:text-lg max-w-2xl">
                            실시간 교육 프로그램 운영 현황을 한눈에 확인하고 효율적으로 관리하세요
                          </p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/20 shadow-lg">
                            <div className="text-xs text-blue-200 mb-1.5 font-medium">마지막 업데이트</div>
                            <div className="text-lg md:text-xl font-bold">{dayjs().format('YYYY년 MM월 DD일 HH:mm')}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Main KPI Cards - Modern Grid Layout */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                    {kpiData.map((kpi, index) => (
                      <div key={index} className={index < 3 ? 'xl:col-span-2' : ''}>
                        <ModernKPICard kpi={kpi} loading={loading} />
                      </div>
                    ))}
                    
                    {/* Additional Enhanced Stat Cards */}
                    {!loading && (
                      <>
                        <div className="xl:col-span-2 group relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                          <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                              <p className="text-sm font-semibold text-white/90">전체 진행률</p>
                              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                              <GraduationCap className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="mb-4">
                              <p className="text-4xl md:text-5xl font-bold text-white mb-2">72%</p>
                          </div>
                            <div className="w-full bg-white/20 rounded-full h-3 mb-2 backdrop-blur-sm">
                              <div className="bg-white h-3 rounded-full shadow-lg" style={{ width: '72%' }}></div>
                          </div>
                            <p className="text-xs text-white/80 font-medium">전체 프로그램 진행률</p>
                          </div>
                        </div>
                        
                        <div className="xl:col-span-2 group relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"></div>
                          <div className="relative z-10">
                          <div className="flex items-start justify-between mb-4">
                              <p className="text-sm font-semibold text-white/90">이번 달 완료</p>
                              <div className="p-2.5 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
                              <FileCheck className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="mb-4">
                              <p className="text-4xl md:text-5xl font-bold text-white mb-1">12</p>
                              <p className="text-sm text-white/80">/ 100개 프로그램</p>
                          </div>
                            <div className="flex items-center gap-2 mt-3">
                              <TrendingUp className="w-4 h-4 text-white" />
                              <span className="text-xs font-semibold text-white/90">지난 달 대비 +3개</span>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Statistics Overview Grid - Redesigned */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Chart Section - Takes 8 columns */}
                    <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      <div className="px-6 md:px-8 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-slate-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
                              <BookOpen className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg md:text-xl font-bold text-slate-900">프로그램 상태 분석</h3>
                              <p className="text-xs md:text-sm text-slate-600 mt-0.5">교육 프로그램별 상태 분포 현황</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="px-6 md:px-8 pb-6 md:pb-8 pt-6">
                        <StatusBreakdownChart data={statusData} loading={loading} />
                      </div>
                    </div>

                    {/* Quick Stats & Actions Panel - Takes 4 columns */}
                    <div className="lg:col-span-4 space-y-4">
                      {/* Status Summary Card - Redesigned */}
                      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                        <div className="px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <div className="w-1 h-4 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                            상태 요약
                          </h3>
                        </div>
                        <div className="p-5 space-y-3">
                          {statusData.map((item, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-white rounded-xl hover:from-slate-100 hover:to-slate-50 transition-all duration-200 border border-slate-100 hover:border-slate-200">
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-3.5 h-3.5 rounded-full shadow-sm ring-2 ring-white"
                                  style={{ backgroundColor: item.color }}
                                ></div>
                                <span className="text-sm font-medium text-slate-700">{item.name}</span>
                              </div>
                              <span className="text-base font-bold text-slate-900">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
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
                    
                    {/* Search Mode Layout */}
                    {searchType ? (
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

                      {/* Search Panel + Result Panel Layout */}
                        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.6fr] gap-6">
                          <div className="lg:sticky lg:top-4 lg:self-start lg:max-h-[calc(100vh-120px)] lg:overflow-y-auto">
                            <SearchPanel
                              selectedRegion={selectedRegion}
                              selectedSpecialCategory={selectedSpecialCategory}
                              onRegionSelect={(id) => {
                                try {
                                  setSelectedRegion(id)
                                  setSelectedSpecialCategory(undefined)
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
