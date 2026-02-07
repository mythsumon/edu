/**
 * Settlement Calculation Engine
 * Pure functions for computing instructor settlements
 */

import type {
  DailyActivity,
  ClassActivity,
  EventActivity,
  Instructor,
  Institution,
  CityDistanceMatrix,
  ActivityStatus,
  InstructorRole,
} from './mock/settlementMock'

export interface ClassCalculationDetail {
  activityId: string
  institutionName: string
  institutionLevel: string
  role: InstructorRole
  sessions: number
  baseFeePerSession: number
  baseAmount: number
  allowances: {
    remote: { perSession: number; total: number; reason: string }
    special: { perSession: number; total: number; reason: string }
    weekend: { perSession: number; total: number; reason: string }
    noAssistant15Plus: { perSession: number; total: number; reason: string }
  }
  students: number
  hasAssistant: boolean
  status: ActivityStatus
}

export interface TravelCalculationDetail {
  homeCity: string
  route: string[]
  routeDistances: Array<{ from: string; to: string; km: number }>
  totalKm: number
  allowanceBracket: string
  allowanceAmount: number
}

export interface DailySettlement {
  instructorId: string
  instructorName: string
  date: string
  classCount: number
  totalSessions: number
  teachingBaseAmount: number
  allowancesAmountBreakdown: {
    remote: number
    special: number
    weekend: number
    noAssistant15Plus: number
  }
  equipmentTransportAmount: number
  eventAmount: number
  travelKm: number
  travelAllowance: number
  cancelledSessions: number
  cancelledAmountPreview: number
  grossTotal: number
  activities: DailyActivity[]
  // Detailed calculation breakdown
  calculationDetails: {
    classCalculations: ClassCalculationDetail[]
    travelCalculation: TravelCalculationDetail | null
    eventCalculations: Array<{
      activityId: string
      hours: number
      ratePerHour: number
      amount: number
      status: string
    }>
    equipmentTransport: {
      hasTransport: boolean
      amount: number
      reason: string
    }
    summary: {
      teachingBase: number
      allowancesTotal: number
      equipmentTransport: number
      event: number
      travel: number
      grossTotal: number
    }
  }
}

export interface MonthlySettlement {
  instructorId: string
  instructorName: string
  month: string // YYYY-MM
  totalDays: number
  totalSessions: number
  teachingBaseAmount: number
  allowancesTotal: number
  equipmentTransportAmount: number
  equipmentTransportCapApplied: boolean
  equipmentTransportCapReducedAmount: number
  eventAmount: number
  travelAllowanceTotal: number
  cancelledSessions: number
  cancelledAmountPreview: number
  grossTotal: number
  tax: number // 3.3%
  netTotal: number
  dailySettlements: DailySettlement[]
}

/**
 * Group activities by instructor and date
 */
export function groupByInstructorAndDate(
  activities: DailyActivity[]
): Map<string, Map<string, DailyActivity[]>> {
  const grouped = new Map<string, Map<string, DailyActivity[]>>()

  for (const activity of activities) {
    if (!grouped.has(activity.instructorId)) {
      grouped.set(activity.instructorId, new Map())
    }
    const instructorMap = grouped.get(activity.instructorId)!
    
    if (!instructorMap.has(activity.date)) {
      instructorMap.set(activity.date, [])
    }
    instructorMap.get(activity.date)!.push(activity)
  }

  return grouped
}

/**
 * Compute daily route cities from home to institutions and back
 * Route order: Home -> Inst1 -> Inst2 -> ... -> Home
 * Uses the order provided by activities array (no optimization)
 */
export function computeDailyRouteCities(
  homeCity: string,
  classActivities: ClassActivity[]
): string[] {
  if (classActivities.length === 0) {
    return [homeCity, homeCity]
  }
  
  const route = [homeCity]
  for (const activity of classActivities) {
    route.push(activity.institutionId) // Will be resolved to city later
  }
  route.push(homeCity)
  
  return route
}

/**
 * Get distance between two cities from matrix
 */
export function getDistance(
  cityA: string,
  cityB: string,
  matrix: CityDistanceMatrix
): number {
  if (cityA === cityB) return 0
  
  const cityADistances = matrix[cityA]
  if (!cityADistances) {
    console.warn(`City ${cityA} not found in distance matrix`)
    return 0
  }
  
  const distance = cityADistances[cityB]
  if (distance === undefined) {
    console.warn(`Distance from ${cityA} to ${cityB} not found in matrix`)
    return 0
  }
  
  return distance
}

/**
 * Compute total daily travel km for a route
 */
