// Attendance storage utilities
// Stores attendance data in localStorage

export interface AttendanceDocument {
  id: string
  educationId: string
  assignmentId?: string
  location: string
  institution: string
  gradeClass: string
  programName: string
  totalSessions: number
  maleCount: number
  femaleCount: number
  schoolContactName: string
  institutionContact: {
    name: string
    phone: string
    email: string
  }
  signatures: {
    school?: {
      signedByUserId: string
      signedByUserName: string
      signedAt: string
      signatureImageUrl: string
    }
    session1MainInstructor?: {
      signedByUserId: string
      signedByUserName: string
      signedAt: string
      signatureImageUrl: string
    }
    session1AssistantInstructor?: {
      signedByUserId: string
      signedByUserName: string
      signedAt: string
      signatureImageUrl: string
    }
    session2MainInstructor?: {
      signedByUserId: string
      signedByUserName: string
      signedAt: string
      signatureImageUrl: string
    }
    session2AssistantInstructor?: {
      signedByUserId: string
      signedByUserName: string
      signedAt: string
      signatureImageUrl: string
    }
  }
  sessions: Array<{
    sessionNumber: number
    date: string
    startTime: string
    endTime: string
    sessions: number
    mainInstructor: string
    assistantInstructor: string
    institutionContacts: string[]
    studentCount: number
    attendanceCount: number
  }>
  students: Array<{
    id: string
    number: number
    name: string
    gender: '남' | '여'
    sessionAttendances: number[]
    completionStatus: 'O' | 'X'
    isTransferred?: boolean
  }>
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectReason?: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'attendance_documents'

function isQuotaError(error: unknown): boolean {
  return (
    typeof DOMException !== 'undefined' &&
    error instanceof DOMException &&
    (error.name === 'QuotaExceededError' || (error as DOMException).code === 22 || error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
  )
}

function getDummyAttendanceDocs(): AttendanceDocument[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'attendance-1',
      educationId: 'edu-001',
      location: '서울특별시 강남구',
      institution: '평성중학교',
      gradeClass: '3학년 1반',
      programName: '생성형 AI / 챗봇 교육',
      totalSessions: 4,
      maleCount: 15,
      femaleCount: 15,
      schoolContactName: '김교장',
      institutionContact: {
        name: '이선생',
        phone: '02-123-4567',
        email: 'lee@school.com'
      },
      signatures: {
        school: {
          signedByUserId: 'school-1',
          signedByUserName: '김교장',
          signedAt: weekAgo,
          signatureImageUrl: '/mock/signatures/kim.png'
        },
        session1MainInstructor: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: weekAgo,
          signatureImageUrl: '/mock/signatures/hong.png'
        }
      },
      sessions: [
        {
          sessionNumber: 1,
          date: '2024-01-15',
          startTime: '09:00',
          endTime: '12:00',
          sessions: 1,
          mainInstructor: '홍길동',
          assistantInstructor: '김철수',
          institutionContacts: ['이선생'],
          studentCount: 30,
          attendanceCount: 28
        },
        {
          sessionNumber: 2,
          date: '2024-01-16',
          startTime: '09:00',
          endTime: '12:00',
          sessions: 1,
          mainInstructor: '홍길동',
          assistantInstructor: '김철수',
          institutionContacts: ['이선생'],
          studentCount: 30,
          attendanceCount: 29
        }
      ],
      students: [
        { id: 'student-1', number: 1, name: '김민수', gender: '남', sessionAttendances: [1, 1], completionStatus: 'O' },
        { id: 'student-2', number: 2, name: '이영희', gender: '여', sessionAttendances: [1, 1], completionStatus: 'O' },
        { id: 'student-3', number: 3, name: '박지민', gender: '남', sessionAttendances: [1, 0], completionStatus: 'X' }
      ],
      status: 'APPROVED',
      submittedAt: weekAgo,
      submittedBy: '홍길동',
      approvedAt: weekAgo,
      approvedBy: '관리자',
      createdAt: weekAgo,
      updatedAt: weekAgo
    },
    {
      id: 'attendance-2',
      educationId: 'edu-002',
      location: '서울특별시 서초구',
      institution: '서초고등학교',
      gradeClass: '2학년 3반',
      programName: '메타버스 교육',
      totalSessions: 6,
      maleCount: 12,
      femaleCount: 18,
      schoolContactName: '박교장',
      institutionContact: {
        name: '최선생',
        phone: '02-987-6543',
        email: 'choi@school.com'
      },
      signatures: {
        session1MainInstructor: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: yesterday,
          signatureImageUrl: '/mock/signatures/hong.png'
        }
      },
      sessions: [
        {
          sessionNumber: 1,
          date: '2024-01-20',
          startTime: '13:00',
          endTime: '17:00',
          sessions: 1,
          mainInstructor: '홍길동',
          assistantInstructor: '이영희',
          institutionContacts: ['최선생'],
          studentCount: 30,
          attendanceCount: 30
        }
      ],
      students: [
        { id: 'student-4', number: 1, name: '정수진', gender: '여', sessionAttendances: [1], completionStatus: 'O' },
        { id: 'student-5', number: 2, name: '강민호', gender: '남', sessionAttendances: [1], completionStatus: 'O' }
      ],
      status: 'SUBMITTED',
      submittedAt: yesterday,
      submittedBy: '홍길동',
      createdAt: yesterday,
      updatedAt: yesterday
    },
    {
      id: 'attendance-3',
      educationId: 'edu-003',
      location: '부산광역시 해운대구',
      institution: '부산중학교',
      gradeClass: '1학년 2반',
      programName: '코딩 교육',
      totalSessions: 8,
      maleCount: 14,
      femaleCount: 16,
      schoolContactName: '정교장',
      institutionContact: {
        name: '한선생',
        phone: '051-123-4567',
        email: 'han@school.com'
      },
      signatures: {},
      sessions: [
        {
          sessionNumber: 1,
          date: '2024-01-10',
          startTime: '10:00',
          endTime: '12:00',
          sessions: 1,
          mainInstructor: '김철수',
          assistantInstructor: '박영희',
          institutionContacts: ['한선생'],
          studentCount: 30,
          attendanceCount: 25
        }
      ],
      students: [
        { id: 'student-6', number: 1, name: '윤지우', gender: '남', sessionAttendances: [1], completionStatus: 'O' },
        { id: 'student-7', number: 2, name: '송미나', gender: '여', sessionAttendances: [1], completionStatus: 'O' }
      ],
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now
    }
  ]
}

