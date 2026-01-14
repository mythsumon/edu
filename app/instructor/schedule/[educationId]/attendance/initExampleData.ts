// Initialize example attendance documents for testing
import { upsertAttendanceDoc, type AttendanceDocument } from './storage'
import { instructorCourses } from '@/mock/instructorDashboardData'

export function initExampleAttendanceDocs() {
  if (typeof window === 'undefined') return

  // Check if example data already exists
  const existingDocs = JSON.parse(localStorage.getItem('attendance_documents') || '[]')
  if (existingDocs.length >= 10) {
    console.log('Example attendance docs already exist')
    return
  }

  // Generate 10 example documents based on instructorCourses
  const exampleDocs: AttendanceDocument[] = []

  for (let i = 0; i < Math.min(10, instructorCourses.length); i++) {
    const course = instructorCourses[i]
    const now = new Date()
    const daysAgo = i * 2 // Spread dates across time
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    
    const statuses: Array<'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'> = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']
    const status = statuses[i % 4]
    
    const doc: AttendanceDocument = {
      id: `attendance-${i + 1}`,
      educationId: course.id,
      assignmentId: `assignment-${i + 1}`,
      location: course.region || '서울',
      institution: course.institutionName,
      gradeClass: course.classInfo,
      programName: course.educationName,
      totalSessions: 8 + (i % 4),
      maleCount: 10 + (i % 10),
      femaleCount: 10 + (i % 8),
      schoolContactName: `담당자${i + 1}`,
      institutionContact: {
        name: `김담당${i + 1}`,
        phone: `010-1234-${String(5678 + i).padStart(4, '0')}`,
        email: `contact${i + 1}@school.kr`,
      },
      signatures: i < 5 ? {
        school: {
          signedByUserId: `school-${i + 1}`,
          signedByUserName: `담당자${i + 1}`,
          signedAt: createdAt,
          signatureImageUrl: '/api/placeholder/200/80',
        },
        session1MainInstructor: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: createdAt,
          signatureImageUrl: '/api/placeholder/200/80',
        },
      } : {},
      sessions: [
        {
          sessionNumber: 1,
          date: course.startDate,
          startTime: course.timeRange.split('~')[0] || '09:00',
          endTime: course.timeRange.split('~')[1] || '12:00',
          sessions: 4,
          mainInstructor: '홍길동',
          assistantInstructor: '이보조',
          institutionContacts: [`김담당${i + 1}`],
          studentCount: 20 + (i % 10),
          attendanceCount: 18 + (i % 8),
        },
        ...(i % 2 === 0 ? [{
          sessionNumber: 2,
          date: course.endDate,
          startTime: course.timeRange.split('~')[0] || '09:00',
          endTime: course.timeRange.split('~')[1] || '12:00',
          sessions: 4,
          mainInstructor: '홍길동',
          assistantInstructor: '이보조',
          institutionContacts: [`김담당${i + 1}`],
          studentCount: 20 + (i % 10),
          attendanceCount: 19 + (i % 8),
        }] : []),
      ],
      students: Array.from({ length: 5 + (i % 5) }, (_, j) => ({
        id: `student-${i}-${j + 1}`,
        number: j + 1,
        name: `학생${j + 1}`,
        gender: j % 2 === 0 ? '남' as const : '여' as const,
        sessionAttendances: [4, 4],
        completionStatus: j < 3 ? 'O' as const : 'X' as const,
      })),
      status,
      ...(status !== 'DRAFT' ? {
        submittedAt: createdAt,
        submittedBy: '홍길동',
      } : {}),
      ...(status === 'APPROVED' ? {
        approvedAt: new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: '관리자',
      } : {}),
      ...(status === 'REJECTED' ? {
        rejectedAt: new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        rejectedBy: '관리자',
        rejectReason: '서명이 누락되었습니다.',
      } : {}),
      createdAt,
      updatedAt: createdAt,
    }
    
    exampleDocs.push(doc)
  }

  // Save example documents
  const results = exampleDocs.map(doc => upsertAttendanceDoc(doc))

  const failedResults = results.filter(result => !result.success)
  if (failedResults.length > 0) {
    console.error('Failed to save some example documents:', failedResults)
  } else {
    console.log(`Example attendance documents initialized (${exampleDocs.length} documents)`)
  }
}

