/**
 * Teacher Data Store
 * Stores teacher education info and attendance info requests
 * Uses localStorage + CustomEvent for real-time sync
 */

// ==================== Types ====================

export interface TeacherEducationInfo {
  id: string
  educationId: string
  institutionId: string
  institutionName: string
  grade: string
  className: string
  students: Array<{
    no: number
    name: string
  }>
  teacherName: string
  teacherContact: string
  notes?: string
  updatedAt: string
  updatedBy: string // teacherId
}

export interface AttendanceInfoRequest {
  id: string
  educationId: string
  requesterInstructorId: string
  requesterInstructorName: string
  status: 'OPEN' | 'DONE'
  message?: string
  createdAt: string
  completedAt?: string
}

export interface TeacherAttendanceSignature {
  id: string
  attendanceId?: string
  educationId: string
  sessionId?: string
  teacherId: string
  teacherName: string
  signatureType: 'image' | 'typed'
  signatureValue: string // base64 image URL or typed name
  signedAt: string
}

export interface TeacherProfile {
  teacherId: string
  name: string
  email: string
  phone: string
  institutionId: string
  institutionName: string
  signatureImageUrl?: string
}

// ==================== Storage Keys ====================

const TEACHER_EDUCATION_INFO_KEY = 'teacher_education_info'
const ATTENDANCE_INFO_REQUESTS_KEY = 'attendance_info_requests'
const TEACHER_ATTENDANCE_SIGNATURES_KEY = 'teacher_attendance_signatures'
const TEACHER_PROFILE_KEY = 'teacher_profile'

// ==================== Helper Functions ====================

function getStorageData<T>(key: string): T[] {
  if (typeof window === 'undefined') return []
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : []
  } catch (e) {
    console.error(`Failed to parse ${key}:`, e)
    return []
  }
}

function setStorageData<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (e) {
    console.error(`Failed to save ${key}:`, e)
  }
}

function dispatchEvent(eventName: string, data?: any): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(eventName, { detail: data }))
}

// ==================== Initial Dummy Data ====================

function getDummyTeacherEducationInfo(): TeacherEducationInfo[] {
  return [
    {
      id: 'info-1',
      educationId: 'EDU-2025-101',
      institutionId: 'INST-001',
      institutionName: '평택안일초등학교',
      grade: '5',
      className: '6반',
      students: [
        { no: 1, name: '강준' },
        { no: 2, name: '김리' },
        { no: 3, name: '김연' },
        { no: 4, name: '김아' },
        { no: 5, name: '김현' },
        { no: 6, name: '김후' },
        { no: 7, name: '김연' },
        { no: 8, name: '배은' },
        { no: 9, name: '서원' },
        { no: 10, name: '서호' },
        { no: 11, name: '승연' },
        { no: 12, name: '양지' },
        { no: 13, name: '이윤' },
        { no: 14, name: '이균' },
        { no: 15, name: '전서' },
        { no: 16, name: '조연' },
        { no: 17, name: '조성' },
        { no: 18, name: '최혁' },
        { no: 19, name: '하윤' },
        { no: 20, name: '황영' },
        { no: 21, name: '안은' },
        { no: 22, name: '김주우' },
      ],
      teacherName: '박지민',
      teacherContact: '010-1234-5678',
      notes: '학생들이 코딩에 관심이 많아 적극적으로 참여할 것으로 예상됩니다.',
      updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedBy: 'teacher-1',
    },
    {
      id: 'info-2',
      educationId: 'EDU-2025-102',
      institutionId: 'INST-001',
      institutionName: '평택안일초등학교',
      grade: '4',
      className: '3반',
      students: [
        { no: 1, name: '김민수' },
        { no: 2, name: '이영희' },
        { no: 3, name: '박지민' },
        { no: 4, name: '최수진' },
        { no: 5, name: '정민호' },
      ],
      teacherName: '이선생',
      teacherContact: '010-2345-6789',
      notes: '',
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedBy: 'teacher-1',
    },
  ]
}

