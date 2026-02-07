/**
 * Payment Statement Generator
 * Generates payment statements in the format matching the official allowance statement format
 * 
 * Format columns:
 * - 강사구분 (Instructor Classification)
 * - 이름 (Name)
 * - 특별수당 (Special Allowance)
 * - 도서벽지수당 (Island/Remote Area Allowance)
 * - 휴일(주말) 수당 (Holiday/Weekend Allowance)
 * - 행사참여수당 (Event Participation Allowance)
 * - 기타 수당 (Other Allowances - 멘토/멘티 등)
 * - 교구운반수당 (Teaching Equipment Transport Allowance)
 * - 출장수당 (Travel Allowance)
 * - 중,고등부 수당 (Middle/High School Allowance)
 * - 출강 차시 (Session Count) - 주강사/보조강사
 * - 수당총합계 (Total Allowance)
 * - 근로자세액 (Employee Tax Amount) - 소득세/지방소득세
 * - 실지급액 (Actual Payment Amount)
 */

import type { InstructorMonthlyPayment, InstructorDailyPayment, TrainingPaymentBreakdown } from './instructor-payment-types'
import { calculateTaxDeduction } from './comprehensive-allowance-calculator'

/**
 * Payment statement row data
 */
export interface PaymentStatementRow {
  // Basic info
  instructorClassification: string // 강사구분
  instructorName: string // 이름
  
  // Allowances
  specialAllowance: number // 특별수당
  remoteIslandAllowance: number // 도서벽지수당
  weekendAllowance: number // 휴일(주말) 수당
  eventParticipationAllowance: number // 행사참여수당
  otherAllowance: number // 기타 수당 (멘토/멘티 등)
  equipmentTransportAllowance: number // 교구운반수당
  travelAllowance: number // 출장수당
  middleHighSchoolAllowance: number // 중,고등부 수당
  
  // Session counts and base fees
  mainInstructorSessions: number // 주강사 출강 차시
  assistantInstructorSessions: number // 보조강사 출강 차시
  mainInstructorBaseFee: number // 주강사 기본료 (32,000원 × 차시)
  assistantInstructorBaseFee: number // 보조강사 기본료 (24,000원 × 차시)
  
  // Totals
  totalAllowance: number // 수당총합계
  incomeTax: number // 소득세
  localIncomeTax: number // 지방소득세
  totalTax: number // 근로자세액 합계
  actualPayment: number // 실지급액
}

/**
 * Base rates per session (matching the statement format)
 */
const BASE_RATE_MAIN = 32000 // 주강사: 32,000원/차시
const BASE_RATE_ASSISTANT = 24000 // 보조강사: 24,000원/차시

/**
 * Tax rates (3.3% total = 3% income tax + 0.3% local income tax)
 */
const INCOME_TAX_RATE = 0.03 // 소득세 3%
const LOCAL_INCOME_TAX_RATE = 0.003 // 지방소득세 0.3%
const TOTAL_TAX_RATE = 0.033 // 총 세율 3.3%

/**
 * Generate payment statement for a single instructor's daily payment
 */
