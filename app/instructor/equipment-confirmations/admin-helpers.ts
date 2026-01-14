import type { EquipmentConfirmationDoc, EquipmentItem, InventoryItem, AuditLogEntry } from './types'
import { getDocs } from './storage'

const INVENTORY_KEY = 'teaching_aid_inventory'
const AUDIT_LOG_KEY = 'teaching_aid_audit_logs'

// 초기 교구 재고 예시 데이터
function getInitialInventory(): InventoryBaseItem[] {
  return [
    { id: 'inv-1', name: '노트북', totalQty: 50, brokenQty: 2 },
    { id: 'inv-2', name: '햄스터S', totalQty: 40, brokenQty: 1 },
    { id: 'inv-3', name: '엠봇2', totalQty: 40, brokenQty: 0 },
    { id: 'inv-4', name: '멀티탭', totalQty: 20, brokenQty: 1 },
    { id: 'inv-5', name: '충전허브', totalQty: 10, brokenQty: 0 },
    { id: 'inv-6', name: '프로젝터', totalQty: 5, brokenQty: 0 },
    { id: 'inv-7', name: '마이크', totalQty: 10, brokenQty: 1 },
    { id: 'inv-8', name: '스피커', totalQty: 10, brokenQty: 0 },
    { id: 'inv-9', name: 'VR 헤드셋', totalQty: 20, brokenQty: 2 },
    { id: 'inv-10', name: '로봇 키트', totalQty: 30, brokenQty: 1 },
    { id: 'inv-11', name: '태블릿', totalQty: 30, brokenQty: 1 },
    { id: 'inv-12', name: '3D 프린터', totalQty: 5, brokenQty: 0 },
    { id: 'inv-13', name: '스타일러스', totalQty: 30, brokenQty: 0 },
    { id: 'inv-14', name: '센서 모듈', totalQty: 25, brokenQty: 1 },
    { id: 'inv-15', name: '배터리', totalQty: 15, brokenQty: 0 },
    { id: 'inv-16', name: '교육 키트', totalQty: 30, brokenQty: 0 },
    { id: 'inv-17', name: '그래픽 태블릿', totalQty: 15, brokenQty: 1 },
    { id: 'inv-18', name: '디지털 카메라', totalQty: 8, brokenQty: 0 },
    { id: 'inv-19', name: '게임 개발 키트', totalQty: 30, brokenQty: 0 },
    { id: 'inv-20', name: '스마트폰', totalQty: 30, brokenQty: 1 },
    { id: 'inv-21', name: '개발 키트', totalQty: 15, brokenQty: 0 },
    { id: 'inv-22', name: '필라멘트', totalQty: 25, brokenQty: 0 },
    { id: 'inv-23', name: '모션 캡처 장비', totalQty: 2, brokenQty: 0 },
  ]
}

export function getInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(INVENTORY_KEY)
  
  // 저장된 데이터가 없으면 초기 데이터로 초기화
  if (!stored) {
    const initialData = getInitialInventory()
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialData))
    // 초기 데이터로 계산된 재고 반환
    const allDocs = getAllDocs()
    const rentedCounts: Record<string, number> = {}
    
    allDocs
      .filter(doc => doc.status === 'BORROWED')
      .forEach(doc => {
        doc.items.forEach(item => {
          rentedCounts[item.name] = (rentedCounts[item.name] || 0) + item.quantity
        })
      })
    
    return initialData.map(item => ({
      ...item,
      rentedQty: rentedCounts[item.name] || 0,
      availableQty: item.totalQty - item.brokenQty - (rentedCounts[item.name] || 0),
    }))
  }
  
  try {
    const items: InventoryItem[] = JSON.parse(stored)
    // Calculate rented quantities from BORROWED docs
    const allDocs = getAllDocs()
    const rentedCounts: Record<string, number> = {}
    
    allDocs
      .filter(doc => doc.status === 'BORROWED')
      .forEach(doc => {
        doc.items.forEach(item => {
          rentedCounts[item.name] = (rentedCounts[item.name] || 0) + item.quantity
        })
      })
    
    // Update rentedQty and availableQty
    return items.map(item => ({
      ...item,
      rentedQty: rentedCounts[item.name] || 0,
      availableQty: item.totalQty - item.brokenQty - (rentedCounts[item.name] || 0),
    }))
  } catch {
    // 파싱 오류 시 초기 데이터로 재설정
    const initialData = getInitialInventory()
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(initialData))
    return initialData.map(item => ({
      ...item,
      rentedQty: 0,
      availableQty: item.totalQty - item.brokenQty,
    }))
  }
}

