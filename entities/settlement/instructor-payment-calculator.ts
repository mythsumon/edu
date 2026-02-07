/**
 * Instructor-Centric Payment Calculator
 * 
 * Core Principle: All calculations must be based on the INSTRUCTOR, not the training.
 * The instructor must clearly understand: "Why am I paid this amount?"
 */

import type {
  InstructorDailyPayment,
  InstructorMonthlyPayment,
  InstructorYearlyPayment,
  InstructorPaymentSummary,
  DailyTrainingAssignment,
  DailyTravelRoute,
  DailyTravelAllowance,
  TrainingPaymentBreakdown,
  TrainingRole,
  InstructorRegion,
  InstitutionRegion,
} from './instructor-payment-types'
import type { Education } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'
import { dataStore } from '@/lib/dataStore'
import { getCityDistance, mapCityNameToCode, calculateRouteDistance, type CityCountyCode } from './city-distance-matrix'
import { computeTravelExpense, getTravelExpensePolicy } from './travel-expense-calculator'
import { computeAllowance, getAllowancePolicy } from './allowance-calculator'
import { shouldCountForPayment, getPaymentCountingMode } from './payment-counting-mode'
import { generateRouteMapImageUrl } from './map-image-service'
import dayjs from 'dayjs'

/**
 * Get instructor home region from instructor data
 * TODO: Replace with actual instructor data from API
 */
function getInstructorRegion(instructorId: string): InstructorRegion {
  // Mock instructor data - in real implementation, fetch from API
  const instructorMap: Record<string, { cityCounty: string; address: string; lat?: number; lng?: number }> = {
    'instructor-1': {
      cityCounty: '수원시',
      address: '경기도 수원시 영통구 월드컵로 123',
      lat: 37.2636,
      lng: 127.0286,
    },
    'instructor-2': {
      cityCounty: '수원시',
      address: '경기도 수원시 영통구 광교로 456',
      lat: 37.2636,
      lng: 127.0286,
    },
    'instructor-3': {
      cityCounty: '성남시',
      address: '경기도 성남시 분당구 정자로 789',
      lat: 37.3594,
      lng: 127.1053,
    },
    'instructor-4': {
      cityCounty: '평택시',
      address: '경기도 평택시 평택로 321',
      lat: 36.9921,
      lng: 127.1120,
    },
    'instructor-5': {
      cityCounty: '평택시',
      address: '경기도 평택시 평택로 654',
      lat: 36.9921,
      lng: 127.1120,
    },
  }
  
  const instructor = instructorMap[instructorId]
  if (instructor) {
    const cityCode = mapCityNameToCode(instructor.cityCounty)
    return {
      cityCounty: instructor.cityCounty,
      cityCountyCode: cityCode || undefined,
      address: instructor.address,
      lat: instructor.lat,
      lng: instructor.lng,
    }
  }
  
  // Default fallback
  return {
    cityCounty: '서울시',
    address: '서울시 강남구 테헤란로 123',
  }
}

/**
 * Get institution region from education data
 */
function getInstitutionRegion(education: Education): InstitutionRegion {
  // Extract city/county from institution name or region
  // Try to extract from institution name first
  let cityCounty = education.region || '서울시'
  
  // If region contains city/county name, use it
  if (education.region) {
    // Try to match with known city/county names
    const cityCountyCode = mapCityNameToCode(education.region)
    if (cityCountyCode) {
      cityCounty = education.region
    }
  }
  
  // If institution name contains city/county, extract it
  const institutionName = education.institution || ''
  const cityCountyMatch = institutionName.match(/(수원|성남|용인|평택|고양|부천|안산|안양|화성|김포|오산|이천|광명|시흥|군포|의정부|양주|동두천|포천|가평|연천|파주|여주|양평|광주|하남|남양주|구리|의왕|과천|안성)(시|군)/)
  if (cityCountyMatch) {
    cityCounty = cityCountyMatch[0]
  }
  
  const cityCode = mapCityNameToCode(cityCounty)
  
  return {
    cityCounty,
    cityCountyCode: cityCode || undefined,
    institutionName: education.institution || '',
    address: `${cityCounty} ${education.institution}`,
  }
}

