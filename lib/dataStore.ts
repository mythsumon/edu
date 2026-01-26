/**
 * Centralized Data Store
 * 모든 메뉴가 공유하는 중앙 데이터 스토어
 * TODO: API 연동 시 이 스토어를 API 호출로 대체
 */

import { message } from 'antd'

// ==================== Types ====================

export interface Education {
  key: string
  status: string
  educationId: string
  name: string
  institution: string
  region: string
  gradeClass: string
  period: string
  periodStart?: string
  periodEnd?: string
  requestOrg?: string
  schoolName?: string
  programTitle?: string
  courseName?: string
  totalSessions?: number
  note?: string
  educationStatus?: 'OPEN' | 'INIT' | 'CANCEL' | '신청 중' | '신청 마감' | '대기'
  applicationDeadline?: string
  openAt?: string // ISO datetime string: when "오픈예정" -> "강사공개"
  closeAt?: string // ISO datetime string: when "강사공개" -> "신청마감"
  regionAssignmentMode?: 'PARTIAL' | 'FULL' // Default: 'PARTIAL'
  applicationRestriction?: 'MAIN_ONLY' | 'ASSISTANT_ONLY' | 'ALL' // Default: 'ALL'
  mainInstructorId?: string // Single main instructor ID
  assistantInstructorIds?: string[] // Array of assistant instructor IDs
  lessons?: Lesson[]
}

export interface Lesson {
  session?: number
  title?: string
  date: string
  startTime: string
  endTime: string
  mainInstructors?: Instructor[] | number // Can be array of instructors or count
  mainInstructorRequired?: number
  assistantInstructors?: Instructor[] | number // Can be array of instructors or count
  assistantInstructorRequired?: number
  mainInstructorName?: string
  assistantInstructorName?: string
}

export interface Instructor {
  id: string
  name: string
  status?: 'confirmed' | 'pending'
  homeAddressText?: string // Instructor residence address
  homeLat?: number // Latitude of home address
  homeLng?: number // Longitude of home address
  // Monthly teaching capacity (role-based)
  monthlyLeadMaxSessions?: number // Default monthly limit for lead instructor role
  monthlyAssistantMaxSessions?: number // Default monthly limit for assistant instructor role
  // Daily education limit override (optional, uses global default if not set)
  dailyEducationLimit?: number | null // null means use global default
}

export interface InstructorApplication {
  key: string
  educationId: string
  educationName: string
  institution: string
  region: string
  gradeClass: string
  role: string
  instructorId?: string // Instructor ID (preferred for matching)
  instructorName: string
  applicationDate: string
  status: '수락됨' | '거절됨' | '대기'
  educationStatus?: string
  applicationDeadline?: string
  applier?: {
    name: string
    email: string
    phone: string
    address: string
  }
  lessons?: Array<{
    session: number
    date: string
    startTime: string
    endTime: string
    mainInstructorApplied: number
    mainInstructorRequired: number
    mainInstructorName?: string
    assistantInstructorApplied: number
    assistantInstructorRequired: number
  }>
}

export interface InstructorAssignment {
  key: string
  educationId: string
  educationName: string
  institution: string
  region: string
  gradeClass: string
  period: string
  periodStart: string
  periodEnd: string
  assignmentStatus: 'confirmed' | 'unconfirmed'
  mainInstructorCount: number
  mainInstructorRequired: number
  assistantInstructorCount: number
  assistantInstructorRequired: number
  program?: string
  description?: string
  approvalStatus?: string
  status?: string
  note?: string
  lessons?: Array<{
    session: number
    date: string
    startTime: string
    endTime: string
    mainInstructors: Instructor[]
    mainInstructorRequired: number
    assistantInstructors: Instructor[]
    assistantInstructorRequired: number
  }>
}

// ==================== Initial Data ====================

// Storage key for localStorage
const EDUCATIONS_STORAGE_KEY = 'educations_data'
const INSTRUCTOR_APPLICATIONS_STORAGE_KEY = 'instructor_applications_data'
const INSTRUCTOR_ASSIGNMENTS_STORAGE_KEY = 'instructor_assignments_data'

// Load from localStorage on initialization
function loadEducationsFromStorage(): Education[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(EDUCATIONS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Only use stored data if it has items
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load educations from localStorage:', e)
  }
  return []
}

// Save to localStorage
function saveEducationsToStorage(educations: Education[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(EDUCATIONS_STORAGE_KEY, JSON.stringify(educations))
    // Dispatch storage event for cross-tab synchronization
    window.dispatchEvent(new StorageEvent('storage', {
      key: EDUCATIONS_STORAGE_KEY,
      newValue: JSON.stringify(educations),
    }))
  } catch (e) {
    console.error('Failed to save educations to localStorage:', e)
  }
}

