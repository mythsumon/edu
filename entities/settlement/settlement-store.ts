/**
 * Travel Expense Settlement Store
 * Manages settlement data in localStorage with event-based sync
 */

import type { TravelSettlementRow, DailyTravelRecord, InstitutionCategory, PaymentCountingMode } from './settlement-types'
import type { Education } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'
import { dataStore } from '@/lib/dataStore'
import { defaultDistanceProvider } from './distance-provider'
import { computeTravelExpense, getTravelExpensePolicy } from './travel-expense-calculator'
import { computeAllowance, getAllowancePolicy } from './allowance-calculator'
import { shouldCountForPayment, getPaymentCountingMode } from './payment-counting-mode'
import dayjs from 'dayjs'

const STORAGE_KEY = 'settlements.travel.v1'
const DAILY_TRAVEL_STORAGE_KEY = 'settlements.dailyTravel.v1'

/**
 * Get all settlement rows from localStorage
 * Migrates old data format to new format if needed
 */
export function getSettlementRows(): TravelSettlementRow[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const rows: TravelSettlementRow[] = JSON.parse(stored)
      // Migrate old data: add allowanceWeekend if missing
      return rows.map(row => {
        if (row.allowanceWeekend === undefined) {
          // Set default to 0 for old data
          row.allowanceWeekend = 0
        }
        return row
      })
    }
  } catch (error) {
    console.error('Failed to load settlement rows:', error)
  }
  return []
}

/**
 * Save settlement rows to localStorage
 */
function saveSettlementRows(rows: TravelSettlementRow[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))
    window.dispatchEvent(new CustomEvent('settlementUpdated', { detail: { rows } }))
  } catch (error) {
    console.error('Failed to save settlement rows:', error)
  }
}

/**
 * Get all daily travel records from localStorage
 */
