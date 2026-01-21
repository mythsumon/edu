/**
 * Policy-based Instructor Application Validation
 * Uses policy resolution system with explicit error codes
 */

import type { Education, Instructor, InstructorApplication } from '@/lib/dataStore'
import { dataStore } from '@/lib/dataStore'
import { resolvePolicy } from '@/lib/policyStore'
import dayjs from 'dayjs'

export type ValidationErrorCode = 
  | 'LIMIT_MONTHLY_SESSIONS_EXCEEDED'
  | 'LIMIT_DAILY_APPLICATIONS_EXCEEDED'

export interface PolicyValidationResult {
  valid: boolean
  errorCode?: ValidationErrorCode
  reason?: string
  details?: {
    currentHours?: number
    maxHours?: number
    role?: 'main' | 'assistant'
    yearMonth?: string
    currentApplications?: number
    maxApplications?: number
    date?: string
    conflictingSession?: any
  }
}

/**
 * Calculate total session hours for an education
 */
function calculateEducationSessionHours(education: Education): number {
  if (!education.lessons || education.lessons.length === 0) {
    return 0
  }
  
  let totalHours = 0
  
  education.lessons.forEach(lesson => {
    const start = dayjs(`${lesson.date} ${lesson.startTime}`)
    const end = dayjs(`${lesson.date} ${lesson.endTime}`)
    const hours = end.diff(start, 'hour', true) // true = fractional hours
    totalHours += hours
  })
  
  return totalHours
}

/**
 * Get monthly session hours for an instructor
 * Includes: PENDING applications, ACCEPTED applications, ASSIGNED classes
 */
function getMonthlySessionHours(
  instructorId: string,
  role: 'main' | 'assistant',
  yearMonth: string, // 'YYYY-MM'
  statuses: ('PENDING' | 'ACCEPTED' | 'ASSIGNED')[] = ['PENDING', 'ACCEPTED', 'ASSIGNED']
): number {
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()
  const applications = dataStore.getInstructorApplications()
  
  let totalHours = 0
  
  // Count from assignments (ASSIGNED)
  if (statuses.includes('ASSIGNED')) {
    assignments.forEach(assignment => {
      if (!assignment.lessons) return
      
      const education = educations.find(e => e.educationId === assignment.educationId)
      if (!education) return
      
      assignment.lessons.forEach(lesson => {
        const lessonDate = dayjs(lesson.date)
        const lessonMonth = lessonDate.format('YYYY-MM')
        
        if (lessonMonth !== yearMonth) return
        
        const instructors = role === 'main' 
          ? (Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : [])
          : (Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : [])
        
        const isAssigned = instructors.some(inst => inst.id === instructorId)
        if (isAssigned) {
          const start = dayjs(`${lesson.date} ${lesson.startTime}`)
          const end = dayjs(`${lesson.date} ${lesson.endTime}`)
          const hours = end.diff(start, 'hour', true)
          totalHours += hours
        }
      })
    })
  }
  
  // Count from applications (PENDING, ACCEPTED)
  if (statuses.includes('PENDING') || statuses.includes('ACCEPTED')) {
    applications.forEach(application => {
      // Match by instructorId (preferred) or instructorName (fallback)
      if (application.instructorId && application.instructorId !== instructorId) return
      if (!application.instructorId && application.instructorName !== instructorId) return
      
      const applicationStatus = application.status === '수락됨' ? 'ACCEPTED' : 
                                application.status === '대기' ? 'PENDING' : 'REJECTED'
      
      if (!statuses.includes(applicationStatus as any)) return
      
      const applicationRole = application.role === '주강사' ? 'main' : 'assistant'
      if (applicationRole !== role) return
      
      const education = educations.find(e => e.educationId === application.educationId)
      if (!education || !education.lessons) return
      
      // Calculate hours for this education
      education.lessons.forEach(lesson => {
        const lessonDate = dayjs(lesson.date)
        const lessonMonth = lessonDate.format('YYYY-MM')
        
        if (lessonMonth === yearMonth) {
          const start = dayjs(`${lesson.date} ${lesson.startTime}`)
          const end = dayjs(`${lesson.date} ${lesson.endTime}`)
          const hours = end.diff(start, 'hour', true)
          totalHours += hours
        }
      })
    })
  }
  
  return totalHours
}