// Default educations data
const defaultEducations: Education[] = [
  {
    key: '1',
    status: '신청 마감',
    educationId: 'EDU-2025-001',
    name: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    institution: '경기미래채움',
    region: '1권역',
    gradeClass: '1학년 3반',
    requestOrg: '경기도교육청',
    schoolName: '한마음초등학교',
    programTitle: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    courseName: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    totalSessions: 12,
    note: '-',
    period: '2025.01.15 ~ 2025.02.28',
    periodStart: '2025-01-15',
    periodEnd: '2025-02-28',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-02-15',
    lessons: [
      {
        title: '1차시',
        date: '2025.01.15',
        startTime: '10:00',
        endTime: '12:00',
        mainInstructors: 1,
        assistantInstructors: 1,
      },
      {
        title: '2차시',
        date: '2025.01.22',
        startTime: '10:00',
        endTime: '12:00',
        mainInstructors: 1,
        assistantInstructors: 1,
      },
    ],
  },
  {
    key: '2',
    status: '신청 중',
    educationId: 'EDU-2025-002',
    name: '도서벽지 지역 특별 교육',
    institution: '수원교육청',
    region: '2권역',
    gradeClass: '2학년 1반',
    period: '2025.01.10 ~ 2025.03.10',
    periodStart: '2025-01-10',
    periodEnd: '2025-03-10',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-02-28',
  },
  {
    key: '3',
    status: '신청 중',
    educationId: 'EDU-2025-003',
    name: '50차시 프로그래밍 심화 교육',
    institution: '성남교육청',
    region: '3권역',
    gradeClass: '4학년 2반',
    period: '2025-03-01 ~ 2025-05-30',
    periodStart: '2025-03-01',
    periodEnd: '2025-05-30',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-03-15',
    lessons: [
      {
        title: '1차시',
        date: '2025.03.01',
        startTime: '09:00',
        endTime: '10:40',
        mainInstructors: 2,
        assistantInstructors: 1,
      },
    ],
  },
  {
    key: '4',
    status: '신청 중',
    educationId: 'EDU-2025-004',
    name: '특수학급 맞춤형 코딩 교육',
    institution: '고양교육청',
    region: '4권역',
    gradeClass: '5학년 1반',
    period: '2025-03-10 ~ 2025-04-20',
    periodStart: '2025-03-10',
    periodEnd: '2025-04-20',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-03-20',
  },
  {
    key: '5',
    status: '신청 중',
    educationId: 'EDU-2025-005',
    name: '온라인 AI 기초 교육',
    institution: '용인교육청',
    region: '5권역',
    gradeClass: '6학년 3반',
    period: '2025-04-01 ~ 2025-05-15',
    periodStart: '2025-04-01',
    periodEnd: '2025-05-15',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-03-25',
  },
  {
    key: '6',
    status: '신청 중',
    educationId: 'EDU-2025-006',
    name: '신규 강사 양성 프로그램',
    institution: '부천교육청',
    region: '6권역',
    gradeClass: '2학년 1반',
    period: '2025-04-15 ~ 2025-06-30',
    periodStart: '2025-04-15',
    periodEnd: '2025-06-30',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-04-10',
  },
  // 평택안일초등학교 교육 데이터
  {
    key: '7',
    status: '강사공개',
    educationId: 'EDU-2025-101',
    name: '8차시 블록코딩과 엔트리 기초 및 인공지능',
    institution: '평택안일초등학교',
    region: '평택시',
    gradeClass: '5학년 6반',
    period: '2025-11-03 ~ 2025-11-10',
    periodStart: '2025-11-03',
    periodEnd: '2025-11-10',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-10-25',
    totalSessions: 8,
    lessons: [
      {
        session: 1,
        date: '2025-11-03',
        startTime: '09:00',
        endTime: '12:10',
        mainInstructors: 1,
        assistantInstructors: 1,
      },
      {
        session: 2,
        date: '2025-11-10',
        startTime: '09:00',
        endTime: '12:10',
        mainInstructors: 1,
        assistantInstructors: 1,
      },
    ],
  },
  {
    key: '8',
    status: '확정',
    educationId: 'EDU-2025-102',
    name: '12차시 스크래치 프로그래밍 기초',
    institution: '평택안일초등학교',
    region: '평택시',
    gradeClass: '4학년 3반',
    period: '2025-10-01 ~ 2025-10-15',
    periodStart: '2025-10-01',
    periodEnd: '2025-10-15',
    educationStatus: 'OPEN',
    totalSessions: 12,
  },
  {
    key: '9',
    status: '진행중',
    educationId: 'EDU-2025-103',
    name: '6차시 AI 체험 교육',
    institution: '평택안일초등학교',
    region: '평택시',
    gradeClass: '6학년 2반',
    period: '2025-09-15 ~ 2025-09-30',
    periodStart: '2025-09-15',
    periodEnd: '2025-09-30',
    educationStatus: 'OPEN',
    totalSessions: 6,
  },
  {
    key: '10',
    status: '종료',
    educationId: 'EDU-2024-201',
    name: '2024년 하반기 블록코딩 교육',
    institution: '평택안일초등학교',
    region: '평택시',
    gradeClass: '5학년 1반',
    period: '2024-09-01 ~ 2024-09-30',
    periodStart: '2024-09-01',
    periodEnd: '2024-09-30',
    educationStatus: 'OPEN',
    totalSessions: 8,
  },
  {
    key: '11',
    status: '확정',
    educationId: 'EDU-2024-100',
    name: '2024년 하반기 블록코딩 교육',
    institution: '수원교육청',
    region: '수원시',
    gradeClass: '3학년 2반',
    period: '2024-09-01 ~ 2024-11-30',
    periodStart: '2024-09-01',
    periodEnd: '2024-11-30',
    educationStatus: 'OPEN',
    programTitle: '2024년 하반기 블록코딩 교육',
    courseName: '2024년 하반기 블록코딩 교육',
    totalSessions: 8,
    regionAssignmentMode: 'PARTIAL',
  },
  // 신청 가능한 교육 예시 데이터 (강사공개 상태)
  {
    key: '12',
    status: '강사공개',
    educationId: 'EDU-2025-201',
    name: '12차시 스크래치 기초 프로그래밍',
    institution: '서울교육청',
    region: '1권역',
    gradeClass: '3학년 1반',
    period: '2025-06-01 ~ 2025-06-30',
    periodStart: '2025-06-01',
    periodEnd: '2025-06-30',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-05-25',
    totalSessions: 12,
    regionAssignmentMode: 'PARTIAL',
    lessons: [
      {
        title: '1차시',
        date: '2025.06.01',
        startTime: '09:00',
        endTime: '10:40',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 1,
        assistantInstructorRequired: 1,
      },
      {
        title: '2차시',
        date: '2025.06.08',
        startTime: '09:00',
        endTime: '10:40',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 1,
        assistantInstructorRequired: 1,
      },
    ],
  },
  {
    key: '13',
    status: '강사공개',
    educationId: 'EDU-2025-202',
    name: '16차시 AI와 메타버스 체험 교육',
    institution: '인천교육청',
    region: '2권역',
    gradeClass: '4학년 2반',
    period: '2025-07-01 ~ 2025-08-15',
    periodStart: '2025-07-01',
    periodEnd: '2025-08-15',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-06-20',
    totalSessions: 16,
    regionAssignmentMode: 'FULL',
    lessons: [
      {
        title: '1차시',
        date: '2025.07.01',
        startTime: '10:00',
        endTime: '12:00',
        mainInstructors: 2,
        mainInstructorRequired: 2,
        assistantInstructors: 1,
        assistantInstructorRequired: 1,
      },
      {
        title: '2차시',
        date: '2025.07.08',
        startTime: '10:00',
        endTime: '12:00',
        mainInstructors: 2,
        mainInstructorRequired: 2,
        assistantInstructors: 1,
        assistantInstructorRequired: 1,
      },
    ],
  },
  {
    key: '14',
    status: '강사공개',
    educationId: 'EDU-2025-203',
    name: '8차시 엔트리 블록코딩 기초',
    institution: '부산교육청',
    region: '3권역',
    gradeClass: '2학년 3반',
    period: '2025-05-15 ~ 2025-06-05',
    periodStart: '2025-05-15',
    periodEnd: '2025-06-05',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-05-10',
    totalSessions: 8,
    regionAssignmentMode: 'PARTIAL',
    lessons: [
      {
        title: '1차시',
        date: '2025.05.15',
        startTime: '13:00',
        endTime: '14:40',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 0,
        assistantInstructorRequired: 0,
      },
      {
        title: '2차시',
        date: '2025.05.22',
        startTime: '13:00',
        endTime: '14:40',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 0,
        assistantInstructorRequired: 0,
      },
    ],
  },
  {
    key: '15',
    status: '강사공개',
    educationId: 'EDU-2025-204',
    name: '20차시 파이썬 기초 프로그래밍',
    institution: '대전교육청',
    region: '4권역',
    gradeClass: '5학년 4반',
    period: '2025-08-01 ~ 2025-09-30',
    periodStart: '2025-08-01',
    periodEnd: '2025-09-30',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-07-20',
    totalSessions: 20,
    regionAssignmentMode: 'FULL',
    lessons: [
      {
        title: '1차시',
        date: '2025.08.01',
        startTime: '14:00',
        endTime: '15:40',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 1,
        assistantInstructorRequired: 1,
      },
    ],
  },
  {
    key: '16',
    status: '강사공개',
    educationId: 'EDU-2025-205',
    name: '특수학급 맞춤형 코딩 교육 (12차시)',
    institution: '광주교육청',
    region: '5권역',
    gradeClass: '특수학급',
    period: '2025-06-10 ~ 2025-07-10',
    periodStart: '2025-06-10',
    periodEnd: '2025-07-10',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-06-05',
    totalSessions: 12,
    regionAssignmentMode: 'PARTIAL',
    lessons: [
      {
        title: '1차시',
        date: '2025.06.10',
        startTime: '09:00',
        endTime: '10:40',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 1,
        assistantInstructorRequired: 1,
      },
    ],
  },
  {
    key: '17',
    status: '강사공개',
    educationId: 'EDU-2025-206',
    name: '도서벽지 지역 특별 코딩 교육',
    institution: '제주교육청',
    region: '6권역',
    gradeClass: '4학년 1반',
    period: '2025-07-15 ~ 2025-08-15',
    periodStart: '2025-07-15',
    periodEnd: '2025-08-15',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-07-10',
    totalSessions: 10,
    regionAssignmentMode: 'FULL',
    lessons: [
      {
        title: '1차시',
        date: '2025.07.15',
        startTime: '10:00',
        endTime: '11:40',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 0,
        assistantInstructorRequired: 0,
      },
    ],
  },
  // 오픈 예정 교육 데이터 (미래 날짜)
  {
    key: '18',
    status: '신청 중',
    educationId: 'EDU-2025-301',
    name: '2025년 하반기 AI 기초 교육',
    institution: '서울교육청',
    region: '1권역',
    gradeClass: '3학년 2반',
    period: '2025-09-01 ~ 2025-12-20',
    periodStart: '2025-09-01',
    periodEnd: '2025-12-20',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-08-25',
    totalSessions: 16,
    regionAssignmentMode: 'FULL',
    lessons: [
      {
        title: '1차시',
        date: '2025.09.01',
        startTime: '09:00',
        endTime: '12:00',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 1,
        assistantInstructorRequired: 1,
      },
    ],
  },
  {
    key: '19',
    status: '강사공개',
    educationId: 'EDU-2025-302',
    name: '로봇공학 심화 프로그램',
    institution: '부산교육청',
    region: '2권역',
    gradeClass: '5학년 3반',
    period: '2025-10-15 ~ 2025-12-15',
    periodStart: '2025-10-15',
    periodEnd: '2025-12-15',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-10-01',
    totalSessions: 20,
    regionAssignmentMode: 'PARTIAL',
    lessons: [
      {
        title: '1차시',
        date: '2025.10.15',
        startTime: '14:00',
        endTime: '16:00',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 2,
        assistantInstructorRequired: 2,
      },
    ],
  },
  {
    key: '20',
    status: '신청 중',
    educationId: 'EDU-2025-303',
    name: '메타버스 창작 워크숍',
    institution: '인천교육청',
    region: '3권역',
    gradeClass: '4학년 1반',
    period: '2025-11-01 ~ 2025-11-30',
    periodStart: '2025-11-01',
    periodEnd: '2025-11-30',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-10-20',
    totalSessions: 8,
    regionAssignmentMode: 'FULL',
    lessons: [
      {
        title: '1차시',
        date: '2025.11.01',
        startTime: '10:00',
        endTime: '12:00',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 1,
        assistantInstructorRequired: 1,
      },
    ],
  },
  {
    key: '21',
    status: '강사공개',
    educationId: 'EDU-2025-304',
    name: '게임 개발 기초 과정',
    institution: '대전교육청',
    region: '4권역',
    gradeClass: '6학년 2반',
    period: '2025-12-01 ~ 2026-02-28',
    periodStart: '2025-12-01',
    periodEnd: '2026-02-28',
    educationStatus: 'OPEN',
    applicationDeadline: '2025-11-20',
    totalSessions: 24,
    regionAssignmentMode: 'PARTIAL',
    lessons: [
      {
        title: '1차시',
        date: '2025.12.01',
        startTime: '09:00',
        endTime: '11:00',
        mainInstructors: 1,
        mainInstructorRequired: 1,
        assistantInstructors: 1,
        assistantInstructorRequired: 1,
      },
    ],
  },
]

