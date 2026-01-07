import { EquipmentConfirmationDoc } from './types'

const STORAGE_KEY = 'equipment_confirmation_docs'

export function getDocs(): EquipmentConfirmationDoc[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export function getDocById(id: string): EquipmentConfirmationDoc | undefined {
  const docs = getDocs()
  return docs.find(doc => doc.id === id)
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