/**
 * Calculate daily travel route and distance
 */
function calculateDailyTravelRoute(
  homeRegion: InstructorRegion,
  institutionRegions: InstitutionRegion[]
): DailyTravelRoute {
  if (institutionRegions.length === 0) {
    return {
      homeRegion,
      institutionRegions: [],
      totalDistanceKm: 0,
      distanceSource: 'fixed_matrix',
      routeDescription: `${homeRegion.cityCounty} → ${homeRegion.cityCounty}`,
    }
  }
  
  // Use fixed distance matrix
  const homeCode = homeRegion.cityCountyCode || mapCityNameToCode(homeRegion.cityCounty)
  const institutionCodes = institutionRegions.map(inst => 
    inst.cityCountyCode || mapCityNameToCode(inst.cityCounty)
  ).filter((code): code is CityCountyCode => code !== null)
  
  let totalDistance = 0
  let currentCity = homeCode
  
  // Calculate route: Home → Inst1 → Inst2 → ... → Home
  for (const instCode of institutionCodes) {
    if (currentCity && instCode) {
      const segmentDistance = getCityDistance(currentCity, instCode)
      totalDistance += segmentDistance
      currentCity = instCode
    }
  }
  
  // Return to home
  if (currentCity && homeCode) {
    const returnDistance = getCityDistance(currentCity, homeCode)
    totalDistance += returnDistance
  }
  
  // Generate route description
  const routeParts = [
    homeRegion.cityCounty,
    ...institutionRegions.map(inst => inst.cityCounty),
    homeRegion.cityCounty,
  ]
  const routeDescription = routeParts.join(' → ')
  
  return {
    homeRegion,
    institutionRegions,
    totalDistanceKm: totalDistance,
    distanceSource: 'fixed_matrix',
    routeDescription,
  }
}

/**
 * Calculate daily travel allowance
 * 
 * Rules:
 * - Calculated ONCE per instructor per day (even if multiple trainings)
 * - Route: Home → Institution(s) → Home (aggregated distance)
 * - Uses fixed city-to-city distance matrix (not live map APIs)
 * - Distance brackets: 20,000 KRW to 60,000 KRW
 * - Under 50 km or same city/county = no payment (0 KRW)
 * - Multiple institutions on same day = travel allowance paid only once
 * - Map image required as evidence (but distance from fixed table)
 */
function calculateDailyTravelAllowance(
  route: DailyTravelRoute
): DailyTravelAllowance {
  const distanceKm = route.totalDistanceKm
  
  // Same region = 0 km = 0 KRW
  // Under 50 km = 0 KRW (per requirements)
  if (distanceKm === 0) {
    return {
      totalDistanceKm: 0,
      distanceBracket: { minKm: 0, maxKm: 50, amount: 0 },
      amount: 0,
      explanation: `동일 지역 이동 (${route.homeRegion.cityCounty}): 출장수당 없음\n• 같은 시/군 내 이동은 거리 0km로 계산\n• 50km 미만 또는 동일 지역 = 출장수당 지급 없음`,
      mapImageUrl: route.mapImageUrl,
    }
  }
  
  // Use travel expense policy to determine bracket
  const policy = getTravelExpensePolicy()
  const amount = computeTravelExpense(distanceKm, policy)
  
  // Find matching bracket for explanation
  let bracket = policy.find(entry => {
    if (distanceKm >= entry.minKm) {
      if (entry.maxKm === null || distanceKm < entry.maxKm) {
        return true
      }
    }
    return false
  })
  
  if (!bracket) {
    bracket = { minKm: 0, maxKm: 50, amount: 0 }
  }
  
  const bracketDescription = bracket.maxKm === null
    ? `${bracket.minKm}km 이상`
    : `${bracket.minKm}km ~ ${bracket.maxKm}km`
  
  // Enhanced explanation with calculation details
  const explanation = `총 이동거리 ${distanceKm.toFixed(1)}km (${route.routeDescription})\n• 거리 구간: ${bracketDescription}\n• 출장수당: ${amount.toLocaleString()}원\n• 계산 기준: 고정 거리표 (31개 시군청간 거리표)\n• 같은 날 여러 기관 방문 시에도 하루 1회만 지급`
  
  return {
    totalDistanceKm: distanceKm,
    distanceBracket: {
      minKm: bracket.minKm,
      maxKm: bracket.maxKm,
      amount: bracket.amount,
    },
    amount,
    explanation,
    mapImageUrl: route.mapImageUrl,
  }
}