export function generateDailyPaymentStatement(
  dailyPayment: InstructorDailyPayment
): PaymentStatementRow {
  // Initialize totals
  let specialAllowance = 0
  let remoteIslandAllowance = 0
  let weekendAllowance = 0
  let eventParticipationAllowance = 0
  let otherAllowance = 0 // 멘토/멘티 등
  let equipmentTransportAllowance = 0
  let travelAllowance = dailyPayment.travelAllowance.amount
  let middleHighSchoolAllowance = 0
  
  let mainInstructorSessions = 0
  let assistantInstructorSessions = 0
  
  // Process each training payment
  dailyPayment.trainingPayments.forEach(payment => {
    const training = payment.training
    
    // Count sessions by role
    if (payment.role === 'main') {
      mainInstructorSessions += payment.sessionCount
    } else {
      assistantInstructorSessions += payment.sessionCount
    }
    
    // Extract allowances from training data
    // Check if special education (특수학급)
    const isSpecialEducation = training.educationName?.includes('특수') || 
                               training.institution?.institutionName?.includes('특수') ||
                               false
    
    // Check if remote/island (도서벽지)
    const isRemoteIsland = training.institution?.institutionName?.includes('도서') ||
                          training.institution?.institutionName?.includes('벽지') ||
                          training.institution?.cityCounty?.includes('도서') ||
                          false
    
    // Check if weekend (주말) - check if date is Saturday (6) or Sunday (0)
    const date = new Date(training.date)
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    const weekendSessions = isWeekend ? payment.sessionCount : 0
    
    // Check if middle/high school (중학교, 고등학교)
    const isMiddleSchool = training.educationName?.includes('중학교') ||
                          training.institution?.institutionName?.includes('중학교') ||
                          false
    const isHighSchool = training.educationName?.includes('고등학교') ||
                        training.institution?.institutionName?.includes('고등학교') ||
                        false
    
    // Special allowance (특별수당) - 10,000원 per session for special education
    if (isSpecialEducation) {
      specialAllowance += payment.sessionCount * 10000
    }
    
    // Remote/Island allowance (도서벽지수당) - 5,000원 per session
    if (isRemoteIsland) {
      remoteIslandAllowance += payment.sessionCount * 5000
    }
    
    // Weekend allowance (휴일/주말 수당) - 5,000원 per session
    // Rule: 차시별 Date가 weekend일 경우 차시당 추가 강사료 5,000원
    // Exception: 행사참여수당과 중복 지급 불가 (행사참여 시 주말수당 제외)
    // Note: Event participation excludes weekend allowance, but we don't have that data yet
    weekendAllowance += weekendSessions * 5000
    
    // Middle/High school allowance (중,고등부 수당)
    if (isMiddleSchool) {
      middleHighSchoolAllowance += payment.sessionCount * 5000
    }
    if (isHighSchool) {
      middleHighSchoolAllowance += payment.sessionCount * 10000
    }
    
    // Equipment transport allowance (교구운반수당)
    // Note: This would need to be tracked per day, but we'll use a placeholder
    // equipmentTransportAllowance += training.equipmentTransportDays * 20000
    
    // Event participation allowance (행사참여수당)
    // Note: This would need event participation hours data
    // eventParticipationAllowance += training.eventParticipationHours * 25000
    
    // Other allowance (기타 수당 - 멘토/멘티 등)
    // Note: This would need mentoring data
    // otherAllowance += training.mentoringSessions * 10000
  })
  
  // Cap equipment transport allowance at 300,000 per month
  equipmentTransportAllowance = Math.min(equipmentTransportAllowance, 300000)
  
  // Determine instructor classification based on sessions
  let instructorClassification: string
  if (mainInstructorSessions > 0 && assistantInstructorSessions > 0) {
    instructorClassification = '주강사/보조강사'
  } else if (mainInstructorSessions > 0) {
    instructorClassification = '주강사'
  } else if (assistantInstructorSessions > 0) {
    instructorClassification = '보조강사'
  } else {
    instructorClassification = '강사'
  }
  
  // Calculate base fees
  const mainInstructorBaseFee = mainInstructorSessions * BASE_RATE_MAIN
  const assistantInstructorBaseFee = assistantInstructorSessions * BASE_RATE_ASSISTANT
  
  // Calculate total allowance
  const totalAllowance = 
    mainInstructorBaseFee +
    assistantInstructorBaseFee +
    specialAllowance +
    remoteIslandAllowance +
    weekendAllowance +
    eventParticipationAllowance +
    otherAllowance +
    equipmentTransportAllowance +
    travelAllowance +
    middleHighSchoolAllowance
  
  // Calculate taxes
  const incomeTax = Math.round(totalAllowance * INCOME_TAX_RATE)
  const localIncomeTax = Math.round(totalAllowance * LOCAL_INCOME_TAX_RATE)
  const totalTax = incomeTax + localIncomeTax
  
  // Calculate actual payment
  const actualPayment = totalAllowance - totalTax
  
  return {
    instructorClassification,
    instructorName: dailyPayment.instructorName,
    specialAllowance,
    remoteIslandAllowance,
    weekendAllowance,
    eventParticipationAllowance,
    otherAllowance,
    equipmentTransportAllowance,
    travelAllowance,
    middleHighSchoolAllowance,
    mainInstructorSessions,
    assistantInstructorSessions,
    mainInstructorBaseFee,
    assistantInstructorBaseFee,
    totalAllowance,
    incomeTax,
    localIncomeTax,
    totalTax,
    actualPayment,
  }
}

