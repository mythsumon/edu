import { EquipmentConfirmationDoc } from './types'

const STORAGE_KEY = 'equipment_confirmation_docs'

function getDummyEquipmentDocs(): EquipmentConfirmationDoc[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'equipment-1',
      materialName: '블록코딩 기초 프로그램',
      organizationName: '서울초등학교',
      lectureDateText: '25. 03. 01.',
      sessionsText: '4차시 / 4차시',
      studentCount: 30,
      instructorsText: '홍길동 / 김철수',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '3월 1일 08시',
        plannedReturnText: '6월 30일 18시'
      },
      items: [
        { id: 'item-1', name: '노트북', quantity: 30 },
        { id: 'item-2', name: '프로젝터', quantity: 1 },
        { id: 'item-3', name: '마이크', quantity: 2 },
        { id: 'item-4', name: '스피커', quantity: 2 }
      ],
      returnConditionOk: 'Y',
      allowanceTarget: 'Y',
      createdByName: '홍길동',
      equipmentManagerName: '김관리',
      actualReturnerName: '홍길동',
      signatures: {
        borrower: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: weekAgo,
          signatureImageUrl: '/mock/signatures/hong.png'
        },
        manager: {
          signedByUserId: 'manager-1',
          signedByUserName: '김관리',
          signedAt: weekAgo,
          signatureImageUrl: '/mock/signatures/kim.png'
        }
      },
      attachments: [],
      educationId: '1',
      status: 'APPROVED',
      submittedAt: weekAgo,
      submittedBy: '홍길동',
      approvedAt: weekAgo,
      approvedBy: '관리자',
      createdAt: weekAgo,
      updatedAt: weekAgo
    },
    {
      id: 'equipment-2',
      materialName: 'AI 체험 워크숍',
      organizationName: '경기중학교',
      lectureDateText: '25. 03. 15.',
      sessionsText: '6차시 / 6차시',
      studentCount: 30,
      instructorsText: '홍길동 / 이영희',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '3월 15일 12시',
        plannedReturnText: '5월 30일 18시'
      },
      items: [
        { id: 'item-5', name: 'VR 헤드셋', quantity: 15 },
        { id: 'item-6', name: '모션 캡처 장비', quantity: 1 },
        { id: 'item-7', name: '3D 프린터', quantity: 2 }
      ],
      returnConditionOk: 'N',
      allowanceTarget: 'N',
      createdByName: '홍길동',
      equipmentManagerName: '',
      actualReturnerName: '',
      signatures: {
        borrower: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: yesterday,
          signatureImageUrl: '/mock/signatures/hong.png'
        }
      },
      attachments: [],
      educationId: '2',
      status: 'DRAFT',
      createdAt: yesterday,
      updatedAt: yesterday
    },
    {
      id: 'equipment-3',
      materialName: '로봇 공학 입문',
      organizationName: '인천고등학교',
      lectureDateText: '25. 04. 01.',
      sessionsText: '8차시 / 8차시',
      studentCount: 30,
      instructorsText: '홍길동 / 박영희',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '4월 1일 09시',
        plannedReturnText: '7월 31일 17시'
      },
      items: [
        { id: 'item-8', name: '로봇 키트', quantity: 30 },
        { id: 'item-9', name: '센서 모듈', quantity: 20 },
        { id: 'item-10', name: '배터리', quantity: 10 }
      ],
      returnConditionOk: 'N',
      allowanceTarget: 'N',
      createdByName: '홍길동',
      equipmentManagerName: '',
      actualReturnerName: '',
      signatures: {},
      attachments: [],
      educationId: '3',
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'equipment-4',
      materialName: '창의적 문제 해결 프로그램',
      organizationName: '부산초등학교',
      lectureDateText: '25. 03. 20.',
      sessionsText: '4차시 / 4차시',
      studentCount: 30,
      instructorsText: '홍길동 / 박영희',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '3월 20일 12시',
        plannedReturnText: '6월 20일 18시'
      },
      items: [
        { id: 'item-11', name: '교육 키트', quantity: 30 },
        { id: 'item-12', name: '프로젝터', quantity: 1 }
      ],
      returnConditionOk: 'N',
      allowanceTarget: 'N',
      createdByName: '홍길동',
      equipmentManagerName: '',
      actualReturnerName: '',
      signatures: {},
      attachments: [],
      educationId: '4',
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'equipment-5',
      materialName: '디지털 리터러시 기초',
      organizationName: '대구중학교',
      lectureDateText: '25. 04. 05.',
      sessionsText: '4차시 / 4차시',
      studentCount: 30,
      instructorsText: '홍길동 / 이영희',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '4월 5일 09시',
        plannedReturnText: '7월 5일 17시'
      },
      items: [
        { id: 'item-13', name: '태블릿', quantity: 30 },
        { id: 'item-14', name: '스타일러스', quantity: 30 }
      ],
      returnConditionOk: 'N',
      allowanceTarget: 'N',
      createdByName: '홍길동',
      equipmentManagerName: '',
      actualReturnerName: '',
      signatures: {},
      attachments: [],
      educationId: '5',
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'equipment-6',
      materialName: '미디어 아트 창작',
      organizationName: '광주고등학교',
      lectureDateText: '25. 03. 10.',
      sessionsText: '4차시 / 4차시',
      studentCount: 30,
      instructorsText: '홍길동 / 이영희',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '3월 10일 14시',
        plannedReturnText: '6월 10일 18시'
      },
      items: [
        { id: 'item-15', name: '그래픽 태블릿', quantity: 15 },
        { id: 'item-16', name: '디지털 카메라', quantity: 5 }
      ],
      returnConditionOk: 'Y',
      allowanceTarget: 'Y',
      createdByName: '홍길동',
      equipmentManagerName: '김관리',
      actualReturnerName: '홍길동',
      signatures: {
        borrower: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: weekAgo,
          signatureImageUrl: '/mock/signatures/hong.png'
        }
      },
      attachments: [],
      educationId: '6',
      status: 'SUBMITTED',
      submittedAt: yesterday,
      submittedBy: '홍길동',
      createdAt: yesterday,
      updatedAt: yesterday
    },
    {
      id: 'equipment-7',
      materialName: '게임 디자인과 프로그래밍',
      organizationName: '울산초등학교',
      lectureDateText: '25. 04. 15.',
      sessionsText: '4차시 / 4차시',
      studentCount: 30,
      instructorsText: '홍길동 / 박영희',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '4월 15일 10시',
        plannedReturnText: '7월 15일 18시'
      },
      items: [
        { id: 'item-17', name: '게임 개발 키트', quantity: 30 }
      ],
      returnConditionOk: 'N',
      allowanceTarget: 'N',
      createdByName: '홍길동',
      equipmentManagerName: '',
      actualReturnerName: '',
      signatures: {},
      attachments: [],
      educationId: '7',
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now
    },
    {
      id: 'equipment-8',
      materialName: '웹 개발 기초',
      organizationName: '수원초등학교',
      lectureDateText: '25. 02. 01.',
      sessionsText: '4차시 / 4차시',
      studentCount: 30,
      instructorsText: '홍길동 / 김철수',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '2월 1일 09시',
        plannedReturnText: '2월 28일 18시'
      },
      items: [
        { id: 'item-18', name: '노트북', quantity: 30 },
        { id: 'item-19', name: '프로젝터', quantity: 1 }
      ],
      returnConditionOk: 'Y',
      allowanceTarget: 'Y',
      createdByName: '홍길동',
      equipmentManagerName: '김관리',
      actualReturnerName: '홍길동',
      signatures: {
        borrower: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: twoWeeksAgo,
          signatureImageUrl: '/mock/signatures/hong.png'
        },
        manager: {
          signedByUserId: 'manager-1',
          signedByUserName: '김관리',
          signedAt: twoWeeksAgo,
          signatureImageUrl: '/mock/signatures/kim.png'
        }
      },
      attachments: [],
      educationId: '8',
      status: 'APPROVED',
      submittedAt: twoWeeksAgo,
      submittedBy: '홍길동',
      approvedAt: twoWeeksAgo,
      approvedBy: '관리자',
      createdAt: twoWeeksAgo,
      updatedAt: twoWeeksAgo
    },
    {
      id: 'equipment-9',
      materialName: '모바일 앱 만들기',
      organizationName: '대전중학교',
      lectureDateText: '25. 01. 15.',
      sessionsText: '4차시 / 4차시',
      studentCount: 30,
      instructorsText: '홍길동 / 박영희',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '1월 15일 13시',
        plannedReturnText: '2월 15일 18시'
      },
      items: [
        { id: 'item-20', name: '스마트폰', quantity: 30 },
        { id: 'item-21', name: '개발 키트', quantity: 15 }
      ],
      returnConditionOk: 'Y',
      allowanceTarget: 'Y',
      createdByName: '홍길동',
      equipmentManagerName: '김관리',
      actualReturnerName: '홍길동',
      signatures: {
        borrower: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: twoWeeksAgo,
          signatureImageUrl: '/mock/signatures/hong.png'
        },
        manager: {
          signedByUserId: 'manager-1',
          signedByUserName: '김관리',
          signedAt: twoWeeksAgo,
          signatureImageUrl: '/mock/signatures/kim.png'
        }
      },
      attachments: [],
      educationId: '9',
      status: 'APPROVED',
      submittedAt: twoWeeksAgo,
      submittedBy: '홍길동',
      approvedAt: twoWeeksAgo,
      approvedBy: '관리자',
      createdAt: twoWeeksAgo,
      updatedAt: twoWeeksAgo
    },
    {
      id: 'equipment-10',
      materialName: '3D 프린팅 기초',
      organizationName: '세종고등학교',
      lectureDateText: '25. 03. 25.',
      sessionsText: '4차시 / 4차시',
      studentCount: 30,
      instructorsText: '홍길동 / 이영희',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '3월 25일 08시',
        plannedReturnText: '6월 25일 18시'
      },
      items: [
        { id: 'item-22', name: '3D 프린터', quantity: 5 },
        { id: 'item-23', name: '필라멘트', quantity: 20 }
      ],
      returnConditionOk: 'N',
      allowanceTarget: 'N',
      createdByName: '홍길동',
      equipmentManagerName: '',
      actualReturnerName: '',
      signatures: {},
      attachments: [],
      educationId: '10',
      status: 'DRAFT',
      createdAt: now,
      updatedAt: now
    }
  ]
}

