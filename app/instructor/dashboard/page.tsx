'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Modal, Button, Badge } from 'antd'
import { DocumentStatusIndicator } from '@/components/shared/common'
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Play, 
  Award,
  Plus,
  User,
  ArrowUp,
  MapPin,
  School,
  TrendingUp,
  Sparkles,
  BarChart3,
  Zap
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { InstructorCourse, instructorCourses, instructorCalendarEvents, InstructorCalendarEvent } from '@/mock/instructorDashboardData'
import { getAttendanceDocByEducationId } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { getActivityLogByEducationId } from '@/app/instructor/activity-logs/storage'
import { getDocByEducationId as getEquipmentDocByEducationId } from '@/app/instructor/equipment-confirmations/storage'
import { dataStore } from '@/lib/dataStore'
import dayjs from 'dayjs'

// Modern Status Badge Component
const StatusBadge = ({ status }: { status: '예정' | '진행중' | '완료' }) => {
  const statusConfig = {
    '예정': { 
      bg: 'bg-gradient-to-r from-blue-500 to-blue-600', 
      text: 'text-white',
      glow: 'shadow-blue-500/50'
    },
    '진행중': { 
      bg: 'bg-gradient-to-r from-emerald-500 to-green-600', 
      text: 'text-white',
      glow: 'shadow-green-500/50'
    },
    '완료': { 
      bg: 'bg-gradient-to-r from-slate-400 to-slate-500', 
      text: 'text-white',
      glow: 'shadow-slate-400/50'
    }
  }

  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} shadow-lg ${config.glow}`}>
      {status}
    </span>
  )
}

// Modern KPI Card Component
const ModernKPICard = ({ 
  icon, 
  title, 
  count, 
  trend,
  gradient,
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode;
  title: string;
  count: number;
  trend?: string;
  gradient: string;
  isActive: boolean;
  onClick: () => void;
}) => (
  <Card 
    className={`rounded-2xl border-0 transition-all duration-300 cursor-pointer overflow-hidden group ${
      isActive 
        ? 'shadow-2xl scale-105' 
        : 'shadow-lg hover:shadow-2xl hover:scale-[1.02]'
    } dark:bg-gray-800 dark:border-gray-700`}
    onClick={onClick}
    style={{
      background: isActive 
        ? `linear-gradient(135deg, ${gradient})`
        : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)'
    }}
  >
    <div className="relative">
      <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 ${gradient.includes('blue') ? 'bg-blue-400' : gradient.includes('emerald') ? 'bg-emerald-400' : gradient.includes('purple') ? 'bg-purple-400' : 'bg-amber-400'}`}></div>
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg ${
            isActive 
              ? 'bg-white/20 backdrop-blur-sm' 
              : 'bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600'
          }`}>
            <div className={isActive ? 'text-white' : 'text-slate-700 dark:text-gray-300'}>
              {icon}
            </div>
          </div>
          <div>
            <p className={`text-sm font-medium mb-1 ${isActive ? 'text-white/90' : 'text-slate-600 dark:text-gray-400'}`}>
              {title}
            </p>
            <p className={`text-3xl font-bold ${isActive ? 'text-white' : 'text-slate-900 dark:text-gray-100'}`}>
              {count}
            </p>
            {trend && (
              <p className={`text-xs mt-1 ${isActive ? 'text-white/80' : 'text-slate-500 dark:text-gray-500'}`}>
                {trend}
              </p>
            )}
          </div>
        </div>
        {isActive && (
          <div className="animate-pulse">
            <Sparkles className="w-6 h-6 text-white/80" />
          </div>
        )}
      </div>
    </div>
  </Card>
)

// Modern Course Card Component
const ModernCourseCard = ({ course }: { course: InstructorCourse }) => {
  const router = useRouter()
  
  // Get document submission statuses
  const attendanceDoc = getAttendanceDocByEducationId(course.id)
  const activityLog = getActivityLogByEducationId(course.id)
  const equipmentDoc = getEquipmentDocByEducationId(course.id)
  
  const attendanceStatus = attendanceDoc?.status || 'DRAFT'
  const activityStatus = activityLog?.status || 'DRAFT'
  const equipmentStatus = equipmentDoc?.status || 'DRAFT'
  
  const statusColors = {
    '예정': 'from-blue-500 to-blue-600',
    '진행중': 'from-emerald-500 to-green-600',
    '완료': 'from-slate-400 to-slate-500'
  }
  
  const handleAttendanceClick = () => {
    // 교육 출석부 상세보기를 누르면 강사의 activity-logs logId page로 이동
    const activityLog = getActivityLogByEducationId(course.id)
    if (activityLog?.id) {
      router.push(`/instructor/activity-logs/${activityLog.id}`)
    } else {
      // activity log가 없으면 educationId를 사용하여 새로 생성하거나 찾기
      router.push(`/instructor/activity-logs/${course.id}`)
    }
  }
  
  const handleActivityClick = () => {
    if (activityLog?.id) {
      router.push(`/instructor/activity-logs/${activityLog.id}`)
    } else {
      const existingLog = getActivityLogByEducationId(course.id)
      if (existingLog && existingLog.id) {
        router.push(`/instructor/activity-logs/${existingLog.id}`)
      } else {
        router.push(`/instructor/activity-logs/new?educationId=${course.id}`)
      }
    }
  }
  
  const handleEquipmentClick = () => {
    if (equipmentDoc?.id) {
      router.push(`/instructor/equipment-confirmations/${equipmentDoc.id}`)
    } else {
      const { getDocByEducationId, createDocFromDefault, upsertDoc } = require('@/app/instructor/equipment-confirmations/storage')
      const existingDoc = getDocByEducationId(course.id)
      if (existingDoc) {
        router.push(`/instructor/equipment-confirmations/${existingDoc.id}`)
      } else {
        const newDoc = createDocFromDefault({ educationId: course.id })
        upsertDoc(newDoc)
        router.push(`/instructor/equipment-confirmations/${newDoc.id}`)
      }
    }
  }
  
  return (
    <Card 
      className="rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group overflow-hidden dark:bg-gray-800 dark:border-gray-700"
      onClick={() => router.push(`/instructor/assignment/${course.id}`)}
    >
      <div className="relative">
        <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${statusColors[course.status]}`}></div>
        <div className="pt-4 space-y-4">
          <div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-gray-100 line-clamp-2 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {course.educationName}
            </h3>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-gray-400">
              <School className="w-4 h-4" />
              <span>{course.institutionName}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-600 rounded-xl">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
                {course.startDate} ~ {course.endDate}
              </span>
            </div>
          </div>
          
          {/* Document Submission Status */}
          <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-gray-700">
            <div className="text-xs font-semibold text-slate-500 dark:text-gray-400 mb-1">문서 제출 상태</div>
            <div className="flex flex-col gap-2">
              <DocumentStatusIndicator
                status={attendanceStatus as any}
                count={attendanceDoc ? 1 : 0}
                label="출석부"
                onClick={handleAttendanceClick}
                educationId={course.id}
                documentId={attendanceDoc?.id}
              />
              <DocumentStatusIndicator
                status={activityStatus as any}
                count={activityLog ? 1 : 0}
                label="활동일지"
                onClick={handleActivityClick}
                educationId={course.id}
                documentId={activityLog?.id}
              />
              <DocumentStatusIndicator
                status={equipmentStatus as any}
                count={equipmentDoc ? 1 : 0}
                label="교구확인서"
                onClick={handleEquipmentClick}
                educationId={course.id}
                documentId={equipmentDoc?.id}
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <StatusBadge status={course.status} />
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <User className="w-3 h-3" />
                <span>{course.classInfo}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{course.timeRange}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