interface InventoryBaseItem {
  id: string
  name: string
  totalQty: number
  brokenQty: number
}

export function saveInventory(items: InventoryItem[]): void {
  if (typeof window === 'undefined') return
  // Save without rentedQty and availableQty (they're calculated dynamically)
  const itemsToSave: InventoryBaseItem[] = items.map(({ rentedQty, availableQty, ...rest }) => rest)
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(itemsToSave))
}

export function addInventoryItem(item: Omit<InventoryItem, 'id' | 'rentedQty' | 'availableQty'>): InventoryItem {
  const newId = `inv-${Date.now()}`
  const newBaseItem: InventoryBaseItem = {
    id: newId,
    name: item.name,
    totalQty: item.totalQty,
    brokenQty: item.brokenQty,
  }
  
  // Get current base inventory (without calculated fields)
  const stored = localStorage.getItem(INVENTORY_KEY)
  const currentBase: InventoryBaseItem[] = stored ? JSON.parse(stored) : []
  currentBase.push(newBaseItem)
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(currentBase))
  
  // Return with calculated fields
  return {
    ...newBaseItem,
    rentedQty: 0,
    availableQty: item.totalQty - item.brokenQty,
  }
}

export function updateInventoryItem(id: string, updates: Partial<Omit<InventoryItem, 'id' | 'rentedQty' | 'availableQty'>>): void {
  const stored = localStorage.getItem(INVENTORY_KEY)
  if (!stored) return
  
  const currentBase: InventoryBaseItem[] = JSON.parse(stored)
  const index = currentBase.findIndex(item => item.id === id)
  if (index >= 0) {
    currentBase[index] = { ...currentBase[index], ...updates }
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(currentBase))
  }
}

export function deleteInventoryItem(id: string): void {
  const stored = localStorage.getItem(INVENTORY_KEY)
  if (!stored) return
  
  const currentBase: InventoryBaseItem[] = JSON.parse(stored)
  const filtered = currentBase.filter(item => item.id !== id)
  localStorage.setItem(INVENTORY_KEY, JSON.stringify(filtered))
}

export function getAllDocs(): EquipmentConfirmationDoc[] {
  return getDocs()
}

export function deriveInventory(
  requestedItems: EquipmentItem[],
  allDocs: EquipmentConfirmationDoc[],
  inventoryBase: InventoryItem[]
): InventoryItem[] {
  // Calculate rented quantities from BORROWED docs
  const rentedCounts: Record<string, number> = {}
  
  allDocs
    .filter(doc => doc.status === 'BORROWED')
    .forEach(doc => {
      doc.items.forEach(item => {
        rentedCounts[item.name] = (rentedCounts[item.name] || 0) + item.quantity
      })
    })

  // Merge with base inventory
  return requestedItems.map(item => {
    const base = inventoryBase.find(inv => inv.name === item.name)
    const rentedQty = rentedCounts[item.name] || 0
    
    if (base) {
      return {
        ...base,
        rentedQty,
        availableQty: base.totalQty - base.brokenQty - rentedQty,
      }
    } else {
      // If not in inventory, assume available
      return {
        id: `inv-${item.name}`,
        name: item.name,
        totalQty: 0,
        brokenQty: 0,
        rentedQty,
        availableQty: -rentedQty, // negative means shortage
      }
    }
  })
}