export function getDocs(): EquipmentConfirmationDoc[] {
  if (typeof window === 'undefined') return getDummyEquipmentDocs()

  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    // Initialize with dummy data if no stored data exists
    const dummyData = getDummyEquipmentDocs()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyData))
    return dummyData
  }
  try {
    const parsed = JSON.parse(stored)
    // Check if data has old format (edu-001, etc.) and reset if needed
    const hasOldFormat = Array.isArray(parsed) && parsed.some((doc: any) => doc.educationId?.startsWith('edu-'))
    if (hasOldFormat && process.env.NODE_ENV === 'development') {
      // Reset to new dummy data format
      const dummyData = getDummyEquipmentDocs()
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyData))
      return dummyData
    }
    return parsed
  } catch {
    return getDummyEquipmentDocs()
  }
}

export function getDocById(id: string): EquipmentConfirmationDoc | undefined {
  const docs = getDocs()
  return docs.find(doc => doc.id === id)
}

export function getDocByEducationId(educationId: string): EquipmentConfirmationDoc | undefined {
  const docs = getDocs()
  return docs.find(doc => doc.educationId === educationId || doc.id === educationId)
}

export function upsertDoc(doc: EquipmentConfirmationDoc): void {
  const docs = getDocs()
  const index = docs.findIndex(d => d.id === doc.id)
  const updatedDoc = {
    ...doc,
    updatedAt: new Date().toISOString(),
  }
  if (index >= 0) {
    docs[index] = updatedDoc
  } else {
    docs.push(updatedDoc)
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
  // Dispatch custom event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('equipmentUpdated'))
  }
}

