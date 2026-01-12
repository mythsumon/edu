// Activity log storage utilities
import { ActivityLog } from './types'

const STORAGE_KEY = 'activity_logs'

function getDummyActivityLogs(): ActivityLog[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'activity-1',
      logCode: 'LOG-2024-001',
      educationType: '생성형 AI / 챗봇',
      institutionType: '중학교',
      region: '서울',
      institutionName: '평성중학교',
      grade: '3학년',
      class: '1반',
      startDate: '2024-01-15',
      endDate: '2024-01-18',
      totalApplicants: 30,
      graduateMale: 15,
      graduateFemale: 15,
      sessions: [
        {
          id: 'session-1',
          sessionNumber: 1,
          date: '2024-01-15',
          time: '09:00-12:00',
          activityName: 'AI 기본 개념 교육'
        },
        {
          id: 'session-2',
          sessionNumber: 2,
          date: '2024-01-16',
          time: '09:00-12:00',
          activityName: '챗봇 실습'
        },
        {
          id: 'session-3',
          sessionNumber: 3,
          date: '2024-01-17',
          time: '09:00-12:00',
          activityName: '프로젝트 발표'
        },
        {
          id: 'session-4',
          sessionNumber: 4,
          date: '2024-01-18',
          time: '09:00-12:00',
          activityName: '피드백 및 마무리'
        }
      ],
      photos: [],
      educationId: 'edu-001',
      status: 'APPROVED',
      submittedAt: weekAgo,
      submittedBy: '홍길동',
      approvedAt: weekAgo,
      approvedBy: '관리자',
      createdAt: weekAgo
    },
    {
      id: 'activity-2',
      logCode: 'LOG-2024-002',
      educationType: '메타버스',
      institutionType: '고등학교',
      region: '서울',
      institutionName: '서초고등학교',
      grade: '2학년',
      class: '3반',
      startDate: '2024-01-20',
      endDate: '2024-01-25',
      totalApplicants: 30,
      graduateMale: 12,
      graduateFemale: 18,
      sessions: [
        {
          id: 'session-5',
          sessionNumber: 1,
          date: '2024-01-20',
          time: '13:00-17:00',
          activityName: '메타버스 소개'
        },
        {
          id: 'session-6',
          sessionNumber: 2,
          date: '2024-01-21',
          time: '13:00-17:00',
          activityName: '가상현실 체험'
        }
      ],
      photos: [],
      educationId: 'edu-002',
      status: 'SUBMITTED',
      submittedAt: yesterday,
      submittedBy: '홍길동',
      createdAt: yesterday
    },
    {
      id: 'activity-3',
      logCode: 'LOG-2024-003',
      educationType: '코딩',
      institutionType: '중학교',
      region: '부산',
      institutionName: '부산중학교',
      grade: '1학년',
      class: '2반',
      startDate: '2024-01-10',
      endDate: '2024-01-17',
      totalApplicants: 30,
      graduateMale: 14,
      graduateFemale: 16,
      sessions: [
        {
          id: 'session-7',
          sessionNumber: 1,
          date: '2024-01-10',
          time: '10:00-12:00',
          activityName: '코딩 기초'
        }
      ],
      photos: [],
      educationId: 'edu-003',
      status: 'DRAFT',
      createdBy: '김철수',
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
    return JSON.parse(stored)
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