export function computeDailyTravelKm(
  homeCity: string,
  classActivities: ClassActivity[],
  institutionsById: Map<string, Institution>,
  matrix: CityDistanceMatrix
): number {
  if (classActivities.length === 0) return 0
  
  // Get unique institutions in order (preserve order from activities)
  const institutionIds: string[] = []
  const seen = new Set<string>()
  for (const activity of classActivities) {
    if (!seen.has(activity.institutionId)) {
      institutionIds.push(activity.institutionId)
      seen.add(activity.institutionId)
    }
  }
  
  // Build route: Home -> Inst1 -> Inst2 -> ... -> Home
  const routeCities: string[] = [homeCity]
  for (const instId of institutionIds) {
    const institution = institutionsById.get(instId)
    if (institution) {
      routeCities.push(institution.city)
    }
  }
  routeCities.push(homeCity)
  
  // Calculate total distance
  let totalKm = 0
  for (let i = 0; i < routeCities.length - 1; i++) {
    totalKm += getDistance(routeCities[i], routeCities[i + 1], matrix)
  }
  
  return totalKm
}

/**
 * Compute total daily travel km with detailed breakdown
 */
export function computeDailyTravelKmWithDetail(
  homeCity: string,
  classActivities: ClassActivity[],
  institutionsById: Map<string, Institution>,
  matrix: CityDistanceMatrix
): TravelCalculationDetail | null {
  if (classActivities.length === 0) return null
  
  // Get unique institutions in order (preserve order from activities)
  const institutionIds: string[] = []
  const seen = new Set<string>()
  for (const activity of classActivities) {
    if (!seen.has(activity.institutionId)) {
      institutionIds.push(activity.institutionId)
      seen.add(activity.institutionId)
    }
  }
  
  // Build route: Home -> Inst1 -> Inst2 -> ... -> Home
  const routeCities: string[] = [homeCity]
  for (const instId of institutionIds) {
    const institution = institutionsById.get(instId)
    if (institution) {
      routeCities.push(institution.city)
    }
  }
  routeCities.push(homeCity)
  
  // Calculate distances for each segment
  const routeDistances: Array<{ from: string; to: string; km: number }> = []
  let totalKm = 0
  for (let i = 0; i < routeCities.length - 1; i++) {
    const from = routeCities[i]
    const to = routeCities[i + 1]
    const km = getDistance(from, to, matrix)
    routeDistances.push({ from, to, km })
    totalKm += km
  }
  
  // Calculate allowance
  const allowanceAmount = travelAllowanceFromKm(totalKm)
  
  // Determine allowance bracket description
  let allowanceBracket = ''
  if (totalKm < 50) {
    allowanceBracket = '50km 미만 (지급 없음)'
  } else if (totalKm >= 50 && totalKm < 70) {
    allowanceBracket = '50-70km (20,000원)'
  } else if (totalKm >= 70 && totalKm < 90) {
    allowanceBracket = '70-90km (30,000원)'
  } else if (totalKm >= 90 && totalKm < 110) {
    allowanceBracket = '90-110km (40,000원)'
  } else if (totalKm >= 110 && totalKm < 130) {
    allowanceBracket = '110-130km (50,000원)'
  } else {
    allowanceBracket = '130km 이상 (60,000원)'
  }
  
  return {
    homeCity,
    route: routeCities,
    routeDistances,
    totalKm,
    allowanceBracket,
    allowanceAmount,
  }
}

/**
 * Travel allowance from km (flat brackets)
 */
export function travelAllowanceFromKm(km: number): number {
  if (km < 50) return 0
  if (km >= 50 && km < 70) return 20000
  if (km >= 70 && km < 90) return 30000
  if (km >= 90 && km < 110) return 40000
  if (km >= 110 && km < 130) return 50000
  if (km >= 130) return 60000
  return 0
}

/**
 * Base fee per session by role and level
 */
export function baseFeePerSession(
  role: InstructorRole,
  level: 'ELEMENTARY' | 'MIDDLE' | 'HIGH'
): number {
  if (role === 'MAIN') {
    switch (level) {
      case 'ELEMENTARY': return 40000
      case 'MIDDLE': return 45000
      case 'HIGH': return 50000
    }
  } else {
    // ASSISTANT
    switch (level) {
      case 'ELEMENTARY': return 30000
      case 'MIDDLE': return 35000
      case 'HIGH': return 40000
    }
  }
}

/**
 * Check if date is weekend (Saturday or Sunday)
 */
function isWeekend(dateStr: string): boolean {
  const date = new Date(dateStr)
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday = 0, Saturday = 6
}

/**
 * Allowance per session breakdown
 */
export function allowancePerSession(
  activity: ClassActivity,
  institution: Institution,
  isWeekend: boolean,
  isEvent: boolean
): {
  remote: number
  special: number
  weekend: number
  noAssistant15Plus: number
} {
  const remote = institution.isRemote ? 5000 : 0
  const special = institution.isSpecial ? 10000 : 0
  const weekend = (isWeekend && !isEvent) ? 5000 : 0
  const noAssistant15Plus = 
    (activity.role === 'MAIN' && activity.students >= 15 && !activity.hasAssistant) 
      ? 5000 
      : 0
  
  return { remote, special, weekend, noAssistant15Plus }
}

