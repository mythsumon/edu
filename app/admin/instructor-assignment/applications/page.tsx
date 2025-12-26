'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Select, Space, Descriptions } from 'antd'
import { Input } from '@/components/shared/common'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, Download, RotateCcw, Check, X, ArrowLeft, Eye, Search, RefreshCw, Filter } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { 
  DetailPageHeaderSticky,
  ApplicationSummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
  LessonsListCard
} from '@/components/admin/operations'

interface ApplierInfo {
  name: string
  email: string
  phone: string
  address: string
}

interface LessonInfo {
  session: number
  date: string
  startTime: string
  endTime: string
  mainInstructorApplied: number
  mainInstructorRequired: number
  mainInstructorName: string
  assistantInstructorApplied: number
  assistantInstructorRequired: number
  assistantInstructorName?: string
}

interface InstructorApplicationItem {
  key: string
  educationId: string
  educationName: string
  institution: string
  region: string
  gradeClass: string
  role: string
  instructorName: string
  applicationDate: string
  status: '수락됨' | '거절됨' | '대기'
  applier?: ApplierInfo
  lessons?: LessonInfo[]
}

const dummyData: InstructorApplicationItem[] = [
  {
    key: '1',
    educationId: 'EDU-2025-001',
    educationName: '도서벽지 프로그램',
    institution: '수원교육청',
    region: '수원시',
    gradeClass: '3학년 1반',
    role: '주강사',
    instructorName: '김철수',
    applicationDate: '2025.01.15',
    status: '대기',
    applier: {
      name: '홍길동',
      email: 'hong.gildong@example.com',
      phone: '010-1234-5678',
      address: '경기도 수원시 영통구 월드컵로 123',
    },
    lessons: [
      {
        session: 1,
        date: '2025-12-01',
        startTime: '09:00',
        endTime: '09:40',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 1,
      },
      {
        session: 2,
        date: '2025-12-01',
        startTime: '09:45',
        endTime: '10:25',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 1,
      },
      {
        session: 3,
        date: '2025-12-01',
        startTime: '10:30',
        endTime: '11:10',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 1,
      },
      {
        session: 4,
        date: '2025-12-01',
        startTime: '11:15',
        endTime: '12:00',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 1,
      },
      {
        session: 5,
        date: '2025-12-03',
        startTime: '09:00',
        endTime: '09:40',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 1,
      },
      {
        session: 6,
        date: '2025-12-03',
        startTime: '09:45',
        endTime: '10:25',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 1,
      },
      {
        session: 7,
        date: '2025-12-03',
        startTime: '10:30',
        endTime: '11:10',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 1,
      },
      {
        session: 8,
        date: '2025-12-03',
        startTime: '11:15',
        endTime: '12:00',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 1,
      },
      {
        session: 9,
        date: '2025-12-08',
        startTime: '09:00',
        endTime: '09:40',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 0,
      },
      {
        session: 10,
        date: '2025-12-08',
        startTime: '09:45',
        endTime: '10:25',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 0,
      },
      {
        session: 11,
        date: '2025-12-08',
        startTime: '10:30',
        endTime: '11:10',
        mainInstructorApplied: 1,
        mainInstructorRequired: 1,
        mainInstructorName: '우수정',
        assistantInstructorApplied: 0,
        assistantInstructorRequired: 0,
      },
    ],
  },
  {
    key: '2',
    educationId: 'EDU-2025-002',
    educationName: '50차시 프로그램',
    institution: '성남교육청',
    region: '성남시',
    gradeClass: '4학년 2반',
    role: '보조강사',
    instructorName: '이영희',
    applicationDate: '2025.01.14',
    status: '수락됨',
    applier: {
      name: '김영수',
      email: 'kim.youngsu@example.com',
      phone: '010-2345-6789',
      address: '경기도 성남시 분당구 정자로 456',
    },
  },
  {
    key: '3',
    educationId: 'EDU-2025-003',
    educationName: '특수학급 프로그램',
    institution: '고양교육청',
    region: '고양시',
    gradeClass: '5학년 1반',
    role: '주강사',
    instructorName: '박민수',
    applicationDate: '2025.01.13',
    status: '거절됨',
    // No applier info for this item
  },
  {
    key: '4',
    educationId: 'EDU-2025-004',
    educationName: '온라인 교육 프로그램',
    institution: '용인교육청',
    region: '용인시',
    gradeClass: '6학년 3반',
    role: '보조강사',
    instructorName: '최지영',
    applicationDate: '2025.01.12',
    status: '대기',
    applier: {
      name: '이미영',
      email: 'lee.miyoung@example.com',
      phone: '010-3456-7890',
      address: '경기도 용인시 기흥구 신갈로 789',
    },
  },
  {
    key: '5',
    educationId: 'EDU-2025-005',
    educationName: '신규 강사 교육 프로그램',
    institution: '부천교육청',
    region: '부천시',
    gradeClass: '2학년 1반',
    role: '주강사',
    instructorName: '정현우',
    applicationDate: '2025.01.11',
    status: '수락됨',
    // No applier info for this item
  },
]

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: '수락됨', label: '수락됨' },
  { value: '거절됨', label: '거절됨' },
  { value: '대기', label: '대기' },
]

