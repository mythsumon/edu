/**
 * 교구 확인서 v2 - 종이 양식과 정확히 일치하는 데이터 구조
 */

export type EquipmentConfirmationStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED'

export interface EquipmentConfirmation {
  id: string // e.g. "EQ-2025-001"
  educationId: string // education reference
  status: EquipmentConfirmationStatus

  // ===== 기본 정보(상단) =====
  assignmentNo?: string // 배정번호 (optional, can be blank)
  curriculumName: string // 교육과정명 (예: "8차시 블록코딩 엔트리 기초 및 인공지능 AI")
  institutionName: string // 강의기관 (예: "성남하원초등학교")
  lectureDateRange: {
    start: string // YYYY-MM-DD
    end: string // YYYY-MM-DD
  }
  담당차시_총차시: {
    담당차시: number // 2
    총차시: number // 8
  }
  담당참여강사: string // 박성희
  expectedParticipants: number // 예상 참여 인원 7명

  // 대여 정보
  borrowPlan: {
    borrowerName: string // 교구대여자 이름(텍스트)
    borrowerSignature?: {
      signedByUserId: string
      signedByUserName: string
      signedAt: string
      signatureImageUrl: string
    }
    borrowDate: string // YYYY-MM-DD (예: 2025-11-24)
    borrowTime: string // HH:mm (예: 21:00)
  }

  // 반납 예정
  returnPlan: {
    plannedReturnerName: string // 반납예정자
    plannedReturnDate: string // YYYY-MM-DD (예: 2025-12-02)
    plannedReturnTime: string // HH:mm (예: 21:00)
  }

  // ===== 대여 교구 목록(표) =====
  items: Array<{
    id: string // unique id for each row
    leftItemName?: string // 품명(왼쪽)
    leftQty?: number // 수량(왼쪽)
    rightItemName?: string // 품명(오른쪽)
    rightQty?: number // 수량(오른쪽)
  }>

  notes?: string // 공유사항/특이사항

  // ===== 교구 반납 확인(하단) =====
  returnConfirm: {
    returnerName: string // 교구 반납자
    returnerSignature?: {
      signedByUserId: string
      signedByUserName: string
      signedAt: string
      signatureImageUrl: string
    }
    returnDate: string // YYYY-MM-DD
    returnTime: string // HH:mm
    conditionNote?: string // 반납 교구 상태 확인(텍스트)
    allowanceEligible: 'Y' | 'N' // 교구반납 수당 지급 대상 여부 (N/Y)
    adminManagerName?: string // 사업담당자(이름)
    adminManagerSignature?: {
      signedByUserId: string
      signedByUserName: string
      signedAt: string
      signatureImageUrl: string
    }
  }

  // audit for frontend
  updatedAt: string
  createdAt: string
  
  // status management
  rejectReason?: string
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  submittedAt?: string
  submittedBy?: string
}

/**
 * Mock data based on paper form
 */
export function createMockEquipmentConfirmation(): EquipmentConfirmation {
  const now = new Date().toISOString()
  return {
    id: `EQ-2025-001`,
    educationId: 'EDU-001',
    status: 'DRAFT',
    assignmentNo: '',
    curriculumName: '8차시 블록코딩 엔트리 기초 및 인공지능 AI',
    institutionName: '성남하원초등학교',
    lectureDateRange: {
      start: '2025-11-11',
      end: '2025-12-02',
    },
    담당차시_총차시: {
      담당차시: 2,
      총차시: 8,
    },
    담당참여강사: '박성희',
    expectedParticipants: 7,
    borrowPlan: {
      borrowerName: '',
      borrowDate: '2025-11-24',
      borrowTime: '21:00',
    },
    returnPlan: {
      plannedReturnerName: '박성희',
      plannedReturnDate: '2025-12-02',
      plannedReturnTime: '21:00',
    },
    items: [
      { id: 'item-1', leftItemName: '엔트리', leftQty: 7 },
      { id: 'item-2' },
      { id: 'item-3' },
      { id: 'item-4' },
      { id: 'item-5' },
    ],
    notes: '',
    returnConfirm: {
      returnerName: '',
      returnDate: '',
      returnTime: '',
      conditionNote: '',
      allowanceEligible: 'N',
      adminManagerName: '',
    },
    updatedAt: now,
    createdAt: now,
  }
}