export function getAttendanceDocs(): AttendanceDocument[] {
  if (typeof window === 'undefined') return getDummyAttendanceDocs()

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // Initialize with dummy data if no stored data exists
      const dummyData = getDummyAttendanceDocs()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyData))
      return dummyData
    }
    return JSON.parse(stored)
  } catch (error) {
    console.warn('Failed to read attendance documents from localStorage.', error)
    return getDummyAttendanceDocs()
  }
}

export function getAttendanceDocById(id: string): AttendanceDocument | undefined {
  const docs = getAttendanceDocs()
  return docs.find(doc => doc.id === id)
}

export function getAttendanceDocByEducationId(educationId: string): AttendanceDocument | undefined {
  const docs = getAttendanceDocs()
  return docs.find(doc => doc.educationId === educationId)
}

type CleanupResult = {
  docs: AttendanceDocument[]
  cleaned: number
}

function cleanupOldAttendanceDocs(docs: AttendanceDocument[]): CleanupResult {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const recentDocs = docs
    .filter(doc => new Date(doc.updatedAt) > thirtyDaysAgo)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  const docsToKeep = recentDocs.slice(0, 50)
  return {
    docs: docsToKeep,
    cleaned: docs.length - docsToKeep.length,
  }
}

function dropOldestDoc(docs: AttendanceDocument[], keepId: string): { docs: AttendanceDocument[]; removed: AttendanceDocument | null } | null {
  const statusPriority: Record<AttendanceDocument['status'], number> = {
    APPROVED: 0,
    REJECTED: 1,
    SUBMITTED: 2,
    DRAFT: 3,
  }

  const removable = docs
    .filter(doc => doc.id !== keepId)
    .sort((a, b) => {
      const statusDiff = statusPriority[a.status] - statusPriority[b.status]
      if (statusDiff !== 0) return statusDiff
      return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
    })

  if (removable.length === 0) {
    return null
  }

  const toRemove = removable[0]
  return {
    docs: docs.filter(doc => doc.id !== toRemove.id),
    removed: toRemove,
  }
}

export function upsertAttendanceDoc(doc: AttendanceDocument): { success: boolean; error?: string } {
  const docs = getAttendanceDocs()
  const index = docs.findIndex(d => d.id === doc.id)
  const updatedDoc = {
    ...doc,
    updatedAt: new Date().toISOString(),
  }

  if (index >= 0) {
    docs[index] = updatedDoc
  } else {
    docs.push(updatedDoc)
  }

  let docsToPersist = docs

  while (true) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docsToPersist))
      // Dispatch custom event for real-time updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('attendanceUpdated'))
      }
      return { success: true }
    } catch (error) {
      if (!isQuotaError(error)) {
        console.error('Storage error:', error)
        return {
          success: false,
          error: '저장 중 오류가 발생했습니다.',
        }
      }

      const cleanupResult = cleanupOldAttendanceDocs(docsToPersist)
      if (cleanupResult.cleaned > 0) {
        docsToPersist = cleanupResult.docs
        console.warn('Cleaned up', cleanupResult.cleaned, 'attendance documents before retrying save.')
        continue
      }

      const dropResult = dropOldestDoc(docsToPersist, doc.id)
      if (!dropResult || dropResult.removed === null) {
        break
      }

      docsToPersist = dropResult.docs
      console.warn('Dropped attendance document', dropResult.removed.id, 'to make room for the latest save.')
    }
  }

  return {
    success: false,
    error: '스토리지 용량이 부족합니다. 오래된 출석 데이터를 삭제한 후 다시 시도해 주세요.',
  }
}

export function deleteAttendanceDoc(id: string): void {
  const docs = getAttendanceDocs()
  const filtered = docs.filter(d => d.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}
