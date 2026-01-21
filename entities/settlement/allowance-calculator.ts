/**
 * Allowance Calculator
 * Calculates instructor allowance based on sessions, role, and category bonuses
 */

import type { AllowancePolicy, InstitutionCategory } from './settlement-types'

/**
 * Default allowance policy
 * Can be configured by admin later
 */
export const DEFAULT_ALLOWANCE_POLICY: AllowancePolicy = {
  leadRatePerSession: 50000, // 50,000 won per session for lead instructor
  assistantRatePerSession: 30000, // 30,000 won per session for assistant instructor
  categoryBonuses: {
    MIDDLE: 10000, // +10,000 won for middle school
    SPECIAL_CLASS: 15000, // +15,000 won for special class
    REMOTE_RURAL: 20000, // +20,000 won for remote/rural
  },
}

/**
 * Calculate allowance for an instructor
 * 
 * @param totalSessions - Total number of sessions
 * @param role - 'main' (lead) or 'assistant'
 * @param institutionCategory - Institution category for bonus calculation
 * @param policy - Allowance policy configuration
 * @returns Object with base, bonus, and total allowance
 */
export function computeAllowance(
  totalSessions: number,
  role: 'main' | 'assistant',
  institutionCategory: InstitutionCategory,
  policy: AllowancePolicy = DEFAULT_ALLOWANCE_POLICY
): {
  base: number
  bonus: number
  total: number
} {
  // Calculate base allowance
  const ratePerSession = role === 'main' 
    ? policy.leadRatePerSession 
    : policy.assistantRatePerSession
  const base = totalSessions * ratePerSession

  // Calculate category bonus
  let bonus = 0
  if (institutionCategory === 'MIDDLE') {
    bonus = policy.categoryBonuses.MIDDLE
  } else if (institutionCategory === 'SPECIAL_CLASS') {
    bonus = policy.categoryBonuses.SPECIAL_CLASS
  } else if (institutionCategory === 'REMOTE_RURAL') {
    bonus = policy.categoryBonuses.REMOTE_RURAL
  }

  return {
    base,
    bonus,
    total: base + bonus,
  }
}

/**
 * Get allowance policy from localStorage or return default
 */
export function getAllowancePolicy(): AllowancePolicy {
  try {
    const stored = localStorage.getItem('settlement.allowancePolicy')
    if (stored) {
      return JSON.parse(stored)
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
