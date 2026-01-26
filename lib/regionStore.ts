/**
 * 권역 관리 Store (Frontend-only, localStorage 기반)
 */

export interface Region {
  id: number
  name: string
  color: string
  mode: 'PARTIAL' | 'FULL'
  areas: Array<{ code: string; name: string }>
  createdAt?: string
  updatedAt?: string
}

export interface Area {
  code: string
  name: string
}

// Storage keys
const REGIONS_STORAGE_KEY = 'admin_regions_data'
const AREAS_STORAGE_KEY = 'admin_areas_data'

// ==================== Regions ====================

function loadRegionsFromStorage(): Region[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(REGIONS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load regions from localStorage:', e)
  }
  return []
}

function saveRegionsToStorage(regions: Region[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(REGIONS_STORAGE_KEY, JSON.stringify(regions))
    window.dispatchEvent(new StorageEvent('storage', {
      key: REGIONS_STORAGE_KEY,
      newValue: JSON.stringify(regions),
    }))
  } catch (e) {
    console.error('Failed to save regions to localStorage:', e)
  }
}

// 기본 권역 데이터
const defaultRegions: Region[] = [
  { id: 1, name: '1권역', color: '#FF5733', mode: 'PARTIAL', areas: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 2, name: '2권역', color: '#33FF57', mode: 'PARTIAL', areas: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 3, name: '3권역', color: '#3357FF', mode: 'PARTIAL', areas: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 4, name: '4권역', color: '#FF33F5', mode: 'PARTIAL', areas: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 5, name: '5권역', color: '#F5FF33', mode: 'PARTIAL', areas: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 6, name: '6권역', color: '#33FFF5', mode: 'PARTIAL', areas: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
]

// 권역 목록 조회
export function getAllRegions(): Region[] {
  const stored = loadRegionsFromStorage()
  if (stored.length === 0) {
    // 초기 데이터 저장
    saveRegionsToStorage(defaultRegions)
    return defaultRegions
  }
  return stored
}

// 특정 권역 조회
export function getRegionById(id: number): Region | undefined {
  const regions = getAllRegions()
  return regions.find(r => r.id === id)
}

// 권역 업데이트
export function updateRegion(id: number, updates: Partial<Region>): Region {
  const regions = getAllRegions()
  const index = regions.findIndex(r => r.id === id)
  
  if (index === -1) {
    throw new Error(`권역을 찾을 수 없습니다: ${id}`)
  }

  // 중복 체크: 다른 권역에 이미 할당된 area_code가 있는지 확인
  if (updates.areas) {
    for (const area of updates.areas) {
      const existingRegion = regions.find(r => 
        r.id !== id && 
        r.areas.some(a => a.code === area.code)
      )
      if (existingRegion) {
        throw new Error(`행정구역 코드 '${area.code}'는 이미 ${existingRegion.name}에 할당되어 있습니다.`)
      }
    }
  }

  // 권역 업데이트
  const updated: Region = {
    ...regions[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  
  regions[index] = updated
  saveRegionsToStorage(regions)
  
  return updated
}

// ==================== Areas ====================

function loadAreasFromStorage(): Area[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(AREAS_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch (e) {
    console.error('Failed to load areas from localStorage:', e)
  }
  return []
}

function saveAreasToStorage(areas: Area[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(AREAS_STORAGE_KEY, JSON.stringify(areas))
    window.dispatchEvent(new StorageEvent('storage', {
      key: AREAS_STORAGE_KEY,
      newValue: JSON.stringify(areas),
    }))
  } catch (e) {
    console.error('Failed to save areas to localStorage:', e)
  }
}

// 기본 행정구역 데이터 (경기도 주요 시군구)
const defaultAreas: Area[] = [
  { code: '41111', name: '수원시 영통구' },
  { code: '41113', name: '수원시 장안구' },
  { code: '41115', name: '수원시 권선구' },
  { code: '41117', name: '수원시 팔달구' },
  { code: '41131', name: '성남시 수정구' },
  { code: '41133', name: '성남시 중원구' },
  { code: '41135', name: '성남시 분당구' },
  { code: '41150', name: '의정부시' },
  { code: '41171', name: '안양시 만안구' },
  { code: '41173', name: '안양시 동안구' },
  { code: '41190', name: '부천시' },
  { code: '41210', name: '광명시' },
  { code: '41220', name: '평택시' },
  { code: '41250', name: '동두천시' },
  { code: '41271', name: '안산시 상록구' },
  { code: '41273', name: '안산시 단원구' },
  { code: '41281', name: '고양시 덕양구' },
  { code: '41285', name: '고양시 일산동구' },
  { code: '41287', name: '고양시 일산서구' },
  { code: '41290', name: '과천시' },
  { code: '41310', name: '구리시' },
  { code: '41360', name: '남양주시' },
  { code: '41370', name: '오산시' },
  { code: '41390', name: '시흥시' },
  { code: '41410', name: '군포시' },
  { code: '41430', name: '의왕시' },
  { code: '41450', name: '하남시' },
  { code: '41461', name: '용인시 처인구' },
  { code: '41463', name: '용인시 기흥구' },
  { code: '41465', name: '용인시 수지구' },
  { code: '41480', name: '파주시' },
  { code: '41500', name: '이천시' },
  { code: '41550', name: '안성시' },
  { code: '41570', name: '김포시' },
  { code: '41590', name: '화성시' },
  { code: '41610', name: '광주시' },
  { code: '41630', name: '양주시' },
  { code: '41650', name: '포천시' },
  { code: '41670', name: '여주시' },
]

// 행정구역 목록 조회
export function getAllAreas(): Area[] {
  const stored = loadAreasFromStorage()
  if (stored.length === 0) {
    // 초기 데이터 저장
    saveAreasToStorage(defaultAreas)
    return defaultAreas
  }
  return stored
}

// ==================== Storage Event Listener ====================

// 다른 탭에서의 변경사항 감지
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === REGIONS_STORAGE_KEY || e.key === AREAS_STORAGE_KEY) {
      // 데이터가 변경되었을 때 이벤트 발생
      window.dispatchEvent(new CustomEvent('regionDataChanged'))
    }
  })
}
