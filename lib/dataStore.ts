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
  educationStatus?: 'OPEN' | 'INIT' | 'CANCEL' | '신청 중' | '신청 마감'
  applicationDeadline?: string
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
}

export interface InstructorApplication {
  key: string
  educationId: string
  educationName: string
  institution: string
  region: string
  gradeClass: string
  role: string
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

let educations: Education[] = [
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
]

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
          { id: '1', name: '홍길동', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: '2', name: '김보조', status: 'confirmed' },
          { id: '3', name: '이보조', status: 'confirmed' },
        ],
        assistantInstructorRequired: 2,
      },
      {
        session: 2,
        date: '2025-01-22',
        startTime: '10:00',
        endTime: '10:40',
        mainInstructors: [
          { id: '1', name: '홍길동', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: '2', name: '김보조', status: 'confirmed' },
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
    mainInstructorCount: 1,
    mainInstructorRequired: 1,
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
          { id: '5', name: '다른강사', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: '1', name: '홍길동', status: 'confirmed' },
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
          { id: '1', name: '홍길동', status: 'confirmed' },
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
    mainInstructorCount: 1,
    mainInstructorRequired: 1,
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
          { id: '1', name: '홍길동', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: '6', name: '보조강사1', status: 'confirmed' },
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
          { id: '1', name: '홍길동', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [],
        assistantInstructorRequired: 0,
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
      educations[index] = { ...educations[index], ...updates }
      // Notify listeners if needed
    }
  },

  addEducation: (education: Education): void => {
    educations.push(education)
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