export function validateForApprove(
  doc: EquipmentConfirmationDoc,
  inventory: InventoryItem[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Required fields
  if (!doc.schedule.plannedBorrowText || !doc.schedule.plannedReturnText) {
    errors.push('대여/반납 일정을 입력해주세요.')
  }
  if (!doc.borrowerName) {
    errors.push('대여자 이름을 입력해주세요.')
  }
  if (!doc.items.length || doc.items.some(item => item.quantity < 1)) {
    errors.push('교구 목록을 입력해주세요.')
  }
  if (!doc.signatures.borrower) {
    errors.push('대여자 서명이 필요합니다.')
  }
  if (!doc.signatures.manager) {
    errors.push('관리자(사업담당자) 서명이 필요합니다.')
  }

  // Inventory check
  const derived = deriveInventory(doc.items, getAllDocs(), inventory)
  const shortages = derived.filter(inv => inv.availableQty < 0)
  if (shortages.length > 0) {
    shortages.forEach(shortage => {
      errors.push(`${shortage.name}: 재고 부족 (필요: ${Math.abs(shortage.availableQty)}개)`)
    })
  }

  // Check each requested item
  doc.items.forEach(item => {
    const inv = derived.find(d => d.name === item.name)
    if (!inv || inv.availableQty < item.quantity) {
      errors.push(`${item.name}: 재고 부족 (요청: ${item.quantity}개, 가용: ${inv?.availableQty || 0}개)`)
    }
  })

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function validateForReturn(doc: EquipmentConfirmationDoc): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (doc.returnConditionOk !== 'Y') {
    errors.push('반납 상태를 확인해주세요.')
  }
  if (!doc.actualReturnerName) {
    errors.push('실제 반납자 이름을 입력해주세요.')
  }
  if (!doc.signatures.returner) {
    errors.push('반납자 서명이 필요합니다.')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

export function getAuditLogs(docId: string): AuditLogEntry[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(AUDIT_LOG_KEY)
  if (!stored) return []
  try {
    const allLogs: AuditLogEntry[] = JSON.parse(stored)
    return allLogs.filter(log => log.docId === docId).sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )
  } catch {
    return []
  }
}

export function appendAuditLog(
  action: AuditLogEntry['action'],
  docId: string,
  actorId: string,
  actorName: string,
  reason?: string
): void {
  if (typeof window === 'undefined') return
  
  const stored = localStorage.getItem(AUDIT_LOG_KEY)
  const allLogs: AuditLogEntry[] = stored ? JSON.parse(stored) : []
  
  const newLog: AuditLogEntry = {
    id: `log-${Date.now()}`,
    docId,
    action,
    actorId,
    actorName,
    timestamp: new Date().toISOString(),
    reason,
  }
  
  allLogs.push(newLog)
  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(allLogs))
}

/**
 * 날짜별 교구 대여 현황 조회
 * @param targetDate 조회할 날짜 (ISO string or Date)
 * @param equipmentName 특정 교구 이름 (선택사항, 없으면 전체)
 * @returns 해당 날짜에 대여중인 교구 현황
 */
export function getInventoryByDate(
  targetDate: string | Date,
  equipmentName?: string
): InventoryItem[] {
  if (typeof window === 'undefined') return []
  
  const queryDate = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const queryDateStr = queryDate.toISOString().split('T')[0] // YYYY-MM-DD
  
  // Get base inventory
  const baseInventory = getInventory()
  const allDocs = getAllDocs()
  
  // Calculate rented quantities for the specific date
  const rentedCounts: Record<string, number> = {}
  
  allDocs
    .filter(doc => {
      // Filter by status: APPROVED, BORROWED, or RETURNED (but return date is after query date)
      if (doc.status === 'APPROVED' || doc.status === 'BORROWED') {
        // Check if query date is between borrow and return dates
        if (doc.schedule.plannedBorrowDate && doc.schedule.plannedReturnDate) {
          const borrowDate = new Date(doc.schedule.plannedBorrowDate).toISOString().split('T')[0]
          const returnDate = new Date(doc.schedule.plannedReturnDate).toISOString().split('T')[0]
          return queryDateStr >= borrowDate && queryDateStr <= returnDate
        }
        // Fallback: if dates not set, check by actual borrow date
        if (doc.schedule.actualBorrowAt) {
          const borrowDate = new Date(doc.schedule.actualBorrowAt).toISOString().split('T')[0]
          if (queryDateStr >= borrowDate) {
            // If returned, check return date
            if (doc.schedule.actualReturnAt) {
              const returnDate = new Date(doc.schedule.actualReturnAt).toISOString().split('T')[0]
              return queryDateStr <= returnDate
            }
            return true // Borrowed but not returned yet
          }
        }
        // If no dates set, assume it's active if status is BORROWED
        return doc.status === 'BORROWED'
      }
      // For RETURNED status, check if return date is after query date
      if (doc.status === 'RETURNED' && doc.schedule.actualReturnAt) {
        const returnDate = new Date(doc.schedule.actualReturnAt).toISOString().split('T')[0]
        return queryDateStr <= returnDate
      }
      return false
    })
    .forEach(doc => {
      doc.items.forEach(item => {
        if (!equipmentName || item.name === equipmentName) {
          rentedCounts[item.name] = (rentedCounts[item.name] || 0) + item.quantity
        }
      })
    })
  
  // Filter by equipment name if specified
  const filteredBase = equipmentName
    ? baseInventory.filter(item => item.name === equipmentName)
    : baseInventory
  
  // Update rentedQty and availableQty for the query date
  return filteredBase.map(item => ({
    ...item,
    rentedQty: rentedCounts[item.name] || 0,
    availableQty: item.totalQty - item.brokenQty - (rentedCounts[item.name] || 0),
  }))
}

