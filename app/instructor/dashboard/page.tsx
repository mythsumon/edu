'use client'

import { useState } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Modal } from 'antd'
import { 
  Calendar, 
  BookOpen, 
  Clock, 
  CheckCircle, 
  ChevronRight, 
  Play, 
  Award,
  Plus,
  User,
  ArrowUp,
  MapPin,
  School
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { InstructorCourse, instructorCourses, instructorCalendarEvents, InstructorCalendarEvent } from '@/mock/instructorDashboardData'

// Status badge component for consistent styling
const StatusBadge = ({ status }: { status: '예정' | '진행중' | '완료' }) => {
  const statusStyles = {
    '예정': 'bg-blue-100 text-blue-800',
    '진행중': 'bg-green-100 text-green-800',
    '완료': 'bg-gray-100 text-gray-800'
  }

  const statusText = {
    '예정': '예정',
    '진행중': '진행중',
    '완료': '완료'
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status]}`}>
      {statusText[status]}
    </span>
  )
}

// Quick filter card component
const QuickFilterCard = ({ 
  icon, 
  title, 
  count, 
  isActive, 
  onClick 
}: { 
  icon: React.ReactNode;
  title: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}) => (
  <Card 
    className={`rounded-xl border transition-all cursor-pointer ${
      isActive 
        ? 'border-blue-500 shadow-md bg-blue-50' 
        : 'border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        isActive ? 'bg-blue-100' : 'bg-slate-100'
      }`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500">{title}</p>
        <p className="text-xl font-semibold text-slate-900">{count}</p>
      </div>
    </div>
  </Card>
)

// Course card component
const CourseCard = ({ course }: { course: InstructorCourse }) => {
  const router = useRouter()
  
  return (
    <Card 
      className="rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/instructor/assignment/${course.id}`)}
    >
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-slate-900 line-clamp-1">{course.educationName}</h3>
          <p className="text-sm text-slate-500">{course.institutionName}</p>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-500">{course.startDate}</span>
          <span className="text-slate-500">~</span>
          <span className="text-slate-500">{course.endDate}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <StatusBadge status={course.status} />
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{course.classInfo}</span>
            <span>•</span>
            <span>{course.timeRange}</span>
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
  // Generate week days (7 days starting from Sunday)
  const startOfWeek = new Date(currentDate)
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
  
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return date
  })

  // Get events for each day
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
              className={`rounded-xl border transition-all duration-200 cursor-pointer ${
                isToday 
                  ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-lg ring-2 ring-blue-200' 
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
              }`}
            >
              <div className={`py-3 text-center border-b ${
                isToday 
                  ? 'border-blue-200 bg-blue-500 text-white' 
                  : isWeekend
                    ? 'border-slate-200 bg-slate-50'
                    : 'border-slate-200 bg-slate-50'
              }`}>
                <div className={`text-xs font-semibold mb-1 ${
                  isToday ? 'text-white' : isWeekend ? 'text-slate-500' : 'text-slate-600'
                }`}>
                  {['일', '월', '화', '수', '목', '금', '토'][day.getDay()]}
                </div>
                <div className={`text-lg font-bold ${
                  isToday 
                    ? 'text-white' 
                    : isWeekend 
                      ? 'text-slate-600' 
                      : 'text-slate-800'
                }`}>
                  {day.getDate()}
                </div>
              </div>
              <div className="min-h-[200px] p-3 space-y-2">
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
                        className={`text-xs px-3 py-2 rounded-lg font-medium border transition-all hover:shadow-sm cursor-pointer ${
                          event.status === '예정'
                            ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                            : event.status === '진행중'
                              ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="font-semibold truncate">{event.title}</div>
                        {event.timeRange && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock className="w-3 h-3 opacity-70" />
                            <span className="text-[10px] opacity-75">{event.timeRange}</span>
                          </div>
                        )}
                        <div className="text-[10px] mt-0.5 opacity-75">
                          {event.status === '예정' ? '출강 예정' : 
                           event.status === '진행중' ? '진행 중' : '완료'}
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="text-slate-300 text-xs">일정 없음</div>
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
      <div className={`text-center py-6 rounded-xl border-2 ${
        isWeekend 
          ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100/50' 
          : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'
      }`}>
        <div className="text-3xl font-bold text-slate-900 mb-2">
          {currentDate.getDate()}
        </div>
        <div className="text-lg font-semibold text-slate-700 mb-1">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
        </div>
        <div className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
          isWeekend ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
        }`}>
          {['일', '월', '화', '수', '목', '금', '토'][dayOfWeek]}요일
        </div>
      </div>
      
      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event, index) => (
            <div 
              key={index}
              onClick={() => {
                if (onDateClick) {
                  onDateClick(dateString)
                }
              }}
              className={`p-5 rounded-xl border-2 transition-all hover:shadow-lg cursor-pointer ${
                event.status === '예정'
                  ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white hover:border-blue-300'
                  : event.status === '진행중'
                    ? 'border-green-200 bg-gradient-to-br from-green-50 to-white hover:border-green-300'
                    : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white hover:border-slate-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="text-lg font-bold text-slate-900 mb-1">{event.title}</h4>
                  {event.timeRange && (
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="text-sm font-semibold text-slate-700">{event.timeRange}</span>
                    </div>
                  )}
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                    event.status === '예정'
                      ? 'bg-blue-100 text-blue-700'
                      : event.status === '진행중'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}>
                    {event.status === '예정' ? '출강 예정' : 
                     event.status === '진행중' ? '진행 중' : '완료'}
                  </div>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  event.status === '예정'
                    ? 'bg-blue-100'
                    : event.status === '진행중'
                      ? 'bg-green-100'
                      : 'bg-slate-100'
                }`}>
                  <Calendar className={`w-6 h-6 ${
                    event.status === '예정'
                      ? 'text-blue-600'
                      : event.status === '진행중'
                        ? 'text-green-600'
                        : 'text-slate-500'
                  }`} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">이 날짜에는 일정이 없습니다</p>
        </div>
      )}
    </div>
  )
}

