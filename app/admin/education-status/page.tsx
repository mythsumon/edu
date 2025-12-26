'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { StatusChangeToolbar } from '@/components/admin/operations/StatusChangeToolbar'
import { EducationStatusTable, type EducationStatusItem } from '@/components/admin/operations/EducationStatusTable'
import { EducationStatusFilter, type FilterValues } from '@/components/admin/operations/EducationStatusFilter'
import { InstructorAssignmentModal } from '@/components/admin/operations/InstructorAssignmentModal'
import { Card, Input, Button } from 'antd'
import { Search, Filter, ChevronRight } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'

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
    assistantInstructorsCount: 1,
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
    assistantInstructorsCount: 0,
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
    assistantInstructorsCount: 2,
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
    assistantInstructorsCount: 2,
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
    assistantInstructorsCount: 1,
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
    assistantInstructorsCount: 1,
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
    assistantInstructorsCount: 1,
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
    assistantInstructorsCount: 0,
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
  const [filterOpen, setFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterValues>({})
  const [searchText, setSearchText] = useState<string>('')
  const filterDropdownRef = useRef<HTMLDivElement>(null)
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [assignmentMode, setAssignmentMode] = useState<'partial' | 'full' | null>(null)

  // Filter data based on filters and search
  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      // Search filter
      if (searchText) {
        const searchLower = searchText.toLowerCase()
        const matchesSearch = 
          item.name.toLowerCase().includes(searchLower) ||
          item.educationId.toLowerCase().includes(searchLower) ||
          item.institution.toLowerCase().includes(searchLower)
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

  const handleFilterApply = (newFilters: FilterValues) => {
    setFilters(newFilters)
    setCurrentPage(1)
    setSelectedIds([])
  }

  const handleFilterReset = () => {
    setFilters({})
    setSearchText('')
    setCurrentPage(1)
    setSelectedIds([])
  }

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
    setAssignmentMode(null)
  }

  const handleStatusChange = (value: string) => {
    setStatusValue(value)
  }

  const handleApplyStatusChange = () => {
    if (selectedIds.length === 0 || !statusValue) {
      return
    }
    console.log('상태 변경:', { selectedIds, statusValue })
    // TODO: Implement status change logic
    // This should not change API logic, just placeholder
    // After successful change, you might want to:
    // - Update the data
    // - Clear selection
    // - Reset status value
    // setSelectedIds([])
    // setStatusValue('')
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
          <StatusChangeToolbar
            selectedCount={selectedIds.length}
            onAssignPartial={handleAssignPartial}
            onAssignAll={handleAssignAll}
            statusValue={statusValue}
            onStatusChange={handleStatusChange}
            onApplyStatusChange={handleApplyStatusChange}
            assignmentMode={assignmentMode}
            onAssignmentModeChange={setAssignmentMode}
          />

          {/* Filter Modal */}
          <EducationStatusFilter
            open={filterOpen}
            onClose={() => setFilterOpen(false)}
            onApply={handleFilterApply}
            onReset={handleFilterReset}
            initialFilters={filters}
          />

          {/* Instructor Assignment Modal */}
          <InstructorAssignmentModal
            open={assignmentModalOpen}
            mode={assignmentMode || 'partial'}
            onClose={() => {
              setAssignmentModalOpen(false)
              setAssignmentMode(null)
            }}
            onConfirm={handleAssignmentConfirm}
            educationIds={selectedIds}
          />

          {/* Search and Table Card */}
          <Card className="rounded-xl shadow-sm border border-gray-200">
            {/* Search Toolbar */}
            <div className="flex items-center h-16 px-4 py-3 border-b border-gray-200 gap-3">
              {/* Search Input - Left Side */}
              <div className="relative w-full max-w-[420px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 z-10" />
                <Input
                  placeholder="검색어를 입력하세요..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  onPressEnter={handleSearch}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition hover:border-slate-300 focus:border-slate-300 focus:ring-2 focus:ring-slate-300 [&_.ant-input]:!h-11 [&_.ant-input]:!px-0 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input]:!text-sm [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-wrapper]:!bg-transparent [&_.ant-input-clear-icon]:!text-slate-400"
                />
              </div>
              
              {/* Filter Button - Right Side */}
              <div className="relative ml-auto" ref={filterDropdownRef}>
                <Button
                  icon={<Filter className="w-4 h-4" />}
                  onClick={() => setFilterOpen(true)}
                  className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
                >
                  필터
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Table */}
            <EducationStatusTable
              rows={filteredData}
              selectedIds={selectedIds}
              onToggleRow={handleToggleRow}
              onToggleAll={handleToggleAll}
              onRowClick={handleRowClick}
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