export function getDailyTravelRecords(): DailyTravelRecord[] {
  try {
    const stored = localStorage.getItem(DAILY_TRAVEL_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load daily travel records:', error)
  }
  return []
}

/**
 * Save daily travel records to localStorage
 */
function saveDailyTravelRecords(records: DailyTravelRecord[]): void {
  try {
    localStorage.setItem(DAILY_TRAVEL_STORAGE_KEY, JSON.stringify(records))
  } catch (error) {
    console.error('Failed to save daily travel records:', error)
  }
}

/**
 * Generate a unique ID for a settlement row
 */
function generateSettlementId(
  educationId: string,
  instructorId: string,
  role: 'main' | 'assistant'
): string {
  return `${educationId}_${instructorId}_${role}`
}

/**
 * Get or create instructor data (mock for now)
 * TODO: Replace with actual instructor data from dataStore or API
 */
function getInstructorData(instructorId: string): {
  id: string
  name: string
  homeAddressText?: string
  homeLat?: number
  homeLng?: number
} {
  // Mock instructor data - in real implementation, fetch from dataStore or API
  // For now, return mock data with actual instructor names
  const instructorMap: Record<string, { name: string; homeLat: number; homeLng: number; address: string }> = {
    'instructor-1': {
      name: '홍길동',
      homeLat: 37.2636, // 수원시 좌표
      homeLng: 127.0286,
      address: '경기도 수원시 영통구 월드컵로 123',
    },
    'instructor-2': {
      name: '김보조',
      homeLat: 37.2636, // 수원시 좌표 (김보조 강사 집)
      homeLng: 127.0286,
      address: '경기도 수원시 영통구 광교로 456',
    },
    'instructor-3': {
      name: '이보조',
      homeLat: 37.3594, // 성남시 좌표
      homeLng: 127.1053,
      address: '경기도 성남시 분당구 정자로 789',
    },
    'instructor-4': {
      name: '박정아',
      homeLat: 36.9921, // 평택시 좌표
      homeLng: 127.1120,
      address: '경기도 평택시 평택로 321',
    },
    'instructor-5': {
      name: '김윤미',
      homeLat: 36.9921, // 평택시 좌표
      homeLng: 127.1120,
      address: '경기도 평택시 평택로 654',
    },
  }
  
  const instructor = instructorMap[instructorId]
  if (instructor) {
    return {
      id: instructorId,
      name: instructor.name,
      homeAddressText: instructor.address,
      homeLat: instructor.homeLat,
      homeLng: instructor.homeLng,
    }
  }
  
  // Default fallback
  return {
    id: instructorId,
    name: `강사-${instructorId}`,
    homeAddressText: '서울시 강남구 테헤란로 123',
    homeLat: 37.5013,
    homeLng: 127.0396,
  }
}

/**
 * Get or create institution data (mock for now)
 * TODO: Replace with actual institution data from dataStore or API
 */
function getInstitutionData(institutionName: string): {
  name: string
  schoolAddressText?: string
  schoolLat?: number
  schoolLng?: number
  category: InstitutionCategory
  isRemoteIsland?: boolean
  isSpecialClass?: boolean
} {
  // 학교 유형 추론 (기관명에서 키워드 찾기)
  let category: InstitutionCategory = 'GENERAL'
  const nameLower = institutionName.toLowerCase()
  let isRemoteIsland = false
  let isSpecialClass = false
  
  if (nameLower.includes('초등') || nameLower.includes('초교')) {
    category = 'ELEMENTARY'
  } else if (nameLower.includes('중학교') || nameLower.includes('중학')) {
    category = 'MIDDLE'
  } else if (nameLower.includes('고등학교') || nameLower.includes('고등') || nameLower.includes('고교')) {
    category = 'HIGH'
  } else if (nameLower.includes('특수') || nameLower.includes('특수학교')) {
    category = 'SPECIAL'
    isSpecialClass = true
  } else if (nameLower.includes('도서') || nameLower.includes('벽지') || nameLower.includes('섬')) {
    category = 'ISLAND'
    isRemoteIsland = true
  }
  
  // 도서벽지와 특수는 별도로 체크 (중복 가능)
  if (nameLower.includes('도서') || nameLower.includes('벽지') || nameLower.includes('섬')) {
    isRemoteIsland = true
  }
  if (nameLower.includes('특수') || nameLower.includes('특수학급')) {
    isSpecialClass = true
  }
  
  // Mock institution data with actual coordinates
  const institutionMap: Record<string, { lat: number; lng: number; address: string }> = {
    '수원초등학교': { lat: 37.2636, lng: 127.0286, address: '경기도 수원시 영통구 수원로 100' },
    '성남초등학교': { lat: 37.3594, lng: 127.1053, address: '경기도 성남시 분당구 성남로 200' },
    '용인초등학교': { lat: 37.2411, lng: 127.1776, address: '경기도 용인시 기흥구 용인로 300' },
    '평택안일초등학교': { lat: 36.9921, lng: 127.1120, address: '경기도 평택시 평택로 400' },
    '경기미래채움': { lat: 37.2636, lng: 127.0286, address: '경기도 수원시 영통구 미래로 500' },
    '수원교육청': { lat: 37.2636, lng: 127.0286, address: '경기도 수원시 영통구 교육로 600' },
    '성남교육청': { lat: 37.3594, lng: 127.1053, address: '경기도 성남시 분당구 교육로 700' },
    '고양교육청': { lat: 37.6584, lng: 126.8320, address: '경기도 고양시 덕양구 교육로 800' },
    '용인교육청': { lat: 37.2411, lng: 127.1776, address: '경기도 용인시 기흥구 교육로 900' },
    '부천교육청': { lat: 37.5034, lng: 126.7660, address: '경기도 부천시 원미구 교육로 1000' },
  }
  
  const institution = institutionMap[institutionName]
  if (institution) {
    return {
      name: institutionName,
      schoolAddressText: institution.address,
      schoolLat: institution.lat,
      schoolLng: institution.lng,
      category,
      isRemoteIsland,
      isSpecialClass,
    }
  }
  
  // Default fallback
  return {
    name: institutionName,
    schoolAddressText: `${institutionName} 주소`,
    schoolLat: 37.5665,
    schoolLng: 126.9780,
    category,
    isRemoteIsland,
    isSpecialClass,
  }
}

/**
 * Generate route map image (stub)
 * TODO: Implement with Kakao Maps Static Map API or similar service
 * 경로 지도 이미지를 생성합니다. 필수사항입니다.
 */
function generateRouteMapImage(
  homeLat: number | undefined,
  homeLng: number | undefined,
  institutions: Array<{ lat?: number; lng?: number; name?: string }>
): string | undefined {
  if (!homeLat || !homeLng || institutions.length === 0) {
    return undefined
  }

  // TODO: Kakao Maps Static Map API를 사용하여 실제 지도 이미지 생성
  // 예시: https://apis.map.kakao.com/staticmap/v2?center=37.5665,126.9780&level=3&w=800&h=600&markers=...
  // 
  // 현재는 스텁으로 빈 문자열 반환
  // 실제 구현 시:
  // 1. Kakao Maps Static Map API 호출
  // 2. 경로 표시 (집 → 기관1 → 기관2 → ... → 집)
  // 3. 마커 표시 (집, 각 기관)
  // 4. 이미지를 base64 또는 URL로 저장
  
  return undefined // TODO: 실제 지도 이미지 URL 반환
}

/**
 * Calculate aggregated route distance for multiple institutions
 * Route: Home → Institution 1 → Institution 2 → ... → Home
 * 경유지 포함한 직선거리 기준으로 총 이동거리를 계산합니다.
 * 
 * 계산 방식:
 * 1. 집 → 첫 번째 기관 (직선거리)
 * 2. 첫 번째 기관 → 두 번째 기관 (직선거리)
 * 3. ... (중간 기관들 간 직선거리)
 * 4. 마지막 기관 → 집 (직선거리)
 * 
 * TODO: 최종 구현에서는 Kakao Maps API를 사용하여 실제 도로 경로 거리를 계산합니다.
 */
function calculateAggregatedRouteDistance(
  homeLat: number | undefined,
  homeLng: number | undefined,
  institutions: Array<{ lat?: number; lng?: number; address?: string }>
): number {
  if (!homeLat || !homeLng || institutions.length === 0) {
    return 0
  }

  // 유효한 좌표를 가진 기관만 필터링
  const validInstitutions = institutions.filter(inst => inst.lat && inst.lng)
  if (validInstitutions.length === 0) {
    return 0
  }

  let totalDistance = 0

  // 1. 집 → 첫 번째 기관
  totalDistance += defaultDistanceProvider.getDistanceKm(
    homeLat,
    homeLng,
    validInstitutions[0].lat!,
    validInstitutions[0].lng!
  )

  // 2. 기관들 간의 거리 (경유지 포함)
  for (let i = 0; i < validInstitutions.length - 1; i++) {
    const current = validInstitutions[i]
    const next = validInstitutions[i + 1]
    totalDistance += defaultDistanceProvider.getDistanceKm(
      current.lat!,
      current.lng!,
      next.lat!,
      next.lng!
    )
  }

  // 3. 마지막 기관 → 집
  const lastInstitution = validInstitutions[validInstitutions.length - 1]
  totalDistance += defaultDistanceProvider.getDistanceKm(
    lastInstitution.lat!,
    lastInstitution.lng!,
    homeLat,
    homeLng
  )

  return totalDistance
}

/**
 * Create or update daily travel record for an instructor on a specific date
 */
function createDailyTravelRecord(
  instructorId: string,
  instructorName: string,
  date: string,
  institutions: Array<{
    educationId: string
    educationName: string
    institutionName: string
    institutionAddress?: string
    institutionLat?: number
    institutionLng?: number
    role: 'main' | 'assistant'
    sessionNumber?: number
  }>,
  existingRecords: DailyTravelRecord[]
): DailyTravelRecord {
  const recordId = `${instructorId}_${date}`
  const existing = existingRecords.find(r => r.id === recordId)
  
  const instructor = getInstructorData(instructorId)
  
  // Calculate aggregated route distance
  const institutionData = institutions.map(inst => ({
    lat: inst.institutionLat,
    lng: inst.institutionLng,
    address: inst.institutionAddress
  }))
  
  const totalDistanceKm = calculateAggregatedRouteDistance(
    instructor.homeLat,
    instructor.homeLng,
    institutionData
  )
  
  const distanceSource = totalDistanceKm > 0 ? 'haversine' : 'manual'
  
  // Calculate travel expense based on total route distance
  const travelExpensePolicy = getTravelExpensePolicy()
  const travelExpense = computeTravelExpense(totalDistanceKm, travelExpensePolicy)
  
  const now = new Date().toISOString()
  
  if (existing) {
    // Update existing record
    return {
      ...existing,
      institutions,
      totalDistanceKm: existing.distanceKmOverride ?? totalDistanceKm,
      distanceSource,
      travelExpense: existing.travelExpenseOverride ?? travelExpense,
      updatedAt: now,
    }
  }
  
  // Generate map image (stub - will be implemented with Kakao Maps API)
  // TODO: 실제 Kakao Maps API를 사용하여 경로 지도 이미지 생성
  const routeMapImageUrl = generateRouteMapImage(
    instructor.homeLat,
    instructor.homeLng,
    institutions.map(inst => ({
      lat: inst.institutionLat,
      lng: inst.institutionLng,
      name: inst.institutionName
    }))
  )

  // Create new record
  return {
    id: recordId,
    instructorId,
    instructorName,
    date,
    homeAddress: instructor.homeAddressText,
    homeLat: instructor.homeLat,
    homeLng: instructor.homeLng,
    institutions,
    totalDistanceKm,
    distanceSource,
    travelExpense,
    routeMapImageUrl,
    computedAt: now,
    updatedAt: now,
  }
}

/**
 * Compute settlement row for a single instructor-education pair
 * Now uses daily travel record for travel expense
 */
function computeSettlementRow(
  education: Education,
  assignment: InstructorAssignment,
  instructorId: string,
  instructorName: string,
  role: 'main' | 'assistant',
  countingMode: PaymentCountingMode,
  dailyTravelRecordId?: string,
  dailyTravelExpense?: number,
  lessonDate?: string
): TravelSettlementRow | null {
  const instructor = getInstructorData(instructorId)
  const institution = getInstitutionData(education.institution)

  // Calculate distance (for display purposes, but travel expense comes from daily record)
  const distanceKm = defaultDistanceProvider.getDistanceKm(
    instructor.homeLat,
    instructor.homeLng,
    institution.schoolLat,
    institution.schoolLng,
    instructor.homeAddressText,
    institution.schoolAddressText
  )

  // If distance is 0 and we have addresses, mark as needing manual entry
  const distanceSource = distanceKm > 0 ? 'haversine' : 'manual'

  // Use travel expense from daily travel record (shared across all educations on same day)
  // If not provided, calculate individually (backward compatibility)
  const travelExpense = dailyTravelExpense ?? (() => {
    const travelExpensePolicy = getTravelExpensePolicy()
    return computeTravelExpense(distanceKm, travelExpensePolicy)
  })()

  // Calculate total sessions and weekend sessions
  const totalSessions = education.totalSessions || assignment.lessons?.length || 0
  let weekendSessions = 0
  
  // 주말 세션 수 계산 (토요일 또는 일요일)
  if (assignment.lessons && assignment.lessons.length > 0) {
    assignment.lessons.forEach(lesson => {
      if (lesson.date) {
        const lessonDate = dayjs(lesson.date)
        const dayOfWeek = lessonDate.day() // 0 = Sunday, 6 = Saturday
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          weekendSessions++
        }
      }
    })
  }

  // Check if assistant instructor exists for this education
  const hasAssistant = assignment.assistantInstructorCount > 0
  
  // Get student count (default to 0 if not available)
  // TODO: Add studentCount field to Education interface
  const studentCount = (education as any).studentCount ?? 0

  // Calculate allowance
  const allowancePolicy = getAllowancePolicy()
  const allowance = computeAllowance(
    totalSessions,
    weekendSessions,
    role,
    institution.category,
    allowancePolicy,
    studentCount,
    hasAssistant
  )

  // Check if counting eligible
  const isCountingEligible = shouldCountForPayment(education, [assignment], countingMode)

  const now = new Date().toISOString()

  return {
    id: generateSettlementId(education.educationId, instructorId, role),
    educationId: education.educationId,
    educationName: education.name,
    institutionId: '', // TODO: Get from education or institution data
    institutionName: education.institution,
    institutionCategory: institution.category,
    periodStart: education.periodStart || '',
    periodEnd: education.periodEnd || '',
    totalSessions,
    instructorId,
    instructorName,
    role,
    instructorHomeAddress: instructor.homeAddressText,
    institutionAddress: institution.schoolAddressText,
    dailyTravelRecordId,
    date: lessonDate,
    distanceKm,
    distanceSource,
    travelExpense,
    allowanceBase: allowance.base,
    allowanceWeekend: allowance.weekend,
    allowanceExtra: allowance.extra,
    allowanceBonus: allowance.bonus,
    allowanceTotal: allowance.total,
    totalPay: travelExpense + allowance.total,
    educationStatus: education.status || education.educationStatus || '대기',
    isCountingEligible,
    computedAt: now,
    updatedAt: now,
  }
}

