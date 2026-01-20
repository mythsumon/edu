/**
 * 교육비 계산 유틸리티
 * 
 * NOTE: This file is kept for backward compatibility.
 * New code should use entities/fee/fee-policy.ts instead.
 * 
 * @deprecated Use entities/fee/fee-policy.ts instead
 */

import { dataStore, type Education } from './dataStore'
import type { InstructorAssignment } from './dataStore'
import {
  shouldCountInstructorFee,
  getEducationFeeContribution,
  calculateTotalFees,
  getFeeSummary,
  type FeePolicy,
  DEFAULT_FEE_POLICY,
} from '@/entities/fee/fee-policy'

export type CalculationMode = 'status-based' | 'assignment-based'

export interface InstructorCost {
  instructorId: string
  instructorName: string
  educationId: string
  educationName: string
  status: string
  cost: number // 강사비 (세션당 비용 * 세션 수)
  sessionCount: number
  isMainInstructor: boolean
}

export interface EducationCostSummary {
  educationId: string
  educationName: string
  status: string
  totalCost: number
  instructorCount: number
  instructors: InstructorCost[]
}

/**
 * 교육 상태가 교육비 계산에서 제외되는지 확인
 */
export function isExcludedStatus(status: string): boolean {
  const excludedStatuses = ['대기', '오픈예정', '강사공개', '취소']
  return excludedStatuses.includes(status)
}

/**
 * 교육 상태가 교육비 계산에 포함되는지 확인 (1안 기준)
 */
export function isIncludedStatus(status: string): boolean {
  return status === '확정' || status === '종료'
}

/**
 * 교육에 강사가 배정되어 있는지 확인
 */
export function hasAssignedInstructors(
  educationId: string,
  assignments: InstructorAssignment[]
): boolean {
  const assignment = assignments.find(a => a.educationId === educationId)
  if (!assignment || !assignment.lessons) return false

  return assignment.lessons.some(lesson => {
    const mainInstructors = Array.isArray(lesson.mainInstructors)
      ? lesson.mainInstructors
      : []
    const assistantInstructors = Array.isArray(lesson.assistantInstructors)
      ? lesson.assistantInstructors
      : []
    
    return mainInstructors.length > 0 || assistantInstructors.length > 0
  })
}

/**
 * 교육의 강사 배정 정보 추출
 */
export function extractInstructorAssignments(
  educationId: string,
  assignments: InstructorAssignment[]
): InstructorCost[] {
  const assignment = assignments.find(a => a.educationId === educationId)
  if (!assignment || !assignment.lessons) return []

  const instructorMap = new Map<string, InstructorCost>()

  assignment.lessons.forEach(lesson => {
    const mainInstructors = Array.isArray(lesson.mainInstructors)
      ? lesson.mainInstructors
      : []
    const assistantInstructors = Array.isArray(lesson.assistantInstructors)
      ? lesson.assistantInstructors
      : []

    // 주강사 처리
    mainInstructors.forEach(instructor => {
      const key = instructor.id || instructor.name
      const existing = instructorMap.get(key)
      
      if (existing) {
        existing.sessionCount += 1
        // 세션당 비용은 실제 비즈니스 로직에 따라 설정 (예: 주강사 50000원/세션)
        existing.cost += 50000 // TODO: 실제 비용 계산 로직으로 대체
      } else {
        instructorMap.set(key, {
          instructorId: instructor.id || '',
          instructorName: instructor.name || '',
          educationId,
          educationName: '', // 교육명은 나중에 채움
          status: '', // 교육 상태는 나중에 채움
          cost: 50000, // TODO: 실제 비용 계산 로직으로 대체
          sessionCount: 1,
          isMainInstructor: true,
        })
      }
    })

    // 보조강사 처리
    assistantInstructors.forEach(instructor => {
      const key = instructor.id || instructor.name
      const existing = instructorMap.get(key)
      
      if (existing) {
        existing.sessionCount += 1
        // 세션당 비용은 실제 비즈니스 로직에 따라 설정 (예: 보조강사 30000원/세션)
        existing.cost += 30000 // TODO: 실제 비용 계산 로직으로 대체
      } else {
        instructorMap.set(key, {
          instructorId: instructor.id || '',
          instructorName: instructor.name || '',
          educationId,
          educationName: '', // 교육명은 나중에 채움
          status: '', // 교육 상태는 나중에 채움
          cost: 30000, // TODO: 실제 비용 계산 로직으로 대체
          sessionCount: 1,
          isMainInstructor: false,
        })
      }
    })
  })

  return Array.from(instructorMap.values())
}

