/**
 * Instructor Application Policy Store
 * Manages global, training-specific, and instructor-specific policy overrides
 */

export interface ApplicationPolicy {
  mainInstructorMonthlyMaxHours: number
  assistantInstructorMonthlyMaxHours: number
  dailyMaxApplications: number
  allowMultipleSessionsPerDay: boolean
}

export interface GlobalPolicy extends ApplicationPolicy {
  id: 'GLOBAL'
  policyType: 'GLOBAL'
}

export interface TrainingPolicyOverride extends ApplicationPolicy {
  id: string
  trainingId: string
  policyType: 'TRAINING'
}

export interface InstructorMonthlyOverride extends ApplicationPolicy {
  id: string
  instructorId: string
  yearMonth: string // 'YYYY-MM'
  policyType: 'INSTRUCTOR_MONTH'
}

const STORAGE_KEY_GLOBAL = 'instructor.policy.global'
const STORAGE_KEY_TRAINING_OVERRIDES = 'instructor.policy.trainingOverrides'
const STORAGE_KEY_INSTRUCTOR_OVERRIDES = 'instructor.policy.instructorOverrides'

// Default global policy
const DEFAULT_GLOBAL_POLICY: ApplicationPolicy = {
  mainInstructorMonthlyMaxHours: 20.0,
  assistantInstructorMonthlyMaxHours: 30.0,
  dailyMaxApplications: 1,
  allowMultipleSessionsPerDay: false,
}

/**
 * Get global policy
 */
export function getGlobalPolicy(): GlobalPolicy {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_GLOBAL)
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        id: 'GLOBAL',
        policyType: 'GLOBAL',
        ...DEFAULT_GLOBAL_POLICY,
        ...parsed,
      }
    }
  } catch (error) {
    console.error('Failed to load global policy:', error)
  }
  
  return {
    id: 'GLOBAL',
    policyType: 'GLOBAL',
    ...DEFAULT_GLOBAL_POLICY,
  }
}

/**
 * Save global policy
 */
export function saveGlobalPolicy(policy: Partial<ApplicationPolicy>): void {
  try {
    const current = getGlobalPolicy()
    const updated = { ...current, ...policy }
    localStorage.setItem(STORAGE_KEY_GLOBAL, JSON.stringify(updated))
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('policyUpdated', { detail: { type: 'GLOBAL' } }))
  } catch (error) {
    console.error('Failed to save global policy:', error)
    throw error
  }
}

/**
 * Get all training overrides
 */
function getAllTrainingOverrides(): TrainingPolicyOverride[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_TRAINING_OVERRIDES)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load training overrides:', error)
  }
  return []
}

/**
 * Get training policy override
 */
export function getTrainingOverride(trainingId: string): TrainingPolicyOverride | null {
  const overrides = getAllTrainingOverrides()
  return overrides.find(o => o.trainingId === trainingId) || null
}

/**
 * Save training policy override
 */
export function saveTrainingOverride(trainingId: string, override: Partial<ApplicationPolicy>): void {
  try {
    const overrides = getAllTrainingOverrides()
    const existing = overrides.find(o => o.trainingId === trainingId)
    
    if (existing) {
      // Update existing
      Object.assign(existing, override)
    } else {
      // Create new
      const globalPolicy = getGlobalPolicy()
      const { policyType: _, id: __, ...globalPolicyWithoutType } = globalPolicy
      overrides.push({
        id: `training-${trainingId}`,
        trainingId,
        policyType: 'TRAINING',
        ...globalPolicyWithoutType,
        ...override,
      })
    }
    
    localStorage.setItem(STORAGE_KEY_TRAINING_OVERRIDES, JSON.stringify(overrides))
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('policyUpdated', { 
      detail: { type: 'TRAINING', trainingId } 
    }))
  } catch (error) {
    console.error('Failed to save training override:', error)
    throw error
  }
}

/**
 * Delete training policy override
 */
export function deleteTrainingOverride(trainingId: string): void {
  try {
    const overrides = getAllTrainingOverrides()
    const filtered = overrides.filter(o => o.trainingId !== trainingId)
    localStorage.setItem(STORAGE_KEY_TRAINING_OVERRIDES, JSON.stringify(filtered))
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('policyUpdated', { 
      detail: { type: 'TRAINING', trainingId, deleted: true } 
    }))
  } catch (error) {
    console.error('Failed to delete training override:', error)
    throw error
  }
}

/**
 * Get all instructor monthly overrides
 */