// Weekly calendar view component
const WeeklyCalendarView = ({ 
  currentDate, 
  onDateClick 
}: { 
  currentDate: Date
  onDateClick?: (dateString: string) => void
}) => {
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  const getEventsForDate = (date: Date) => {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return instructorCalendarEvents.filter(event => event.date === dateString)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-7 gap-3">
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString()
          const events = getEventsForDate(day)
          const isWeekend = index === 0 || index === 6
          const dateString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
          
          return (
            <div 
              key={index}
              onClick={() => {
                if (onDateClick) {
                  onDateClick(dateString)
                }
              }}
              className={`rounded-2xl border-2 transition-all duration-300 cursor-pointer overflow-hidden ${
                isToday 
                  ? 'border-blue-400 bg-gradient-to-br from-blue-50 via-blue-100/50 to-white dark:from-blue-900/30 dark:via-blue-800/20 dark:to-gray-800 shadow-xl ring-4 ring-blue-200/50 dark:ring-blue-700/30 scale-105' 
                  : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-slate-300 dark:hover:border-gray-600 hover:shadow-lg'
              }`}
            >
              <div className={`py-4 text-center border-b-2 ${
                isToday 
                  ? 'border-blue-300 dark:border-blue-600 bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                  : isWeekend
                    ? 'border-slate-200 dark:border-gray-700 bg-gradient-to-r from-slate-100 to-slate-50 dark:from-gray-700 dark:to-gray-600'
                    : 'border-slate-200 dark:border-gray-700 bg-gradient-to-r from-slate-50 to-white dark:from-gray-700 dark:to-gray-800'
              }`}>
                <div className={`text-xs font-bold mb-1 ${
                  isToday ? 'text-white' : isWeekend ? 'text-slate-500 dark:text-gray-400' : 'text-slate-700 dark:text-gray-300'
                }`}>
                  {['일', '월', '화', '수', '목', '금', '토'][day.getDay()]}
                </div>
                <div className={`text-2xl font-bold ${
                  isToday 
                    ? 'text-white' 
                    : isWeekend 
                      ? 'text-slate-600 dark:text-gray-400' 
                      : 'text-slate-800 dark:text-gray-200'
                }`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="min-h-[220px] p-3 space-y-2">
                {events.length > 0 ? (
                  events.map((event, eventIndex) => {
                    const eventDateString = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
                    return (
                      <div 
                        key={eventIndex}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (onDateClick) {
                            onDateClick(eventDateString)
                          }
                        }}
                        className={`text-xs px-3 py-2.5 rounded-xl font-semibold border-2 transition-all hover:shadow-md cursor-pointer ${
                          event.status === '예정'
                            ? 'bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700 hover:from-blue-100 hover:to-blue-200'
                            : event.status === '진행중'
                              ? 'bg-gradient-to-r from-emerald-50 to-green-100 dark:from-emerald-900/30 dark:to-green-800/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 hover:from-emerald-100 hover:to-green-200'
                              : 'bg-gradient-to-r from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-600 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-gray-600'
                        }`}
                      >
                        <div className="font-bold truncate mb-1">{event.title}</div>
                        {event.timeRange && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 opacity-70" />
                            <span className="text-[10px] opacity-75">{event.timeRange}</span>
                          </div>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-12">
                    <div className="text-slate-300 dark:text-gray-600 text-xs">일정 없음</div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Daily calendar view component
const DailyCalendarView = ({ 
  currentDate,
  onDateClick
}: { 
  currentDate: Date
  onDateClick?: (dateString: string) => void
}) => {
  const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
  const events = instructorCalendarEvents.filter(event => event.date === dateString)
  
  const dayOfWeek = currentDate.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  return (
    <div className="space-y-6">
      <div className={`text-center py-8 rounded-2xl border-2 ${
        isWeekend 
          ? 'border-blue-300 dark:border-blue-600 bg-gradient-to-br from-blue-50 via-blue-100/50 to-white dark:from-blue-900/30 dark:via-blue-800/20 dark:to-gray-800' 
          : 'border-slate-200 dark:border-gray-700 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800'
      }`}>
        <div className="text-5xl font-bold text-slate-900 dark:text-gray-100 mb-3">
          {currentDate.getDate()}
        </div>
        <div className="text-xl font-semibold text-slate-700 dark:text-gray-300 mb-2">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </div>
        <div className={`inline-flex items-center px-5 py-2 rounded-full text-sm font-bold ${
          isWeekend ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : 'bg-gradient-to-r from-slate-200 to-slate-300 dark:from-gray-600 dark:to-gray-700 text-slate-700 dark:text-gray-300'
        }`}>
          {['일', '월', '화', '수', '목', '금', '토'][dayOfWeek]}요일
        </div>
      </div>
      
      {events.length > 0 ? (
        <div className="space-y-4">
          {events.map((event, index) => (
            <div 
              key={index}
              onClick={() => {
                if (onDateClick) {
                  onDateClick(dateString)
                }
              }}
              className={`p-6 rounded-2xl border-2 transition-all hover:shadow-2xl cursor-pointer ${
                event.status === '예정'
                  ? 'border-blue-300 dark:border-blue-600 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-900/30 dark:via-gray-800 dark:to-blue-800/20 hover:border-blue-400'
                  : event.status === '진행중'
                    ? 'border-emerald-300 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-900/30 dark:via-gray-800 dark:to-emerald-800/20 hover:border-emerald-400'
                    : 'border-slate-200 dark:border-gray-700 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h4 className="text-xl font-bold text-slate-900 dark:text-gray-100 mb-2">{event.title}</h4>
                  {event.timeRange && (
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-base font-bold text-slate-700 dark:text-gray-300">{event.timeRange}</span>
                    </div>
                  )}
                  <StatusBadge status={event.status} />
                </div>
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                  event.status === '예정'
                    ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                    : event.status === '진행중'
                      ? 'bg-gradient-to-br from-emerald-500 to-green-600'
                      : 'bg-gradient-to-br from-slate-400 to-slate-500'
                }`}>
                  <Calendar className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 rounded-2xl border-2 border-dashed border-slate-300 dark:border-gray-600 bg-gradient-to-br from-slate-50 to-white dark:from-gray-800 dark:to-gray-700">
          <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg">
            <Calendar className="w-10 h-10 text-slate-400 dark:text-gray-500" />
          </div>
          <p className="text-slate-500 dark:text-gray-400 font-semibold text-lg">이 날짜에는 일정이 없습니다</p>
        </div>
      )}
    </div>
  )
}

export default function InstructorDashboard() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<'all' | 'scheduled' | 'ongoing' | 'completed' | 'applicable'>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 2))
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly' | 'daily'>('monthly')
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 2, 15))
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)
  
  // Collapse state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('dispatchListCollapsed')
      return saved === 'true'
    }
    return false
  })
  
  const listContainerRef = useRef<HTMLDivElement>(null)
  const [maxHeight, setMaxHeight] = useState<string>('none')
  
  // Get open educations (applicable educations) - same logic as /instructor/apply/open
  const openEducations = useMemo(() => {
    const now = dayjs()
    return dataStore.getEducations().filter(education => {
      // Status must be OPEN or 신청 중 (모집중)
      if (education.educationStatus !== 'OPEN' && education.educationStatus !== '신청 중') {
        return false
      }
      
      // Check if deadline passed - only show if deadline hasn't passed
      if (education.applicationDeadline) {
        const deadline = dayjs(education.applicationDeadline)
        if (now.isAfter(deadline, 'day')) {
          return false // 마감일이 지난 것은 제외
        }
      }
      
      return true
    })
  }, [])
  
  const filteredCourses = instructorCourses.filter(course => {
    if (course.educationStatus && 
        course.educationStatus !== 'OPEN' && 
        course.educationStatus !== '신청 중') {
      return false
    }
    
    if (activeFilter === 'all') return true
    if (activeFilter === 'scheduled') return course.status === '예정'
    if (activeFilter === 'ongoing') return course.status === '진행중'
    if (activeFilter === 'completed') return course.status === '완료'
    if (activeFilter === 'applicable') return false // Don't show courses when showing applicable educations
    return true
  })

  const scheduledCount = instructorCourses.filter(c => c.status === '예정').length
  const ongoingCount = instructorCourses.filter(c => c.status === '진행중').length
  const completedCount = instructorCourses.filter(c => c.status === '완료').length

  // Measure content height and set max-height for animation
  useEffect(() => {
    if (listContainerRef.current) {
      if (isCollapsed) {
        setMaxHeight('0px')
      } else {
        // Use setTimeout to ensure DOM is fully rendered
        setTimeout(() => {
          if (listContainerRef.current) {
            const height = listContainerRef.current.scrollHeight
            setMaxHeight(`${height}px`)
          }
        }, 0)
      }
    }
  }, [isCollapsed, activeFilter, filteredCourses.length])
  
  // Initial height measurement
  useEffect(() => {
    if (listContainerRef.current && !isCollapsed && maxHeight === 'none') {
      setTimeout(() => {
        if (listContainerRef.current) {
          const height = listContainerRef.current.scrollHeight
          setMaxHeight(`${height}px`)
        }
      }, 100)
    }
  }, [isCollapsed, maxHeight])
  
  // Save collapse state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('dispatchListCollapsed', String(isCollapsed))
    }
  }, [isCollapsed])
  
  // Toggle collapse function
  const toggleCollapse = () => {
    setIsCollapsed(prev => !prev)
  }
  
  // Handle KPI card click - toggle collapse and set filter
  const handleKPICardClick = (filter?: 'all' | 'scheduled' | 'ongoing' | 'completed' | 'applicable', route?: string) => {
    if (route) {
      // For "신청 가능" button, show applicable educations in the expandable section
      if (route === '/instructor/application') {
        setActiveFilter('applicable')
        if (isCollapsed) {
          setIsCollapsed(false)
        }
        return
      }
      router.push(route)
      return
    }
    if (filter !== undefined) {
      setActiveFilter(filter)
    }
    if (isCollapsed) {
      setIsCollapsed(false)
    }
  }

  const goToPreviousPeriod = () => {
    if (calendarView === 'monthly') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
    } else if (calendarView === 'weekly') {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 7))
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() - 1))
    }
  }

  const goToNextPeriod = () => {
    if (calendarView === 'monthly') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
    } else if (calendarView === 'weekly') {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 7))
    } else {
      setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate() + 1))
    }
  }

  const goToToday = () => {
    const today = new Date()
    if (calendarView === 'monthly') {
      setCurrentMonth(new Date(today.getFullYear(), today.getMonth()))
    } else {
      setSelectedDate(today)
    }
  }

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const prevMonthDays = firstDay.getDay()
    const nextMonthDays = 6 - lastDay.getDay()
    
    const days = []
    
    for (let i = prevMonthDays; i > 0; i--) {
      const date = new Date(year, month, -i + 1)
      days.push({
        date: date.getDate(),
        isCurrentMonth: false,
        dateString: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        date: i,
        isCurrentMonth: true,
        dateString
      })
    }
    
    for (let i = 1; i <= nextMonthDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date: date.getDate(),
        isCurrentMonth: false,
        dateString: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })
    }
    
    return days
  }

  const calendarDays = getCalendarDays()

  const hasEventOnDate = (dateString: string) => {
    return instructorCalendarEvents.some(event => event.date === dateString)
  }

  const getEventsForDate = (dateString: string) => {
    return instructorCalendarEvents.filter(event => event.date === dateString)
  }

  const formatMonthName = (date: Date) => {
    const months = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ]
    return `${date.getFullYear()}년 ${months[date.getMonth()]}`
  }

  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}, ${date.getFullYear()}`
  }

  const formatDailyDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Modern Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-slate-900 dark:text-gray-100">
                      홍길동 강사님 안녕하세요!
                    </p>
                    <p className="text-sm text-slate-600 dark:text-gray-400">
                      오늘도 좋은 수업 부탁드립니다.
                    </p>
                  </div>
                </div>
              </div>
              <Button
                type="primary"
                icon={<BarChart3 className="w-4 h-4" />}
                className="h-12 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-lg"
                onClick={() => router.push('/instructor/application')}
              >
                신청하기
              </Button>
            </div>
          </div>

          {/* Modern KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <ModernKPICard 
              icon={<Play className="w-6 h-6" />}
              title="내 출강 리스트"
              count={instructorCourses.length}
              trend="전체 교육"
              gradient="#3b82f6, #2563eb"
              isActive={activeFilter === 'all'}
              onClick={() => handleKPICardClick('all')}
            />
            
            <ModernKPICard 
              icon={<Clock className="w-6 h-6" />}
              title="오픈 예정"
              count={scheduledCount}
              trend="곧 시작"
              gradient="#f59e0b, #d97706"
              isActive={activeFilter === 'scheduled'}
              onClick={() => handleKPICardClick('scheduled')}
            />
            
            <ModernKPICard 
              icon={<Zap className="w-6 h-6" />}
              title="신청 가능"
              count={openEducations.length}
              trend="새로운 기회"
              gradient="#a855f7, #9333ea"
              isActive={activeFilter === 'applicable'}
              onClick={() => handleKPICardClick(undefined, '/instructor/application')}
            />
            
            <ModernKPICard 
              icon={<TrendingUp className="w-6 h-6" />}
              title="진행 중"
              count={ongoingCount}
              trend="활발한 활동"
              gradient="#10b981, #059669"
              isActive={activeFilter === 'ongoing'}
              onClick={() => handleKPICardClick('ongoing')}
            />
            
            <ModernKPICard 
              icon={<Award className="w-6 h-6" />}
              title="완료"
              count={completedCount}
              trend="성공적 완료"
              gradient="#64748b, #475569"
              isActive={activeFilter === 'completed'}
              onClick={() => handleKPICardClick('completed')}
            />
          </div>

          {/* Teaching Assignments List */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={toggleCollapse}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleCollapse()
                  }
                }}
                aria-expanded={!isCollapsed}
                aria-label={isCollapsed ? '목록 펼치기' : '목록 접기'}
                className="flex items-center gap-3 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg px-2 -ml-2"
              >
                <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 flex items-center gap-3">
                  <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  내 출강 리스트
                </h2>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-gray-400 group-hover:text-slate-700 dark:group-hover:text-gray-300 transition-colors">
                  {isCollapsed ? (
                    <>
                      <ChevronDown className="w-5 h-5" />
                      <span className="text-xs">목록 숨김 (클릭하여 펼치기)</span>
                    </>
                  ) : (
                    <ChevronUp className="w-5 h-5" />
                  )}
                </div>
              </button>
              <div className="flex gap-2">
                {(['all', 'scheduled', 'ongoing', 'completed'] as const).map((filter) => (
                  <button 
                    key={filter}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      activeFilter === filter 
                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105' 
                        : 'bg-white dark:bg-gray-800 text-slate-700 dark:text-gray-300 border-2 border-slate-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
                    }`}
                    onClick={() => setActiveFilter(filter)}
                  >
                    {filter === 'all' ? '전체' : filter === 'scheduled' ? '예정' : filter === 'ongoing' ? '진행중' : '완료'}
                  </button>
                ))}
              </div>
            </div>

            <div
              ref={listContainerRef}
              className="overflow-hidden transition-all duration-500 ease-in-out"
              style={{
                maxHeight: maxHeight === 'none' ? 'none' : maxHeight,
                opacity: isCollapsed ? 0 : 1,
              }}
              aria-hidden={isCollapsed}
            >
              {activeFilter === 'applicable' ? (
                // Show applicable educations (신청 가능)
                openEducations.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {openEducations.map((education) => {
                      const canApply = (): { canApply: boolean; reason?: string } => {
                        const now = dayjs()
                        if (education.applicationDeadline) {
                          const deadline = dayjs(education.applicationDeadline)
                          if (now.isAfter(deadline)) {
                            return { canApply: false, reason: '신청 마감일이 지났습니다.' }
                          }
                        }
                        if (education.educationStatus === '신청 마감') {
                          return { canApply: false, reason: '교육이 마감되었습니다.' }
                        }
                        return { canApply: true }
                      }
                      
                      const applyCheck = canApply()
                      const getDaysUntilDeadline = (deadline: string) => {
                        const deadlineDate = dayjs(deadline)
                        const now = dayjs()
                        const days = deadlineDate.diff(now, 'day')
                        if (days < 0) return '마감됨'
                        if (days === 0) return '오늘 마감'
                        return `D-${days}`
                      }
                      
                      return (
                        <Card
                          key={education.key}
                          className="rounded-2xl border-0 shadow-lg hover:shadow-2xl transition-all duration-300 dark:bg-gray-800 dark:border-gray-700"
                        >
                          <div className="space-y-4">
                            <div>
                              <h3 className="font-bold text-lg text-slate-900 dark:text-gray-100 mb-2">
                                {education.name}
                              </h3>
                              {education.applicationDeadline && (
                                <div className="mb-2">
                                  <Badge 
                                    status={applyCheck.canApply ? "processing" : "error"} 
                                    text={
                                      applyCheck.canApply 
                                        ? getDaysUntilDeadline(education.applicationDeadline)
                                        : '마감됨'
                                    } 
                                  />
                                </div>
                              )}
                            </div>
                            
                            <div className="space-y-2 text-sm text-slate-600 dark:text-gray-400">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{education.institution}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{education.periodStart} ~ {education.periodEnd}</span>
                              </div>
                              {education.applicationDeadline && (
                                <div className="flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  <span>신청 마감: {education.applicationDeadline}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{education.gradeClass}</span>
                              </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-200 dark:border-gray-700">
                              <Button
                                type="primary"
                                className="w-full"
                                onClick={() => router.push(`/instructor/apply/open?educationId=${education.educationId}`)}
                              >
                                신청하기
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <Card className="rounded-2xl border-0 shadow-lg text-center py-16 dark:bg-gray-800">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg">
                      <Calendar className="w-10 h-10 text-slate-400 dark:text-gray-500" />
                    </div>
                    <p className="text-slate-500 dark:text-gray-400 font-semibold text-lg">신청 가능한 교육이 없습니다.</p>
                  </Card>
                )
              ) : filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <ModernCourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <Card className="rounded-2xl border-0 shadow-lg text-center py-16 dark:bg-gray-800">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg">
                    <BookOpen className="w-10 h-10 text-slate-400 dark:text-gray-500" />
                  </div>
                  <p className="text-slate-500 dark:text-gray-400 font-semibold text-lg">해당하는 출강이 없습니다.</p>
                </Card>
              )}
            </div>
          </div>

          {/* Modern Calendar Section */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 flex items-center gap-3">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                캘린더
              </h2>
            </div>
            <Card className="rounded-2xl border-0 shadow-xl dark:bg-gray-800 dark:border-gray-700 overflow-hidden">
              <div className="p-6">
                {/* Calendar View Controls */}
                <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                  <div className="flex gap-2">
                    {(['monthly', 'weekly', 'daily'] as const).map((view) => (
                      <button
                        key={view}
                        className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all duration-300 ${
                          calendarView === view
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105'
                            : 'bg-white dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-2 border-slate-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md'
                        }`}
                        onClick={() => setCalendarView(view)}
                      >
                        {view === 'monthly' ? '월간' : view === 'weekly' ? '주간' : '일간'}
                      </button>
                    ))}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                      onClick={goToPreviousPeriod}
                    >
                      이전
                    </Button>
                    <Button 
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg"
                      onClick={goToToday}
                    >
                      오늘
                    </Button>
                    <Button 
                      className="px-4 py-2 rounded-xl border-2 border-slate-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
                      onClick={goToNextPeriod}
                    >
                      다음
                    </Button>
                  </div>
                </div>
                
                {/* Calendar Header */}
                <div className="text-center mb-8">
                  <h3 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-2">
                    {calendarView === 'monthly' && formatMonthName(currentMonth)}
                    {calendarView === 'weekly' && formatWeekRange(selectedDate)}
                    {calendarView === 'daily' && formatDailyDate(selectedDate)}
                  </h3>
                  <div className="flex items-center justify-center gap-6 mt-6">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg"></div>
                      <span className="text-sm text-slate-600 dark:text-gray-400 font-medium">오늘</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 shadow-lg"></div>
                      <span className="text-sm text-slate-600 dark:text-gray-400 font-medium">출강 예정</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-r from-slate-400 to-slate-500 shadow-lg"></div>
                      <span className="text-sm text-slate-600 dark:text-gray-400 font-medium">완료</span>
                    </div>
                  </div>
                </div>
                
                {/* Calendar Views */}
                {calendarView === 'monthly' && (
                  <>
                    <div className="grid grid-cols-7 gap-3 mb-4">
                      {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                        <div 
                          key={day} 
                          className={`text-center text-sm font-bold py-3 rounded-xl ${
                            idx === 0 ? 'text-red-500 dark:text-red-400' : idx === 6 ? 'text-blue-500 dark:text-blue-400' : 'text-slate-600 dark:text-gray-400'
                          }`}
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                    
                    <div className="grid grid-cols-7 gap-3">
                      {calendarDays.map((day, index) => {
                        const hasEvent = day.isCurrentMonth && hasEventOnDate(day.dateString)
                        const events = day.isCurrentMonth ? getEventsForDate(day.dateString) : []
                        const isToday = day.isCurrentMonth && day.date === 15
                        const isWeekend = index % 7 === 0 || index % 7 === 6
                        
                        return (
                          <div 
                            key={index}
                            onClick={() => {
                              if (day.isCurrentMonth) {
                                setSelectedDateForModal(day.dateString)
                                setIsEventModalOpen(true)
                              }
                            }}
                            className={`min-h-[120px] flex flex-col rounded-2xl border-2 transition-all duration-300 cursor-pointer group overflow-hidden ${
                              !day.isCurrentMonth 
                                ? 'border-slate-100 dark:border-gray-800 bg-slate-50/50 dark:bg-gray-800/50' 
                                : isToday
                                  ? 'border-blue-400 dark:border-blue-600 bg-gradient-to-br from-blue-50 via-blue-100/50 to-white dark:from-blue-900/30 dark:via-blue-800/20 dark:to-gray-800 shadow-xl ring-4 ring-blue-200/50 dark:ring-blue-700/30 scale-105'
                                  : hasEvent
                                    ? 'border-emerald-300 dark:border-emerald-600 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/50 dark:from-emerald-900/20 dark:via-gray-800 dark:to-emerald-800/10 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-lg'
                                    : 'border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-slate-300 dark:hover:border-gray-600 hover:shadow-md'
                            }`}
                          >
                            <div className={`flex items-center justify-center p-2 ${
                              !day.isCurrentMonth 
                                ? 'text-slate-300 dark:text-gray-700' 
                                : isToday
                                  ? 'text-blue-700 dark:text-blue-300 font-bold'
                                  : isWeekend
                                    ? 'text-slate-500 dark:text-gray-400'
                                    : 'text-slate-700 dark:text-gray-300'
                            }`}>
                              <span className={`text-sm font-bold ${
                                isToday ? 'w-8 h-8 flex items-center justify-center rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg' : ''
                              }`}>
                                {day.date}
                              </span>
                            </div>
                            <div className="flex-1 px-2 pb-2 space-y-1">
                              {events.slice(0, 2).map((event, eventIndex) => (
                                <div 
                                  key={eventIndex}
                                  className={`text-[10px] px-2 py-1.5 rounded-lg font-bold truncate ${
                                    event.status === '예정'
                                      ? 'bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/30 text-blue-700 dark:text-blue-300'
                                      : event.status === '진행중'
                                        ? 'bg-gradient-to-r from-emerald-100 to-green-200 dark:from-emerald-900/40 dark:to-green-800/30 text-emerald-700 dark:text-emerald-300'
                                        : 'bg-gradient-to-r from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 text-slate-600 dark:text-gray-400'
                                  }`}
                                >
                                  {event.title}
                                </div>
                              ))}
                              {events.length > 2 && (
                                <div className="text-[10px] text-slate-500 dark:text-gray-500 font-bold px-2">
                                  +{events.length - 2}개
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
                
                {calendarView === 'weekly' && (
                  <WeeklyCalendarView 
                    currentDate={selectedDate}
                    onDateClick={(dateString) => {
                      setSelectedDateForModal(dateString)
                      setIsEventModalOpen(true)
                    }}
                  />
                )}
                
                {calendarView === 'daily' && (
                  <DailyCalendarView currentDate={selectedDate} />
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Modern Event Detail Modal */}
      <Modal
        title={null}
        open={isEventModalOpen}
        onCancel={() => {
          setIsEventModalOpen(false)
          setSelectedDateForModal(null)
        }}
        footer={null}
        centered
        width={700}
        className="event-detail-modal"
        styles={{
          content: {
            borderRadius: '1.5rem',
            padding: 0,
          }
        }}
      >
        {selectedDateForModal && (
          <div className="p-8">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-slate-900 dark:text-gray-100 mb-2">
                {(() => {
                  const date = new Date(selectedDateForModal)
                  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
                })()}
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-lg">
                {(() => {
                  const date = new Date(selectedDateForModal)
                  return ['일', '월', '화', '수', '목', '금', '토'][date.getDay()] + '요일'
                })()}
              </p>
            </div>

            {getEventsForDate(selectedDateForModal).length > 0 ? (
              <div className="space-y-4">
                {getEventsForDate(selectedDateForModal).map((event, index) => (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border-2 ${
                      event.status === '예정'
                        ? 'border-blue-300 dark:border-blue-600 bg-gradient-to-br from-blue-50 via-white to-blue-50/50 dark:from-blue-900/30 dark:via-gray-800 dark:to-blue-800/20'
                        : event.status === '진행중'
                          ? 'border-emerald-300 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 dark:from-emerald-900/30 dark:via-gray-800 dark:to-emerald-800/20'
                          : 'border-slate-200 dark:border-gray-700 bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-4">{event.title}</h4>
                        <div className="space-y-3">
                          {event.timeRange && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <Clock className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="text-xs text-slate-500 dark:text-gray-400 mb-1">시간</div>
                                <div className="text-lg font-bold text-slate-900 dark:text-gray-100">{event.timeRange}</div>
                              </div>
                            </div>
                          )}
                          {event.institutionName && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
                                <School className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="text-xs text-slate-500 dark:text-gray-400 mb-1">기관명</div>
                                <div className="text-lg font-bold text-slate-900 dark:text-gray-100">{event.institutionName}</div>
                              </div>
                            </div>
                          )}
                          {event.classInfo && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <div className="text-xs text-slate-500 dark:text-gray-400 mb-1">학급</div>
                                <div className="text-lg font-bold text-slate-900 dark:text-gray-100">{event.classInfo}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="ml-4">
                        <StatusBadge status={event.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shadow-lg">
                  <Calendar className="w-10 h-10 text-slate-400 dark:text-gray-500" />
                </div>
                <p className="text-slate-500 dark:text-gray-400 font-semibold text-lg">이 날짜에는 일정이 없습니다</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </ProtectedRoute>
  )
}
