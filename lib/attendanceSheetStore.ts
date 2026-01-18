/**
 * Attendance Sheet Store
 * Manages attendance sheet workflow: Teacher → Instructor → Teacher → Admin
 * Uses localStorage + CustomEvent for real-time sync
 */

// ==================== Types ====================

export type AttendanceSheetStatus =
  | 'TEACHER_DRAFT'              // Teacher creating roster/info
  | 'READY_FOR_INSTRUCTOR'       // Teacher finished + shared
  | 'INSTRUCTOR_IN_PROGRESS'     // Instructor marking attendance
  | 'WAITING_TEACHER_SIGNATURE'  // Instructor finished, needs teacher sign
  | 'SIGNED_BY_TEACHER'          // Teacher signed
  | 'SUBMITTED_TO_ADMIN'         // Instructor submitted to admin
  | 'APPROVED'                   // Admin approved
  | 'REJECTED'                   // Admin rejected, with reason

export interface AttendanceSheet {
  attendanceId: string
  educationId: string
  institutionId: string
  status: AttendanceSheetStatus
  programName?: string // 프로그램명
  institutionName?: string // 기관명
  teacherInfo: {
    grade: string
    className: string
    teacherName: string
    teacherContact?: string
  }
  students: Array<{
    no: number | string
    name: string
    gender?: '남' | '여'
    id?: string // Optional unique identifier
  }>
  sessions: Array<{
    sessionId: string
    sessionNo: number
    date: string
    startTime: string
    endTime: string
    attendanceByStudent: Record<string, number> // studentId or index -> 0|1|2 (0=absent, 1=partial, 2=full)
    totalAttendedSlots?: number
    mainInstructor?: string // 주강사 이름
    assistantInstructor?: string // 보조강사 이름
  }>
  teacherSignature?: {
    method: 'PNG' | 'TYPED'
    signedBy: string
    signedAt: string
    signatureRef?: string // PNG URL or typed name
  }
  instructorId?: string
  adminReview?: {
    status: 'APPROVED' | 'REJECTED'
    reason?: string
    reviewedAt?: string
    reviewedBy?: string
  }
  createdAt: string
  updatedAt: string
  updatedBy?: string // userId who last updated
}

// ==================== Storage Key ====================

const ATTENDANCE_SHEETS_KEY = 'attendance_sheets'

// ==================== Helper Functions ====================

function getStorageData<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error(`Failed to parse ${key}:`, e)
    return []
  }
}

