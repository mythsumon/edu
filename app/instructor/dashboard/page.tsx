'use client'

import { useState } from 'react'
import { Card } from 'antd'
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
  ArrowUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { InstructorCourse, instructorCourses, instructorCalendarEvents } from '@/mock/instructorDashboardData'

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
        : 'border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
        isActive ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-xl font-semibold text-gray-900">{count}</p>
      </div>
    </div>
  </Card>
)

// Course card component
const CourseCard = ({ course }: { course: InstructorCourse }) => {
  const router = useRouter()
  
  return (
    <Card 
      className="rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => router.push(`/instructor/assignment/${course.id}`)}
    >
      <div className="space-y-3">
        <div>
          <h3 className="font-medium text-gray-900 line-clamp-1">{course.educationName}</h3>
          <p className="text-sm text-gray-500">{course.institutionName}</p>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-gray-500">{course.startDate}</span>
          <span className="text-gray-500">~</span>
          <span className="text-gray-500">{course.endDate}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <StatusBadge status={course.status} />
          <div className="flex items-center gap-2 text-xs text-gray-500">
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
const WeeklyCalendarView = ({ currentDate }: { currentDate: Date }) => {
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
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day, index) => {
          const isToday = day.toDateString() === new Date().toDateString()
          const events = getEventsForDate(day)
          
          return (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className={`py-2 text-center text-sm font-medium ${
                isToday ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'
              }`}>
                <div>{['일', '월', '화', '수', '목', '금', '토'][day.getDay()]}</div>
                <div>{day.getDate()}</div>
              </div>
              <div className="min-h-24 p-1 space-y-1">
                {events.map((event, eventIndex) => (
                  <div 
                    key={eventIndex} 
                    className="text-xs bg-green-100 text-green-800 p-1 rounded truncate"
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Daily calendar view component
const DailyCalendarView = ({ currentDate }: { currentDate: Date }) => {
  const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(currentDate.getDate()).padStart(2, '0')}`
  const events = instructorCalendarEvents.filter(event => event.date === dateString)
  
  return (
    <div className="space-y-4">
      <div className="text-center py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium">
          {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월 {currentDate.getDate()}일
        </h3>
        <p className="text-sm text-gray-500">
          {['일', '월', '화', '수', '목', '금', '토'][currentDate.getDay()]}요일
        </p>
      </div>
      
      {events.length > 0 ? (
        <div className="space-y-3">
          {events.map((event, index) => (
            <div key={index} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">{event.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {event.status === '예정' ? '출강 예정' : 
                     event.status === '진행중' ? '진행 중' : '완료'}
                  </p>
                </div>
                <StatusBadge status={event.status} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">일정이 없습니다</p>
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

  // Filter courses based on active filter
  const filteredCourses = instructorCourses.filter(course => {
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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#3a2e2a] mb-2">
          대시보드
        </h1>
        <p className="text-gray-600">
          홍길동 강사님 안녕하세요!
        </p>
        <p className="text-sm text-gray-500 mt-1">
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
          <h2 className="text-lg font-semibold text-gray-900">내 출강 리스트</h2>
          <div className="flex gap-2">
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter('all')}
            >
              전체
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeFilter === 'scheduled' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter('scheduled')}
            >
              오픈 예정
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeFilter === 'ongoing' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => setActiveFilter('ongoing')}
            >
              진행 중
            </button>
            <button 
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                activeFilter === 'completed' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
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
          <Card className="rounded-xl border border-gray-200 shadow-sm text-center py-12">
            <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">해당하는 출강이 없습니다.</p>
          </Card>
        )}
      </div>

      {/* Calendar Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">캘린더</h2>
        <Card className="rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            {/* Calendar View Controls */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
              <div className="flex gap-2">
                <button
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    calendarView === 'monthly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setCalendarView('monthly')}
                >
                  월간
                </button>
                <button
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    calendarView === 'weekly'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setCalendarView('weekly')}
                >
                  주간
                </button>
                <button
                  className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                    calendarView === 'daily'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setCalendarView('daily')}
                >
                  일간
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={goToPreviousPeriod}
                >
                  이전
                </button>
                <button 
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={goToToday}
                >
                  오늘
                </button>
                <button 
                  className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={goToNextPeriod}
                >
                  다음
                </button>
              </div>
            </div>
            
            {/* Calendar Header */}
            <div className="text-center mb-6">
              <h3 className="font-medium text-gray-900">
                {calendarView === 'monthly' && formatMonthName(currentMonth)}
                {calendarView === 'weekly' && formatWeekRange(selectedDate)}
                {calendarView === 'daily' && formatDailyDate(selectedDate)}
              </h3>
            </div>
            
            {/* Calendar Views */}
            {calendarView === 'monthly' && (
              <>
                {/* Monthly Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                    <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                      {day}
                    </div>
                  ))}
                </div>
                
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    const hasEvent = day.isCurrentMonth && hasEventOnDate(day.dateString)
                    const isToday = day.isCurrentMonth && day.date === 15 // Mock today as 15th
                    
                    return (
                      <div 
                        key={index}
                        className={`h-12 flex flex-col items-center justify-center rounded-lg text-sm cursor-pointer transition-colors relative ${
                          !day.isCurrentMonth 
                            ? 'text-gray-400' 
                            : hasEvent 
                              ? 'bg-green-50 text-green-700 font-medium hover:bg-green-100' 
                              : isToday
                                ? 'bg-blue-100 text-blue-700 font-medium'
                                : 'hover:bg-gray-50'
                        }`}
                      >
                        <span>{day.date}</span>
                        {hasEvent && (
                          <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        )}
                        {isToday && (
                          <div className="absolute top-1 w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}
            
            {calendarView === 'weekly' && (
              <WeeklyCalendarView currentDate={selectedDate} />
            )}
            
            {calendarView === 'daily' && (
              <DailyCalendarView currentDate={selectedDate} />
            )}
            
            <div className="mt-6 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-gray-600">출강 예정</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-gray-600">오늘</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}