/**
 * Calculate payment breakdown for a training
 */
function calculateTrainingPayment(
  training: DailyTrainingAssignment,
  role: TrainingRole
): TrainingPaymentBreakdown {
  // Base rate per session based on role
  const ratePerSession = role === 'main' ? 40000 : 30000
  
  // Check if weekend (주말) - check if date is Saturday (6) or Sunday (0)
  const date = new Date(training.date)
  const dayOfWeek = date.getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  
  // Weekend allowance (휴일/주말 수당) - 5,000원 per session
  // Rule: 차시별 Date가 weekend일 경우 차시당 추가 강사료 5,000원
  // Exception: 행사참여수당과 중복 지급 불가 (행사참여 시 주말수당 제외)
  // Note: isEventParticipation would need to be added to DailyTrainingAssignment if needed
  // For now, we calculate weekend allowance for all weekend sessions
  const weekendAllowancePerSession = 5000
  const weekendSessions = isWeekend ? training.sessionCount : 0
  // TODO: Exclude weekend allowance if isEventParticipation is true
  const weekendAllowance = weekendSessions * weekendAllowancePerSession
  
  // Calculate base payment
  const paymentAmount = ratePerSession * training.sessionCount
  
  // Calculate total with weekend allowance
  const totalAmount = paymentAmount + weekendAllowance
  
  // Build payment formula
  let paymentFormula = `${ratePerSession.toLocaleString()}원 × ${training.sessionCount}차시 = ${paymentAmount.toLocaleString()}원`
  if (weekendAllowance > 0) {
    paymentFormula += ` + 주말수당(${weekendAllowancePerSession.toLocaleString()}원 × ${weekendSessions}차시) = ${totalAmount.toLocaleString()}원`
  }
  
  return {
    training,
    role,
    sessionCount: training.sessionCount,
    ratePerSession,
    paymentFormula,
    paymentAmount,
    additionalAllowances: {
      weekend: weekendAllowance,
    },
    totalAmount,
  }
}

/**
 * Calculate daily payment for an instructor
 */