// Initialize educations - use stored data if available, otherwise use defaults
let educations: Education[] = (() => {
  const stored = loadEducationsFromStorage()
  return stored.length > 0 ? stored : defaultEducations
})()

// If no stored data, save defaults to localStorage on first load
if (typeof window !== 'undefined') {
  const stored = loadEducationsFromStorage()
  if (stored.length === 0) {
    saveEducationsToStorage(defaultEducations)
  }
}

let instructorApplications: InstructorApplication[] = [
  {
    key: '1',
    educationId: 'EDU-2025-001',
    educationName: '도서벽지 프로그램',
    institution: '수원교육청',
    region: '수원시',
    gradeClass: '3학년 1반',
    role: '주강사',
    instructorName: '홍길동',
    applicationDate: '2025.01.15',
    status: '대기',
    educationStatus: '신청 중',
    applicationDeadline: '2025-02-28',
    applier: {
      name: '홍길동',
      email: 'hong.gildong@example.com',
      phone: '010-1234-5678',
      address: '경기도 수원시 영통구 월드컵로 123',
    },
  },
  {
    key: '2',
    educationId: 'EDU-2025-003',
    educationName: '50차시 프로그래밍 심화 교육',
    institution: '성남교육청',
    region: '성남시',
    gradeClass: '4학년 2반',
    role: '보조강사',
    instructorName: '홍길동',
    applicationDate: '2025.02.10',
    status: '수락됨',
    educationStatus: '신청 중',
    applicationDeadline: '2025-03-15',
  },
  {
    key: '3',
    educationId: 'EDU-2025-004',
    educationName: '특수학급 맞춤형 코딩 교육',
    institution: '고양교육청',
    region: '고양시',
    gradeClass: '5학년 1반',
    role: '주강사',
    instructorName: '홍길동',
    applicationDate: '2025.02.20',
    status: '거절됨',
    educationStatus: '신청 중',
    applicationDeadline: '2025-03-20',
  },
  {
    key: '4',
    educationId: 'EDU-2025-005',
    educationName: '온라인 AI 기초 교육',
    institution: '용인교육청',
    region: '용인시',
    gradeClass: '6학년 3반',
    role: '보조강사',
    instructorName: '홍길동',
    applicationDate: '2025.02.25',
    status: '대기',
    educationStatus: '신청 중',
    applicationDeadline: '2025-03-25',
  },
  {
    key: '5',
    educationId: 'EDU-2025-006',
    educationName: '신규 강사 양성 프로그램',
    institution: '부천교육청',
    region: '부천시',
    gradeClass: '2학년 1반',
    role: '주강사',
    instructorName: '홍길동',
    applicationDate: '2025.03.01',
    status: '수락됨',
    educationStatus: '신청 중',
    applicationDeadline: '2025-04-10',
  },
]

