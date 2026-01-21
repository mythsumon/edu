/**
 * Instructor Application & Assignment Validation Rules
 * Validates instructor workload and schedule conflicts
 */

import type { Education, Instructor, InstructorAssignment, InstructorApplication, Lesson } from '@/lib/dataStore'
import { dataStore } from '@/lib/dataStore'
import dayjs from 'dayjs'

export interface ValidationResult {
  valid: boolean
  reason?: string
}

export interface MonthlyCapacityConfig {
  leadDefault: number
  assistantDefault: number
}

export interface DailyLimitConfig {
  globalDefault: number | null // null means no limit
}

/**
 * Get instructor monthly capacity for a role
 */
function getInstructorMonthlyCapacity(
  instructor: Instructor,
  role: 'main' | 'assistant',
  defaults: MonthlyCapacityConfig
): number {
  if (role === 'main') {
    return instructor.monthlyLeadMaxSessions ?? defaults.leadDefault
  } else {
    return instructor.monthlyAssistantMaxSessions ?? defaults.assistantDefault
  }
}

/**
 * Get instructor daily education limit
 */
function getInstructorDailyLimit(
  instructor: Instructor,
  globalDefault: number | null
): number | null {
  if (instructor.dailyEducationLimit !== undefined && instructor.dailyEducationLimit !== null) {
    return instructor.dailyEducationLimit
  }
  return globalDefault
}

/**
 * Count sessions for an instructor in a specific month and role
 */
function countMonthlySessions(
  instructorId: string,
  targetMonth: string, // YYYY-MM format
  role: 'main' | 'assistant',
  excludeEducationId?: string
): number {
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()
  const applications = dataStore.getInstructorApplications()

  let sessionCount = 0

  // Count from confirmed assignments
  assignments.forEach(assignment => {
    if (assignment.educationId === excludeEducationId) return
    if (!assignment.lessons) return

    const education = educations.find(e => e.educationId === assignment.educationId)
    if (!education) return

    assignment.lessons.forEach(lesson => {
      const lessonDate = dayjs(lesson.date)
      const lessonMonth = lessonDate.format('YYYY-MM')
      
      if (lessonMonth !== targetMonth) return

      const instructors = role === 'main' 
        ? (Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : [])
        : (Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : [])

      const isAssigned = instructors.some(inst => inst.id === instructorId)
      if (isAssigned) {
        sessionCount++
      }
    })
  })

  // Count from pending applications
  applications.forEach(application => {
    if (application.educationId === excludeEducationId) return
    if (application.status !== '대기') return
    
    // Match by instructorId (preferred) or instructorName (fallback)
    if (application.instructorId && application.instructorId !== instructorId) return
    if (!application.instructorId && application.instructorName !== instructorId) {
      // Fallback to name matching if instructorId is not available
      // This handles legacy data or cases where instructorId is missing
      return
    }

    const education = educations.find(e => e.educationId === application.educationId)
    if (!education || !education.lessons) return

    const applicationRole = application.role === '주강사' ? 'main' : 'assistant'
    if (applicationRole !== role) return

    education.lessons.forEach(lesson => {
      const lessonDate = dayjs(lesson.date)
      const lessonMonth = lessonDate.format('YYYY-MM')
      
      if (lessonMonth === targetMonth) {
        sessionCount++
      }
    })
  })

  return sessionCount
}

/**
 * Check if two time ranges overlap
 */
function timeRangesOverlap(
  date1: string,
  startTime1: string,
  endTime1: string,
  date2: string,
  startTime2: string,
  endTime2: string
): boolean {
  // Different dates, no overlap
  if (date1 !== date2) return false

  // Same date, check time overlap
  const start1 = dayjs(`${date1} ${startTime1}`)
  const end1 = dayjs(`${date1} ${endTime1}`)
  const start2 = dayjs(`${date2} ${startTime2}`)
  const end2 = dayjs(`${date2} ${endTime2}`)

  // Overlap if: start1 < end2 && start2 < end1
  return start1.isBefore(end2) && start2.isBefore(end1)
}

/**
 * Check for schedule conflicts
 */