function calculateInstructorDailyPayment(
  instructorId: string,
  instructorName: string,
  date: string,
  trainings: DailyTrainingAssignment[],
  homeRegion: InstructorRegion
): InstructorDailyPayment {
  // Group trainings by role
  const trainingsByRole = trainings.reduce((acc, training) => {
    if (!acc[training.role]) {
      acc[training.role] = []
    }
    acc[training.role].push(training)
    return acc
  }, {} as Record<TrainingRole, DailyTrainingAssignment[]>)
  
  // Calculate payment for each training
  const trainingPayments: TrainingPaymentBreakdown[] = []
  let totalTrainingPayment = 0
  
  trainings.forEach(training => {
    const payment = calculateTrainingPayment(training, training.role)
    trainingPayments.push(payment)
    totalTrainingPayment += payment.totalAmount
  })
  
  // Calculate travel allowance (once per day)
  const institutionRegions = trainings.map(t => t.institution)
  const route = calculateDailyTravelRoute(homeRegion, institutionRegions)
  
  // Generate map image
  const mapImageUrl = generateRouteMapImageUrl(homeRegion, institutionRegions)
  route.mapImageUrl = mapImageUrl
  
  const travelAllowance = calculateDailyTravelAllowance(route)
  
  // Total payment for the day
  const totalPayment = totalTrainingPayment + travelAllowance.amount
  
  // Generate payment explanation
  const paymentParts: string[] = []
  
  // Training payments
  if (trainingPayments.length > 0) {
    const mainPayments = trainingPayments.filter(p => p.role === 'main')
    const assistantPayments = trainingPayments.filter(p => p.role === 'assistant')
    
    if (mainPayments.length > 0) {
      const mainTotal = mainPayments.reduce((sum, p) => sum + p.totalAmount, 0)
      paymentParts.push(`주강사: ${mainTotal.toLocaleString()}원`)
    }
    
    if (assistantPayments.length > 0) {
      const assistantTotal = assistantPayments.reduce((sum, p) => sum + p.totalAmount, 0)
      paymentParts.push(`보조강사: ${assistantTotal.toLocaleString()}원`)
    }
  }
  
  // Travel allowance
  if (travelAllowance.amount > 0) {
    paymentParts.push(`출장수당: ${travelAllowance.amount.toLocaleString()}원`)
  } else {
    paymentParts.push(`출장수당: 0원 (${travelAllowance.explanation})`)
  }
  
  const paymentExplanation = paymentParts.join(' + ') + ` = ${totalPayment.toLocaleString()}원`
  
  return {
    date,
    instructorId,
    instructorName,
    trainings,
    trainingPayments,
    travelAllowance,
    totalPayment,
    paymentExplanation,
  }
}

/**
 * Calculate monthly payment for an instructor
 */
export function calculateInstructorMonthlyPayment(
  instructorId: string,
  instructorName: string,
  month: string, // YYYY-MM
  dailyPayments: InstructorDailyPayment[]
): InstructorMonthlyPayment {
  const totalDays = dailyPayments.length
  const totalSessions = dailyPayments.reduce((sum, day) => 
    sum + day.trainings.reduce((s, t) => s + t.sessionCount, 0), 0
  )
  const totalTrainingPayment = dailyPayments.reduce((sum, day) => 
    sum + day.trainingPayments.reduce((s, p) => s + p.totalAmount, 0), 0
  )
  const totalTravelAllowance = dailyPayments.reduce((sum, day) => 
    sum + day.travelAllowance.amount, 0
  )
  const totalPayment = totalTrainingPayment + totalTravelAllowance
  
  // Calculate eligible payment (only for Confirmed or Completed trainings)
  const eligibleDays = dailyPayments.filter(day => 
    day.trainings.some(t => t.isCountingEligible)
  ).length
  const eligiblePayment = dailyPayments.reduce((sum, day) => {
    const eligibleTrainingPayment = day.trainingPayments
      .filter(p => p.training.isCountingEligible)
      .reduce((s, p) => s + p.totalAmount, 0)
    // Travel allowance is counted if at least one training is eligible
    const travelAllowance = day.trainings.some(t => t.isCountingEligible)
      ? day.travelAllowance.amount
      : 0
    return sum + eligibleTrainingPayment + travelAllowance
  }, 0)
  
  return {
    instructorId,
    instructorName,
    month,
    totalDays,
    totalSessions,
    totalTrainingPayment,
    totalTravelAllowance,
    totalPayment,
    dailyPayments,
    eligibleDays,
    eligiblePayment,
  }
}

/**
 * Calculate instructor payment summary from all educations and assignments
 */
