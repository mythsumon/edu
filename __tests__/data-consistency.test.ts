import { programService } from '@/services/programService'
import { 
  ProgramListItem, 
  AttendanceData, 
  ActivityData, 
  EquipmentData 
} from '@/types/program'

// Mock the global test functions for TypeScript
declare global {
  function describe(name: string, fn: () => void): void
  function test(name: string, fn: () => void | Promise<void>): void
  function expect(value: any): Expect
}

interface Expect {
  toBe(value: any): void
  toHaveProperty(prop: string): void
  toBeGreaterThan(value: number): void
  toBeTruthy(): void
  toBeFalsy(): void
  toEqual(value: any): void
}

describe('Data Structure Consistency', () => {
  test('should fetch program list items', async () => {
    const programs = await programService.getAllPrograms()
    expect(Array.isArray(programs)).toBe(true)
    expect(programs.length).toBeGreaterThan(0)
    
    const firstProgram = programs[0]
    expect(firstProgram).toHaveProperty('id')
    expect(firstProgram).toHaveProperty('name')
    expect(firstProgram).toHaveProperty('institution')
  })

  test('should fetch attendance data by ID', async () => {
    const attendanceData = await programService.getAttendanceData(1)
    expect(attendanceData).toHaveProperty('id')
    expect(attendanceData).toHaveProperty('title')
    expect(attendanceData).toHaveProperty('students')
    expect(Array.isArray(attendanceData.students)).toBe(true)
  })

  test('should fetch activity data by ID', async () => {
    const activityData = await programService.getActivityData(1)
    expect(activityData).toHaveProperty('id')
    expect(activityData).toHaveProperty('title')
    expect(activityData).toHaveProperty('sessions')
    expect(Array.isArray(activityData.sessions)).toBe(true)
  })

  test('should fetch equipment data by ID', async () => {
    const equipmentData = await programService.getEquipmentData(1)
    expect(equipmentData).toHaveProperty('id')
    expect(equipmentData).toHaveProperty('assignmentNumber')
    expect(equipmentData).toHaveProperty('rentalItems')
    expect(Array.isArray(equipmentData.rentalItems)).toBe(true)
  })

  test('should have consistent ID structure across data types', async () => {
    const programId = 1
    
    const attendanceData = await programService.getAttendanceData(programId)
    const activityData = await programService.getActivityData(programId)
    const equipmentData = await programService.getEquipmentData(programId)
    
    // All detail data should have string IDs (converted from number)
    expect(typeof attendanceData.id).toBe('string')
    expect(typeof activityData.id).toBe('string')
    expect(typeof equipmentData.id).toBe('string')
    
    // IDs should match the requested program ID
    expect(parseInt(attendanceData.id)).toBe(programId)
    expect(parseInt(activityData.id)).toBe(programId)
    expect(parseInt(equipmentData.id)).toBe(programId)
  })
})