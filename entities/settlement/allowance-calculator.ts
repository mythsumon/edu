/**
 * Allowance Calculator
 * Calculates instructor allowance based on sessions, role, and category bonuses
 */

import type { AllowancePolicy, InstitutionCategory } from './settlement-types'

/**
 * Default allowance policy
 * 수업 기준: 기본금(차시×초중고특수도서벽지금액) + 주말수당(차시당5천원) + 출장수당(Km별금액지급)
 * Can be configured by admin later
 */
export const DEFAULT_ALLOWANCE_POLICY: AllowancePolicy = {
  baseRates: {
    ELEMENTARY: { main: 40000, assistant: 30000 },  // 초등학교 차시당 금액 (Main: 40k, Assistant: 30k)
    MIDDLE: { main: 40000, assistant: 30000 },      // 중학교 차시당 금액 (Base: 40k/30k, +5k allowance)
    HIGH: { main: 40000, assistant: 30000 },        // 고등학교 차시당 금액 (Base: 40k/30k, +10k allowance)
    SPECIAL: { main: 40000, assistant: 30000 },    // 특수학교 차시당 금액 (Base: 40k/30k, +10k allowance)
    ISLAND: { main: 40000, assistant: 30000 },     // 도서벽지 차시당 금액 (Base: 40k/30k, +5k allowance)
    GENERAL: { main: 40000, assistant: 30000 },    // 일반 차시당 금액 (Main: 40k, Assistant: 30k)
  },
  weekendRatePerSession: 5000,  // 주말수당 차시당 5천원
  
  // 하위 호환성
  leadRatePerSession: 40000,
  assistantRatePerSession: 30000,
  categoryBonuses: {
    MIDDLE: 0,
    SPECIAL_CLASS: 0,
    REMOTE_RURAL: 0,
  },
}

/**
 * Calculate allowance for an instructor
 * 수업 기준: 기본금(차시×초중고특수도서벽지금액) + 주말수당(차시당5천원) + 추가수당(15명 이상 + 보조강사 없음: 차시당 5천원)
 * 
 * @param totalSessions - Total number of sessions
 * @param weekendSessions - Number of weekend sessions (Saturday/Sunday)
 * @param role - 'main' (lead) or 'assistant'
 * @param institutionCategory - Institution category for base rate calculation
 * @param policy - Allowance policy configuration
 * @param studentCount - Number of students (for extra allowance calculation)
 * @param hasAssistant - Whether assistant instructor is assigned (for extra allowance calculation)
 * @returns Object with base, weekend, extra, bonus, and total allowance
 */
export function computeAllowance(
  totalSessions: number,
  weekendSessions: number,
  role: 'main' | 'assistant',
  institutionCategory: InstitutionCategory,
  policy: AllowancePolicy = DEFAULT_ALLOWANCE_POLICY,
  studentCount?: number,
  hasAssistant?: boolean
): {
  base: number
  weekend: number
  extra: number
  bonus: number
  total: number
} {
  // 학교 유형별 차시당 기본금 가져오기
  let ratePerSession: number
  if (policy.baseRates) {
    // 타입 가드: baseRates에 존재하는 카테고리만 사용
    const validCategory = (institutionCategory === 'ELEMENTARY' || 
                           institutionCategory === 'MIDDLE' || 
                           institutionCategory === 'HIGH' || 
                           institutionCategory === 'SPECIAL' || 
                           institutionCategory === 'ISLAND' || 
                           institutionCategory === 'GENERAL')
      ? institutionCategory 
      : 'GENERAL'
    
    const categoryRates = policy.baseRates[validCategory] || policy.baseRates.GENERAL
    ratePerSession = role === 'main' ? categoryRates.main : categoryRates.assistant
  } else {
    // 레거시 지원
    ratePerSession = role === 'main' 
      ? (policy.leadRatePerSession || 50000)
      : (policy.assistantRatePerSession || 30000)
  }

  // 기본금 계산: 차시 × 학교유형별 금액
  const base = totalSessions * ratePerSession

  // 주말수당 계산: 주말 차시 × 5000원
  const weekendRate = policy.weekendRatePerSession || 5000
  const weekend = weekendSessions * weekendRate

  // 추가 수당 계산: 15명 이상 + 보조강사 없음 → 차시당 5천원
  // 주강사만 해당 (보조강사는 제외)
  let extra = 0
  if (role === 'main' && studentCount !== undefined && hasAssistant !== undefined) {
    if (studentCount >= 15 && !hasAssistant) {
      extra = totalSessions * 5000
    }
  }

  // 레거시 보너스 (deprecated, 0으로 설정)
  let bonus = 0
  if (policy.categoryBonuses) {
    if (institutionCategory === 'MIDDLE') {
      bonus = policy.categoryBonuses.MIDDLE || 0
    } else if (institutionCategory === 'SPECIAL') {
      bonus = policy.categoryBonuses.SPECIAL_CLASS || 0
    } else if (institutionCategory === 'ISLAND') {
      bonus = policy.categoryBonuses.REMOTE_RURAL || 0
    }
  }

  return {
    base,
    weekend,
    extra,
    bonus,
    total: base + weekend + extra + bonus,
  }
}

/**
 * Get allowance policy from localStorage or return default
 * Migrates old policy format to new format if needed
 */
export function getAllowancePolicy(): AllowancePolicy {
  try {
    const stored = localStorage.getItem('settlement.allowancePolicy')
    if (stored) {
      const policy: AllowancePolicy = JSON.parse(stored)
      // Migrate old policy: add baseRates if missing
      if (!policy.baseRates) {
        // Use legacy rates to create baseRates
        const mainRate = policy.leadRatePerSession || 50000
        const assistantRate = policy.assistantRatePerSession || 30000
        policy.baseRates = {
          ELEMENTARY: { main: mainRate, assistant: assistantRate },
          MIDDLE: { main: mainRate, assistant: assistantRate },
          HIGH: { main: mainRate, assistant: assistantRate },
          SPECIAL: { main: mainRate, assistant: assistantRate },
          ISLAND: { main: mainRate, assistant: assistantRate },
          GENERAL: { main: mainRate, assistant: assistantRate },
        }
      }
      // Ensure weekendRatePerSession exists
      if (policy.weekendRatePerSession === undefined) {
        policy.weekendRatePerSession = 5000
      }
      return policy
    }
  } catch (error) {
    console.error('Failed to load allowance policy:', error)
  }
  return DEFAULT_ALLOWANCE_POLICY
}

/**
 * Save allowance policy to localStorage
 */
export function saveAllowancePolicy(policy: AllowancePolicy): void {
  try {
    localStorage.setItem('settlement.allowancePolicy', JSON.stringify(policy))
    window.dispatchEvent(new CustomEvent('settlementPolicyUpdated'))
  } catch (error) {
    console.error('Failed to save allowance policy:', error)
  }
}