export default function InstructorDashboard() {
  const router = useRouter()
  const [activeFilter, setActiveFilter] = useState<'all' | 'scheduled' | 'ongoing' | 'completed'>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 2)) // March 2025
  const [calendarView, setCalendarView] = useState<'monthly' | 'weekly' | 'daily'>('monthly')
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 2, 15)) // March 15, 2025
  const [selectedDateForModal, setSelectedDateForModal] = useState<string | null>(null)
  const [isEventModalOpen, setIsEventModalOpen] = useState(false)

  // Filter courses based on active filter
  // Only show educations with status = 'OPEN' or '신청 중' (공개/모집중)
  const filteredCourses = instructorCourses.filter(course => {
    // Visibility rule: Only show published/open educations
    if (course.educationStatus && 
        course.educationStatus !== 'OPEN' && 
        course.educationStatus !== '신청 중') {
      return false
    }
    
    // Existing status filters
    if (activeFilter === 'all') return true
    if (activeFilter === 'scheduled') return course.status === '예정'
    if (activeFilter === 'ongoing') return course.status === '진행중'
    if (activeFilter === 'completed') return course.status === '완료'
    return true
  })

  // Get counts for quick filter cards
  const scheduledCount = instructorCourses.filter(c => c.status === '예정').length
  const ongoingCount = instructorCourses.filter(c => c.status === '진행중').length
  const completedCount = instructorCourses.filter(c => c.status === '완료').length

  // Calendar navigation
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

  // Generate calendar days for monthly view
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    // Days from previous month to show
    const prevMonthDays = firstDay.getDay()
    // Days from next month to show
    const nextMonthDays = 6 - lastDay.getDay()
    
    const days = []
    
    // Previous month days
    for (let i = prevMonthDays; i > 0; i--) {
      const date = new Date(year, month, -i + 1)
      days.push({
        date: date.getDate(),
        isCurrentMonth: false,
        dateString: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
      })
    }
    
    // Current month days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      days.push({
        date: i,
        isCurrentMonth: true,
        dateString
      })
    }
    
    // Next month days
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

  // Check if a day has events
  const hasEventOnDate = (dateString: string) => {
    return instructorCalendarEvents.some(event => event.date === dateString)
  }

  // Get events for a specific date
  const getEventsForDate = (dateString: string) => {
    return instructorCalendarEvents.filter(event => event.date === dateString)
  }

  // Format month name
  const formatMonthName = (date: Date) => {
    const months = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ]
    return `${date.getFullYear()}년 ${months[date.getMonth()]}`
  }

  // Format week range
  const formatWeekRange = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6)
    
    return `${startOfWeek.getMonth() + 1}/${startOfWeek.getDate()} - ${endOfWeek.getMonth() + 1}/${endOfWeek.getDate()}, ${date.getFullYear()}`
  }

  // Format date for daily view
  const formatDailyDate = (date: Date) => {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
  }

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              대시보드
            </h1>
            <p className="text-slate-600">
              홍길동 강사님 안녕하세요!
            </p>
            <p className="text-sm text-slate-500 mt-1">
              오늘도 좋은 수업 부탁드립니다.
            </p>
          </div>

      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <QuickFilterCard 
          icon={<Play className="w-5 h-5 text-blue-600" />}
          title="내 출강 리스트"
          count={instructorCourses.length}
          isActive={activeFilter === 'all'}
          onClick={() => setActiveFilter('all')}
        />
        
        <QuickFilterCard 
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          title="오픈 예정 교육"
          count={scheduledCount}
          isActive={activeFilter === 'scheduled'}
          onClick={() => setActiveFilter('scheduled')}
        />
        
        <QuickFilterCard 
          icon={<Plus className="w-5 h-5 text-purple-600" />}
          title="신청할 수 있는 교육"
          count={5} // Mock data
          isActive={false}
          onClick={() => router.push('/instructor/application')}
        />
        
        <QuickFilterCard 
          icon={<Play className="w-5 h-5 text-green-600" />}
          title="교육 진행 중"
          count={ongoingCount}
          isActive={activeFilter === 'ongoing'}
          onClick={() => setActiveFilter('ongoing')}
        />
        
        <QuickFilterCard 
          icon={<Award className="w-5 h-5 text-gray-600" />}
          title="교육 완료"
          count={completedCount}
          isActive={activeFilter === 'completed'}
          onClick={() => setActiveFilter('completed')}
        />
      </div>

      {/* Teaching Assignments List */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">내 출강 리스트</h2>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              전체
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeFilter === 'scheduled' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setActiveFilter('scheduled')}
            >
              오픈 예정
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeFilter === 'ongoing' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setActiveFilter('ongoing')}
            >
              진행 중
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeFilter === 'completed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              onClick={() => setActiveFilter('completed')}
            >
              완료
            </button>
          </div>
        </div>

        {filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <Card className="rounded-xl border border-slate-200 shadow-sm text-center py-12">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">해당하는 출강이 없습니다.</p>
          </Card>
        )}
      </div>

      {/* Calendar Section */}
      <div>
        <h2 className="text-lg font-semibold text-slate-900 mb-4">캘린더</h2>
        <Card className="rounded-xl border border-slate-200 shadow-sm">
          <div className="p-6">
            {/* Calendar View Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    calendarView === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setCalendarView('monthly')}
                >
                  월간
                </button>
                <button
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    calendarView === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setCalendarView('weekly')}
                >
                  주간
                </button>
                <button
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    calendarView === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                  }`}
                  onClick={() => setCalendarView('daily')}
                >
                  일간
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                  onClick={goToPreviousPeriod}
                >
                  이전
                </button>
                <button 
                  className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                  onClick={goToToday}
                >
                  오늘
                </button>
                <button 
                  className="px-3 py-1.5 text-sm bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
                  onClick={goToNextPeriod}
                >
                  다음
                </button>
              </div>
            </div>
            
            {/* Calendar Header */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-1">
                {calendarView === 'monthly' && formatMonthName(currentMonth)}
                {calendarView === 'weekly' && formatWeekRange(selectedDate)}
                {calendarView === 'daily' && formatDailyDate(selectedDate)}
              </h3>
              <div className="flex items-center justify-center gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-xs text-slate-600 font-medium">오늘</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-xs text-slate-600 font-medium">출강 예정</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                  <span className="text-xs text-slate-600 font-medium">완료</span>
                </div>
              </div>
            </div>
            
            {/* Calendar Views */}
            {calendarView === 'monthly' && (
              <>
                {/* Monthly Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 mb-3">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day, idx) => (
                    <div 
                      key={day} 
                      className={`text-center text-xs font-semibold py-3 ${
                        idx === 0 ? 'text-red-500' : idx === 6 ? 'text-blue-500' : 'text-slate-600'
                      }`}
                    >
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((day, index) => {
                    const hasEvent = day.isCurrentMonth && hasEventOnDate(day.dateString)
                    const events = day.isCurrentMonth ? getEventsForDate(day.dateString) : []
                    const isToday = day.isCurrentMonth && day.date === 15 // Mock today as 15th
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
                        className={`min-h-[100px] flex flex-col rounded-xl border transition-all duration-200 cursor-pointer group ${
                          !day.isCurrentMonth 
                            ? 'border-slate-100 bg-slate-50/50' 
                            : isToday
                              ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100/50 shadow-md ring-2 ring-blue-200'
                              : hasEvent
                                ? 'border-green-200 bg-gradient-to-br from-green-50/80 to-white hover:border-green-300 hover:shadow-md'
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className={`flex items-center justify-center p-2 ${
                          !day.isCurrentMonth 
                            ? 'text-slate-300' 
                            : isToday
                              ? 'text-blue-700 font-bold'
                              : isWeekend
                                ? 'text-slate-500'
                                : 'text-slate-700'
                        }`}>
                          <span className={`text-sm font-semibold ${
                            isToday ? 'w-7 h-7 flex items-center justify-center rounded-full bg-blue-500 text-white' : ''
                          }`}>
                            {day.date}
                          </span>
                        </div>
                        <div className="flex-1 px-1.5 pb-1.5 space-y-1">
                          {events.slice(0, 2).map((event, eventIndex) => (
                            <div 
                              key={eventIndex}
                              className={`text-[10px] px-2 py-1 rounded-md font-medium truncate ${
                                event.status === '예정'
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : event.status === '진행중'
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {event.title}
                            </div>
                          ))}
                          {events.length > 2 && (
                            <div className="text-[10px] text-slate-500 font-medium px-2">
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

      {/* Event Detail Modal */}
      <Modal
        title={null}
        open={isEventModalOpen}
        onCancel={() => {
          setIsEventModalOpen(false)
          setSelectedDateForModal(null)
        }}
        footer={null}
        centered
        width={600}
        className="event-detail-modal"
      >
        {selectedDateForModal && (
          <div className="py-4">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                {(() => {
                  const date = new Date(selectedDateForModal)
                  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`
                })()}
              </h3>
              <p className="text-slate-500">
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
                    className={`p-6 rounded-xl border-2 ${
                      event.status === '예정'
                        ? 'border-blue-200 bg-gradient-to-br from-blue-50 to-white'
                        : event.status === '진행중'
                          ? 'border-green-200 bg-gradient-to-br from-green-50 to-white'
                          : 'border-slate-200 bg-gradient-to-br from-slate-50 to-white'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-slate-900 mb-3">{event.title}</h4>
                        <div className="space-y-2">
                          {event.timeRange && (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-blue-600" />
                              </div>
                              <div>
                                <div className="text-xs text-slate-500 mb-0.5">시간</div>
                                <div className="text-base font-semibold text-slate-900">{event.timeRange}</div>
                              </div>
                            </div>
                          )}
                          {event.institutionName && (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                                <School className="w-5 h-5 text-green-600" />
                              </div>
                              <div>
                                <div className="text-xs text-slate-500 mb-0.5">기관명</div>
                                <div className="text-base font-semibold text-slate-900">{event.institutionName}</div>
                              </div>
                            </div>
                          )}
                          {event.classInfo && (
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <User className="w-5 h-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="text-xs text-slate-500 mb-0.5">학급</div>
                                <div className="text-base font-semibold text-slate-900">{event.classInfo}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`px-4 py-2 rounded-lg ${
                        event.status === '예정'
                          ? 'bg-blue-100 text-blue-700'
                          : event.status === '진행중'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-slate-100 text-slate-600'
                      }`}>
                        <StatusBadge status={event.status} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500 font-medium">이 날짜에는 일정이 없습니다</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </ProtectedRoute>
  )
}