function getDummyAttendanceInfoRequests(): AttendanceInfoRequest[] {
  return [
    {
      id: 'req-1',
      educationId: 'EDU-2025-103',
      requesterInstructorId: 'instructor-1',
      requesterInstructorName: '홍길동',
      status: 'OPEN',
      message: '출석부 정보 입력을 요청드립니다. 학생 명단과 학급 정보를 입력해주시면 감사하겠습니다.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'req-2',
      educationId: 'EDU-2025-101',
      requesterInstructorId: 'instructor-1',
      requesterInstructorName: '홍길동',
      status: 'DONE',
      message: '출석부 정보 입력 부탁드립니다.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

function getDummyTeacherSignatures(): TeacherAttendanceSignature[] {
  return [
    {
      id: 'sig-1',
      educationId: 'EDU-2024-201',
      teacherId: 'teacher-1',
      teacherName: '학교선생님',
      signatureType: 'typed',
      signatureValue: '박지민',
      signedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]
}

// ==================== Teacher Education Info ====================

export const teacherEducationInfoStore = {
  getAll(): TeacherEducationInfo[] {
    const stored = getStorageData<TeacherEducationInfo>(TEACHER_EDUCATION_INFO_KEY)
    // Initialize with dummy data if empty
    if (stored.length === 0 && typeof window !== 'undefined') {
      const dummy = getDummyTeacherEducationInfo()
      setStorageData(TEACHER_EDUCATION_INFO_KEY, dummy)
      return dummy
    }
    return stored
  },

  getByEducationId(educationId: string): TeacherEducationInfo | null {
    const all = this.getAll()
    return all.find(info => info.educationId === educationId) || null
  },

  getByInstitutionId(institutionId: string): TeacherEducationInfo[] {
    const all = this.getAll()
    return all.filter(info => info.institutionId === institutionId)
  },

  upsert(info: TeacherEducationInfo): void {
    const all = this.getAll()
    const index = all.findIndex(i => i.id === info.id)
    
    if (index >= 0) {
      all[index] = { ...info, updatedAt: new Date().toISOString() }
    } else {
      all.push({ ...info, updatedAt: new Date().toISOString() })
    }
    
    setStorageData(TEACHER_EDUCATION_INFO_KEY, all)
    dispatchEvent('teacherEducationInfoUpdated', info)
  },

  delete(id: string): void {
    const all = this.getAll()
    const filtered = all.filter(i => i.id !== id)
    setStorageData(TEACHER_EDUCATION_INFO_KEY, filtered)
    dispatchEvent('teacherEducationInfoUpdated')
  },
}

// ==================== Attendance Info Requests ====================

export const attendanceInfoRequestStore = {
  getAll(): AttendanceInfoRequest[] {
    const stored = getStorageData<AttendanceInfoRequest>(ATTENDANCE_INFO_REQUESTS_KEY)
    // Initialize with dummy data if empty
    if (stored.length === 0 && typeof window !== 'undefined') {
      const dummy = getDummyAttendanceInfoRequests()
      setStorageData(ATTENDANCE_INFO_REQUESTS_KEY, dummy)
      return dummy
    }
    return stored
  },

  getByEducationId(educationId: string): AttendanceInfoRequest[] {
    const all = this.getAll()
    return all.filter(req => req.educationId === educationId)
  },

  getOpenRequests(institutionId: string): AttendanceInfoRequest[] {
    const all = this.getAll()
    // Filter by institution - need to check education's institution
    // For now, return all OPEN requests
    return all.filter(req => req.status === 'OPEN')
  },

  create(request: Omit<AttendanceInfoRequest, 'id' | 'createdAt'>): AttendanceInfoRequest {
    const all = this.getAll()
    const newRequest: AttendanceInfoRequest = {
      ...request,
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    }
    all.push(newRequest)
    setStorageData(ATTENDANCE_INFO_REQUESTS_KEY, all)
    dispatchEvent('attendanceInfoRequestCreated', newRequest)
    return newRequest
  },

  update(id: string, updates: Partial<AttendanceInfoRequest>): void {
    const all = this.getAll()
    const index = all.findIndex(req => req.id === id)
    if (index >= 0) {
      all[index] = {
        ...all[index],
        ...updates,
        ...(updates.status === 'DONE' && !all[index].completedAt
          ? { completedAt: new Date().toISOString() }
          : {}),
      }
      setStorageData(ATTENDANCE_INFO_REQUESTS_KEY, all)
      dispatchEvent('attendanceInfoRequestUpdated', all[index])
    }
  },

  delete(id: string): void {
    const all = this.getAll()
    const filtered = all.filter(req => req.id !== id)
    setStorageData(ATTENDANCE_INFO_REQUESTS_KEY, filtered)
    dispatchEvent('attendanceInfoRequestUpdated')
  },
}

// ==================== Teacher Attendance Signatures ====================

export const teacherAttendanceSignatureStore = {
  getAll(): TeacherAttendanceSignature[] {
    const stored = getStorageData<TeacherAttendanceSignature>(TEACHER_ATTENDANCE_SIGNATURES_KEY)
    // Initialize with dummy data if empty
    if (stored.length === 0 && typeof window !== 'undefined') {
      const dummy = getDummyTeacherSignatures()
      setStorageData(TEACHER_ATTENDANCE_SIGNATURES_KEY, dummy)
      return dummy
    }
    return stored
  },

  getByEducationId(educationId: string): TeacherAttendanceSignature[] {
    const all = this.getAll()
    return all.filter(sig => sig.educationId === educationId)
  },

  getByAttendanceId(attendanceId: string): TeacherAttendanceSignature | null {
    const all = this.getAll()
    return all.find(sig => sig.attendanceId === attendanceId) || null
  },

  create(signature: Omit<TeacherAttendanceSignature, 'id' | 'signedAt'>): TeacherAttendanceSignature {
    const all = this.getAll()
    const newSignature: TeacherAttendanceSignature = {
      ...signature,
      id: `sig-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      signedAt: new Date().toISOString(),
    }
    all.push(newSignature)
    setStorageData(TEACHER_ATTENDANCE_SIGNATURES_KEY, all)
    dispatchEvent('teacherAttendanceSigned', newSignature)
    return newSignature
  },

  delete(id: string): void {
    const all = this.getAll()
    const filtered = all.filter(sig => sig.id !== id)
    setStorageData(TEACHER_ATTENDANCE_SIGNATURES_KEY, filtered)
    dispatchEvent('teacherAttendanceSigned')
  },
}

// ==================== Teacher Profile ====================

export const teacherProfileStore = {
  get(teacherId: string): TeacherProfile | null {
    if (typeof window === 'undefined') return null
    try {
      const data = localStorage.getItem(`${TEACHER_PROFILE_KEY}_${teacherId}`)
      return data ? JSON.parse(data) : null
    } catch (e) {
      console.error('Failed to parse teacher profile:', e)
      return null
    }
  },

  set(profile: TeacherProfile): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(`${TEACHER_PROFILE_KEY}_${profile.teacherId}`, JSON.stringify(profile))
      dispatchEvent('teacherProfileUpdated', profile)
    } catch (e) {
      console.error('Failed to save teacher profile:', e)
    }
  },
}
