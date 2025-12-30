'use client'

import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Form, Input, Select, DatePicker, InputNumber, TimePicker, Checkbox, Space, Upload } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, Download, ArrowLeft, Save, FileText, Trash2, RotateCcw, School, BookOpen, Book, Filter, Search, Eye, Upload as UploadIcon, Tag, X } from 'lucide-react'
import { 
  DetailPageHeaderSticky,
  EducationSummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
  SessionsListCard
} from '@/components/admin/operations'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { dataStore, type Education } from '@/lib/dataStore'
import { message } from 'antd'

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
  '신청 중': { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  '신청 마감': { bg: 'bg-slate-100', text: 'text-slate-600' },
  진행중: { bg: 'bg-blue-100', text: 'text-blue-700' },
  완료: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
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
  const [activeSection, setActiveSection] = useState<string>('basic')
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})
  const [searchText, setSearchText] = useState<string>('')
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
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])

  const handleRegisterClick = () => {
    setViewMode('register')
    setFormMode('create')
    setLessonCount(1)
    form.resetFields()
    form.setFieldsValue({ lessonCount: 1 })
    setFormMode('create')
    setActiveSection('basic')
  }

  const handleViewDetail = useCallback((record: EducationItem) => {
    setSelectedEducation(record)
    setViewMode('detail')
  }, [])

  const handleBackToList = () => {
    setViewMode('list')
    form.resetFields()
    setLessonCount(1)
    setSelectedEducation(null)
  }

  const handleFormSubmit = (values: any) => {
    try {
      // Generate education ID if creating new
      const educationId = formMode === 'create' 
        ? `EDU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
        : selectedEducation?.educationId || `EDU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

      // Format period
      const periodStart = values.periodStart ? dayjs(values.periodStart).format('YYYY-MM-DD') : undefined
      const periodEnd = values.periodEnd ? dayjs(values.periodEnd).format('YYYY-MM-DD') : undefined
      const period = periodStart && periodEnd ? `${periodStart} ~ ${periodEnd}` : periodStart || ''

      // Format lessons
      const lessons = values.lessons?.map((lesson: any, index: number) => ({
        title: `${index + 1}차시`,
        date: lesson.date ? dayjs(lesson.date).format('YYYY.MM.DD') : '',
        startTime: lesson.startTime ? dayjs(lesson.startTime).format('HH:mm') : '',
        endTime: lesson.endTime ? dayjs(lesson.endTime).format('HH:mm') : '',
        mainInstructors: 0,
        assistantInstructors: 0,
      })) || []

      const educationData: Education = {
        key: formMode === 'edit' && selectedEducation ? selectedEducation.key : educationId,
        status: values.status || '신청 중',
        educationId,
        name: values.name || '',
        institution: values.institution || '',
        region: values.region || '',
        gradeClass: values.grade ? `${values.grade}학년 ${values.class}반` : '',
        period,
        periodStart,
        periodEnd,
        requestOrg: values.requestOrg,
        schoolName: values.schoolName,
        programTitle: values.program,
        courseName: values.name,
        totalSessions: values.lessonCount || lessons.length,
        note: values.note,
        educationStatus: values.status === '신청 마감' ? '신청 마감' : (values.status === 'OPEN' ? 'OPEN' : '신청 중'),
        applicationDeadline: values.applicationDeadline ? dayjs(values.applicationDeadline).format('YYYY-MM-DD') : undefined,
        lessons,
      }

      if (formMode === 'create') {
        // Add new education to dataStore
        dataStore.addEducation(educationData)
        message.success('교육이 등록되었습니다.')
      } else {
        // Update existing education
        if (selectedEducation) {
          dataStore.updateEducation(selectedEducation.educationId, educationData)
          message.success('교육이 수정되었습니다.')
        }
      }

      // Reset form and go back to list
      form.resetFields()
      setLessonCount(1)
      setViewMode('list')
      setFormMode('create')
      setSelectedEducation(null)
    } catch (error) {
      console.error('Failed to save education:', error)
      message.error('교육 저장 중 오류가 발생했습니다.')
    }
  }

  const handleTempSave = () => {
    const values = form.getFieldsValue()
    try {
      // Generate education ID if creating new
      const educationId = formMode === 'create' 
        ? `EDU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
        : selectedEducation?.educationId || `EDU-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`

      // Format period
      const periodStart = values.periodStart ? dayjs(values.periodStart).format('YYYY-MM-DD') : undefined
      const periodEnd = values.periodEnd ? dayjs(values.periodEnd).format('YYYY-MM-DD') : undefined
      const period = periodStart && periodEnd ? `${periodStart} ~ ${periodEnd}` : periodStart || ''

      // Format lessons
      const lessons = values.lessons?.map((lesson: any, index: number) => ({
        title: `${index + 1}차시`,
        date: lesson.date ? dayjs(lesson.date).format('YYYY.MM.DD') : '',
        startTime: lesson.startTime ? dayjs(lesson.startTime).format('HH:mm') : '',
        endTime: lesson.endTime ? dayjs(lesson.endTime).format('HH:mm') : '',
        mainInstructors: 0,
        assistantInstructors: 0,
      })) || []

      const educationData: Education = {
        key: formMode === 'edit' && selectedEducation ? selectedEducation.key : educationId,
        status: values.status || '신청 중',
        educationId,
        name: values.name || '',
        institution: values.institution || '',
        region: values.region || '',
        gradeClass: values.grade ? `${values.grade}학년 ${values.class}반` : '',
        period,
        periodStart,
        periodEnd,
        requestOrg: values.requestOrg,
        schoolName: values.schoolName,
        programTitle: values.program,
        courseName: values.name,
        totalSessions: values.lessonCount || lessons.length,
        note: values.note,
        educationStatus: values.status === '신청 마감' ? '신청 마감' : (values.status === 'OPEN' ? 'OPEN' : '신청 중'),
        applicationDeadline: values.applicationDeadline ? dayjs(values.applicationDeadline).format('YYYY-MM-DD') : undefined,
        lessons,
      }

      if (formMode === 'create') {
        dataStore.addEducation(educationData)
        message.success('임시 저장되었습니다.')
      } else {
        if (selectedEducation) {
          dataStore.updateEducation(selectedEducation.educationId, educationData)
          message.success('임시 저장되었습니다.')
        }
      }
    } catch (error) {
      console.error('Failed to temp save education:', error)
      message.error('임시 저장 중 오류가 발생했습니다.')
    }
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

  const handleSearch = () => {
    // Search is handled by filteredData useMemo, but we can reset to first page
    setCurrentPage(1)
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

  // Get educations from dataStore and merge with dummyData
  const getAllEducations = useCallback((): EducationItem[] => {
    const storeEducations = dataStore.getEducations()
    // Convert Education to EducationItem format
    const convertedEducations: EducationItem[] = storeEducations.map(edu => ({
      key: edu.key,
      status: edu.status,
      educationId: edu.educationId,
      name: edu.name,
      institution: edu.institution,
      region: edu.region,
      gradeClass: edu.gradeClass,
      period: edu.period,
      periodStart: edu.periodStart,
      periodEnd: edu.periodEnd,
      requestOrg: edu.requestOrg,
      schoolName: edu.schoolName,
      programTitle: edu.programTitle,
      courseName: edu.courseName,
      totalSessions: edu.totalSessions,
      note: edu.note,
      lessons: edu.lessons?.map(lesson => ({
        title: lesson.title || '',
        date: lesson.date,
        startTime: lesson.startTime,
        endTime: lesson.endTime,
        mainInstructors: typeof lesson.mainInstructors === 'number' ? lesson.mainInstructors : (lesson.mainInstructors?.length || 0),
        assistantInstructors: typeof lesson.assistantInstructors === 'number' ? lesson.assistantInstructors : (lesson.assistantInstructors?.length || 0),
      })),
    }))
    
    // Merge with dummyData and remove duplicates by educationId
    const allData = [...dummyData, ...convertedEducations]
    const seen = new Set<string>()
    return allData.filter(item => {
      if (seen.has(item.educationId)) {
        return false
      }
      seen.add(item.educationId)
      return true
    })
  }, [])

  const filteredData = useMemo(() => {
    const allEducations = getAllEducations()
    return allEducations.filter((item) => {
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
  }, [searchText, statusFilter, dateRange, getAllEducations])

  const columns: ColumnsType<EducationItem> = useMemo(() => [
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const config = statusStyle[status] || { bg: 'bg-slate-100', text: 'text-slate-600' }
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
  ], [handleViewDetail])

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
      <div className="admin-page p-6">

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
                className="h-11 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                + 교육 등록
              </Button>
            </Space>
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={() => console.log('Export to Excel')}
              className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
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
              className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
            >
              임시저장
            </Button>
            <Button
              type="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={() => form.submit()}
              className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white"
                style={{
                  background: '#0f172a',
                  borderColor: 'transparent',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  color: '#ffffff',
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#1e293b'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#0f172a'
                  }}
            >
              저장
            </Button>
            <Button
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBackToList}
              className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
            >
              취소
            </Button>
          </Space>
        )}
      </div>

      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4">
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
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 transition hover:border-slate-300 focus:border-slate-300 focus:ring-2 focus:ring-slate-300"
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
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
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
              dataSource={filteredData}
              rowSelection={rowSelection}
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
        /* Detail View - Redesigned to match Create/Edit page */
        <div className="bg-slate-50 min-h-screen -mx-6 -mt-6 px-6 pt-0">
          {/* Sticky Header */}
          <DetailPageHeaderSticky
            onBack={handleBackToList}
            onEdit={() => {
              // Handle edit - navigate to edit mode
              console.log('Edit education:', selectedEducation)
            }}
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
        <div className="space-y-6">
          {/* Image Attachment and Tags Section - Moved to top */}
          <Card className="rounded-2xl shadow-sm border border-gray-200">
            <div className="space-y-6">
              {/* File Upload Section */}
              <div>
                <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">첨부 이미지</h3>
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
                <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">태그</h3>
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
                      background: 'linear-gradient(to right, #1E3A8A, #2563EB)',
                      borderColor: 'transparent',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #1E40AF, #3B82F6)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(to right, #1E3A8A, #2563EB)'
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
                          ? 'bg-blue-100 text-blue-700 font-medium'
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

                          <div className="grid grid-cols-2 gap-4">
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
                                popupClassName="tp-popup-primary-ok"
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
                                popupClassName="tp-popup-primary-ok"
                              />
                            </Form.Item>
                          </div>

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
      ) : null}
      </div>
    </ProtectedRoute>
  )
}
