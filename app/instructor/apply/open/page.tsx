'use client'

import { useState, useMemo, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Modal, message, Tooltip, Tabs, Table, Checkbox, Space } from 'antd'
import { Calendar, CheckCircle2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import dayjs from 'dayjs'
import { dataStore } from '@/lib/dataStore'
import type { Education, InstructorApplication, InstructorAssignment, Instructor } from '@/lib/dataStore'
import { useAuth } from '@/contexts/AuthContext'
import type { ColumnsType } from 'antd/es/table'
import { 
  validateInstructorAssignment,
  getDefaultMonthlyCapacity,
  getGlobalDailyLimit,
  type ValidationResult
} from '@/entities/instructor/instructor-validation'
import { getInstructorByName } from '@/entities/instructor/instructor-utils'

export default function ApplyForEducationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userProfile } = useAuth()
  const educationIdParam = searchParams?.get('educationId') || null
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open')
  const [allEducations, setAllEducations] = useState<Education[]>(dataStore.getEducations())
  const currentInstructorName = userProfile?.name || '홍길동'
  const currentInstructorId = userProfile?.userId || 'instructor-1'
  
  // Get current instructor data
  const currentInstructor: Instructor = useMemo(() => {
    return getInstructorByName(currentInstructorName) || {
      id: currentInstructorId,
      name: currentInstructorName,
      monthlyLeadMaxSessions: (userProfile as any)?.monthlyLeadMaxSessions || 20,
      monthlyAssistantMaxSessions: (userProfile as any)?.monthlyAssistantMaxSessions || 30,
      dailyEducationLimit: (userProfile as any)?.dailyEducationLimit || null,
    }
  }, [currentInstructorName, currentInstructorId, userProfile])

  // Refresh data periodically and on window focus to get latest status changes from admin
  useEffect(() => {
    const refreshData = () => {
      setAllEducations(dataStore.getEducations())
    }

    // Refresh on mount
    refreshData()

    // Refresh when window gains focus (user switches back to tab)
    const handleFocus = () => {
      refreshData()
    }

    // Refresh every 5 seconds to catch admin status changes
    const interval = setInterval(refreshData, 5000)

    // Listen for education status updates from scheduler
    const handleStatusUpdate = () => {
      refreshData()
    }

    window.addEventListener('focus', handleFocus)
    window.addEventListener('educationStatusUpdated', handleStatusUpdate)
    window.addEventListener('storage', handleStatusUpdate)

    return () => {
      clearInterval(interval)
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('educationStatusUpdated', handleStatusUpdate)
      window.removeEventListener('storage', handleStatusUpdate)
    }
  }, [])
  
  // 지역(시/군)과 배정권역 매핑
  const cityToRegionMap: Record<string, string> = {
    '수원시': '1권역',
    '성남시': '2권역',
    '고양시': '3권역',
    '용인시': '4권역',
    '부천시': '5권역',
    '안산시': '5권역',
    '안양시': '1권역',
    '평택시': '6권역',
    '시흥시': '5권역',
    '김포시': '3권역',
    '의정부시': '1권역',
    '광명시': '5권역',
    '하남시': '2권역',
    '오산시': '6권역',
    '이천시': '4권역',
    '구리시': '2권역',
    '안성시': '6권역',
    '포천시': '1권역',
    '의왕시': '1권역',
    '양주시': '1권역',
    '여주시': '4권역',
    '양평군': '4권역',
    '동두천시': '1권역',
    '과천시': '1권역',
    '가평군': '4권역',
    '연천군': '1권역',
  }

  // Get instructor's assignment zone (region) from profile
  // 홍길동 강사의 경우 기본 지역을 설정 (실제로는 userProfile이나 instructor 데이터에서 가져와야 함)
  const instructorRegion = useMemo(() => {
    // Try to get from userProfile first
    if ((userProfile as any)?.region) {
      return (userProfile as any).region
    }
    
    // Try to get from instructor data
    if (currentInstructor && (currentInstructor as any).region) {
      return (currentInstructor as any).region
    }
    
    // Default for 홍길동: 수원시 (주소가 경기도 수원시이므로)
    if (currentInstructorName === '홍길동') {
      return '수원시'
    }
    
    // Default fallback
    return '서울시'
  }, [userProfile, currentInstructor, currentInstructorName])

  // Get instructor's region zone (권역) from city
  const instructorRegionZone = useMemo(() => {
    return cityToRegionMap[instructorRegion] || instructorRegion
  }, [instructorRegion])
  
  // OPEN 상태의 교육 (신청 가능) - Only 강사공개 allows applications
  const openEducations = useMemo(() => {
    const now = dayjs()
    return allEducations.filter(education => {
      // Status must be 강사공개 OR educationStatus must be OPEN/신청 중 (allows instructor applications)
      const isStatusOpen = education.status === '강사공개' || 
                          education.status === '신청 중' ||
                          education.educationStatus === 'OPEN' ||
                          education.educationStatus === '신청 중'
      
      if (!isStatusOpen) {
        return false
      }
      
      // Exclude if status is explicitly closed
      if (education.status === '신청 마감' || education.educationStatus === '신청 마감') {
        return false
      }
      
      // Check if deadline passed
      if (education.applicationDeadline) {
        const deadline = dayjs(education.applicationDeadline)
        if (now.isAfter(deadline, 'day')) {
          return false // 마감일이 지난 것은 마감 탭으로
        }
      }
      
      // Region filtering: 지역이 일치하지 않으면 표시하지 않음
      // 단, 교육의 regionAssignmentMode가 'FULL'이면 모든 지역에서 신청 가능
      if (education.regionAssignmentMode === 'FULL') {
        // FULL 모드: 모든 지역에서 신청 가능
      } else {
        // PARTIAL 모드 (기본값): 지역이 일치해야 함
        if (education.region) {
          // 교육의 region이 권역 형식(예: '1권역')인 경우
          if (education.region.includes('권역')) {
            // 강사의 지역을 권역으로 변환하여 비교
            if (education.region !== instructorRegionZone) {
              return false // 지역이 일치하지 않으면 표시하지 않음
            }
          } else {
            // 교육의 region이 시/군 형식(예: '수원시')인 경우 직접 비교
            if (education.region !== instructorRegion) {
              return false // 지역이 일치하지 않으면 표시하지 않음
            }
          }
        }
      }
      
      // If educationId param exists, filter by it
      if (educationIdParam && education.educationId !== educationIdParam) {
        return false
      }
      
      return true
    })
  }, [allEducations, educationIdParam, instructorRegion])
  
  // 마감된 교육
  const closedEducations = useMemo(() => {
    const now = dayjs()
    return allEducations.filter(education => {
      // Status is 신청 마감 or deadline passed
      const isStatusClosed = education.educationStatus === '신청 마감'
      const isDeadlinePassed = education.applicationDeadline 
        ? dayjs(education.applicationDeadline).isBefore(now, 'day')
        : false
      
      if (!isStatusClosed && !isDeadlinePassed) {
        return false
      }
      
      // If educationId param exists, filter by it
      if (educationIdParam && education.educationId !== educationIdParam) {
        return false
      }
      
      return true
    })
  }, [allEducations, educationIdParam])

  /**
   * Check if two time ranges overlap
   * @param date1 First date
   * @param start1 First start time (HH:mm)
   * @param end1 First end time (HH:mm)
   * @param date2 Second date
   * @param start2 Second start time (HH:mm)
   * @param end2 Second end time (HH:mm)
   * @returns true if time ranges overlap
   */
  const isTimeOverlapping = (
    date1: string,
    start1: string,
    end1: string,
    date2: string,
    start2: string,
    end2: string
  ): boolean => {
    // Normalize dates for comparison (handle both YYYY.MM.DD and YYYY-MM-DD formats)
    const normalizedDate1 = date1.replace(/\./g, '-')
    const normalizedDate2 = date2.replace(/\./g, '-')
    
    // Must be on the same date
    if (normalizedDate1 !== normalizedDate2) {
      return false
    }

    // Parse times to minutes for easier comparison
    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(':').map(Number)
      return hours * 60 + minutes
    }

    const start1Minutes = parseTime(start1)
    const end1Minutes = parseTime(end1)
    const start2Minutes = parseTime(start2)
    const end2Minutes = parseTime(end2)

    // Check if time ranges overlap
    // Overlap occurs if: start1 < end2 && start2 < end1
    return start1Minutes < end2Minutes && start2Minutes < end1Minutes
  }

  /**
   * Check if the new education's sessions conflict with already assigned sessions
   * @param newEducation Education to check
   * @returns Conflict information
   */
  const checkTimeConflict = (
    newEducation: Education
  ): { hasConflict: boolean; conflictingEducation?: InstructorAssignment; conflictingSession?: { date: string; time: string } } => {
    // Get all assignments for current instructor
    const allAssignments = dataStore.getInstructorAssignments()
    const instructorAssignments = allAssignments.filter(assignment => {
      // Check if instructor is assigned as main or assistant in any lesson
      if (!assignment.lessons || assignment.lessons.length === 0) {
        return false
      }

      return assignment.lessons.some(lesson => {
        const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
        const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
        
        return mainInstructors.some(inst => inst.name === currentInstructorName) ||
               assistantInstructors.some(inst => inst.name === currentInstructorName)
      })
    })

    // Get new education's lessons
    if (!newEducation.lessons || newEducation.lessons.length === 0) {
      return { hasConflict: false }
    }

    // Check each new lesson against all assigned lessons
    for (const newLesson of newEducation.lessons) {
      if (!newLesson.date || !newLesson.startTime || !newLesson.endTime) {
        continue
      }

      for (const assignment of instructorAssignments) {
        if (!assignment.lessons || assignment.lessons.length === 0) {
          continue
        }

        for (const assignedLesson of assignment.lessons) {
          if (!assignedLesson.date || !assignedLesson.startTime || !assignedLesson.endTime) {
            continue
          }

          // Normalize dates for comparison (handle both YYYY.MM.DD and YYYY-MM-DD formats)
          const normalizedNewDate = newLesson.date.replace(/\./g, '-')
          const normalizedAssignedDate = assignedLesson.date.replace(/\./g, '-')
          
          // Check if times overlap
          if (isTimeOverlapping(
            normalizedNewDate,
            newLesson.startTime,
            newLesson.endTime,
            normalizedAssignedDate,
            assignedLesson.startTime,
            assignedLesson.endTime
          )) {
            return {
              hasConflict: true,
              conflictingEducation: assignment,
              conflictingSession: {
                date: assignedLesson.date,
                time: `${assignedLesson.startTime} ~ ${assignedLesson.endTime}`
              }
            }
          }
        }
      }
    }

    return { hasConflict: false }
  }

  /**
   * Check assignment zone rule (부분 규칙 배정)
   * Instructor can only apply to educations in their assigned region
   */
  const checkAssignmentZone = (education: Education): { eligible: boolean; reason?: string } => {
    // If education has no region, allow (for backward compatibility)
    if (!education.region) {
      return { eligible: true }
    }

    // Check if instructor's region matches education's region
    if (education.region !== instructorRegion) {
      return {
        eligible: false,
        reason: `지역 불일치: 배정된 지역(${instructorRegion})과 교육 지역(${education.region})이 일치하지 않습니다.`
      }
    }

    return { eligible: true }
  }

  /**
   * Check if monthly maximum sessions limit is exceeded
   * @param education Education to check
   * @returns Check result with reason if exceeded
   */
  const checkMonthlySessionLimit = (education: Education): { eligible: boolean; reason?: string } => {
    // Get monthly maximum sessions limit from instructor profile (default: 50)
    const monthlyMaxSessions = (userProfile as any)?.monthlyMaxSessions || 50

    // Get all assignments for current instructor
    const allAssignments = dataStore.getInstructorAssignments()
    const instructorAssignments = allAssignments.filter(assignment => {
      if (!assignment.lessons || assignment.lessons.length === 0) {
        return false
      }

      return assignment.lessons.some(lesson => {
        const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
        const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
        
        return mainInstructors.some(inst => inst.name === currentInstructorName) ||
               assistantInstructors.some(inst => inst.name === currentInstructorName)
      })
    })

    // Calculate sessions per month from existing assignments
    const monthlySessions: Record<string, number> = {}

    // Count sessions from existing assignments
    instructorAssignments.forEach(assignment => {
      if (!assignment.lessons) return

      assignment.lessons.forEach(lesson => {
        if (!lesson.date) return

        // Handle different date formats (YYYY.MM.DD or YYYY-MM-DD)
        const normalizedDate = lesson.date.replace(/\./g, '-')
        const lessonDate = dayjs(normalizedDate)
        if (!lessonDate.isValid()) return
        
        const monthKey = lessonDate.format('YYYY-MM')
        
        // Check if instructor is assigned to this lesson
        const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
        const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
        
        const isAssigned = mainInstructors.some(inst => inst.name === currentInstructorName) ||
                          assistantInstructors.some(inst => inst.name === currentInstructorName)

        if (isAssigned) {
          monthlySessions[monthKey] = (monthlySessions[monthKey] || 0) + 1
        }
      })
    })

    // Count sessions from new education
    if (education.lessons && education.lessons.length > 0) {
      education.lessons.forEach(lesson => {
        if (!lesson.date) return

        // Handle different date formats (YYYY.MM.DD or YYYY-MM-DD)
        const normalizedDate = lesson.date.replace(/\./g, '-')
        const lessonDate = dayjs(normalizedDate)
        if (!lessonDate.isValid()) return
        
        const monthKey = lessonDate.format('YYYY-MM')
        monthlySessions[monthKey] = (monthlySessions[monthKey] || 0) + 1
      })
    } else if (education.totalSessions) {
      // If lessons are not defined but totalSessions is, distribute across period
      if (education.periodStart && education.periodEnd) {
        const startDate = dayjs(education.periodStart)
        const endDate = dayjs(education.periodEnd)
        const months = new Set<string>()
        
        let currentDate = startDate
        while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
          months.add(currentDate.format('YYYY-MM'))
          currentDate = currentDate.add(1, 'month')
        }

        const sessionsPerMonth = Math.ceil(education.totalSessions / months.size)
        months.forEach(month => {
          monthlySessions[month] = (monthlySessions[month] || 0) + sessionsPerMonth
        })
      }
    }

    // Check if any month exceeds the limit
    for (const [month, sessions] of Object.entries(monthlySessions)) {
      if (sessions > monthlyMaxSessions) {
        return {
          eligible: false,
          reason: `월 허용 최대차시 초과: ${month}월에 ${sessions}차시가 배정되어 월 허용 최대차시(${monthlyMaxSessions}차시)를 초과합니다.`
        }
      }
    }

    return { eligible: true }
  }

  /**
   * Check if someone else applied earlier for the same role
   * @param education Education to check
   * @param role Role to check (주강사 or 보조강사)
   * @returns Check result with reason if someone applied earlier
   */
  const checkEarlierApplication = (
    education: Education,
    role: '주강사' | '보조강사'
  ): { eligible: boolean; reason?: string } => {
    // Get all applications for this education
    const allApplications = dataStore.getInstructorApplications()
    const educationApplications = allApplications.filter(
      app => app.educationId === education.educationId && app.role === role
    )

    // Check if there are applications from other instructors
    const otherApplications = educationApplications.filter(
      app => app.instructorName !== currentInstructorName
    )

    if (otherApplications.length > 0) {
      // Sort by application date to find the earliest
      const sortedApplications = otherApplications.sort((a, b) => {
        const dateA = dayjs(a.applicationDate, 'YYYY.MM.DD')
        const dateB = dayjs(b.applicationDate, 'YYYY.MM.DD')
        return dateA.isBefore(dateB) ? -1 : 1
      })

      const earliestApplication = sortedApplications[0]
      return {
        eligible: false,
        reason: `선착순 제한: "${earliestApplication.instructorName}"님이 ${earliestApplication.applicationDate}에 먼저 신청하셨습니다.`
      }
    }

    return { eligible: true }
  }

  const canApply = (
    education: Education,
    role?: '주강사' | '보조강사'
  ): { canApply: boolean; reason?: string } => {
    const now = dayjs()
    
    // 1. Check status - Only 강사공개/OPEN/신청 중 status allows applications
    const isStatusOpen = education.status === '강사공개' || 
                        education.status === '신청 중' ||
                        education.educationStatus === 'OPEN' ||
                        education.educationStatus === '신청 중'
    
    if (!isStatusOpen) {
      return { 
        canApply: false, 
        reason: `상태 불일치: 교육 상태가 "강사공개" 또는 "신청 중"이 아닙니다. (현재 상태: ${education.status || education.educationStatus || '미설정'})` 
      }
    }
    
    // Exclude if explicitly closed
    if (education.status === '신청 마감' || education.educationStatus === '신청 마감') {
      return { 
        canApply: false, 
        reason: `교육 마감: 교육이 마감되었습니다.` 
      }
    }
    
    // 2. Check if deadline passed
    if (education.applicationDeadline) {
      const deadline = dayjs(education.applicationDeadline)
      if (now.isAfter(deadline)) {
        return { 
          canApply: false, 
          reason: `신청 마감: 신청 마감일(${education.applicationDeadline})이 지났습니다.` 
        }
      }
    }
    
    // 3. Check if educationStatus is 마감
    if (education.educationStatus === '신청 마감') {
      return { 
        canApply: false, 
        reason: `교육 마감: 교육이 마감되었습니다.` 
      }
    }

    // 4. Check assignment zone rule (부분 규칙 배정)
    const zoneCheck = checkAssignmentZone(education)
    if (!zoneCheck.eligible) {
      return {
        canApply: false,
        reason: zoneCheck.reason
      }
    }

    // 5-7. Use comprehensive validation (monthly limit, schedule conflict, daily limit)
    if (role) {
      const roleType: 'main' | 'assistant' = role === '주강사' ? 'main' : 'assistant'
      const validationResult = validateInstructorAssignment(
        currentInstructor,
        education,
        roleType,
        {
          monthlyCapacity: getDefaultMonthlyCapacity(),
          dailyLimit: {
            globalDefault: getGlobalDailyLimit(),
          },
        }
      )

      if (!validationResult.valid) {
        return {
          canApply: false,
          reason: validationResult.reason
        }
      }
    }

    // 8. Check if someone else applied earlier (only if role is specified)
    if (role) {
      const earlierApplicationCheck = checkEarlierApplication(education, role)
      if (!earlierApplicationCheck.eligible) {
        return {
          canApply: false,
          reason: earlierApplicationCheck.reason
        }
      }
    }
    
    return { canApply: true }
  }

  const handleApply = (education: Education, role: '주강사' | '보조강사') => {
    const check = canApply(education, role)
    if (!check.canApply) {
      message.warning(check.reason)
      return
    }

    Modal.confirm({
      title: '출강 신청 확인',
      content: `${education.name}에 ${role}로 신청하시겠습니까?`,
      onOk: async () => {
        try {
          // TODO: Replace with actual API call
          // await instructorService.applyToEducation(education.educationId, role)
          
          // Create application
          const newApplication: InstructorApplication = {
            key: `app-${Date.now()}`,
            educationId: education.educationId,
            educationName: education.name,
            institution: education.institution,
            region: education.region,
            gradeClass: education.gradeClass,
            role: role,
            instructorId: currentInstructor.id,
            instructorName: currentInstructorName,
            applicationDate: dayjs().format('YYYY.MM.DD'),
            status: '대기',
            educationStatus: education.educationStatus,
            applicationDeadline: education.applicationDeadline,
          }
          
          dataStore.addInstructorApplication(newApplication)
          
          message.success('신청이 완료되었습니다.')
          router.push('/instructor/apply/mine')
        } catch (error) {
          console.error('Failed to apply:', error)
          message.error('신청 처리 중 오류가 발생했습니다.')
        }
      },
    })
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = dayjs(deadline)
    const now = dayjs()
    const days = deadlineDate.diff(now, 'day')
    if (days < 0) return '마감됨'
    if (days === 0) return '오늘 마감'
    return `D-${days}`
  }

  // Get user's applications to check if already applied
  const [userApplications, setUserApplications] = useState<InstructorApplication[]>(() => {
    return dataStore.getInstructorApplications().filter(
      app => app.instructorName === currentInstructorName
    )
  })

  // Refresh user applications when data changes
  useEffect(() => {
    const refreshApplications = () => {
      setUserApplications(
        dataStore.getInstructorApplications().filter(
          app => app.instructorName === currentInstructorName
        )
      )
    }
    refreshApplications()
    
    // Refresh every 5 seconds
    const interval = setInterval(refreshApplications, 5000)
    return () => clearInterval(interval)
  }, [currentInstructorName])

  // Check if user already applied to an education
  const getUserApplication = (educationId: string, role: '주강사' | '보조강사') => {
    return userApplications.find(
      app => app.educationId === educationId && app.role === role
    )
  }

  const allCount = openEducations.length + closedEducations.length

  // Table columns for open educations
  const openColumns: ColumnsType<Education> = [
    {
      title: '교육기관명',
      dataIndex: 'institution',
      key: 'institution',
      width: 200,
    },
    {
      title: '학년-반',
      dataIndex: 'gradeClass',
      key: 'gradeClass',
      width: 100,
    },
    {
      title: '교육명',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: '지역',
      dataIndex: 'region',
      key: 'region',
      width: 100,
    },
    {
      title: '기간',
      key: 'period',
      width: 200,
      render: (_, record) => {
        return `${record.periodStart || ''} - ${record.periodEnd || ''}`
      },
    },
    {
      title: '선택',
      key: 'action',
      width: 300,
      render: (_, record) => {
        const mainApplication = getUserApplication(record.educationId, '주강사')
        const assistantApplication = getUserApplication(record.educationId, '보조강사')
        const applyCheckMain = canApply(record, '주강사')
        const applyCheckAssistant = canApply(record, '보조강사')

        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {/* 주강사 */}
            {mainApplication ? (
              <Space>
                <Checkbox checked={mainApplication.status === '수락됨'} disabled>
                  주강사
                </Checkbox>
                <Button
                  size="small"
                  type={mainApplication.status === '수락됨' ? 'default' : 'primary'}
                  danger={mainApplication.status !== '수락됨'}
                >
                  {mainApplication.status === '수락됨' ? '확정' : '미확정'}
                </Button>
              </Space>
            ) : (
              <Tooltip title={!applyCheckMain.canApply ? applyCheckMain.reason : ''}>
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                  disabled={!applyCheckMain.canApply}
                  onClick={() => handleApply(record, '주강사')}
                  style={{ backgroundColor: applyCheckMain.canApply ? '#52c41a' : undefined }}
                >
                  주강사 신청완료
                </Button>
              </Tooltip>
            )}

            {/* 보조강사 */}
            {assistantApplication ? (
              <Space>
                <Checkbox checked={assistantApplication.status === '수락됨'} disabled>
                  보조교사
                </Checkbox>
                <Button
                  size="small"
                  type={assistantApplication.status === '수락됨' ? 'default' : 'primary'}
                  danger={assistantApplication.status !== '수락됨'}
                >
                  {assistantApplication.status === '수락됨' ? '확정' : '미확정'}
                </Button>
              </Space>
            ) : (
              <Tooltip title={!applyCheckAssistant.canApply ? applyCheckAssistant.reason : ''}>
                <Button
                  size="small"
                  disabled={!applyCheckAssistant.canApply}
                  onClick={() => handleApply(record, '보조강사')}
                  style={{ 
                    backgroundColor: '#f5f5f5',
                    borderColor: '#d9d9d9',
                    color: '#595959',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#ff4d4f',
                    color: 'white',
                    fontSize: '12px',
                    lineHeight: '1'
                  }}>−</span>
                  보조교사
                </Button>
              </Tooltip>
            )}
          </Space>
        )
      },
    },
    {
      title: '교육ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120,
    },
  ]

  // Table columns for closed educations
  const closedColumns: ColumnsType<Education> = [
    {
      title: '교육기관명',
      dataIndex: 'institution',
      key: 'institution',
      width: 200,
    },
    {
      title: '학년-반',
      dataIndex: 'gradeClass',
      key: 'gradeClass',
      width: 100,
    },
    {
      title: '교육명',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: '지역',
      dataIndex: 'region',
      key: 'region',
      width: 100,
    },
    {
      title: '기간',
      key: 'period',
      width: 200,
      render: (_, record) => {
        return `${record.periodStart || ''} - ${record.periodEnd || ''}`
      },
    },
    {
      title: '선택',
      key: 'action',
      width: 300,
      render: (_, record) => {
        const mainApplication = getUserApplication(record.educationId, '주강사')
        const assistantApplication = getUserApplication(record.educationId, '보조강사')

        return (
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {/* 주강사 */}
            {mainApplication ? (
              <Space>
                <Checkbox checked={mainApplication.status === '수락됨'} disabled>
                  주강사
                </Checkbox>
                <Button
                  size="small"
                  type={mainApplication.status === '수락됨' ? 'default' : 'primary'}
                  danger={mainApplication.status !== '수락됨'}
                  disabled
                >
                  {mainApplication.status === '수락됨' ? '확정' : '미확정'}
                </Button>
              </Space>
            ) : (
              <Button
                type="primary"
                size="small"
                disabled
                style={{ backgroundColor: '#d9d9d9' }}
              >
                주강사 신청
              </Button>
            )}

            {/* 보조강사 */}
            {assistantApplication ? (
              <Space>
                <Checkbox checked={assistantApplication.status === '수락됨'} disabled>
                  보조교사
                </Checkbox>
                <Button
                  size="small"
                  type={assistantApplication.status === '수락됨' ? 'default' : 'primary'}
                  danger={assistantApplication.status !== '수락됨'}
                  disabled
                >
                  {assistantApplication.status === '수락됨' ? '확정' : '미확정'}
                </Button>
              </Space>
            ) : (
              <Button
                size="small"
                disabled
                style={{ 
                  backgroundColor: '#f5f5f5',
                  borderColor: '#d9d9d9',
                  color: '#d9d9d9',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ 
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: '#ff4d4f',
                  color: 'white',
                  fontSize: '12px',
                  lineHeight: '1',
                  opacity: 0.5
                }}>−</span>
                보조교사
              </Button>
            )}
          </Space>
        )
      },
    },
    {
      title: '교육ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120,
    },
  ]

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              출강 신청하기
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              모집 중인 교육에 출강을 신청하세요.
            </p>
          </div>

          {/* Statistics Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체</div>
              <div className="text-3xl font-bold text-slate-600">{allCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">신청 가능</div>
              <div className="text-3xl font-bold text-blue-600">{openEducations.length}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">마감</div>
              <div className="text-3xl font-bold text-gray-600">{closedEducations.length}</div>
            </Card>
          </div>

          {/* Tabs */}
          <Card className="rounded-xl mb-6">
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as 'open' | 'closed')}
              items={[
                {
                  key: 'open',
                  label: `신청 가능 (${openEducations.length})`,
                },
                {
                  key: 'closed',
                  label: `마감 (${closedEducations.length})`,
                },
              ]}
            />
          </Card>

          {/* Education Table */}
          <Card className="rounded-xl">
            {activeTab === 'open' ? (
              openEducations.length > 0 ? (
                <Table
                  columns={openColumns}
                  dataSource={openEducations}
                  rowKey="key"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `총 ${total}개`,
                  }}
                  scroll={{ x: 1200 }}
                />
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">신청 가능한 교육이 없습니다.</p>
                </div>
              )
            ) : (
              closedEducations.length > 0 ? (
                <Table
                  columns={closedColumns}
                  dataSource={closedEducations}
                  rowKey="key"
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showTotal: (total) => `총 ${total}개`,
                  }}
                  scroll={{ x: 1200 }}
                />
              ) : (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">마감된 교육이 없습니다.</p>
                </div>
              )
            )}
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}



