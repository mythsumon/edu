/**
 * Travel Expense Settlement Types
 * Types for travel expense and allowance calculation
 */

export type InstitutionCategory = 
  | 'GENERAL' 
  | 'MIDDLE' 
  | 'SPECIAL_CLASS' 
  | 'REMOTE_RURAL' 
  | 'COMMUNITY_CENTER' 
  | 'OTHER'

export type PaymentCountingMode = 'ONLY_CONFIRMED_ENDED' | 'COUNT_IF_ASSIGNED'

/**
 * Distance provider interface
 * Allows swapping between Haversine, Kakao API, or manual input
 */
export interface DistanceProvider {
  getDistanceKm(instructorLat: number | undefined, instructorLng: number | undefined, 
                institutionLat: number | undefined, institutionLng: number | undefined,
                instructorAddress?: string, institutionAddress?: string): Promise<number> | number
}

/**
 * Travel expense policy table entry
 */
export interface TravelExpensePolicyEntry {
  minKm: number
  maxKm: number | null // null means infinity
  amount: number
}

/**
 * Allowance policy configuration
 */
export interface AllowancePolicy {
  leadRatePerSession: number
  assistantRatePerSession: number
  categoryBonuses: {
    MIDDLE: number
    SPECIAL_CLASS: number
    REMOTE_RURAL: number
  }
}

/**
 * Settlement row for an instructor-education pair
 */
export interface TravelSettlementRow {
  id: string // Unique ID: `${educationId}_${instructorId}_${role}`
  educationId: string
  educationName: string
  institutionId: string
  institutionName: string
  institutionCategory: InstitutionCategory
  periodStart: string
  periodEnd: string
  totalSessions: number
  instructorId: string
  instructorName: string
  role: 'main' | 'assistant'
  instructorHomeAddress?: string
  institutionAddress?: string
  distanceKm: number
  distanceSource: 'haversine' | 'kakao' | 'manual' | 'mock'
  travelExpense: number
  allowanceBase: number
  allowanceBonus: number
  allowanceTotal: number
  totalPay: number // travelExpense + allowanceTotal
  educationStatus: string
  isCountingEligible: boolean
  // Override fields
  distanceKmOverride?: number
  travelExpenseOverride?: number
  allowanceOverride?: number
  overrideReason?: string
  overrideDate?: string
  overrideBy?: string
  // Metadata
  computedAt: string
  updatedAt: string
}

/**
 * Settlement summary by month
 */
export interface SettlementSummary {
  month: string // YYYY-MM
  totalRows: number
  totalTravelExpense: number
  totalAllowance: number
  totalPay: number
  eligibleRows: number
}
