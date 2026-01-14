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
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'attendance-1',
      educationId: '1', // 블록코딩 기초 프로그램
      location: '서울특별시',
      institution: '서울초등학교',
      gradeClass: '3학년 2반',
      programName: '블록코딩 기초 프로그램',
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
      educationId: '2', // AI 체험 워크숍
      location: '경기도',
      institution: '경기중학교',
      gradeClass: '2학년 1반',
      programName: 'AI 체험 워크숍',
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
      educationId: '3', // 로봇 공학 입문
      location: '인천광역시',
      institution: '인천고등학교',
      gradeClass: '1학년 3반',
      programName: '로봇 공학 입문',
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
      submittedBy: '홍길동',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'attendance-4',
      educationId: '4', // 창의적 문제 해결 프로그램
      location: '부산광역시',
      institution: '부산초등학교',
      gradeClass: '4학년 1반',
      programName: '창의적 문제 해결 프로그램',
      totalSessions: 4,
      maleCount: 16,
      femaleCount: 14,
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
          date: '2025-03-20',
          startTime: '13:00',
          endTime: '15:00',
          sessions: 1,
          mainInstructor: '홍길동',
          assistantInstructor: '박영희',
          institutionContacts: ['한선생'],
          studentCount: 30,
          attendanceCount: 28
        }
      ],
      students: [
        { id: 'student-8', number: 1, name: '임동욱', gender: '남', sessionAttendances: [1], completionStatus: 'O' },
        { id: 'student-9', number: 2, name: '오지은', gender: '여', sessionAttendances: [1], completionStatus: 'O' }
      ],
      status: 'REJECTED',
      submittedAt: weekAgo,
      submittedBy: '홍길동',
      rejectedAt: weekAgo,
      rejectedBy: '관리자',
      rejectReason: '출석률이 기준 미달입니다.',
      createdAt: weekAgo,
      updatedAt: weekAgo
    },
    {
      id: 'attendance-5',
      educationId: '5', // 디지털 리터러시 기초
      location: '대구광역시',
      institution: '대구중학교',
      gradeClass: '1학년 2반',
      programName: '디지털 리터러시 기초',
      totalSessions: 4,
      maleCount: 15,
      femaleCount: 15,
      schoolContactName: '강교장',
      institutionContact: {
        name: '신선생',
        phone: '053-123-4567',
        email: 'shin@school.com'
      },
      signatures: {},
      sessions: [],
      students: [],
      status: 'DRAFT',
      submittedBy: '홍길동',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'attendance-6',
      educationId: '6', // 미디어 아트 창작
      location: '광주광역시',
      institution: '광주고등학교',
      gradeClass: '2학년 3반',
      programName: '미디어 아트 창작',
      totalSessions: 4,
      maleCount: 14,
      femaleCount: 16,
      schoolContactName: '송교장',
      institutionContact: {
        name: '윤선생',
        phone: '062-123-4567',
        email: 'yoon@school.com'
      },
      signatures: {
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
          date: '2025-03-10',
          startTime: '15:00',
          endTime: '17:00',
          sessions: 1,
          mainInstructor: '홍길동',
          assistantInstructor: '이영희',
          institutionContacts: ['윤선생'],
          studentCount: 30,
          attendanceCount: 30
        }
      ],
      students: [
        { id: 'student-10', number: 1, name: '조민준', gender: '남', sessionAttendances: [1], completionStatus: 'O' },
        { id: 'student-11', number: 2, name: '한소영', gender: '여', sessionAttendances: [1], completionStatus: 'O' }
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
      id: 'attendance-7',
      educationId: '7', // 게임 디자인과 프로그래밍
      location: '울산광역시',
      institution: '울산초등학교',
      gradeClass: '5학년 1반',
      programName: '게임 디자인과 프로그래밍',
      totalSessions: 4,
      maleCount: 15,
      femaleCount: 15,
      schoolContactName: '이교장',
      institutionContact: {
        name: '박선생',
        phone: '052-123-4567',
        email: 'park@school.com'
      },
      signatures: {},
      sessions: [],
      students: [],
      status: 'DRAFT',
      submittedBy: '홍길동',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'attendance-8',
      educationId: '8', // 웹 개발 기초
      location: '경기도 수원시',
      institution: '수원초등학교',
      gradeClass: '6학년 2반',
      programName: '웹 개발 기초',
      totalSessions: 4,
      maleCount: 16,
      femaleCount: 14,
      schoolContactName: '최교장',
      institutionContact: {
        name: '김선생',
        phone: '031-123-4567',
        email: 'kim@school.com'
      },
      signatures: {
        session1MainInstructor: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: twoWeeksAgo,
          signatureImageUrl: '/mock/signatures/hong.png'
        }
      },
      sessions: [
        {
          sessionNumber: 1,
          date: '2025-02-01',
          startTime: '10:00',
          endTime: '12:00',
          sessions: 1,
          mainInstructor: '홍길동',
          assistantInstructor: '김철수',
          institutionContacts: ['김선생'],
          studentCount: 30,
          attendanceCount: 30
        }
      ],
      students: [
        { id: 'student-12', number: 1, name: '배수현', gender: '여', sessionAttendances: [1], completionStatus: 'O' },
        { id: 'student-13', number: 2, name: '전우진', gender: '남', sessionAttendances: [1], completionStatus: 'O' }
      ],
      status: 'APPROVED',
      submittedAt: twoWeeksAgo,
      submittedBy: '홍길동',
      approvedAt: twoWeeksAgo,
      approvedBy: '관리자',
      createdAt: twoWeeksAgo,
      updatedAt: twoWeeksAgo
    },
    {
      id: 'attendance-9',
      educationId: '9', // 모바일 앱 만들기
      location: '대전광역시',
      institution: '대전중학교',
      gradeClass: '3학년 3반',
      programName: '모바일 앱 만들기',
      totalSessions: 4,
      maleCount: 15,
      femaleCount: 15,
      schoolContactName: '장교장',
      institutionContact: {
        name: '이선생',
        phone: '042-123-4567',
        email: 'lee2@school.com'
      },
      signatures: {
        session1MainInstructor: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: twoWeeksAgo,
          signatureImageUrl: '/mock/signatures/hong.png'
        }
      },
      sessions: [
        {
          sessionNumber: 1,
          date: '2025-01-15',
          startTime: '14:00',
          endTime: '16:00',
          sessions: 1,
          mainInstructor: '홍길동',
          assistantInstructor: '박영희',
          institutionContacts: ['이선생'],
          studentCount: 30,
          attendanceCount: 29
        }
      ],
      students: [
        { id: 'student-14', number: 1, name: '윤서연', gender: '여', sessionAttendances: [1], completionStatus: 'O' },
        { id: 'student-15', number: 2, name: '강도현', gender: '남', sessionAttendances: [1], completionStatus: 'O' }
      ],
      status: 'APPROVED',
      submittedAt: twoWeeksAgo,
      submittedBy: '홍길동',
      approvedAt: twoWeeksAgo,
      approvedBy: '관리자',
      createdAt: twoWeeksAgo,
      updatedAt: twoWeeksAgo
    },
    {
      id: 'attendance-10',
      educationId: '10', // 3D 프린팅 기초
      location: '세종특별자치시',
      institution: '세종고등학교',
      gradeClass: '1학년 1반',
      programName: '3D 프린팅 기초',
      totalSessions: 4,
      maleCount: 15,
      femaleCount: 15,
      schoolContactName: '나교장',
      institutionContact: {
        name: '최선생',
        phone: '044-123-4567',
        email: 'choi2@school.com'
      },
      signatures: {},
      sessions: [],
      students: [],
      status: 'DRAFT',
      submittedBy: '홍길동',
      createdAt: now,
      updatedAt: now
    },
    // 평택안일초등학교 출석부 데이터
    {
      id: 'attendance-11',
      educationId: 'EDU-2025-101',
      location: '평택시',
      institution: '평택안일초등학교',
      gradeClass: '5학년 6반',
      programName: '8차시 블록코딩과 엔트리 기초 및 인공지능',
      totalSessions: 8,
      maleCount: 11,
      femaleCount: 11,
      schoolContactName: '박지민',
      institutionContact: {
        name: '박지민',
        phone: '010-1234-5678',
        email: 'park@school.com'
      },
      signatures: {},
      sessions: [
        {
          sessionNumber: 1,
          date: '2025-11-03',
          startTime: '09:00',
          endTime: '12:10',
          sessions: 4,
          mainInstructor: '박정아',
          assistantInstructor: '김윤미',
          institutionContacts: ['박지민'],
          studentCount: 22,
          attendanceCount: 21
        },
        {
          sessionNumber: 2,
          date: '2025-11-10',
          startTime: '09:00',
          endTime: '12:10',
          sessions: 4,
          mainInstructor: '박정아',
          assistantInstructor: '김윤미',
          institutionContacts: ['박지민'],
          studentCount: 22,
          attendanceCount: 22
        }
      ],
      students: [
        { id: 'student-1', number: 1, name: '강준', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-2', number: 2, name: '김리', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-3', number: 3, name: '김연', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-4', number: 4, name: '김아', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-5', number: 5, name: '김현', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-6', number: 6, name: '김후', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-7', number: 7, name: '김연', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-8', number: 8, name: '배은', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-9', number: 9, name: '서원', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-10', number: 10, name: '서호', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-11', number: 11, name: '승연', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-12', number: 12, name: '양지', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-13', number: 13, name: '(전학)', gender: '남', sessionAttendances: [0, 0], completionStatus: 'X', isTransferred: true },
        { id: 'student-14', number: 14, name: '이윤', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-15', number: 15, name: '이균', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-16', number: 16, name: '(전학)', gender: '여', sessionAttendances: [0, 0], completionStatus: 'X', isTransferred: true },
        { id: 'student-17', number: 17, name: '전서', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-18', number: 18, name: '조연', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-19', number: 19, name: '조성', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-20', number: 20, name: '최혁', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-21', number: 21, name: '하윤', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-22', number: 22, name: '황영', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-23', number: 23, name: '안은', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
        { id: 'student-24', number: 24, name: '김주우', gender: '남', sessionAttendances: [0, 4], completionStatus: 'X' },
      ],
      status: 'DRAFT',
      submittedBy: '홍길동',
      createdAt: weekAgo,
      updatedAt: weekAgo
    },
    {
      id: 'attendance-12',
      educationId: 'EDU-2024-201',
      location: '평택시',
      institution: '평택안일초등학교',
      gradeClass: '5학년 1반',
      programName: '2024년 하반기 블록코딩 교육',
      totalSessions: 8,
      maleCount: 15,
      femaleCount: 15,
      schoolContactName: '박지민',
      institutionContact: {
        name: '박지민',
        phone: '010-1234-5678',
        email: 'park@school.com'
      },
      signatures: {
        school: {
          signedByUserId: 'teacher-1',
          signedByUserName: '박지민',
          signedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          signatureImageUrl: '/mock/signatures/park.png'
        }
      },
      sessions: [
        {
          sessionNumber: 1,
          date: '2024-09-01',
          startTime: '09:00',
          endTime: '12:00',
          sessions: 4,
          mainInstructor: '홍길동',
          assistantInstructor: '김철수',
          institutionContacts: ['박지민'],
          studentCount: 30,
          attendanceCount: 28
        }
      ],
      students: [
        { id: 'student-25', number: 1, name: '김민수', gender: '남', sessionAttendances: [4], completionStatus: 'O' },
        { id: 'student-26', number: 2, name: '이영희', gender: '여', sessionAttendances: [4], completionStatus: 'O' },
      ],
      status: 'APPROVED',
      submittedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      submittedBy: '홍길동',
      approvedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000).toISOString(),
      approvedBy: '관리자',
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
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
    const parsed = JSON.parse(stored)
    // Check if data has old format (edu-001, etc.) and reset if needed
    const hasOldFormat = Array.isArray(parsed) && parsed.some((doc: any) => doc.educationId?.startsWith('edu-'))
    if (hasOldFormat && process.env.NODE_ENV === 'development') {
      // Reset to new dummy data format
      const dummyData = getDummyAttendanceDocs()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyData))
      return dummyData
    }
    return parsed
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
