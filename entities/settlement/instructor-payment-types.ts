/**
 * Instructor-Centric Payment Types
 * All calculations are based on the INSTRUCTOR, not the training.
 * The instructor must clearly understand: "Why am I paid this amount?"
 */

import type { InstitutionCategory } from './settlement-types'

/**
 * Instructor home region (city/county)
 */
export interface InstructorRegion {
  cityCounty: string // e.g., "수원시", "성남시"
  cityCountyCode?: string // City/county code for distance lookup
  address?: string // Full address text
  lat?: number
  lng?: number
}

/**
 * Training institution region
 */
export interface InstitutionRegion {
  cityCounty: string // e.g., "수원시", "성남시"
  cityCountyCode?: string // City/county code for distance lookup
  institutionName: string
  address?: string
  lat?: number
  lng?: number
}

/**
 * Training role in a specific training
 */
export type TrainingRole = 'main' | 'assistant'

/**
 * Training assignment for an instructor on a specific day
 */
export interface DailyTrainingAssignment {
  educationId: string
  educationName: string
  institution: InstitutionRegion
  role: TrainingRole
  sessionCount: number // Number of sessions on this day
  sessionNumbers?: number[] // Session numbers (e.g., [1, 2, 3])
  date: string // YYYY-MM-DD
  startTime?: string
  endTime?: string
  educationStatus: string // '확정', '종료', etc.
  isCountingEligible: boolean // Whether this training counts for payment
}

/**
 * Daily travel route calculation
 */
export interface DailyTravelRoute {
  homeRegion: InstructorRegion
  institutionRegions: InstitutionRegion[] // In visit order
  totalDistanceKm: number // Sum of fixed city-to-city distances
  distanceSource: 'fixed_matrix' | 'manual' | 'haversine'
  routeDescription: string // e.g., "수원시 → 성남시 → 용인시 → 수원시"
  mapImageUrl?: string // Reference map image URL
}

/**
 * Daily travel allowance calculation
 */
export interface DailyTravelAllowance {
  totalDistanceKm: number
  distanceBracket: {
    minKm: number
    maxKm: number | null // null means infinity
    amount: number
  }
  amount: number // Travel allowance amount in KRW
  explanation: string // Why this amount (e.g., "50-70km bracket: 20,000 KRW" or "Same region: 0 KRW")
  mapImageUrl?: string
}

/**
 * Payment calculation for a single training on a day
 */
export interface TrainingPaymentBreakdown {
  training: DailyTrainingAssignment
  role: TrainingRole
  sessionCount: number
  
  // Payment rate per session based on role
  ratePerSession: number // 40,000 for main, 30,000 for assistant
  
  // Payment calculation
  paymentFormula: string // e.g., "40,000 × 2 sessions = 80,000 KRW"
  paymentAmount: number // Total payment for this training
  
  // Additional allowances (if applicable)
  additionalAllowances?: {
    weekend?: number
    remoteIsland?: number
    specialClass?: number
    noAssistant?: number
  }
  
  // Total for this training
  totalAmount: number
}

/**
 * Daily payment summary for an instructor
 */
export interface InstructorDailyPayment {
  date: string // YYYY-MM-DD
  instructorId: string
  instructorName: string
  
  // Trainings on this day
  trainings: DailyTrainingAssignment[]
  
  // Payment breakdown per training
  trainingPayments: TrainingPaymentBreakdown[]
  
  // Travel allowance (calculated once per day)
  travelAllowance: DailyTravelAllowance
  
  // Total payment for the day
  totalPayment: number // Sum of all training payments + travel allowance
  
  // Payment explanation
  paymentExplanation: string // Clear explanation of why this amount
}

/**
 * Monthly payment summary for an instructor
 */
export interface InstructorMonthlyPayment {
  instructorId: string
  instructorName: string
  month: string // YYYY-MM
  
  // Summary statistics
  totalDays: number // Number of days with trainings
  totalSessions: number // Total sessions across all trainings
  totalTrainingPayment: number // Sum of all training payments
  totalTravelAllowance: number // Sum of all travel allowances
  totalPayment: number // Total payment for the month
  
  // Daily breakdowns
  dailyPayments: InstructorDailyPayment[]
  
  // Payment eligibility
  eligibleDays: number // Days with eligible trainings (status = Confirmed or Completed)
  eligiblePayment: number // Payment only for eligible trainings
}

/**
 * Yearly payment summary for an instructor
 */
export interface InstructorYearlyPayment {
  instructorId: string
  instructorName: string
  year: string // YYYY
  
  // Summary statistics
  totalMonths: number // Number of months with payments
  totalDays: number // Number of days with trainings
  totalSessions: number // Total sessions across all trainings
  totalTrainingPayment: number // Sum of all training payments
  totalTravelAllowance: number // Sum of all travel allowances
  totalPayment: number // Total payment for the year
  
  // Monthly breakdowns
  monthlyPayments: InstructorMonthlyPayment[]
  
  // Payment eligibility
  eligibleDays: number // Days with eligible trainings
  eligiblePayment: number // Payment only for eligible trainings
}

/**
 * Instructor payment summary (all years)
 */
export interface InstructorPaymentSummary {
  instructorId: string
  instructorName: string
  homeRegion: InstructorRegion
  
  // Yearly summaries
  yearlyPayments: InstructorYearlyPayment[]
  
  // Overall statistics
  totalYears: number
  totalMonths: number
  totalDays: number
  totalSessions: number
  totalPayment: number
  eligiblePayment: number
}
