/**
 * Education utility functions
 * Helper functions for education data manipulation and mapping
 */

import { dataStore, type Education } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'
import type { EducationStatusItem } from '@/components/admin/operations/EducationStatusTable'

/**
 * Map instructor assignments to education status items
 * Extracts main and assistant instructor names from assignments
 */
export function mapInstructorNamesToEducationItem(
  education: Education,
  assignments: InstructorAssignment[]
): {
  mainInstructorNames: string[]
  assistantInstructorNames: string[]
} {
  const assignment = assignments.find(a => a.educationId === education.educationId)
  
  if (!assignment || !assignment.lessons) {
    return {
      mainInstructorNames: [],
      assistantInstructorNames: [],
    }
  }

  const mainInstructorSet = new Set<string>()
  const assistantInstructorSet = new Set<string>()

  assignment.lessons.forEach(lesson => {
    const mainInstructors = Array.isArray(lesson.mainInstructors)
      ? lesson.mainInstructors
      : []
    const assistantInstructors = Array.isArray(lesson.assistantInstructors)
      ? lesson.assistantInstructors
      : []

    mainInstructors.forEach(inst => {
      if (inst.name) {
        mainInstructorSet.add(inst.name)
      }
    })

    assistantInstructors.forEach(inst => {
      if (inst.name) {
        assistantInstructorSet.add(inst.name)
      }
    })
  })

  return {
    mainInstructorNames: Array.from(mainInstructorSet),
    assistantInstructorNames: Array.from(assistantInstructorSet),
  }
}

/**
 * Convert Education to EducationStatusItem
 * Includes instructor name mapping
 */
export function educationToStatusItem(
  education: Education,
  assignments: InstructorAssignment[]
): EducationStatusItem {
  const instructorNames = mapInstructorNamesToEducationItem(education, assignments)
  
  return {
    key: education.key,
    status: education.status || education.educationStatus || '대기',
    educationId: education.educationId,
    name: education.name,
    institution: education.institution,
    gradeClass: education.gradeClass,
    mainInstructorsCount: instructorNames.mainInstructorNames.length,
    mainInstructorsRequired: 1, // TODO: Get from assignment
    assistantInstructorsCount: instructorNames.assistantInstructorNames.length,
    assistantInstructorsRequired: 1, // TODO: Get from assignment
    mainInstructorNames: instructorNames.mainInstructorNames,
    assistantInstructorNames: instructorNames.assistantInstructorNames,
    periodStart: education.periodStart,
    periodEnd: education.periodEnd,
    period: education.period,
    openAt: education.openAt,
    closeAt: education.closeAt,
  }
}

/**
 * Bulk update education statuses
 * Allows mixed statuses to be updated to a single new status
 */
export function bulkUpdateEducationStatuses(
  educationIds: string[],
  newStatus: string
): void {
  const affectedIds: string[] = []

  educationIds.forEach(educationId => {
    const education = dataStore.getEducationById(educationId)
    if (education) {
      dataStore.updateEducation(educationId, { status: newStatus })
      affectedIds.push(educationId)
    }
  })

  // Dispatch event for bulk status updates
  if (affectedIds.length > 0) {
    window.dispatchEvent(
      new CustomEvent('educationStatusUpdated', {
        detail: { educationIds: affectedIds },
      })
    )
  }
}

/**
 * Get default region assignment mode
 * Returns 'PARTIAL' if not set
 */
export function getRegionAssignmentMode(education: Education): 'PARTIAL' | 'FULL' {
  return education.regionAssignmentMode || 'PARTIAL'
}
