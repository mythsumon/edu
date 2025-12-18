// Shared data structures for programs across list and detail views

export interface ProgramListItem {
  id: number
  name: string
  institution: string
  mainInstructor: string
  subInstructor: string
  createdDate: string
  lastUpdated: string
}

export interface Student {
  id: string
  number: number
  name: string
  gender: '남' | '여'
  attendance3_5: 'O' | 'X' | ''
  attendance3_6: 'O' | 'X' | ''
  note: string
}

export interface Instructor {
  role: string
  name: string
}

export interface Session {
  id: string
  sessionNumber: number
  date: string
  startTime: string
  endTime: string
  activityName: string
}

export interface Photo {
  id: string
  url: string
  name: string
}

export interface RentalItem {
  id: string
  itemName: string
  quantity: number
}

export interface AttendanceData {
  id: string
  title: string
  attendanceCode: string
  programName: string
  institutionName: string
  grade: string
  class: string
  totalApplicants: number
  totalGraduates: number
  maleGraduates: number
  femaleGraduates: number
  students: Student[]
  instructors: Instructor[]
}

export interface ActivityData {
  id: string
  title: string
  activityCode: string
  educationType: string
  institutionType: string
  region: string
  institutionName: string
  grade: string
  class: string
  startDate: string
  endDate: string
  totalApplicants: number
  totalGraduates: number
  maleGraduates: number
  femaleGraduates: number
  sessions: Session[]
  photos: Photo[]
  createdAt: string
  createdBy: string
}

export interface EquipmentData {
  id: string
  assignmentNumber: string
  courseName: string
  institution: string
  educationDate: string
  currentSession: number
  totalSessions: number
  instructorName: string
  expectedParticipants: number
  rentalDate: string
  rentalTime: string
  renterName: string
  returnerName: string
  returnDate: string
  returnTime: string
  notes: string
  rentalItems: RentalItem[]
  returnerNameConfirm: string
  returnDateConfirm: string
  returnTimeConfirm: string
  returnStatus: string
  returnQuantity: number
  targetEligible: boolean
  remarks: string
  signatureOmitted: boolean
  signatureName: string
  signatureDate: string
}