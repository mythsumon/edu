'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { StatusChangeToolbar } from '@/components/admin/operations/StatusChangeToolbar'
import { EducationStatusTable, type EducationStatusItem } from '@/components/admin/operations/EducationStatusTable'
import { InstructorAssignmentModal } from '@/components/admin/operations/InstructorAssignmentModal'
import { ScheduleTimeModal } from '@/components/admin/operations/ScheduleTimeModal'
import { Card, Input, Button, Select, DatePicker, Modal, message, Space, Badge } from 'antd'
import { Search, Filter, ChevronRight, RotateCcw } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import { statusOptions } from '@/components/admin/operations/StatusDropdown'
import { 
  getAllowedNextStatuses, 
  isIrreversibleTransition,
  type EducationStatus 
} from '@/components/admin/operations/statusTransitions'
import { attendanceSheetStore } from '@/lib/attendanceSheetStore'
import { dataStore, type Education } from '@/lib/dataStore'
import { educationScheduler } from '@/lib/educationScheduler'

const { RangePicker } = DatePicker

export interface FilterValues {
  status?: string
  dateRange?: [Dayjs | null, Dayjs | null] | null
}

// Dummy data - in production, this would come from an API
const dummyData: EducationStatusItem[] = [
  {
    key: '1',
    status: '신청 마감',
    educationId: 'EDU-2025-001',
    name: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    institution: '경기미래채움',
    gradeClass: '1학년 3반',
    mainInstructorsCount: 2,
    mainInstructorsRequired: 2,
    assistantInstructorsCount: 1,
    assistantInstructorsRequired: 1,
    mainInstructorNames: ['홍길동', '최주강'],
    assistantInstructorNames: ['김보조'],
    periodStart: '2025.01.15',
    periodEnd: '2025.02.28',
    period: '2025.01.15 ~ 2025.02.28',
  },
  {
    key: '2',
    status: '교육 예정',
    educationId: 'EDU-2025-002',
    name: '도서벽지 지역 특별 교육',
    institution: '수원교육청',
    gradeClass: '2학년 1반',
    mainInstructorsCount: 1,
    mainInstructorsRequired: 2,
    assistantInstructorsCount: 0,
    assistantInstructorsRequired: 1,
    mainInstructorNames: ['우수정'],
    assistantInstructorNames: [],
    periodStart: '2025.01.10',
    periodEnd: '2025.03.10',
    period: '2025.01.10 ~ 2025.03.10',
  },
  {
    key: '3',
    status: '강사 공개',
    educationId: 'EDU-2025-003',
    name: '특수학급 교사 역량 강화',
    institution: '성남교육청',
    gradeClass: '3학년 2반',
    mainInstructorsCount: 1,
    mainInstructorsRequired: 1,
    assistantInstructorsCount: 2,
    assistantInstructorsRequired: 2,
    mainInstructorNames: ['강주강'],
    assistantInstructorNames: ['이보조', '정보조'],
    periodStart: '2024.12.01',
    periodEnd: '2025.01.31',
    period: '2024.12.01 ~ 2025.01.31',
  },
  {
    key: '4',
    status: '확정',
    educationId: 'EDU-2025-004',
    name: '50차시 프로그램 운영 교육',
    institution: '안양교육청',
    gradeClass: '4학년 4반',
    mainInstructorsCount: 3,
    mainInstructorsRequired: 3,
    assistantInstructorsCount: 2,
    assistantInstructorsRequired: 2,
    mainInstructorNames: ['홍길동', '최주강', '강주강'],
    assistantInstructorNames: ['김보조', '박보조'],
    periodStart: '2025.02.01',
    periodEnd: '2025.04.30',
    period: '2025.02.01 ~ 2025.04.30',
  },
  {
    key: '5',
    status: '교육 진행 중',
    educationId: 'EDU-2025-005',
    name: '신규 강사 오리엔테이션',
    institution: '고양교육청',
    gradeClass: '5학년 1반',
    mainInstructorsCount: 2,
    mainInstructorsRequired: 2,
    assistantInstructorsCount: 1,
    assistantInstructorsRequired: 1,
    mainInstructorNames: ['우수정', '최주강'],
    assistantInstructorNames: ['윤보조'],
    periodStart: '2025.01.20',
    periodEnd: '2025.02.20',
    period: '2025.01.20 ~ 2025.02.20',
  },
  {
    key: '6',
    status: '대기',
    educationId: 'EDU-2025-006',
    name: '창의융합 인공지능 교육',
    institution: '의정부교육청',
    gradeClass: '6학년 2반',
    mainInstructorsCount: 1,
    mainInstructorsRequired: 1,
    assistantInstructorsCount: 1,
    assistantInstructorsRequired: 1,
    mainInstructorNames: ['홍길동'],
    assistantInstructorNames: ['이보조'],
    periodStart: '2025.03.01',
    periodEnd: '2025.03.31',
    period: '2025.03.01 ~ 2025.03.31',
  },
  {
    key: '7',
    status: '종료',
    educationId: 'EDU-2024-100',
    name: '2024년 하반기 특별 프로그램',
    institution: '부천교육청',
    gradeClass: '4학년 3반',
    mainInstructorsCount: 2,
    mainInstructorsRequired: 2,
    assistantInstructorsCount: 1,
    assistantInstructorsRequired: 1,
    mainInstructorNames: ['박정아', '홍길동'],
    assistantInstructorNames: ['김윤미'],
    periodStart: '2024.11.01',
    periodEnd: '2024.12.15',
    period: '2024.11.01 ~ 2024.12.15',
  },
  {
    key: '8',
    status: '중지',
    educationId: 'EDU-2025-007',
    name: '중단된 교육 프로그램',
    institution: '구리교육청',
    gradeClass: '2학년 5반',
    mainInstructorsCount: 1,
    mainInstructorsRequired: 2,
    assistantInstructorsCount: 0,
    assistantInstructorsRequired: 1,
    mainInstructorNames: ['우수정'],
    assistantInstructorNames: [],
    periodStart: '2025.01.05',
    periodEnd: '2025.02.05',
    period: '2025.01.05 ~ 2025.02.05',
  },
]

