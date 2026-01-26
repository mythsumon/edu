'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Select, Space, DatePicker, Badge, Modal, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeft, RotateCcw, RefreshCw, Eye, CheckCircle2, XCircle, Search, ChevronRight, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { 
  DetailPageHeaderSticky,
  InstructorConfirmationSummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
  LessonsListCard,
} from '@/components/admin/operations'

dayjs.locale('ko')
const { RangePicker } = DatePicker

interface LessonInfo {
  session: number
  date: string
  startTime: string
  endTime: string
  subject: string
  status: 'assigned' | 'available'
}

interface InstructorConfirmationItem {
  key: string
  instructorId: string
  instructorName: string
  educationName: string
  status: 'active' | 'pending' | 'inactive'
  assignedLessons: number
  availableLessons: number
  joinDate: string
  program?: string
  email?: string
  phone?: string
  lessons?: LessonInfo[]
}

const dummyData: InstructorConfirmationItem[] = [
  {
    key: '1',
    instructorId: 'INS-2025-001',
    instructorName: '우수정',
    educationName: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    status: 'active',
    assignedLessons: 5,
    availableLessons: 10,
    joinDate: '2025.01.15',
    program: '블록코딩 프로그램',
    email: 'woo.sujeong@example.com',
    phone: '010-1234-5678',
    lessons: [
      { session: 1, date: '2025-11-24', startTime: '09:00', endTime: '09:40', subject: '블록코딩 기초', status: 'assigned' },
      { session: 2, date: '2025-11-24', startTime: '09:45', endTime: '10:25', subject: '메타버스 입문', status: 'assigned' },
      { session: 3, date: '2025-11-24', startTime: '10:30', endTime: '11:10', subject: 'AI 기초', status: 'available' },
    ],
  },
  {
    key: '2',
    instructorId: 'INS-2025-002',
    instructorName: '김보조',
    educationName: '도서벽지 지역 특별 교육',
    status: 'pending',
    assignedLessons: 2,
    availableLessons: 8,
    joinDate: '2025.01.14',
    program: '도서벽지 프로그램',
    email: 'kim.bojo@example.com',
    phone: '010-2345-6789',
    lessons: [
      { session: 1, date: '2025-12-01', startTime: '09:00', endTime: '09:40', subject: '특별 교육', status: 'assigned' },
    ],
  },
  {
    key: '3',
    instructorId: 'INS-2025-003',
    instructorName: '이보조',
    educationName: '특수학급 교사 역량 강화',
    status: 'active',
    assignedLessons: 8,
    availableLessons: 12,
    joinDate: '2025.01.13',
    program: '특수학급 프로그램',
    email: 'lee.bojo@example.com',
    phone: '010-3456-7890',
  },
  {
    key: '4',
    instructorId: 'INS-2025-004',
    instructorName: '박보조',
    educationName: '50차시 프로그램 운영 교육',
    status: 'active',
    assignedLessons: 3,
    availableLessons: 15,
    joinDate: '2025.01.12',
    program: '50차시 프로그램',
  },
  {
    key: '5',
    instructorId: 'INS-2025-005',
    instructorName: '최주강',
    educationName: '신규 강사 오리엔테이션',
    status: 'inactive',
    assignedLessons: 0,
    availableLessons: 5,
    joinDate: '2025.01.11',
  },
]

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: 'active', label: '활성' },
  { value: 'pending', label: '대기 중' },
  { value: 'inactive', label: '비활성' },
]

const statusStyle: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
  active: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  pending: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: <XCircle className="w-3 h-3" />,
  },
  inactive: {
    bg: 'bg-gray-50',
    text: 'text-gray-700',
    icon: <XCircle className="w-3 h-3" />,
  },
}