/**
 * Compute daily settlement for an instructor on a specific date
 */
export function computeDailySettlement(
  instructor: Instructor,
  activitiesForDay: DailyActivity[],
  institutionsById: Map<string, Institution>,
  matrix: CityDistanceMatrix
): DailySettlement {
  // Separate CLASS and EVENT activities
  const classActivities = activitiesForDay.filter(
    (a): a is ClassActivity => a.type === 'CLASS'
  ) as ClassActivity[]
  
  const eventActivities = activitiesForDay.filter(
    (a): a is EventActivity => a.type === 'EVENT'
  ) as EventActivity[]
  
  // Separate confirmed/completed from cancelled
  const confirmedClassActivities = classActivities.filter(
    a => a.status !== 'CANCELLED'
  )
  const cancelledClassActivities = classActivities.filter(
    a => a.status === 'CANCELLED'
  )
  
  const date = activitiesForDay[0]?.date || ''
  const isWeekendDay = isWeekend(date)
  
  // Calculate travel km (only for confirmed classes)
  // Calculate travel with detail
  const travelCalculation = computeDailyTravelKmWithDetail(
    instructor.homeCity,
    confirmedClassActivities,
    institutionsById,
    matrix
  )
  const travelKm = travelCalculation?.totalKm || 0
  const travelAllowance = travelAllowanceFromKm(travelKm)
  
  // Calculate teaching base amount (only confirmed classes) with detailed breakdown
  let teachingBaseAmount = 0
  let totalSessions = 0
  const allowancesBreakdown = {
    remote: 0,
    special: 0,
    weekend: 0,
    noAssistant15Plus: 0,
  }
  
  const classCalculations: ClassCalculationDetail[] = []
  
  for (const activity of confirmedClassActivities) {
    const institution = institutionsById.get(activity.institutionId)
    if (!institution) continue
    
    const baseFee = baseFeePerSession(activity.role, institution.level)
    const sessions = activity.sessions
    const baseAmount = baseFee * sessions
    teachingBaseAmount += baseAmount
    totalSessions += sessions
    
    // Calculate allowances per session
    const allowances = allowancePerSession(activity, institution, isWeekendDay, false)
    const remoteTotal = allowances.remote * sessions
    const specialTotal = allowances.special * sessions
    const weekendTotal = allowances.weekend * sessions
    const noAssistantTotal = allowances.noAssistant15Plus * sessions
    
    allowancesBreakdown.remote += remoteTotal
    allowancesBreakdown.special += specialTotal
    allowancesBreakdown.weekend += weekendTotal
    allowancesBreakdown.noAssistant15Plus += noAssistantTotal
    
    // Store detailed calculation
    classCalculations.push({
      activityId: activity.id,
      institutionName: institution.name,
      institutionLevel: institution.level,
      role: activity.role,
      sessions,
      baseFeePerSession: baseFee,
      baseAmount,
      allowances: {
        remote: {
          perSession: allowances.remote,
          total: remoteTotal,
          reason: institution.isRemote ? '도서벽지 지역' : '해당없음',
        },
        special: {
          perSession: allowances.special,
          total: specialTotal,
          reason: institution.isSpecial ? '특수학급/특수학교' : '해당없음',
        },
        weekend: {
          perSession: allowances.weekend,
          total: weekendTotal,
          reason: isWeekendDay ? '주말(토/일)' : '평일',
        },
        noAssistant15Plus: {
          perSession: allowances.noAssistant15Plus,
          total: noAssistantTotal,
          reason:
            activity.role === 'MAIN' && activity.students >= 15 && !activity.hasAssistant
              ? `학생 ${activity.students}명 이상 + 보조강사 없음`
              : activity.role === 'ASSISTANT'
              ? '보조강사는 해당없음'
              : activity.students < 15
              ? `학생 ${activity.students}명 (15명 미만)`
              : '보조강사 있음',
        },
      },
      students: activity.students,
      hasAssistant: activity.hasAssistant,
      status: activity.status,
    })
  }
  
  // Calculate cancelled amount preview (for display only, not included in gross)
  let cancelledSessions = 0
  let cancelledAmountPreview = 0
  for (const activity of cancelledClassActivities) {
    const institution = institutionsById.get(activity.institutionId)
    if (!institution) continue
    
    const baseFee = baseFeePerSession(activity.role, institution.level)
    cancelledSessions += activity.sessions
    cancelledAmountPreview += baseFee * activity.sessions
  }
  
  // Equipment transport (per day, max 20000)
  const hasEquipmentTransport = activitiesForDay.some(a => a.equipmentTransport)
  const equipmentTransportAmount = hasEquipmentTransport ? 20000 : 0
  
  // Event participation (hourly rate)
  let eventAmount = 0
  for (const event of eventActivities) {
    if (event.status !== 'CANCELLED') {
      eventAmount += event.eventHours * 25000
    }
  }
  
  const allowancesTotal = 
    allowancesBreakdown.remote +
    allowancesBreakdown.special +
    allowancesBreakdown.weekend +
    allowancesBreakdown.noAssistant15Plus
  
  // Event calculations
  const eventCalculations = eventActivities.map(event => ({
    activityId: event.id,
    hours: event.eventHours,
    ratePerHour: 25000,
    amount: event.status !== 'CANCELLED' ? event.eventHours * 25000 : 0,
    status: event.status,
  }))
  
  const grossTotal = 
    teachingBaseAmount +
    allowancesTotal +
    equipmentTransportAmount +
    eventAmount +
    travelAllowance
  
  return {
    instructorId: instructor.id,
    instructorName: instructor.name,
    date,
    classCount: confirmedClassActivities.length,
    totalSessions,
    teachingBaseAmount,
    allowancesAmountBreakdown: allowancesBreakdown,
    equipmentTransportAmount,
    eventAmount,
    travelKm,
    travelAllowance,
    cancelledSessions,
    cancelledAmountPreview,
    grossTotal,
    activities: activitiesForDay,
    calculationDetails: {
      classCalculations,
      travelCalculation,
      eventCalculations,
      equipmentTransport: {
        hasTransport: hasEquipmentTransport,
        amount: equipmentTransportAmount,
        reason: hasEquipmentTransport ? '교구 운반 수행' : '해당없음',
      },
      summary: {
        teachingBase: teachingBaseAmount,
        allowancesTotal,
        equipmentTransport: equipmentTransportAmount,
        event: eventAmount,
        travel: travelAllowance,
        grossTotal,
      },
    },
  }
}

