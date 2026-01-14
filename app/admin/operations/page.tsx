'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Table, Button, Card, Form, Select, DatePicker, InputNumber, TimePicker, Checkbox, Space, Input, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, Download, ArrowLeft, Save, FileText, Trash2, RotateCcw, School, BookOpen, Book, Filter, Search, Eye } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { 
  PageHeaderSticky, 
  SectionAccordion, 
  ClassInfoModeSwitcher,
  ClassInfoGeneralForm,
  ClassInfoExcelImport,
  DetailPageHeaderSticky,
  EducationSummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
  SessionsListCard
} from '@/components/admin/operations'
import type { ExcelRowData } from '@/components/admin/operations'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'

dayjs.locale('ko')

const { RangePicker } = DatePicker
const TextArea = Input.TextArea

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
  '신청 중': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  '신청 마감': { bg: 'bg-slate-100', text: 'text-slate-600' },
  진행중: { bg: 'bg-blue-100', text: 'text-blue-700' },
  완료: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
}

// Get programs from program management page (localStorage or dummyData)
function getProgramOptions() {
  if (typeof window === 'undefined') return []
  
  try {
    // Try to get from localStorage (if programs are stored there)
    const stored = localStorage.getItem('programs')
    if (stored) {
      const programs = JSON.parse(stored)
      return programs
        .filter((p: any) => p.status === '활성' || p.status === '대기')
        .map((p: any) => ({
          value: p.programId || p.key,
          label: p.programDisplayName || p.name,
        }))
    }
  } catch (e) {
    console.warn('Failed to load programs from localStorage', e)
  }
  
  // Fallback to dummy data from program management page
  const dummyPrograms = [
    { key: '1', programId: 'PROG-2025-001', name: '도서벽지 프로그램', status: '활성' },
    { key: '2', programId: 'PROG-2025-002', name: '50차시 프로그램', status: '활성' },
    { key: '3', programId: 'PROG-2025-003', name: '특수학급 프로그램', status: '대기' },
    { key: '4', programId: 'PROG-2025-004', name: '온라인 교육 프로그램', status: '활성' },
  ]
  
  return dummyPrograms
    .filter(p => p.status === '활성' || p.status === '대기')
    .map(p => ({
      value: p.programId,
      label: p.name,
    }))
}

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
  { value: 'OPEN', label: 'OPEN' },
  { value: 'INIT', label: 'INIT' },
  { value: 'CANCEL', label: 'CANCEL' },
]