export default function EducationStatusPage() {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [statusValue, setStatusValue] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})
  const [searchText, setSearchText] = useState<string>('')
  const filterDropdownRef = useRef<HTMLDivElement>(null)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [assignmentMode, setAssignmentMode] = useState<'partial' | 'full' | null>('partial')
  const [statusChangeModalVisible, setStatusChangeModalVisible] = useState(false)
  const [pendingStatusChange, setPendingStatusChange] = useState<{
    id: string
    currentStatus: string
    newStatus: EducationStatus
  } | null>(null)
  const [data, setData] = useState<EducationStatusItem[]>(dummyData)
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false)
  const [selectedEducationForSchedule, setSelectedEducationForSchedule] = useState<Education | null>(null)

  // 교육 상태 업데이트 이벤트 리스너
  useEffect(() => {
    const handleStatusUpdate = () => {
      // dataStore에서 최신 데이터 가져오기
      const educations = dataStore.getEducations()
      const updatedData = educations.map(edu => {
        const existing = data.find(d => d.educationId === edu.educationId)
        if (existing) {
          return {
            ...existing,
            status: edu.status,
            openAt: edu.openAt,
            closeAt: edu.closeAt,
          }
        }
        // 새로운 교육인 경우
        return {
          key: edu.key,
          status: edu.status,
          educationId: edu.educationId,
          name: edu.name,
          institution: edu.institution,
          gradeClass: edu.gradeClass,
          mainInstructorsCount: 0,
          mainInstructorsRequired: 1,
          assistantInstructorsCount: 0,
          assistantInstructorsRequired: 1,
          mainInstructorNames: [],
          assistantInstructorNames: [],
          periodStart: edu.periodStart,
          periodEnd: edu.periodEnd,
          period: edu.period,
          openAt: edu.openAt,
          closeAt: edu.closeAt,
        } as EducationStatusItem
      })
      
      setData(updatedData)
    }

    window.addEventListener('educationStatusUpdated', handleStatusUpdate)
    window.addEventListener('storage', handleStatusUpdate)

    return () => {
      window.removeEventListener('educationStatusUpdated', handleStatusUpdate)
      window.removeEventListener('storage', handleStatusUpdate)
    }
  }, [data])
  
  // Bulk status change helpers for scheduled transitions
  const handleBulkOpenToPublic = () => {
    // Bulk change 오픈예정 → 강사공개 (for 21:00 scheduled change)
    const openScheduled = data.filter(item => item.status === '오픈예정')
    if (openScheduled.length === 0) {
      message.info('오픈예정 상태인 교육이 없습니다.')
      return
    }
    
    Modal.confirm({
      title: '일괄 상태 변경',
      content: `오픈예정 상태인 ${openScheduled.length}개 교육을 강사공개로 변경하시겠습니까?`,
      onOk: () => {
        // Update dataStore for each education
        openScheduled.forEach(item => {
          const education = dataStore.getEducationById(item.educationId)
          if (education) {
            dataStore.updateEducation(item.educationId, { status: '강사공개' })
          }
        })
        
        // Update local state
        setData(prev => prev.map(item => 
          item.status === '오픈예정' ? { ...item, status: '강사공개' } : item
        ))
        setSelectedIds([])
        message.success(`${openScheduled.length}개 교육이 강사공개로 변경되었습니다.`)
      },
    })
  }
  
  const handleBulkPublicToClosed = () => {
    // Bulk change 강사공개 → 신청마감 (for next day scheduled change)
    const publicEducations = data.filter(item => item.status === '강사공개')
    if (publicEducations.length === 0) {
      message.info('강사공개 상태인 교육이 없습니다.')
      return
    }
    
    Modal.confirm({
      title: '일괄 상태 변경',
      content: `강사공개 상태인 ${publicEducations.length}개 교육을 신청마감으로 변경하시겠습니까?`,
      onOk: () => {
        // Update dataStore for each education
        publicEducations.forEach(item => {
          const education = dataStore.getEducationById(item.educationId)
          if (education) {
            dataStore.updateEducation(item.educationId, { status: '신청마감' })
          }
        })
        
        // Update local state
        setData(prev => prev.map(item => 
          item.status === '강사공개' ? { ...item, status: '신청마감' } : item
        ))
        setSelectedIds([])
        message.success(`${publicEducations.length}개 교육이 신청마감으로 변경되었습니다.`)
      },
    })
  }
  
  // Local filter state for dropdown
  const [tempStatusFilter, setTempStatusFilter] = useState<string>('')
  const [tempDateRange, setTempDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false)
      }
    }

    if (filterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filterDropdownOpen])

  // Filter data based on filters and search
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Search filter - 교육 기관명 검색만
      if (searchText) {
        const searchLower = searchText.toLowerCase()
        const matchesSearch = item.institution.toLowerCase().includes(searchLower)
        if (!matchesSearch) {
          return false
        }
      }

      // Status filter
      if (filters.status && item.status !== filters.status) {
        return false
      }

      // Date range filter
      if (filters.dateRange && filters.dateRange[0] && filters.dateRange[1]) {
        const itemStart = item.periodStart ? dayjs(item.periodStart) : null
        const itemEnd = item.periodEnd ? dayjs(item.periodEnd) : null
        
        if (itemStart && itemEnd) {
          const filterStart = filters.dateRange[0]
          const filterEnd = filters.dateRange[1]
          
          if (!(itemStart.isAfter(filterStart.subtract(1, 'day')) && itemEnd.isBefore(filterEnd.add(1, 'day')))) {
            return false
          }
        }
      }

      return true
    })
  }, [filters, searchText])

  const totalItems = filteredData.length

  const handlePageChange = (page: number, size: number) => {
    setCurrentPage(page)
    setPageSize(size)
    // Reset selection when page changes
    setSelectedIds([])
  }

  const handleFilterApply = () => {
    setFilters({
      status: tempStatusFilter || undefined,
      dateRange: tempDateRange,
    })
    setCurrentPage(1)
    setSelectedIds([])
    setFilterDropdownOpen(false)
  }

  const handleFilterReset = () => {
    setTempStatusFilter('')
    setTempDateRange(null)
    setFilters({})
    setSearchText('')
    setCurrentPage(1)
    setSelectedIds([])
    setFilterDropdownOpen(false)
  }
  
  // Initialize temp filters when dropdown opens
  useEffect(() => {
    if (filterDropdownOpen) {
      setTempStatusFilter(filters.status || '')
      setTempDateRange(filters.dateRange || null)
    }
  }, [filterDropdownOpen, filters])

  const handleSearch = () => {
    setCurrentPage(1)
    setSelectedIds([])
  }

  // Row selection handlers
  const handleToggleRow = (id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  const handleToggleAll = (selected: boolean) => {
    if (selected) {
      // Select all items on current page
      const start = (currentPage - 1) * pageSize
      const end = start + pageSize
      const currentPageData = filteredData.slice(start, end)
      setSelectedIds(currentPageData.map((row) => row.key))
    } else {
      setSelectedIds([])
    }
  }

  // Action handlers
  const handleAssignPartial = () => {
    if (selectedIds.length === 0) {
      // Show message or return early if no selection
      return
    }
    setAssignmentMode('partial')
    setAssignmentModalOpen(true)
  }

  const handleAssignAll = () => {
    if (selectedIds.length === 0) {
      // Show message or return early if no selection
      return
    }
    setAssignmentMode('full')
    setAssignmentModalOpen(true)
  }

  const handleAssignmentConfirm = (selectedInstructorIds: string[]) => {
    console.log(`${assignmentMode === 'partial' ? '부분' : '전체'} 주강사 배정:`, {
      educationIds: selectedIds,
      instructorIds: selectedInstructorIds,
    })
    // TODO: Implement assignment logic
    // After successful assignment:
    // - Update the data
    // - Clear selection
    // setSelectedIds([])
    setAssignmentModalOpen(false)
    // assignmentMode는 유지하여 항상 택1 상태 유지
  }

  const handleStatusChange = (value: string) => {
    setStatusValue(value)
  }

  const handleApplyStatusChange = () => {
    if (selectedIds.length === 0 || !statusValue) {
      return
    }

    const selectedRows = data.filter(item => selectedIds.includes(item.key))

    // "오픈예정"으로 변경하는 경우 시간 설정 모달 표시
    if (statusValue === '오픈예정' && selectedRows.length === 1) {
      const row = selectedRows[0]
      const education = dataStore.getEducationById(row.educationId)
      if (education) {
        setSelectedEducationForSchedule(education)
        setScheduleModalOpen(true)
        return
      }
    }

    // 그 외의 경우 기존 로직
    const isIrreversible = selectedRows.some(row => 
      isIrreversibleTransition(row.status as EducationStatus, statusValue as EducationStatus)
    )

    Modal.confirm({
      title: '상태 변경 확인',
      content: (
        <div>
          <p>선택한 {selectedIds.length}개 교육의 상태를 '{statusValue}'로 변경하시겠습니까?</p>
          {isIrreversible && (
            <p className="mt-2 text-orange-600 text-sm">
              ⚠️ 이 변경은 되돌릴 수 없습니다.
            </p>
          )}
        </div>
      ),
      okText: '변경',
      cancelText: '취소',
      onOk: () => {
        // Update dataStore for each selected education
        selectedRows.forEach(row => {
          const education = dataStore.getEducationById(row.educationId)
          if (education) {
            dataStore.updateEducation(row.educationId, { status: statusValue })
            // 스케줄러에 알림
            educationScheduler.scheduleEducation(education)
          }
        })
        
        // Update local state
        setData(prev => prev.map(item => {
          if (selectedIds.includes(item.key)) {
            return { ...item, status: statusValue }
          }
          return item
        }))
        setSelectedIds([])
        setStatusValue('')
        message.success('상태가 변경되었습니다.')
      },
    })
  }

  const handleScheduleTimeConfirm = (openAt: string | null, closeAt: string | null) => {
    if (!selectedEducationForSchedule) return

    const updates: Partial<Education> = {
      status: '오픈예정',
      openAt: openAt || undefined,
      closeAt: closeAt || undefined,
    }

    // dataStore 업데이트
    dataStore.updateEducation(selectedEducationForSchedule.educationId, updates)

    // 스케줄러에 알림
    const updatedEducation = dataStore.getEducationById(selectedEducationForSchedule.educationId)
    if (updatedEducation) {
      educationScheduler.scheduleEducation(updatedEducation)
    }

    // 로컬 상태 업데이트
    setData(prev => prev.map(item => {
      if (item.educationId === selectedEducationForSchedule.educationId) {
        return { 
          ...item, 
          status: '오픈예정',
          openAt: openAt || undefined,
          closeAt: closeAt || undefined,
        }
      }
      return item
    }))

    setSelectedIds([])
    setStatusValue('')
    setScheduleModalOpen(false)
    setSelectedEducationForSchedule(null)
    message.success('상태가 변경되었고 스케줄이 설정되었습니다.')
  }

  const handleRowStatusChange = (id: string, newStatus: EducationStatus) => {
    const row = data.find(item => item.key === id)
    if (!row) return

    const currentStatus = row.status as EducationStatus
    const allowed = getAllowedNextStatuses(currentStatus)
    
    if (!allowed.includes(newStatus)) {
      message.warning('이 상태로 변경할 수 없습니다.')
      return
    }

    const isIrreversible = isIrreversibleTransition(currentStatus, newStatus)

    Modal.confirm({
      title: '상태 변경 확인',
      content: (
        <div>
          <p>교육 상태를 '{newStatus}'로 변경하시겠습니까?</p>
          {isIrreversible && (
            <p className="mt-2 text-orange-600 text-sm">
              ⚠️ 이 변경은 되돌릴 수 없습니다.
            </p>
          )}
        </div>
      ),
      okText: '변경',
      cancelText: '취소',
      onOk: () => {
        // "오픈예정"으로 변경하는 경우 시간 설정 모달 표시
        if (newStatus === '오픈예정') {
          const education = dataStore.getEducationById(row.educationId)
          if (education) {
            setSelectedEducationForSchedule(education)
            setScheduleModalOpen(true)
          }
          return
        }

        // Update dataStore
        const education = dataStore.getEducationById(row.educationId)
        if (education) {
          dataStore.updateEducation(row.educationId, { status: newStatus })
          // 스케줄러에 알림
          educationScheduler.scheduleEducation(education)
        }
        
        // Update local state
        setData(prev => prev.map(item => {
          if (item.key === id) {
            // Auto-create AttendanceSheet when status reaches "확정" or "교육 진행 중"
            if ((newStatus === '확정' || newStatus === '교육 진행 중') && item.educationId) {
              const education = dataStore.getEducationById(item.educationId)
              if (education) {
                const existingSheet = attendanceSheetStore.getByEducationId(item.educationId)
                if (!existingSheet) {
                  // Create new AttendanceSheet
                  const institutionId = 'INST-001' // TODO: Get from education
                  const gradeClass = education.gradeClass || ''
                  const [grade, className] = gradeClass.split('학년').map(s => s.trim())
                  
                  attendanceSheetStore.create(item.educationId, institutionId, {
                    grade: grade || '',
                    className: className?.replace('반', '').trim() || '',
                    teacherName: '',
                    teacherContact: '',
                  })
                }
              }
            }
            
            return { ...item, status: newStatus }
          }
          return item
        }))
        message.success('상태가 변경되었습니다.')
      },
    })
  }

  const handleRowClick = (record: EducationStatusItem) => {
    // Optional: Navigate to detail page or show modal
    console.log('Row clicked:', record)
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="bg-slate-50 min-h-screen">
        {/* Main Content */}
        <div className="p-6 space-y-4">
          {/* Toolbar */}
          <div className="space-y-4">
            <StatusChangeToolbar
              selectedCount={selectedIds.length}
              selectedRows={filteredData.filter(item => selectedIds.includes(item.key))}
              onAssignPartial={handleAssignPartial}
              onAssignAll={handleAssignAll}
              statusValue={statusValue}
              onStatusChange={handleStatusChange}
              onApplyStatusChange={handleApplyStatusChange}
              assignmentMode={assignmentMode}
              onAssignmentModeChange={setAssignmentMode}
            />
            
            {/* Bulk Scheduled Status Changes */}
            <Card className="rounded-xl border border-blue-200 bg-blue-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">예약된 일괄 상태 변경</h3>
                  <p className="text-xs text-gray-600">21:00 오픈예정→강사공개 / 다음날 강사공개→신청마감</p>
                </div>
                <Space>
                  <Button
                    size="small"
                    onClick={handleBulkOpenToPublic}
                    className="h-9 px-4 rounded-lg border border-blue-300 hover:bg-blue-600 hover:text-white font-medium"
                  >
                    오픈예정 → 강사공개
                  </Button>
                  <Button
                    size="small"
                    onClick={handleBulkPublicToClosed}
                    className="h-9 px-4 rounded-lg border border-blue-300 hover:bg-blue-600 hover:text-white font-medium"
                  >
                    강사공개 → 신청마감
                  </Button>
                </Space>
              </div>
            </Card>
          </div>

          {/* Instructor Assignment Modal */}
          <ScheduleTimeModal
            open={scheduleModalOpen}
            education={selectedEducationForSchedule}
            onOk={handleScheduleTimeConfirm}
            onCancel={() => {
              setScheduleModalOpen(false)
              setSelectedEducationForSchedule(null)
            }}
          />
          <InstructorAssignmentModal
            open={assignmentModalOpen}
            mode={assignmentMode || 'partial'}
            onClose={() => {
              setAssignmentModalOpen(false)
              // assignmentMode는 유지하여 항상 택1 상태 유지
            }}
            onConfirm={handleAssignmentConfirm}
            educationIds={selectedIds}
          />

          {/* Search and Table Card */}
          <Card className="rounded-xl shadow-sm border border-gray-200">
            {/* Search Toolbar */}
            <div className="flex items-center h-16 px-4 py-3 border-b border-gray-200 gap-3">
              {/* Search Input - Left Side */}
              <div className="w-full max-w-[420px]">
                <Input
                  placeholder="교육 기관명 검색"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  onPressEnter={handleSearch}
                  prefix={<Search className="h-5 w-5 text-slate-400" />}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 transition hover:border-slate-300 focus:border-slate-300 focus:ring-2 focus:ring-slate-300"
                />
              </div>
              
              {/* Filter Button with Dropdown - Right Side */}
              <div className="relative ml-auto" ref={filterDropdownRef}>
                <Button
                  icon={<Filter className="w-4 h-4" />}
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-blue-600 hover:text-white font-medium transition-all flex items-center gap-2 text-slate-700"
                >
                  필터
                  <ChevronRight className={`w-4 h-4 transition-transform ${filterDropdownOpen ? 'rotate-90' : ''}`} />
                </Button>
                
                {/* Filter Dropdown */}
                {filterDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
                    <div className="space-y-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <Select
                            placeholder="전체"
                            value={tempStatusFilter || undefined}
                            onChange={(value) => setTempStatusFilter(value || '')}
                            options={statusOptions}
                            className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                            suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
                          />
                        </div>
                      </div>
                      
                      {/* Date Range Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">날짜</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <RangePicker
                            value={tempDateRange}
                            onChange={(dates) => setTempDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                            format="MM/DD/YYYY"
                            className="w-full h-11 rounded-xl [&_.ant-picker-input]:!h-11 [&_.ant-picker-input]:!border-0"
                            placeholder={['시작일', '종료일']}
                          />
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                        <Button
                          type="text"
                          icon={<RotateCcw className="w-4 h-4" />}
                          onClick={handleFilterReset}
                          className="h-9 px-4 text-sm"
                        >
                          초기화
                        </Button>
                        <Button
                          type="primary"
                          onClick={handleFilterApply}
                          className="h-9 px-4 text-sm bg-slate-900 hover:bg-slate-800 active:bg-slate-900 border-0 text-white hover:text-white active:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          적용
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <EducationStatusTable
              rows={filteredData}
              selectedIds={selectedIds}
              onToggleRow={handleToggleRow}
              onToggleAll={handleToggleAll}
              onRowClick={handleRowClick}
              onStatusChange={handleRowStatusChange}
              currentPage={currentPage}
              pageSize={pageSize}
              total={totalItems}
              onPageChange={handlePageChange}
            />
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
