/**
 * Travel Expense Settlement Store
 * Manages settlement data in localStorage with event-based sync
 */

import type { TravelSettlementRow, InstitutionCategory, PaymentCountingMode } from './settlement-types'
import type { Education } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'
import { dataStore } from '@/lib/dataStore'
import { defaultDistanceProvider } from './distance-provider'
import { computeTravelExpense, getTravelExpensePolicy } from './travel-expense-calculator'
import { computeAllowance, getAllowancePolicy } from './allowance-calculator'
import { shouldCountForPayment, getPaymentCountingMode } from './payment-counting-mode'

const STORAGE_KEY = 'settlements.travel.v1'

/**
 * Get all settlement rows from localStorage
 */
export function getSettlementRows(): TravelSettlementRow[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load settlement rows:', error)
  }
  return []
}

/**
 * Save settlement rows to localStorage
 */
function saveSettlementRows(rows: TravelSettlementRow[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
    window.dispatchEvent(new CustomEvent('settlementUpdated', { detail: { rows } }))
  } catch (error) {
    console.error('Failed to save settlement rows:', error)
  }
}

/**
 * Generate a unique ID for a settlement row
 */
function generateSettlementId(
  educationId: string,
  instructorId: string,
  role: 'main' | 'assistant'
): string {
  return `${educationId}_${instructorId}_${role}`
}

/**
 * Get or create instructor data (mock for now)
 * TODO: Replace with actual instructor data from dataStore or API
 */
function getInstructorData(instructorId: string): {
  id: string
  name: string
  homeAddressText?: string
  homeLat?: number
  homeLng?: number
} {
  // Mock instructor data - in real implementation, fetch from dataStore or API
  // For now, return mock data
  return {
    id: instructorId,
    name: `강사-${instructorId}`,
    homeAddressText: '서울시 강남구 테헤란로 123',
    homeLat: 37.5013,
    homeLng: 127.0396,
  }
}

/**
 * Get or create institution data (mock for now)
 * TODO: Replace with actual institution data from dataStore or API
 */
function getInstitutionData(institutionName: string): {
  name: string
  schoolAddressText?: string
  schoolLat?: number
  schoolLng?: number
  category: InstitutionCategory
} {
  // Mock institution data - in real implementation, fetch from dataStore or API
  // For now, return mock data with default category
  return {
    name: institutionName,
    schoolAddressText: `${institutionName} 주소`,
    schoolLat: 37.5665,
    schoolLng: 126.9780,
    category: 'GENERAL' as InstitutionCategory,
  }
}

/**
 * Compute settlement row for a single instructor-education pair
 */
function computeSettlementRow(
  education: Education,
  assignment: InstructorAssignment,
  instructorId: string,
  instructorName: string,
  role: 'main' | 'assistant',
  countingMode: PaymentCountingMode
): TravelSettlementRow | null {
  const instructor = getInstructorData(instructorId)
  const institution = getInstitutionData(education.institution)

  // Calculate distance
  const distanceKm = defaultDistanceProvider.getDistanceKm(
    instructor.homeLat,
    instructor.homeLng,
    institution.schoolLat,
    institution.schoolLng,
    instructor.homeAddressText,
    institution.schoolAddressText
  )

  // If distance is 0 and we have addresses, mark as needing manual entry
  const distanceSource = distanceKm > 0 ? 'haversine' : 'manual'

  // Calculate travel expense
  const travelExpensePolicy = getTravelExpensePolicy()
  const travelExpense = computeTravelExpense(distanceKm, travelExpensePolicy)

  // Calculate allowance
  const totalSessions = education.totalSessions || assignment.lessons?.length || 0
  const allowancePolicy = getAllowancePolicy()
  const allowance = computeAllowance(
    totalSessions,
    role,
    institution.category,
    allowancePolicy
  )

  // Check if counting eligible
  const isCountingEligible = shouldCountForPayment(education, [assignment], countingMode)

  const now = new Date().toISOString()

  return {
    id: generateSettlementId(education.educationId, instructorId, role),
    educationId: education.educationId,
    educationName: education.name,
    institutionId: '', // TODO: Get from education or institution data
    institutionName: education.institution,
    institutionCategory: institution.category,
    periodStart: education.periodStart || '',
    periodEnd: education.periodEnd || '',
    totalSessions,
    instructorId,
    instructorName,
    role,
    instructorHomeAddress: instructor.homeAddressText,
    institutionAddress: institution.schoolAddressText,
    distanceKm,
    distanceSource,
    travelExpense,
    allowanceBase: allowance.base,
    allowanceBonus: allowance.bonus,
    allowanceTotal: allowance.total,
    totalPay: travelExpense + allowance.total,
    educationStatus: education.status || education.educationStatus || '대기',
    isCountingEligible,
    computedAt: now,
    updatedAt: now,
  }
}

