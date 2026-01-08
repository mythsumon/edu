// Initialize example attendance documents for testing
import { upsertAttendanceDoc, type AttendanceDocument } from './storage'

export function initExampleAttendanceDocs() {
  if (typeof window === 'undefined') return

  // Check if example data already exists
  const existingDocs = JSON.parse(localStorage.getItem('attendance_documents') || '[]')
  if (existingDocs.length > 0) {
    console.log('Example attendance docs already exist')
    return
  }

  const exampleDoc1: AttendanceDocument = {
    id: 'attendance-1',
    educationId: '1',
    assignmentId: 'assignment-1',
    location: '평택시',
    institution: '평택안일초등학교',
    gradeClass: '5학년 6반',
    programName: '8차시 블록코딩과 엔트리 기초 및 인공지능',
    totalSessions: 8,
    maleCount: 11,
    femaleCount: 11,
    schoolContactName: '박지민',
    institutionContact: {
      name: '김담당',
      phone: '010-1234-5678',
      email: 'contact@school.kr',
    },
    signatures: {
      school: {
        signedByUserId: 'school-1',
        signedByUserName: '박지민',
        signedAt: new Date().toISOString(),
        signatureImageUrl: '/api/placeholder/200/80',
      },
      session1MainInstructor: {
        signedByUserId: 'instructor-1',
        signedByUserName: '홍길동',
        signedAt: new Date().toISOString(),
        signatureImageUrl: '/api/placeholder/200/80',
      },
      session1AssistantInstructor: {
        signedByUserId: 'instructor-2',
        signedByUserName: '이보조',
        signedAt: new Date().toISOString(),
        signatureImageUrl: '/api/placeholder/200/80',
      },
      session2MainInstructor: {
        signedByUserId: 'instructor-1',
        signedByUserName: '홍길동',
        signedAt: new Date().toISOString(),
        signatureImageUrl: '/api/placeholder/200/80',
      },
      session2AssistantInstructor: {
        signedByUserId: 'instructor-2',
        signedByUserName: '이보조',
        signedAt: new Date().toISOString(),
        signatureImageUrl: '/api/placeholder/200/80',
      },
    },
    sessions: [
      {
        sessionNumber: 1,
        date: '2025-01-15',
        startTime: '09:00',
        endTime: '12:00',
        sessions: 4,
        mainInstructor: '홍길동',
        assistantInstructor: '이보조',
        institutionContacts: ['김담당'],
        studentCount: 22,
        attendanceCount: 20,
      },
      {
        sessionNumber: 2,
        date: '2025-01-22',
        startTime: '09:00',
        endTime: '12:00',
        sessions: 4,
        mainInstructor: '홍길동',
        assistantInstructor: '이보조',
        institutionContacts: ['김담당'],
        studentCount: 22,
        attendanceCount: 21,
      },
    ],
    students: [
      { id: '1', number: 1, name: '김학생', gender: '남', sessionAttendances: [4, 4], completionStatus: 'O' },
      { id: '2', number: 2, name: '이학생', gender: '여', sessionAttendances: [4, 4], completionStatus: 'O' },
      { id: '3', number: 3, name: '박학생', gender: '남', sessionAttendances: [3, 4], completionStatus: 'O' },
      { id: '4', number: 4, name: '최학생', gender: '여', sessionAttendances: [4, 3], completionStatus: 'O' },
      { id: '5', number: 5, name: '정학생', gender: '남', sessionAttendances: [2, 4], completionStatus: 'X' },
    ],
    status: 'SUBMITTED',
    submittedAt: new Date().toISOString(),
    submittedBy: '홍길동',
    createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
  }

  const exampleDoc2: AttendanceDocument = {
    id: 'attendance-2',
    educationId: '2',
    assignmentId: 'assignment-2',
    location: '수원시',
    institution: '수원중앙초등학교',
    gradeClass: '4학년 3반',
    programName: '10차시 스크래치 기초 프로그래밍',
    totalSessions: 10,
    maleCount: 15,
    femaleCount: 12,
    schoolContactName: '이담당',
    institutionContact: {
      name: '박담당',
      phone: '010-9876-5432',
      email: 'contact2@school.kr',
    },
    signatures: {
      school: {
        signedByUserId: 'school-2',
        signedByUserName: '이담당',
        signedAt: new Date().toISOString(),
        signatureImageUrl: '/api/placeholder/200/80',
      },
    },
    sessions: [
      {
        sessionNumber: 1,
        date: '2025-01-20',
        startTime: '10:00',
        endTime: '12:00',
        sessions: 2,
        mainInstructor: '홍길동',
        assistantInstructor: '김보조',
        institutionContacts: ['박담당'],
        studentCount: 27,
        attendanceCount: 25,
      },
    ],
    students: [
      { id: '1', number: 1, name: '강학생', gender: '남', sessionAttendances: [2], completionStatus: 'O' },
      { id: '2', number: 2, name: '윤학생', gender: '여', sessionAttendances: [2], completionStatus: 'O' },
      { id: '3', number: 3, name: '장학생', gender: '남', sessionAttendances: [1], completionStatus: 'X' },
    ],
    status: 'APPROVED',
    submittedAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    submittedBy: '홍길동',
    approvedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    approvedBy: '관리자',
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  }

  const exampleDoc3: AttendanceDocument = {
    id: 'attendance-3',
    educationId: '3',
    assignmentId: 'assignment-3',
    location: '성남시',
    institution: '성남서초등학교',
    gradeClass: '6학년 2반',
    programName: '12차시 파이썬 기초',
    totalSessions: 12,
    maleCount: 10,
    femaleCount: 13,
    schoolContactName: '최담당',
    institutionContact: {
      name: '정담당',
      phone: '010-5555-6666',
      email: 'contact3@school.kr',
    },
    signatures: {},
    sessions: [],
    students: [],
    status: 'DRAFT',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // Save example documents
  upsertAttendanceDoc(exampleDoc1)
  upsertAttendanceDoc(exampleDoc2)
  upsertAttendanceDoc(exampleDoc3)

  console.log('Example attendance documents initialized')
}