/**
 * Recompute all settlement rows
 * NEW LOGIC: Groups by instructor and date, calculates daily travel records
 * Called when educations, assignments, or policies change
 */
export function recomputeSettlements(): void {
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()
  const countingMode = getPaymentCountingMode()

  // Step 1: Group all lessons by instructor and date
  // Map: instructorId_date -> institutions visited on that day
  type InstructorDateKey = string // `${instructorId}_${date}`
  const dailyInstitutions = new Map<InstructorDateKey, Array<{
    educationId: string
    educationName: string
    institutionName: string
    institutionAddress?: string
    institutionLat?: number
    institutionLng?: number
    role: 'main' | 'assistant'
    sessionNumber?: number
    instructorName: string
  }>>()

  // Process each education with assignments
  educations.forEach(education => {
    const assignment = assignments.find(a => a.educationId === education.educationId)
    if (!assignment || !assignment.lessons) {
      return
    }

    const institution = getInstitutionData(education.institution)

    // Process each lesson
    assignment.lessons.forEach(lesson => {
      if (!lesson.date) return

      // Parse date (handle both YYYY-MM-DD and YYYY.MM.DD formats)
      const lessonDate = dayjs(lesson.date).format('YYYY-MM-DD')
      
      const mainInstructorsList = Array.isArray(lesson.mainInstructors)
        ? lesson.mainInstructors
        : []
      const assistantInstructorsList = Array.isArray(lesson.assistantInstructors)
        ? lesson.assistantInstructors
        : []

      // Add main instructors to daily groups
      mainInstructorsList.forEach(inst => {
        if (inst.id && inst.name) {
          const key: InstructorDateKey = `${inst.id}_${lessonDate}`
          const existing = dailyInstitutions.get(key) || []
          existing.push({
            educationId: education.educationId,
            educationName: education.name,
            institutionName: education.institution,
            institutionAddress: institution.schoolAddressText,
            institutionLat: institution.schoolLat,
            institutionLng: institution.schoolLng,
            role: 'main',
            sessionNumber: lesson.session,
            instructorName: inst.name,
          })
          dailyInstitutions.set(key, existing)
        }
      })

      // Add assistant instructors to daily groups
      assistantInstructorsList.forEach(inst => {
        if (inst.id && inst.name) {
          const key: InstructorDateKey = `${inst.id}_${lessonDate}`
          const existing = dailyInstitutions.get(key) || []
          existing.push({
            educationId: education.educationId,
            educationName: education.name,
            institutionName: education.institution,
            institutionAddress: institution.schoolAddressText,
            institutionLat: institution.schoolLat,
            institutionLng: institution.schoolLng,
            role: 'assistant',
            sessionNumber: lesson.session,
            instructorName: inst.name,
          })
          dailyInstitutions.set(key, existing)
        }
      })
    })
  })

  // Step 2: Create daily travel records
  const existingDailyRecords = getDailyTravelRecords()
  const dailyTravelRecords: DailyTravelRecord[] = []
  const dailyTravelMap = new Map<string, DailyTravelRecord>() // recordId -> record

  dailyInstitutions.forEach((institutions, key) => {
    if (institutions.length === 0) return

    const [instructorId, date] = key.split('_')
    const instructorName = institutions[0].instructorName

    const record = createDailyTravelRecord(
      instructorId,
      instructorName,
      date,
      institutions,
      existingDailyRecords
    )

    dailyTravelRecords.push(record)
    dailyTravelMap.set(record.id, record)
  })

  // Save daily travel records
  saveDailyTravelRecords(dailyTravelRecords)

  // Step 3: Create settlement rows (one per education-instructor-role)
  const rows: TravelSettlementRow[] = []

  educations.forEach(education => {
    const assignment = assignments.find(a => a.educationId === education.educationId)
    if (!assignment || !assignment.lessons) {
      return
    }

    // Collect unique instructors by role from all lessons
    const mainInstructors = new Map<string, string>() // instructorId -> name
    const assistantInstructors = new Map<string, string>()

    assignment.lessons.forEach(lesson => {
      const mainInstructorsList = Array.isArray(lesson.mainInstructors)
        ? lesson.mainInstructors
        : []
      const assistantInstructorsList = Array.isArray(lesson.assistantInstructors)
        ? lesson.assistantInstructors
        : []

      mainInstructorsList.forEach(inst => {
        if (inst.id && inst.name) {
          mainInstructors.set(inst.id, inst.name)
        }
      })

      assistantInstructorsList.forEach(inst => {
        if (inst.id && inst.name) {
          assistantInstructors.set(inst.id, inst.name)
        }
      })
    })

    // Create settlement rows for main instructors
    mainInstructors.forEach((name, instructorId) => {
      // Find the first lesson date for this instructor (for linking to daily travel record)
      const firstLesson = assignment.lessons?.find(lesson => {
        const mainInstructorsList = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
        return mainInstructorsList.some(inst => inst.id === instructorId)
      })
      const lessonDate = firstLesson?.date ? dayjs(firstLesson.date).format('YYYY-MM-DD') : undefined
      const dailyTravelRecordId = lessonDate ? `${instructorId}_${lessonDate}` : undefined
      const dailyTravelRecord = dailyTravelRecordId ? dailyTravelMap.get(dailyTravelRecordId) : undefined

      const row = computeSettlementRow(
        education,
        assignment,
        instructorId,
        name,
        'main',
        countingMode,
        dailyTravelRecordId,
        dailyTravelRecord?.travelExpense,
        lessonDate
      )
      if (row) {
        rows.push(row)
      }
    })

    // Create settlement rows for assistant instructors
    assistantInstructors.forEach((name, instructorId) => {
      // Find the first lesson date for this instructor
      const firstLesson = assignment.lessons?.find(lesson => {
        const assistantInstructorsList = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
        return assistantInstructorsList.some(inst => inst.id === instructorId)
      })
      const lessonDate = firstLesson?.date ? dayjs(firstLesson.date).format('YYYY-MM-DD') : undefined
      const dailyTravelRecordId = lessonDate ? `${instructorId}_${lessonDate}` : undefined
      const dailyTravelRecord = dailyTravelRecordId ? dailyTravelMap.get(dailyTravelRecordId) : undefined

      const row = computeSettlementRow(
        education,
        assignment,
        instructorId,
        name,
        'assistant',
        countingMode,
        dailyTravelRecordId,
        dailyTravelRecord?.travelExpense,
        lessonDate
      )
      if (row) {
        rows.push(row)
      }
    })
  })

  // Preserve overrides from existing rows
  const existingRows = getSettlementRows()
  const overrideMap = new Map<string, TravelSettlementRow>()
  existingRows.forEach(row => {
    if (row.distanceKmOverride !== undefined || 
        row.travelExpenseOverride !== undefined || 
        row.allowanceOverride !== undefined) {
      overrideMap.set(row.id, row)
    }
  })

  // Apply overrides to new rows
  rows.forEach(row => {
    const existing = overrideMap.get(row.id)
    if (existing) {
      if (existing.distanceKmOverride !== undefined) {
        row.distanceKmOverride = existing.distanceKmOverride
        row.distanceKm = existing.distanceKmOverride
        // Recalculate travel expense with override distance
        const travelExpensePolicy = getTravelExpensePolicy()
        row.travelExpense = computeTravelExpense(existing.distanceKmOverride, travelExpensePolicy)
      }
      if (existing.travelExpenseOverride !== undefined) {
        row.travelExpenseOverride = existing.travelExpenseOverride
        row.travelExpense = existing.travelExpenseOverride
      }
      if (existing.allowanceOverride !== undefined) {
        row.allowanceOverride = existing.allowanceOverride
        row.allowanceTotal = existing.allowanceOverride
      }
      row.overrideReason = existing.overrideReason
      row.overrideDate = existing.overrideDate
      row.overrideBy = existing.overrideBy
      row.totalPay = (row.travelExpenseOverride ?? row.travelExpense) + (row.allowanceOverride ?? row.allowanceTotal)
    }
  })

  saveSettlementRows(rows)
}

