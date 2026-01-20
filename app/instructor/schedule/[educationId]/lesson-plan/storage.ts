import { LessonPlanDoc } from './types'

const STORAGE_KEY = 'lesson_plan_docs'

function getDummyLessonPlans(): LessonPlanDoc[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'lp-1',
      educationId: '1',
      status: 'SUBMITTED',
      educationName: '블록코딩 기초 프로그램',
      institutionName: '서울초등학교',
      className: '5학년 3반',
      regionCity: '서울',
      startDate: '2025-02-01',
      endDate: '2025-02-28',
      totalSessions: 8,
      expectedStudents: 22,
      educationType: '센터교육',
      institutionType: '일반학교',
      targetLevel: '초등',
      learningTech: '엔트리',
      textbook: '컴퓨터',
      담당자명: '김선생',
      담당자연락처: '010-1234-5678',
      goals: [
        '블록코딩의 기본 개념을 이해한다',
        '엔트리를 활용한 간단한 프로그램을 작성할 수 있다',
        '논리적 사고력을 향상시킨다',
      ],
      sessions: [
        {
          sessionNo: 1,
          date: '2025-02-01',
          topic: '블록코딩이란?',
          content: '블록코딩의 개념과 엔트리 소개',
          materials: '노트북, 엔트리 프로그램',
        },
        {
          sessionNo: 2,
          date: '2025-02-04',
          topic: '기본 블록 사용하기',
          content: '움직이기, 말하기 블록 사용',
          materials: '노트북, 엔트리 프로그램',
        },
      ],
      authorInstructorId: 'instructor-1',
      authorInstructorName: '홍길동',
      submittedAt: weekAgo,
      submittedBy: '홍길동',
      createdAt: weekAgo,
      updatedAt: weekAgo,
    },
    {
      id: 'lp-2',
      educationId: '2',
      status: 'DRAFT',
      educationName: 'AI 체험 워크숍',
      institutionName: '경기중학교',
      className: '2학년 1반',
      regionCity: '수원',
      startDate: '2025-03-01',
      endDate: '2025-03-15',
      totalSessions: 6,
      expectedStudents: 30,
      educationType: '방문교육',
      institutionType: '일반학교',
      targetLevel: '중등',
      learningTech: '파이썬',
      textbook: 'AI 기초',
      담당자명: '이선생',
      담당자연락처: '010-2345-6789',
      goals: [
        'AI의 기본 개념을 이해한다',
        '간단한 AI 모델을 체험해본다',
      ],
      sessions: [
        {
          sessionNo: 1,
          date: '2025-03-01',
          topic: 'AI란 무엇인가?',
          content: 'AI의 개념과 활용 사례',
          materials: '노트북',
        },
      ],
      authorInstructorId: 'instructor-1',
      authorInstructorName: '홍길동',
      createdAt: yesterday,
      updatedAt: yesterday,
    },
  ]
}

export function getLessonPlans(): LessonPlanDoc[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }

    // Initialize with dummy data if empty
    const dummy = getDummyLessonPlans()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy))
    return dummy
  } catch (error) {
    console.error('Failed to load lesson plans:', error)
    return []
  }
}

export function getLessonPlanById(id: string): LessonPlanDoc | undefined {
  const plans = getLessonPlans()
  return plans.find(plan => plan.id === id)
}

export function getLessonPlanByEducationId(educationId: string): LessonPlanDoc | undefined {
  const plans = getLessonPlans()
  return plans.find(plan => plan.educationId === educationId)
}

export function upsertLessonPlan(doc: LessonPlanDoc): void {
  if (typeof window === 'undefined') return

  try {
    const plans = getLessonPlans()
    const index = plans.findIndex(p => p.id === doc.id)

    if (index >= 0) {
      plans[index] = { ...doc, updatedAt: new Date().toISOString() }
    } else {
      plans.push({
        ...doc,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(plans))

    // Trigger custom event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('lessonPlanUpdated', {
          detail: { educationId: doc.educationId, docId: doc.id, status: doc.status },
        })
      )
    }
  } catch (error) {
    console.error('Failed to save lesson plan:', error)
    throw error
  }
}

export function deleteLessonPlan(id: string): void {
  if (typeof window === 'undefined') return

  try {
    const plans = getLessonPlans()
    const filtered = plans.filter(plan => plan.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))

    // Trigger custom event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('lessonPlanUpdated'))
    }
  } catch (error) {
    console.error('Failed to delete lesson plan:', error)
    throw error
  }
}
