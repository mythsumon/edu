// Initialize example activity logs for testing
import { upsertActivityLog } from './storage'
import { ActivityLog } from './types'
import { instructorCourses } from '@/mock/instructorDashboardData'

export function initExampleActivityLogs() {
  if (typeof window === 'undefined') return

  // Check if example data already exists
  const existingLogs = JSON.parse(localStorage.getItem('activity_logs') || '[]')
  if (existingLogs.length >= 10) {
    console.log('Example activity logs already exist')
    return
  }

  // Generate 10 example logs based on instructorCourses
  const exampleLogs: ActivityLog[] = []

  for (let i = 0; i < Math.min(10, instructorCourses.length); i++) {
    const course = instructorCourses[i]
    const now = new Date()
    const daysAgo = i * 2
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    
    const statuses: Array<'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'> = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED']
    const status = statuses[i % 4]
    
    const log: ActivityLog = {
      id: `activity-${i + 1}`,
      logCode: `LOG-2025-${String(i + 1).padStart(3, '0')}`,
      educationType: course.educationName.split(' ')[0] || '블록코딩',
      institutionType: course.institutionName.includes('초등') ? '초등학교' : course.institutionName.includes('중') ? '중학교' : '고등학교',
      region: course.region || '서울',
      institutionName: course.institutionName,
      grade: course.classInfo.split('학년')[0] + '학년',
      class: course.classInfo.split('학년')[1] || '1반',
      startDate: course.startDate,
      endDate: course.endDate,
      totalApplicants: 20 + (i % 10),
      graduateMale: 10 + (i % 5),
      graduateFemale: 10 + (i % 5),
      sessions: [
        {
          id: `session-${i + 1}-1`,
          sessionNumber: 1,
          date: course.startDate,
          time: course.timeRange,
          activityName: course.educationName,
        },
      ],
      photos: [],
      educationId: course.id,
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
        rejectReason: '사진이 부족합니다.',
      } : {}),
      createdBy: '홍길동',
      createdAt,
    }
    
    exampleLogs.push(log)
  }

  // Save example logs
  try {
    exampleLogs.forEach(log => upsertActivityLog(log))
    console.log(`Example activity logs initialized (${exampleLogs.length} logs)`)
  } catch (error) {
    console.error('Failed to save some example logs:', error)
  }
}
