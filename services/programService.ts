// Service to manage program data fetching and manipulation
// In a real application, this would connect to an API

import {
  ProgramListItem,
  AttendanceData,
  ActivityData,
  EquipmentData,
  Student,
  Instructor,
  Session,
  RentalItem
} from '@/types/program'

// Mock data for program list - in a real app this would come from an API
const mockPrograms: ProgramListItem[] = [
  {
    id: 1,
    name: '창의융합교육 프로그램',
    institution: '서울초등학교',
    mainInstructor: '김교사',
    subInstructor: '이교사',
    createdDate: '2025-01-15',
    lastUpdated: '2025-03-20',
  },
  {
    id: 2,
    name: '디지털 리터러시 교육',
    institution: '인천중학교',
    mainInstructor: '박교사',
    subInstructor: '최교사',
    createdDate: '2025-02-01',
    lastUpdated: '2025-03-18',
  },
  {
    id: 3,
    name: '과학탐구 프로젝트',
    institution: '경기고등학교',
    mainInstructor: '정교사',
    subInstructor: '강교사',
    createdDate: '2025-01-20',
    lastUpdated: '2025-03-19',
  },
  {
    id: 4,
    name: '예술융합 프로그램',
    institution: '수원초등학교',
    mainInstructor: '윤교사',
    subInstructor: '임교사',
    createdDate: '2025-02-10',
    lastUpdated: '2025-03-17',
  },
  {
    id: 5,
    name: '환경교육 캠페인',
    institution: '성남중학교',
    mainInstructor: '조교사',
    subInstructor: '신교사',
    createdDate: '2025-01-25',
    lastUpdated: '2025-03-16',
  },
]

