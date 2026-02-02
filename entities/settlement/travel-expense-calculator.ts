/**
 * Travel Expense Calculator
 * Calculates travel expense based on distance and policy table
 */

import type { TravelExpensePolicyEntry } from './settlement-types'

/**
 * Default travel expense policy table
 * Based on requirements: 50-70=20k, 70-90=30k, 90-110=40k, 110-130=50k, ≥130=60k
 * Can be configured by admin later
 */
export const DEFAULT_TRAVEL_EXPENSE_POLICY: TravelExpensePolicyEntry[] = [
  { minKm: 0, maxKm: 50, amount: 0 },      // < 50 km: 0 KRW
  { minKm: 50, maxKm: 70, amount: 20000 }, // 50 ~ < 70 km: 20,000 KRW
  { minKm: 70, maxKm: 90, amount: 30000 }, // 70 ~ < 90 km: 30,000 KRW
  { minKm: 90, maxKm: 110, amount: 40000 }, // 90 ~ < 110 km: 40,000 KRW
  { minKm: 110, maxKm: 130, amount: 50000 }, // 110 ~ < 130 km: 50,000 KRW
  { minKm: 130, maxKm: null, amount: 60000 }, // ≥ 130 km: 60,000 KRW
]

/**
 * Calculate travel expense based on distance and policy table
 * 
 * @param distanceKm - Distance in kilometers
 * @param policyTable - Policy table with distance ranges and amounts
 * @returns Travel expense amount
 */
export function computeTravelExpense(
  distanceKm: number,
  policyTable: TravelExpensePolicyEntry[] = DEFAULT_TRAVEL_EXPENSE_POLICY
): number {
  if (distanceKm < 0) {
    return 0
  }

  // Find matching policy entry
  for (const entry of policyTable) {
    if (distanceKm >= entry.minKm) {
      if (entry.maxKm === null || distanceKm < entry.maxKm) {
        return entry.amount
      }
    }
  }

  // If no match found, return 0
  return 0
}

/**
 * Get travel expense policy from localStorage or return default
 */
export function getTravelExpensePolicy(): TravelExpensePolicyEntry[] {
  try {
    const stored = localStorage.getItem('settlement.travelExpensePolicy')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load travel expense policy:', error)
  }
  return DEFAULT_TRAVEL_EXPENSE_POLICY
}

/**
 * Save travel expense policy to localStorage
 */
export function saveTravelExpensePolicy(policy: TravelExpensePolicyEntry[]): void {
  try {
    localStorage.setItem('settlement.travelExpensePolicy', JSON.stringify(policy))
    window.dispatchEvent(new CustomEvent('settlementPolicyUpdated'))
  } catch (error) {
    console.error('Failed to save travel expense policy:', error)
  }
}
