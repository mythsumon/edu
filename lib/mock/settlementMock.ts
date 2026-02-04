/**
 * Mock data for Instructor Settlement Calculator
 * No database - all data is in-memory JSON
 */

export interface CityDistanceMatrix {
  [cityA: string]: {
    [cityB: string]: number
  }
}

export interface Instructor {
  id: string
  name: string
  homeCity: string
}

export interface Institution {
  id: string
  name: string
  city: string
  isRemote: boolean
  isSpecial: boolean
  level: 'ELEMENTARY' | 'MIDDLE' | 'HIGH'
}

export type ActivityStatus = 'PLANNED' | 'OPEN' | 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
export type ActivityType = 'CLASS' | 'EVENT'
export type InstructorRole = 'MAIN' | 'ASSISTANT'

export interface ClassActivity {
  id: string
  instructorId: string
  date: string // YYYY-MM-DD
  type: 'CLASS'
  status: ActivityStatus
  role: InstructorRole
  institutionId: string
  sessions: number // 차시
  students: number
  hasAssistant: boolean
  equipmentTransport: boolean
}

export interface EventActivity {
  id: string
  instructorId: string
  date: string // YYYY-MM-DD
  type: 'EVENT'
  status: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  eventHours: number
  equipmentTransport: boolean
}

export type DailyActivity = ClassActivity | EventActivity

/**
 * Fixed distance matrix between cities (city hall to city hall)
 * Same city = 0 km
 * Symmetric: distance[A][B] === distance[B][A]
 */
export const cityDistanceMatrix: CityDistanceMatrix = {
  'Suwon': {
    'Suwon': 0,
    'Yongin': 15.2,
    'Seongnam': 18.5,
    'Hwaseong': 25.3,
    'Ansan': 32.1,
    'Pyeongtaek': 28.7,
  },
  'Yongin': {
    'Suwon': 15.2,
    'Yongin': 0,
    'Seongnam': 22.8,
    'Hwaseong': 18.9,
    'Ansan': 28.4,
    'Pyeongtaek': 35.2,
  },
  'Seongnam': {
    'Suwon': 18.5,
    'Yongin': 22.8,
    'Seongnam': 0,
    'Hwaseong': 30.1,
    'Ansan': 25.7,
    'Pyeongtaek': 42.3,
  },
  'Hwaseong': {
    'Suwon': 25.3,
    'Yongin': 18.9,
    'Seongnam': 30.1,
    'Hwaseong': 0,
    'Ansan': 38.2,
    'Pyeongtaek': 28.5,
  },
  'Ansan': {
    'Suwon': 32.1,
    'Yongin': 28.4,
    'Seongnam': 25.7,
    'Hwaseong': 38.2,
    'Ansan': 0,
    'Pyeongtaek': 45.8,
  },
  'Pyeongtaek': {
    'Suwon': 28.7,
    'Yongin': 35.2,
    'Seongnam': 42.3,
    'Hwaseong': 28.5,
    'Ansan': 45.8,
    'Pyeongtaek': 0,
  },
}

/**
 * Mock instructors
 */
export const instructors: Instructor[] = [
  { id: 'inst-001', name: '김강사', homeCity: 'Suwon' },
  { id: 'inst-002', name: '이강사', homeCity: 'Yongin' },
  { id: 'inst-003', name: '박강사', homeCity: 'Seongnam' },
  { id: 'inst-004', name: '최강사', homeCity: 'Hwaseong' },
]

/**
 * Mock institutions
 */
export const institutions: Institution[] = [
  { id: 'school-001', name: '수원초등학교', city: 'Suwon', isRemote: false, isSpecial: false, level: 'ELEMENTARY' },
  { id: 'school-002', name: '용인중학교', city: 'Yongin', isRemote: false, isSpecial: false, level: 'MIDDLE' },
  { id: 'school-003', name: '성남고등학교', city: 'Seongnam', isRemote: false, isSpecial: false, level: 'HIGH' },
  { id: 'school-004', name: '화성도서벽지초등학교', city: 'Hwaseong', isRemote: true, isSpecial: false, level: 'ELEMENTARY' },
  { id: 'school-005', name: '안산특수학교', city: 'Ansan', isRemote: false, isSpecial: true, level: 'ELEMENTARY' },
  { id: 'school-006', name: '평택도서벽지특수학급', city: 'Pyeongtaek', isRemote: true, isSpecial: true, level: 'ELEMENTARY' },
]

