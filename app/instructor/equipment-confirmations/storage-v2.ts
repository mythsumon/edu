import type { EquipmentConfirmation } from './types-v2'
import { createMockEquipmentConfirmation } from './types-v2'

export { createMockEquipmentConfirmation }

const STORAGE_KEY = 'equipment_confirmation_v2_docs'

export function getAllEquipmentConfirmations(): EquipmentConfirmation[] {
  if (typeof window === 'undefined') return []
  
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) {
    // Initialize with mock data
    const mockData = [createMockEquipmentConfirmation()]
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockData))
    return mockData
  }
  
  try {
    return JSON.parse(stored) as EquipmentConfirmation[]
  } catch {
    return []
  }
}

export function getEquipmentConfirmationById(id: string): EquipmentConfirmation | null {
  const all = getAllEquipmentConfirmations()
  return all.find(doc => doc.id === id) || null
}

export function getEquipmentConfirmationByEducationId(educationId: string): EquipmentConfirmation | null {
  const all = getAllEquipmentConfirmations()
  return all.find(doc => doc.educationId === educationId) || null
}

export function upsertEquipmentConfirmation(doc: EquipmentConfirmation): void {
  const all = getAllEquipmentConfirmations()
  const index = all.findIndex(d => d.id === doc.id)
  
  const updated = {
    ...doc,
    updatedAt: new Date().toISOString(),
  }
  
  if (index >= 0) {
    all[index] = updated
  } else {
    all.push(updated)
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all))
}

export function deleteEquipmentConfirmation(id: string): void {
  const all = getAllEquipmentConfirmations()
  const filtered = all.filter(doc => doc.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}
