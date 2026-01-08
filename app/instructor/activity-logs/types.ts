export interface ActivityLogSessionRow {
  id: string
  sessionNumber: number
  date: string
  time: string
  activityName: string
}

export interface UploadedImage {
  id: string
  file?: File
  url?: string
  name: string
  size: number
}

export interface ActivityLog {
  id?: string
  logCode: string
  educationType: string
  institutionType: string
  region: string
  institutionName: string
  grade: string
  class: string
  startDate: string
  endDate: string
  totalApplicants: number
  graduateMale: number
  graduateFemale: number
  sessions: ActivityLogSessionRow[]
  photos: UploadedImage[]
  createdAt?: string
  createdBy?: string
  status?: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectReason?: string
  educationId?: string // Link to education program
}

export interface InstructorProfile {
  userId: string
  fullName: string
  signatureImageUrl?: string
}