/**
 * Compute monthly settlement summary
 */
export function computeMonthlySettlement(
  dailySettlements: DailySettlement[]
): MonthlySettlement {
  if (dailySettlements.length === 0) {
    throw new Error('No daily settlements provided')
  }
  
  const firstSettlement = dailySettlements[0]
  const month = firstSettlement.date.substring(0, 7) // YYYY-MM
  
  let totalDays = 0
  let totalSessions = 0
  let teachingBaseAmount = 0
  let allowancesTotal = 0
  let equipmentTransportAmount = 0
  let eventAmount = 0
  let travelAllowanceTotal = 0
  let cancelledSessions = 0
  let cancelledAmountPreview = 0
  
  for (const daily of dailySettlements) {
    totalDays++
    totalSessions += daily.totalSessions
    teachingBaseAmount += daily.teachingBaseAmount
    allowancesTotal += 
      daily.allowancesAmountBreakdown.remote +
      daily.allowancesAmountBreakdown.special +
      daily.allowancesAmountBreakdown.weekend +
      daily.allowancesAmountBreakdown.noAssistant15Plus
    equipmentTransportAmount += daily.equipmentTransportAmount
    eventAmount += daily.eventAmount
    travelAllowanceTotal += daily.travelAllowance
    cancelledSessions += daily.cancelledSessions
    cancelledAmountPreview += daily.cancelledAmountPreview
  }
  
  // Equipment transport cap: max 300000 per month
  const equipmentCap = 300000
  let equipmentTransportCapApplied = false
  let equipmentTransportCapReducedAmount = 0
  
  if (equipmentTransportAmount > equipmentCap) {
    equipmentTransportCapApplied = true
    equipmentTransportCapReducedAmount = equipmentTransportAmount - equipmentCap
    equipmentTransportAmount = equipmentCap
  }
  
  const grossTotal = 
    teachingBaseAmount +
    allowancesTotal +
    equipmentTransportAmount +
    eventAmount +
    travelAllowanceTotal
  
  const tax = Math.floor(grossTotal * 0.033) // 3.3%
  const netTotal = grossTotal - tax
  
  return {
    instructorId: firstSettlement.instructorId,
    instructorName: firstSettlement.instructorName,
    month,
    totalDays,
    totalSessions,
    teachingBaseAmount,
    allowancesTotal,
    equipmentTransportAmount,
    equipmentTransportCapApplied,
    equipmentTransportCapReducedAmount,
    eventAmount,
    travelAllowanceTotal,
    cancelledSessions,
    cancelledAmountPreview,
    grossTotal,
    tax,
    netTotal,
    dailySettlements,
  }
}

/**
 * Format number as Korean currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW',
  }).format(amount)
}

/**
 * Format number with commas
 */
export function formatNumber(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount)
}