/**
 * Recompute all settlement rows
 * Called when educations, assignments, or policies change
 */
export function recomputeSettlements(): void {
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()
  const countingMode = getPaymentCountingMode()

  const rows: TravelSettlementRow[] = []

  // Process each education with assignments
  educations.forEach(education => {
    const assignment = assignments.find(a => a.educationId === education.educationId)
    if (!assignment || !assignment.lessons) {
      return
    }

    // Collect unique instructors by role from all lessons
    const mainInstructors = new Map<string, string>() // instructorId -> name
    const assistantInstructors = new Map<string, string>()

    assignment.lessons.forEach(lesson => {
      const mainInstructorsList = Array.isArray(lesson.mainInstructors)
        ? lesson.mainInstructors
        : []
      const assistantInstructorsList = Array.isArray(lesson.assistantInstructors)
        ? lesson.assistantInstructors
        : []

      mainInstructorsList.forEach(inst => {
        if (inst.id && inst.name) {
          mainInstructors.set(inst.id, inst.name)
        }
      })

      assistantInstructorsList.forEach(inst => {
        if (inst.id && inst.name) {
          assistantInstructors.set(inst.id, inst.name)
        }
      })
    })

    // Create settlement rows for main instructors
    mainInstructors.forEach((name, instructorId) => {
      const row = computeSettlementRow(
        education,
        assignment,
        instructorId,
        name,
        'main',
        countingMode
      )
      if (row) {
        rows.push(row)
      }
    })

    // Create settlement rows for assistant instructors
    assistantInstructors.forEach((name, instructorId) => {
      const row = computeSettlementRow(
        education,
        assignment,
        instructorId,
        name,
        'assistant',
        countingMode
      )
      if (row) {
        rows.push(row)
      }
    })
  })

  // Preserve overrides from existing rows
  const existingRows = getSettlementRows()
  const overrideMap = new Map<string, TravelSettlementRow>()
  existingRows.forEach(row => {
    if (row.distanceKmOverride !== undefined || 
        row.travelExpenseOverride !== undefined || 
        row.allowanceOverride !== undefined) {
      overrideMap.set(row.id, row)
    }
  })

  // Apply overrides to new rows
  rows.forEach(row => {
    const existing = overrideMap.get(row.id)
    if (existing) {
      if (existing.distanceKmOverride !== undefined) {
        row.distanceKmOverride = existing.distanceKmOverride
        row.distanceKm = existing.distanceKmOverride
        // Recalculate travel expense with override distance
        const travelExpensePolicy = getTravelExpensePolicy()
        row.travelExpense = computeTravelExpense(existing.distanceKmOverride, travelExpensePolicy)
      }
      if (existing.travelExpenseOverride !== undefined) {
        row.travelExpenseOverride = existing.travelExpenseOverride
        row.travelExpense = existing.travelExpenseOverride
      }
      if (existing.allowanceOverride !== undefined) {
        row.allowanceOverride = existing.allowanceOverride
        row.allowanceTotal = existing.allowanceOverride
      }
      row.overrideReason = existing.overrideReason
      row.overrideDate = existing.overrideDate
      row.overrideBy = existing.overrideBy
      row.totalPay = (row.travelExpenseOverride ?? row.travelExpense) + (row.allowanceOverride ?? row.allowanceTotal)
    }
  })

  saveSettlementRows(rows)
}