function getAllInstructorOverrides(): InstructorMonthlyOverride[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_INSTRUCTOR_OVERRIDES)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load instructor overrides:', error)
  }
  return []
}

/**
 * Get instructor monthly override
 */
export function getInstructorMonthlyOverride(
  instructorId: string,
  yearMonth: string
): InstructorMonthlyOverride | null {
  const overrides = getAllInstructorOverrides()
  return overrides.find(o => o.instructorId === instructorId && o.yearMonth === yearMonth) || null
}

/**
 * Save instructor monthly override
 */
export function saveInstructorMonthlyOverride(
  instructorId: string,
  yearMonth: string,
  override: Partial<ApplicationPolicy>
): void {
  try {
    const overrides = getAllInstructorOverrides()
    const existing = overrides.find(o => o.instructorId === instructorId && o.yearMonth === yearMonth)
    
    if (existing) {
      // Update existing
      Object.assign(existing, override)
    } else {
      // Create new - resolve from training/global first
      const resolved = resolvePolicy(instructorId, '', yearMonth)
      overrides.push({
        id: `instructor-${instructorId}-${yearMonth}`,
        instructorId,
        yearMonth,
        policyType: 'INSTRUCTOR_MONTH',
        ...resolved,
        ...override,
      })
    }
    
    localStorage.setItem(STORAGE_KEY_INSTRUCTOR_OVERRIDES, JSON.stringify(overrides))
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('policyUpdated', { 
      detail: { type: 'INSTRUCTOR_MONTH', instructorId, yearMonth } 
    }))
  } catch (error) {
    console.error('Failed to save instructor override:', error)
    throw error
  }
}

/**
 * Delete instructor monthly override
 */
export function deleteInstructorMonthlyOverride(instructorId: string, yearMonth: string): void {
  try {
    const overrides = getAllInstructorOverrides()
    const filtered = overrides.filter(
      o => !(o.instructorId === instructorId && o.yearMonth === yearMonth)
    )
    localStorage.setItem(STORAGE_KEY_INSTRUCTOR_OVERRIDES, JSON.stringify(filtered))
    
    // Dispatch event
    window.dispatchEvent(new CustomEvent('policyUpdated', { 
      detail: { type: 'INSTRUCTOR_MONTH', instructorId, yearMonth, deleted: true } 
    }))
  } catch (error) {
    console.error('Failed to delete instructor override:', error)
    throw error
  }
}

/**
 * Resolve policy with priority: Instructor+Month > Training > Global
 */
export function resolvePolicy(
  instructorId: string,
  trainingId: string,
  yearMonth: string // 'YYYY-MM'
): ApplicationPolicy {
  // 1. Load global default policy
  const globalPolicy = getGlobalPolicy()
  
  // 2. Try to load training override
  const trainingOverride = trainingId ? getTrainingOverride(trainingId) : null
  
  // 3. Try to load instructor+month override
  const instructorOverride = getInstructorMonthlyOverride(instructorId, yearMonth)
  
  // 4. Resolve with priority: instructor > training > global
  return {
    mainInstructorMonthlyMaxHours: 
      instructorOverride?.mainInstructorMonthlyMaxHours ??
      trainingOverride?.mainInstructorMonthlyMaxHours ??
      globalPolicy.mainInstructorMonthlyMaxHours,
    
    assistantInstructorMonthlyMaxHours:
      instructorOverride?.assistantInstructorMonthlyMaxHours ??
      trainingOverride?.assistantInstructorMonthlyMaxHours ??
      globalPolicy.assistantInstructorMonthlyMaxHours,
    
    dailyMaxApplications:
      instructorOverride?.dailyMaxApplications ??
      trainingOverride?.dailyMaxApplications ??
      globalPolicy.dailyMaxApplications,
    
    allowMultipleSessionsPerDay:
      instructorOverride?.allowMultipleSessionsPerDay ??
      trainingOverride?.allowMultipleSessionsPerDay ??
      globalPolicy.allowMultipleSessionsPerDay,
  }
}

/**
 * Get all instructor overrides for an instructor
 */
export function getInstructorOverridesForInstructor(instructorId: string): InstructorMonthlyOverride[] {
  const overrides = getAllInstructorOverrides()
  return overrides.filter(o => o.instructorId === instructorId)
}

/**
 * Get all training overrides
 */
export function getAllTrainingOverridesList(): TrainingPolicyOverride[] {
  return getAllTrainingOverrides()
}
