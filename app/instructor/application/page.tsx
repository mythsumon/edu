'use client'

import { useState, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Trash2, Check, X } from 'lucide-react'
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
  region?: string
  gradeClass?: string
  role?: string
  instructorName?: string
  applicationDate?: string
  startDate?: string
  endDate?: string
  note?: string
  status?: '수락됨' | '거절됨' | '대기'
  applier?: ApplierInfo
  lessons?: LessonInfo[]
}

// Empty data for "내가 신청한 교육들" page
// Note: This page is deprecated. Use /instructor/apply/mine instead which uses dataStore
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
    startDate: '2025.01.15',
    endDate: '2025.02.28',
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


export default function InstructorApplicationPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [selectedApplication, setSelectedApplication] = useState<InstructorApplicationItem | null>(null)
  const [detailTab, setDetailTab] = useState<'info' | 'applier' | 'lessons'>('info')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState<string>('')

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
  }

  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      const matchesSearch =
        !searchText ||
        item.educationName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.institution.toLowerCase().includes(searchText.toLowerCase()) ||
        item.educationId.toLowerCase().includes(searchText.toLowerCase())
      return matchesSearch
    })
  }, [searchText])

  const columns: ColumnsType<InstructorApplicationItem> = useMemo(
    () => [
      {
        title: '교육ID',
        dataIndex: 'educationId',
        key: 'educationId',
        width: 150,
        render: (text: string) => <span className="text-sm font-medium text-slate-900 dark:text-gray-100">{text}</span>,
      },
      {
        title: '교육명',
        dataIndex: 'educationName',
        key: 'educationName',
        width: 200,
        render: (text: string) => <span className="text-sm font-medium text-slate-900 dark:text-gray-100">{text}</span>,
      },
      {
        title: '교육기관명',
        dataIndex: 'institution',
        key: 'institution',
        width: 150,
        render: (text: string) => <span className="text-sm font-medium text-slate-900 dark:text-gray-100">{text}</span>,
      },
      {
        title: '시작일',
        dataIndex: 'startDate',
        key: 'startDate',
        width: 120,
        render: (text: string) => <span className="text-sm font-medium text-slate-900 dark:text-gray-100">{text}</span>,
      },
      {
        title: '종료일',
        dataIndex: 'endDate',
        key: 'endDate',
        width: 120,
        render: (text: string) => <span className="text-sm font-medium text-slate-900 dark:text-gray-100">{text}</span>,
      },
      {
        title: '비고',
        dataIndex: 'note',
        key: 'note',
        width: 150,
        render: (text: string) => <span className="text-sm font-medium text-slate-900 dark:text-gray-100">{text || '-'}</span>,
      },
      {
        title: '삭제',
        key: 'delete',
        width: 80,
        align: 'center' as const,
        render: (_, record) => (
          <Button
            size="small"
            danger
            icon={<Trash2 className="w-4 h-4" />}
            onClick={(e) => {
              e.stopPropagation()
              // Handle delete
              console.log('Delete:', record.key)
            }}
            className="h-8 px-3 rounded-lg"
          >
            삭제
          </Button>
        ),
      },
    ],
    []
  )

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="p-6 bg-slate-50 dark:bg-gray-900 min-h-screen transition-colors">

      {viewMode === 'list' ? (
        <>
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-2">내가 신청한 교육들</h1>
          </div>

          {/* Table */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-slate-200 dark:border-gray-700 shadow-sm">
            <div className="overflow-x-auto">
              <Table
                columns={columns}
                dataSource={filteredData}
                locale={{
                  emptyText: (
                    <div className="py-12 text-center">
                      <div className="text-slate-500 dark:text-gray-400 text-base">데이터가 없습니다.</div>
                    </div>
                  ),
                }}
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
                className="[&_.ant-table]:bg-white dark:[&_.ant-table]:bg-gray-800 [&_.ant-table-thead>tr>th]:bg-slate-50 dark:[&_.ant-table-thead>tr>th]:bg-gray-800 [&_.ant-table-thead>tr>th]:border-slate-200 dark:[&_.ant-table-thead>tr>th]:border-gray-700 [&_.ant-table-thead>tr>th]:text-slate-700 dark:[&_.ant-table-thead>tr>th]:text-gray-300 [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-tbody>tr]:bg-white dark:[&_.ant-table-tbody>tr]:bg-gray-800 [&_.ant-table-tbody>tr]:border-slate-200 dark:[&_.ant-table-tbody>tr]:border-gray-700 [&_.ant-table-tbody>tr:hover]:bg-slate-50 dark:[&_.ant-table-tbody>tr:hover]:bg-gray-700 [&_.ant-table-tbody>tr]:transition-colors [&_.ant-pagination]:text-slate-700 dark:[&_.ant-pagination]:text-gray-300 [&_.ant-pagination-item]:bg-white dark:[&_.ant-pagination-item]:bg-gray-700 [&_.ant-pagination-item]:border-slate-200 dark:[&_.ant-pagination-item]:border-gray-600 [&_.ant-pagination-item>a]:text-slate-700 dark:[&_.ant-pagination-item>a]:text-gray-300 [&_.ant-pagination-item-active]:bg-blue-600 [&_.ant-pagination-item-active]:border-blue-600 [&_.ant-pagination-item-active>a]:text-white"
              />
            </div>
          </div>
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
                      className="h-10 px-4 rounded-xl bg-green-600 hover:bg-green-500 hover:brightness-110 hover:ring-2 hover:ring-green-400/40 active:bg-green-600 border-0 text-white font-medium transition-all shadow-sm hover:shadow-md"
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
                <h2 className="text-2xl md:text-3xl font-bold text-[#3a2e2a] leading-tight">
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
                    <h3 className="text-lg font-semibold text-[#3a2e2a]">신청 정보</h3>
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
                    <h3 className="text-lg font-semibold text-[#3a2e2a]">신청자 정보</h3>
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
                      className="h-11 px-6 rounded-xl bg-green-600 hover:bg-green-500 hover:brightness-110 hover:ring-2 hover:ring-green-400/40 active:bg-green-600 border-0 text-white font-medium transition-all shadow-sm hover:shadow-md w-full sm:w-auto"
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
                    <h3 className="text-lg font-semibold text-[#3a2e2a]">수업 정보</h3>
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

