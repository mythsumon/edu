'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Table, Button, Card, Select, Space, DatePicker, Badge, Modal, Collapse, Input, message, Tooltip, Tabs, AutoComplete } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, ArrowLeft, RotateCcw, RefreshCw, Copy, Trash2, UserPlus, CheckCircle2, Eye, Search, Filter, X } from 'lucide-react'
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
import { dataStore, type Instructor as InstructorType } from '@/lib/dataStore'
import { 
  validateInstructorAssignment,
  getDefaultMonthlyCapacity,
  getGlobalDailyLimit,
} from '@/entities/instructor/instructor-validation'

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
        mainInstructors: [
          { id: '9', name: '신청자1', status: 'pending' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: '10', name: '신청자2', status: 'pending' },
        ],
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
          { id: '11', name: '신청자3', status: 'pending' },
        ],
        mainInstructorRequired: 2,
        assistantInstructors: [
          { id: '12', name: '신청자4', status: 'pending' },
        ],
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

// Get instructor data with capacity settings (mock - TODO: get from API)
function getInstructorData(instructorId: string): InstructorType {
  const instructor = availableInstructors.find(inst => inst.id === instructorId)
  return {
    id: instructorId,
    name: instructor?.name || `강사-${instructorId}`,
    monthlyLeadMaxSessions: 20, // Default values - should come from instructor profile
    monthlyAssistantMaxSessions: 30,
    dailyEducationLimit: null, // Use global default
  }
}

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
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [assignmentTargetEducation, setAssignmentTargetEducation] = useState<EducationAssignmentItem | null>(null)
  const [assignmentModalMainInstructor, setAssignmentModalMainInstructor] = useState<{ [key: string]: string }>({})
  const [assignmentModalAssistantInstructor, setAssignmentModalAssistantInstructor] = useState<{ [key: string]: string }>({})

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

  // Final confirm handler for pending instructors
  const handleFinalConfirm = async (session: number, instructorId: string, type: 'main' | 'assistant') => {
    if (!selectedEducation) return

    const lesson = selectedEducation.lessons?.find((l) => l.session === session)
    if (!lesson) return

    // Check if main instructor already confirmed (only 1 main instructor allowed)
    if (type === 'main') {
      const hasConfirmedMain = lesson.mainInstructors.some(
        (inst) => inst.id !== instructorId && inst.status === 'confirmed'
      )
      if (hasConfirmedMain) {
        message.warning('이미 주강사가 확정되어 있습니다.')
        return
      }
    }

    Modal.confirm({
      title: '최종 확정',
      content: '이 강사를 최종 확정하시겠습니까?',
      onOk: async () => {
        try {
          // TODO: Replace with actual API call when available
          // await assignmentService.finalConfirm(selectedEducation.educationId, session, instructorId, type)

          // Update local state
          if (type === 'main') {
            const instructor = lesson.mainInstructors.find((inst) => inst.id === instructorId)
            if (instructor) {
              instructor.status = 'confirmed'
            }
          } else {
            const instructor = lesson.assistantInstructors.find((inst) => inst.id === instructorId)
            if (instructor) {
              instructor.status = 'confirmed'
            }
          }

          setSelectedEducation({ ...selectedEducation })

          // Sync to application page via dataStore
          dataStore.confirmInstructorInAssignment(selectedEducation.educationId, session, instructorId, type)

          message.success('강사가 최종 확정되었습니다.')
        } catch (error) {
          console.error('Failed to confirm instructor:', error)
          message.error('최종 확정 처리 중 오류가 발생했습니다.')
        }
      },
    })
  }

  // Delete handler for instructors (both confirmed and pending)
  const handleDeleteInstructorFromCard = async (session: number, instructorId: string, type: 'main' | 'assistant', education?: typeof selectedEducation) => {
    // Use provided education or fallback to selectedEducation
    const targetEducation = education || selectedEducation
    if (!targetEducation) return

    const lesson = targetEducation.lessons?.find((l) => l.session === session)
    if (!lesson) return

    const instructor = type === 'main'
      ? lesson.mainInstructors.find((inst) => inst.id === instructorId)
      : lesson.assistantInstructors.find((inst) => inst.id === instructorId)

    const isPending = instructor?.status === 'pending'

    Modal.confirm({
      title: '강사 삭제',
      content: isPending
        ? '이 강사 신청을 삭제하시겠습니까? 삭제된 신청은 거절 상태로 변경됩니다.'
        : '이 강사를 삭제하시겠습니까?',
      okText: '삭제',
      cancelText: '취소',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          // TODO: Replace with actual API call when available
          // await assignmentService.deleteInstructor(targetEducation.educationId, session, instructorId, type)

          // Update local state
          if (type === 'main') {
            lesson.mainInstructors = lesson.mainInstructors.filter((inst) => inst.id !== instructorId)
          } else {
            lesson.assistantInstructors = lesson.assistantInstructors.filter((inst) => inst.id !== instructorId)
          }

          // Update the correct education state
          if (education) {
            // Update assignmentTargetEducation if provided
            setAssignmentTargetEducation({ ...targetEducation })
          } else {
            // Update selectedEducation if used from detail view
            setSelectedEducation({ ...targetEducation })
          }

          // Sync to application page via dataStore
          dataStore.deleteInstructorFromAssignment(targetEducation.educationId, session, instructorId, type)

          message.success(isPending ? '강사 신청이 삭제되었습니다.' : '강사가 삭제되었습니다.')
        } catch (error) {
          console.error('Failed to delete instructor:', error)
          message.error('삭제 처리 중 오류가 발생했습니다.')
        }
      },
    })
  }

  const handleCopyEducationId = () => {
    if (selectedEducation) {
      navigator.clipboard.writeText(selectedEducation.educationId)
      // Could add toast notification here
    }
  }

  const handleOpenAssignmentModal = (record: EducationAssignmentItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    setAssignmentTargetEducation(record)
    setAssignmentModalOpen(true)
    // Initialize with existing assignments if any
    const mainInstructors: { [key: string]: string } = {}
    const assistantInstructors: { [key: string]: string } = {}
    if (record.lessons) {
      record.lessons.forEach((lesson) => {
        if (lesson.mainInstructors.length > 0) {
          mainInstructors[`${lesson.session}`] = lesson.mainInstructors[0].id
        }
        if (lesson.assistantInstructors.length > 0) {
          assistantInstructors[`${lesson.session}`] = lesson.assistantInstructors[0].id
        }
      })
    }
    setAssignmentModalMainInstructor(mainInstructors)
    setAssignmentModalAssistantInstructor(assistantInstructors)
  }

  const handleCloseAssignmentModal = () => {
    setAssignmentModalOpen(false)
    setAssignmentTargetEducation(null)
    setAssignmentModalMainInstructor({})
    setAssignmentModalAssistantInstructor({})
  }

  const handleConfirmAssignment = () => {
    if (!assignmentTargetEducation) return

    // Get education data
    const education = dataStore.getEducationById(assignmentTargetEducation.educationId)
    if (!education) {
      message.error('교육 정보를 찾을 수 없습니다.')
      return
    }

    // Validate all instructor assignments
    const validationErrors: string[] = []
    const monthlyCapacity = getDefaultMonthlyCapacity()
    const globalDailyLimit = getGlobalDailyLimit()

    // Validate main instructors
    Object.entries(assignmentModalMainInstructor).forEach(([session, instructorId]) => {
      if (!instructorId) return
      
      const instructor = getInstructorData(instructorId)
      const validation = validateInstructorAssignment(
        instructor,
        education,
        'main',
        {
          monthlyCapacity,
          dailyLimit: { globalDefault: globalDailyLimit },
        },
        education.educationId // Exclude current education from counts
      )

      if (!validation.valid) {
        validationErrors.push(`주강사 ${instructor.name}: ${validation.reason}`)
      }
    })

    // Validate assistant instructors
    Object.entries(assignmentModalAssistantInstructor).forEach(([session, instructorId]) => {
      if (!instructorId) return
      
      const instructor = getInstructorData(instructorId)
      const validation = validateInstructorAssignment(
        instructor,
        education,
        'assistant',
        {
          monthlyCapacity,
          dailyLimit: { globalDefault: globalDailyLimit },
        },
        education.educationId // Exclude current education from counts
      )

      if (!validation.valid) {
        validationErrors.push(`보조강사 ${instructor.name}: ${validation.reason}`)
      }
    })

    // If validation failed, show errors and stop
    if (validationErrors.length > 0) {
      Modal.error({
        title: '배정 검증 실패',
        content: (
          <div>
            <p>다음 강사들의 배정이 규칙에 위배됩니다:</p>
            <ul style={{ marginTop: 8, paddingLeft: 20 }}>
              {validationErrors.map((error, index) => (
                <li key={index} style={{ marginBottom: 4 }}>{error}</li>
              ))}
            </ul>
          </div>
        ),
        width: 600,
      })
      return
    }

    // TODO: Implement actual assignment API call
    console.log('Assigning instructors:', {
      educationId: assignmentTargetEducation.educationId,
      mainInstructors: assignmentModalMainInstructor,
      assistantInstructors: assignmentModalAssistantInstructor,
    })

    // Update local data
    const updatedData = dummyData.map((item) => {
      if (item.educationId === assignmentTargetEducation.educationId) {
        const updatedItem = { ...item }
        if (updatedItem.lessons) {
          updatedItem.lessons = updatedItem.lessons.map((lesson) => {
            const updatedLesson = { ...lesson }
            
            // Update main instructors
            const mainInstructorId = assignmentModalMainInstructor[`${lesson.session}`]
            if (mainInstructorId) {
              const instructor = availableInstructors.find((inst) => inst.id === mainInstructorId && inst.type === 'main')
              if (instructor && !updatedLesson.mainInstructors.some((inst) => inst.id === instructor.id)) {
                updatedLesson.mainInstructors = [
                  ...updatedLesson.mainInstructors,
                  { id: instructor.id, name: instructor.name, status: 'confirmed' as const },
                ]
              }
            }

            // Update assistant instructors
            const assistantInstructorId = assignmentModalAssistantInstructor[`${lesson.session}`]
            if (assistantInstructorId) {
              const instructor = availableInstructors.find((inst) => inst.id === assistantInstructorId && inst.type === 'assistant')
              if (instructor && !updatedLesson.assistantInstructors.some((inst) => inst.id === instructor.id)) {
                updatedLesson.assistantInstructors = [
                  ...updatedLesson.assistantInstructors,
                  { id: instructor.id, name: instructor.name, status: 'confirmed' as const },
                ]
              }
            }

            return updatedLesson
          })
          
          // Update counts
          updatedItem.mainInstructorCount = updatedItem.lessons.reduce((sum, lesson) => sum + lesson.mainInstructors.length, 0)
          updatedItem.assistantInstructorCount = updatedItem.lessons.reduce((sum, lesson) => sum + lesson.assistantInstructors.length, 0)
        }
        return updatedItem
      }
      return item
    })

    message.success('강사 배정이 완료되었습니다.')
    handleCloseAssignmentModal()
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, regionFilter, gradeClassFilter, assignmentStatusFilter, dateRange])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

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
        title: '배정',
        key: 'assignment',
        width: 90,
        fixed: 'right' as const,
        render: (_, record) => (
          <Button
            size="small"
            icon={<UserPlus className="w-3 h-3" />}
            onClick={(e) => {
              e.stopPropagation()
              handleOpenAssignmentModal(record, e)
            }}
            className="h-8 px-3 rounded-xl border border-green-200 bg-green-50 hover:bg-green-600 hover:text-white text-green-700 transition-colors"
          >
            배정
          </Button>
        ),
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
                                    {/* Sort: confirmed first, then pending */}
                                    {[...lesson.mainInstructors]
                                      .sort((a, b) => {
                                        if (a.status === 'confirmed' && b.status === 'pending') return -1
                                        if (a.status === 'pending' && b.status === 'confirmed') return 1
                                        return 0
                                      })
                                      .map((instructor) => {
                                        const hasConfirmedMain = lesson.mainInstructors.some(
                                          (inst) => inst.id !== instructor.id && inst.status === 'confirmed'
                                        )
                                        const canConfirm = instructor.status === 'pending' && !hasConfirmedMain

                                        return (
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
                                                    {instructor.status === 'confirmed' ? '확정됨' : '대기'}
                                                  </span>
                                                }
                                              />
                                              {instructor.status === 'pending' ? (
                                                <>
                                                  <Tooltip title={hasConfirmedMain ? '이미 주강사가 확정되어 있습니다.' : ''}>
                                                    <Button
                                                      type="primary"
                                                      size="small"
                                                      icon={<CheckCircle2 className="w-3 h-3" />}
                                                      onClick={(e) => {
                                                        e.stopPropagation()
                                                        if (canConfirm) {
                                                          handleFinalConfirm(lesson.session, instructor.id, 'main')
                                                        }
                                                      }}
                                                      disabled={!canConfirm}
                                                      className="h-7 px-3 bg-green-600 hover:bg-green-500 hover:brightness-110 hover:ring-2 hover:ring-green-400/40 active:bg-green-600 border-0 text-white text-xs disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-600 disabled:hover:brightness-100 disabled:hover:ring-0"
                                                    >
                                                      최종확정
                                                    </Button>
                                                  </Tooltip>
                                                  <Button
                                                    type="text"
                                                    danger
                                                    size="small"
                                                    icon={<Trash2 className="w-3 h-3" />}
                                                    onClick={(e) => {
                                                      e.stopPropagation()
                                                      handleDeleteInstructorFromCard(lesson.session, instructor.id, 'main')
                                                    }}
                                                    className="h-7 w-7 p-0 hover:bg-red-50"
                                                  />
                                                </>
                                              ) : (
                                                <Button
                                                  type="text"
                                                  danger
                                                  size="small"
                                                  icon={<Trash2 className="w-3 h-3" />}
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteInstructorFromCard(lesson.session, instructor.id, 'main')
                                                  }}
                                                  className="h-7 w-7 p-0 hover:bg-red-50"
                                                />
                                              )}
                                            </div>
                                          </div>
                                        )
                                      })}
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
                                    {/* Sort: confirmed first, then pending */}
                                    {[...lesson.assistantInstructors]
                                      .sort((a, b) => {
                                        if (a.status === 'confirmed' && b.status === 'pending') return -1
                                        if (a.status === 'pending' && b.status === 'confirmed') return 1
                                        return 0
                                      })
                                      .map((instructor) => (
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
                                                  {instructor.status === 'confirmed' ? '확정됨' : '대기'}
                                                </span>
                                              }
                                            />
                                            {instructor.status === 'pending' ? (
                                              <>
                                                <Button
                                                  type="primary"
                                                  size="small"
                                                  icon={<CheckCircle2 className="w-3 h-3" />}
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleFinalConfirm(lesson.session, instructor.id, 'assistant')
                                                  }}
                                                  className="h-7 px-3 bg-green-600 hover:bg-green-500 hover:brightness-110 hover:ring-2 hover:ring-green-400/40 active:bg-green-600 border-0 text-white text-xs"
                                                >
                                                  최종확정
                                                </Button>
                                                <Button
                                                  type="text"
                                                  danger
                                                  size="small"
                                                  icon={<Trash2 className="w-3 h-3" />}
                                                  onClick={(e) => {
                                                    e.stopPropagation()
                                                    handleDeleteInstructorFromCard(lesson.session, instructor.id, 'assistant')
                                                  }}
                                                  className="h-7 w-7 p-0 hover:bg-red-50"
                                                />
                                              </>
                                            ) : (
                                              <Button
                                                type="text"
                                                danger
                                                size="small"
                                                icon={<Trash2 className="w-3 h-3" />}
                                                onClick={(e) => {
                                                  e.stopPropagation()
                                                  handleDeleteInstructorFromCard(lesson.session, instructor.id, 'assistant')
                                                }}
                                                className="h-7 w-7 p-0 hover:bg-red-50"
                                              />
                                            )}
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

        {/* Assignment Modal */}
        <Modal
          open={assignmentModalOpen}
          onCancel={handleCloseAssignmentModal}
          footer={null}
          width={1000}
          closable={false}
          className="[&_.ant-modal-content]:!p-0 [&_.ant-modal-body]:!p-0"
        >
          <div className="bg-white rounded-xl">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">강사 배정</h3>
                  {assignmentTargetEducation && (
                    <p className="text-sm text-gray-600 mt-1">
                      교육에 강사를 배정합니다
                    </p>
                  )}
                </div>
                <button
                  onClick={handleCloseAssignmentModal}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              {/* Education Info Card */}
              {assignmentTargetEducation && (
                <Card className="bg-blue-50 border-blue-200 rounded-lg">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">교육ID</p>
                      <p className="text-sm font-semibold text-gray-900">{assignmentTargetEducation.educationId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">교육명</p>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{assignmentTargetEducation.educationName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">교육기관</p>
                      <p className="text-sm font-semibold text-gray-900">{assignmentTargetEducation.institution}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">교육기간</p>
                      <p className="text-sm font-semibold text-gray-900">{assignmentTargetEducation.period}</p>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Content */}
            {assignmentTargetEducation && (
              <div className="px-6 py-6">
                {assignmentTargetEducation.lessons && assignmentTargetEducation.lessons.length > 0 ? (
                  <Tabs
                    defaultActiveKey="1"
                    items={assignmentTargetEducation.lessons.map((lesson) => ({
                      key: `${lesson.session}`,
                      label: (
                        <span className="px-3 py-1">
                          {lesson.session}차 수업
                          <span className="ml-2 text-xs text-gray-500">
                            {lesson.date} {lesson.startTime}~{lesson.endTime}
                          </span>
                        </span>
                      ),
                      children: (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                          {/* Main Instructor */}
                          <Card className="rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-base font-semibold text-gray-900">주강사</h4>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                lesson.mainInstructors.length >= lesson.mainInstructorRequired
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {lesson.mainInstructors.length}/{lesson.mainInstructorRequired}
                              </span>
                            </div>
                            <AutoComplete
                              value={assignmentModalMainInstructor[`${lesson.session}`] ? availableInstructors.find(inst => inst.id === assignmentModalMainInstructor[`${lesson.session}`] && inst.type === 'main')?.name : undefined}
                              onChange={(value) => {
                                const selectedInstructor = availableInstructors.find(inst => inst.name === value && inst.type === 'main')
                                if (selectedInstructor) {
                                  setAssignmentModalMainInstructor({
                                    ...assignmentModalMainInstructor,
                                    [`${lesson.session}`]: selectedInstructor.id,
                                  })
                                } else {
                                  setAssignmentModalMainInstructor({
                                    ...assignmentModalMainInstructor,
                                    [`${lesson.session}`]: '',
                                  })
                                }
                              }}
                              onSelect={(value) => {
                                const selectedInstructor = availableInstructors.find(inst => inst.name === value && inst.type === 'main')
                                if (selectedInstructor) {
                                  setAssignmentModalMainInstructor({
                                    ...assignmentModalMainInstructor,
                                    [`${lesson.session}`]: selectedInstructor.id,
                                  })
                                }
                              }}
                              options={availableInstructors
                                .filter((inst) => inst.type === 'main')
                                .map((inst) => ({
                                  value: inst.name,
                                  label: inst.name,
                                }))}
                              className="w-full mb-3 [&_.ant-input]:!h-11 [&_.ant-input]:!rounded-lg [&_.ant-input]:!pl-10"
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              allowClear
                            >
                              <Input
                                prefix={<Search className="w-4 h-4 text-gray-400" />}
                                placeholder="주강사 선택"
                              />
                            </AutoComplete>
                            {lesson.mainInstructors.length > 0 && (
                              <div className="space-y-2">
                                {lesson.mainInstructors.map((instructor) => (
                                  <div
                                    key={instructor.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                                        {instructor.name.charAt(0)}
                                      </div>
                                      <span className="text-sm font-medium text-gray-900">{instructor.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        status={instructor.status === 'confirmed' ? 'success' : 'default'}
                                        text={<span className="text-xs">{instructor.status === 'confirmed' ? '확정됨' : '대기'}</span>}
                                      />
                                      <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<X className="w-4 h-4" />}
                                        onClick={() => {
                                          if (assignmentTargetEducation) {
                                            handleDeleteInstructorFromCard(lesson.session || 1, instructor.id, 'main', assignmentTargetEducation)
                                          }
                                        }}
                                        className="h-8 w-8 p-0 flex items-center justify-center hover:bg-red-50"
                                        title="강사 삭제"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Card>

                          {/* Assistant Instructor */}
                          <Card className="rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center justify-between mb-4">
                              <h4 className="text-base font-semibold text-gray-900">보조강사</h4>
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                lesson.assistantInstructors.length >= lesson.assistantInstructorRequired
                                  ? 'bg-green-50 text-green-700 border border-green-200'
                                  : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {lesson.assistantInstructors.length}/{lesson.assistantInstructorRequired}
                              </span>
                            </div>
                            <AutoComplete
                              value={assignmentModalAssistantInstructor[`${lesson.session}`] ? availableInstructors.find(inst => inst.id === assignmentModalAssistantInstructor[`${lesson.session}`] && inst.type === 'assistant')?.name : undefined}
                              onChange={(value) => {
                                const selectedInstructor = availableInstructors.find(inst => inst.name === value && inst.type === 'assistant')
                                if (selectedInstructor) {
                                  setAssignmentModalAssistantInstructor({
                                    ...assignmentModalAssistantInstructor,
                                    [`${lesson.session}`]: selectedInstructor.id,
                                  })
                                } else {
                                  setAssignmentModalAssistantInstructor({
                                    ...assignmentModalAssistantInstructor,
                                    [`${lesson.session}`]: '',
                                  })
                                }
                              }}
                              onSelect={(value) => {
                                const selectedInstructor = availableInstructors.find(inst => inst.name === value && inst.type === 'assistant')
                                if (selectedInstructor) {
                                  setAssignmentModalAssistantInstructor({
                                    ...assignmentModalAssistantInstructor,
                                    [`${lesson.session}`]: selectedInstructor.id,
                                  })
                                }
                              }}
                              options={availableInstructors
                                .filter((inst) => inst.type === 'assistant')
                                .map((inst) => ({
                                  value: inst.name,
                                  label: inst.name,
                                }))}
                              className="w-full mb-3 [&_.ant-input]:!h-11 [&_.ant-input]:!rounded-lg [&_.ant-input]:!pl-10"
                              filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                              allowClear
                            >
                              <Input
                                prefix={<Search className="w-4 h-4 text-gray-400" />}
                                placeholder="보조강사 선택"
                              />
                            </AutoComplete>
                            {lesson.assistantInstructors.length > 0 && (
                              <div className="space-y-2">
                                {lesson.assistantInstructors.map((instructor) => (
                                  <div
                                    key={instructor.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-sm font-semibold text-purple-700">
                                        {instructor.name.charAt(0)}
                                      </div>
                                      <span className="text-sm font-medium text-gray-900">{instructor.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Badge
                                        status={instructor.status === 'confirmed' ? 'success' : 'default'}
                                        text={<span className="text-xs">{instructor.status === 'confirmed' ? '확정됨' : '대기'}</span>}
                                      />
                                      <Button
                                        type="text"
                                        danger
                                        size="small"
                                        icon={<X className="w-4 h-4" />}
                                        onClick={() => {
                                          if (assignmentTargetEducation) {
                                            handleDeleteInstructorFromCard(lesson.session || 1, instructor.id, 'assistant', assignmentTargetEducation)
                                          }
                                        }}
                                        className="h-8 w-8 p-0 flex items-center justify-center hover:bg-red-50"
                                        title="강사 삭제"
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Card>
                        </div>
                      ),
                    }))}
                    className="[&_.ant-tabs-tab]:px-4 [&_.ant-tabs-tab]:py-2 [&_.ant-tabs-tab]:rounded-lg [&_.ant-tabs-tab-active]:bg-blue-50 [&_.ant-tabs-tab-active]:border-blue-200"
                  />
                ) : (
                  <div className="py-8">
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                        <UserPlus className="w-8 h-8 text-gray-400" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">수업 정보가 없습니다</h4>
                      <p className="text-sm text-gray-600">
                        이 교육에는 아직 수업 정보가 등록되지 않았습니다.
                      </p>
                    </div>
                    <div className="max-w-2xl mx-auto">
                      <Card className="bg-blue-50 border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-gray-700">
                          수업 정보를 먼저 등록한 후 강사를 배정할 수 있습니다. 교육 상세 페이지에서 수업 정보를 추가해주세요.
                        </p>
                      </Card>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
                  <Button
                    onClick={handleCloseAssignmentModal}
                    className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all text-gray-700"
                  >
                    취소
                  </Button>
                  <Button
                    type="primary"
                    onClick={handleConfirmAssignment}
                    disabled={!assignmentTargetEducation?.lessons || assignmentTargetEducation.lessons.length === 0}
                    className="h-11 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border-0 font-medium transition-all text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    배정하기
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}
