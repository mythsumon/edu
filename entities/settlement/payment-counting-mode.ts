/**
 * Payment Counting Mode Management
 * Handles the policy for which educations count toward payment calculation
 */

import type { PaymentCountingMode } from './settlement-types'
import type { Education } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'

export const DEFAULT_PAYMENT_COUNTING_MODE: PaymentCountingMode = 'ONLY_CONFIRMED_ENDED'

const STORAGE_KEY = 'settlement.paymentCountingMode'

/**
 * Get payment counting mode from localStorage
 */
export function getPaymentCountingMode(): PaymentCountingMode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'ONLY_CONFIRMED_ENDED' || stored === 'COUNT_IF_ASSIGNED') {
      return stored
    }
  } catch (error) {
    console.error('Failed to load payment counting mode:', error)
  }
  return DEFAULT_PAYMENT_COUNTING_MODE
}

/**
 * Save payment counting mode to localStorage
 */
export function setPaymentCountingMode(mode: PaymentCountingMode): void {
  try {
    localStorage.setItem(STORAGE_KEY, mode)
    window.dispatchEvent(new CustomEvent('settlementPolicyUpdated'))
  } catch (error) {
    console.error('Failed to save payment counting mode:', error)
  }
}

/**
 * Check if an education should count for payment based on the current mode
 * 
 * @param education - Education object
 * @param assignments - All instructor assignments
 * @param mode - Payment counting mode (optional, uses stored value if not provided)
 * @returns true if education should count for payment
 */
export function shouldCountForPayment(
  education: Education,
  assignments: InstructorAssignment[],
  mode?: PaymentCountingMode
): boolean {
  const countingMode = mode || getPaymentCountingMode()

  if (countingMode === 'COUNT_IF_ASSIGNED') {
    // Option B: Count if instructor is assigned, regardless of status
    const assignment = assignments.find(a => a.educationId === education.educationId)
    if (!assignment || !assignment.lessons) {
      return false
    }

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
    // Option A (ONLY_CONFIRMED_ENDED): Count only when status is CONFIRMED or ENDED
    const status = education.status || education.educationStatus || '대기'
    
    // Excluded statuses
    const excludedStatuses = ['대기', '오픈예정', '강사공개', '취소', 'WAITING', 'UPCOMING', 'OPEN_FOR_INSTRUCTORS', 'CANCELED']
    if (excludedStatuses.includes(status)) {
      return false
    }
    
    // Included statuses
    const includedStatuses = ['확정', '종료', 'CONFIRMED', 'ENDED']
    return includedStatuses.includes(status)
  }
}