/**
 * 교육비 계산 (1안: 상태 기반)
 * 확정&종료 상태에만 강사비 책정
 */
export function calculateEducationCostByStatus(
  mode: 'status-based' = 'status-based'
): EducationCostSummary[] {
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()
  
  const summaries: EducationCostSummary[] = []

  educations.forEach(education => {
    const status = education.status || education.educationStatus || '대기'
    
    // 1안: 확정&종료 상태에만 포함
    if (!isIncludedStatus(status)) {
      return
    }

    const instructorCosts = extractInstructorAssignments(education.educationId, assignments)
    
    // 교육명과 상태 정보 채우기
    instructorCosts.forEach(cost => {
      cost.educationName = education.name || ''
      cost.status = status
    })

    if (instructorCosts.length > 0) {
      const totalCost = instructorCosts.reduce((sum, cost) => sum + cost.cost, 0)
      
      summaries.push({
        educationId: education.educationId,
        educationName: education.name || '',
        status,
        totalCost,
        instructorCount: instructorCosts.length,
        instructors: instructorCosts,
      })
    }
  })

  return summaries
}

/**
 * 교육비 계산 (2안: 배정 기반)
 * 강사가 배정되어 있는 교육은 상태와 관계없이 강사비 counting
 */
export function calculateEducationCostByAssignment(
  mode: 'assignment-based' = 'assignment-based'
): EducationCostSummary[] {
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()
  
  const summaries: EducationCostSummary[] = []

  educations.forEach(education => {
    const status = education.status || education.educationStatus || '대기'
    
    // 2안: 강사가 배정되어 있는지 확인
    if (!hasAssignedInstructors(education.educationId, assignments)) {
      return
    }

    const instructorCosts = extractInstructorAssignments(education.educationId, assignments)
    
    // 교육명과 상태 정보 채우기
    instructorCosts.forEach(cost => {
      cost.educationName = education.name || ''
      cost.status = status
    })

    if (instructorCosts.length > 0) {
      const totalCost = instructorCosts.reduce((sum, cost) => sum + cost.cost, 0)
      
      summaries.push({
        educationId: education.educationId,
        educationName: education.name || '',
        status,
        totalCost,
        instructorCount: instructorCosts.length,
        instructors: instructorCosts,
      })
    }
  })

  return summaries
}

/**
 * 통합 교육비 계산 함수
 * @param mode 'status-based' (1안) 또는 'assignment-based' (2안)
 * @deprecated Use entities/fee/fee-policy.ts functions instead
 */
export function calculateEducationCost(mode: CalculationMode = 'status-based'): {
  summaries: EducationCostSummary[]
  totalCost: number
  totalInstructors: number
  totalEducations: number
} {
  const educations = dataStore.getEducations()
  const assignments = dataStore.getInstructorAssignments()
  
  // Map CalculationMode to FeePolicy
  const policy: FeePolicy = mode === 'status-based' ? 'STATUS_BASED' : 'ASSIGNMENT_BASED'
  
  // Use centralized fee calculation
  const feeSummary = getFeeSummary(educations, assignments, policy)
  
  // Convert to EducationCostSummary format
  const summaries: EducationCostSummary[] = feeSummary.includedEducations.map(edu => {
    const instructorCosts = extractInstructorAssignments(edu.educationId, assignments)
    instructorCosts.forEach(cost => {
      cost.educationName = edu.name || ''
      cost.status = edu.status || edu.educationStatus || '대기'
    })
    
    return {
      educationId: edu.educationId,
      educationName: edu.name || '',
      status: edu.status || edu.educationStatus || '대기',
      totalCost: getEducationFeeContribution(edu, assignments, policy),
      instructorCount: instructorCosts.length,
      instructors: instructorCosts,
    }
  })

  const totalInstructors = new Set(
    summaries.flatMap(s => s.instructors.map(i => i.instructorId))
  ).size

  return {
    summaries,
    totalCost: feeSummary.totalFees,
    totalInstructors,
    totalEducations: feeSummary.educationCount,
  }
}
