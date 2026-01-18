export type EvidenceStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export interface EvidenceItem {
  id: string
  fileUrl: string
  fileName: string
  fileSize: number
  uploadedAt: string
  uploadedBy: string
}

export interface EvidenceDoc {
  id: string
  educationId: string
  educationName: string
  institutionName: string
  instructorName: string
  assistantInstructorName: string // 보조강사명
  items: EvidenceItem[] // 최대 5장
  status: EvidenceStatus
  rejectReason?: string
  rejectedAt?: string
  rejectedBy?: string
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}
