'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Table, Button, Card, Select, Space, DatePicker, Badge, Modal, Collapse } from 'antd'
import { Input } from '@/components/shared/common'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, ArrowLeft, RotateCcw, RefreshCw, Copy, Trash2, UserPlus, CheckCircle2, Eye, Search, Filter } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useRouter } from 'next/navigation'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { 
  DetailPageHeaderSticky,
  EducationAssignmentSummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
} from '@/components/admin/operations'

dayjs.locale('ko')
const { RangePicker } = DatePicker
const { Panel } = Collapse

interface Instructor {
  id: string
  name: string
  status: 'confirmed' | 'pending'
}

interface LessonSession {
  session: number
  date: string
  startTime: string
  endTime: string
  mainInstructors: Instructor[]
  mainInstructorRequired: number
  assistantInstructors: Instructor[]
  assistantInstructorRequired: number
}

interface EducationAssignmentItem {
  key: string
  educationId: string
  educationName: string
  institution: string
  region: string
  gradeClass: string
  period: string
  periodStart: string
  periodEnd: string
  assignmentStatus: 'confirmed' | 'unconfirmed'
  mainInstructorCount: number
  mainInstructorRequired: number
  assistantInstructorCount: number
  assistantInstructorRequired: number
  program?: string
  description?: string
  approvalStatus?: string
  status?: string
  note?: string
  lessons?: LessonSession[]
}

const dummyData: EducationAssignmentItem[] = [
  {
    key: '1',
    educationId: 'EDU-2025-001',
    educationName: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    institution: '경기미래채움',
    region: '1권역',
    gradeClass: '1학년 3반',
    period: '2025-11-24 ~ 2025-11-24',
    periodStart: '2025-11-24',
    periodEnd: '2025-11-24',
    assignmentStatus: 'confirmed',
    mainInstructorCount: 2,
    mainInstructorRequired: 2,
    assistantInstructorCount: 3,
    assistantInstructorRequired: 3,
    program: '블록코딩 프로그램',
    description: '블록코딩과 메타버스 기초 교육',
    approvalStatus: '승인됨',
    status: '진행중',
    note: '-',
    lessons: [
      {
        session: 1,
        date: '2025-11-24',
        startTime: '09:00',
        endTime: '09:40',
        mainInstructors: [
          { id: '1', name: '우수정', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: '2', name: '김보조', status: 'confirmed' },
          { id: '3', name: '이보조', status: 'confirmed' },
          { id: '4', name: '박보조', status: 'confirmed' },
        ],
        assistantInstructorRequired: 3,
      },
      {
        session: 2,
        date: '2025-11-24',
        startTime: '09:45',
        endTime: '10:25',
        mainInstructors: [
          { id: '1', name: '우수정', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: '2', name: '김보조', status: 'confirmed' },
        ],
        assistantInstructorRequired: 3,
      },
      {
        session: 3,
        date: '2025-11-24',
        startTime: '10:30',
        endTime: '11:10',
        mainInstructors: [],
        mainInstructorRequired: 1,
        assistantInstructors: [],
        assistantInstructorRequired: 3,
      },
    ],
  },
  {
    key: '2',
    educationId: 'EDU-2025-002',
    educationName: '도서벽지 지역 특별 교육',
    institution: '수원교육청',
    region: '2권역',
    gradeClass: '2학년 1반',
    period: '2025-12-01 ~ 2025-12-15',
    periodStart: '2025-12-01',
    periodEnd: '2025-12-15',
    assignmentStatus: 'unconfirmed',
    mainInstructorCount: 1,
    mainInstructorRequired: 2,
    assistantInstructorCount: 0,
    assistantInstructorRequired: 3,
    program: '도서벽지 프로그램',
    description: '도서벽지 지역 특별 교육 프로그램',
    approvalStatus: '대기중',
    status: '신청 중',
    note: '추가 강사 필요',
    lessons: [
      {
        session: 1,
        date: '2025-12-01',
        startTime: '09:00',
        endTime: '09:40',
        mainInstructors: [
          { id: '5', name: '최주강', status: 'confirmed' },
        ],
        mainInstructorRequired: 2,
        assistantInstructors: [],
        assistantInstructorRequired: 3,
      },
    ],
  },
  {
    key: '3',
    educationId: 'EDU-2025-003',
    educationName: '특수학급 교사 역량 강화',
    institution: '성남교육청',
    region: '3권역',
    gradeClass: '3학년 2반',
    period: '2025-12-10 ~ 2025-12-20',
    periodStart: '2025-12-10',
    periodEnd: '2025-12-20',
    assignmentStatus: 'confirmed',
    mainInstructorCount: 1,
    mainInstructorRequired: 1,
    assistantInstructorCount: 2,
    assistantInstructorRequired: 2,
  },
]

