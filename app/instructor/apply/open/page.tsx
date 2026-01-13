'use client'

import { useState, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Badge, Modal, message, Tooltip, Tabs } from 'antd'
import { Calendar, MapPin, Users, Clock, UserCheck, UserPlus, AlertCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import dayjs from 'dayjs'
import { dataStore } from '@/lib/dataStore'
import type { Education, InstructorApplication, InstructorAssignment } from '@/lib/dataStore'
import { useAuth } from '@/contexts/AuthContext'

export default function ApplyForEducationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { userProfile } = useAuth()
  const educationIdParam = searchParams?.get('educationId') || null
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open')
  
  const allEducations = dataStore.getEducations()
  const currentInstructorName = userProfile?.name || '홍길동'
  
  // Get instructor's assignment zone (region) from profile
  // For now, we'll use a default or get from userProfile if available
  const instructorRegion = (userProfile as any)?.region || '서울시' // Default region, should be stored in userProfile
  
  // OPEN 상태의 교육 (신청 가능) - Only 강사공개 allows applications
  const openEducations = useMemo(() => {
    const now = dayjs()
    return allEducations.filter(education => {
      // Status must be 강사공개 (only this status allows instructor applications)
      if (education.status !== '강사공개') {
        return false
      }
      
      // Check if deadline passed
      if (education.applicationDeadline) {
        const deadline = dayjs(education.applicationDeadline)
        if (now.isAfter(deadline)) {
          return false // 마감일이 지난 것은 마감 탭으로
        }
      }
      
      // If educationId param exists, filter by it
      if (educationIdParam && education.educationId !== educationIdParam) {
        return false
      }
      
      return true
    })
  }, [allEducations, educationIdParam])
  
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
    
    // 1. Check status - Only 강사공개 status allows applications
    if (education.status !== '강사공개') {
      return { 
        canApply: false, 
        reason: `상태 불일치: 교육 상태가 "강사공개"가 아닙니다. (현재 상태: ${education.status || education.educationStatus || '미설정'})` 
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
    
    // 3. Check if status is 마감
    if (education.status === '신청마감' || education.educationStatus === '신청 마감') {
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

    // 5. Check for time conflicts with already assigned sessions
    const timeConflict = checkTimeConflict(education)
    if (timeConflict.hasConflict) {
      const conflictInfo = timeConflict.conflictingEducation
      const sessionInfo = timeConflict.conflictingSession
      return {
        canApply: false,
        reason: `시간 충돌: 이미 배정된 "${conflictInfo?.educationName}" 교육과 시간이 겹칩니다. (${sessionInfo?.date} ${sessionInfo?.time})`
      }
    }

    // 6. Check monthly maximum sessions limit
    const monthlyLimitCheck = checkMonthlySessionLimit(education)
    if (!monthlyLimitCheck.eligible) {
      return {
        canApply: false,
        reason: monthlyLimitCheck.reason
      }
    }

    // 7. Check if someone else applied earlier (only if role is specified)
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

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              출강 신청하기
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              모집 중인 교육에 출강을 신청하세요.
            </p>
          </div>

          {/* Tabs */}
          <Card className="mb-6">
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

          {/* Education Cards */}
          {activeTab === 'open' ? (
            openEducations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openEducations.map((education) => {
                // Check for both roles to show appropriate disabled state
                const applyCheckMain = canApply(education, '주강사')
                const applyCheckAssistant = canApply(education, '보조강사')
                const applyCheck = applyCheckMain.canApply && applyCheckAssistant.canApply
                  ? { canApply: true }
                  : { canApply: false, reason: applyCheckMain.reason || applyCheckAssistant.reason }
                
                return (
                  <Card
                    key={education.key}
                    className="hover:shadow-lg transition-shadow"
                    actions={[
                      <Tooltip
                        key="main"
                        title={!applyCheckMain.canApply ? applyCheckMain.reason : ''}
                      >
                        <Button
                          type="primary"
                          className="w-full"
                          icon={<UserCheck className="w-4 h-4" />}
                          disabled={!applyCheckMain.canApply}
                          onClick={() => handleApply(education, '주강사')}
                        >
                          주강사 신청
                        </Button>
                      </Tooltip>,
                      <Tooltip
                        key="assistant"
                        title={!applyCheckAssistant.canApply ? applyCheckAssistant.reason : ''}
                      >
                        <Button
                          type="default"
                          className="w-full"
                          icon={<UserPlus className="w-4 h-4" />}
                          disabled={!applyCheckAssistant.canApply}
                          onClick={() => handleApply(education, '보조강사')}
                        >
                          보조강사 신청
                        </Button>
                      </Tooltip>,
                    ]}
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {education.name}
                        </h3>
                        {education.applicationDeadline && (
                          <div className="flex items-center gap-2 mb-2">
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

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
                          <Users className="w-4 h-4" />
                          <span>{education.gradeClass}</span>
                        </div>
                      </div>

                      {(!applyCheckMain.canApply || !applyCheckAssistant.canApply) && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="space-y-1">
                            {!applyCheckMain.canApply && (
                              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="break-words">
                                  <strong>주강사:</strong> {applyCheckMain.reason}
                                </span>
                              </div>
                            )}
                            {!applyCheckAssistant.canApply && (
                              <div className="flex items-start gap-2 text-sm text-red-600 dark:text-red-400">
                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <span className="break-words">
                                  <strong>보조강사:</strong> {applyCheckAssistant.reason}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">신청 가능한 교육이 없습니다.</p>
              </Card>
            )
          ) : (
            // 마감된 교육 탭
            closedEducations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {closedEducations.map((education) => {
                  const applyCheckMain = canApply(education, '주강사')
                  const applyCheckAssistant = canApply(education, '보조강사')
                  const applyCheck = { canApply: false, reason: '신청이 마감되었습니다.' }
                  
                  return (
                    <Card
                      key={education.key}
                      className="hover:shadow-lg transition-shadow opacity-75"
                      actions={[
                        <Tooltip
                          key="main"
                          title={!applyCheck.canApply ? applyCheck.reason : ''}
                        >
                          <Button
                            type="primary"
                            className="w-full"
                            icon={<UserCheck className="w-4 h-4" />}
                            disabled={true}
                          >
                            주강사 신청
                          </Button>
                        </Tooltip>,
                        <Tooltip
                          key="assistant"
                          title={!applyCheck.canApply ? applyCheck.reason : ''}
                        >
                          <Button
                            type="default"
                            className="w-full"
                            icon={<UserPlus className="w-4 h-4" />}
                            disabled={true}
                          >
                            보조강사 신청
                          </Button>
                        </Tooltip>,
                      ]}
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {education.name}
                          </h3>
                          {education.applicationDeadline && (
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                status="error"
                                text="마감됨"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
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
                            <Users className="w-4 h-4" />
                            <span>{education.gradeClass}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>신청이 마감되었습니다.</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">마감된 교육이 없습니다.</p>
              </Card>
            )
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}



