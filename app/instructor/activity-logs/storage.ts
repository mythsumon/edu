// Activity log storage utilities
import { ActivityLog } from './types'

const STORAGE_KEY = 'activity_logs'

function getDummyActivityLogs(): ActivityLog[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'activity-1',
      logCode: 'LOG-2025-001',
      educationType: '블록코딩',
      institutionType: '초등학교',
      region: '서울',
      institutionName: '서울초등학교',
      grade: '3학년',
      class: '2반',
      startDate: '2025-03-01',
      endDate: '2025-06-30',
      totalApplicants: 30,
      graduateMale: 15,
      graduateFemale: 15,
      sessions: [
        {
          id: 'session-1',
          sessionNumber: 1,
          date: '2025-03-01',
          time: '09:00-12:10',
          activityName: '블록코딩 기초'
        }
      ],
      photos: [],
      educationId: '1',
      status: 'APPROVED',
      submittedAt: weekAgo,
      submittedBy: '홍길동',
      approvedAt: weekAgo,
      approvedBy: '관리자',
      createdAt: weekAgo
    },
    {
      id: 'activity-2',
      logCode: 'LOG-2025-002',
      educationType: 'AI',
      institutionType: '중학교',
      region: '경기',
      institutionName: '경기중학교',
      grade: '2학년',
      class: '1반',
      startDate: '2025-03-15',
      endDate: '2025-05-30',
      totalApplicants: 30,
      graduateMale: 15,
      graduateFemale: 15,
      sessions: [
        {
          id: 'session-2',
          sessionNumber: 1,
          date: '2025-03-15',
          time: '14:00-16:00',
          activityName: 'AI 체험'
        }
      ],
      photos: [],
      educationId: '2',
      status: 'SUBMITTED',
      submittedAt: yesterday,
      submittedBy: '홍길동',
      createdAt: yesterday
    },
    {
      id: 'activity-3',
      logCode: 'LOG-2025-003',
      educationType: '로봇',
      institutionType: '고등학교',
      region: '인천',
      institutionName: '인천고등학교',
      grade: '1학년',
      class: '3반',
      startDate: '2025-04-01',
      endDate: '2025-07-31',
      totalApplicants: 30,
      graduateMale: 15,
      graduateFemale: 15,
      sessions: [],
      photos: [],
      educationId: '3',
      status: 'DRAFT',
      createdBy: '홍길동',
      createdAt: now
    },
    {
      id: 'activity-4',
      logCode: 'LOG-2025-004',
      educationType: '창의적 문제 해결',
      institutionType: '초등학교',
      region: '부산',
      institutionName: '부산초등학교',
      grade: '4학년',
      class: '1반',
      startDate: '2025-03-20',
      endDate: '2025-06-20',
      totalApplicants: 30,
      graduateMale: 16,
      graduateFemale: 14,
      sessions: [
        {
          id: 'session-3',
          sessionNumber: 1,
          date: '2025-03-20',
          time: '13:00-15:00',
          activityName: '문제 해결 기초'
        }
      ],
      photos: [],
      educationId: '4',
      status: 'SUBMITTED',
      submittedAt: yesterday,
      submittedBy: '홍길동',
      createdAt: yesterday
    },
    {
      id: 'activity-5',
      logCode: 'LOG-2025-005',
      educationType: '디지털 리터러시',
      institutionType: '중학교',
      region: '대구',
      institutionName: '대구중학교',
      grade: '1학년',
      class: '2반',
      startDate: '2025-04-05',
      endDate: '2025-07-05',
      totalApplicants: 30,
      graduateMale: 15,
      graduateFemale: 15,
      sessions: [],
      photos: [],
      educationId: '5',
      status: 'DRAFT',
      createdBy: '홍길동',
      createdAt: now
    },
    {
      id: 'activity-6',
      logCode: 'LOG-2025-006',
      educationType: '미디어 아트',
      institutionType: '고등학교',
      region: '광주',
      institutionName: '광주고등학교',
      grade: '2학년',
      class: '3반',
      startDate: '2025-03-10',
      endDate: '2025-06-10',
      totalApplicants: 30,
      graduateMale: 14,
      graduateFemale: 16,
      sessions: [
        {
          id: 'session-4',
          sessionNumber: 1,
          date: '2025-03-10',
          time: '15:00-17:00',
          activityName: '미디어 아트 기초'
        }
      ],
      photos: [],
      educationId: '6',
      status: 'APPROVED',
      submittedAt: weekAgo,
      submittedBy: '홍길동',
      approvedAt: weekAgo,
      approvedBy: '관리자',
      createdAt: weekAgo
    },
    {
      id: 'activity-7',
      logCode: 'LOG-2025-007',
      educationType: '게임 디자인',
      institutionType: '초등학교',
      region: '울산',
      institutionName: '울산초등학교',
      grade: '5학년',
      class: '1반',
      startDate: '2025-04-15',
      endDate: '2025-07-15',
      totalApplicants: 30,
      graduateMale: 15,
      graduateFemale: 15,
      sessions: [],
      photos: [],
      educationId: '7',
      status: 'DRAFT',
      createdBy: '홍길동',
      createdAt: now
    },
    {
      id: 'activity-8',
      logCode: 'LOG-2025-008',
      educationType: '웹 개발',
      institutionType: '초등학교',
      region: '수원',
      institutionName: '수원초등학교',
      grade: '6학년',
      class: '2반',
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      totalApplicants: 30,
      graduateMale: 16,
      graduateFemale: 14,
      sessions: [
        {
          id: 'session-5',
          sessionNumber: 1,
          date: '2025-02-01',
          time: '10:00-12:00',
          activityName: '웹 개발 기초'
        }
      ],
      photos: [],
      educationId: '8',
      status: 'APPROVED',
      submittedAt: twoWeeksAgo,
      submittedBy: '홍길동',
      approvedAt: twoWeeksAgo,
      approvedBy: '관리자',
      createdAt: twoWeeksAgo
    },
    {
      id: 'activity-9',
      logCode: 'LOG-2025-009',
      educationType: '모바일 앱',
      institutionType: '중학교',
      region: '대전',
      institutionName: '대전중학교',
      grade: '3학년',
      class: '3반',
      startDate: '2025-01-15',
      endDate: '2025-02-15',
      totalApplicants: 30,
      graduateMale: 15,
      graduateFemale: 15,
      sessions: [
        {
          id: 'session-6',
          sessionNumber: 1,
          date: '2025-01-15',
          time: '14:00-16:00',
          activityName: '모바일 앱 기초'
        }
      ],
      photos: [],
      educationId: '9',
      status: 'APPROVED',
      submittedAt: twoWeeksAgo,
      submittedBy: '홍길동',
      approvedAt: twoWeeksAgo,
      approvedBy: '관리자',
      createdAt: twoWeeksAgo
    },
    {
      id: 'activity-10',
      logCode: 'LOG-2025-010',
      educationType: '3D 프린팅',
      institutionType: '고등학교',
      region: '세종',
      institutionName: '세종고등학교',
      grade: '1학년',
      class: '1반',
      startDate: '2025-03-25',
      endDate: '2025-06-25',
      totalApplicants: 30,
      graduateMale: 15,
      graduateFemale: 15,
      sessions: [],
      photos: [],
      educationId: '10',
      status: 'DRAFT',
      createdBy: '홍길동',
      createdAt: now
    }
  ]
}

