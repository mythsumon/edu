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
    instructorName: '김철수',
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
]

let instructorAssignments: InstructorAssignment[] = [
  {
    key: '1',
    educationId: 'EDU-2025-001',
    educationName: '12차시 블록코딩과 메타버스 기초 및 인공지능 AI',
    institution: '경기미래채움',
    region: '1권역',
    gradeClass: '1학년 3반',
    period: '2025-11-24 ~ 2025-11-24',
    periodStart: '2025-11-24',
    periodEnd: '2025-11-24',
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
        date: '2025-11-24',
        startTime: '09:00',
        endTime: '09:40',
        mainInstructors: [
          { id: '1', name: '우수정', status: 'confirmed' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: '2', name: '김보조', status: 'confirmed' },
          { id: '3', name: '이보조', status: 'confirmed' },
          { id: '4', name: '박보조', status: 'confirmed' },
        ],
        assistantInstructorRequired: 3,
      },
      {
        session: 3,
        date: '2025-11-24',
        startTime: '10:30',
        endTime: '11:10',
        mainInstructors: [
          { id: '9', name: '신청자1', status: 'pending' },
        ],
        mainInstructorRequired: 1,
        assistantInstructors: [
          { id: '10', name: '신청자2', status: 'pending' },
        ],
        assistantInstructorRequired: 3,
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

