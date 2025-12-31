'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from 'antd'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ModernKPICard, KPIData } from '@/components/dashboard/ModernKPICard'
import { AssignmentsTrendChart } from '@/components/dashboard/AssignmentsTrendChart'
import { StatusBreakdownChart } from '@/components/dashboard/StatusBreakdownChart'
import { EvidenceReviewChart } from '@/components/dashboard/EvidenceReviewChart'
import { CompletionRateCard } from '@/components/dashboard/CompletionRateCard'
import { PendingApplicationsPanel } from '@/components/dashboard/PendingApplicationsPanel'
import { ProgramList } from '@/components/dashboard/ProgramList'
import { SearchPanel } from '@/components/dashboard/SearchPanel'
import { ResultPanel } from '@/components/dashboard/ResultPanel'
import { RegionMap } from '@/components/dashboard/RegionMap'
import { ErrorToast } from '@/components/dashboard/ErrorToast'
import { EntryCards } from '@/components/dashboard/EntryCards'
import { CompactSearchControls } from '@/components/dashboard/CompactSearchControls'
import { EnhancedResultPanel } from '@/components/dashboard/EnhancedResultPanel'
import { CollapsibleSection } from '@/components/dashboard/CollapsibleSection'
import { Button } from 'antd'
import { ArrowLeft, BookOpen, Users, GraduationCap, MapPin, ChevronDown, ChevronUp } from 'lucide-react'
import { 
  generateAssignmentsTrendData, 
  statusBreakdownData, 
  evidenceReviewData, 
  kpiMetrics 
} from '@/mock/dashboardAnalytics'
import { dataStore } from '@/lib/dataStore'
import { message } from 'antd'
import { 
  AlertCircle, 
  FileCheck, 
  XCircle 
} from 'lucide-react'
import { type SpecialCategory } from '@/types/region'

