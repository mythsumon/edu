'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Select, Space, DatePicker, Badge, Modal } from 'antd'
import { Input } from '@/components/shared/common'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeft, RotateCcw, RefreshCw, Eye, CheckCircle2, XCircle, Bell, Search, ChevronRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'

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
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [notificationModalVisible, setNotificationModalVisible] = useState(false)
  const [detailTab, setDetailTab] = useState<'info' | 'lessons'>('info')

  const handleRowClick = (record: InstructorConfirmationItem) => {
    setSelectedInstructor(record)
    setViewMode('detail')
    setDetailTab('info')
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

  const handleSendNotification = () => {
    setNotificationModalVisible(true)
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
            className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50"
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
      <div className="p-6">
      {viewMode === 'list' ? (
        <>

          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <Space>
              <Button
                icon={<RefreshCw className="w-4 h-4" />}
                onClick={() => console.log('Refresh')}
                className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
              >
                새로고침
              </Button>
            </Space>
          </div>

          {/* Modern Search Toolbar */}
          <div className="flex items-center h-16 px-4 py-3 bg-white border border-[#ECECF3] rounded-2xl shadow-[0_8px_24px_rgba(15,15,30,0.06)] mb-4 gap-3 flex-wrap">
            {/* Search Input - Primary, flex-grow */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  onPressEnter={handleSearch}
                  prefix={<Search className="w-4 h-4 text-[#9AA0AE]" />}
                  className="h-11 border-0 bg-transparent rounded-xl text-[#151827] placeholder:text-[#9AA0AE] [&_.ant-input]:!h-11 [&_.ant-input]:!px-4 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-prefix]:!mr-2"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-[220px]">
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
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
            <div className="w-[220px]">
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
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
        selectedInstructor && (
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
                  출강 확정 관리
                </Button>
                <ChevronRight className="w-4 h-4 text-gray-400" />
                <span className="text-gray-900 font-medium">상세 정보</span>
              </div>

              <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                    {selectedInstructor.instructorId}
                  </span>
                  <span
                    className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                      statusStyle[selectedInstructor.status].bg
                    } ${statusStyle[selectedInstructor.status].text}`}
                  >
                    {statusStyle[selectedInstructor.status].icon}
                    <span className="ml-1">
                      {selectedInstructor.status === 'active'
                        ? '활성'
                        : selectedInstructor.status === 'pending'
                          ? '대기 중'
                          : '비활성'}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                    {selectedInstructor.instructorName}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">교육명</span>
                      <span className="text-gray-900 font-medium">{selectedInstructor.educationName}</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200" />
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">배정된 수업</span>
                      <span className="text-gray-900 font-medium">{selectedInstructor.assignedLessons}개</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200" />
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">가능한 수업</span>
                      <span className="text-gray-900 font-medium">{selectedInstructor.availableLessons}개</span>
                    </div>
                    <div className="h-4 w-px bg-gray-200" />
                    <div className="flex items-center gap-1">
                      <span className="text-gray-500">가입일</span>
                      <span className="text-gray-900 font-medium">{selectedInstructor.joinDate}</span>
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
                      강사 정보
                    </span>
                    {selectedInstructor.lessons && selectedInstructor.lessons.length > 0 && (
                      <span
                        className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                          detailTab === 'lessons'
                            ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                        }`}
                        onClick={() => setDetailTab('lessons')}
                      >
                        수업 정보 ({selectedInstructor.lessons.length})
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {selectedInstructor.status === 'pending' && (
                      <>
                        <Button
                          type="primary"
                          icon={<CheckCircle2 className="w-4 h-4" />}
                          onClick={() => handleApprove(selectedInstructor.instructorId)}
                          className="h-11 px-6 rounded-xl bg-green-600 hover:bg-green-700 border-0 font-medium transition-all shadow-sm hover:shadow-md"
                        >
                          승인
                        </Button>
                        <Button
                          danger
                          icon={<XCircle className="w-4 h-4" />}
                          onClick={() => handleReject(selectedInstructor.instructorId)}
                          className="h-11 px-6 rounded-xl font-medium transition-all"
                        >
                          거절
                        </Button>
                      </>
                    )}
                    <Button
                      icon={<Bell className="w-4 h-4" />}
                      onClick={handleSendNotification}
                      className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                    >
                      알림 전송
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {detailTab === 'info' && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">강사 정보</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-6">
                  {[
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
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="text-sm font-semibold text-gray-500">{item.label}</div>
                      <div className="text-base font-medium text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailTab === 'lessons' && selectedInstructor.lessons && selectedInstructor.lessons.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">수업 정보</h3>
                  </div>
                  <div className="text-sm text-gray-500">총 {selectedInstructor.lessons.length}건</div>
                </div>
                <div className="p-4">
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
                    className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )
      )}

      {/* Notification Modal */}
      <Modal
        title="알림 전송"
        open={notificationModalVisible}
        onOk={() => {
          console.log('Send notification')
          setNotificationModalVisible(false)
        }}
        onCancel={() => setNotificationModalVisible(false)}
        okText="전송"
        cancelText="취소"
      >
        <p>강사에게 알림을 전송하시겠습니까?</p>
      </Modal>
      </div>
    </ProtectedRoute>
  )
}