let instructorAssignments: InstructorAssignment[] = [
  {
    key: '1',
    educationId: 'EDU-2025-001',
    educationName: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    institution: '경기미래채움',
    region: '1권역',
    gradeClass: '1학년 3반',
    period: '2025-01-15 ~ 2025-02-28',
    periodStart: '2025-01-15',
    periodEnd: '2025-02-28',
    assignmentStatus: 'confirmed',
    mainInstructorCount: 2,
    mainInstructorRequired: 2,
    assistantInstructorCount: 3,
    assistantInstructorRequired: 3,
    program: '블록코딩 프로그램',
    description: '블록코딩과 메타버스 기초 교육',
    approvalStatus: '승인됨',
    status: '진행중',
    note: '-',
    lessons: [
      {
        session: 1,
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '09:40',
        mainInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: 'instructor-2', name: '김보조', status: 'confirmed' },
          { id: 'instructor-3', name: '이보조', status: 'confirmed' },
        ],
        assistantInstructorRequired: 2,
      },
      {
        session: 2,
        date: '2025-01-22',
        startTime: '10:00',
        endTime: '10:40',
        mainInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: 'instructor-2', name: '김보조', status: 'confirmed' },
        ],
        assistantInstructorRequired: 1,
      },
    ],
  },
  {
    key: '2',
    educationId: 'EDU-2025-003',
    educationName: '50차시 프로그래밍 심화 교육',
    institution: '성남교육청',
    region: '3권역',
    gradeClass: '4학년 2반',
    period: '2025-03-01 ~ 2025-05-30',
    periodStart: '2025-03-01',
    periodEnd: '2025-05-30',
    assignmentStatus: 'confirmed',
    mainInstructorCount: 2,
    mainInstructorRequired: 2,
    assistantInstructorCount: 1,
    assistantInstructorRequired: 1,
    program: '프로그래밍 심화',
    description: '프로그래밍 심화 교육',
    approvalStatus: '승인됨',
    status: '진행중',
    note: '-',
    lessons: [
      {
        session: 1,
        date: '2025-03-01',
        startTime: '09:00',
        endTime: '10:40',
        mainInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' }, // 홍길동이 주강사
          { id: 'instructor-2', name: '김보조', status: 'confirmed' }, // 김보조도 주강사
        ],
        mainInstructorRequired: 2,
        assistantInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' }, // 홍길동이 보조강사도 겸임
        ],
        assistantInstructorRequired: 1,
      },
    ],
  },
  {
    key: '3',
    educationId: 'EDU-2025-006',
    educationName: '신규 강사 양성 프로그램',
    institution: '부천교육청',
    region: '6권역',
    gradeClass: '2학년 1반',
    period: '2025-04-15 ~ 2025-06-30',
    periodStart: '2025-04-15',
    periodEnd: '2025-06-30',
    assignmentStatus: 'confirmed',
    mainInstructorCount: 1,
    mainInstructorRequired: 1,
    assistantInstructorCount: 0,
    assistantInstructorRequired: 0,
    program: '신규 강사 양성',
    description: '신규 강사 양성 프로그램',
    approvalStatus: '승인됨',
    status: '진행중',
    note: '-',
    lessons: [
      {
        session: 1,
        date: '2025-04-15',
        startTime: '10:00',
        endTime: '11:40',
        mainInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [],
        assistantInstructorRequired: 0,
      },
    ],
  },
  {
    key: '4',
    educationId: 'EDU-2024-100',
    educationName: '2024년 하반기 블록코딩 교육',
    institution: '수원교육청',
    region: '수원시',
    gradeClass: '3학년 2반',
    period: '2024-09-01 ~ 2024-11-30',
    periodStart: '2024-09-01',
    periodEnd: '2024-11-30',
    assignmentStatus: 'confirmed',
    mainInstructorCount: 2,
    mainInstructorRequired: 2,
    assistantInstructorCount: 1,
    assistantInstructorRequired: 1,
    program: '블록코딩',
    description: '2024년 하반기 블록코딩 교육',
    approvalStatus: '승인됨',
    status: '완료',
    note: '-',
    lessons: [
      {
        session: 1,
        date: '2024-09-01',
        startTime: '09:00',
        endTime: '09:40',
        mainInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' }, // 홍길동이 주강사
          { id: 'instructor-3', name: '이보조', status: 'confirmed' }, // 이보조도 주강사
        ],
        mainInstructorRequired: 2,
        assistantInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' }, // 홍길동이 보조강사도 겸임
        ],
        assistantInstructorRequired: 1,
      },
    ],
  },
  {
    key: '5',
    educationId: 'EDU-2024-101',
    educationName: '2024년 상반기 AI 기초 교육',
    institution: '성남교육청',
    region: '성남시',
    gradeClass: '5학년 1반',
    period: '2024-03-01 ~ 2024-05-31',
    periodStart: '2024-03-01',
    periodEnd: '2024-05-31',
    assignmentStatus: 'confirmed',
    mainInstructorCount: 1,
    mainInstructorRequired: 1,
    assistantInstructorCount: 0,
    assistantInstructorRequired: 0,
    program: 'AI 기초',
    description: '2024년 상반기 AI 기초 교육',
    approvalStatus: '승인됨',
    status: '완료',
    note: '-',
    lessons: [
      {
        session: 1,
        date: '2024-03-01',
        startTime: '10:00',
        endTime: '11:40',
        mainInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [],
        assistantInstructorRequired: 0,
      },
    ],
  },
  // 평택안일초등학교 배정 데이터
  {
    key: '6',
    educationId: 'EDU-2025-101',
    educationName: '8차시 블록코딩과 엔트리 기초 및 인공지능',
    institution: '평택안일초등학교',
    region: '평택시',
    gradeClass: '5학년 6반',
    period: '2025-11-03 ~ 2025-11-10',
    periodStart: '2025-11-03',
    periodEnd: '2025-11-10',
    assignmentStatus: 'confirmed',
    mainInstructorCount: 1,
    mainInstructorRequired: 1,
    assistantInstructorCount: 1,
    assistantInstructorRequired: 1,
    program: '블록코딩',
    description: '8차시 블록코딩과 엔트리 기초 및 인공지능',
    approvalStatus: '승인됨',
    status: '진행중',
    note: '-',
    lessons: [
      {
        session: 1,
        date: '2025-11-03',
        startTime: '09:00',
        endTime: '12:10',
        mainInstructors: [
          { id: 'instructor-4', name: '박정아', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: 'instructor-5', name: '김윤미', status: 'confirmed' },
        ],
        assistantInstructorRequired: 1,
      },
      {
        session: 2,
        date: '2025-11-10',
        startTime: '09:00',
        endTime: '12:10',
        mainInstructors: [
          { id: 'instructor-4', name: '박정아', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: 'instructor-5', name: '김윤미', status: 'confirmed' },
        ],
        assistantInstructorRequired: 1,
      },
    ],
  },
  // 추가 교육 배정 데이터 - 같은 강사가 다른 역할로
  {
    key: '7',
    educationId: 'EDU-2025-102',
    educationName: '12차시 스크래치 프로그래밍 기초',
    institution: '평택안일초등학교',
    region: '평택시',
    gradeClass: '4학년 3반',
    period: '2025-10-01 ~ 2025-10-15',
    periodStart: '2025-10-01',
    periodEnd: '2025-10-15',
    assignmentStatus: 'confirmed',
    mainInstructorCount: 2,
    mainInstructorRequired: 2,
    assistantInstructorCount: 1,
    assistantInstructorRequired: 1,
    program: '스크래치 프로그래밍',
    description: '12차시 스크래치 프로그래밍 기초',
    approvalStatus: '승인됨',
    status: '진행중',
    note: '-',
    lessons: [
      {
        session: 1,
        date: '2025-10-01',
        startTime: '10:00',
        endTime: '11:40',
        mainInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' }, // 홍길동이 주강사
          { id: 'instructor-2', name: '김보조', status: 'confirmed' }, // 김보조도 주강사
        ],
        mainInstructorRequired: 2,
        assistantInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' }, // 홍길동이 보조강사도 겸임
        ],
        assistantInstructorRequired: 1,
      },
      {
        session: 2,
        date: '2025-10-08',
        startTime: '10:00',
        endTime: '11:40',
        mainInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' }, // 홍길동이 주강사
          { id: 'instructor-2', name: '김보조', status: 'confirmed' }, // 김보조도 주강사
        ],
        mainInstructorRequired: 2,
        assistantInstructors: [
          { id: 'instructor-1', name: '홍길동', status: 'confirmed' }, // 홍길동이 보조강사도 겸임
        ],
        assistantInstructorRequired: 1,
      },
    ],
  },
  {
    key: '8',
    educationId: 'EDU-2025-103',
    educationName: '6차시 AI 체험 교육',
    institution: '평택안일초등학교',
    region: '평택시',
    gradeClass: '6학년 2반',
    period: '2025-09-15 ~ 2025-09-30',
    periodStart: '2025-09-15',
    periodEnd: '2025-09-30',
    assignmentStatus: 'confirmed',
    mainInstructorCount: 1,
    mainInstructorRequired: 1,
    assistantInstructorCount: 1,
    assistantInstructorRequired: 1,
    program: 'AI 체험',
    description: '6차시 AI 체험 교육',
    approvalStatus: '승인됨',
    status: '진행중',
    note: '-',
    lessons: [
      {
        session: 1,
        date: '2025-09-15',
        startTime: '14:00',
        endTime: '15:40',
        mainInstructors: [
          { id: 'instructor-3', name: '이보조', status: 'confirmed' }, // 이보조가 주강사
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: 'instructor-2', name: '김보조', status: 'confirmed' }, // 김보조가 보조강사
        ],
        assistantInstructorRequired: 1,
      },
    ],
  },
]