export default function InstructorConfirmationPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorConfirmationItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [assignedLessonsFilter, setAssignedLessonsFilter] = useState<string>('all')
  const [filterDropdownOpen, setFilterDropdownOpen] = useState<boolean>(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

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
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)

  const handleRowClick = (record: InstructorConfirmationItem) => {
    setSelectedInstructor(record)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedInstructor(null)
  }

  const handleResetFilters = () => {
    setSearchText('')
    setStatusFilter('all')
    setAssignedLessonsFilter('all')
    setDateRange(null)
  }

  const handleSearch = () => {
    setCurrentPage(1)
  }


  const handleApprove = (instructorId: string) => {
    console.log('Approve instructor:', instructorId)
  }

  const handleReject = (instructorId: string) => {
    console.log('Reject instructor:', instructorId)
  }

  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.instructorName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.instructorId.toLowerCase().includes(searchText.toLowerCase()) ||
        item.educationName.toLowerCase().includes(searchText.toLowerCase()) ||
        (item.program && item.program.toLowerCase().includes(searchText.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesAssignedLessons =
        assignedLessonsFilter === 'all' ||
        (assignedLessonsFilter === 'has' && item.assignedLessons > 0) ||
        (assignedLessonsFilter === 'none' && item.assignedLessons === 0)
      const matchesDateRange =
        !dateRange ||
        !dateRange[0] ||
        !dateRange[1] ||
        (dayjs(item.joinDate).isAfter(dateRange[0].subtract(1, 'day')) &&
          dayjs(item.joinDate).isBefore(dateRange[1].add(1, 'day')))
      return matchesSearch && matchesStatus && matchesAssignedLessons && matchesDateRange
    })
  }, [searchText, statusFilter, assignedLessonsFilter, dateRange])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, statusFilter, assignedLessonsFilter, dateRange])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const columns: ColumnsType<InstructorConfirmationItem> = useMemo(
    () => [
      {
        title: '강사명',
        dataIndex: 'instructorName',
        key: 'instructorName',
        width: 120,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '강사ID',
        dataIndex: 'instructorId',
        key: 'instructorId',
        width: 150,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '교육명',
        dataIndex: 'educationName',
        key: 'educationName',
        width: 280,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '상태',
        dataIndex: 'status',
        key: 'status',
        width: 120,
        align: 'center' as const,
        render: (status: string) => {
          const config = statusStyle[status] || statusStyle.inactive
          return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
              {config.icon}
              {status === 'active' ? '활성' : status === 'pending' ? '대기 중' : '비활성'}
            </span>
          )
        },
      },
      {
        title: '배정된 수업',
        dataIndex: 'assignedLessons',
        key: 'assignedLessons',
        width: 120,
        align: 'center' as const,
        render: (count: number) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            {count}개
          </span>
        ),
      },
      {
        title: '가능한 수업',
        dataIndex: 'availableLessons',
        key: 'availableLessons',
        width: 120,
        align: 'center' as const,
        render: (count: number) => (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
            {count}개
          </span>
        ),
      },
      {
        title: '가입일',
        dataIndex: 'joinDate',
        key: 'joinDate',
        width: 120,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '상세',
        key: 'action',
        width: 90,
        fixed: 'right' as const,
        render: (_, record) => (
          <Button
            size="small"
            icon={<Eye className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation()
              handleRowClick(record)
            }}
            className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors"
          >
            상세
          </Button>
        ),
      },
    ],
    []
  )

  const assignedLessonsFilterOptions = [
    { value: 'all', label: '전체' },
    { value: 'has', label: '배정됨' },
    { value: 'none', label: '미배정' },
  ]

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="admin-page p-6">
      {viewMode === 'list' ? (
        <>

          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <Space>
              <Button
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => console.log('Refresh')}
                className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
              >
                새로고침
              </Button>
            </Space>
          </div>

          {/* Search and Table Card */}
          <Card className="rounded-xl shadow-sm border border-gray-200">
            {/* Search Toolbar */}
            <div className="flex items-center h-16 px-4 py-3 border-b border-gray-200 gap-3">
              {/* Search Input - Left Side */}
              <div className="w-full max-w-[420px]">
                <Input
                  placeholder="검색어를 입력하세요..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  onPressEnter={handleSearch}
                  prefix={<Search className="h-5 w-5 text-slate-400" />}
                  className="admin-search-input h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 transition hover:border-slate-300 focus:border-slate-300 focus:ring-2 focus:ring-slate-300"
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
                            placeholder="ALL STATUS"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={statusOptions}
                            className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                            suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
                          />
                        </div>
                      </div>
                      
                      {/* Assigned Lessons Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">배정 수업</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <Select
                            placeholder="ASSIGNED"
                            value={assignedLessonsFilter}
                            onChange={setAssignedLessonsFilter}
                            options={assignedLessonsFilterOptions}
                            className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                            suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
                          />
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                        <Button
                          type="text"
                          icon={<RotateCcw className="w-4 h-4" />}
                          onClick={() => {
                            handleResetFilters()
                            setFilterDropdownOpen(false)
                          }}
                          className="h-9 px-4 text-sm"
                        >
                          초기화
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => {
                            setCurrentPage(1)
                            setFilterDropdownOpen(false)
                          }}
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
            <Table
              columns={columns}
              dataSource={paginatedData}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredData.length,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}건`,
                onChange: (page, size) => {
                  setCurrentPage(page)
                  setPageSize(size)
                },
                onShowSizeChange: (current, size) => {
                  setCurrentPage(1)
                  setPageSize(size)
                },
              }}
              rowKey="key"
              scroll={{ x: 'max-content' }}
              onRow={(record) => ({
                onClick: () => handleRowClick(record),
                className: 'cursor-pointer',
              })}
              className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#3b82f6] [&_.ant-pagination-item-active]:!bg-[#3b82f6] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
            />
          </Card>
        </>
      ) : viewMode === 'detail' && selectedInstructor ? (
        /* Detail View - Redesigned to match Create/Edit page */
        <div className="bg-slate-50 min-h-screen -mx-6 -mt-6 px-6 pt-0">
          {/* Sticky Header */}
          <DetailPageHeaderSticky
            onBack={handleBackToList}
          />

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
            {/* Summary Card */}
            <InstructorConfirmationSummaryCard
              instructorId={selectedInstructor.instructorId}
              instructorName={selectedInstructor.instructorName}
              educationName={selectedInstructor.educationName}
              status={selectedInstructor.status}
              assignedLessons={selectedInstructor.assignedLessons}
              availableLessons={selectedInstructor.availableLessons}
              joinDate={selectedInstructor.joinDate}
            />

            {/* Instructor Info Section */}
            <DetailSectionCard title="강사 정보">
              <DefinitionListGrid
                items={[
                  { label: '강사ID', value: selectedInstructor.instructorId },
                  { label: '강사명', value: selectedInstructor.instructorName },
                  { label: '교육명', value: selectedInstructor.educationName },
                  ...(selectedInstructor.program ? [{ label: '프로그램', value: selectedInstructor.program }] : []),
                  ...(selectedInstructor.email ? [{ label: '이메일', value: selectedInstructor.email }] : []),
                  ...(selectedInstructor.phone ? [{ label: '전화번호', value: selectedInstructor.phone }] : []),
                  {
                    label: '상태',
                    value: (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusStyle[selectedInstructor.status].bg
                        } ${statusStyle[selectedInstructor.status].text}`}
                      >
                        {statusStyle[selectedInstructor.status].icon}
                        {selectedInstructor.status === 'active'
                          ? '활성'
                          : selectedInstructor.status === 'pending'
                            ? '대기 중'
                            : '비활성'}
                      </span>
                    ),
                  },
                  { label: '배정된 수업', value: `${selectedInstructor.assignedLessons}개` },
                  { label: '가능한 수업', value: `${selectedInstructor.availableLessons}개` },
                  { label: '가입일', value: selectedInstructor.joinDate },
                ]}
              />
              <div className="border-t border-gray-100 pt-6 mt-6 flex flex-col sm:flex-row gap-3">
                {selectedInstructor.status === 'pending' && (
                  <>
                    <Button
                      type="primary"
                      icon={<CheckCircle2 className="w-4 h-4" />}
                      onClick={() => handleApprove(selectedInstructor.instructorId)}
                      className="h-11 px-6 rounded-xl bg-green-600 hover:bg-green-500 hover:brightness-110 hover:ring-2 hover:ring-green-400/40 active:bg-green-600 border-0 text-white font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
                    >
                      승인하기
                    </Button>
                    <Button
                      danger
                      type="default"
                      icon={<XCircle className="w-4 h-4" />}
                      onClick={() => handleReject(selectedInstructor.instructorId)}
                      className="h-11 px-6 rounded-xl font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
                    >
                      거절하기
                    </Button>
                  </>
                )}
              </div>
            </DetailSectionCard>

            {/* Lessons Info Section */}
            {selectedInstructor.lessons && selectedInstructor.lessons.length > 0 && (
              <DetailSectionCard title="수업 정보" helperText={`총 ${selectedInstructor.lessons.length}건`}>
                <div className="pt-4">
                  <Table
                    columns={[
                      { title: '차시', dataIndex: 'session', key: 'session', width: 80, align: 'center' as const },
                      { title: '일자', dataIndex: 'date', key: 'date', width: 120 },
                      { title: '시작시간', dataIndex: 'startTime', key: 'startTime', width: 100, align: 'center' as const },
                      { title: '종료시간', dataIndex: 'endTime', key: 'endTime', width: 100, align: 'center' as const },
                      { title: '과목', dataIndex: 'subject', key: 'subject', width: 150 },
                      {
                        title: '상태',
                        dataIndex: 'status',
                        key: 'status',
                        width: 100,
                        align: 'center' as const,
                        render: (status: string) => (
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              status === 'assigned'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-green-50 text-green-700'
                            }`}
                          >
                            {status === 'assigned' ? '배정됨' : '가능'}
                          </span>
                        ),
                      },
                    ]}
                    dataSource={selectedInstructor.lessons.map((lesson, idx) => ({
                      ...lesson,
                      key: `${selectedInstructor.key}-lesson-${idx}`,
                    }))}
                    pagination={false}
                    className="[&_.ant-table-thead>tr>th]:bg-slate-50 [&_.ant-table-thead>tr>th]:text-slate-600 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table]:text-sm [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100"
                  />
                </div>
              </DetailSectionCard>
            )}
          </div>
        </div>
      ) : null}

      </div>
    </ProtectedRoute>
  )
}