export function getActivityLogs(): ActivityLog[] {
  if (typeof window === 'undefined') return getDummyActivityLogs()

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    // Initialize with dummy data if no stored data exists
    const dummyData = getDummyActivityLogs()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyData))
    return dummyData
  }
  try {
    const parsed = JSON.parse(stored)
    // Check if data has old format (edu-001, etc.) and reset if needed
    const hasOldFormat = Array.isArray(parsed) && parsed.some((log: any) => log.educationId?.startsWith('edu-'))
    if (hasOldFormat && process.env.NODE_ENV === 'development') {
      // Reset to new dummy data format
      const dummyData = getDummyActivityLogs()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyData))
      return dummyData
    }
    return parsed
  } catch {
    return getDummyActivityLogs()
  }
}

export function getActivityLogById(id: string): ActivityLog | undefined {
  const logs = getActivityLogs()
  return logs.find(log => log.id === id)
}

export function getActivityLogByEducationId(educationId: string): ActivityLog | undefined {
  const logs = getActivityLogs()
  return logs.find(log => log.educationId === educationId)
}

export function upsertActivityLog(log: ActivityLog): void {
  const logs = getActivityLogs()
  const index = logs.findIndex(l => l.id === log.id)
  if (index >= 0) {
    logs[index] = log
  } else {
    logs.push(log)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs))
  // Dispatch custom event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('activityUpdated'))
  }
}

export function deleteActivityLog(id: string): void {
  const logs = getActivityLogs()
  const filtered = logs.filter(l => l.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}


