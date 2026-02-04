/**
 * Attendance Sheet Store
 * Manages attendance sheet workflow: Teacher → Instructor → Teacher → Admin
 * Uses localStorage + CustomEvent for real-time sync
 */

// ==================== Types ====================

export type AttendanceSheetStatus =
  | 'TEACHER_DRAFT'              // Teacher creating roster/info
  | 'TEACHER_READY'              // Teacher marked as ready (validated inputs)
  | 'INSTRUCTOR_REQUESTED'       // Instructor requested attendance sheet
  | 'SENT_TO_INSTRUCTOR'         // Teacher sent to instructor
  | 'RETURNED_TO_TEACHER'        // Instructor returned with attendance marked
  | 'FINAL_SENT_TO_INSTRUCTOR'   // Teacher signed and sent back to instructor
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
  instructorSignature?: {
    method: 'PNG' | 'TYPED'
    signedBy: string
    signedAt: string
    signatureRef?: string
  }
  teacherComment?: string // Optional comment when teacher signs
  adminReview?: {
    status: 'APPROVED' | 'REJECTED'
    reason?: string
    reviewedAt?: string
    reviewedBy?: string
  }
  auditLog: Array<{
    id: string
    actorRole: 'teacher' | 'instructor' | 'admin'
    actorId: string
    actorName?: string
    fromState: AttendanceSheetStatus
    toState: AttendanceSheetStatus
    timestamp: string
    comment?: string
  }>
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
  TEACHER_DRAFT: ['TEACHER_READY'],
  TEACHER_READY: ['INSTRUCTOR_REQUESTED'],
  INSTRUCTOR_REQUESTED: ['SENT_TO_INSTRUCTOR'],
  SENT_TO_INSTRUCTOR: ['RETURNED_TO_TEACHER'],
  RETURNED_TO_TEACHER: ['FINAL_SENT_TO_INSTRUCTOR'],
  FINAL_SENT_TO_INSTRUCTOR: ['SUBMITTED_TO_ADMIN'],
  SUBMITTED_TO_ADMIN: ['APPROVED', 'REJECTED'],
  APPROVED: [], // Terminal state
  REJECTED: [], // Terminal state (can be manually reset by admin if needed)
}

export function canTransition(from: AttendanceSheetStatus, to: AttendanceSheetStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false
}

// ==================== Attendance Sheet Store ====================

// ==================== Dummy Data ====================