export function calculateInstructorPaymentSummary(
  instructorId: string,
  instructorName: string,
  educations: Education[],
  assignments: InstructorAssignment[],
  countingMode: ReturnType<typeof getPaymentCountingMode>
): InstructorPaymentSummary {
  const homeRegion = getInstructorRegion(instructorId)
  
  // Group lessons by instructor and date
  type InstructorDateKey = string // `${instructorId}_${date}`
  const dailyTrainings = new Map<InstructorDateKey, DailyTrainingAssignment[]>()
  
  educations.forEach(education => {
    const assignment = assignments.find(a => a.educationId === education.educationId)
    if (!assignment || !assignment.lessons) {
      return
    }
    
    const institutionRegion = getInstitutionRegion(education)
    const isCountingEligible = shouldCountForPayment(education, [assignment], countingMode)
    
    assignment.lessons.forEach(lesson => {
      if (!lesson.date) return
      
      const lessonDate = dayjs(lesson.date).format('YYYY-MM-DD')
      
      // Process main instructors
      const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
      mainInstructors.forEach(inst => {
        if (inst.id === instructorId) {
          const key: InstructorDateKey = `${instructorId}_${lessonDate}`
          const existing = dailyTrainings.get(key) || []
          
          existing.push({
            educationId: education.educationId,
            educationName: education.name,
            institution: institutionRegion,
            role: 'main',
            sessionCount: 1,
            sessionNumbers: lesson.session ? [lesson.session] : undefined,
            date: lessonDate,
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            educationStatus: education.status || education.educationStatus || '대기',
            isCountingEligible,
            // 교육 생성 시 구분하는 필드 사용
            isSpecialEducation: education.isSpecialEducation ?? false,
            isRemoteIsland: education.isRemoteIsland ?? false,
            educationLevel: education.educationLevel,
          })
          
          dailyTrainings.set(key, existing)
        }
      })
      
      // Process assistant instructors
      const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
      assistantInstructors.forEach(inst => {
        if (inst.id === instructorId) {
          const key: InstructorDateKey = `${instructorId}_${lessonDate}`
          const existing = dailyTrainings.get(key) || []
          
          existing.push({
            educationId: education.educationId,
            educationName: education.name,
            institution: institutionRegion,
            role: 'assistant',
            sessionCount: 1,
            sessionNumbers: lesson.session ? [lesson.session] : undefined,
            date: lessonDate,
            startTime: lesson.startTime,
            endTime: lesson.endTime,
            educationStatus: education.status || education.educationStatus || '대기',
            isCountingEligible,
            // 교육 생성 시 구분하는 필드 사용
            isSpecialEducation: education.isSpecialEducation ?? false,
            isRemoteIsland: education.isRemoteIsland ?? false,
            educationLevel: education.educationLevel,
          })
          
          dailyTrainings.set(key, existing)
        }
      })
    })
  })
  
  // Calculate daily payments
  const dailyPaymentsMap = new Map<string, InstructorDailyPayment[]>() // month -> daily payments
  
  dailyTrainings.forEach((trainings, key) => {
    const [_, date] = key.split('_')
    const month = dayjs(date).format('YYYY-MM')
    
    const dailyPayment = calculateInstructorDailyPayment(
      instructorId,
      instructorName,
      date,
      trainings,
      homeRegion
    )
    
    const existing = dailyPaymentsMap.get(month) || []
    existing.push(dailyPayment)
    dailyPaymentsMap.set(month, existing)
  })
  
  // Sort daily payments by date
  dailyPaymentsMap.forEach((payments, month) => {
    payments.sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
  })
  
  // Calculate monthly payments
  const monthlyPayments: InstructorMonthlyPayment[] = []
  dailyPaymentsMap.forEach((dailyPayments, month) => {
    const monthlyPayment = calculateInstructorMonthlyPayment(
      instructorId,
      instructorName,
      month,
      dailyPayments
    )
    monthlyPayments.push(monthlyPayment)
  })
  
  // Sort by month
  monthlyPayments.sort((a, b) => a.month.localeCompare(b.month))
  
  // Group monthly payments by year
  const yearlyPaymentsMap = new Map<string, InstructorMonthlyPayment[]>()
  monthlyPayments.forEach(monthlyPayment => {
    const year = dayjs(monthlyPayment.month).format('YYYY')
    const existing = yearlyPaymentsMap.get(year) || []
    existing.push(monthlyPayment)
    yearlyPaymentsMap.set(year, existing)
  })
  
  // Calculate yearly payments
  const yearlyPayments: InstructorYearlyPayment[] = []
  yearlyPaymentsMap.forEach((monthlyPayments, year) => {
    const totalMonths = monthlyPayments.length
    const totalDays = monthlyPayments.reduce((sum, m) => sum + m.totalDays, 0)
    const totalSessions = monthlyPayments.reduce((sum, m) => sum + m.totalSessions, 0)
    const totalTrainingPayment = monthlyPayments.reduce((sum, m) => sum + m.totalTrainingPayment, 0)
    const totalTravelAllowance = monthlyPayments.reduce((sum, m) => sum + m.totalTravelAllowance, 0)
    const totalPayment = monthlyPayments.reduce((sum, m) => sum + m.totalPayment, 0)
    const eligibleDays = monthlyPayments.reduce((sum, m) => sum + m.eligibleDays, 0)
    const eligiblePayment = monthlyPayments.reduce((sum, m) => sum + m.eligiblePayment, 0)
    
    yearlyPayments.push({
      instructorId,
      instructorName,
      year,
      totalMonths,
      totalDays,
      totalSessions,
      totalTrainingPayment,
      totalTravelAllowance,
      totalPayment,
      monthlyPayments,
      eligibleDays,
      eligiblePayment,
    })
  })
  
  // Sort by year (descending)
  yearlyPayments.sort((a, b) => b.year.localeCompare(a.year))
  
  // Calculate overall statistics
  const totalYears = yearlyPayments.length
  const totalMonths = yearlyPayments.reduce((sum, y) => sum + y.totalMonths, 0)
  const totalDays = yearlyPayments.reduce((sum, y) => sum + y.totalDays, 0)
  const totalSessions = yearlyPayments.reduce((sum, y) => sum + y.totalSessions, 0)
  const totalPayment = yearlyPayments.reduce((sum, y) => sum + y.totalPayment, 0)
  const eligiblePayment = yearlyPayments.reduce((sum, y) => sum + y.eligiblePayment, 0)
  
  return {
    instructorId,
    instructorName,
    homeRegion,
    yearlyPayments,
    totalYears,
    totalMonths,
    totalDays,
    totalSessions,
    totalPayment,
    eligiblePayment,
  }
}

