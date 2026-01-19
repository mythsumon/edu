/**
 * Schedule Response DTO (matches backend ScheduleResponseDto)
 */
export interface ScheduleResponseDto {
  id: number
  programId: number
  programName: string
  institutionId: number
  institutionName: string
  scheduleDate: string
  startTime: string
  endTime: string
  status: string
  confirmedAt?: string | null
  createdAt: string
  updatedAt: string
}

/**
 * Document Status Item
 */
export interface DocumentStatusItem {
  type: "pending" | "missing" | "completed"
  name: string
  count?: number
}

/**
 * Schedule Item (for table display)
 */
export interface ScheduleItem {
  id: number
  educationId: number
  trainingName: string
  institutionName: string
  documentStatus: DocumentStatusItem[]
  overallStatus: string
  lastModifiedDate: string
  management: string
}

/**
 * Confirmed Schedule Item (for confirmed classes table)
 */
export interface ConfirmedScheduleItem {
  id: number
  educationId: string
  trainingName: string
  educationalInstitutions: string
  region: string
  gradeAndClass: string
  schedule: {
    startDate: string
    endDate: string
  }
}

/**
 * List Schedules Query Parameters
 */
export interface ListSchedulesParams {
  q?: string
  page?: number
  size?: number
  sort?: string
  status?: string
  startDate?: string
  endDate?: string
}