const regionOptions = [
  { value: 'all', label: '전체' },
  { value: '1권역', label: '1권역' },
  { value: '2권역', label: '2권역' },
  { value: '3권역', label: '3권역' },
  { value: '4권역', label: '4권역' },
  { value: '5권역', label: '5권역' },
  { value: '6권역', label: '6권역' },
]

const gradeClassOptions = [
  { value: 'all', label: '전체' },
  { value: '1학년', label: '1학년' },
  { value: '2학년', label: '2학년' },
  { value: '3학년', label: '3학년' },
  { value: '4학년', label: '4학년' },
  { value: '5학년', label: '5학년' },
  { value: '6학년', label: '6학년' },
]

const assignmentStatusOptions = [
  { value: 'all', label: '전체' },
  { value: 'confirmed', label: '확정' },
  { value: 'unconfirmed', label: '미확정' },
]

const availableInstructors = [
  { id: '1', name: '우수정', type: 'main' },
  { id: '2', name: '김보조', type: 'assistant' },
  { id: '3', name: '이보조', type: 'assistant' },
  { id: '4', name: '박보조', type: 'assistant' },
  { id: '5', name: '최주강', type: 'main' },
  { id: '6', name: '정보조', type: 'assistant' },
  { id: '7', name: '강주강', type: 'main' },
  { id: '8', name: '윤보조', type: 'assistant' },
]