/**
 * Update a settlement row (for overrides)
 */
export function updateSettlementRow(
  rowId: string,
  updates: {
    distanceKmOverride?: number
    travelExpenseOverride?: number
    allowanceOverride?: number
    overrideReason?: string
    overrideBy?: string
  }
): void {
  const rows = getSettlementRows()
  const index = rows.findIndex(r => r.id === rowId)
  if (index === -1) {
    return
  }

  const row = rows[index]
  const now = new Date().toISOString()

  // Apply updates
  if (updates.distanceKmOverride !== undefined) {
    row.distanceKmOverride = updates.distanceKmOverride
    row.distanceKm = updates.distanceKmOverride
    // Recalculate travel expense if not overridden
    if (row.travelExpenseOverride === undefined) {
      const travelExpensePolicy = getTravelExpensePolicy()
      row.travelExpense = computeTravelExpense(updates.distanceKmOverride, travelExpensePolicy)
    }
  }
  if (updates.travelExpenseOverride !== undefined) {
    row.travelExpenseOverride = updates.travelExpenseOverride
    row.travelExpense = updates.travelExpenseOverride
  }
  if (updates.allowanceOverride !== undefined) {
    row.allowanceOverride = updates.allowanceOverride
    row.allowanceTotal = updates.allowanceOverride
  }
  if (updates.overrideReason !== undefined) {
    row.overrideReason = updates.overrideReason
  }
  if (updates.overrideBy !== undefined) {
    row.overrideBy = updates.overrideBy
  }

  row.overrideDate = now
  row.updatedAt = now
  row.totalPay = (row.travelExpenseOverride ?? row.travelExpense) + (row.allowanceOverride ?? row.allowanceTotal)

  rows[index] = row
  saveSettlementRows(rows)
}

/**
 * Remove override from a settlement row
 */
export function removeSettlementOverride(rowId: string): void {
  const rows = getSettlementRows()
  const index = rows.findIndex(r => r.id === rowId)
  if (index === -1) {
    return
  }

  const row = rows[index]
  
  // Recompute original values
  const instructor = getInstructorData(row.instructorId)
  const institution = getInstitutionData(row.institutionName)
  
  const distanceKm = defaultDistanceProvider.getDistanceKm(
    instructor.homeLat,
    instructor.homeLng,
    institution.schoolLat,
    institution.schoolLng,
    instructor.homeAddressText,
    institution.schoolAddressText
  )
  
  const travelExpensePolicy = getTravelExpensePolicy()
  const travelExpense = computeTravelExpense(distanceKm, travelExpensePolicy)
  
  const allowancePolicy = getAllowancePolicy()
  const allowance = computeAllowance(
    row.totalSessions,
    row.role,
    row.institutionCategory,
    allowancePolicy
  )

  // Remove overrides
  row.distanceKmOverride = undefined
  row.travelExpenseOverride = undefined
  row.allowanceOverride = undefined
  row.overrideReason = undefined
  row.overrideDate = undefined
  row.overrideBy = undefined
  
  // Restore computed values
  row.distanceKm = distanceKm
  row.travelExpense = travelExpense
  row.allowanceBase = allowance.base
  row.allowanceBonus = allowance.bonus
  row.allowanceTotal = allowance.total
  row.totalPay = travelExpense + allowance.total
  row.updatedAt = new Date().toISOString()

  rows[index] = row
  saveSettlementRows(rows)
}

/**
 * Initialize settlement store
 * Sets up event listeners for automatic recomputation
 */
export function initializeSettlementStore(): void {
  // Listen for education updates
  window.addEventListener('educationUpdated', () => {
    recomputeSettlements()
  })

  // Listen for education status updates
  window.addEventListener('educationStatusUpdated', () => {
    recomputeSettlements()
  })

  // Listen for policy updates
  window.addEventListener('settlementPolicyUpdated', () => {
    recomputeSettlements()
  })

  // Initial computation
  recomputeSettlements()
}