export function createDocFromDefault(partialOverrides: Partial<EquipmentConfirmationDoc> = {}): EquipmentConfirmationDoc {
  const now = new Date().toISOString()
  const defaultDoc: EquipmentConfirmationDoc = {
    id: `eq-${Date.now()}`,
    materialName: '생성형 AI / 챗봇',
    organizationName: '평성중학교',
    lectureDateText: '25. 01. 05.',
    sessionsText: '4차시 / 4차시',
    studentCount: 60,
    instructorsText: '하미라 / 최인정',
    borrowerName: '하미라',
    plannedReturnerName: '하미라',
    schedule: {
      plannedBorrowText: '1일 13시',
      plannedReturnText: '2일 00분',
    },
    items: [
      { id: 'item-1', name: '보드', quantity: 30 },
      { id: 'item-2', name: '젠가', quantity: 30 },
      { id: 'item-3', name: '보드2', quantity: 30 },
      { id: 'item-4', name: '집게발', quantity: 10 },
      { id: 'item-5', name: '집게발', quantity: 3 },
    ],
    returnConditionOk: 'N',
    allowanceTarget: 'N',
    createdByName: '홍길동',
    equipmentManagerName: '',
    actualReturnerName: '',
    signatures: {},
    attachments: [],
    status: 'DRAFT',
    createdAt: now,
    updatedAt: now,
  }
  return { ...defaultDoc, ...partialOverrides }
}

// Mock signature bank
export const SIGNATURE_BANK: Record<string, string> = {
  '홍길동': '/mock/signatures/hong.png',
  '하미라': '/mock/signatures/hamira.png',
  '최인정': '/mock/signatures/choi.png',
}

export function getSignatureUrl(name: string): string | undefined {
  return SIGNATURE_BANK[name]
}

