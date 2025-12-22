'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { Table, Button, Card, Select, Space, DatePicker, Badge, Modal, Collapse } from 'antd'
import { Input } from '@/components/shared/common'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, ArrowLeft, RotateCcw, RefreshCw, Copy, Trash2, UserPlus, CheckCircle2, Eye, Search, Download, Plus } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useRouter } from 'next/navigation'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'

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
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<{ session: number; instructorId: string; type: 'main' | 'assistant' } | null>(null)
  const [selectedMainInstructor, setSelectedMainInstructor] = useState<{ [key: string]: string }>({})
  const [selectedAssistantInstructor, setSelectedAssistantInstructor] = useState<{ [key: string]: string }>({})
  const [detailTab, setDetailTab] = useState<'info' | 'lessons'>('info')

  const handleRowClick = (record: EducationAssignmentItem) => {
    setSelectedEducation(record)
    setViewMode('detail')
    setDetailTab('info')
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
            className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50"
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
            <div className="flex items-center gap-3">
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={() => console.log('Register Education')}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium transition-all"
              >
                교육 등록
              </Button>
              <Button
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => console.log('Refresh')}
                className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
              >
                새로고침
              </Button>
            </div>
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={() => console.log('Excel Extract')}
              className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
            >
              엑셀 추출
            </Button>
          </div>

          {/* Modern Search Toolbar */}
          <div className="flex items-center h-16 px-4 py-3 bg-white border border-[#ECECF3] rounded-2xl shadow-[0_8px_24px_rgba(15,15,30,0.06)] mb-4 gap-3 flex-wrap">
            {/* Search Input - Primary, flex-grow */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
                <Input
                  placeholder="교육명/교육기관/지역/교육ID 검색"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  onPressEnter={handleSearch}
                  prefix={<Search className="w-4 h-4 text-[#9AA0AE]" />}
                  className="h-11 border-0 bg-transparent rounded-xl text-[#151827] placeholder:text-[#9AA0AE] [&_.ant-input]:!h-11 [&_.ant-input]:!px-4 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-prefix]:!mr-2"
                />
              </div>
            </div>
            
            {/* Region Filter */}
            <div className="w-[220px]">
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
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
            <div className="w-[220px]">
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
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
            <div className="w-[220px]">
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
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
            <div className="w-[280px]">
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                  placeholder={['시작일', '종료일']}
                  className="w-full h-11 border-0 [&_.ant-picker-input]:!h-11 [&_.ant-picker-input>input]:!h-11 [&_.ant-picker-input>input]:!border-0 [&_.ant-picker-input>input]:!bg-transparent [&_.ant-picker-input>input]:!text-[#151827] [&_.ant-picker-input>input]:!placeholder:text-[#9AA0AE] [&_.ant-picker]:!border-0 [&_.ant-picker]:!shadow-none"
                />
              </div>
            </div>
            
            {/* Refresh Button */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="text"
                icon={<RotateCcw className="w-4 h-4 text-[#151827]" />}
                onClick={handleResetFilters}
                className="w-10 h-10 p-0 rounded-full bg-transparent border border-[#EDEDF5] hover:bg-[#FFF3ED] flex items-center justify-center transition-all"
              />
            </div>
          </div>

          {/* Table Card */}
          <Card className="rounded-xl shadow-sm border border-gray-200">
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
                className: 'cursor-pointer hover:bg-gray-50',
              })}
              className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#ff8a65] [&_.ant-pagination-item-active]:!bg-[#ff8a65] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
            />
          </Card>
          </>
        ) : (
          /* Detail View */
          selectedEducation && (
            <div className="space-y-6">
              {/* Top breadcrumb + actions */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Button
                    type="text"
                    icon={<ArrowLeft className="w-4 h-4" />}
                    onClick={handleBackToList}
                    className="text-gray-600 hover:text-gray-900 px-0"
                  >
                    강사 수업배정
                  </Button>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-900 font-medium">상세 정보</span>
                </div>

                <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                      {selectedEducation.educationId}
                    </span>
                    <span
                      className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                        selectedEducation.assignmentStatus === 'confirmed'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {selectedEducation.assignmentStatus === 'confirmed' ? '배정 확정' : '배정 미확정'}
                    </span>
                    {selectedEducation.region && (
                      <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                        {selectedEducation.region}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                      {selectedEducation.educationName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">교육기관</span>
                        <span className="text-gray-900 font-medium">{selectedEducation.institution}</span>
                      </div>
                      <div className="h-4 w-px bg-gray-200" />
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">구역</span>
                        <span className="text-gray-900 font-medium">{selectedEducation.region}</span>
                      </div>
                      <div className="h-4 w-px bg-gray-200" />
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">학년·반</span>
                        <span className="text-gray-900 font-medium">{selectedEducation.gradeClass}</span>
                      </div>
                      <div className="h-4 w-px bg-gray-200" />
                      <div className="flex items-center gap-1">
                        <span className="text-gray-500">기간</span>
                        <span className="text-gray-900 font-medium">{selectedEducation.period}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-wrap gap-2 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                          detailTab === 'info'
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                        }`}
                        onClick={() => setDetailTab('info')}
                      >
                        교육 정보
                      </span>
                      {selectedEducation.lessons && selectedEducation.lessons.length > 0 && (
                        <span
                          className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                            detailTab === 'lessons'
                              ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                              : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                          }`}
                          onClick={() => setDetailTab('lessons')}
                        >
                          수업 정보 ({selectedEducation.lessons.length})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {selectedEducation.assignmentStatus === 'unconfirmed' ? (
                        <Button
                          type="primary"
                          icon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => console.log('Confirm assignment')}
                          className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium transition-all shadow-sm hover:shadow-md"
                        >
                          배정 확정
                        </Button>
                      ) : (
                        <Button
                          onClick={() => console.log('Unconfirm assignment')}
                          className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                        >
                          미확정
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {detailTab === 'info' && (
                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">교육 정보</h3>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-6">
                    {[
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
                    ].map((item) => (
                      <div key={item.label} className="space-y-1">
                        <div className="text-sm font-semibold text-gray-500">{item.label}</div>
                        <div className="text-base font-medium text-gray-900">{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailTab === 'lessons' && (

                <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">수업 정보</h3>
                    </div>
                    <div className="text-sm text-gray-500">
                      총 {selectedEducation.lessons?.length || 0}건
                    </div>
                  </div>
                  <div className="p-6">
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
                </div>
              )}
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
