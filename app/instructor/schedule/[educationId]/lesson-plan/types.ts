export type LessonPlanStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'

export type EducationType = '센터교육' | '방문교육' | '온라인'

export type InstitutionType =
  | '일반학교'
  | '도서관'
  | '도서벽지'
  | '지역아동센터'
  | '특수학급'
  | '수원센터'
  | '의정부센터'
  | '온라인'
  | '연계거점'
  | '기타'

export type TargetLevel = '초등' | '중등' | '고등' | '혼합'

export interface LessonPlanSession {
  sessionNo: number // 회차
  date: string // YYYY-MM-DD
  topic: string // 소주제
  content: string // 활동내용 (multiline)
  materials: string // 준비물
  note?: string // 비고
}

export interface LessonPlanDoc {
  id: string // e.g. LP-2025-001
  educationId: string
  status: LessonPlanStatus
  rejectReason?: string

  // auto-filled from Education (read-only for instructor, editable for admin)
  educationName: string // 교육명
  institutionName: string // 기관명
  className: string // 학급명
  regionCity: string // 지역(시/군)
  startDate: string // 교육시작일 예정 YYYY-MM-DD
  endDate: string // 교육종료일 예정 YYYY-MM-DD
  totalSessions: number // 총 교육 차시
  expectedStudents: number // 교육인원

  // selected fields (selectbox)
  educationType: EducationType
  institutionType: InstitutionType
  institutionTypeEtc?: string // required if institutionType==="기타"
  targetLevel: TargetLevel

  // manual fields
  learningTech: string // 학습기술 (e.g. 엔트리)
  textbook: string // 교육교재 (e.g. 컴퓨터)
  담당자명: string // 기관 담당자
  담당자연락처: string // 기관 담당자 연락처

  goals: string[] // 교육목표 (3 lines or more)

  sessions: LessonPlanSession[]

  authorInstructorId: string // 주강사
  authorInstructorName: string
  createdAt: string
  updatedAt: string

  // Status tracking
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string

  // Signature
  signature?: {
    signedByUserId: string
    signedByUserName: string
    signedAt: string
    signatureImageUrl?: string
  }
}
