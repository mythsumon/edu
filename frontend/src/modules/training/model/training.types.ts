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
 * Training Response DTO (matches backend TrainingResponseDto)
 */
export interface TrainingResponseDto {
  id: number
  trainingId?: string | null
  name: string
  description?: string | null
  status?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * List Trainings Query Parameters
 */
export interface ListTrainingsParams {
  q?: string
  page?: number
  size?: number
  sort?: string
  statusId?: number | null
}

/**
 * Training type for table display
 */
export interface Training {
  id: number
  trainingId: string
  name: string
  description: string
  status: string
  createdAt: string
  updatedAt: string
}

/**
 * Training Create DTO (matches backend TrainingCreateDto)
 */
export interface TrainingCreateDto {
  name: string
  description?: string | null
  statusId?: number | null
}

/**
 * Training Update DTO (matches backend TrainingUpdateDto)
 */
export interface TrainingUpdateDto {
  name: string
  description?: string | null
  statusId?: number | null
}