/**
 * Mock daily activities
 * Mix of CLASS and EVENT types, various statuses
 */
export const dailyActivities: DailyActivity[] = [
  // Scenario 1: Same-city only (travelKm = 0)
  {
    id: 'act-001',
    instructorId: 'inst-001',
    date: '2025-01-15',
    type: 'CLASS',
    status: 'CONFIRMED',
    role: 'MAIN',
    institutionId: 'school-001',
    sessions: 4,
    students: 20,
    hasAssistant: true,
    equipmentTransport: false,
  },
  
  // Scenario 2: Multi-institution same day (route calculation)
  {
    id: 'act-002',
    instructorId: 'inst-002',
    date: '2025-01-16',
    type: 'CLASS',
    status: 'CONFIRMED',
    role: 'MAIN',
    institutionId: 'school-002',
    sessions: 2,
    students: 18,
    hasAssistant: false,
    equipmentTransport: true,
  },
  {
    id: 'act-003',
    instructorId: 'inst-002',
    date: '2025-01-16',
    type: 'CLASS',
    status: 'CONFIRMED',
    role: 'MAIN',
    institutionId: 'school-003',
    sessions: 2,
    students: 22,
    hasAssistant: true,
    equipmentTransport: false,
  },
  
  // Scenario 3: Remote + Special + Weekend stacking
  {
    id: 'act-004',
    instructorId: 'inst-003',
    date: '2025-01-18', // Saturday
    type: 'CLASS',
    status: 'CONFIRMED',
    role: 'MAIN',
    institutionId: 'school-006', // Remote + Special
    sessions: 4,
    students: 12,
    hasAssistant: false,
    equipmentTransport: false,
  },
  
  // Scenario 4: CANCELLED class (excluded from teaching fee)
  {
    id: 'act-005',
    instructorId: 'inst-001',
    date: '2025-01-20',
    type: 'CLASS',
    status: 'CANCELLED',
    role: 'MAIN',
    institutionId: 'school-001',
    sessions: 4,
    students: 20,
    hasAssistant: true,
    equipmentTransport: false,
  },
  
  // Event participation
  {
    id: 'act-006',
    instructorId: 'inst-001',
    date: '2025-01-22',
    type: 'EVENT',
    status: 'CONFIRMED',
    eventHours: 3,
    equipmentTransport: false,
  },
  
  // Weekend class (Saturday)
  {
    id: 'act-007',
    instructorId: 'inst-004',
    date: '2025-01-25', // Saturday
    type: 'CLASS',
    status: 'CONFIRMED',
    role: 'MAIN',
    institutionId: 'school-004',
    sessions: 2,
    students: 16,
    hasAssistant: false,
    equipmentTransport: true,
  },
  
  // Assistant instructor
  {
    id: 'act-008',
    instructorId: 'inst-002',
    date: '2025-01-17',
    type: 'CLASS',
    status: 'CONFIRMED',
    role: 'ASSISTANT',
    institutionId: 'school-002',
    sessions: 4,
    students: 18,
    hasAssistant: true,
    equipmentTransport: false,
  },
  
  // High school
  {
    id: 'act-009',
    instructorId: 'inst-003',
    date: '2025-01-19',
    type: 'CLASS',
    status: 'CONFIRMED',
    role: 'MAIN',
    institutionId: 'school-003',
    sessions: 4,
    students: 25,
    hasAssistant: true,
    equipmentTransport: false,
  },
  
  // Multiple days for monthly calculation
  {
    id: 'act-010',
    instructorId: 'inst-001',
    date: '2025-01-28',
    type: 'CLASS',
    status: 'CONFIRMED',
    role: 'MAIN',
    institutionId: 'school-001',
    sessions: 4,
    students: 20,
    hasAssistant: true,
    equipmentTransport: true,
  },
]
