// Export all submission-related types and utilities

export * from './submission-types'
export * from './submission-utils'
export * from './submission-mutation'

export { 
  getInstructorSubmissions,
  getAllEducationDocSummaries,
  getEducationDocSummariesByInstructor,
  deriveEducationDocSummary,
  getEvidenceByEducationGrouped,
} from './submission-utils'
export type { EducationDocSummary } from './submission-utils'

