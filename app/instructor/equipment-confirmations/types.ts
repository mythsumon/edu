export type EquipmentConfirmationStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'BORROWED' | 'RETURNED' | 'REJECTED'

export interface EquipmentItem {
  id: string
  name: string
  quantity: number
}

export interface EquipmentSchedule {
  plannedBorrowDate?: string // ISO date string for date calculation
  plannedBorrowTime?: string // "13:00"
  plannedReturnDate?: string // ISO date string
  plannedReturnTime?: string // "17:00"
  plannedBorrowText: string // "1일 13시" (display format)
  plannedReturnText: string // "2일 00분" (display format)
  actualBorrowAt?: string // ISO date string
  actualReturnAt?: string // ISO date string
}

export interface EquipmentSignatures {
  manager?: {
    signedByUserId: string
    signedByUserName: string
    signedAt: string
    signatureImageUrl: string
  }
  borrower?: {
    signedByUserId: string
    signedByUserName: string
    signedAt: string
    signatureImageUrl: string
  }
  returner?: {
    signedByUserId: string
    signedByUserName: string
    signedAt: string
    signatureImageUrl: string
  }
}

export interface EquipmentConfirmationDoc {
  id: string
  materialName: string
  organizationName: string
  lectureDateText: string
  sessionsText: string
  studentCount: number
  instructorsText: string
  borrowerName: string
  plannedReturnerName: string
  schedule: EquipmentSchedule
  items: EquipmentItem[]
  returnConditionOk: 'Y' | 'N'
  allowanceTarget: 'Y' | 'N'
  createdByName: string
  equipmentManagerName: string
  actualReturnerName: string
  signatures: EquipmentSignatures
  attachments: string[] // image URLs
  status: EquipmentConfirmationStatus
  rejectReason?: string
  rejectedAt?: string
  rejectedBy?: string
  submittedAt?: string
  submittedBy?: string
  approvedAt?: string
  approvedBy?: string
  educationId?: string // Link to education program
  createdAt: string
  updatedAt: string
}

export interface InventoryItem {
  id: string
  name: string
  totalQty: number
  brokenQty: number
  rentedQty: number // derived from BORROWED docs
  availableQty: number // totalQty - brokenQty - rentedQty
}

export interface AuditLogEntry {
  id: string
  docId: string
  action: 'approved' | 'rejected' | 'borrowed' | 'returned'
  actorId: string
  actorName: string
  timestamp: string
  reason?: string // for rejected
}

