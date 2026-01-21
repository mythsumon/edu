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
 * Ongoing Training Item (for ongoing training cards)
 */
export interface OngoingTrainingItem {
  id: number
  trainingName: string
  institutionName: string
  schedule: {
    startDate: string
    endDate: string
  }
  gradeAndClass: string
  time: {
    startTime: string
    endTime: string
  }
}

/**
 * Completed Training Item (for completed training cards)
 */
export interface CompletedTrainingItem {
  id: number
  trainingName: string
  institutionName: string
  schedule: {
    startDate: string
    endDate: string
  }
  gradeAndClass: string
}

/**
 * Training Application Item (for applied trainings table)
 */
export interface TrainingApplicationItem {
  id: number
  educationId: string
  trainingName: string
  educationalInstitutions: string
  applicationRole: string
  applicationDate: string
  situation: "confirmed" | "atmosphere" | "rejected" | "deleted"
}

/**
 * Training Session Role Option
 */
export interface TrainingSessionRoleOption {
  role: "mainLecturer" | "assistantTeacher"
  status?: "confirmed" | "unconfirmed" | "applied"
  isSelected?: boolean
  isDisabled?: boolean
}

/**
 * Training Session for Application (for apply for lecture table)
 */
export interface TrainingSessionForApplication {
  id: number
  educationId: string
  institutionName: string
  gradeAndClass: string
  trainingName: string
  region: string
  period: {
    startDate: string
    endDate: string
  }
  roles: TrainingSessionRoleOption[]
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