/**
 * Update a settlement row (for overrides)
 */
export function updateSettlementRow(
  rowId: string,
  updates: {
    distanceKmOverride?: number
    travelExpenseOverride?: number
    allowanceOverride?: number
    overrideReason?: string
    overrideBy?: string
  }
): void {
  const rows = getSettlementRows()
  const index = rows.findIndex(r => r.id === rowId)
  if (index === -1) {
    return
  }

  const row = rows[index]
  const now = new Date().toISOString()

  // Apply updates
  if (updates.distanceKmOverride !== undefined) {
    row.distanceKmOverride = updates.distanceKmOverride
    row.distanceKm = updates.distanceKmOverride
    // Recalculate travel expense if not overridden
    if (row.travelExpenseOverride === undefined) {
      const travelExpensePolicy = getTravelExpensePolicy()
      row.travelExpense = computeTravelExpense(updates.distanceKmOverride, travelExpensePolicy)
    }
  }
  if (updates.travelExpenseOverride !== undefined) {
    row.travelExpenseOverride = updates.travelExpenseOverride
    row.travelExpense = updates.travelExpenseOverride
  }
  if (updates.allowanceOverride !== undefined) {
    row.allowanceOverride = updates.allowanceOverride
    row.allowanceTotal = updates.allowanceOverride
  }
  if (updates.overrideReason !== undefined) {
    row.overrideReason = updates.overrideReason
  }
  if (updates.overrideBy !== undefined) {
    row.overrideBy = updates.overrideBy
  }

  row.overrideDate = now
  row.updatedAt = now
  row.totalPay = (row.travelExpenseOverride ?? row.travelExpense) + (row.allowanceOverride ?? row.allowanceTotal)

  rows[index] = row
  saveSettlementRows(rows)
}

