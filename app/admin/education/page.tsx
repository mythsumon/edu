'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Form, Input, Select, DatePicker, InputNumber, TimePicker, Checkbox, Space, Upload } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, Download, ArrowLeft, Save, FileText, Trash2, RotateCcw, School, BookOpen, Book, Filter, Search, Eye, Upload as UploadIcon, Tag, X } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

const { RangePicker } = DatePicker
const { Dragger } = Upload

const { TextArea } = Input

interface EducationItem {
  key: string
  status: string
  educationId: string
  name: string
  institution: string
  region: string
  gradeClass: string
  period: string
  periodStart?: string
  periodEnd?: string
  requestOrg?: string
  schoolName?: string
  programTitle?: string
  courseName?: string
  totalSessions?: number
  note?: string
  lessons?: LessonItem[]
}

interface LessonItem {
  title: string
  date: string
  startTime: string
  endTime: string
  mainInstructors: number
  assistantInstructors: number
  mainInstructorName?: string
  assistantInstructorName?: string
}

const dummyData: EducationItem[] = [
  {
    key: '1',
    status: '신청 마감',
    educationId: 'EDU-2025-001',
    name: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    institution: '경기미래채움',
    region: '1권역',
    gradeClass: '1학년 3반',
    requestOrg: '경기도교육청',
    schoolName: '한마음초등학교',
    programTitle: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    courseName: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    totalSessions: 12,
    note: '-',
    period: '2025.01.15 ~ 2025.02.28',
    lessons: [
      {
        title: '1차시',
        date: '2025.01.15',
        startTime: '10:00',
        endTime: '12:00',
        mainInstructors: 1,
        assistantInstructors: 1,
      },
      {
        title: '2차시',
        date: '2025.01.22',
        startTime: '10:00',
        endTime: '12:00',
        mainInstructors: 1,
        assistantInstructors: 1,
      },
    ],
  },
  {
    key: '2',
    status: '신청 중',
    educationId: 'EDU-2025-002',
    name: '도서벽지 지역 특별 교육',
    institution: '수원교육청',
    region: '2권역',
    gradeClass: '2학년 1반',
    period: '2025.01.10 ~ 2025.03.10',
    periodStart: '2025.01.10',
    periodEnd: '2025.03.10',
    lessons: [
      {
        title: '1차시',
        date: '2025.01.10',
        startTime: '13:00',
        endTime: '15:00',
        mainInstructors: 1,
        assistantInstructors: 0,
      },
    ],
  },
  {
    key: '3',
    status: '신청 마감',
    educationId: 'EDU-2025-003',
    name: '특수학급 교사 역량 강화',
    institution: '성남교육청',
    region: '3권역',
    gradeClass: '3학년 2반',
    period: '2024.12.01 ~ 2025.01.31',
    periodStart: '2024.12.01',
    periodEnd: '2025.01.31',
  },
  {
    key: '4',
    status: '신청 중',
    educationId: 'EDU-2025-004',
    name: '50차시 프로그램 운영 교육',
    institution: '안양교육청',
    region: '4권역',
    gradeClass: '4학년 4반',
    period: '2025.02.01 ~ 2025.04.30',
    periodStart: '2025.02.01',
    periodEnd: '2025.04.30',
  },
  {
    key: '5',
    status: '신청 중',
    educationId: 'EDU-2025-005',
    name: '신규 강사 오리엔테이션',
    institution: '고양교육청',
    region: '5권역',
    gradeClass: '5학년 1반',
    period: '2025.01.20 ~ 2025.02.20',
    periodStart: '2025.01.20',
    periodEnd: '2025.02.20',
  },
]

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: '신청 중', label: '신청 중' },
  { value: '신청 마감', label: '신청 마감' },
  { value: '진행중', label: '진행중' },
  { value: '완료', label: '완료' },
]

const statusStyle: Record<string, { bg: string; text: string }> = {
  '신청 중': { bg: 'bg-green-50', text: 'text-green-700' },
  '신청 마감': { bg: 'bg-gray-50', text: 'text-gray-700' },
  진행중: { bg: 'bg-blue-50', text: 'text-blue-700' },
  완료: { bg: 'bg-purple-50', text: 'text-purple-700' },
}

const programOptions = [
  { value: 'program1', label: '도서벽지 프로그램' },
  { value: 'program2', label: '50차시 프로그램' },
  { value: 'program3', label: '특수학급 프로그램' },
]