// ==================== Store API ====================

export const dataStore = {
  // Education CRUD
  getEducations: (): Education[] => {
    return [...educations]
  },

  getEducationById: (educationId: string): Education | undefined => {
    return educations.find((e) => e.educationId === educationId)
  },

  updateEducation: (educationId: string, updates: Partial<Education>): void => {
    const index = educations.findIndex((e) => e.educationId === educationId)
    if (index !== -1) {
      // Ensure regionAssignmentMode defaults to 'PARTIAL' if not provided
      // Ensure applicationRestriction defaults to 'ALL' if not provided
      const finalUpdates = {
        ...updates,
        regionAssignmentMode: updates.regionAssignmentMode || educations[index].regionAssignmentMode || 'PARTIAL',
        applicationRestriction: updates.applicationRestriction !== undefined 
          ? updates.applicationRestriction 
          : educations[index].applicationRestriction || 'ALL',
      }
      educations[index] = { ...educations[index], ...finalUpdates }
      
      // Map status to educationStatus if status is updated
      if (updates.status) {
        // Map status values to educationStatus
        const statusMapping: Record<string, 'OPEN' | 'INIT' | 'CANCEL' | '신청 중' | '신청 마감' | '대기'> = {
          '강사공개': 'OPEN',
          '신청 중': '신청 중',
          '신청 마감': '신청 마감',
          '오픈예정': 'OPEN',
          '확정': 'OPEN',
          '교육 진행 중': 'OPEN',
          '종료': '신청 마감',
          '중지': 'CANCEL',
          '대기': '대기',
        }
        
        const mappedEducationStatus = statusMapping[updates.status]
        if (mappedEducationStatus) {
          educations[index].educationStatus = mappedEducationStatus
        }
      }
      
      // Save to localStorage
      saveEducationsToStorage(educations)
      
      // Dispatch event for status updates
      if (updates.status) {
        window.dispatchEvent(
          new CustomEvent('educationStatusUpdated', {
            detail: { educationIds: [educationId] },
          })
        )
      }
      // Dispatch general education update event
      window.dispatchEvent(
        new CustomEvent('educationUpdated', {
          detail: { educationIds: [educationId] },
        })
      )
    }
  },

  addEducation: (education: Education): void => {
    // Ensure regionAssignmentMode defaults to 'PARTIAL' if not provided
    // Ensure applicationRestriction defaults to 'ALL' if not provided
    const educationWithDefaults = {
      ...education,
      regionAssignmentMode: education.regionAssignmentMode || 'PARTIAL',
      applicationRestriction: education.applicationRestriction || 'ALL',
    }
    educations.push(educationWithDefaults)
  },

  deleteEducation: (educationId: string): void => {
    educations = educations.filter((e) => e.educationId !== educationId)
  },

  // Instructor Application CRUD
  getInstructorApplications: (): InstructorApplication[] => {
    return [...instructorApplications]
  },

  getInstructorApplicationByKey: (key: string): InstructorApplication | undefined => {
    return instructorApplications.find((app) => app.key === key)
  },

  getInstructorApplicationsByEducationId: (educationId: string): InstructorApplication[] => {
    return instructorApplications.filter((app) => app.educationId === educationId)
  },

  updateInstructorApplication: (key: string, updates: Partial<InstructorApplication>): void => {
    const index = instructorApplications.findIndex((app) => app.key === key)
    if (index !== -1) {
      instructorApplications[index] = { ...instructorApplications[index], ...updates }
      // Sync with assignment if status changed
      if (updates.status) {
        dataStore.syncApplicationToAssignment(instructorApplications[index])
      }
    }
  },

  addInstructorApplication: (application: InstructorApplication): void => {
    instructorApplications.push(application)
  },

  deleteInstructorApplication: (key: string): void => {
    instructorApplications = instructorApplications.filter((app) => app.key !== key)
  },

  // Instructor Assignment CRUD
  getInstructorAssignments: (): InstructorAssignment[] => {
    return [...instructorAssignments]
  },

  getInstructorAssignmentByEducationId: (educationId: string): InstructorAssignment | undefined => {
    return instructorAssignments.find((assign) => assign.educationId === educationId)
  },

  updateInstructorAssignment: (educationId: string, updates: Partial<InstructorAssignment>): void => {
    const index = instructorAssignments.findIndex((assign) => assign.educationId === educationId)
    if (index !== -1) {
      instructorAssignments[index] = { ...instructorAssignments[index], ...updates }
      // Sync with applications if needed
      dataStore.syncAssignmentToApplications(educationId, instructorAssignments[index])
    }
  },

  addInstructorAssignment: (assignment: InstructorAssignment): void => {
    instructorAssignments.push(assignment)
  },

  deleteInstructorAssignment: (educationId: string): void => {
    instructorAssignments = instructorAssignments.filter((assign) => assign.educationId !== educationId)
  },

  // Sync functions
  syncApplicationToAssignment: (application: InstructorApplication): void => {
    // When application status changes, update assignment if exists
    const assignment = instructorAssignments.find((a) => a.educationId === application.educationId)
    if (assignment && application.status === '수락됨') {
      // Add instructor to assignment lessons if needed
      // This is a simplified sync - adjust based on your business logic
    }
  },

  syncAssignmentToApplications: (educationId: string, assignment: InstructorAssignment): void => {
    // When assignment changes, update related applications
    const relatedApplications = instructorApplications.filter((app) => app.educationId === educationId)
    relatedApplications.forEach((app) => {
      // Update application status based on assignment state
      // This is a simplified sync - adjust based on your business logic
    })
  },

  // Final confirm instructor in assignment
  confirmInstructorInAssignment: (
    educationId: string,
    session: number,
    instructorId: string,
    type: 'main' | 'assistant'
  ): void => {
    const assignment = instructorAssignments.find((a) => a.educationId === educationId)
    if (!assignment || !assignment.lessons) return

    const lesson = assignment.lessons.find((l) => l.session === session)
    if (!lesson) return

    if (type === 'main') {
      const instructor = lesson.mainInstructors?.find((inst) => inst.id === instructorId)
      if (instructor) {
        instructor.status = 'confirmed'
        // Sync to application
        const relatedApp = instructorApplications.find(
          (app) => app.educationId === educationId && app.instructorName === instructor.name
        )
        if (relatedApp) {
          relatedApp.status = '수락됨'
        }
      }
    } else {
      const instructor = lesson.assistantInstructors?.find((inst) => inst.id === instructorId)
      if (instructor) {
        instructor.status = 'confirmed'
        // Sync to application
        const relatedApp = instructorApplications.find(
          (app) => app.educationId === educationId && app.instructorName === instructor.name
        )
        if (relatedApp) {
          relatedApp.status = '수락됨'
        }
      }
    }
  },

  // Delete instructor from assignment
  deleteInstructorFromAssignment: (
    educationId: string,
    session: number,
    instructorId: string,
    type: 'main' | 'assistant'
  ): void => {
    const assignment = instructorAssignments.find((a) => a.educationId === educationId)
    if (!assignment || !assignment.lessons) return

    const lesson = assignment.lessons.find((l) => l.session === session)
    if (!lesson) return

    if (type === 'main') {
      const instructor = lesson.mainInstructors?.find((inst) => inst.id === instructorId)
      if (instructor) {
        lesson.mainInstructors = lesson.mainInstructors?.filter((inst) => inst.id !== instructorId) || []
        // Sync to application
        const relatedApp = instructorApplications.find(
          (app) => app.educationId === educationId && app.instructorName === instructor.name
        )
        if (relatedApp && instructor.status === 'pending') {
          relatedApp.status = '거절됨'
        }
      }
    } else {
      const instructor = lesson.assistantInstructors?.find((inst) => inst.id === instructorId)
      if (instructor) {
        lesson.assistantInstructors = lesson.assistantInstructors?.filter((inst) => inst.id !== instructorId) || []
        // Sync to application
        const relatedApp = instructorApplications.find(
          (app) => app.educationId === educationId && app.instructorName === instructor.name
        )
        if (relatedApp && instructor.status === 'pending') {
          relatedApp.status = '거절됨'
        }
      }
    }
  },
}

// ==================== React Hook for Data Store ====================

import { useState, useEffect, useCallback } from 'react'

/**
 * Hook to use education data with auto-refresh
 */
export function useEducations() {
  const [educations, setEducations] = useState<Education[]>(dataStore.getEducations())

  const refresh = useCallback(() => {
    setEducations(dataStore.getEducations())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { educations, refresh }
}

/**
 * Hook to use instructor applications with auto-refresh
 */
export function useInstructorApplications() {
  const [applications, setApplications] = useState<InstructorApplication[]>(dataStore.getInstructorApplications())

  const refresh = useCallback(() => {
    setApplications(dataStore.getInstructorApplications())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { applications, refresh }
}

/**
 * Hook to use instructor assignments with auto-refresh
 */
export function useInstructorAssignments() {
  const [assignments, setAssignments] = useState<InstructorAssignment[]>(dataStore.getInstructorAssignments())

  const refresh = useCallback(() => {
    setAssignments(dataStore.getInstructorAssignments())
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { assignments, refresh }
}

