/**
 * Travel Expense Settlement Types
 * Types for travel expense and allowance calculation
 */

export type InstitutionCategory = 
  | 'ELEMENTARY'  // 초등학교
  | 'MIDDLE'      // 중학교
  | 'HIGH'        // 고등학교
  | 'SPECIAL'     // 특수학교
  | 'ISLAND'      // 도서벽지
  | 'GENERAL'     // 일반 (기본값)
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
 * 수업 기준: 기본금(차시×초중고특수도서벽지금액) + 주말수당(차시당5천원) + 출장수당(Km별금액지급)
 */
export interface AllowancePolicy {
  // 학교 유형별 차시당 기본금 (주강사/보조강사)
  baseRates: {
    ELEMENTARY: { main: number; assistant: number }  // 초등학교
    MIDDLE: { main: number; assistant: number }        // 중학교
    HIGH: { main: number; assistant: number }         // 고등학교
    SPECIAL: { main: number; assistant: number }      // 특수학교
    ISLAND: { main: number; assistant: number }        // 도서벽지
    GENERAL: { main: number; assistant: number }     // 일반 (기본값)
  }
  weekendRatePerSession: number  // 주말수당 차시당 금액 (기본: 5000원)
  
  // 하위 호환성을 위한 레거시 필드 (deprecated)
  leadRatePerSession?: number
  assistantRatePerSession?: number
  categoryBonuses?: {
    MIDDLE: number
    SPECIAL_CLASS: number
    REMOTE_RURAL: number
  }
}

/**
 * Daily travel record for an instructor
 * Groups all trainings on the same day into a single route
 */
export interface DailyTravelRecord {
  id: string // Unique ID: `${instructorId}_${date}` (e.g., "instructor-001_2025-03-05")
  instructorId: string
  instructorName: string
  date: string // YYYY-MM-DD
  homeAddress?: string
  homeLat?: number
  homeLng?: number
  // Institutions visited on this day (in route order)
  institutions: Array<{
    educationId: string
    educationName: string
    institutionName: string
    institutionAddress?: string
    institutionLat?: number
    institutionLng?: number
    role: 'main' | 'assistant'
    sessionNumber?: number
  }>
  // Route calculation
  totalDistanceKm: number // Total distance of route: Home → Inst1 → Inst2 → ... → Home
  distanceSource: 'haversine' | 'kakao' | 'manual' | 'mock'
  travelExpense: number // Single travel expense for the entire day
  // Map image evidence (stored as URL or base64)
  routeMapImageUrl?: string
  // Override fields
  distanceKmOverride?: number
  travelExpenseOverride?: number
  overrideReason?: string
  overrideDate?: string
  overrideBy?: string
  // Metadata
  computedAt: string
  updatedAt: string
}

/**
 * Settlement row for an instructor-education pair
 * Note: Travel expense is now stored separately in DailyTravelRecord
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
  // Travel expense reference (linked to DailyTravelRecord)
  dailyTravelRecordId?: string // Reference to DailyTravelRecord.id
  date?: string // Date of this session (YYYY-MM-DD) for linking to daily travel
  distanceKm: number // Distance for this specific education (for display, but travel expense comes from daily record)
  distanceSource: 'haversine' | 'kakao' | 'manual' | 'mock'
  travelExpense: number  // 출장수당 (from DailyTravelRecord, shared across all educations on same day)
  allowanceBase: number  // 기본금 (차시 × 학교유형별 금액)
  allowanceWeekend?: number  // 주말수당 (주말 차시 × 5000원) - optional for backward compatibility
  allowanceExtra?: number // 추가 수당 (15명 이상 + 보조강사 없음: 차시당 5천원)
  allowanceBonus: number  // 레거시 필드 (deprecated)
  allowanceTotal: number  // allowanceBase + (allowanceWeekend || 0) + (allowanceExtra || 0)
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
