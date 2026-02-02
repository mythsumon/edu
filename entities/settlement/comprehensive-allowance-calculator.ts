/**
 * Comprehensive Allowance Calculator
 * Implements all allowance rules per requirements:
 * - Base fees (Main: 40k, Assistant: 30k per session)
 * - Remote/Island allowance (+5k per session)
 * - Special Education allowance (+10k per session)
 * - No Assistant despite 15+ Students (+5k per session)
 * - Weekend allowance (+5k per session, except event participation)
 * - Equipment Transport allowance (20k per day, max 300k per month)
 * - Event Participation allowance (25k per hour)
 * - Mentoring allowance (10k per session OR 40k per hour, max 3h/day)
 * - Middle School allowance (+5k per session)
 * - High School allowance (+10k per session)
 */

import type { InstitutionCategory } from './settlement-types'

export interface SessionAllowanceInput {
  sessionCount: number
  role: 'main' | 'assistant'
  institutionCategory: InstitutionCategory
  isRemoteIsland: boolean // 도서·벽지
  isSpecialEducation: boolean // 특수학교/특수학급
  studentCount?: number
  hasAssistant?: boolean
  weekendSessionCount: number // 주말 차시 수
  isEventParticipation?: boolean // 행사참여 (주말수당 제외)
  equipmentTransportDays: number // 교구 운반 일수
  eventParticipationHours?: number // 행사참여 시간
  mentoringSessions?: number // 멘토링 차시 수 (10k per session)
  mentoringHours?: number // 멘토링 시간 (40k per hour, max 3h/day)
  isMiddleSchool: boolean
  isHighSchool: boolean
}

export interface AllowanceBreakdown {
  // Base fees
  baseFee: number // 기본 강사료 (차시 × 역할별 금액)
  
  // Additional allowances
  remoteIslandAllowance: number // 도서·벽지 수당 (+5k per session)
  specialEducationAllowance: number // 특별수당 (+10k per session)
  noAssistantAllowance: number // 보조강사 없음 수당 (+5k per session, 15명 이상)
  weekendAllowance: number // 휴일/주말수당 (+5k per session, 이벤트 제외)
  middleSchoolAllowance: number // 중등부 수당 (+5k per session)
  highSchoolAllowance: number // 고등부 수당 (+10k per session)
  
  // Special allowances
  equipmentTransportAllowance: number // 교구 운반 수당 (20k per day, max 300k/month)
  eventParticipationAllowance: number // 행사참여수당 (25k per hour)
  mentoringAllowance: number // 멘토링 수당 (10k per session OR 40k per hour)
  
  // Totals
  allowancesTotal: number // Sum of all allowances
  grossTotal: number // baseFee + allowancesTotal
}

/**
 * Calculate comprehensive allowance breakdown
 * 
 * @param input - Session allowance input parameters
 * @returns Detailed allowance breakdown
 */
