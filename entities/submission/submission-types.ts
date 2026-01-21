// Submission types for grouping documents by education ID

export type DocumentType = 'attendance' | 'activity' | 'equipment' | 'evidence' | 'lessonPlan'
export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface DocumentSubmission {
  id: string
  type: DocumentType
  educationId: string
  status: SubmissionStatus
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectReason?: string
}

export interface EducationSubmissionGroup {
  educationId: string
  educationName: string
  institutionName: string
  instructorName: string
  attendance?: DocumentSubmission
  activity?: DocumentSubmission
  equipment?: DocumentSubmission
  evidence?: DocumentSubmission
  lessonPlan?: DocumentSubmission
  overallStatus: 'ALL_APPROVED' | 'ALL_SUBMITTED' | 'PARTIAL' | 'PENDING' | 'REJECTED'
  submittedAt?: string
  lastUpdatedAt?: string
}

export interface ApprovalAction {
  educationId: string
  documentType: DocumentType
  action: 'approve' | 'reject'
  reason?: string
}