/**
 * Remove override from a settlement row
 */
export function removeSettlementOverride(rowId: string): void {
  const rows = getSettlementRows()
  const index = rows.findIndex(r => r.id === rowId)
  if (index === -1) {
    return
  }

  const row = rows[index]
  
  // Recompute original values
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()
  
  const instructor = getInstructorData(row.instructorId)
  const institution = getInstitutionData(row.institutionName)
  
  const distanceKm = defaultDistanceProvider.getDistanceKm(
    instructor.homeLat,
    instructor.homeLng,
    institution.schoolLat,
    institution.schoolLng,
    instructor.homeAddressText,
    institution.schoolAddressText
  )
  
  // If daily travel record exists, use its travel expense
  let travelExpense = 0
  if (row.dailyTravelRecordId) {
    const dailyRecords = getDailyTravelRecords()
    const dailyRecord = dailyRecords.find(r => r.id === row.dailyTravelRecordId)
    if (dailyRecord) {
      travelExpense = dailyRecord.travelExpenseOverride ?? dailyRecord.travelExpense
    }
  }
  
  // Fallback to individual calculation if no daily record
  if (travelExpense === 0) {
    const travelExpensePolicy = getTravelExpensePolicy()
    travelExpense = computeTravelExpense(distanceKm, travelExpensePolicy)
  }
  
  // Get education and assignment for student count and assistant check
  const education = educations.find(e => e.educationId === row.educationId)
  const assignment = assignments.find(a => a.educationId === row.educationId)
  const hasAssistant = assignment ? assignment.assistantInstructorCount > 0 : false
  const studentCount = (education as any)?.studentCount ?? 0

  // Calculate weekend sessions
  let weekendSessions = 0
  if (assignment?.lessons && row.date) {
    assignment.lessons.forEach(lesson => {
      if (lesson.date) {
        const lessonDate = dayjs(lesson.date).format('YYYY-MM-DD')
        if (lessonDate === row.date) {
          const dayOfWeek = dayjs(lesson.date).day()
          if (dayOfWeek === 0 || dayOfWeek === 6) {
            weekendSessions++
          }
        }
      }
    })
  }

  const allowancePolicy = getAllowancePolicy()
  const allowance = computeAllowance(
    row.totalSessions,
    weekendSessions,
    row.role,
    row.institutionCategory,
    allowancePolicy,
    studentCount,
    hasAssistant
  )

  // Remove overrides
  row.distanceKmOverride = undefined
  row.travelExpenseOverride = undefined
  row.allowanceOverride = undefined
  row.overrideReason = undefined
  row.overrideDate = undefined
  row.overrideBy = undefined
  
  // Restore computed values
  row.distanceKm = distanceKm
  row.travelExpense = travelExpense
  row.allowanceBase = allowance.base
  row.allowanceWeekend = allowance.weekend
  row.allowanceExtra = allowance.extra
  row.allowanceBonus = allowance.bonus
  row.allowanceTotal = allowance.total
  row.totalPay = travelExpense + allowance.total
  row.updatedAt = new Date().toISOString()

  rows[index] = row
  saveSettlementRows(rows)
}

/**
 * Initialize settlement store
 * Sets up event listeners for automatic recomputation
 */
export function initializeSettlementStore(): void {
  // Listen for education updates
  window.addEventListener('educationUpdated', () => {
    recomputeSettlements()
  })

  // Listen for education status updates
  window.addEventListener('educationStatusUpdated', () => {
    recomputeSettlements()
  })

  // Listen for policy updates
  window.addEventListener('settlementPolicyUpdated', () => {
    recomputeSettlements()
  })

  // Initial computation
  recomputeSettlements()
}