function getDummyAttendanceSheets(): AttendanceSheet[] {
  return [
    // ========== 출석부 작성 페이지 (TEACHER_DRAFT) ==========
    {
      attendanceId: 'attendance-EDU-2025-301-1',
      educationId: 'EDU-2025-301',
      institutionId: 'INST-001',
      status: 'TEACHER_DRAFT',
      programName: '8차시 블록코딩 기초 교육',
      institutionName: '수원초등학교',
      teacherInfo: {
        grade: '4',
        className: '1',
        teacherName: '김선생',
        teacherContact: '010-1111-2222',
      },
      students: [
        { no: 1, name: '이민수', gender: '남', id: 'student-301-1' },
        { no: 2, name: '박지영', gender: '여', id: 'student-301-2' },
        { no: 3, name: '최동현', gender: '남', id: 'student-301-3' },
      ],
      sessions: [],
      auditLog: [],
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-302-1',
      educationId: 'EDU-2025-302',
      institutionId: 'INST-001',
      status: 'TEACHER_DRAFT',
      programName: '8차시 스크래치 프로그래밍',
      institutionName: '성남초등학교',
      teacherInfo: {
        grade: '5',
        className: '2',
        teacherName: '정선생',
        teacherContact: '010-2222-3333',
      },
      students: [
        { no: 1, name: '강수진', gender: '여', id: 'student-302-1' },
        { no: 2, name: '윤태호', gender: '남', id: 'student-302-2' },
      ],
      sessions: [],
      auditLog: [],
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-303-1',
      educationId: 'EDU-2025-303',
      institutionId: 'INST-001',
      status: 'TEACHER_DRAFT',
      programName: '8차시 AI 체험 교육',
      institutionName: '용인초등학교',
      teacherInfo: {
        grade: '6',
        className: '1',
        teacherName: '한선생',
        teacherContact: '010-3333-4444',
      },
      students: [],
      sessions: [],
      auditLog: [],
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-401-1',
      educationId: 'EDU-2025-401',
      institutionId: 'INST-001',
      status: 'TEACHER_DRAFT',
      programName: '블록코딩 기초 교육 A',
      institutionName: '수원초등학교',
      teacherInfo: {
        grade: '3',
        className: '1',
        teacherName: '송선생',
        teacherContact: '010-4444-5555',
      },
      students: [
        { no: 1, name: '임하늘', gender: '여', id: 'student-401-1' },
        { no: 2, name: '조민준', gender: '남', id: 'student-401-2' },
        { no: 3, name: '신예린', gender: '여', id: 'student-401-3' },
        { no: 4, name: '오준서', gender: '남', id: 'student-401-4' },
      ],
      sessions: [],
      auditLog: [],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // ========== 요청 및 전송 페이지 (TEACHER_READY, INSTRUCTOR_REQUESTED) ==========
    {
      attendanceId: 'attendance-EDU-2025-102-2',
      educationId: 'EDU-2025-102',
      institutionId: 'INST-001',
      status: 'TEACHER_READY',
      programName: '12차시 스크래치 프로그래밍 기초',
      institutionName: '평택안일초등학교',
      teacherInfo: {
        grade: '4',
        className: '3',
        teacherName: '이선생',
        teacherContact: '010-2345-6789',
      },
      students: [
        { no: 1, name: '김민수', gender: '남', id: 'student-102-1' },
        { no: 2, name: '이영희', gender: '여', id: 'student-102-2' },
        { no: 3, name: '박준호', gender: '남', id: 'student-102-3' },
        { no: 4, name: '최수진', gender: '여', id: 'student-102-4' },
      ],
      sessions: [],
      auditLog: [],
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2024-100-1',
      educationId: 'EDU-2024-100',
      institutionId: 'INST-001',
      status: 'INSTRUCTOR_REQUESTED',
      programName: '2024년 하반기 블록코딩 교육',
      institutionName: '수원교육청',
      teacherInfo: {
        grade: '3',
        className: '2',
        teacherName: '담당자1',
        teacherContact: '010-1234-5678',
      },
      students: [
        { no: 1, name: '학생1', gender: '남', id: 'student-100-1' },
        { no: 2, name: '학생2', gender: '여', id: 'student-100-2' },
        { no: 3, name: '학생3', gender: '남', id: 'student-100-3' },
        { no: 4, name: '학생4', gender: '여', id: 'student-100-4' },
        { no: 5, name: '학생5', gender: '남', id: 'student-100-5' },
      ],
      sessions: [],
      instructorId: 'instructor-1',
      auditLog: [],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-402-1',
      educationId: 'EDU-2025-402',
      institutionId: 'INST-001',
      status: 'INSTRUCTOR_REQUESTED',
      programName: '스크래치 프로그래밍 B',
      institutionName: '성남초등학교',
      teacherInfo: {
        grade: '4',
        className: '2',
        teacherName: '최선생',
        teacherContact: '010-5555-6666',
      },
      students: [
        { no: 1, name: '김다은', gender: '여', id: 'student-402-1' },
        { no: 2, name: '이건우', gender: '남', id: 'student-402-2' },
        { no: 3, name: '박서연', gender: '여', id: 'student-402-3' },
        { no: 4, name: '정민재', gender: '남', id: 'student-402-4' },
        { no: 5, name: '한소희', gender: '여', id: 'student-402-5' },
        { no: 6, name: '강태윤', gender: '남', id: 'student-402-6' },
      ],
      sessions: [],
      instructorId: 'instructor-2',
      auditLog: [],
      createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-403-1',
      educationId: 'EDU-2025-403',
      institutionId: 'INST-001',
      status: 'INSTRUCTOR_REQUESTED',
      programName: 'AI 체험 교육 C',
      institutionName: '용인초등학교',
      teacherInfo: {
        grade: '5',
        className: '3',
        teacherName: '배선생',
        teacherContact: '010-6666-7777',
      },
      students: [
        { no: 1, name: '윤서준', gender: '남', id: 'student-403-1' },
        { no: 2, name: '임채원', gender: '여', id: 'student-403-2' },
        { no: 3, name: '조시우', gender: '남', id: 'student-403-3' },
      ],
      sessions: [],
      instructorId: 'instructor-3',
      auditLog: [],
      createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-301-2',
      educationId: 'EDU-2025-301',
      institutionId: 'INST-001',
      status: 'INSTRUCTOR_REQUESTED',
      programName: '8차시 블록코딩 기초 교육',
      institutionName: '수원초등학교',
      teacherInfo: {
        grade: '4',
        className: '1',
        teacherName: '김선생',
        teacherContact: '010-1111-2222',
      },
      students: [
        { no: 1, name: '이민수', gender: '남', id: 'student-301-2-1' },
        { no: 2, name: '박지영', gender: '여', id: 'student-301-2-2' },
        { no: 3, name: '최동현', gender: '남', id: 'student-301-2-3' },
        { no: 4, name: '강서연', gender: '여', id: 'student-301-2-4' },
        { no: 5, name: '윤민준', gender: '남', id: 'student-301-2-5' },
      ],
      sessions: [],
      instructorId: 'instructor-1',
      auditLog: [],
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-302-2',
      educationId: 'EDU-2025-302',
      institutionId: 'INST-001',
      status: 'INSTRUCTOR_REQUESTED',
      programName: '8차시 스크래치 프로그래밍',
      institutionName: '성남초등학교',
      teacherInfo: {
        grade: '5',
        className: '2',
        teacherName: '정선생',
        teacherContact: '010-2222-3333',
      },
      students: [
        { no: 1, name: '강수진', gender: '여', id: 'student-302-2-1' },
        { no: 2, name: '윤태호', gender: '남', id: 'student-302-2-2' },
        { no: 3, name: '임하늘', gender: '여', id: 'student-302-2-3' },
      ],
      sessions: [],
      instructorId: 'instructor-2',
      auditLog: [],
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // ========== 검토 및 서명 페이지 (RETURNED_TO_TEACHER) ==========
    {
      attendanceId: 'attendance-EDU-2025-101-1',
      educationId: 'EDU-2025-101',
      institutionId: 'INST-001',
      status: 'RETURNED_TO_TEACHER',
      programName: '8차시 블록코딩과 엔트리 기초 및 인공지능',
      institutionName: '평택안일초등학교',
      teacherInfo: {
        grade: '5',
        className: '6',
        teacherName: '박지민',
        teacherContact: '010-1234-5678',
      },
      students: [
        { no: 1, name: '강준', gender: '남', id: 'student-101-1' },
        { no: 2, name: '김리', gender: '여', id: 'student-101-2' },
        { no: 3, name: '김연', gender: '여', id: 'student-101-3' },
        { no: 4, name: '이동현', gender: '남', id: 'student-101-4' },
      ],
      sessions: [
        {
          sessionId: 'session-101-1',
          sessionNo: 1,
          date: '2025-11-03',
          startTime: '10:00',
          endTime: '12:00',
          attendanceByStudent: { 
            'student-101-1': 2, 
            'student-101-2': 2, 
            'student-101-3': 1,
            'student-101-4': 2,
          },
          mainInstructor: '홍길동',
          assistantInstructor: '김보조',
        },
        {
          sessionId: 'session-101-2',
          sessionNo: 2,
          date: '2025-11-05',
          startTime: '10:00',
          endTime: '12:00',
          attendanceByStudent: { 
            'student-101-1': 2, 
            'student-101-2': 2, 
            'student-101-3': 2,
            'student-101-4': 2,
          },
          mainInstructor: '홍길동',
          assistantInstructor: '김보조',
        },
      ],
      instructorId: 'instructor-1',
      instructorSignature: {
        method: 'TYPED',
        signedBy: '홍길동',
        signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        signatureRef: '홍길동',
      },
      auditLog: [],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-004-1',
      educationId: 'EDU-2025-004',
      institutionId: 'INST-001',
      status: 'RETURNED_TO_TEACHER',
      programName: '특수학급 맞춤형 코딩 교육',
      institutionName: '고양교육청',
      teacherInfo: {
        grade: '5',
        className: '1',
        teacherName: '장선생',
        teacherContact: '010-7777-8888',
      },
      students: [
        { no: 1, name: '신민지', gender: '여', id: 'student-004-1' },
        { no: 2, name: '오현우', gender: '남', id: 'student-004-2' },
        { no: 3, name: '임지훈', gender: '남', id: 'student-004-3' },
        { no: 4, name: '조은서', gender: '여', id: 'student-004-4' },
        { no: 5, name: '강민석', gender: '남', id: 'student-004-5' },
        { no: 6, name: '윤하늘', gender: '여', id: 'student-004-6' },
      ],
      sessions: [
        {
          sessionId: 'session-004-1',
          sessionNo: 1,
          date: '2025-09-01',
          startTime: '09:00',
          endTime: '12:10',
          attendanceByStudent: { 
            'student-004-1': 4, 
            'student-004-2': 4, 
            'student-004-3': 3,
            'student-004-4': 4,
            'student-004-5': 4,
            'student-004-6': 4,
          },
          mainInstructor: '홍길동',
          assistantInstructor: '이보조',
        },
      ],
      instructorId: 'instructor-1',
      instructorSignature: {
        method: 'TYPED',
        signedBy: '홍길동',
        signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        signatureRef: '홍길동',
      },
      auditLog: [],
      createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-301-3',
      educationId: 'EDU-2025-301',
      institutionId: 'INST-001',
      status: 'RETURNED_TO_TEACHER',
      programName: '8차시 블록코딩 기초 교육',
      institutionName: '수원초등학교',
      teacherInfo: {
        grade: '4',
        className: '1',
        teacherName: '김선생',
        teacherContact: '010-1111-2222',
      },
      students: [
        { no: 1, name: '이민수', gender: '남', id: 'student-301-3-1' },
        { no: 2, name: '박지영', gender: '여', id: 'student-301-3-2' },
        { no: 3, name: '최동현', gender: '남', id: 'student-301-3-3' },
      ],
      sessions: [
        {
          sessionId: 'session-301-3-1',
          sessionNo: 1,
          date: '2025-03-15',
          startTime: '09:00',
          endTime: '10:40',
          attendanceByStudent: { 
            'student-301-3-1': 2, 
            'student-301-3-2': 2, 
            'student-301-3-3': 2,
          },
          mainInstructor: '홍길동',
        },
      ],
      instructorId: 'instructor-1',
      instructorSignature: {
        method: 'TYPED',
        signedBy: '홍길동',
        signedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        signatureRef: '홍길동',
      },
      auditLog: [],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-302-3',
      educationId: 'EDU-2025-302',
      institutionId: 'INST-001',
      status: 'RETURNED_TO_TEACHER',
      programName: '8차시 스크래치 프로그래밍',
      institutionName: '성남초등학교',
      teacherInfo: {
        grade: '5',
        className: '2',
        teacherName: '정선생',
        teacherContact: '010-2222-3333',
      },
      students: [
        { no: 1, name: '강수진', gender: '여', id: 'student-302-3-1' },
        { no: 2, name: '윤태호', gender: '남', id: 'student-302-3-2' },
      ],
      sessions: [
        {
          sessionId: 'session-302-3-1',
          sessionNo: 1,
          date: '2025-03-15',
          startTime: '13:00',
          endTime: '14:40',
          attendanceByStudent: { 
            'student-302-3-1': 2, 
            'student-302-3-2': 2,
          },
          mainInstructor: '홍길동',
        },
      ],
      instructorId: 'instructor-1',
      instructorSignature: {
        method: 'TYPED',
        signedBy: '홍길동',
        signedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        signatureRef: '홍길동',
      },
      auditLog: [],
      createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-401-2',
      educationId: 'EDU-2025-401',
      institutionId: 'INST-001',
      status: 'RETURNED_TO_TEACHER',
      programName: '블록코딩 기초 교육 A',
      institutionName: '수원초등학교',
      teacherInfo: {
        grade: '3',
        className: '1',
        teacherName: '송선생',
        teacherContact: '010-4444-5555',
      },
      students: [
        { no: 1, name: '임하늘', gender: '여', id: 'student-401-2-1' },
        { no: 2, name: '조민준', gender: '남', id: 'student-401-2-2' },
        { no: 3, name: '신예린', gender: '여', id: 'student-401-2-3' },
        { no: 4, name: '오준서', gender: '남', id: 'student-401-2-4' },
      ],
      sessions: [
        {
          sessionId: 'session-401-2-1',
          sessionNo: 1,
          date: '2025-03-15',
          startTime: '09:00',
          endTime: '10:40',
          attendanceByStudent: { 
            'student-401-2-1': 2, 
            'student-401-2-2': 2, 
            'student-401-2-3': 1,
            'student-401-2-4': 2,
          },
          mainInstructor: '김보조',
        },
      ],
      instructorId: 'instructor-2',
      instructorSignature: {
        method: 'TYPED',
        signedBy: '김보조',
        signedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        signatureRef: '김보조',
      },
      auditLog: [],
      createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },

    // ========== 완료된 출석부 페이지 (FINAL_SENT_TO_INSTRUCTOR, SUBMITTED_TO_ADMIN, APPROVED, REJECTED) ==========
    {
      attendanceId: 'attendance-EDU-2025-102-1',
      educationId: 'EDU-2025-102',
      institutionId: 'INST-001',
      status: 'FINAL_SENT_TO_INSTRUCTOR',
      programName: '12차시 스크래치 프로그래밍 기초',
      institutionName: '평택안일초등학교',
      teacherInfo: {
        grade: '4',
        className: '3',
        teacherName: '이선생',
        teacherContact: '010-2345-6789',
      },
      students: [
        { no: 1, name: '김민수', gender: '남', id: 'student-102-final-1' },
        { no: 2, name: '이영희', gender: '여', id: 'student-102-final-2' },
      ],
      sessions: [
        {
          sessionId: 'session-102-1',
          sessionNo: 1,
          date: '2025-10-01',
          startTime: '09:00',
          endTime: '10:40',
          attendanceByStudent: { 
            'student-102-final-1': 2, 
            'student-102-final-2': 2,
          },
          mainInstructor: '홍길동',
          assistantInstructor: '김보조',
        },
      ],
      teacherSignature: {
        method: 'TYPED',
        signedBy: '이선생',
        signedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        signatureRef: '이선생',
      },
      teacherComment: '출석 확인 완료',
      auditLog: [],
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2024-100-2',
      educationId: 'EDU-2024-100',
      institutionId: 'INST-001',
      status: 'SUBMITTED_TO_ADMIN',
      programName: '2024년 하반기 블록코딩 교육',
      institutionName: '수원교육청',
      teacherInfo: {
        grade: '3',
        className: '2',
        teacherName: '담당자1',
        teacherContact: '010-1234-5678',
      },
      students: [
        { no: 1, name: '학생1', gender: '남', id: 'student-100-submitted-1' },
        { no: 2, name: '학생2', gender: '여', id: 'student-100-submitted-2' },
        { no: 3, name: '학생3', gender: '남', id: 'student-100-submitted-3' },
        { no: 4, name: '학생4', gender: '여', id: 'student-100-submitted-4' },
        { no: 5, name: '학생5', gender: '남', id: 'student-100-submitted-5' },
      ],
      sessions: [
        {
          sessionId: 'session-100-submitted-1',
          sessionNo: 1,
          date: '2024-03-01',
          startTime: '09:00',
          endTime: '12:10',
          attendanceByStudent: { 
            'student-100-submitted-1': 4, 
            'student-100-submitted-2': 4, 
            'student-100-submitted-3': 4, 
            'student-100-submitted-4': 4, 
            'student-100-submitted-5': 4,
          },
          mainInstructor: '홍길동',
          assistantInstructor: '이보조',
        },
      ],
      teacherSignature: {
        method: 'TYPED',
        signedBy: '담당자1',
        signedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        signatureRef: '담당자1',
      },
      auditLog: [],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2024-100-3',
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
        { no: 1, name: '학생1', gender: '남', id: 'student-100-approved-1' },
        { no: 2, name: '학생2', gender: '여', id: 'student-100-approved-2' },
        { no: 3, name: '학생3', gender: '남', id: 'student-100-approved-3' },
        { no: 4, name: '학생4', gender: '여', id: 'student-100-approved-4' },
        { no: 5, name: '학생5', gender: '남', id: 'student-100-approved-5' },
      ],
      sessions: [
        {
          sessionId: 'session-100-approved-1',
          sessionNo: 1,
          date: '2024-03-01',
          startTime: '09:00',
          endTime: '12:10',
          attendanceByStudent: { 
            'student-100-approved-1': 4, 
            'student-100-approved-2': 4, 
            'student-100-approved-3': 4, 
            'student-100-approved-4': 4, 
            'student-100-approved-5': 4,
          },
          mainInstructor: '홍길동',
          assistantInstructor: '이보조',
        },
      ],
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
      auditLog: [],
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      attendanceId: 'attendance-EDU-2025-101-2',
      educationId: 'EDU-2025-101',
      institutionId: 'INST-001',
      status: 'REJECTED',
      programName: '8차시 블록코딩과 엔트리 기초 및 인공지능',
      institutionName: '평택안일초등학교',
      teacherInfo: {
        grade: '5',
        className: '6',
        teacherName: '박지민',
        teacherContact: '010-1234-5678',
      },
      students: [
        { no: 1, name: '강준', gender: '남', id: 'student-101-rejected-1' },
        { no: 2, name: '김리', gender: '여', id: 'student-101-rejected-2' },
      ],
      sessions: [],
      teacherSignature: {
        method: 'TYPED',
        signedBy: '박지민',
        signedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        signatureRef: '박지민',
      },
      adminReview: {
        status: 'REJECTED',
        reason: '출석 기록이 불완전합니다. 재확인 후 재제출 바랍니다.',
        reviewedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        reviewedBy: 'admin-1',
      },
      auditLog: [],
      createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

export const attendanceSheetStore = {
  /**
   * Get all attendance sheets
   */
  getAll(): AttendanceSheet[] {
    if (typeof window === 'undefined') return []
    
    const stored = getStorageData<AttendanceSheet>(ATTENDANCE_SHEETS_KEY)
    
    // Initialize with dummy data if empty or if key doesn't exist
    if (!stored || stored.length === 0) {
      const dummy = getDummyAttendanceSheets()
      setStorageData(ATTENDANCE_SHEETS_KEY, dummy)
      return dummy
    }
    
    // Check if we need to merge dummy data (for development)
    // If stored data has fewer items than dummy, merge them
    const dummy = getDummyAttendanceSheets()
    const dummyIds = new Set(dummy.map(d => d.attendanceId))
    const storedIds = new Set(stored.map(s => s.attendanceId))
    
    // Add any dummy items that don't exist in stored data
    const missingDummy = dummy.filter(d => !storedIds.has(d.attendanceId))
    if (missingDummy.length > 0) {
      const merged = [...stored, ...missingDummy]
      setStorageData(ATTENDANCE_SHEETS_KEY, merged)
      return merged
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
      auditLog: sheet.auditLog || [],
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
   * Create new attendance sheet (auto-created when training status becomes CONFIRMED)
   */
  create(educationId: string, institutionId: string, teacherInfo: AttendanceSheet['teacherInfo'], createdBy?: { role: 'teacher' | 'admin', id: string, name?: string }): AttendanceSheet {
    const attendanceId = `attendance-${educationId}-${Date.now()}`
    const now = new Date().toISOString()
    const newSheet: AttendanceSheet = {
      attendanceId,
      educationId,
      institutionId,
      status: 'TEACHER_DRAFT',
      teacherInfo,
      students: [],
      sessions: [],
      auditLog: createdBy ? [{
        id: `log-${Date.now()}`,
        actorRole: createdBy.role,
        actorId: createdBy.id,
        actorName: createdBy.name,
        fromState: 'TEACHER_DRAFT',
        toState: 'TEACHER_DRAFT',
        timestamp: now,
        comment: 'Attendance sheet created',
      }] : [],
      createdAt: now,
      updatedAt: now,
      updatedBy: createdBy?.id,
    }
    
    return this.upsert(newSheet)
  },

  /**
   * Transition status (with validation and audit log)
   */
  transitionStatus(
    attendanceId: string,
    newStatus: AttendanceSheetStatus,
    actor: { role: 'teacher' | 'instructor' | 'admin', id: string, name?: string },
    additionalData?: Partial<AttendanceSheet>,
    comment?: string
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

    const now = new Date().toISOString()
    const auditEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      actorRole: actor.role,
      actorId: actor.id,
      actorName: actor.name,
      fromState: sheet.status,
      toState: newStatus,
      timestamp: now,
      comment,
    }

    const updated: AttendanceSheet = {
      ...sheet,
      ...additionalData,
      status: newStatus,
      auditLog: [...(sheet.auditLog || []), auditEntry],
      updatedAt: now,
      updatedBy: actor.id,
    }

    const result = this.upsert(updated)
    
    // Dispatch notification event
    dispatchEvent('attendanceSheetStatusChanged', {
      attendanceId,
      fromStatus: sheet.status,
      toStatus: newStatus,
      actor,
      sheet: result,
    })

    return result
  },

  /**
   * Add teacher signature (for RETURNED_TO_TEACHER state)
   */
  addTeacherSignature(
    attendanceId: string,
    signature: AttendanceSheet['teacherSignature'],
    actor: { role: 'teacher', id: string, name?: string },
    comment?: string
  ): AttendanceSheet | null {
    const sheet = this.getById(attendanceId)
    if (!sheet) return null

    if (sheet.status !== 'RETURNED_TO_TEACHER') {
      console.error(`Cannot add teacher signature in status ${sheet.status}`)
      return null
    }

    if (!signature) {
      console.error('Signature is required')
      return null
    }

    return this.transitionStatus(
      attendanceId,
      'FINAL_SENT_TO_INSTRUCTOR',
      actor,
      { 
        teacherSignature: signature,
        teacherComment: comment,
      },
      comment || 'Teacher signed attendance sheet'
    )
  },

  /**
   * Admin review (approve/reject)
   */
  adminReview(
    attendanceId: string,
    review: NonNullable<AttendanceSheet['adminReview']>,
    actor: { role: 'admin', id: string, name?: string }
  ): AttendanceSheet | null {
    const sheet = this.getById(attendanceId)
    if (!sheet) return null

    if (sheet.status !== 'SUBMITTED_TO_ADMIN') {
      console.error(`Cannot review in status ${sheet.status}`)
      return null
    }

    const newStatus: AttendanceSheetStatus = review.status === 'APPROVED' ? 'APPROVED' : 'REJECTED'

    const updatedReview: AttendanceSheet['adminReview'] = {
      ...review,
      reviewedAt: new Date().toISOString(),
      reviewedBy: actor.id,
    }

    return this.transitionStatus(
      attendanceId,
      newStatus,
      actor,
      { adminReview: updatedReview },
      review.reason || `Admin ${review.status === 'APPROVED' ? 'approved' : 'rejected'} attendance sheet`
    )
  },

  /**
   * Mark sheet as ready (TEACHER_DRAFT -> TEACHER_READY)
   */
  markAsReady(
    attendanceId: string,
    actor: { role: 'teacher', id: string, name?: string }
  ): AttendanceSheet | null {
    return this.transitionStatus(
      attendanceId,
      'TEACHER_READY',
      actor,
      undefined,
      'Teacher marked attendance sheet as ready'
    )
  },

  /**
   * Instructor requests attendance sheet (TEACHER_READY -> INSTRUCTOR_REQUESTED)
   */
  instructorRequest(
    attendanceId: string,
    instructorId: string,
    actor: { role: 'instructor', id: string, name?: string }
  ): AttendanceSheet | null {
    return this.transitionStatus(
      attendanceId,
      'INSTRUCTOR_REQUESTED',
      actor,
      { instructorId },
      'Instructor requested attendance sheet'
    )
  },

  /**
   * Teacher sends to instructor (INSTRUCTOR_REQUESTED -> SENT_TO_INSTRUCTOR)
   */
  sendToInstructor(
    attendanceId: string,
    actor: { role: 'teacher', id: string, name?: string }
  ): AttendanceSheet | null {
    return this.transitionStatus(
      attendanceId,
      'SENT_TO_INSTRUCTOR',
      actor,
      undefined,
      'Teacher sent attendance sheet to instructor'
    )
  },

  /**
   * Instructor returns to teacher (SENT_TO_INSTRUCTOR -> RETURNED_TO_TEACHER)
   */
  returnToTeacher(
    attendanceId: string,
    sessions: AttendanceSheet['sessions'],
    instructorSignature?: AttendanceSheet['instructorSignature'],
    actor: { role: 'instructor', id: string, name?: string } = { role: 'instructor', id: 'unknown' }
  ): AttendanceSheet | null {
    return this.transitionStatus(
      attendanceId,
      'RETURNED_TO_TEACHER',
      actor,
      { 
        sessions,
        instructorSignature,
      },
      'Instructor returned attendance sheet with marked attendance'
    )
  },

  /**
   * Instructor submits to admin (FINAL_SENT_TO_INSTRUCTOR -> SUBMITTED_TO_ADMIN)
   */
  submitToAdmin(
    attendanceId: string,
    actor: { role: 'instructor', id: string, name?: string }
  ): AttendanceSheet | null {
    return this.transitionStatus(
      attendanceId,
      'SUBMITTED_TO_ADMIN',
      actor,
      undefined,
      'Instructor submitted attendance sheet to admin'
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

  /**
   * Reset to dummy data (for development/testing)
   */
  resetToDummy(): void {
    if (typeof window === 'undefined') return
    const dummy = getDummyAttendanceSheets()
    setStorageData(ATTENDANCE_SHEETS_KEY, dummy)
    dispatchEvent('attendanceSheetUpdated')
  },
}
