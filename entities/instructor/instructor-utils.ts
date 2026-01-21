/**
 * Instructor Utility Functions
 * Helper functions for instructor data mapping and conversion
 */

import type { Education, InstructorAssignment, Instructor } from '@/lib/dataStore'
import { dataStore } from '@/lib/dataStore'
import dayjs from 'dayjs'
import type { InstructorCourse, InstructorCalendarEvent } from '@/mock/instructorDashboardData'

/**
 * Get instructor ID from name (helper function)
 * TODO: Replace with actual instructor lookup from API
 */
export function getInstructorIdByName(instructorName: string): string {
  // For now, use a simple mapping
  // In production, this should query instructor data by name
  return `instructor-${instructorName}`
}

/**
 * Get instructor data by ID
 * TODO: Replace with actual API call
 */
export function getInstructorById(instructorId: string): Instructor | null {
  // Mock implementation - in production, fetch from API
  // For now, return a default instructor structure
  return {
    id: instructorId,
    name: instructorId.replace('instructor-', ''),
    monthlyLeadMaxSessions: 20,
    monthlyAssistantMaxSessions: 30,
    dailyEducationLimit: null,
  }
}

/**
 * Get instructor data by name
 * TODO: Replace with actual API call
 */
export function getInstructorByName(instructorName: string): Instructor | null {
  const instructorId = getInstructorIdByName(instructorName)
  return getInstructorById(instructorId)
}

/**
 * Check if instructor is assigned to an education
 */
export function isInstructorAssignedToEducation(
  instructorId: string,
  instructorName: string,
  educationId: string
): boolean {
  const assignments = dataStore.getInstructorAssignments()
  const assignment = assignments.find(a => a.educationId === educationId)
  
  if (!assignment || !assignment.lessons) {
    return false
  }

  return assignment.lessons.some(lesson => {
    const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
    const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
    
    return mainInstructors.some(inst => inst.id === instructorId || inst.name === instructorName) ||
           assistantInstructors.some(inst => inst.id === instructorId || inst.name === instructorName)
  })
}

/**
 * Convert Education + Assignment to InstructorCourse
 */
export function educationToInstructorCourse(
  education: Education,
  assignment: InstructorAssignment | null,
  instructorId: string,
  instructorName: string
): InstructorCourse | null {
  // Only include if instructor is assigned
  if (!assignment) {
    return null
  }

  // Check if instructor is actually assigned
  if (!isInstructorAssignedToEducation(instructorId, instructorName, education.educationId)) {
    return null
  }

  // Determine status based on dates
  const now = dayjs()
  const startDate = education.periodStart ? dayjs(education.periodStart) : null
  const endDate = education.periodEnd ? dayjs(education.periodEnd) : null

  let status: '예정' | '진행중' | '완료' = '예정'
  if (startDate && endDate) {
    if (now.isBefore(startDate)) {
      status = '예정'
    } else if (now.isAfter(endDate)) {
      status = '완료'
    } else {
      status = '진행중'
    }
  } else if (endDate && now.isAfter(endDate)) {
    status = '완료'
  } else if (startDate && now.isAfter(startDate)) {
    status = '진행중'
  }

  // Get time range from first lesson
  let timeRange = ''
  if (assignment.lessons && assignment.lessons.length > 0) {
    const firstLesson = assignment.lessons[0]
    timeRange = `${firstLesson.startTime}~${firstLesson.endTime}`
  }

  return {
    id: education.educationId,
    educationName: education.name,
    institutionName: education.institution,
    startDate: education.periodStart || '',
    endDate: education.periodEnd || '',
    status,
    educationStatus: education.educationStatus || education.status,
    region: education.region,
    classInfo: education.gradeClass,
    timeRange,
  }
}

/**
 * Get all courses for an instructor from actual data
 */
export function getInstructorCoursesFromData(
  instructorId: string,
  instructorName: string
): InstructorCourse[] {
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()

  const courses: InstructorCourse[] = []

  educations.forEach(education => {
    const assignment = assignments.find(a => a.educationId === education.educationId)
    if (!assignment) return

    const course = educationToInstructorCourse(education, assignment, instructorId, instructorName)
    if (course) {
      courses.push(course)
    }
  })

  return courses
}

/**
 * Convert Education + Assignment to InstructorCalendarEvent
 */
export function educationToCalendarEvents(
  education: Education,
  assignment: InstructorAssignment | null,
  instructorId: string,
  instructorName: string
): InstructorCalendarEvent[] {
  if (!assignment || !assignment.lessons) {
    return []
  }

  // Check if instructor is assigned
  if (!isInstructorAssignedToEducation(instructorId, instructorName, education.educationId)) {
    return []
  }

  const events: InstructorCalendarEvent[] = []

  assignment.lessons.forEach(lesson => {
    // Determine status based on date
    const lessonDate = dayjs(lesson.date)
    const now = dayjs()
    let status: '예정' | '진행중' | '완료' = '예정'
    
    if (lessonDate.isBefore(now, 'day')) {
      status = '완료'
    } else if (lessonDate.isSame(now, 'day')) {
      status = '진행중'
    } else {
      status = '예정'
    }

    events.push({
      date: lessonDate.format('YYYY-MM-DD'),
      title: education.name,
      status,
      timeRange: `${lesson.startTime}~${lesson.endTime}`,
      institutionName: education.institution,
      classInfo: education.gradeClass,
      educationId: education.educationId,
    })
  })

  return events
}

/**
 * Get all calendar events for an instructor from actual data
 */
export function getInstructorCalendarEventsFromData(
  instructorId: string,
  instructorName: string
): InstructorCalendarEvent[] {
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()

  const events: InstructorCalendarEvent[] = []

  educations.forEach(education => {
    const assignment = assignments.find(a => a.educationId === education.educationId)
    if (!assignment) return

    const educationEvents = educationToCalendarEvents(education, assignment, instructorId, instructorName)
    events.push(...educationEvents)
  })

  // Sort by date
  events.sort((a, b) => {
    const dateA = dayjs(a.date)
    const dateB = dayjs(b.date)
    return dateA.isBefore(dateB) ? -1 : dateA.isAfter(dateB) ? 1 : 0
  })

  return events
}