const institutionOptions = [
  { value: '경기교육청', label: '경기교육청' },
  { value: '수원교육청', label: '수원교육청' },
  { value: '성남교육청', label: '성남교육청' },
  { value: '안양교육청', label: '안양교육청' },
  { value: '고양교육청', label: '고양교육청' },
]

const regionOptions = [
  { value: '1권역', label: '1권역' },
  { value: '2권역', label: '2권역' },
  { value: '3권역', label: '3권역' },
  { value: '4권역', label: '4권역' },
  { value: '5권역', label: '5권역' },
  { value: '6권역', label: '6권역' },
]

const educationStatusOptions = [
  { value: '신청 중', label: '신청 중' },
  { value: '신청 마감', label: '신청 마감' },
  { value: '진행중', label: '진행중' },
  { value: '완료', label: '완료' },
]

export default function EducationManagementPage() {
  const [viewMode, setViewMode] = useState<'list' | 'register' | 'detail'>('list')
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedEducation, setSelectedEducation] = useState<EducationItem | null>(null)
  const [detailTab, setDetailTab] = useState<'basic' | 'lessons'>('basic')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form] = Form.useForm()
  const [lessonCount, setLessonCount] = useState<number>(1)
  const [activeSection, setActiveSection] = useState<string>('basic')
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [searchText, setSearchText] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  const handleRegisterClick = () => {
    setViewMode('register')
    setFormMode('create')
    setActiveSection('basic')
  }

  const handleViewDetail = (record: EducationItem) => {
    setSelectedEducation(record)
    setViewMode('detail')
    setDetailTab('basic')
  }

  const handleBackToList = () => {
    setViewMode('list')
    form.resetFields()
    setLessonCount(1)
    setSelectedEducation(null)
  }

  const handleFormSubmit = (values: any) => {
    console.log('Form values:', values)
    // Handle form submission
  }

  const handleTempSave = () => {
    const values = form.getFieldsValue()
    console.log('Temp save:', values)
    // Handle temporary save
  }

  const handleEditFromDetail = () => {
    if (!selectedEducation) return
    setViewMode('register')
    setFormMode('edit')
    const lessonLen = selectedEducation.lessons?.length || 1
    setLessonCount(lessonLen)
    form.setFieldsValue({
      name: selectedEducation.name,
      program: programOptions[0]?.value,
      institution: selectedEducation.institution,
      region: selectedEducation.region,
      gradeClass: selectedEducation.gradeClass,
      status: selectedEducation.status,
      lessonCount: lessonLen,
      lessons: selectedEducation.lessons?.map((lesson) => ({
        date: lesson.date ? dayjs(lesson.date) : null,
        startTime: lesson.startTime ? dayjs(lesson.startTime, 'HH:mm') : null,
        endTime: lesson.endTime ? dayjs(lesson.endTime, 'HH:mm') : null,
        mainInstructorCount: lesson.mainInstructors,
        assistantInstructorCount: lesson.assistantInstructors,
      })),
    })
  }

  const handleResetFilters = () => {
    setSearchText('')
    setStatusFilter('all')
    setDateRange(null)
  }

  const handleApplyFilters = () => {
    // Filter logic will be applied in filteredData
    setCurrentPage(1) // Reset to first page when filtering
  }

  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      // Unified search - matches institution, program, education name, or ID
      const searchLower = searchText.toLowerCase()
      const matchesSearch = !searchText || 
        item.institution.toLowerCase().includes(searchLower) ||
        (item.programTitle || '').toLowerCase().includes(searchLower) ||
        item.name.toLowerCase().includes(searchLower) ||
        item.educationId.toLowerCase().includes(searchLower)
      
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const periodStart = item.periodStart || item.period.split(' ~ ')[0]
      const periodEnd = item.periodEnd || item.period.split(' ~ ')[1] || item.period.split(' ~ ')[0]
      const matchesDateRange =
        !dateRange ||
        !dateRange[0] ||
        !dateRange[1] ||
        (dayjs(periodStart).isAfter(dateRange[0].subtract(1, 'day')) &&
          dayjs(periodEnd).isBefore(dateRange[1].add(1, 'day')))
      return matchesSearch && matchesStatus && matchesDateRange
    })
  }, [searchText, statusFilter, dateRange])

  const columns: ColumnsType<EducationItem> = [
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = statusStyle[status] || { bg: 'bg-gray-50', text: 'text-gray-700' }
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {status}
          </span>
        )
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
      dataIndex: 'name',
      key: 'name',
      width: 250,
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
      title: '교육기간',
      dataIndex: 'period',
      key: 'period',
      width: 200,
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
          className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50"
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetail(record)
          }}
        >
          상세
        </Button>
      ),
    },
  ]

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys)
    },
    onSelectAll: (selected: boolean, selectedRows: EducationItem[], changeRows: EducationItem[]) => {
      if (selected) {
        const allKeys = filteredData.map((item) => item.key)
        setSelectedRowKeys(allKeys)
      } else {
        setSelectedRowKeys([])
      }
    },
  }

  const sections = [
    { key: 'basic', label: '교육 기본 정보' },
    { key: 'class', label: '학급 정보' },
    { key: 'lesson', label: '수업 정보' },
  ]

  // Scroll to section when clicking navigation
  useEffect(() => {
    if (viewMode === 'register' && sectionRefs.current[activeSection]) {
      sectionRefs.current[activeSection]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [activeSection, viewMode])

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleFileUpload = (info: any) => {
    const { file } = info
    if (file.status === 'done') {
      setUploadedFiles([...uploadedFiles, file])
    } else if (file.status === 'removed') {
      setUploadedFiles(uploadedFiles.filter(f => f.uid !== file.uid))
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        {viewMode === 'list' && (
          <>
            <Space>
              {selectedRowKeys.length > 0 && (
                <Button
                  danger
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={() => {
                    console.log('Delete educations:', selectedRowKeys)
                    setSelectedRowKeys([])
                  }}
                  className="h-11 px-6 rounded-xl font-medium transition-all"
                >
                  삭제 ({selectedRowKeys.length})
                </Button>
              )}
              <Button
                type="primary"
                onClick={handleRegisterClick}
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
                + 교육 등록
              </Button>
            </Space>
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={() => console.log('Export to Excel')}
              className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
            >
              엑셀 추출
            </Button>
          </>
        )}
        {viewMode === 'register' && (
          <Space>
            <Button
              icon={<FileText className="w-4 h-4" />}
              onClick={handleTempSave}
              className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
            >
              임시저장
            </Button>
            <Button
              type="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={() => form.submit()}
              className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white"
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
              저장
            </Button>
            <Button
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBackToList}
              className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
            >
              취소
            </Button>
          </Space>
        )}
        {viewMode === 'detail' && (
          <>
            <Button
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBackToList}
              className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
            >
              목록으로
            </Button>
            <Space>
              <Button
                icon={<FileText className="w-4 h-4" />}
                onClick={() => console.log('Print detail')}
                className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
              >
                인쇄
              </Button>
              <Button
                type="primary"
                onClick={handleEditFromDetail}
                className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white"
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
                수정하기
              </Button>
            </Space>
          </>
        )}
      </div>

      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4">
          {/* Modern Search Toolbar */}
          <div className="flex items-center h-16 px-4 py-3 bg-white border border-[#ECECF3] rounded-2xl shadow-[0_8px_24px_rgba(15,15,30,0.06)] mb-4 gap-3 flex-wrap">
            {/* Search Input - Primary, flex-grow */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200">
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                  prefix={<Search className="w-4 h-4 text-[#9AA0AE]" />}
                  className="h-11 border-0 bg-transparent rounded-xl text-[#151827] placeholder:text-[#9AA0AE] [&_.ant-input]:!h-11 [&_.ant-input]:!px-4 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-prefix]:!mr-2"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-[220px]">
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200">
                <Select
                  placeholder="ALL STATUS"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { value: 'all', label: '전체' },
                    ...statusOptions.filter((opt) => opt.value !== 'all'),
                  ]}
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
              rowSelection={rowSelection}
              onRow={(record) => ({
                onClick: () => handleViewDetail(record),
                className: 'cursor-pointer',
              })}
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
              className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#ff8a65] [&_.ant-pagination-item-active]:!bg-[#ff8a65] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
            />
          </Card>
        </div>
      ) : viewMode === 'detail' && selectedEducation ? (
        /* Detail View */
        <div className="space-y-6">
          {/* Top actions */}
          <div className="flex flex-col gap-3">

            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                    No. {selectedEducation.educationId.replace('EDU-', '')}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded-full">
                    미승인
                  </span>
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                    {selectedEducation.status}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">{selectedEducation.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">학교</span>
                    <span className="text-gray-900 font-medium">{selectedEducation.schoolName || '한마음초등학교'}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">기관</span>
                    <span className="text-gray-900 font-medium">{selectedEducation.institution}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">기간</span>
                    <span className="text-gray-900 font-medium">{selectedEducation.period}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                    detailTab === 'basic'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setDetailTab('basic')}
                >
                  기본 정보
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                    detailTab === 'lessons'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setDetailTab('lessons')}
                >
                  수업 일정 ({selectedEducation.lessons?.length || 0})
                </span>
              </div>
            </div>
          </div>

          {detailTab === 'basic' && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">기본 정보</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-6">
                {[
                  { label: '교육 ID', value: selectedEducation.educationId },
                  { label: '교육명', value: selectedEducation.name },
                  { label: '신청자', value: selectedEducation.requestOrg || '경기미래채움' },
                  { label: '기관명', value: selectedEducation.schoolName || selectedEducation.institution },
                  { label: '프로그램명', value: selectedEducation.programTitle || selectedEducation.name },
                  { label: '과정명', value: selectedEducation.courseName || selectedEducation.name },
                  { label: '교육 기간', value: selectedEducation.period },
                  {
                    label: '상태',
                    value: (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          (statusStyle[selectedEducation.status]?.bg || 'bg-gray-50') + ' ' + (statusStyle[selectedEducation.status]?.text || 'text-gray-700')
                        }`}
                      >
                        {selectedEducation.status}
                      </span>
                    ),
                  },
                  { label: '총 회시', value: selectedEducation.totalSessions ?? '12' },
                  { label: '비고', value: selectedEducation.note ?? '-' },
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
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">수업 일정</h3>
                </div>
                <div className="text-sm text-gray-500">총 {selectedEducation.lessons?.length || 0}건</div>
              </div>
              <div className="p-4">
                <Table
                  columns={[
                    { title: '일자', dataIndex: 'date', key: 'date', width: 130 },
                    { title: '시간', dataIndex: 'time', key: 'time', width: 140 },
                    { title: '주강사 상태', dataIndex: 'mainStatus', key: 'mainStatus', width: 140 },
                    { title: '주강사', dataIndex: 'mainInstructorName', key: 'mainInstructorName', width: 130 },
                    { title: '보조강사 상태', dataIndex: 'assistantStatus', key: 'assistantStatus', width: 150 },
                    { title: '보조강사', dataIndex: 'assistantInstructorName', key: 'assistantInstructorName', width: 130 },
                    { title: '비고', dataIndex: 'note', key: 'note', width: 100 },
                  ]}
                  dataSource={(selectedEducation.lessons || []).map((lesson, idx) => ({
                    key: `${selectedEducation.key}-lesson-${idx}`,
                    date: lesson.date,
                    time: `${lesson.startTime} ~ ${lesson.endTime}`,
                    mainStatus: (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700">
                        매칭완료
                      </span>
                    ),
                    assistantStatus: (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700">
                        신청 중 ({lesson.assistantInstructors}/{lesson.assistantInstructors})
                      </span>
                    ),
                    mainInstructorName: lesson.mainInstructorName || '우수현',
                    assistantInstructorName: lesson.assistantInstructorName || '-',
                    note: '-',
                  }))}
                  pagination={{
                    pageSize: 10,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
                    position: ['bottomRight'],
                  }}
                  scroll={{ x: 'max-content' }}
                  className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#ff8a65] [&_.ant-pagination-item-active]:!bg-[#ff8a65] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Register View */
        <div className="space-y-6">
          {/* Image Attachment and Tags Section - Moved to top */}
          <Card className="rounded-2xl shadow-sm border border-gray-200">
            <div className="space-y-6">
              {/* File Upload Section */}
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">첨부 이미지</h3>
                <Dragger
                  multiple
                  beforeUpload={() => false}
                  onChange={handleFileUpload}
                  fileList={uploadedFiles}
                  className="rounded-xl"
                >
                  <div className="p-6">
                    <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-sm text-gray-600">
                      <span className="font-semibold text-blue-600">클릭하여 파일 선택</span> 또는 드래그 앤 드롭
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF 최대 10MB</p>
                  </div>
                </Dragger>
                
                {/* Preview of uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {uploadedFiles.map((file) => (
                      <div key={file.uid} className="relative group">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                          {file.type?.startsWith('image/') ? (
                            <img 
                              src={URL.createObjectURL(file.originFileObj)} 
                              alt={file.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <FileText className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="mt-2 text-xs text-gray-700 truncate">{file.name}</div>
                        <button
                          type="button"
                          onClick={() => setUploadedFiles(uploadedFiles.filter(f => f.uid !== file.uid))}
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-red-500 text-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Tags Section */}
              <div>
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">태그</h3>
                <div className="flex flex-wrap gap-2 mb-3">
                  {tags.map((tag) => (
                    <span 
                      key={tag} 
                      className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      <Tag className="w-4 h-4 mr-1" />
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onPressEnter={handleAddTag}
                    placeholder="태그 입력 후 Enter"
                    className="h-11 rounded-xl flex-1"
                  />
                  <Button
                    onClick={handleAddTag}
                    className="h-11 px-4 rounded-lg border-0 font-medium text-white transition-all shadow-sm hover:shadow-md"
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
                    추가
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Original form sections with sticky navigation */}
          <div className="flex gap-6">
            {/* Sticky Section Navigation */}
            <div className="w-64 flex-shrink-0">
              <Card className="rounded-2xl shadow-sm border border-gray-200 sticky top-6">
                <div className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.key}
                      onClick={() => setActiveSection(section.key)}
                      className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                        activeSection === section.key
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {section.label}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Form Content */}
            <div className="flex-1">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleFormSubmit}
                className="space-y-6"
              >
                {/* 교육 기본 정보 */}
                <Card
                  ref={(el) => { sectionRefs.current['basic'] = el }}
                  id="basic"
                  className="rounded-2xl shadow-sm border border-gray-200"
                  title={<span className="text-lg font-semibold">교육 기본 정보</span>}
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label="프로그램"
                      name="program"
                      rules={[{ required: true, message: '프로그램을 선택해주세요' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="프로그램을 선택하세요"
                        options={programOptions}
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      label="교육기관"
                      name="institution"
                      rules={[{ required: true, message: '교육기관을 선택해주세요' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="교육기관을 선택하세요"
                        options={institutionOptions}
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      label="교육명"
                      name="name"
                      rules={[{ required: true, message: '교육명을 입력해주세요' }]}
                      className="mb-0 md:col-span-2"
                    >
                      <Input placeholder="교육명을 입력하세요" className="h-11 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                      label="설명"
                      name="description"
                      className="mb-0 md:col-span-2"
                    >
                      <TextArea
                        rows={4}
                        placeholder="교육에 대한 설명을 입력하세요"
                        className="rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      label="시작일"
                      name="startDate"
                      rules={[{ required: true, message: '시작일을 선택해주세요' }]}
                      className="mb-0"
                    >
                      <DatePicker
                        className="w-full h-11 rounded-xl"
                        placeholder="시작일 선택"
                        format="YYYY.MM.DD"
                      />
                    </Form.Item>

                    <Form.Item
                      label="종료일"
                      name="endDate"
                      rules={[{ required: true, message: '종료일을 선택해주세요' }]}
                      className="mb-0"
                    >
                      <DatePicker
                        className="w-full h-11 rounded-xl"
                        placeholder="종료일 선택"
                        format="YYYY.MM.DD"
                      />
                    </Form.Item>

                    <Form.Item
                      label="상태"
                      name="status"
                      rules={[{ required: true, message: '상태를 선택해주세요' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="상태를 선택하세요"
                        options={educationStatusOptions}
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      label="비고"
                      name="note"
                      className="mb-0"
                    >
                      <TextArea
                        rows={3}
                        placeholder="비고를 입력하세요"
                        className="rounded-xl"
                      />
                    </Form.Item>
                  </div>
                </Card>

                {/* 학급 정보 */}
                <Card
                  ref={(el) => { sectionRefs.current['class'] = el }}
                  id="class"
                  className="rounded-2xl shadow-sm border border-gray-200"
                  title={<span className="text-lg font-semibold">학급 정보</span>}
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Form.Item
                      label="학년"
                      name="grade"
                      rules={[{ required: true, message: '학년을 입력해주세요' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        className="w-full h-11 rounded-xl"
                        placeholder="학년"
                        min={1}
                        max={6}
                      />
                    </Form.Item>

                    <Form.Item
                      label="반"
                      name="class"
                      rules={[{ required: true, message: '반을 입력해주세요' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        className="w-full h-11 rounded-xl"
                        placeholder="반"
                        min={1}
                      />
                    </Form.Item>

                    <Form.Item
                      label="학생 수"
                      name="studentCount"
                      rules={[{ required: true, message: '학생 수를 입력해주세요' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        className="w-full h-11 rounded-xl"
                        placeholder="학생 수"
                        min={1}
                      />
                    </Form.Item>
                  </div>
                </Card>

                {/* 수업 정보 */}
                <Card
                  ref={(el) => { sectionRefs.current['lesson'] = el }}
                  id="lesson"
                  className="rounded-2xl shadow-sm border border-gray-200"
                  title={<span className="text-lg font-semibold">수업 정보</span>}
                >
                  <Form.Item
                    label="수업 개수"
                    name="lessonCount"
                    rules={[{ required: true, message: '수업 개수를 입력해주세요' }]}
                    className="mb-0"
                  >
                    <InputNumber
                      className="w-full h-11 rounded-xl"
                      placeholder="수업 개수"
                      min={1}
                      value={lessonCount}
                      onChange={(value) => {
                        const newCount = value || 1
                        setLessonCount(newCount)
                        // Update form field value
                        form.setFieldsValue({ lessonCount: newCount })
                        // Clean up removed lesson fields if count decreased
                        const currentLessons = form.getFieldValue('lessons') || []
                        if (newCount < currentLessons.length) {
                          const updatedLessons = currentLessons.slice(0, newCount)
                          form.setFieldsValue({ lessons: updatedLessons })
                        }
                      }}
                    />
                  </Form.Item>

                  <div className="space-y-4">
                    {Array.from({ length: lessonCount }).map((_, index) => (
                      <Card
                        key={index}
                        className="rounded-xl border border-gray-200 bg-gray-50"
                        title={<span className="text-sm font-medium">{index + 1}차시 수업</span>}
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Form.Item
                            label="일자"
                            name={['lessons', index, 'date']}
                            rules={[{ required: true, message: '일자를 선택해주세요' }]}
                            className="mb-0"
                          >
                            <DatePicker
                              className="w-full h-11 rounded-xl"
                              placeholder="일자 선택"
                              format="YYYY.MM.DD"
                            />
                          </Form.Item>

                          <Form.Item
                            label="시작시간"
                            name={['lessons', index, 'startTime']}
                            rules={[{ required: true, message: '시작시간을 선택해주세요' }]}
                            className="mb-0"
                          >
                            <TimePicker
                              className="w-full h-11 rounded-xl"
                              placeholder="시작시간 선택"
                              format="HH:mm"
                            />
                          </Form.Item>

                          <Form.Item
                            label="종료시간"
                            name={['lessons', index, 'endTime']}
                            rules={[{ required: true, message: '종료시간을 선택해주세요' }]}
                            className="mb-0"
                          >
                            <TimePicker
                              className="w-full h-11 rounded-xl"
                              placeholder="종료시간 선택"
                              format="HH:mm"
                            />
                          </Form.Item>

                          <Form.Item
                            label="필요 주강사 수"
                            name={['lessons', index, 'mainInstructorCount']}
                            rules={[{ required: true, message: '필요 주강사 수를 입력해주세요' }]}
                            className="mb-0"
                          >
                            <InputNumber
                              className="w-full h-11 rounded-xl"
                              placeholder="필요 주강사 수"
                              min={1}
                            />
                          </Form.Item>

                          <Form.Item
                            label="필요 보조강사 수"
                            name={['lessons', index, 'assistantInstructorCount']}
                            rules={[{ required: true, message: '필요 보조강사 수를 입력해주세요' }]}
                            className="mb-0"
                          >
                            <InputNumber
                              className="w-full h-11 rounded-xl"
                              placeholder="필요 보조강사 수"
                              min={0}
                            />
                          </Form.Item>
                        </div>
                      </Card>
                    ))}
                  </div>
                </Card>
              </Form>
            </div>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}
