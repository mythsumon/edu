import type { EquipmentConfirmationDoc, EquipmentItem, InventoryItem, AuditLogEntry } from './types'
import { getDocs } from './storage'

const INVENTORY_KEY = 'teaching_aid_inventory'
const AUDIT_LOG_KEY = 'teaching_aid_audit_logs'

export function getInventory(): InventoryItem[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(INVENTORY_KEY)
  if (!stored) return []
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
    return []
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