/**
 * Validate monthly session hours limit
 */
export function validateMonthlySessionHours(
  instructorId: string,
  trainingId: string,
  role: 'main' | 'assistant',
  sessionHours: number, // This application's total hours
  yearMonth: string // 'YYYY-MM'
): PolicyValidationResult {
  // 1. Resolve policy
  const policy = resolvePolicy(instructorId, trainingId, yearMonth)
  
  // 2. Get current monthly usage (PENDING + ACCEPTED + ASSIGNED)
  const currentHours = getMonthlySessionHours(
    instructorId,
    role,
    yearMonth,
    ['PENDING', 'ACCEPTED', 'ASSIGNED']
  )
  
  // 3. Calculate new total
  const newTotal = currentHours + sessionHours
  
  // 4. Get max hours for role
  const maxHours = role === 'main'
    ? policy.mainInstructorMonthlyMaxHours
    : policy.assistantInstructorMonthlyMaxHours
  
  // 5. Validate
  if (newTotal > maxHours) {
    const roleName = role === 'main' ? '주강사' : '보조강사'
    return {
      valid: false,
      errorCode: 'LIMIT_MONTHLY_SESSIONS_EXCEEDED',
      reason: `월별 시간 제한 초과: ${yearMonth}에 ${roleName} 역할의 시간(${newTotal.toFixed(1)}h)이 제한(${maxHours}h)을 초과합니다.`,
      details: {
        currentHours: currentHours,
        maxHours: maxHours,
        role: role,
        yearMonth: yearMonth
      }
    }
  }
  
  return { valid: true }
}

/**
 * Check if two time ranges overlap
 */
function hasTimeConflict(
  date1: string,
  startTime1: string,
  endTime1: string,
  date2: string,
  startTime2: string,
  endTime2: string
): boolean {
  if (date1 !== date2) return false
  
  const start1 = dayjs(`${date1} ${startTime1}`)
  const end1 = dayjs(`${date1} ${endTime1}`)
  const start2 = dayjs(`${date2} ${startTime2}`)
  const end2 = dayjs(`${date2} ${endTime2}`)
  
  return start1.isBefore(end2) && start2.isBefore(end1)
}

/**
 * Get daily applications for an instructor
 */
function getDailyApplications(
  instructorId: string,
  dateStr: string, // 'YYYY-MM-DD'
  statuses: ('PENDING' | 'ACCEPTED')[] = ['PENDING', 'ACCEPTED']
): Array<{ educationId: string; sessions: Array<{ date: string; startTime: string; endTime: string }> }> {
  const educations = dataStore.getEducations()
  const applications = dataStore.getInstructorApplications()
  
  const result: Array<{ educationId: string; sessions: Array<{ date: string; startTime: string; endTime: string }> }> = []
  
  applications.forEach(application => {
    // Match by instructorId (preferred) or instructorName (fallback)
    if (application.instructorId && application.instructorId !== instructorId) return
    if (!application.instructorId && application.instructorName !== instructorId) return
    
    const applicationStatus = application.status === '수락됨' ? 'ACCEPTED' : 
                              application.status === '대기' ? 'PENDING' : 'REJECTED'
    
    if (!statuses.includes(applicationStatus as any)) return
    
    const education = educations.find(e => e.educationId === application.educationId)
    if (!education || !education.lessons) return
    
    // Check if any lesson is on this date
    const sessionsOnDate = education.lessons
      .filter(lesson => dayjs(lesson.date).format('YYYY-MM-DD') === dateStr)
      .map(lesson => ({
        date: lesson.date,
        startTime: lesson.startTime,
        endTime: lesson.endTime
      }))
    
    if (sessionsOnDate.length > 0) {
      result.push({
        educationId: application.educationId,
        sessions: sessionsOnDate
      })
    }
  })
  
  return result
}

