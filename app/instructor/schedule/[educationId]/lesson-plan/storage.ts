import { LessonPlanDoc } from './types'

const STORAGE_KEY = 'lesson_plan_docs'

function getDummyLessonPlans(): LessonPlanDoc[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'lp-1',
      educationId: 'EDU-2025-001',
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
        {
          sessionNo: 3,
          date: '2025-02-08',
          topic: '반복 블록 활용',
          content: '반복 블록을 사용한 간단한 애니메이션 만들기',
          materials: '노트북, 엔트리 프로그램',
        },
        {
          sessionNo: 4,
          date: '2025-02-11',
          topic: '조건문 이해하기',
          content: '만약 블록을 사용한 조건부 실행',
          materials: '노트북, 엔트리 프로그램',
        },
        {
          sessionNo: 5,
          date: '2025-02-15',
          topic: '변수 사용하기',
          content: '변수 개념과 활용',
          materials: '노트북, 엔트리 프로그램',
        },
        {
          sessionNo: 6,
          date: '2025-02-18',
          topic: '함수 만들기',
          content: '함수 블록을 활용한 코드 재사용',
          materials: '노트북, 엔트리 프로그램',
        },
        {
          sessionNo: 7,
          date: '2025-02-22',
          topic: '프로젝트 실습',
          content: '종합 프로젝트: 간단한 게임 만들기',
          materials: '노트북, 엔트리 프로그램',
        },
        {
          sessionNo: 8,
          date: '2025-02-25',
          topic: '프로젝트 발표 및 평가',
          content: '만든 프로젝트 발표 및 피드백',
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
      educationId: 'EDU-2025-002',
      status: 'APPROVED',
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
        '머신러닝의 기본 원리를 학습한다',
      ],
      sessions: [
        {
          sessionNo: 1,
          date: '2025-03-01',
          topic: 'AI란 무엇인가?',
          content: 'AI의 개념과 활용 사례 소개',
          materials: '노트북, AI 체험 프로그램',
        },
        {
          sessionNo: 2,
          date: '2025-03-04',
          topic: '머신러닝 기초',
          content: '머신러닝의 기본 원리 이해',
          materials: '노트북, 교육용 AI 도구',
        },
        {
          sessionNo: 3,
          date: '2025-03-08',
          topic: '이미지 인식 체험',
          content: '이미지 분류 모델 직접 체험',
          materials: '노트북, 카메라',
        },
        {
          sessionNo: 4,
          date: '2025-03-11',
          topic: '자연어 처리 체험',
          content: '챗봇 만들기 실습',
          materials: '노트북',
        },
        {
          sessionNo: 5,
          date: '2025-03-13',
          topic: 'AI 프로젝트 실습',
          content: '팀별 AI 프로젝트 진행',
          materials: '노트북, 프로젝트 자료',
        },
        {
          sessionNo: 6,
          date: '2025-03-15',
          topic: '프로젝트 발표',
          content: '프로젝트 발표 및 토론',
          materials: '노트북, 발표 자료',
        },
      ],
      authorInstructorId: 'instructor-1',
      authorInstructorName: '홍길동',
      submittedAt: yesterday,
      submittedBy: '홍길동',
      approvedAt: now,
      approvedBy: '관리자',
      createdAt: yesterday,
      updatedAt: now,
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