export function calculateComprehensiveAllowance(
  input: SessionAllowanceInput
): AllowanceBreakdown {
  const {
    sessionCount,
    role,
    institutionCategory,
    isRemoteIsland,
    isSpecialEducation,
    studentCount,
    hasAssistant,
    weekendSessionCount,
    isEventParticipation = false,
    equipmentTransportDays,
    eventParticipationHours = 0,
    mentoringSessions = 0,
    mentoringHours = 0,
    isMiddleSchool,
    isHighSchool,
  } = input

  // 1. Base Fee (강사료)
  // Main: 40,000 KRW per session
  // Assistant: 30,000 KRW per session
  const baseRatePerSession = role === 'main' ? 40000 : 30000
  const baseFee = sessionCount * baseRatePerSession

  // 2. Remote/Island Allowance (도서·벽지 수당)
  // +5,000 KRW per session
  // Paid regardless of inside/outside region
  const remoteIslandAllowance = isRemoteIsland ? sessionCount * 5000 : 0

  // 3. Special Education Allowance (특별수당)
  // +10,000 KRW per session
  // Special school OR special class in general school
  const specialEducationAllowance = isSpecialEducation ? sessionCount * 10000 : 0

  // 4. No Assistant despite 15+ Students
  // +5,000 KRW per session
  // Only for main instructor
  let noAssistantAllowance = 0
  if (role === 'main' && studentCount !== undefined && hasAssistant !== undefined) {
    if (studentCount >= 15 && !hasAssistant) {
      noAssistantAllowance = sessionCount * 5000
    }
  }

  // 5. Weekend Allowance (휴일/주말수당)
  // +5,000 KRW per session
  // Exception: If event participation, weekend allowance does NOT apply
  const weekendAllowance = (isEventParticipation ? 0 : weekendSessionCount) * 5000

  // 6. Middle School Allowance (중고등부)
  // +5,000 KRW per session
  const middleSchoolAllowance = isMiddleSchool ? sessionCount * 5000 : 0

  // 7. High School Allowance (중고등부)
  // +10,000 KRW per session
  const highSchoolAllowance = isHighSchool ? sessionCount * 10000 : 0

  // 8. Equipment Transport Allowance (교구 운반 수당)
  // 20,000 KRW per day (per center visit day)
  // Monthly cap: Max 300,000 KRW per instructor per month
  // Note: Monthly cap enforcement should be done at aggregation level
  const equipmentTransportAllowance = equipmentTransportDays * 20000

  // 9. Event Participation Allowance (행사참여수당)
  // 25,000 KRW per hour
  const eventParticipationAllowance = eventParticipationHours * 25000

  // 10. Mentoring Allowance (역량강화)
  // Two methods:
  // A) Standard: 10,000 KRW per session
  // B) Special: 40,000 KRW per hour, 1 time per day, 1-3 hours per session (max 3h/day)
  // System supports both via activity type + unit type
  let mentoringAllowance = 0
  if (mentoringSessions > 0) {
    // Method A: Per session
    mentoringAllowance = mentoringSessions * 10000
  } else if (mentoringHours > 0) {
    // Method B: Per hour (max 3h/day)
    const cappedHours = Math.min(mentoringHours, 3) // Max 3 hours per day
    mentoringAllowance = cappedHours * 40000
  }

  // Calculate totals
  const allowancesTotal =
    remoteIslandAllowance +
    specialEducationAllowance +
    noAssistantAllowance +
    weekendAllowance +
    middleSchoolAllowance +
    highSchoolAllowance +
    equipmentTransportAllowance +
    eventParticipationAllowance +
    mentoringAllowance

  const grossTotal = baseFee + allowancesTotal

  return {
    baseFee,
    remoteIslandAllowance,
    specialEducationAllowance,
    noAssistantAllowance,
    weekendAllowance,
    middleSchoolAllowance,
    highSchoolAllowance,
    equipmentTransportAllowance,
    eventParticipationAllowance,
    mentoringAllowance,
    allowancesTotal,
    grossTotal,
  }
}

/**
 * Calculate tax deduction (3.3% business income tax)
 * Includes local income tax
 * 
 * @param grossAmount - Gross amount before tax
 * @returns Object with tax amount and net amount
 */
export function calculateTaxDeduction(grossAmount: number): {
  grossAmount: number
  taxAmount: number
  netAmount: number
} {
  // 3.3% business income tax (includes local income tax)
  const taxRate = 0.033
  const taxAmount = Math.round(grossAmount * taxRate)
  const netAmount = grossAmount - taxAmount

  return {
    grossAmount,
    taxAmount,
    netAmount,
  }
}

/**
 * Check if instructor meets monthly minimum activity requirement
 * "Monthly 30 sessions or more required"
 * 
 * @param monthlySessionCount - Total sessions in the month
 * @returns Object with eligibility status and message
 */
export function checkMonthlyMinimumSessions(monthlySessionCount: number): {
  isEligible: boolean
  sessionCount: number
  requiredSessions: number
  message: string
} {
  const requiredSessions = 30
  const isEligible = monthlySessionCount >= requiredSessions

  return {
    isEligible,
    sessionCount: monthlySessionCount,
    requiredSessions,
    message: isEligible
      ? `월 최소 활동 요건 충족 (${monthlySessionCount}차시)`
      : `월 최소 활동 요건 미충족 (${monthlySessionCount}/${requiredSessions}차시)`,
  }
}

/**
 * Apply monthly cap for equipment transport allowance
 * Max 300,000 KRW per instructor per month
 * 
 * @param calculatedAmount - Calculated equipment transport allowance
 * @param monthlyTotal - Total equipment transport allowance for the month so far
 * @returns Capped amount
 */
export function applyEquipmentTransportCap(
  calculatedAmount: number,
  monthlyTotal: number
): {
  originalAmount: number
  cappedAmount: number
  remainingCap: number
  isCapped: boolean
} {
  const monthlyCap = 300000
  const remainingCap = Math.max(0, monthlyCap - monthlyTotal)
  const cappedAmount = Math.min(calculatedAmount, remainingCap)
  const isCapped = cappedAmount < calculatedAmount

  return {
    originalAmount: calculatedAmount,
    cappedAmount,
    remainingCap,
    isCapped,
  }
}