/**
 * Validate daily application limit
 */
export function validateDailyApplicationLimit(
  instructorId: string,
  trainingId: string,
  applicationDate: Date,
  sessionTimes: Array<{ date: string; startTime: string; endTime: string }> // This application's sessions
): PolicyValidationResult {
  // 1. Resolve policy
  const yearMonth = dayjs(applicationDate).format('YYYY-MM')
  const policy = resolvePolicy(instructorId, trainingId, yearMonth)
  
  // 2. Get current applications for this date
  const dateStr = dayjs(applicationDate).format('YYYY-MM-DD')
  const currentApplications = getDailyApplications(instructorId, dateStr, ['PENDING', 'ACCEPTED'])
  
  // 3. Check if multiple sessions per day is allowed
  if (!policy.allowMultipleSessionsPerDay) {
    // Only one application per day allowed
    if (currentApplications.length > 0) {
      return {
        valid: false,
        errorCode: 'LIMIT_DAILY_APPLICATIONS_EXCEEDED',
        reason: `일일 신청 제한: ${dateStr}에 이미 신청한 교육이 있습니다. 하루에 하나의 교육만 신청할 수 있습니다.`,
        details: {
          currentApplications: currentApplications.length,
          maxApplications: 1,
          date: dateStr
        }
      }
    }
  } else {
    // Multiple sessions allowed, but check count limit
    if (currentApplications.length >= policy.dailyMaxApplications) {
      return {
        valid: false,
        errorCode: 'LIMIT_DAILY_APPLICATIONS_EXCEEDED',
        reason: `일일 신청 제한 초과: ${dateStr}에 신청한 교육 수(${currentApplications.length})가 제한(${policy.dailyMaxApplications})을 초과합니다.`,
        details: {
          currentApplications: currentApplications.length,
          maxApplications: policy.dailyMaxApplications,
          date: dateStr
        }
      }
    }
    
    // Check time conflicts if multiple sessions allowed
    for (const newSession of sessionTimes) {
      for (const existingApp of currentApplications) {
        for (const existingSession of existingApp.sessions) {
          if (hasTimeConflict(
            newSession.date,
            newSession.startTime,
            newSession.endTime,
            existingSession.date,
            existingSession.startTime,
            existingSession.endTime
          )) {
            return {
              valid: false,
              errorCode: 'LIMIT_DAILY_APPLICATIONS_EXCEEDED',
              reason: `시간 충돌: ${dateStr}에 이미 신청한 교육과 시간이 겹칩니다.`,
              details: {
                date: dateStr,
                conflictingSession: newSession
              }
            }
          }
        }
      }
    }
  }
  
  return { valid: true }
}

/**
 * Comprehensive policy-based validation
 */
export function validateInstructorApplicationWithPolicy(
  instructorId: string,
  trainingId: string,
  role: 'main' | 'assistant',
  education: Education,
  applicationDate: Date
): PolicyValidationResult {
  // Calculate session hours for this education
  const sessionHours = calculateEducationSessionHours(education)
  
  // Get session times
  const sessionTimes = (education.lessons || []).map(lesson => ({
    date: lesson.date,
    startTime: lesson.startTime,
    endTime: lesson.endTime
  }))
  
  // Get year-month for monthly validation
  const yearMonth = dayjs(applicationDate).format('YYYY-MM')
  
  // 1. Validate monthly session hours
  const monthlyValidation = validateMonthlySessionHours(
    instructorId,
    trainingId,
    role,
    sessionHours,
    yearMonth
  )
  
  if (!monthlyValidation.valid) {
    return monthlyValidation
  }
  
  // 2. Validate daily application limit
  const dailyValidation = validateDailyApplicationLimit(
    instructorId,
    trainingId,
    applicationDate,
    sessionTimes
  )
  
  if (!dailyValidation.valid) {
    return dailyValidation
  }
  
  return { valid: true }
}