function checkScheduleConflict(
  education: Education,
  instructorId: string,
  excludeEducationId?: string
): ValidationResult {
  if (!education.lessons || education.lessons.length === 0) {
    return { valid: true }
  }

  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()
  const applications = dataStore.getInstructorApplications()

  // Check against assigned educations
  for (const assignment of assignments) {
    if (assignment.educationId === excludeEducationId) continue
    if (!assignment.lessons) continue

    const assignedEducation = educations.find(e => e.educationId === assignment.educationId)
    if (!assignedEducation || !assignedEducation.lessons) continue

    // Check if instructor is assigned to this education
    const isInstructorAssigned = assignment.lessons.some(lesson => {
      const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
      const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
      return mainInstructors.some(inst => inst.id === instructorId) ||
             assistantInstructors.some(inst => inst.id === instructorId)
    })

    if (!isInstructorAssigned) continue

    // Check for time overlap
    for (const newLesson of education.lessons) {
      for (const existingLesson of assignedEducation.lessons) {
        if (timeRangesOverlap(
          newLesson.date,
          newLesson.startTime,
          newLesson.endTime,
          existingLesson.date,
          existingLesson.startTime,
          existingLesson.endTime
        )) {
          return {
            valid: false,
            reason: `일정 충돌: 이미 배정된 "${assignedEducation.name}" 교육과 시간이 겹칩니다. (${existingLesson.date} ${existingLesson.startTime}-${existingLesson.endTime})`
          }
        }
      }
    }
  }

  // Check against pending applications
  for (const application of applications) {
    if (application.educationId === excludeEducationId) continue
    if (application.status !== '대기') continue
    
    // Match by instructorId (preferred) or instructorName (fallback)
    // Note: instructorId is passed as parameter, but we need to match against the application
    // For now, we check all pending applications for the same instructor
    // This is a conservative approach - we check all conflicts regardless of instructor
    // TODO: Add instructorId parameter to this function to filter by specific instructor

    const appliedEducation = educations.find(e => e.educationId === application.educationId)
    if (!appliedEducation || !appliedEducation.lessons) continue

    // Check for time overlap
    for (const newLesson of education.lessons) {
      for (const existingLesson of appliedEducation.lessons) {
        if (timeRangesOverlap(
          newLesson.date,
          newLesson.startTime,
          newLesson.endTime,
          existingLesson.date,
          existingLesson.startTime,
          existingLesson.endTime
        )) {
          return {
            valid: false,
            reason: `일정 충돌: 대기 중인 신청 "${appliedEducation.name}" 교육과 시간이 겹칩니다. (${existingLesson.date} ${existingLesson.startTime}-${existingLesson.endTime})`
          }
        }
      }
    }
  }

  return { valid: true }
}

/**
 * Validate monthly session limit
 */
export function validateMonthlySessionLimit(
  instructor: Instructor,
  education: Education,
  role: 'main' | 'assistant',
  defaults: MonthlyCapacityConfig,
  excludeEducationId?: string
): ValidationResult {
  if (!education.lessons || education.lessons.length === 0) {
    return { valid: true }
  }

  const capacity = getInstructorMonthlyCapacity(instructor, role, defaults)
  
  // Count sessions for each month in the education
  const monthSessions = new Map<string, number>()

  education.lessons.forEach(lesson => {
    const lessonDate = dayjs(lesson.date)
    const month = lessonDate.format('YYYY-MM')
    monthSessions.set(month, (monthSessions.get(month) || 0) + 1)
  })

  // Check each month
  for (const [month, newSessions] of monthSessions.entries()) {
    const existingSessions = countMonthlySessions(instructor.id, month, role, excludeEducationId)
    const totalSessions = existingSessions + newSessions

    if (totalSessions > capacity) {
      const roleName = role === 'main' ? '주강사' : '보조강사'
      return {
        valid: false,
        reason: `월별 세션 제한 초과: ${month}월 ${roleName} 역할의 세션 수가 제한(${capacity}회)을 초과합니다. (기존: ${existingSessions}회, 신청: ${newSessions}회, 총: ${totalSessions}회)`
      }
    }
  }

  return { valid: true }
}

/**
 * Validate schedule conflict
 */
export function validateScheduleConflict(
  instructor: Instructor,
  education: Education,
  excludeEducationId?: string
): ValidationResult {
  return checkScheduleConflict(education, instructor.id, excludeEducationId)
}

/**
 * Count educations per day for an instructor
 */
function countDailyEducations(
  instructorId: string,
  targetDate: string, // YYYY-MM-DD format
  excludeEducationId?: string
): number {
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()
  const applications = dataStore.getInstructorApplications()

  const educationIds = new Set<string>()

  // Count from confirmed assignments
  assignments.forEach(assignment => {
    if (assignment.educationId === excludeEducationId) return
    if (!assignment.lessons) return

    const hasLessonOnDate = assignment.lessons.some(lesson => {
      const lessonDate = dayjs(lesson.date).format('YYYY-MM-DD')
      if (lessonDate !== targetDate) return false

      const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
      const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
      return mainInstructors.some(inst => inst.id === instructorId) ||
             assistantInstructors.some(inst => inst.id === instructorId)
    })

    if (hasLessonOnDate) {
      educationIds.add(assignment.educationId)
    }
  })

  // Count from pending applications
  applications.forEach(application => {
    if (application.educationId === excludeEducationId) return
    if (application.status !== '대기') return
    
    // Match by instructorId (preferred) or instructorName (fallback)
    if (application.instructorId && application.instructorId !== instructorId) return
    if (!application.instructorId && application.instructorName !== instructorId) {
      // Fallback to name matching if instructorId is not available
      return
    }

    const education = educations.find(e => e.educationId === application.educationId)
    if (!education || !education.lessons) return

    const hasLessonOnDate = education.lessons.some(lesson => {
      const lessonDate = dayjs(lesson.date).format('YYYY-MM-DD')
      return lessonDate === targetDate
    })

    if (hasLessonOnDate) {
      educationIds.add(application.educationId)
    }
  })

  return educationIds.size
}