export default function EducationManagementPage() {
  const [viewMode, setViewMode] = useState<'list' | 'register' | 'detail'>('list')
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedEducation, setSelectedEducation] = useState<EducationItem | null>(null)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form] = Form.useForm()
  const [lessonCount, setLessonCount] = useState<number>(1)
  const [searchText, setSearchText] = useState<string>('')
  
  // Get program options from program management
  const programOptions = useMemo(() => {
    try {
      return getProgramOptions() || []
    } catch (error) {
      console.error('Error loading program options:', error)
      return []
    }
  }, [])
  const [programFilter, setProgramFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [filterDropdownOpen, setFilterDropdownOpen] = useState<boolean>(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)
  const [lessonInputMode, setLessonInputMode] = useState<'general' | 'excel'>('general')

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

  const handleRegisterClick = () => {
    setViewMode('register')
    setFormMode('create')
  }

  const handleViewDetail = (record: EducationItem) => {
    setSelectedEducation(record)
    setViewMode('detail')
  }

  const handleBackToList = () => {
    setViewMode('list')
    form.resetFields()
    setLessonCount(1)
    setSelectedEducation(null)
  }

  const handleFormSubmit = (values: any) => {
    console.log('Form values:', values)
    
    // Get program name from selected program
    const selectedProgram = programOptions?.find(p => p.value === values.program)
    const programName = selectedProgram?.label || values.program || ''
    
    // Validate that all session dates are within the education period
    const startDate = values.startDate ? dayjs(values.startDate) : null
    const endDate = values.endDate ? dayjs(values.endDate) : null
    
    if (startDate && endDate && values.lessons) {
      const invalidSessions: number[] = []
      
      values.lessons.forEach((lesson: any, index: number) => {
        if (lesson.date) {
          const sessionDate = dayjs(lesson.date)
          
          if (sessionDate.isBefore(startDate, 'day')) {
            invalidSessions.push(index + 1)
          } else if (sessionDate.isAfter(endDate, 'day')) {
            invalidSessions.push(index + 1)
          }
        }
      })
      
      if (invalidSessions.length > 0) {
        message.error(
          `${invalidSessions.join(', ')}차시 수업의 일자가 교육 기간(${startDate.format('YYYY.MM.DD')} ~ ${endDate.format('YYYY.MM.DD')}) 안에 있지 않습니다.`
        )
        return
      }
    }
    
    // Build education data with program name as education name and status as '대기'
    const educationData = {
      ...values,
      name: programName, // Use program name as education name
      gradeClass: values.grade && values.class ? `${values.grade} ${values.class}` : (values.grade || values.class || ''),
      status: '대기', // Always set to '대기' (대기) status on save
    }
    
    console.log('Education data:', educationData)
    
    // Handle form submission
    message.success('교육이 저장되었습니다.')
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
    // Parse grade and class from gradeClass (format: "1학년 3반" or "1 3")
    const gradeClassMatch = selectedEducation.gradeClass?.match(/(\S+)\s+(\S+)/)
    const grade = gradeClassMatch ? gradeClassMatch[1] : selectedEducation.gradeClass?.split('학년')[0] || ''
    const classValue = gradeClassMatch ? gradeClassMatch[2] : selectedEducation.gradeClass?.split('학년')[1]?.trim() || ''
    
    form.setFieldsValue({
      program: selectedEducation.programTitle || (programOptions.length > 0 ? programOptions[0].value : ''),
      institution: selectedEducation.institution,
      region: selectedEducation.region,
      grade: grade,
      class: classValue,
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
    setProgramFilter('')
    setStatusFilter('all')
    setDateRange(null)
  }

  const handleSearch = () => {
    setCurrentPage(1)
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
      
      const matchesProgram = !programFilter || (item.programTitle || '').toLowerCase().includes(programFilter.toLowerCase())
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const periodStart = item.periodStart || item.period.split(' ~ ')[0]
      const periodEnd = item.periodEnd || item.period.split(' ~ ')[1] || item.period.split(' ~ ')[0]
      const matchesDateRange =
        !dateRange ||
        !dateRange[0] ||
        !dateRange[1] ||
        (dayjs(periodStart).isAfter(dateRange[0].subtract(1, 'day')) &&
          dayjs(periodEnd).isBefore(dateRange[1].add(1, 'day')))
      return matchesSearch && matchesProgram && matchesStatus && matchesDateRange
    })
  }, [searchText, programFilter, statusFilter, dateRange])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, programFilter, statusFilter, dateRange])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const columns: ColumnsType<EducationItem> = [
    {
      title: (
        <Checkbox
          checked={selectedRowKeys.length > 0 && selectedRowKeys.length === filteredData.length}
          indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < filteredData.length}
          onChange={(e: any) => {
            if (e.target.checked) {
              setSelectedRowKeys(filteredData.map(item => item.key))
            } else {
              setSelectedRowKeys([])
            }
          }}
        />
      ),
      key: 'selection',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.key)}
          onChange={(e: any) => {
            if (e.target.checked) {
              setSelectedRowKeys([...selectedRowKeys, record.key])
            } else {
              setSelectedRowKeys(selectedRowKeys.filter(key => key !== record.key))
            }
          }}
        />
      ),
    },
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
          className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors"
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




  return (
    <ProtectedRoute requiredRole="admin">
      {viewMode === 'detail' && selectedEducation ? (
        /* Detail View - Redesigned to match Create/Edit page */
        <div className="bg-slate-50 min-h-screen px-6 pt-0">
          {/* Sticky Header */}
          <DetailPageHeaderSticky
            onBack={handleBackToList}
            onEdit={handleEditFromDetail}
          />

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
            {/* Summary Card */}
            <EducationSummaryCard
              educationId={selectedEducation.educationId}
              name={selectedEducation.name}
              schoolName={selectedEducation.schoolName}
              institution={selectedEducation.institution}
              period={selectedEducation.period}
              status={selectedEducation.status}
              badges={[
                { label: '미승인', variant: 'warning' },
              ]}
            />

            {/* Education Basic Info Section */}
            <DetailSectionCard title="교육 기본 정보">
              <DefinitionListGrid
                items={[
                  { label: '교육 ID', value: selectedEducation.educationId },
                  { label: '교육명', value: selectedEducation.name },
                  { label: '신청자', value: selectedEducation.requestOrg || '경기미래채움' },
                  { label: '프로그램명', value: selectedEducation.programTitle || selectedEducation.name },
                  { label: '교육 기간', value: selectedEducation.period },
                  {
                    label: '상태',
                    value: (
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          (statusStyle[selectedEducation.status]?.bg || 'bg-slate-100') + ' ' + (statusStyle[selectedEducation.status]?.text || 'text-slate-600')
                        }`}
                      >
                        {selectedEducation.status}
                      </span>
                    ),
                  },
                  { label: '총 회차', value: selectedEducation.totalSessions?.toString() || '12' },
                  { label: '비고', value: selectedEducation.note || '-', span: 2 },
                ]}
              />
            </DetailSectionCard>

            {/* School Info Section */}
            <DetailSectionCard title="학교 정보">
              <DefinitionListGrid
                items={[
                  { label: '기관명', value: selectedEducation.schoolName || selectedEducation.institution },
                  { label: '권역', value: selectedEducation.region || '-' },
                  { label: '학년·학급', value: selectedEducation.gradeClass || '-' },
                ]}
              />
            </DetailSectionCard>

            {/* Sessions Info Section */}
            {selectedEducation.lessons && selectedEducation.lessons.length > 0 ? (
              <SessionsListCard sessions={selectedEducation.lessons} />
            ) : (
              <DetailSectionCard title="수업 정보">
                <div className="text-center py-8 text-slate-500 text-sm">수업 정보가 없습니다.</div>
              </DetailSectionCard>
            )}
          </div>
        </div>
      ) : viewMode === 'register' ? (
        /* Register View */
        <div className="bg-slate-50 min-h-screen px-6 pt-0">
          {/* Sticky Header */}
          <PageHeaderSticky
            mode={formMode}
            onCancel={handleBackToList}
            onTempSave={handleTempSave}
            onSave={() => form.submit()}
          />

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto pt-6">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
            >
              <SectionAccordion
                sections={[
                  {
                    key: 'basic',
                    title: '교육 기본 정보',
                    helperText: '교육 프로그램의 기본 정보를 입력하세요',
                    defaultOpen: true,
                    children: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <Form.Item
                          label={
                            <span>
                              프로그램 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="program"
                          rules={[{ required: true, message: '프로그램을 선택해주세요' }]}
                          className="mb-0"
                          help="교육 프로그램을 선택하세요"
                        >
                          <Select
                            placeholder="프로그램을 선택하세요"
                            options={programOptions}
                            className="h-11 rounded-xl"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              교육기관 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="institution"
                          rules={[{ required: true, message: '교육기관을 선택해주세요' }]}
                          className="mb-0"
                          help="교육을 진행할 기관을 선택하세요"
                        >
                          <Select
                            placeholder="교육기관을 선택하세요"
                            options={institutionOptions}
                            className="h-11 rounded-xl"
                          />
                        </Form.Item>

                        <Form.Item
                          label="설명"
                          name="description"
                          className="mb-0 md:col-span-2"
                          help="교육 프로그램에 대한 상세 설명을 입력하세요"
                        >
                          <TextArea
                            rows={4}
                            placeholder="교육에 대한 설명을 입력하세요"
                            className="rounded-xl"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              시작일 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="startDate"
                          rules={[{ required: true, message: '시작일을 선택해주세요' }]}
                          className="mb-0"
                          help="교육 시작 날짜를 선택하세요"
                        >
                          <DatePicker
                            className="w-full h-11 rounded-xl"
                            placeholder="시작일 선택"
                            format="YYYY.MM.DD"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              종료일 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="endDate"
                          rules={[{ required: true, message: '종료일을 선택해주세요' }]}
                          className="mb-0"
                          help="교육 종료 날짜를 선택하세요"
                        >
                          <DatePicker
                            className="w-full h-11 rounded-xl"
                            placeholder="종료일 선택"
                            format="YYYY.MM.DD"
                          />
                        </Form.Item>

                        <Form.Item
                          label="비고"
                          name="note"
                          className="mb-0 md:col-span-2"
                          help="추가로 필요한 비고 사항을 입력하세요"
                        >
                          <TextArea
                            rows={3}
                            placeholder="비고를 입력하세요"
                            className="rounded-xl"
                          />
                        </Form.Item>
                      </div>
                    ),
                  },
                  {
                    key: 'class',
                    title: '학교 정보',
                    helperText: '교육을 진행할 학교 및 학급 정보를 입력하세요',
                    defaultOpen: true,
                    children: (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
                        <Form.Item
                          label={
                            <span>
                              학년 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="grade"
                          rules={[{ required: true, message: '학년을 입력해주세요' }]}
                          className="mb-0"
                          help="교육 대상 학년을 입력하세요 (예: 1학년, 특수학급 등)"
                        >
                          <Input
                            className="w-full h-11 rounded-xl"
                            placeholder="학년 (예: 1학년, 특수학급 등)"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              반 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="class"
                          rules={[{ required: true, message: '반을 입력해주세요' }]}
                          className="mb-0"
                          help="교육 대상 반을 입력하세요 (예: 1반, A반 등)"
                        >
                          <Input
                            className="w-full h-11 rounded-xl"
                            placeholder="반 (예: 1반, A반 등)"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              학생 수 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="studentCount"
                          rules={[{ required: true, message: '학생 수를 입력해주세요' }]}
                          className="mb-0"
                          help="교육 대상 학생 수를 입력하세요"
                        >
                          <InputNumber
                            className="w-full h-11 rounded-xl"
                            placeholder="학생 수"
                            min={1}
                          />
                        </Form.Item>
                      </div>
                    ),
                  },
                  {
                    key: 'lesson',
                    title: '수업 정보',
                    helperText: '수업 일정 및 강사 배정 정보를 입력하세요',
                    defaultOpen: true,
                    children: (
                      <div className="space-y-6 pt-4">
                        <ClassInfoModeSwitcher
                          mode={lessonInputMode}
                          onChange={(newMode, clearData) => {
                            if (clearData) {
                              // Clear lesson data
                              form.setFieldsValue({ lessons: [] })
                              setLessonCount(1)
                              form.setFieldsValue({ lessonCount: 1 })
                            }
                            setLessonInputMode(newMode)
                          }}
                          hasData={
                            (() => {
                              const currentLessons = form.getFieldValue('lessons') || []
                              return currentLessons.length > 0 && currentLessons.some((l: any) => 
                                l?.date || l?.startTime || l?.endTime || l?.mainInstructorCount || l?.assistantInstructorCount
                              )
                            })()
                          }
                        />

                        {lessonInputMode === 'general' ? (
                          <ClassInfoGeneralForm
                            lessonCount={lessonCount}
                            lessons={form.getFieldValue('lessons') || Array.from({ length: lessonCount }, () => ({}))}
                            onLessonCountChange={(count) => {
                              setLessonCount(count)
                              form.setFieldsValue({ lessonCount: count })
                              const currentLessons = form.getFieldValue('lessons') || []
                              if (count < currentLessons.length) {
                                const updatedLessons = currentLessons.slice(0, count)
                                form.setFieldsValue({ lessons: updatedLessons })
                              } else if (count > currentLessons.length) {
                                // Add empty lessons for new count
                                const newLessons = [...currentLessons]
                                for (let i = currentLessons.length; i < count; i++) {
                                  newLessons.push({})
                                }
                                form.setFieldsValue({ lessons: newLessons })
                              }
                            }}
                            onLessonsChange={(lessons) => {
                              form.setFieldsValue({ lessons })
                            }}
                            form={form}
                            periodStart={form.getFieldValue('startDate')}
                            periodEnd={form.getFieldValue('endDate')}
                          />
                        ) : (
                          <ClassInfoExcelImport
                            onApply={(excelData: ExcelRowData[], importMode: 'replace' | 'append') => {
                              // Convert Excel data to form format
                              const lessons = excelData.map((row) => ({
                                date: row.일자 ? dayjs(row.일자) : null,
                                startTime: row.시작시간 ? dayjs(row.시작시간, 'HH:mm') : null,
                                endTime: row.종료시간 ? dayjs(row.종료시간, 'HH:mm') : null,
                                mainInstructorCount: row.주강사수,
                                assistantInstructorCount: row.보조강사수,
                              }))
                              
                              const currentLessons = form.getFieldValue('lessons') || []
                              
                              if (importMode === 'replace') {
                                form.setFieldsValue({ lessons })
                                setLessonCount(lessons.length)
                                form.setFieldsValue({ lessonCount: lessons.length })
                              } else {
                                // Append mode
                                const mergedLessons = [...currentLessons, ...lessons]
                                form.setFieldsValue({ lessons: mergedLessons })
                                setLessonCount(mergedLessons.length)
                                form.setFieldsValue({ lessonCount: mergedLessons.length })
                              }
                              
                              // Switch back to general mode to show the imported data
                              setLessonInputMode('general')
                            }}
                          />
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </Form>
          </div>
        </div>
      ) : (
      <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        {viewMode === 'list' && (
          <>
            <Space>
              <Button
                type="primary"
                onClick={handleRegisterClick}
                className="h-11 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                + 교육 등록
              </Button>
              <Button
                icon={<RotateCcw className="w-4 h-4" />}
                onClick={() => {
                  handleResetFilters()
                  setCurrentPage(1)
                }}
                className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
              >
                새로고침
              </Button>
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
      </div>

      {viewMode === 'list' ? (
        <>
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
                  className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
                >
                  필터
                  <ChevronRight className={`w-4 h-4 transition-transform ${filterDropdownOpen ? 'rotate-90' : ''}`} />
                </Button>
                
                {/* Filter Dropdown */}
                {filterDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
                    <div className="space-y-4">
                      {/* Program Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">프로그램</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <Select
                            placeholder="ALL PROGRAMS"
                            value={programFilter || undefined}
                            onChange={(value) => setProgramFilter(value || '')}
                            options={programOptions}
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
                            options={statusOptions.filter((opt) => opt.value !== 'all')}
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
                            handleApplyFilters()
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
                onShowSizeChange: (current, size) => {
                  setCurrentPage(1)
                  setPageSize(size)
                },
              }}
              rowKey="key"
              scroll={{ x: 'max-content' }}
              className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#3b82f6] [&_.ant-pagination-item-active]:!bg-[#3b82f6] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
            />
          </Card>
        </>
      ) : null}
      </div>
    )}
    </ProtectedRoute>
  )
}