export default function InstructorAssignmentPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [selectedEducation, setSelectedEducation] = useState<EducationAssignmentItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState<string>('')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [gradeClassFilter, setGradeClassFilter] = useState<string>('all')
  const [assignmentStatusFilter, setAssignmentStatusFilter] = useState<string>('all')
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
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ session: number; instructorId: string; type: 'main' | 'assistant' } | null>(null)
  const [selectedMainInstructor, setSelectedMainInstructor] = useState<{ [key: string]: string }>({})
  const [selectedAssistantInstructor, setSelectedAssistantInstructor] = useState<{ [key: string]: string }>({})

  const handleRowClick = (record: EducationAssignmentItem) => {
    setSelectedEducation(record)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedEducation(null)
  }

  const handleResetFilters = () => {
    setSearchText('')
    setRegionFilter('all')
    setGradeClassFilter('all')
    setAssignmentStatusFilter('all')
    setDateRange(null)
  }

  const handleSearch = () => {
    // Search logic would go here
    console.log('Search with filters:', { searchText, regionFilter, gradeClassFilter, assignmentStatusFilter, dateRange })
  }

  const handleDeleteInstructor = (session: number, instructorId: string, type: 'main' | 'assistant') => {
    setDeleteTarget({ session, instructorId, type })
    setDeleteModalVisible(true)
  }

  const confirmDelete = () => {
    if (deleteTarget && selectedEducation) {
      console.log('Delete instructor:', deleteTarget)
      // Handle delete logic here
      setDeleteModalVisible(false)
      setDeleteTarget(null)
    }
  }

  const handleAddMainInstructor = (session: number, instructorId: string) => {
    if (selectedEducation && selectedEducation.lessons) {
      const lesson = selectedEducation.lessons.find((l) => l.session === session)
      if (lesson) {
        const instructor = availableInstructors.find((inst) => inst.id === instructorId)
        if (instructor) {
          lesson.mainInstructors.push({
            id: instructor.id,
            name: instructor.name,
            status: 'confirmed',
          })
          setSelectedEducation({ ...selectedEducation })
          setSelectedMainInstructor({ ...selectedMainInstructor, [`${session}`]: '' })
        }
      }
    }
  }

  const handleAddAssistantInstructor = (session: number, instructorId: string) => {
    if (selectedEducation && selectedEducation.lessons) {
      const lesson = selectedEducation.lessons.find((l) => l.session === session)
      if (lesson) {
        const instructor = availableInstructors.find((inst) => inst.id === instructorId)
        if (instructor) {
          lesson.assistantInstructors.push({
            id: instructor.id,
            name: instructor.name,
            status: 'confirmed',
          })
          setSelectedEducation({ ...selectedEducation })
          setSelectedAssistantInstructor({ ...selectedAssistantInstructor, [`${session}`]: '' })
        }
      }
    }
  }

  const handleCopyEducationId = () => {
    if (selectedEducation) {
      navigator.clipboard.writeText(selectedEducation.educationId)
      // Could add toast notification here
    }
  }

  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.educationName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.institution.toLowerCase().includes(searchText.toLowerCase()) ||
        item.region.toLowerCase().includes(searchText.toLowerCase()) ||
        item.educationId.toLowerCase().includes(searchText.toLowerCase())
      const matchesRegion = regionFilter === 'all' || item.region === regionFilter
      const matchesGradeClass = gradeClassFilter === 'all' || item.gradeClass.includes(gradeClassFilter)
      const matchesStatus = assignmentStatusFilter === 'all' || item.assignmentStatus === assignmentStatusFilter
      const matchesDateRange =
        !dateRange ||
        !dateRange[0] ||
        !dateRange[1] ||
        (dayjs(item.periodStart).isAfter(dateRange[0].subtract(1, 'day')) &&
          dayjs(item.periodEnd).isBefore(dateRange[1].add(1, 'day')))
      return matchesSearch && matchesRegion && matchesGradeClass && matchesStatus && matchesDateRange
    })
  }, [searchText, regionFilter, gradeClassFilter, assignmentStatusFilter, dateRange])

  const columns: ColumnsType<EducationAssignmentItem> = useMemo(
    () => [
      {
        title: '배정 확정',
        key: 'assignmentStatus',
        width: 120,
        align: 'center' as const,
        render: (_, record) => (
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
              record.assignmentStatus === 'confirmed'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {record.assignmentStatus === 'confirmed' ? '확정' : '미확정'}
          </span>
        ),
      },
      {
        title: '교육ID',
        dataIndex: 'educationId',
        key: 'educationId',
        width: 150,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '교육명',
        key: 'educationName',
        width: 280,
        render: (_, record) => (
          <span className="text-base font-medium text-gray-900 line-clamp-1">{record.educationName}</span>
        ),
      },
      {
        title: '교육기관',
        dataIndex: 'institution',
        key: 'institution',
        width: 140,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '구역',
        dataIndex: 'region',
        key: 'region',
        width: 100,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '학년·학급',
        dataIndex: 'gradeClass',
        key: 'gradeClass',
        width: 120,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '주강사',
        key: 'mainInstructor',
        width: 120,
        align: 'center' as const,
        render: (_, record) => {
          const isFull = record.mainInstructorCount >= record.mainInstructorRequired
          return (
            <div className="flex items-center justify-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  isFull
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {record.mainInstructorCount}/{record.mainInstructorRequired}
              </span>
            </div>
          )
        },
      },
      {
        title: '보조강사',
        key: 'assistantInstructor',
        width: 120,
        align: 'center' as const,
        render: (_, record) => {
          const isFull = record.assistantInstructorCount >= record.assistantInstructorRequired
          return (
            <div className="flex items-center justify-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                  isFull
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {record.assistantInstructorCount}/{record.assistantInstructorRequired}
              </span>
            </div>
          )
        },
      },
      {
        title: '교육기간',
        dataIndex: 'period',
        key: 'period',
        width: 200,
        align: 'right' as const,
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

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">
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
                      {/* Region Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">지역</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <Select
                            placeholder="지역"
                            value={regionFilter}
                            onChange={setRegionFilter}
                            options={regionOptions}
                            className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                            suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
                          />
                        </div>
                      </div>
                      
                      {/* Grade Class Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">학년·학급</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <Select
                            placeholder="학년·학급"
                            value={gradeClassFilter}
                            onChange={setGradeClassFilter}
                            options={gradeClassOptions}
                            className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                            suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
                          />
                        </div>
                      </div>
                      
                      {/* Assignment Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">배정상태</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <Select
                            placeholder="배정상태"
                            value={assignmentStatusFilter}
                            onChange={setAssignmentStatusFilter}
                            options={assignmentStatusOptions}
                            className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                            suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
                          />
                        </div>
                      </div>
                      
                      {/* Date Range Picker */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">기간</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <RangePicker
                            value={dateRange}
                            onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                            placeholder={['시작일', '종료일']}
                            className="w-full h-11 border-0 [&_.ant-picker-input]:!h-11 [&_.ant-picker-input>input]:!h-11 [&_.ant-picker-input>input]:!border-0 [&_.ant-picker-input>input]:!bg-transparent [&_.ant-picker-input>input]:!text-[#151827] [&_.ant-picker-input>input]:!placeholder:text-[#9AA0AE] [&_.ant-picker]:!border-0 [&_.ant-picker]:!shadow-none"
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
              dataSource={filteredData}
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
        ) : (
          /* Detail View - Redesigned to match Create/Edit page */
          selectedEducation && (
            <div className="bg-slate-50 min-h-screen -mx-6 -mt-6 px-6 pt-0">
              {/* Sticky Header */}
              <DetailPageHeaderSticky
                onBack={handleBackToList}
              />

              {/* Main Content Container */}
              <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
                {/* Summary Card */}
                <EducationAssignmentSummaryCard
                  educationId={selectedEducation.educationId}
                  educationName={selectedEducation.educationName}
                  institution={selectedEducation.institution}
                  region={selectedEducation.region}
                  gradeClass={selectedEducation.gradeClass}
                  period={selectedEducation.period}
                  assignmentStatus={selectedEducation.assignmentStatus}
                />

                {/* Education Info Section */}
                <DetailSectionCard title="교육 정보">
                  <DefinitionListGrid
                    items={[
                      { label: '교육ID', value: selectedEducation.educationId },
                      { label: '교육과정명', value: selectedEducation.educationName },
                      ...(selectedEducation.program ? [{ label: '프로그램', value: selectedEducation.program }] : []),
                      ...(selectedEducation.description ? [{ label: '설명', value: selectedEducation.description }] : []),
                      { label: '사업장', value: selectedEducation.institution },
                      { label: '교육기관', value: selectedEducation.institution },
                      { label: '시작일', value: selectedEducation.periodStart },
                      { label: '종료일', value: selectedEducation.periodEnd },
                      ...(selectedEducation.approvalStatus ? [{ label: '승인여부', value: selectedEducation.approvalStatus }] : []),
                      ...(selectedEducation.status ? [{ label: '상태', value: selectedEducation.status }] : []),
                      ...(selectedEducation.note ? [{ label: '비고', value: selectedEducation.note }] : []),
                    ]}
                  />
                </DetailSectionCard>

                {/* Lessons Info Section */}
                {selectedEducation.lessons && selectedEducation.lessons.length > 0 && (
                  <DetailSectionCard title="수업 정보" helperText={`총 ${selectedEducation.lessons.length}건`}>
                    <div className="pt-4">
                      <Collapse
                        ghost
                        className="[&_.ant-collapse-item]:border-b [&_.ant-collapse-item]:border-gray-100 [&_.ant-collapse-header]:px-0 [&_.ant-collapse-content]:px-0"
                      >
                        {(selectedEducation.lessons || []).map((lesson) => (
                          <Panel
                            key={lesson.session}
                            header={
                              <div className="flex items-center justify-between w-full pr-4">
                                <div className="flex items-center gap-3">
                                  <span className="text-base font-semibold text-gray-900">
                                    {lesson.session}차 수업 · {lesson.date} ({lesson.startTime} ~ {lesson.endTime})
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                    주강사 {lesson.mainInstructors.length}/{lesson.mainInstructorRequired}
                                  </span>
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                    보조강사 {lesson.assistantInstructors.length}/{lesson.assistantInstructorRequired}
                                  </span>
                                </div>
                              </div>
                            }
                          >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                              {/* Main Instructors */}
                              <Card className="rounded-lg border border-gray-200 bg-gray-50">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">주강사</h4>
                                {lesson.mainInstructors.length > 0 ? (
                                  <div className="space-y-2">
                                    {lesson.mainInstructors.map((instructor) => (
                                      <div
                                        key={instructor.id}
                                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-semibold text-blue-700">
                                            {instructor.name.charAt(0)}
                                          </div>
                                          <span className="text-sm font-medium text-gray-900">{instructor.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            status={instructor.status === 'confirmed' ? 'success' : 'default'}
                                            text={
                                              <span className="text-xs">
                                                {instructor.status === 'confirmed' ? '확정됨' : '대기중'}
                                              </span>
                                            }
                                          />
                                          <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<Trash2 className="w-3 h-3" />}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleDeleteInstructor(lesson.session, instructor.id, 'main')
                                            }}
                                            className="h-7 w-7 p-0 hover:bg-red-50"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="space-y-3 py-2">
                                    <div className="text-sm text-gray-500 mb-2">배정된 강사가 없습니다.</div>
                                    <Select
                                      placeholder="주강사 선택"
                                      value={selectedMainInstructor[`${lesson.session}`]}
                                      onChange={(value) => {
                                        setSelectedMainInstructor({ ...selectedMainInstructor, [`${lesson.session}`]: value })
                                        if (value) {
                                          handleAddMainInstructor(lesson.session, value)
                                        }
                                      }}
                                      options={availableInstructors
                                        .filter((inst) => inst.type === 'main')
                                        .map((inst) => ({
                                          value: inst.id,
                                          label: inst.name,
                                        }))}
                                      className="w-full h-9 rounded-lg"
                                      showSearch
                                      filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                      }
                                    />
                                  </div>
                                )}
                                {lesson.mainInstructors.length > 0 && lesson.mainInstructors.length < lesson.mainInstructorRequired && (
                                  <div className="mt-2">
                                    <Select
                                      placeholder="추가 주강사 선택"
                                      value={selectedMainInstructor[`${lesson.session}_add`]}
                                      onChange={(value) => {
                                        setSelectedMainInstructor({ ...selectedMainInstructor, [`${lesson.session}_add`]: value })
                                        if (value) {
                                          handleAddMainInstructor(lesson.session, value)
                                        }
                                      }}
                                      options={availableInstructors
                                        .filter(
                                          (inst) =>
                                            inst.type === 'main' &&
                                            !lesson.mainInstructors.some((assigned) => assigned.id === inst.id)
                                        )
                                        .map((inst) => ({
                                          value: inst.id,
                                          label: inst.name,
                                        }))}
                                      className="w-full h-9 rounded-lg"
                                      showSearch
                                      filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                      }
                                    />
                                  </div>
                                )}
                              </Card>

                              {/* Assistant Instructors */}
                              <Card className="rounded-lg border border-gray-200 bg-gray-50">
                                <h4 className="text-sm font-semibold text-gray-700 mb-3">보조강사</h4>
                                {lesson.assistantInstructors.length > 0 ? (
                                  <div className="space-y-2">
                                    {lesson.assistantInstructors.map((instructor) => (
                                      <div
                                        key={instructor.id}
                                        className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-purple-700">
                                            {instructor.name.charAt(0)}
                                          </div>
                                          <span className="text-sm font-medium text-gray-900">{instructor.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <Badge
                                            status={instructor.status === 'confirmed' ? 'success' : 'default'}
                                            text={
                                              <span className="text-xs">
                                                {instructor.status === 'confirmed' ? '확정됨' : '대기중'}
                                              </span>
                                            }
                                          />
                                          <Button
                                            type="text"
                                            danger
                                            size="small"
                                            icon={<Trash2 className="w-3 h-3" />}
                                            onClick={(e) => {
                                              e.stopPropagation()
                                              handleDeleteInstructor(lesson.session, instructor.id, 'assistant')
                                            }}
                                            className="h-7 w-7 p-0 hover:bg-red-50"
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="space-y-3 py-2">
                                    <div className="text-sm text-gray-500 mb-2">배정된 강사가 없습니다.</div>
                                    <Select
                                      placeholder="보조강사 선택"
                                      value={selectedAssistantInstructor[`${lesson.session}`]}
                                      onChange={(value) => {
                                        setSelectedAssistantInstructor({ ...selectedAssistantInstructor, [`${lesson.session}`]: value })
                                        if (value) {
                                          handleAddAssistantInstructor(lesson.session, value)
                                        }
                                      }}
                                      options={availableInstructors
                                        .filter((inst) => inst.type === 'assistant')
                                        .map((inst) => ({
                                          value: inst.id,
                                          label: inst.name,
                                        }))}
                                      className="w-full h-9 rounded-lg"
                                      showSearch
                                      filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                      }
                                    />
                                  </div>
                                )}
                                {lesson.assistantInstructors.length > 0 && lesson.assistantInstructors.length < lesson.assistantInstructorRequired && (
                                  <div className="mt-2">
                                    <Select
                                      placeholder="추가 보조강사 선택"
                                      value={selectedAssistantInstructor[`${lesson.session}_add`]}
                                      onChange={(value) => {
                                        setSelectedAssistantInstructor({ ...selectedAssistantInstructor, [`${lesson.session}_add`]: value })
                                        if (value) {
                                          handleAddAssistantInstructor(lesson.session, value)
                                        }
                                      }}
                                      options={availableInstructors
                                        .filter(
                                          (inst) =>
                                            inst.type === 'assistant' &&
                                            !lesson.assistantInstructors.some((assigned) => assigned.id === inst.id)
                                        )
                                        .map((inst) => ({
                                          value: inst.id,
                                          label: inst.name,
                                        }))}
                                      className="w-full h-9 rounded-lg"
                                      showSearch
                                      filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                      }
                                    />
                                  </div>
                                )}
                              </Card>
                            </div>
                          </Panel>
                        ))}
                      </Collapse>
                    </div>
                  </DetailSectionCard>
                )}
              </div>
            </div>
          )
        )}

        {/* Delete Confirmation Modal */}
        <Modal
          title="강사 삭제 확인"
          open={deleteModalVisible}
          onOk={confirmDelete}
          onCancel={() => {
            setDeleteModalVisible(false)
            setDeleteTarget(null)
          }}
          okText="삭제"
          cancelText="취소"
          okButtonProps={{ danger: true }}
        >
          <p>정말 이 강사를 삭제하시겠습니까?</p>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}