/**
 * Generate payment statement for a single instructor's monthly payment
 */
export function generatePaymentStatement(
  monthlyPayment: InstructorMonthlyPayment
): PaymentStatementRow {
  // Initialize totals
  let specialAllowance = 0
  let remoteIslandAllowance = 0
  let weekendAllowance = 0
  let eventParticipationAllowance = 0
  let otherAllowance = 0 // 멘토/멘티 등
  let equipmentTransportAllowance = 0
  let travelAllowance = 0
  let middleHighSchoolAllowance = 0
  
  let mainInstructorSessions = 0
  let assistantInstructorSessions = 0
  
  // Process daily payments to aggregate allowances
  monthlyPayment.dailyPayments.forEach(dailyPayment => {
    // Travel allowance (once per day)
    travelAllowance += dailyPayment.travelAllowance.amount
    
    // Process each training payment
    dailyPayment.trainingPayments.forEach(payment => {
      const training = payment.training
      
      // Count sessions by role
      if (payment.role === 'main') {
        mainInstructorSessions += payment.sessionCount
      } else {
        assistantInstructorSessions += payment.sessionCount
      }
      
      // 교육 생성 시 구분하는 필드 사용 (키워드 기반 판단 제거)
      const isSpecialEducation = training.isSpecialEducation ?? false
      const isRemoteIsland = training.isRemoteIsland ?? false
      
      // Check if weekend (주말) - check if date is Saturday (6) or Sunday (0)
      const date = new Date(training.date)
      const dayOfWeek = date.getDay()
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
      const weekendSessions = isWeekend ? payment.sessionCount : 0
      
      // 교육 단계에 따른 중,고등부 수당 판단
      const isMiddleSchool = training.educationLevel === 'middle'
      const isHighSchool = training.educationLevel === 'high'
      
      // Special allowance (특별수당) - 10,000원 per session for special education
      if (isSpecialEducation) {
        specialAllowance += payment.sessionCount * 10000
      }
      
      // Remote/Island allowance (도서벽지수당) - 5,000원 per session
      if (isRemoteIsland) {
        remoteIslandAllowance += payment.sessionCount * 5000
      }
      
      // Weekend allowance (휴일/주말 수당) - 5,000원 per session
      // Rule: 차시별 Date가 weekend일 경우 차시당 추가 강사료 5,000원
      // Exception: 행사참여수당과 중복 지급 불가 (행사참여 시 주말수당 제외)
      // Note: Event participation excludes weekend allowance, but we don't have that data yet
      weekendAllowance += weekendSessions * 5000
      
      // Middle/High school allowance (중,고등부 수당)
      if (isMiddleSchool) {
        middleHighSchoolAllowance += payment.sessionCount * 5000
      }
      if (isHighSchool) {
        middleHighSchoolAllowance += payment.sessionCount * 10000
      }
      
      // Equipment transport allowance (교구운반수당)
      // Note: This would need to be tracked per day, but we'll use a placeholder
      // equipmentTransportAllowance += training.equipmentTransportDays * 20000
      
      // Event participation allowance (행사참여수당)
      // Note: This would need event participation hours data
      // eventParticipationAllowance += training.eventParticipationHours * 25000
      
      // Other allowance (기타 수당 - 멘토/멘티 등)
      // Note: This would need mentoring data
      // otherAllowance += training.mentoringSessions * 10000
    })
  })
  
  // Cap equipment transport allowance at 300,000 per month
  equipmentTransportAllowance = Math.min(equipmentTransportAllowance, 300000)
  
  // Calculate base fees
  const mainInstructorBaseFee = mainInstructorSessions * BASE_RATE_MAIN
  const assistantInstructorBaseFee = assistantInstructorSessions * BASE_RATE_ASSISTANT
  
  // Determine instructor classification based on sessions
  // Note: One session cannot have both roles, but an instructor can have different roles in different sessions
  let instructorClassification: string
  if (mainInstructorSessions > 0 && assistantInstructorSessions > 0) {
    instructorClassification = '주강사/보조강사'
  } else if (mainInstructorSessions > 0) {
    instructorClassification = '주강사'
  } else if (assistantInstructorSessions > 0) {
    instructorClassification = '보조강사'
  } else {
    instructorClassification = '강사'
  }
  
  // Calculate total allowance
  const totalAllowance = 
    mainInstructorBaseFee +
    assistantInstructorBaseFee +
    specialAllowance +
    remoteIslandAllowance +
    weekendAllowance +
    eventParticipationAllowance +
    otherAllowance +
    equipmentTransportAllowance +
    travelAllowance +
    middleHighSchoolAllowance
  
  // Calculate taxes
  const incomeTax = Math.round(totalAllowance * INCOME_TAX_RATE)
  const localIncomeTax = Math.round(totalAllowance * LOCAL_INCOME_TAX_RATE)
  const totalTax = incomeTax + localIncomeTax
  
  // Calculate actual payment
  const actualPayment = totalAllowance - totalTax
  
  return {
    instructorClassification,
    instructorName: monthlyPayment.instructorName,
    specialAllowance,
    remoteIslandAllowance,
    weekendAllowance,
    eventParticipationAllowance,
    otherAllowance,
    equipmentTransportAllowance,
    travelAllowance,
    middleHighSchoolAllowance,
    mainInstructorSessions,
    assistantInstructorSessions,
    mainInstructorBaseFee,
    assistantInstructorBaseFee,
    totalAllowance,
    incomeTax,
    localIncomeTax,
    totalTax,
    actualPayment,
  }
}