/**
 * Get payment summary for all instructors
 */
export function calculateAllInstructorPayments(
  educations: Education[],
  assignments: InstructorAssignment[]
): InstructorPaymentSummary[] {
  const countingMode = getPaymentCountingMode()
  
  // Get unique instructor IDs
  const instructorIds = new Set<string>()
  assignments.forEach(assignment => {
    if (assignment.lessons) {
      assignment.lessons.forEach(lesson => {
        const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
        const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
        
        mainInstructors.forEach(inst => {
          if (inst.id) instructorIds.add(inst.id)
        })
        assistantInstructors.forEach(inst => {
          if (inst.id) instructorIds.add(inst.id)
        })
      })
    }
  })
  
  // Calculate payment for each instructor
  const summaries: InstructorPaymentSummary[] = []
  instructorIds.forEach(instructorId => {
    // Get instructor name from assignments
    let instructorName = `강사-${instructorId}`
    for (const assignment of assignments) {
      if (assignment.lessons) {
        for (const lesson of assignment.lessons) {
          const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
          const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
          
          const inst = [...mainInstructors, ...assistantInstructors].find(i => i.id === instructorId)
          if (inst && inst.name) {
            instructorName = inst.name
            break
          }
        }
        if (instructorName !== `강사-${instructorId}`) break
      }
    }
    
    const summary = calculateInstructorPaymentSummary(
      instructorId,
      instructorName,
      educations,
      assignments,
      countingMode
    )
    summaries.push(summary)
  })
  
  return summaries
}
