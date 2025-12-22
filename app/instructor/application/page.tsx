'use client'

import { useState, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Input, Select, Space, Descriptions } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, Download, RotateCcw, Check, X, ArrowLeft, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'

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
  수락됨: { bg: 'bg-green-50', text: 'text-green-700' },
  거절됨: { bg: 'bg-red-50', text: 'text-red-700' },
  대기: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
}

export default function InstructorApplicationPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [selectedApplication, setSelectedApplication] = useState<InstructorApplicationItem | null>(null)
  const [detailTab, setDetailTab] = useState<'info' | 'applier' | 'lessons'>('info')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [roleFilter, setRoleFilter] = useState<string>('all')

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
    setDetailTab('info')
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

  const handleBackToList = () => {
    setViewMode('list')
    setSelectedApplication(null)
  }

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
          const config = statusStyle[status] || { bg: 'bg-gray-50', text: 'text-gray-700' }
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
            className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50"
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">강사 신청 관리</h1>
            <div className="flex items-center gap-3 w-full md:w-auto">
              <Button
                type="primary"
                onClick={() => router.push('/instructor?view=register')}
                className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md w-full md:w-auto text-white"
                style={{
                  backgroundColor: '#1a202c',
                  borderColor: '#1a202c',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  color: '#ffffff',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#2d3748'
                  e.currentTarget.style.borderColor = '#2d3748'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a202c'
                  e.currentTarget.style.borderColor = '#1a202c'
                }}
              >
                + 강사 등록
              </Button>
              <Button
                icon={<Download className="w-4 h-4" />}
                onClick={() => console.log('Export to Excel')}
                className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all w-full md:w-auto"
              >
                엑셀 추출
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <Card className="rounded-xl shadow-sm border border-gray-200 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3 items-end">
              <div className="space-y-3">
                <Input
                  placeholder="강사명, 교육명 검색"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  className="h-11 rounded-xl"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Select
                    placeholder="상태 선택"
                    value={statusFilter}
                    onChange={setStatusFilter}
                    options={statusOptions}
                    className="h-11 rounded-xl w-full"
                  />
                  <Select
                    placeholder="신청 역할 선택"
                    value={roleFilter}
                    onChange={setRoleFilter}
                    options={roleOptions}
                    className="h-11 rounded-xl w-full"
                  />
                </div>
              </div>
              <div className="flex gap-1 justify-end">
                <Button
                  type="primary"
                  onClick={handleSearch}
                  className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md"
              style={{
                backgroundColor: '#1a202c',
                borderColor: '#1a202c',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2d3748'
                e.currentTarget.style.borderColor = '#2d3748'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a202c'
                e.currentTarget.style.borderColor = '#1a202c'
              }}
                >
                  검색
                </Button>
                <Button
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={handleResetFilters}
                  className="h-11 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                >
                  초기화
                </Button>
              </div>
            </div>
          </Card>

          {/* Table */}
          <Card className="rounded-xl shadow-sm border border-gray-200">
            <div className="overflow-x-auto">
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
                  position: ['bottomRight'],
                }}
                rowKey="key"
                scroll={{ x: 'max-content' }}
                onRow={(record) => ({
                  onClick: () => handleRowClick(record),
                  className: 'cursor-pointer',
                })}
                className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100 [&_.ant-table-tbody>tr:hover]:bg-blue-50 [&_.ant-table-tbody>tr]:transition-colors"
              />
            </div>
          </Card>
        </>
      ) : (
        /* Detail View */
        selectedApplication && (
          <div className="space-y-6">
            {/* Top actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="text-gray-900 font-medium">상세 정보</span>
              </div>
              <div className="flex gap-2">
                {selectedApplication.status === '대기' && (
                  <>
                    <Button
                      type="primary"
                      icon={<Check className="w-4 h-4" />}
                      onClick={() => handleAccept(selectedApplication.key)}
                      className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-700 border-0 text-white font-medium transition-all shadow-sm hover:shadow-md"
                    >
                      수락
                    </Button>
                    <Button
                      danger
                      icon={<X className="w-4 h-4" />}
                      onClick={() => handleReject(selectedApplication.key)}
                      className="h-10 px-4 rounded-xl font-medium transition-all shadow-sm hover:shadow-md"
                    >
                      거절
                    </Button>
                  </>
                )}
                <Button
                  onClick={handleBackToList}
                  className="h-10 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                >
                  목록으로
                </Button>
              </div>
            </div>

            {/* Hero card */}
            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                  {selectedApplication.educationId}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full">
                  {selectedApplication.role}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                    selectedApplication.status === '수락됨'
                      ? 'bg-green-50 text-green-700'
                      : selectedApplication.status === '거절됨'
                        ? 'bg-red-50 text-red-700'
                        : 'bg-yellow-50 text-yellow-700'
                  }`}
                >
                  {selectedApplication.status}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  {selectedApplication.educationName}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">기관</span>
                    <span className="text-gray-900 font-medium">{selectedApplication.institution}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">구역</span>
                    <span className="text-gray-900 font-medium">{selectedApplication.region}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">학년·반</span>
                    <span className="text-gray-900 font-medium">{selectedApplication.gradeClass}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">신청일</span>
                    <span className="text-gray-900 font-medium">{selectedApplication.applicationDate}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                    detailTab === 'info'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setDetailTab('info')}
                >
                  신청 정보
                </span>
                {selectedApplication.applier && (
                  <span
                    className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                      detailTab === 'applier'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                    }`}
                    onClick={() => setDetailTab('applier')}
                  >
                    신청자 정보
                  </span>
                )}
                {selectedApplication.lessons && selectedApplication.lessons.length > 0 && (
                  <span
                    className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                      detailTab === 'lessons'
                        ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                    }`}
                    onClick={() => setDetailTab('lessons')}
                  >
                    수업 정보 ({selectedApplication.lessons.length})
                  </span>
                )}
              </div>
            </div>

            {/* Tabs content */}
            {detailTab === 'info' && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">신청 정보</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-6">
                  {[
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
                              ? 'bg-green-50 text-green-700'
                              : selectedApplication.status === '거절됨'
                                ? 'bg-red-50 text-red-700'
                                : 'bg-yellow-50 text-yellow-700'
                          }`}
                        >
                          {selectedApplication.status}
                        </span>
                      ),
                    },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="text-sm font-semibold text-gray-500">{item.label}</div>
                      <div className="text-base font-medium text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {detailTab === 'applier' && selectedApplication.applier && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">신청자 정보</h3>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-6">
                  {[
                    { label: '이름', value: selectedApplication.applier.name },
                    { label: '이메일', value: selectedApplication.applier.email },
                    { label: '전화번호', value: selectedApplication.applier.phone },
                    { label: '주소', value: selectedApplication.applier.address },
                  ].map((item) => (
                    <div key={item.label} className="space-y-1">
                      <div className="text-sm font-semibold text-gray-500">{item.label}</div>
                      <div className="text-base font-medium text-gray-900">{item.value}</div>
                    </div>
                  ))}
                </div>

                {selectedApplication.status === '대기' && (
                  <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row gap-3">
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
              </div>
            )}

            {detailTab === 'lessons' && selectedApplication.lessons && selectedApplication.lessons.length > 0 && (
              <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500" />
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">수업 정보</h3>
                  </div>
                  <div className="text-sm text-gray-500">총 {selectedApplication.lessons.length}건</div>
                </div>
                <div className="p-4">
                  <Table
                    columns={lessonColumns}
                    dataSource={selectedApplication.lessons.map((lesson, idx) => ({
                      ...lesson,
                      key: `${selectedApplication.key}-lesson-${idx}`,
                    }))}
                    pagination={{
                      pageSize: 10,
                      showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
                      position: ['bottomRight'],
                    }}
                    scroll={{ x: 'max-content' }}
                    className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table]:text-sm [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100"
                  />
                </div>
              </div>
            )}
          </div>
        )
      )}
      </div>
    </ProtectedRoute>
  )
}