const roleOptions = [
  { value: 'all', label: '전체' },
  { value: '주강사', label: '주강사' },
  { value: '보조강사', label: '보조강사' },
]

const statusStyle: Record<string, { bg: string; text: string }> = {
  수락됨: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  거절됨: { bg: 'bg-slate-100', text: 'text-slate-600' },
  대기: { bg: 'bg-amber-100', text: 'text-amber-700' },
}

export default function InstructorApplicationPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [selectedApplication, setSelectedApplication] = useState<InstructorApplicationItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')
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

  const handleAccept = (key: string) => {
    console.log('Accept application:', key)
    // Handle accept logic
  }

  const handleReject = (key: string) => {
    console.log('Reject application:', key)
    // Handle reject logic
  }

  const handleRowClick = (record: InstructorApplicationItem) => {
    setSelectedApplication(record)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedApplication(null)
  }

  const handleSearch = () => {
    setCurrentPage(1)
  }

  const lessonColumns: ColumnsType<LessonInfo> = [
    {
      title: '수업 차시',
      dataIndex: 'session',
      key: 'session',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '일자',
      dataIndex: 'date',
      key: 'date',
      width: 130,
    },
    {
      title: '시작시간',
      dataIndex: 'startTime',
      key: 'startTime',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '종료시간',
      dataIndex: 'endTime',
      key: 'endTime',
      width: 100,
      align: 'center' as const,
    },
    {
      title: '주강사 (신청/필요)',
      key: 'mainInstructorRatio',
      width: 150,
      align: 'center' as const,
      render: (_, record) => `${record.mainInstructorApplied}/${record.mainInstructorRequired}`,
    },
    {
      title: '주강사',
      dataIndex: 'mainInstructorName',
      key: 'mainInstructorName',
      width: 130,
    },
    {
      title: '보조강사 (신청/필요)',
      key: 'assistantInstructorRatio',
      width: 150,
      align: 'center' as const,
      render: (_, record) => `${record.assistantInstructorApplied}/${record.assistantInstructorRequired}`,
    },
    {
      title: '보조강사',
      dataIndex: 'assistantInstructorName',
      key: 'assistantInstructorName',
      width: 130,
      render: (name) => name || '-',
    },
  ]

  const handleResetFilters = () => {
    setSearchText('')
    setStatusFilter('all')
    setRoleFilter('all')
  }

  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.instructorName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.educationName.toLowerCase().includes(searchText.toLowerCase())
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesRole = roleFilter === 'all' || item.role === roleFilter
      return matchesSearch && matchesStatus && matchesRole
    })
  }, [searchText, statusFilter, roleFilter])

  const columns: ColumnsType<InstructorApplicationItem> = useMemo(
    () => [
      {
        title: '수락/거절',
        key: 'action',
        width: 120,
        fixed: 'left' as const,
        render: (_, record) => {
          if (record.status === '수락됨') {
            return (
              <div className="flex justify-start">
                <Button
                  disabled
                  icon={<Check className="w-4 h-4" />}
                  className="h-8 px-3 rounded-lg bg-green-50 border border-green-200 text-green-700 font-medium"
                  size="small"
                >
                  수락됨
                </Button>
              </div>
            )
          } else if (record.status === '거절됨') {
            return (
              <div className="flex justify-start">
                <Button
                  disabled
                  icon={<X className="w-4 h-4" />}
                  className="h-8 px-3 rounded-lg bg-red-50 border border-red-200 text-red-700 font-medium"
                  size="small"
                >
                  거절됨
                </Button>
              </div>
            )
          } else {
            return (
              <div className="flex gap-2 flex-wrap">
                <Button
                  type="primary"
                  icon={<Check className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAccept(record.key)
                  }}
                  className="h-8 px-3 rounded-lg bg-green-600 hover:bg-green-700 border-0 text-white font-medium transition-all shadow-sm hover:shadow-md"
                  size="small"
                >
                  수락
                </Button>
                <Button
                  danger
                  type="default"
                  icon={<X className="w-4 h-4" />}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleReject(record.key)
                  }}
                  className="h-8 px-3 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
                  size="small"
                >
                  거절
                </Button>
              </div>
            )
          }
        },
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
        dataIndex: 'educationName',
        key: 'educationName',
        width: 200,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '교육기관',
        dataIndex: 'institution',
        key: 'institution',
        width: 150,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '구역',
        dataIndex: 'region',
        key: 'region',
        width: 120,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '학년·반',
        dataIndex: 'gradeClass',
        key: 'gradeClass',
        width: 120,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '신청 역할',
        dataIndex: 'role',
        key: 'role',
        width: 120,
        align: 'center' as const,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '강사명',
        dataIndex: 'instructorName',
        key: 'instructorName',
        width: 120,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '신청일',
        dataIndex: 'applicationDate',
        key: 'applicationDate',
        width: 120,
        render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
      },
      {
        title: '상태',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        align: 'right' as const,
        render: (status: string) => {
          const config = statusStyle[status] || { bg: 'bg-slate-100', text: 'text-slate-600' }
          return (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
            >
              {status}
            </span>
          )
        },
      },
      {
        title: '상세',
        key: 'detail',
        width: 90,
        fixed: 'right' as const,
        render: (_, record) => (
          <Button
            size="small"
            icon={<Eye className="w-3 h-3" />}
            className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleRowClick(record)
            }}
          >
            상세
          </Button>
        ),
      },
    ],
    [filteredData]
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
                  className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
                >
                  필터
                  <ChevronRight className={`w-4 h-4 transition-transform ${filterDropdownOpen ? 'rotate-90' : ''}`} />
                </Button>
                
                {/* Filter Dropdown */}
                {filterDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
                    <div className="space-y-4">
                      {/* Role Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <Select
                            placeholder="ALL ROLES"
                            value={roleFilter === 'all' ? undefined : roleFilter}
                            onChange={setRoleFilter}
                            options={roleOptions.filter(opt => opt.value !== 'all')}
                            className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                            suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
                          />
                        </div>
                      </div>
                      
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <Select
                            placeholder="ALL STATUS"
                            value={statusFilter === 'all' ? undefined : statusFilter}
                            onChange={setStatusFilter}
                            options={statusOptions.filter(opt => opt.value !== 'all')}
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
      ) : viewMode === 'detail' && selectedApplication ? (
        /* Detail View - Redesigned to match Create/Edit page */
        <div className="bg-slate-50 min-h-screen -mx-6 -mt-6 px-6 pt-0">
          {/* Sticky Header */}
          <DetailPageHeaderSticky
            onBack={handleBackToList}
          />

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
            {/* Summary Card */}
            <ApplicationSummaryCard
              educationId={selectedApplication.educationId}
              educationName={selectedApplication.educationName}
              institution={selectedApplication.institution}
              region={selectedApplication.region}
              gradeClass={selectedApplication.gradeClass}
              role={selectedApplication.role}
              applicationDate={selectedApplication.applicationDate}
              status={selectedApplication.status}
            />

            {/* Application Info Section */}
            <DetailSectionCard title="신청 정보">
              <DefinitionListGrid
                items={[
                  { label: '교육ID', value: selectedApplication.educationId },
                  { label: '교육명', value: selectedApplication.educationName },
                  { label: '교육기관', value: selectedApplication.institution },
                  { label: '구역', value: selectedApplication.region },
                  { label: '학년·반', value: selectedApplication.gradeClass },
                  { label: '신청 역할', value: selectedApplication.role },
                  { label: '강사명', value: selectedApplication.instructorName },
                  { label: '신청일', value: selectedApplication.applicationDate },
                  {
                    label: '상태',
                    value: (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          selectedApplication.status === '수락됨'
                            ? 'bg-emerald-100 text-emerald-700'
                            : selectedApplication.status === '거절됨'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {selectedApplication.status}
                      </span>
                    ),
                  },
                ]}
              />
            </DetailSectionCard>

            {/* Applier Info Section */}
            {selectedApplication.applier && (
              <DetailSectionCard title="신청자 정보">
                <DefinitionListGrid
                  items={[
                    { label: '이름', value: selectedApplication.applier.name },
                    { label: '이메일', value: selectedApplication.applier.email },
                    { label: '전화번호', value: selectedApplication.applier.phone },
                    { label: '주소', value: selectedApplication.applier.address },
                  ]}
                />
                {selectedApplication.status === '대기' && (
                  <div className="border-t border-gray-100 pt-6 mt-6 flex flex-col sm:flex-row gap-3">
                    <Button
                      type="primary"
                      icon={<Check className="w-4 h-4" />}
                      onClick={() => handleAccept(selectedApplication.key)}
                      className="h-11 px-6 rounded-xl bg-green-600 hover:bg-green-700 border-0 text-white font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
                    >
                      수락하기
                    </Button>
                    <Button
                      danger
                      type="default"
                      icon={<X className="w-4 h-4" />}
                      onClick={() => handleReject(selectedApplication.key)}
                      className="h-11 px-6 rounded-xl font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
                    >
                      거절하기
                    </Button>
                  </div>
                )}
              </DetailSectionCard>
            )}

            {/* Lessons Info Section */}
            {selectedApplication.lessons && selectedApplication.lessons.length > 0 && (
              <LessonsListCard
                lessons={selectedApplication.lessons}
                columns={lessonColumns}
              />
            )}
          </div>
        </div>
      ) : null}
      </div>
    </ProtectedRoute>
  )
}
