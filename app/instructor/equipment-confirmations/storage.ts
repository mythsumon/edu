import { EquipmentConfirmationDoc } from './types'

const STORAGE_KEY = 'equipment_confirmation_docs'

function getDummyEquipmentDocs(): EquipmentConfirmationDoc[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'equipment-1',
      materialName: '생성형 AI / 챗봇',
      organizationName: '평성중학교',
      lectureDateText: '24. 01. 15.',
      sessionsText: '4차시 / 4차시',
      studentCount: 30,
      instructorsText: '홍길동 / 김철수',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '1월 15일 08시',
        plannedReturnText: '1월 19일 18시'
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
        equipmentManager: {
          signedByUserId: 'manager-1',
          signedByUserName: '김관리',
          signedAt: weekAgo,
          signatureImageUrl: '/mock/signatures/kim.png'
        }
      },
      attachments: [],
      educationId: 'edu-001',
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
      materialName: '메타버스 교육',
      organizationName: '서초고등학교',
      lectureDateText: '24. 01. 20.',
      sessionsText: '6차시 / 6차시',
      studentCount: 30,
      instructorsText: '홍길동 / 이영희',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: '1월 20일 12시',
        plannedReturnText: '1월 26일 18시'
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
      educationId: 'edu-002',
      status: 'SUBMITTED',
      submittedAt: yesterday,
      submittedBy: '홍길동',
      createdAt: yesterday,
      updatedAt: yesterday
    },
    {
      id: 'equipment-3',
      materialName: '코딩 교육',
      organizationName: '부산중학교',
      lectureDateText: '24. 01. 10.',
      sessionsText: '8차시 / 8차시',
      studentCount: 30,
      instructorsText: '김철수 / 박영희',
      borrowerName: '김철수',
      plannedReturnerName: '김철수',
      schedule: {
        plannedBorrowText: '1월 10일 09시',
        plannedReturnText: '1월 18일 17시'
      },
      items: [
        { id: 'item-8', name: '라즈베리파이', quantity: 30 },
        { id: 'item-9', name: 'Arduino', quantity: 20 },
        { id: 'item-10', name: '센서 키트', quantity: 10 }
      ],
      returnConditionOk: 'N',
      allowanceTarget: 'N',
      createdByName: '김철수',
      equipmentManagerName: '',
      actualReturnerName: '',
      signatures: {},
      attachments: [],
      educationId: 'edu-003',
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
    return JSON.parse(stored)
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

