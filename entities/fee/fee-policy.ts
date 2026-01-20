/**
 * Instructor Fee Calculation Policy
 * Single source of truth for fee calculation logic
 */

import type { Education } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'

export type FeePolicy = 'STATUS_BASED' | 'ASSIGNMENT_BASED'

/**
 * Default policy: STATUS_BASED (Option 1)
 * Count fees only when status is CONFIRMED or COMPLETED
 */
export const DEFAULT_FEE_POLICY: FeePolicy = 'STATUS_BASED'

/**
 * Status values that should be excluded from fee calculation (Option 1)
 */
const EXCLUDED_STATUSES = ['대기', '오픈예정', '강사공개', '취소', 'PENDING', 'UPCOMING', 'OPEN_FOR_APPLICATION', 'CANCELED']

/**
 * Status values that should be included in fee calculation (Option 1)
 */
const INCLUDED_STATUSES = ['확정', '종료', 'CONFIRMED', 'COMPLETED']

/**
 * Check if an education should count instructor fees based on policy
 * 
 * @param education - Education object
 * @param assignments - All instructor assignments (for ASSIGNMENT_BASED policy)
 * @param policy - Fee calculation policy (default: STATUS_BASED)
 * @returns true if fees should be counted
 */
export function shouldCountInstructorFee(
  education: Education,
  assignments: InstructorAssignment[],
  policy: FeePolicy = DEFAULT_FEE_POLICY
): boolean {
  if (policy === 'ASSIGNMENT_BASED') {
    // Option 2: Count if instructor is assigned, regardless of status
    const assignment = assignments.find(a => a.educationId === education.educationId)
    if (!assignment || !assignment.lessons) return false

    return assignment.lessons.some(lesson => {
      const mainInstructors = Array.isArray(lesson.mainInstructors)
        ? lesson.mainInstructors
        : []
      const assistantInstructors = Array.isArray(lesson.assistantInstructors)
        ? lesson.assistantInstructors
        : []
      
      return mainInstructors.length > 0 || assistantInstructors.length > 0
    })
  } else {
    // Option 1 (STATUS_BASED): Count only when status is CONFIRMED or COMPLETED
    const status = education.status || education.educationStatus || '대기'
    
    // Check if status is excluded
    if (EXCLUDED_STATUSES.includes(status)) {
      return false
    }
    
    // Check if status is explicitly included
    if (INCLUDED_STATUSES.includes(status)) {
      return true
    }
    
    // Default: don't count if not explicitly included
    return false
  }
}

/**
 * Calculate fee contribution for a single education
 * 
 * @param education - Education object
 * @param assignments - All instructor assignments
 * @param policy - Fee calculation policy (default: STATUS_BASED)
 * @returns Fee amount (0 if not counted)
 */
export function getEducationFeeContribution(
  education: Education,
  assignments: InstructorAssignment[],
  policy: FeePolicy = DEFAULT_FEE_POLICY
): number {
  // First check if this education should count fees
  if (!shouldCountInstructorFee(education, assignments, policy)) {
    return 0
  }

  // Find assignment for this education
  const assignment = assignments.find(a => a.educationId === education.educationId)
  if (!assignment || !assignment.lessons) {
    return 0
  }

  let totalFee = 0

  assignment.lessons.forEach(lesson => {
    const mainInstructors = Array.isArray(lesson.mainInstructors)
      ? lesson.mainInstructors
      : []
    const assistantInstructors = Array.isArray(lesson.assistantInstructors)
      ? lesson.assistantInstructors
      : []

    // Main instructor fee: 50,000 per session (TODO: replace with actual rate)
    totalFee += mainInstructors.length * 50000

    // Assistant instructor fee: 30,000 per session (TODO: replace with actual rate)
    totalFee += assistantInstructors.length * 30000
  })

  return totalFee
}

/**
 * Calculate total fees for multiple educations
 * 
 * @param educations - Array of education objects
 * @param assignments - All instructor assignments
 * @param policy - Fee calculation policy (default: STATUS_BASED)
 * @returns Total fee amount
 */
export function calculateTotalFees(
  educations: Education[],
  assignments: InstructorAssignment[],
  policy: FeePolicy = DEFAULT_FEE_POLICY
): number {
  return educations.reduce((total, education) => {
    return total + getEducationFeeContribution(education, assignments, policy)
  }, 0)
}

/**
 * Get fee summary for educations
 * 
 * @param educations - Array of education objects
 * @param assignments - All instructor assignments
 * @param policy - Fee calculation policy (default: STATUS_BASED)
 * @returns Summary object with total fees and count
 */
export function getFeeSummary(
  educations: Education[],
  assignments: InstructorAssignment[],
  policy: FeePolicy = DEFAULT_FEE_POLICY
): {
  totalFees: number
  educationCount: number
  includedEducations: Education[]
} {
  const includedEducations = educations.filter(edu =>
    shouldCountInstructorFee(edu, assignments, policy)
  )

  return {
    totalFees: calculateTotalFees(includedEducations, assignments, policy),
    educationCount: includedEducations.length,
    includedEducations,
  }
}
