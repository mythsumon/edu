/**
 * Enhanced Settlement Types
 * Extended types to support comprehensive fee & travel allowance automation
 */

import type { InstitutionCategory } from './settlement-types'

/**
 * Daily calculation output (per instructor per date)
 */
export interface DailyCalculationOutput {
  date: string // YYYY-MM-DD
  instructorId: string
  instructorName: string
  
  // Session data
  sessionCount: number
  baseFeeTotal: number
  
  // Allowances (itemized)
  allowancesBreakdown: {
    remoteIsland: number
    specialEducation: number
    noAssistant: number
    weekend: number
    middleSchool: number
    highSchool: number
    equipmentTransport: number
    eventParticipation: number
    mentoring: number
  }
  allowancesTotal: number
  
  // Travel
  travelKmTotal: number
  travelAllowanceAmount: number
  routeDescription: string // "Home → Inst1 → Inst2 → ... → Home"
  
  // Totals
  grossTotal: number
  taxTotal: number
  netTotal: number
  
  // Evidence references
  evidenceReferences: {
    routeMapImageUrl?: string // Naver Map shortest route screenshot
    equipmentSignatureUrl?: string // Equipment confirmation form signature
    [key: string]: string | undefined
  }
}

/**
 * Monthly aggregation output
 */
export interface MonthlyAggregationOutput {
  month: string // YYYY-MM
  instructorId: string
  instructorName: string
  
  // Sums per category
  baseFeeTotal: number
  allowancesBreakdown: {
    remoteIsland: number
    specialEducation: number
    noAssistant: number
    weekend: number
    middleSchool: number
    highSchool: number
    equipmentTransport: number // Capped at 300k
    eventParticipation: number
    mentoring: number
  }
  allowancesTotal: number
  travelAllowanceTotal: number
  eventFeeTotal: number
  equipmentTransportTotal: number // Before cap
  equipmentTransportCapped: number // After cap
  
  // Totals
  grossTotal: number
  taxTotal: number
  netTotal: number
  
  // Compliance flags
  monthlySessions: number
  meetsMinimumSessions: boolean // >= 30 sessions
  missingEvidence: string[] // List of missing evidence types
  exceededCap: boolean // Equipment transport cap exceeded
  
  // Daily details
  dailyCalculations: DailyCalculationOutput[]
}

/**
 * Training/Session data (per schedule)
 */
export interface TrainingSessionData {
  trainingId: string
  educationId: string
  date: string // YYYY-MM-DD
  startTime?: string // HH:mm
  endTime?: string // HH:mm
  sessionCount: number // 차시
  studentCount: number
  hasAssistantInstructor: boolean
  instructorRole: 'main' | 'assistant'
  isWeekend: boolean // Saturday/Sunday
  isHoliday: boolean
  isEventParticipation: boolean
  isMentoring: boolean
  isResearchActivity: boolean
  mentoringHours?: number // For mentoring: 1-3 hours per session
  eventParticipationHours?: number // For event participation
  equipmentTransportRequired: boolean // 교구 운반 필요 여부
}

/**
 * Institution/School data
 */
export interface InstitutionSettlementData {
  institutionId: string
  name: string
  roadAddress: string // 도로명주소
  cityCounty: string // 시군 (mapped to one of the 31)
  cityCountyCode?: string // City/county code for distance lookup
  isRemoteIsland: boolean // 도서·벽지
  isSpecialSchool: boolean // 특수학교
  isSpecialClass: boolean // 특수학급
  educationLevel: 'elementary' | 'middle' | 'high' | 'mixed'
  centerHubType?: string
}

/**
 * Instructor master data
 */
export interface InstructorSettlementData {
  instructorId: string
  name: string
  homeAddress: string // Full text
  homeCityCounty: string // 시군 (mapped to one of the 31)
  homeCityCountyCode?: string // City/county code for distance lookup
  instructorGrade?: string
  bankInfo?: {
    bankName?: string
    accountNumber?: string
    accountHolder?: string
  }
  status: 'active' | 'blocked' | 'inactive'
}

/**
 * Settlement status
 */
export type SettlementStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'PAID'

/**
 * Admin review/approval data
 */
export interface SettlementReviewData {
  settlementId: string
  month: string // YYYY-MM
  instructorId: string
  instructorName: string
  status: SettlementStatus
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectReason?: string
  adjustments: Array<{
    field: string
    originalValue: number
    adjustedValue: number
    reason: string
    adjustedBy: string
    adjustedAt: string
  }>
  auditLog: Array<{
    action: string
    performedBy: string
    performedAt: string
    details?: string
  }>
}

/**
 * Export/Print data
 */
export interface SettlementExportData {
  month: string // YYYY-MM
  exportDate: string
  instructorSummaries: MonthlyAggregationOutput[]
  totals: {
    totalInstructors: number
    totalSessions: number
    totalBaseFee: number
    totalAllowances: number
    totalTravelAllowance: number
    totalGross: number
    totalTax: number
    totalNet: number
  }
}