export default function AdminDashboardPage() {
  const searchParams = useSearchParams()
  const [selectedRegion, setSelectedRegion] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [kpiData, setKpiData] = useState<KPIData[]>([])
  const [trendData, setTrendData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [reviewData, setReviewData] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<string>('dashboard')
  const [collapsedSections, setCollapsedSections] = useState<{ [key: string]: boolean }>({
    charts: false,
    secondCharts: false,
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
      setLoading(true)
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500))

        // Calculate KPIs from dataStore
        const educations = dataStore.getEducations()
        const applications = dataStore.getInstructorApplications()
        const assignments = dataStore.getInstructorAssignments()

        const totalPrograms = educations.length
        const totalClasses = educations.reduce((sum, e) => sum + (e.totalSessions || 0), 0)
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

        const unassignedClasses = assignments.reduce((sum, a) => {
          return sum + (a.lessons?.filter(l => {
            const mainCount = Array.isArray(l.mainInstructors) ? l.mainInstructors.length : (typeof l.mainInstructors === 'number' ? l.mainInstructors : 0)
            return mainCount < (l.mainInstructorRequired || 0)
          }).length || 0)
        }, 0)

        const pendingEvidence = 45 // Mock data
        const rejectedEvidence = 12 // Mock data

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

        // Calculate trend data from assignments and applications
        const trendDataPoints = generateAssignmentsTrendData()
        
        // Calculate review data (mock for now, can be enhanced with actual evidence data)
        const reviewDataPoints = evidenceReviewData

        // Update KPIs with icons and gradients
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
            label: '전체 수업',
            value: totalClasses.toLocaleString(),
            delta: { value: '지난 주 대비 +124개', isPositive: true },
            description: '전체 수업 세션 수',
            icon: <GraduationCap className="w-5 h-5" />,
            gradient: 'from-emerald-500 via-emerald-600 to-emerald-700',
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
            label: '미배정 수업',
            value: unassignedClasses.toString(),
            delta: { value: '지난 주 대비 -5개', isPositive: true },
            description: '강사가 배정되지 않은 수업',
            icon: <AlertCircle className="w-5 h-5" />,
            gradient: 'from-orange-500 via-orange-600 to-orange-700',
          },
          {
            label: '검토 대기 증빙',
            value: pendingEvidence.toString(),
            delta: { value: '지난 주 대비 +8개', isPositive: false },
            description: '검토가 필요한 증빙 자료',
            icon: <FileCheck className="w-5 h-5" />,
            gradient: 'from-purple-500 via-purple-600 to-purple-700',
          },
          {
            label: '거절된 증빙',
            value: rejectedEvidence.toString(),
            delta: { value: '지난 주 대비 +2개', isPositive: false },
            description: '거절된 증빙 자료 수',
            icon: <XCircle className="w-5 h-5" />,
            gradient: 'from-indigo-500 via-indigo-600 to-indigo-700',
          },
        ]

        setKpiData(kpis)
        setTrendData(trendDataPoints)
        setStatusData(statusBreakdown)
        setReviewData(reviewDataPoints)
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        message.error('데이터를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

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
          </div>

          {/* Tab Content */}
          <Card className="rounded-2xl shadow-lg border border-slate-200 mb-6 bg-gradient-to-br from-white to-slate-50/50">
            <div className="pt-8 px-2">
              {activeTab === 'dashboard' ? (
                <div className="space-y-6">
                  {/* KPI Cards Row */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    {kpiData.map((kpi, index) => (
                      <ModernKPICard key={index} kpi={kpi} loading={loading} />
                    ))}
                  </div>

                  {/* Charts Section - Collapsible */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setCollapsedSections({ ...collapsedSections, charts: !collapsedSections.charts })}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                          <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">차트 분석</h3>
                      </div>
                      {collapsedSections.charts ? (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                    {!collapsedSections.charts && (
                      <div className="px-6 pb-6 border-t border-slate-100">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                          <AssignmentsTrendChart data={trendData} loading={loading} />
                          <StatusBreakdownChart data={statusData} loading={loading} />
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Second Row Charts - Collapsible */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setCollapsedSections({ ...collapsedSections, secondCharts: !collapsedSections.secondCharts })}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                          <FileCheck className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">검토 및 출석 현황</h3>
                      </div>
                      {collapsedSections.secondCharts ? (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                    {!collapsedSections.secondCharts && (
                      <div className="px-6 pb-6 border-t border-slate-100">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                          <EvidenceReviewChart data={reviewData} loading={loading} />
                          <CompletionRateCard
                            rate={82}
                            completed={328}
                            total={400}
                            pending={45}
                            rejected={12}
                            loading={loading}
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Operational Panels - Collapsible */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <button
                      onClick={() => setCollapsedSections({ ...collapsedSections, operational: !collapsedSections.operational })}
                      className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg">
                          <Users className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">운영 패널</h3>
                      </div>
                      {collapsedSections.operational ? (
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                    {!collapsedSections.operational && (
                      <div className="px-6 pb-6 border-t border-slate-100">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-6">
                          <PendingApplicationsPanel />
                          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-3 mb-6">
                              <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                                <FileCheck className="w-5 h-5 text-white" />
                              </div>
                              <h3 className="text-lg font-bold text-slate-900">증빙 검토 대기열</h3>
                            </div>
                            <div className="text-center py-12">
                              <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                                <FileCheck className="w-8 h-8 text-slate-400" />
                              </div>
                              <p className="text-slate-600 font-medium">검토 대기 중인 증빙 자료가 없습니다.</p>
                            </div>
                          </div>
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
                                    
                                    return (
                                      <div
                                        key={regionNumber}
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
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-slate-600">도서·벽지</span>
                                              <span className="font-semibold text-slate-900">{region.items.도서벽지}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-slate-600">50차시</span>
                                              <span className="font-semibold text-slate-900">{region.items['50차시']}</span>
                                            </div>
                                            <div className="flex items-center justify-between text-xs">
                                              <span className="text-slate-600">특수학급</span>
                                              <span className="font-semibold text-slate-900">{region.items.특수학급}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
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
                                    
                                    return (
                                      <div
                                        key={item.label}
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

          {/* Program List Table - Common (visible in all tabs) */}
          <div className="mt-6">
            <ProgramList selectedRegion={selectedRegion} />
          </div>
      </div>
    </ProtectedRoute>
  )
}