// Service functions
export const programService = {
  // Fetch all programs for the list view
  getAllPrograms: async (): Promise<ProgramListItem[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockPrograms
  },

  // Fetch a single program's attendance data by ID
  getAttendanceData: async (id: number): Promise<AttendanceData> => {
    try {
      const response = await fetch(`/api/programs/${id}/attendance`)
      if (!response.ok) {
        throw new Error(`Failed to fetch attendance data: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching attendance data:', error)
      // Fallback to mock data if API fails
      // Generate student data matching the image
      const studentNames = [
        '남궁민수', '김민수', '이수면', '홍길동', '김민수', '이수면', '홍길동', '김민수',
        '이수면', '홍길동', '김민수', '이수면', '홍길동', '김민수', '이수면', '홍길동',
        '김민수', '김민수'
      ]
      const genders: ('남' | '여')[] = ['남', '남', '여', '남', '남', '여', '남', '남', '여', '남', '남', '여', '남', '남', '여', '남', '남', '남']
      const tardinessValues: ('O' | 'X' | '')[] = ['O', 'O', 'X', 'O', 'O', 'X', 'O', 'O', 'X', 'O', 'O', 'X', 'O', 'O', 'X', 'O', 'O', 'O']
      const absenceValues: ('O' | 'X' | '')[] = ['X', 'O', 'O', 'X', 'O', 'O', 'X', 'O', 'O', 'X', 'O', 'O', 'X', 'O', 'O', 'X', 'O', 'O']
      
      const students: Student[] = studentNames.map((name, index) => ({
        id: String(index + 1),
        number: index + 1,
        name,
        gender: genders[index] || '남',
        tardiness: (tardinessValues[index] || '') as 'O' | 'X' | '',
        absence: (absenceValues[index] || '') as 'O' | 'X' | '',
        note: index < 8 ? '우등생' : '',
      }))

      return {
        id: String(id),
        title: `2025 소프트웨어(SW) 미래채움 교육 출석부`,
        attendanceCode: '',
        programName: '4차시 파이함과 함께하는 파이번 코딩',
        institutionName: '수원조등학교',
        grade: '3',
        class: '2',
        totalApplicants: 18,
        totalGraduates: 8,
        maleGraduates: 4,
        femaleGraduates: 4,
        students,
        instructors: [
          { role: '주강사', name: '홍길동' },
          { role: '보조강사', name: '이상해' },
          { role: '보조강사2', name: '손흥민' },
        ],
      }
    }
  },

  // Fetch a single program's activity data by ID
  getActivityData: async (id: number): Promise<ActivityData> => {
    try {
      const response = await fetch(`/api/programs/${id}/activity`)
      if (!response.ok) {
        throw new Error(`Failed to fetch activity data: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching activity data:', error)
      // Fallback to mock data if API fails
      return {
        id: String(id),
        title: `프로그램 ${id} 활동 일지`,
        activityCode: `ACT-2025-${String(id).padStart(3, '0')}`,
        educationType: '정규교육',
        institutionType: '초등학교',
        region: '서울시',
        institutionName: '서울초등학교',
        grade: '5',
        class: '3',
        startDate: '2025-03-01',
        endDate: '2025-03-31',
        totalApplicants: 25,
        totalGraduates: 23,
        maleGraduates: 12,
        femaleGraduates: 11,
        sessions: [
          { id: '1', sessionNumber: 1, date: '2025-03-01', startTime: '09:00', endTime: '12:00', activityName: '창의적 문제 해결' },
        ],
        photos: [
          { id: '1', url: '/placeholder-image.jpg', name: '활동사진1.jpg' },
        ],
        createdAt: '2025-03-01',
        createdBy: '김교사',
      }
    }
  },

  // Fetch a single program's equipment data by ID
  getEquipmentData: async (id: number): Promise<EquipmentData> => {
    try {
      const response = await fetch(`/api/programs/${id}/equipment`)
      if (!response.ok) {
        throw new Error(`Failed to fetch equipment data: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching equipment data:', error)
      // Fallback to mock data if API fails
      return {
        id: String(id),
        assignmentNumber: `EQ-2025-${String(id).padStart(3, '0')}`,
        courseName: `프로그램 ${id}`,
        institution: '서울초등학교',
        educationDate: '2025-03-15',
        currentSession: 3,
        totalSessions: 10,
        instructorName: '김교사',
        expectedParticipants: 25,
        rentalDate: '2025-03-10',
        rentalTime: '09:00',
        renterName: '이담당',
        returnerName: '박담당',
        returnDate: '2025-03-20',
        returnTime: '17:00',
        notes: '',
        rentalItems: [
          { id: '1', itemName: '노트북', quantity: 10 },
        ],
        returnerNameConfirm: '박담당',
        returnDateConfirm: '2025-03-20',
        returnTimeConfirm: '17:00',
        returnStatus: '정상 반납',
        returnQuantity: 10,
        targetEligible: true,
        remarks: '모든 교구가 정상적으로 반납되었습니다.',
        signatureOmitted: false,
        signatureName: '최담당',
        signatureDate: '2025-03-20',
      }
    }
  },

  // Update attendance data
  updateAttendanceData: async (data: AttendanceData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/programs/${data.id}/attendance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update attendance data: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Attendance data updated:', result)
      return true
    } catch (error) {
      console.error('Error updating attendance data:', error)
      return false
    }
  },

  // Update activity data
  updateActivityData: async (data: ActivityData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/programs/${data.id}/activity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update activity data: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Activity data updated:', result)
      return true
    } catch (error) {
      console.error('Error updating activity data:', error)
      return false
    }
  },

  // Update equipment data
  updateEquipmentData: async (data: EquipmentData): Promise<boolean> => {
    try {
      const response = await fetch(`/api/programs/${data.id}/equipment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      
      if (!response.ok) {
        throw new Error(`Failed to update equipment data: ${response.status}`)
      }
      
      const result = await response.json()
      console.log('Equipment data updated:', result)
      return true
    } catch (error) {
      console.error('Error updating equipment data:', error)
      return false
    }
  },
}