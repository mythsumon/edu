/**
 * Master Code Response DTO (local copy to avoid cross-module imports)
 */
export interface MasterCodeResponseDto {
  id: number
  code: string
  codeName: string
  parentId?: number | null
  createdAt?: string
  updatedAt?: string
}

/**
 * Master Code Children Query Parameters
 */
export interface MasterCodeChildrenParams {
  page?: number
  size?: number
  sort?: string
  q?: string
}

/**
 * Program Response DTO (local copy for program dropdown)
 */
export interface ProgramResponseDto {
  id: number
  programId?: string | null
  name: string
  status?: MasterCodeResponseDto | null
  createdAt: string
  updatedAt: string
}

/**
 * List Programs Query Parameters
 */
export interface ListProgramsParams {
  q?: string
  page?: number
  size?: number
  sort?: string
  statusIds?: number[]
}

/**
 * Institution Response DTO (local copy for institution dropdown)
 */
export interface InstitutionResponseDto {
  id: number
  institutionId?: string | null
  name: string
  createdAt: string
  updatedAt: string
}

/**
 * List Institutions Query Parameters
 */
export interface ListInstitutionsParams {
  q?: string
  page?: number
  size?: number
  sort?: string
  majorCategoryIds?: number[]
  categoryOneIds?: number[]
  categoryTwoIds?: number[]
  classificationIds?: number[]
  districtId?: number
  zoneIds?: number[]
  regionIds?: number[]
  teacherId?: number
}

/**
 * Program Response DTO for Training (nested in training response)
 */
export interface TrainingProgramDto {
  id: number
  programId?: string | null
  name: string
}

/**
 * Institution Response DTO for Training (nested in training response)
 */
export interface TrainingInstitutionDto {
  id: number
  institutionId?: string | null
  name: string
}

/**
 * Admin Training Response DTO (matches backend TrainingResponseDto)
 */
export interface AdminTrainingResponseDto {
  id: number
  trainingId?: string | null
  name: string
  program?: TrainingProgramDto | null
  institution?: TrainingInstitutionDto | null
  description?: string | null
  startDate?: string | null
  endDate?: string | null
  note?: string | null
  grade?: string | null
  classInfo?: string | null
  numberStudents?: number | null
  createdAt: string
  updatedAt: string
}

/**
 * List Admin Trainings Query Parameters
 */
export interface ListAdminTrainingsParams {
  q?: string
  page?: number
  size?: number
  sort?: string
  statusId?: number | null
}

/**
 * Admin Training type for table display
 */
export interface AdminTraining {
  id: number
  trainingId: string
  name: string
  institutionName: string
  grade: string
  classInfo: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

/**
 * Admin Training Create DTO (matches backend TrainingCreateDto)
 */
export interface AdminTrainingCreateDto {
  name: string
  programId: number
  institutionId: number
  description?: string | null
  startDate: string  // ISO date format: YYYY-MM-DD
  endDate: string    // ISO date format: YYYY-MM-DD
  note?: string | null
  grade?: string | null
  classInfo?: string | null
  numberStudents?: number | null
}

/**
 * Admin Training Update DTO (matches backend TrainingUpdateDto)
 */
export interface AdminTrainingUpdateDto {
  name: string
  programId: number
  institutionId: number
  description?: string | null
  startDate: string
  endDate: string
  note?: string | null
  grade?: string | null
  classInfo?: string | null
  numberStudents?: number | null
}

/**
 * Period Item DTO for bulk creation
 */
export interface PeriodItemDto {
  date: string         // ISO date format: YYYY-MM-DD
  startTime: string    // ISO time format: HH:mm:ss
  endTime: string      // ISO time format: HH:mm:ss
  numberMainInstructors?: number | null
  numberAssistantInstructors?: number | null
}

/**
 * Period Bulk Create DTO (matches backend PeriodBulkCreateDto)
 */
export interface PeriodBulkCreateDto {
  trainingId: number
  periods: PeriodItemDto[]
}

/**
 * Period Response DTO
 */
export interface PeriodResponseDto {
  id: number
  date: string
  startTime: string
  endTime: string
  numberMainInstructors?: number | null
  numberAssistantInstructors?: number | null
  trainingId: number
  createdAt: string
  updatedAt: string
}