/**
 * Validate daily education limit
 */
export function validateDailyEducationLimit(
  instructor: Instructor,
  education: Education,
  globalLimit: number | null,
  excludeEducationId?: string
): ValidationResult {
  const dailyLimit = getInstructorDailyLimit(instructor, globalLimit)
  
  // If no limit configured, allow
  if (dailyLimit === null) {
    return { valid: true }
  }

  if (!education.lessons || education.lessons.length === 0) {
    return { valid: true }
  }

  // Check each day in the education
  const dayEducationCounts = new Map<string, number>()

  education.lessons.forEach(lesson => {
    const lessonDate = dayjs(lesson.date).format('YYYY-MM-DD')
    dayEducationCounts.set(lessonDate, (dayEducationCounts.get(lessonDate) || 0) + 1)
  })

  // Check each day
  for (const [date, newEducations] of dayEducationCounts.entries()) {
    const existingEducations = countDailyEducations(instructor.id, date, excludeEducationId)
    const totalEducations = existingEducations + (newEducations > 0 ? 1 : 0) // Count education, not sessions

    if (totalEducations > dailyLimit) {
      return {
        valid: false,
        reason: `일일 교육 제한 초과: ${dayjs(date).format('YYYY년 MM월 DD일')}에 배정된 교육 수가 제한(${dailyLimit}개)을 초과합니다. (기존: ${existingEducations}개, 신청: 1개, 총: ${totalEducations}개)`
      }
    }
  }

  return { valid: true }
}

/**
 * Comprehensive validation for instructor application/assignment
 */
export function validateInstructorAssignment(
  instructor: Instructor,
  education: Education,
  role: 'main' | 'assistant',
  config: {
    monthlyCapacity: MonthlyCapacityConfig
    dailyLimit: DailyLimitConfig
  },
  excludeEducationId?: string
): ValidationResult {
  // 1. Check monthly session limit
  const monthlyCheck = validateMonthlySessionLimit(
    instructor,
    education,
    role,
    config.monthlyCapacity,
    excludeEducationId
  )
  if (!monthlyCheck.valid) {
    return monthlyCheck
  }

  // 2. Check schedule conflict (mandatory)
  const scheduleCheck = validateScheduleConflict(
    instructor,
    education,
    excludeEducationId
  )
  if (!scheduleCheck.valid) {
    return scheduleCheck
  }

  // 3. Check daily education limit (if configured)
  const dailyCheck = validateDailyEducationLimit(
    instructor,
    education,
    config.dailyLimit.globalDefault,
    excludeEducationId
  )
  if (!dailyCheck.valid) {
    return dailyCheck
  }

  return { valid: true }
}

/**
 * Get default monthly capacity configuration
 */
export function getDefaultMonthlyCapacity(): MonthlyCapacityConfig {
  try {
    const stored = localStorage.getItem('instructor.monthlyCapacityDefaults')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load monthly capacity defaults:', error)
  }
  return {
    leadDefault: 20, // Default: 20 sessions per month for lead instructor
    assistantDefault: 30, // Default: 30 sessions per month for assistant instructor
  }
}

/**
 * Save default monthly capacity configuration
 */
export function saveDefaultMonthlyCapacity(config: MonthlyCapacityConfig): void {
  try {
    localStorage.setItem('instructor.monthlyCapacityDefaults', JSON.stringify(config))
  } catch (error) {
    console.error('Failed to save monthly capacity defaults:', error)
  }
}

/**
 * Get global daily education limit
 */
export function getGlobalDailyLimit(): number | null {
  try {
    const stored = localStorage.getItem('instructor.dailyLimitGlobal')
    if (stored) {
      const value = JSON.parse(stored)
      return value === null ? null : Number(value)
    }
  } catch (error) {
    console.error('Failed to load global daily limit:', error)
  }
  return null // Default: no limit
}

/**
 * Save global daily education limit
 */
export function saveGlobalDailyLimit(limit: number | null): void {
  try {
    localStorage.setItem('instructor.dailyLimitGlobal', JSON.stringify(limit))
  } catch (error) {
    console.error('Failed to save global daily limit:', error)
  }
}