function setStorageData<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Failed to save ${key}:`, e)
  }
}

function dispatchEvent(eventName: string, data?: any): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(eventName, { detail: data }))
}

// ==================== State Transition Validation ====================

const VALID_TRANSITIONS: Record<AttendanceSheetStatus, AttendanceSheetStatus[]> = {
  TEACHER_DRAFT: ['READY_FOR_INSTRUCTOR'],
  READY_FOR_INSTRUCTOR: ['INSTRUCTOR_IN_PROGRESS'],
  INSTRUCTOR_IN_PROGRESS: ['WAITING_TEACHER_SIGNATURE'],
  WAITING_TEACHER_SIGNATURE: ['SIGNED_BY_TEACHER'],
  SIGNED_BY_TEACHER: ['SUBMITTED_TO_ADMIN'],
  SUBMITTED_TO_ADMIN: ['APPROVED', 'REJECTED'],
  APPROVED: [], // Terminal state
  REJECTED: ['WAITING_TEACHER_SIGNATURE', 'INSTRUCTOR_IN_PROGRESS', 'READY_FOR_INSTRUCTOR'], // Can return based on reason
}

export function canTransition(from: AttendanceSheetStatus, to: AttendanceSheetStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

// ==================== Attendance Sheet Store ====================

// ==================== Dummy Data ====================

function getDummyAttendanceSheets(): AttendanceSheet[] {
  return [
    {
      attendanceId: 'attendance-EDU-2025-101-1',
      educationId: 'EDU-2025-101',
      institutionId: 'INST-001',
      status: 'WAITING_TEACHER_SIGNATURE',
      programName: '8차시 블록코딩과 엔트리 기초 및 인공지능',
      institutionName: '평택안일초등학교',
      teacherInfo: {
        grade: '5',
        className: '6',
        teacherName: '박지민',
        teacherContact: '010-1234-5678',
      },
      students: [
        { no: 1, name: '강준', gender: '남', id: 'student-1' },
        { no: 2, name: '김리', gender: '여', id: 'student-2' },
        { no: 3, name: '김연', gender: '여', id: 'student-3' },
      ],
      sessions: [
        {
          sessionId: 'session-1',
          sessionNo: 1,
          date: '2025-11-03',
          startTime: '10:00',
          endTime: '12:00',
          attendanceByStudent: { 'student-1': 2, 'student-2': 2, 'student-3': 1 },
        },
      ],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2024-100-1',
      educationId: 'EDU-2024-100',
      institutionId: 'INST-001',
      status: 'WAITING_TEACHER_SIGNATURE',
      programName: '2024년 하반기 블록코딩 교육',
      institutionName: '수원교육청',
      teacherInfo: {
        grade: '3',
        className: '2',
        teacherName: '담당자1',
        teacherContact: '010-1234-5678',
      },
      students: [
        { no: 1, name: '학생1', gender: '남', id: 'student-1' },
        { no: 2, name: '학생2', gender: '여', id: 'student-2' },
        { no: 3, name: '학생3', gender: '남', id: 'student-3' },
        { no: 4, name: '학생4', gender: '여', id: 'student-4' },
        { no: 5, name: '학생5', gender: '남', id: 'student-5' },
      ],
      sessions: [
        {
          sessionId: 'session-1',
          sessionNo: 1,
          date: '2024-03-01',
          startTime: '09:00',
          endTime: '12:10',
          attendanceByStudent: { 
            'student-1': 4, 
            'student-2': 4, 
            'student-3': 4, 
            'student-4': 4, 
            'student-5': 4 
          },
          totalAttendedSlots: 20,
          mainInstructor: '홍길동',
          assistantInstructor: '이보조',
        },
        {
          sessionId: 'session-2',
          sessionNo: 2,
          date: '2024-06-30',
          startTime: '09:00',
          endTime: '12:10',
          attendanceByStudent: { 
            'student-1': 4, 
            'student-2': 4, 
            'student-3': 4, 
            'student-4': 4, 
            'student-5': 4 
          },
          totalAttendedSlots: 20,
          mainInstructor: '홍길동',
          assistantInstructor: '이보조',
        },
      ],
      instructorId: 'instructor-1',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-102-1',
      educationId: 'EDU-2025-102',
      institutionId: 'INST-001',
      status: 'SIGNED_BY_TEACHER',
      programName: '12차시 스크래치 프로그래밍 기초',
      institutionName: '평택안일초등학교',
      teacherInfo: {
        grade: '4',
        className: '3',
        teacherName: '이선생',
        teacherContact: '010-2345-6789',
      },
      students: [
        { no: 1, name: '김민수', gender: '남', id: 'student-1' },
        { no: 2, name: '이영희', gender: '여', id: 'student-2' },
      ],
      sessions: [],
      teacherSignature: {
        method: 'TYPED',
        signedBy: '이선생',
        signedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        signatureRef: '이선생',
      },
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2024-100-1',
      educationId: 'EDU-2024-100',
      institutionId: 'INST-001',
      status: 'APPROVED',
      programName: '2024년 하반기 블록코딩 교육',
      institutionName: '수원교육청',
      teacherInfo: {
        grade: '3',
        className: '2',
        teacherName: '담당자1',
        teacherContact: '010-1234-5678',
      },
      students: [
        { no: 1, name: '학생1', gender: '남', id: 'student-1' },
        { no: 2, name: '학생2', gender: '여', id: 'student-2' },
        { no: 3, name: '학생3', gender: '남', id: 'student-3' },
        { no: 4, name: '학생4', gender: '여', id: 'student-4' },
        { no: 5, name: '학생5', gender: '남', id: 'student-5' },
      ],
      sessions: [],
      teacherSignature: {
        method: 'TYPED',
        signedBy: '담당자1',
        signedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        signatureRef: '담당자1',
      },
      adminReview: {
        status: 'APPROVED',
        reviewedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedBy: 'admin-1',
      },
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

export const attendanceSheetStore = {
  /**
   * Get all attendance sheets
   */
  getAll(): AttendanceSheet[] {
    const stored = getStorageData<AttendanceSheet>(ATTENDANCE_SHEETS_KEY)
    // Initialize with dummy data if empty
    if (stored.length === 0 && typeof window !== 'undefined') {
      const dummy = getDummyAttendanceSheets()
      setStorageData(ATTENDANCE_SHEETS_KEY, dummy)
      return dummy
    }
    return stored
  },

  /**
   * Get attendance sheet by educationId
   */
  getByEducationId(educationId: string): AttendanceSheet | null {
    const all = this.getAll()
    return all.find(sheet => sheet.educationId === educationId) || null
  },

  /**
   * Get attendance sheet by attendanceId
   */
  getById(attendanceId: string): AttendanceSheet | null {
    const all = this.getAll()
    return all.find(sheet => sheet.attendanceId === attendanceId) || null
  },

  /**
   * Get sheets by institutionId (for teacher)
   */
  getByInstitutionId(institutionId: string): AttendanceSheet[] {
    const all = this.getAll()
    return all.filter(sheet => sheet.institutionId === institutionId)
  },

  /**
   * Get sheets by instructorId
   */
  getByInstructorId(instructorId: string): AttendanceSheet[] {
    const all = this.getAll()
    return all.filter(sheet => sheet.instructorId === instructorId)
  },

  /**
   * Create or update attendance sheet
   */
  upsert(sheet: AttendanceSheet): AttendanceSheet {
    const all = this.getAll()
    const index = all.findIndex(s => s.attendanceId === sheet.attendanceId)
    
    const updatedSheet: AttendanceSheet = {
      ...sheet,
      updatedAt: new Date().toISOString(),
    }
    
    if (index >= 0) {
      all[index] = updatedSheet
    } else {
      if (!updatedSheet.createdAt) {
        updatedSheet.createdAt = new Date().toISOString()
      }
      all.push(updatedSheet)
    }
    
    setStorageData(ATTENDANCE_SHEETS_KEY, all)
    dispatchEvent('attendanceSheetUpdated', updatedSheet)
    return updatedSheet
  },

  /**
   * Create new attendance sheet (initialized by admin or teacher)
   */
  create(educationId: string, institutionId: string, teacherInfo: AttendanceSheet['teacherInfo']): AttendanceSheet {
    const attendanceId = `attendance-${educationId}-${Date.now()}`
    const newSheet: AttendanceSheet = {
      attendanceId,
      educationId,
      institutionId,
      status: 'TEACHER_DRAFT',
      teacherInfo,
      students: [],
      sessions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    
    return this.upsert(newSheet)
  },

  /**
   * Transition status (with validation)
   */
  transitionStatus(
    attendanceId: string,
    newStatus: AttendanceSheetStatus,
    updatedBy?: string,
    additionalData?: Partial<AttendanceSheet>
  ): AttendanceSheet | null {
    const sheet = this.getById(attendanceId)
    if (!sheet) {
      console.error(`Attendance sheet ${attendanceId} not found`)
      return null
    }

    if (!canTransition(sheet.status, newStatus)) {
      console.error(`Invalid transition from ${sheet.status} to ${newStatus}`)
      return null
    }

    const updated: AttendanceSheet = {
      ...sheet,
      ...additionalData,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      updatedBy,
    }

    return this.upsert(updated)
  },

  /**
   * Add teacher signature
   */
  addTeacherSignature(
    attendanceId: string,
    signature: AttendanceSheet['teacherSignature']
  ): AttendanceSheet | null {
    const sheet = this.getById(attendanceId)
    if (!sheet) return null

    // Allow signature for WAITING_TEACHER_SIGNATURE, or allow direct update for other statuses
    if (sheet.status === 'WAITING_TEACHER_SIGNATURE') {
      return this.transitionStatus(
        attendanceId,
        'SIGNED_BY_TEACHER',
        signature?.signedBy,
        { teacherSignature: signature }
      )
    }

    // For other statuses (including completed/approved), allow direct signature update
    const updated = {
      ...sheet,
      teacherSignature: signature,
      updatedAt: new Date().toISOString(),
    }
    return this.upsert(updated)
  },

  /**
   * Admin review (approve/reject)
   */
  adminReview(
    attendanceId: string,
    review: AttendanceSheet['adminReview'],
    reviewedBy: string
  ): AttendanceSheet | null {
    const sheet = this.getById(attendanceId)
    if (!sheet) return null

    if (sheet.status !== 'SUBMITTED_TO_ADMIN') {
      console.error(`Cannot review in status ${sheet.status}`)
      return null
    }

    const newStatus: AttendanceSheetStatus = review.status === 'APPROVED' ? 'APPROVED' : 'REJECTED'
    
    // If rejected, determine return status based on reason
    let returnStatus: AttendanceSheetStatus | null = null
    if (review.status === 'REJECTED' && review.reason) {
      const reason = review.reason.toLowerCase()
      if (reason.includes('서명') || reason.includes('signature')) {
        returnStatus = 'WAITING_TEACHER_SIGNATURE'
      } else if (reason.includes('출석') || reason.includes('attendance')) {
        returnStatus = 'INSTRUCTOR_IN_PROGRESS'
      } else {
        returnStatus = 'READY_FOR_INSTRUCTOR'
      }
    }

    const updatedReview: AttendanceSheet['adminReview'] = {
      ...review,
      reviewedAt: new Date().toISOString(),
      reviewedBy,
    }

    const finalStatus = returnStatus || newStatus

    return this.transitionStatus(
      attendanceId,
      finalStatus,
      reviewedBy,
      { adminReview: updatedReview }
    )
  },

  /**
   * Delete attendance sheet
   */
  delete(attendanceId: string): void {
    const all = this.getAll()
    const filtered = all.filter(s => s.attendanceId !== attendanceId)
    setStorageData(ATTENDANCE_SHEETS_KEY, filtered)
    dispatchEvent('attendanceSheetUpdated')
  },
}