/**
 * Generate payment statements for multiple instructors (monthly aggregation)
 */
export function generatePaymentStatements(
  monthlyPayments: InstructorMonthlyPayment[]
): PaymentStatementRow[] {
  return monthlyPayments.map(payment => generatePaymentStatement(payment))
}

/**
 * Generate daily payment statements for multiple daily payments
 */
export function generateDailyPaymentStatements(
  dailyPayments: InstructorDailyPayment[]
): PaymentStatementRow[] {
  return dailyPayments.map(payment => generateDailyPaymentStatement(payment))
}

/**
 * Export payment statements to CSV format
 */
export function exportPaymentStatementsToCSV(
  statements: PaymentStatementRow[]
): string {
  // CSV headers (matching the statement format)
  const headers = [
    '강사구분',
    '이름',
    '특별수당',
    '도서벽지수당',
    '휴일(주말) 수당',
    '행사참여수당',
    '기타 수당',
    '교구운반수당',
    '출장수당',
    '중,고등부 수당',
    '주강사 출강 차시',
    '보조강사 출강 차시',
    '주강사 기본료',
    '보조강사 기본료',
    '수당총합계',
    '소득세',
    '지방소득세',
    '근로자세액 합계',
    '실지급액',
  ]
  
  // Escape CSV field
  const escapeCSV = (field: string | number): string => {
    if (field === null || field === undefined) return ''
    const stringField = String(field)
    if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
      return `"${stringField.replace(/"/g, '""')}"`
    }
    return stringField
  }
  
  // Generate CSV rows
  const csvRows = [
    headers.join(','),
    ...statements.map(stmt => [
      escapeCSV(stmt.instructorClassification),
      escapeCSV(stmt.instructorName),
      escapeCSV(stmt.specialAllowance),
      escapeCSV(stmt.remoteIslandAllowance),
      escapeCSV(stmt.weekendAllowance),
      escapeCSV(stmt.eventParticipationAllowance),
      escapeCSV(stmt.otherAllowance),
      escapeCSV(stmt.equipmentTransportAllowance),
      escapeCSV(stmt.travelAllowance),
      escapeCSV(stmt.middleHighSchoolAllowance),
      escapeCSV(stmt.mainInstructorSessions),
      escapeCSV(stmt.assistantInstructorSessions),
      escapeCSV(stmt.mainInstructorBaseFee),
      escapeCSV(stmt.assistantInstructorBaseFee),
      escapeCSV(stmt.totalAllowance),
      escapeCSV(stmt.incomeTax),
      escapeCSV(stmt.localIncomeTax),
      escapeCSV(stmt.totalTax),
      escapeCSV(stmt.actualPayment),
    ].join(',')),
  ]
  
  // Add BOM for Korean character support
  const BOM = '\uFEFF'
  return BOM + csvRows.join('\n')
}

/**
 * Download payment statements as CSV file
 */
export function downloadPaymentStatementsCSV(
  statements: PaymentStatementRow[],
  filename: string = `수당명세서_${new Date().toISOString().split('T')[0]}.csv`
): void {
  const csvContent = exportPaymentStatementsToCSV(statements)
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
