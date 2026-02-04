'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { Button, Card, Input, Select, Space, Table, InputNumber, message, Upload, Modal, DatePicker, Tooltip } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import { ArrowLeft, Save, Edit, X, UserPlus, CheckCircle, CheckCircle2, AlertTriangle, Info } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { DetailSectionCard, DefinitionListGrid } from '@/components/admin/operations'
import { EducationBasicInfoForm, type EducationBasicInfoData } from '@/components/shared/common'
import { InstitutionContactAndSignatures } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import type { InstitutionContact, AttendanceSignatures, Signature } from '@/components/instructor/attendance/InstitutionContactAndSignatures'
import { dataStore } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'
import { upsertAttendanceDoc, getAttendanceDocByEducationId, type AttendanceDocument } from './storage'
import { teacherEducationInfoStore, attendanceInfoRequestStore } from '@/lib/teacherStore'
import type { TeacherEducationInfo } from '@/lib/teacherStore'
import { attendanceSheetStore, type AttendanceSheet } from '@/lib/attendanceSheetStore'
import dayjs from 'dayjs'

const { TextArea } = Input

interface SessionAttendance {
  sessionNumber: number
  date: string
  startTime: string
  endTime: string
  sessions: number // 차시 수
  mainInstructor: string
  assistantInstructor: string
  institutionContacts: string[] // 기관 담당자 이름 (최대 2명)
  studentCount: number
  attendanceCount: number
}

interface StudentAttendance {
  id: string
  number: number
  name: string
  gender: '남' | '여'
  sessionAttendances: number[] // 각 회차별 출석 차시 수 (예: [0, 4] = 1회차 0차시, 2회차 4차시)
  completionStatus: 'O' | 'X' // 수료 여부 (80% 이상이면 O)
  isTransferred?: boolean // 전학 여부
}

export default function InstructorAttendancePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionParam = searchParams?.get('session')
  const { userRole, userProfile } = useAuth()
  const isAdmin = userRole === 'admin'
  
  const [isEditMode, setIsEditMode] = useState(false)
  const [loading, setLoading] = useState(false)
  const [assignment, setAssignment] = useState<InstructorAssignment | null>(null)
  const [students, setStudents] = useState<StudentAttendance[]>([])
  const [sessions, setSessions] = useState<SessionAttendance[]>([])
  
  // Helper function to parse gradeClass into grade and className
  const parseGradeClass = (gradeClass: string): { grade: string; className: string } => {
    const match = gradeClass.match(/(\d+)학년\s*(\d+)반/)
    if (match) {
      return { grade: match[1], className: match[2] }
    }
    return { grade: '', className: '' }
  }

  // Helper function to format grade and className into gradeClass
  const formatGradeClass = (grade: string, className: string): string => {
    if (grade && className) {
      return `${grade}학년 ${className}반`
    }
    return ''
  }

  // Header fields state
  const [headerData, setHeaderData] = useState({
    location: '평택시',
    institution: '평택안일초등학교',
    gradeClass: '5학년 6반',
    grade: '5',
    className: '6',
    programName: '8차시 블록코딩과 엔트리 기초 및 인공지능',
    totalSessions: 8,
    maleCount: 11,
    femaleCount: 11,
    schoolContactName: '박지민', // 학교 담당자 이름
  })
  
  // Institution contact and signatures state
  const [institutionContact, setInstitutionContact] = useState<InstitutionContact>({
    name: '',
    phone: '',
    email: '',
  })
  
  const [signatures, setSignatures] = useState<AttendanceSignatures>({})
  const [schoolSignatureModalVisible, setSchoolSignatureModalVisible] = useState(false)
  const [schoolSignatureUrl, setSchoolSignatureUrl] = useState<string>('')
  const [schoolSignatureName, setSchoolSignatureName] = useState<string>('')
  const [teacherEducationInfo, setTeacherEducationInfo] = useState<TeacherEducationInfo | null>(null)
  
  const educationId = params?.educationId as string
  const currentInstructorName = '홍길동' // TODO: Get from auth context

  // Calculate completion status based on attendance rate (80% 이상이면 O, 미만이면 X)
  const calculateCompletionStatus = (attendedSessions: number, totalSessions: number): 'O' | 'X' => {
    if (totalSessions === 0) return 'X'
    const rate = (attendedSessions / totalSessions) * 100
    return rate >= 80 ? 'O' : 'X'
  }

  // Fetch assignment data
  useEffect(() => {
    if (educationId) {
      const assignments = dataStore.getInstructorAssignments()
      const found = assignments.find(a => a.educationId === educationId)
      
      if (found) {
        setAssignment(found)
        
        // Create sessions from lessons
        if (found.lessons && found.lessons.length > 0) {
          const sessionData: SessionAttendance[] = found.lessons.map((lesson, index) => {
            const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
            const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
            
            return {
              sessionNumber: index + 1,
              date: lesson.date || '',
              startTime: lesson.startTime || '',
              endTime: lesson.endTime || '',
              sessions: 4, // 각 회차당 4차시
              mainInstructor: mainInstructors[0]?.name || '박정아', // 기본값
              assistantInstructor: assistantInstructors[0]?.name || '김윤미', // 기본값
              institutionContacts: ['박지민'], // 기본 기관 담당자
              studentCount: 22,
              attendanceCount: index === 0 ? 21 : 22, // 1회차 21명, 2회차 22명
            }
          })
          
          // Initialize students with exact data from requirements
          const studentData = [
            { number: 1, name: '강준', gender: '남' as const, attendances: [0, 4], isTransferred: false },
            { number: 2, name: '김리', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 3, name: '김연', gender: '남' as const, attendances: [4, 4], isTransferred: false },
            { number: 4, name: '김아', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 5, name: '김현', gender: '남' as const, attendances: [4, 4], isTransferred: false },
            { number: 6, name: '김후', gender: '남' as const, attendances: [4, 4], isTransferred: false },
            { number: 7, name: '김연', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 8, name: '배은', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 9, name: '서원', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 10, name: '서호', gender: '남' as const, attendances: [4, 4], isTransferred: false },
            { number: 11, name: '승연', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 12, name: '양지', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 13, name: '(전학)', gender: '남' as const, attendances: [0, 0], isTransferred: true },
            { number: 14, name: '이윤', gender: '남' as const, attendances: [4, 4], isTransferred: false },
            { number: 15, name: '이균', gender: '남' as const, attendances: [4, 4], isTransferred: false },
            { number: 16, name: '(전학)', gender: '여' as const, attendances: [0, 0], isTransferred: true },
            { number: 17, name: '전서', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 18, name: '조연', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 19, name: '조성', gender: '남' as const, attendances: [4, 4], isTransferred: false },
            { number: 20, name: '최혁', gender: '남' as const, attendances: [4, 4], isTransferred: false },
            { number: 21, name: '하윤', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 22, name: '황영', gender: '남' as const, attendances: [4, 4], isTransferred: false },
            { number: 23, name: '안은', gender: '여' as const, attendances: [4, 4], isTransferred: false },
            { number: 24, name: '김주우', gender: '남' as const, attendances: [4, 4], isTransferred: false },
          ]
          
          const initialStudents: StudentAttendance[] = studentData.map((student) => {
            // Ensure we have enough session attendances
            const sessionAttendances = student.attendances.length >= sessionData.length 
              ? student.attendances.slice(0, sessionData.length)
              : [...student.attendances, ...new Array(sessionData.length - student.attendances.length).fill(0)]
            
            // Calculate completion status: 총 차시 = 8, 출석률 = (1회차 + 2회차) / 8 * 100
            const totalAttended = sessionAttendances.reduce((sum, val) => sum + val, 0)
            const totalSessions = 8 // 총 차시 = 8
            const completionStatus = calculateCompletionStatus(totalAttended, totalSessions)
            
            return {
              id: `student-${student.number}`,
              number: student.number,
              name: student.name,
              gender: student.gender,
              sessionAttendances,
              completionStatus,
              isTransferred: student.isTransferred,
            }
          })
          
          setStudents(initialStudents)
          
          // Set sessions with exact data
          const exactSessions: SessionAttendance[] = [
            {
              sessionNumber: 1,
              date: '2025-11-03',
              startTime: '09:00',
              endTime: '12:10',
              sessions: 4,
              mainInstructor: '박정아',
              assistantInstructor: '김윤미',
              institutionContacts: ['박지민'],
              studentCount: 22,
              attendanceCount: 21,
            },
            {
              sessionNumber: 2,
              date: '2025-11-10',
              startTime: '09:00',
              endTime: '12:10',
              sessions: 4,
              mainInstructor: '박정아',
              assistantInstructor: '김윤미',
              institutionContacts: ['박지민'],
              studentCount: 22,
              attendanceCount: 22,
            },
          ]
          setSessions(exactSessions)
        } else {
          // If no lessons, initialize with empty sessions
          setSessions([])
          setStudents([])
        }
      } else {
        // Assignment not found - set empty state
        setAssignment(null)
        setSessions([])
        setStudents([])
      }
    }
  }, [educationId])

  // Validation: Check if attendance sheet can be submitted
  const canSubmit = (): boolean => {
    // 모든 서명은 선택사항으로 변경됨 - 서명 없이도 제출 가능
    // 학교 담당자 서명
    // if (!signatures.school) {
    //   message.warning('학교 담당자 서명이 필요합니다.')
    //   return false
    // }
    // 1회차 강사 서명
    // if (!signatures.session1MainInstructor || !signatures.session1AssistantInstructor) {
    //   message.warning('1회차 주강사 및 보조강사 서명이 필요합니다.')
    //   return false
    // }
    // 2회차 강사 서명
    // if (!signatures.session2MainInstructor || !signatures.session2AssistantInstructor) {
    //   message.warning('2회차 주강사 및 보조강사 서명이 필요합니다.')
    //   return false
    // }

    return true
  }

  const [attendanceStatus, setAttendanceStatus] = useState<'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'>('DRAFT')
  const [attendanceSheet, setAttendanceSheet] = useState<AttendanceSheet | null>(null)
  const [requestModalVisible, setRequestModalVisible] = useState(false)
  const [requestMessage, setRequestMessage] = useState('')

  // Load AttendanceSheet
  const loadAttendanceSheet = () => {
    if (educationId) {
      const sheet = attendanceSheetStore.getByEducationId(educationId)
      setAttendanceSheet(sheet)
      
      if (sheet) {
        // Update status based on AttendanceSheet
        if (sheet.status === 'SUBMITTED_TO_ADMIN') {
          setAttendanceStatus('SUBMITTED')
        } else if (sheet.status === 'APPROVED') {
          setAttendanceStatus('APPROVED')
        } else if (sheet.status === 'REJECTED') {
          setAttendanceStatus('REJECTED')
        } else {
          setAttendanceStatus('DRAFT')
        }
        
        // Load teacher info from sheet (read-only for instructor)
        if (sheet.teacherInfo) {
          setHeaderData(prev => ({
            ...prev,
            grade: sheet.teacherInfo.grade,
            className: sheet.teacherInfo.className,
            gradeClass: `${sheet.teacherInfo.grade}학년 ${sheet.teacherInfo.className}반`,
          }))
          
          if (sheet.teacherInfo.teacherName && sheet.teacherInfo.teacherContact) {
            setInstitutionContact({
              name: sheet.teacherInfo.teacherName,
              phone: sheet.teacherInfo.teacherContact,
              email: '',
            })
          }
        }
        
        // Load students from sheet
        if (sheet.students && sheet.students.length > 0) {
          const sheetStudents: StudentAttendance[] = sheet.students.map((student, index) => {
            // Get attendance data from sessions if available
            const sessionAttendances = sheet.sessions.map(session => {
              const attendance = session.attendanceByStudent[student.id || String(index)]
              return attendance || 0
            })
            
            return {
              id: student.id || `student-${student.no}`,
              number: typeof student.no === 'number' ? student.no : parseInt(String(student.no)) || index + 1,
              name: student.name,
              gender: '남' as const,
              sessionAttendances,
              completionStatus: 'X' as const,
              isTransferred: false,
            }
          })
          
          setStudents(sheetStudents)
        }
      }
    }
  }

  // Load teacher education info
  const loadTeacherEducationInfo = () => {
    if (educationId) {
      const teacherInfo = teacherEducationInfoStore.getByEducationId(educationId)
      setTeacherEducationInfo(teacherInfo)
      
      if (teacherInfo) {
        // Auto-load teacher data into header and students
        if (teacherInfo.grade && teacherInfo.className) {
          setHeaderData(prev => ({
            ...prev,
            grade: teacherInfo.grade,
            className: teacherInfo.className,
            gradeClass: `${teacherInfo.grade}학년 ${teacherInfo.className}반`,
          }))
        }
        
        if (teacherInfo.teacherName && teacherInfo.teacherContact) {
          setInstitutionContact({
            name: teacherInfo.teacherName,
            phone: teacherInfo.teacherContact,
            email: '',
          })
        }
        
        // Load students from teacher info
        if (teacherInfo.students && teacherInfo.students.length > 0) {
          const teacherStudents: StudentAttendance[] = teacherInfo.students.map((student, index) => ({
            id: `student-${student.no}`,
            number: student.no,
            name: student.name,
            gender: '남' as const, // Default, will be updated if available
            sessionAttendances: sessions.map(() => 0), // Initialize with zeros
            completionStatus: 'X' as const,
            isTransferred: false,
          }))
          
          // Merge with existing students (preserve attendance data)
          setStudents(prev => {
            const merged = teacherStudents.map(ts => {
              const existing = prev.find(s => s.number === ts.number && s.name === ts.name)
              if (existing) {
                return existing // Keep existing attendance data
              }
              return ts
            })
            return merged.length > 0 ? merged : prev
          })
        }
      }
    }
  }

  // Load attendance document
  const loadAttendanceDoc = () => {
    if (educationId) {
      const savedDoc = getAttendanceDocByEducationId(educationId)
      if (savedDoc) {
        setAttendanceStatus(savedDoc.status)
        // Parse gradeClass into grade and className
        const { grade, className } = parseGradeClass(savedDoc.gradeClass)
        // Load saved data
        setHeaderData({
          location: savedDoc.location,
          institution: savedDoc.institution,
          gradeClass: savedDoc.gradeClass,
          grade,
          className,
          programName: savedDoc.programName,
          totalSessions: savedDoc.totalSessions,
          maleCount: savedDoc.maleCount,
          femaleCount: savedDoc.femaleCount,
          schoolContactName: savedDoc.schoolContactName,
        })
        setInstitutionContact(savedDoc.institutionContact)
        setSignatures(savedDoc.signatures)
        setSessions(savedDoc.sessions)
        setStudents(savedDoc.students)
      }
      
      // Load teacher education info after loading saved doc
      loadTeacherEducationInfo()
    }
  }

  useEffect(() => {
    loadAttendanceSheet() // Load AttendanceSheet first
    loadAttendanceDoc()
  }, [educationId])

  // Listen for AttendanceSheet updates
  useEffect(() => {
    if (typeof window === 'undefined' || !educationId) return

    const handleSheetUpdate = () => {
      loadAttendanceSheet()
    }

    window.addEventListener('attendanceSheetUpdated', handleSheetUpdate)
    return () => {
      window.removeEventListener('attendanceSheetUpdated', handleSheetUpdate)
    }
  }, [educationId])

  // Listen for teacher education info updates
  useEffect(() => {
    if (typeof window === 'undefined' || !educationId) return

    const handleTeacherInfoUpdate = () => {
      loadTeacherEducationInfo()
    }

    window.addEventListener('teacherEducationInfoUpdated', handleTeacherInfoUpdate)
    return () => {
      window.removeEventListener('teacherEducationInfoUpdated', handleTeacherInfoUpdate)
    }
  }, [educationId])

  // Listen for localStorage changes (when admin updates status)
  useEffect(() => {
    if (typeof window === 'undefined' || !educationId) return

    const handleStorageChange = (e: StorageEvent) => {
      // Check if attendance_documents storage was updated
      if (e.key === 'attendance_documents' && e.newValue) {
        try {
          const docs = JSON.parse(e.newValue) as AttendanceDocument[]
          const updatedDoc = docs.find(doc => doc.educationId === educationId)
          if (updatedDoc) {
            setAttendanceStatus(updatedDoc.status)
            // Update other fields if needed
            if (updatedDoc.rejectReason) {
              message.warning(`반려되었습니다: ${updatedDoc.rejectReason}`)
            } else if (updatedDoc.status === 'APPROVED') {
              message.success('승인되었습니다.')
            }
          }
        } catch (error) {
          console.error('Error parsing updated attendance doc:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [educationId])

  // Request attendance info from teacher
  const handleRequestAttendanceInfo = () => {
    if (!educationId) return
    
    attendanceInfoRequestStore.create({
      educationId,
      requesterInstructorId: userProfile?.userId || 'instructor-1',
      requesterInstructorName: userProfile?.name || currentInstructorName,
      status: 'OPEN',
      message: requestMessage || '출석부 정보 입력을 요청드립니다.',
    })
    
    message.success('출석부 정보 요청이 전송되었습니다.')
    setRequestModalVisible(false)
    setRequestMessage('')
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Get existing document to preserve createdAt if it exists
      const existingDoc = getAttendanceDocByEducationId(educationId)
      
      // Format gradeClass from grade and className
      const gradeClass = formatGradeClass(headerData.grade, headerData.className)
      
      const docToSave: AttendanceDocument = {
        id: `attendance-${educationId}`,
        educationId: educationId!,
        assignmentId: assignment?.key,
        location: headerData.location,
        institution: headerData.institution,
        gradeClass,
        programName: headerData.programName,
        totalSessions: headerData.totalSessions,
        maleCount: headerData.maleCount,
        femaleCount: headerData.femaleCount,
        schoolContactName: headerData.schoolContactName,
        institutionContact: {
          name: institutionContact.name,
          phone: institutionContact.phone || '',
          email: institutionContact.email || '',
        },
        signatures,
        sessions,
        students,
        status: attendanceStatus,
        createdAt: existingDoc?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      
      // Update AttendanceSheet if it exists
      if (attendanceSheet && attendanceSheet.status === 'SENT_TO_INSTRUCTOR') {
        // Convert students to AttendanceSheet format
        const sheetStudents = students.map((s, idx) => ({
          no: s.number,
          name: s.name,
          id: s.id || `student-${idx}`,
        }))
        
        // Convert sessions to AttendanceSheet format
        const sheetSessions = sessions.map((session, idx) => {
          const attendanceByStudent: Record<string, number> = {}
          students.forEach((student, studentIdx) => {
            const attendance = student.sessionAttendances[idx] || 0
            attendanceByStudent[student.id || `student-${studentIdx}`] = attendance
          })
          
          return {
            sessionId: `session-${session.sessionNumber}`,
            sessionNo: session.sessionNumber,
            date: session.date,
            startTime: session.startTime,
            endTime: session.endTime,
            attendanceByStudent,
            totalAttendedSlots: session.attendanceCount,
          }
        })
        
        const updatedSheet: AttendanceSheet = {
          ...attendanceSheet,
          students: sheetStudents,
          sessions: sheetSessions,
          instructorId: userProfile?.userId || 'instructor-1',
          updatedBy: userProfile?.userId || 'instructor-1',
        }
        
        attendanceSheetStore.upsert(updatedSheet)
        setAttendanceSheet(updatedSheet)
      }
      
      const saveResult = upsertAttendanceDoc(docToSave)
      if (saveResult.success) {
        message.success('출석 정보가 저장되었습니다.')
        setIsEditMode(false)
      } else {
        message.error(saveResult.error || '저장 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('Save error:', error)
      message.error('저장 중 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!canSubmit()) {
      return
    }

    Modal.confirm({
      title: '제출 확인',
      content: '교육 출석부를 제출하시겠습니까? 제출 후에는 수정할 수 없습니다.',
      onOk: async () => {
        try {
          setLoading(true)
          
          // Format gradeClass from grade and className
          const gradeClass = formatGradeClass(headerData.grade, headerData.className)
          
          const docToSubmit: AttendanceDocument = {
            id: `attendance-${educationId}`,
            educationId: educationId!,
            assignmentId: assignment?.key,
            location: headerData.location,
            institution: headerData.institution,
            gradeClass,
            programName: headerData.programName,
            totalSessions: headerData.totalSessions,
            maleCount: headerData.maleCount,
            femaleCount: headerData.femaleCount,
            schoolContactName: headerData.schoolContactName,
            institutionContact: {
              name: institutionContact.name,
              phone: institutionContact.phone || '',
              email: institutionContact.email || '',
            },
            signatures,
            sessions,
            students,
            status: 'SUBMITTED',
            submittedAt: new Date().toISOString(),
            submittedBy: userProfile?.name || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          
          const submitResult = upsertAttendanceDoc(docToSubmit)
          if (submitResult.success) {
            setAttendanceStatus('SUBMITTED')
            message.success('제출되었습니다.')
            setIsEditMode(false)
          } else {
            message.error(submitResult.error || '제출 중 오류가 발생했습니다.')
          }
        } catch (error) {
          message.error('제출 중 오류가 발생했습니다.')
        } finally {
          setLoading(false)
        }
      },
    })
  }
  
  const handleInstitutionContactChange = (contact: InstitutionContact) => {
    setInstitutionContact(contact)
  }
  
  const handleSignatureApply = (role: 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor', signature: Signature) => {
    setSignatures(prev => ({
      ...prev,
      [role]: signature,
    }))
  }
  
  const handleSignatureDelete = (role: 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor') => {
    setSignatures(prev => {
      const updated = { ...prev }
      delete updated[role]
      return updated
    })
  }

  const handleCancel = () => {
    setIsEditMode(false)
  }

  const handleStudentAttendanceChange = (studentId: string, sessionIndex: number, value: number) => {
    setStudents(prevStudents => {
      const updated = prevStudents.map(student => {
        if (student.id === studentId && !student.isTransferred) {
          const newSessionAttendances = [...student.sessionAttendances]
          newSessionAttendances[sessionIndex] = value
          
          // Calculate completion status: 총 차시 = 8, 출석률 = (1회차 + 2회차) / 8 * 100
          const totalAttended = newSessionAttendances.reduce((sum, val) => sum + val, 0)
          const totalSessions = 8 // 총 차시 = 8
          const completionStatus = calculateCompletionStatus(totalAttended, totalSessions)
          
          return {
            ...student,
            sessionAttendances: newSessionAttendances,
            completionStatus,
          }
        }
        return student
      })
      return updated
    })
  }

  const handleAddStudent = () => {
    const maxNumber = students.length > 0 
      ? Math.max(...students.map(s => s.number))
      : 0
    
    const newStudentNumber = maxNumber + 1
    const sessionCount = sessions.length || 2
    
    // 성별은 번호에 따라 자동 설정 (홀수: 남, 짝수: 여)
    const gender: '남' | '여' = newStudentNumber % 2 === 1 ? '남' : '여'
    
    const newStudent: StudentAttendance = {
      id: `student-${Date.now()}`,
      number: newStudentNumber,
      name: '',
      gender,
      sessionAttendances: new Array(sessionCount).fill(0),
      completionStatus: 'X',
      isTransferred: false,
    }
    
    setStudents(prev => [...prev, newStudent])
    message.success('학생이 추가되었습니다.')
  }
  
  const handleSessionDataChange = useCallback((field: keyof SessionAttendance, sessionIndex: number, value: string | number | string[]) => {
    setSessions(prevSessions => {
      const updated = [...prevSessions]
      if (updated[sessionIndex]) {
        updated[sessionIndex] = {
          ...updated[sessionIndex],
          [field]: value,
        }
      }
      return updated
    })
  }, [])

  // Memoize session table data source
  const sessionTableDataSource = useMemo(() => {
    if (!sessions || sessions.length === 0) return []
    
    return [
      {
        key: 'dateTime',
        label: '강의날짜 및 시간',
        ...sessions.reduce((acc, session, index) => {
          acc[`session${index + 1}`] = session ? (
            isEditMode ? (
              <div className="space-y-2">
                <DatePicker
                  value={dayjs(session.date, 'YYYY-MM-DD').isValid() ? dayjs(session.date, 'YYYY-MM-DD') : dayjs(session.date)}
                  onChange={(date) => {
                    if (date) {
                      handleSessionDataChange('date', index, date.format('YYYY-MM-DD'))
                    }
                  }}
                  format="YYYY-MM-DD"
                  className="w-full"
                  placeholder="날짜 선택"
                />
                <div className="flex gap-1 items-center">
                  <Input
                    value={session.startTime}
                    onChange={(e) => handleSessionDataChange('startTime', index, e.target.value)}
                    className="w-full"
                    placeholder="시작시간"
                  />
                  <span>~</span>
                  <Input
                    value={session.endTime}
                    onChange={(e) => handleSessionDataChange('endTime', index, e.target.value)}
                    className="w-full"
                    placeholder="종료시간"
                  />
                </div>
              </div>
            ) : (
              (() => {
                const normalizedDate = session.date.replace(/\./g, '-')
                const d = dayjs(normalizedDate)
                const weekdays = ['일', '월', '화', '수', '목', '금', '토']
                const dateStr = d.isValid() ? `${d.month() + 1}.${d.date()}(${weekdays[d.day()]})` : session.date
                return `${dateStr}, ${session.startTime} ~ ${session.endTime}`
              })()
            )
          ) : '-'
          return acc
        }, {} as Record<string, any>),
      },
      {
        key: 'instructorType',
        label: '참여강사',
        subLabel: '강사구분',
        ...sessions.reduce((acc, session, index) => {
          acc[`session${index + 1}`] = session ? (
            <div className="space-y-2">
              <div className="text-sm">주강사</div>
              <div className="text-sm">보조강사</div>
            </div>
          ) : '-'
          return acc
        }, {} as Record<string, any>),
      },
      {
        key: 'instructorName',
        label: '',
        subLabel: '이름',
        ...sessions.reduce((acc, session, index) => {
          acc[`session${index + 1}`] = session ? (
            isEditMode ? (
              <div className="space-y-2">
                <Input
                  value={session.mainInstructor}
                  onChange={(e) => handleSessionDataChange('mainInstructor', index, e.target.value)}
                  className="w-full"
                  placeholder="주강사 이름"
                />
                <Input
                  value={session.assistantInstructor}
                  onChange={(e) => handleSessionDataChange('assistantInstructor', index, e.target.value)}
                  className="w-full"
                  placeholder="보조강사 이름"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm">{session.mainInstructor || '-'}</div>
                <div className="text-sm">{session.assistantInstructor || '-'}</div>
              </div>
            )
          ) : '-'
          return acc
        }, {} as Record<string, any>),
      },
      {
        key: 'sessions',
        label: '차시',
        ...sessions.reduce((acc, session, index) => {
          acc[`session${index + 1}`] = session ? (
            isEditMode ? (
              <InputNumber
                min={0}
                max={10}
                value={session.sessions}
                onChange={(val) => handleSessionDataChange('sessions', index, val || 0)}
                className="w-full"
              />
            ) : (
              session.sessions
            )
          ) : '-'
          return acc
        }, {} as Record<string, any>),
      },
      {
        key: 'studentCount',
        label: '학생정원',
        ...sessions.reduce((acc, session, index) => {
          acc[`session${index + 1}`] = session ? (
            isEditMode ? (
              <InputNumber
                min={0}
                value={session.studentCount}
                onChange={(val) => handleSessionDataChange('studentCount', index, val || 0)}
                className="w-full"
              />
            ) : (
              session.studentCount
            )
          ) : '-'
          return acc
        }, {} as Record<string, any>),
      },
      {
        key: 'attendanceCount',
        label: '출석인원',
        ...sessions.reduce((acc, session, index) => {
          acc[`session${index + 1}`] = session ? (
            isEditMode ? (
              <InputNumber
                min={0}
                value={session.attendanceCount}
                onChange={(val) => handleSessionDataChange('attendanceCount', index, val || 0)}
                className="w-full"
              />
            ) : (
              session.attendanceCount
            )
          ) : '-'
          return acc
        }, {} as Record<string, any>),
      },
    ]
  }, [sessions, isEditMode, handleSessionDataChange, signatures])

  const handleBack = () => {
    router.back()
  }

  // Calculate statistics
  const totalStudents = students.filter(s => !s.isTransferred).length
  const completedStudents = students.filter(s => s.completionStatus === 'O' && !s.isTransferred).length
  const maleStudents = headerData.maleCount
  const femaleStudents = headerData.femaleCount
  const completionRate = totalStudents > 0 ? Math.round((completedStudents / totalStudents) * 100) : 0

  // Memoize columns to prevent errors when sessions is empty
  const columns: ColumnsType<StudentAttendance> = useMemo(() => [
    {
      title: '출석번호',
      dataIndex: 'number',
      key: 'number',
      width: 80,
      align: 'center',
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string, record) => (
        isEditMode ? (
          <Input
            value={text}
            onChange={(e) => {
              const updated = students.map(s => s.id === record.id ? { ...s, name: e.target.value } : s)
              setStudents(updated)
            }}
            className="w-full"
          />
        ) : (
          <span className="text-sm">{text}</span>
        )
      ),
    },
    {
      title: '성별',
      dataIndex: 'gender',
      key: 'gender',
      width: 80,
      align: 'center',
      render: (gender: '남' | '여') => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
          gender === '남' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
        }`}>
          {gender}
        </span>
      ),
    },
      ...(sessions && sessions.length > 0 ? sessions.map((session, index) => ({
      title: `${session.sessionNumber}회차`,
      key: `session-${index}`,
      align: 'center' as const,
      width: 120,
      render: (_: any, record: StudentAttendance) => {
        const value = record.sessionAttendances[index] || 0
        if (record.isTransferred) {
          return <span className="text-sm text-gray-400">-</span>
        }
        return isEditMode ? (
          <InputNumber
            min={0}
            max={4}
            value={value}
            onChange={(val) => handleStudentAttendanceChange(record.id, index, val || 0)}
            className="w-full"
            disabled={record.isTransferred}
          />
        ) : (
          <span className="text-sm font-medium">{value}</span>
        )
      },
    })) : []),
    {
      title: '수료여부',
      key: 'completion',
      align: 'center',
      width: 100,
      render: (_, record) => {
        if (record.isTransferred) {
          return <span className="text-sm text-gray-400">-</span>
        }
        return (
          <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-base font-bold ${
            record.completionStatus === 'O' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
          }`}>
            {record.completionStatus}
          </span>
        )
      },
    },
  ], [sessions, students, isEditMode])

  if (!assignment) {
    return (
      <ProtectedRoute requiredRole="instructor">
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
          <Card>
            <p className="text-center text-gray-500">교육 정보를 찾을 수 없습니다.</p>
          </Card>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute requiredRole={['instructor', 'admin']}>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={handleBack}
                  className="flex items-center dark:text-gray-300"
                >
                  돌아가기
                </Button>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    2025 소프트웨어(SW) 미래채움 – 교육 출석부
                  </h1>
                  <Tooltip
                    title={
                      <div className="text-sm">
                        <div className="font-semibold mb-1">출석부 작성 가이드</div>
                        <div className="space-y-1">
                          <div>• 수업 전: 강사가 학교에 학생 명단 요청</div>
                          <div>• 학교 교사: 수업 전 기본 정보 및 학생 명단 입력</div>
                          <div>• 수업 중: 보조강사가 출석 체크 (실시간 또는 수업 후 입력 가능)</div>
                          <div>• 출석률: 총 차시의 80% 이상 출석 시 수료</div>
                          <div>• 서명: 학교 교사, 주강사, 보조강사 서명 필요</div>
                        </div>
                      </div>
                    }
                    placement="right"
                  >
                    <Info className="w-5 h-5 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
                  </Tooltip>
                </div>
              </div>
              <Space>
                {!isEditMode ? (
                  <>
                    {/* Admin can always edit */}
                    {isAdmin && (
                      <Button
                        type="primary"
                        icon={<Edit className="w-4 h-4" />}
                        onClick={() => setIsEditMode(true)}
                      >
                        수정하기
                      </Button>
                    )}
                    {/* Instructor actions */}
                    {!isAdmin && (
                      <>
                        {attendanceStatus === 'DRAFT' && (
                          <>
                            <Button
                              type="primary"
                              icon={<Edit className="w-4 h-4" />}
                              onClick={() => setIsEditMode(true)}
                            >
                              수정하기
                            </Button>
                            <Button
                              type="primary"
                              onClick={handleSubmit}
                              loading={loading}
                              style={{ background: '#10b981', borderColor: '#10b981' }}
                            >
                              제출하기
                            </Button>
                          </>
                        )}
                        {attendanceStatus === 'SUBMITTED' && (
                          <span className="text-blue-600 font-medium">제출 완료 (승인 대기 중)</span>
                        )}
                        {attendanceStatus === 'APPROVED' && (
                          <span className="text-green-600 font-medium">승인 완료</span>
                        )}
                        {attendanceStatus === 'REJECTED' && (
                          <>
                            <span className="text-red-600 font-medium mr-2">반려됨</span>
                            <Button
                              type="primary"
                              icon={<Edit className="w-4 h-4" />}
                              onClick={() => setIsEditMode(true)}
                            >
                              수정하기
                            </Button>
                          </>
                        )}
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <Button onClick={handleCancel} className="dark:text-gray-300">
                      취소
                    </Button>
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      저장하기
                    </Button>
                  </>
                )}
              </Space>
            </div>
          </div>
        </div>

        {/* Submitted banner */}
        {attendanceStatus === 'SUBMITTED' && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  제출 완료 (승인 대기 중)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Reject reason banner */}
        {attendanceStatus === 'REJECTED' && attendanceSheet?.adminReview?.reason && (
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-red-900 dark:text-red-100 mb-1">반려 사유</div>
                  <div className="text-sm text-red-700 dark:text-red-300">{attendanceSheet.adminReview.reason}</div>
                  {attendanceSheet.adminReview.reviewedAt && (
                    <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                      반려일시: {dayjs(attendanceSheet.adminReview.reviewedAt).format('YYYY-MM-DD HH:mm')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Teacher Education Info Alert */}
          {teacherEducationInfo && (
            <Card className="mb-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-blue-900 dark:text-blue-100">
                    학교 선생님이 입력한 교육 정보가 자동으로 불러와졌습니다.
                  </span>
                </div>
              </div>
            </Card>
          )}

          {/* Request Info Button */}
          {!teacherEducationInfo && !isAdmin && (
            <Card className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-medium text-yellow-900 dark:text-yellow-100">
                    학교 선생님의 교육 정보가 아직 입력되지 않았습니다.
                  </span>
                </div>
                <Button
                  type="primary"
                  onClick={() => setRequestModalVisible(true)}
                >
                  출석부 정보 요청
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 1: Header (교육 정보) */}
          <DetailSectionCard title="교육 정보" className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">출석부 코드</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {attendanceSheet?.attendanceId || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">프로그램명</div>
                {isEditMode ? (
                  <Input
                    value={attendanceSheet?.programName || headerData.programName}
                    onChange={(e) => {
                      const programName = e.target.value
                      setHeaderData({ ...headerData, programName })
                      if (attendanceSheet) {
                        const updated = { ...attendanceSheet, programName }
                        attendanceSheetStore.upsert(updated)
                        setAttendanceSheet(updated)
                      }
                    }}
                    className="w-full"
                    placeholder="프로그램명"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {attendanceSheet?.programName || headerData.programName || '-'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">기관명</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {attendanceSheet?.institutionName || headerData.institution || '-'}
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  학년
                  {teacherEducationInfo && (
                    <span className="ml-2 text-xs text-blue-600">(학교 입력)</span>
                  )}
                </div>
                {isEditMode ? (
                  <Input
                    value={attendanceSheet?.teacherInfo?.grade || headerData.grade}
                    onChange={(e) => {
                      const grade = e.target.value
                      setHeaderData({ 
                        ...headerData, 
                        grade,
                        gradeClass: formatGradeClass(grade, attendanceSheet?.teacherInfo?.className || headerData.className)
                      })
                      if (attendanceSheet) {
                        const updated = {
                          ...attendanceSheet,
                          teacherInfo: {
                            ...attendanceSheet.teacherInfo,
                            grade,
                          }
                        }
                        attendanceSheetStore.upsert(updated)
                        setAttendanceSheet(updated)
                      }
                    }}
                    className="w-full"
                    disabled={!!teacherEducationInfo}
                    title={teacherEducationInfo ? '학교 선생님이 입력한 정보는 수정할 수 없습니다.' : ''}
                    placeholder="학년"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {attendanceSheet?.teacherInfo?.grade || headerData.grade || '-'}학년
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">
                  반
                  {teacherEducationInfo && (
                    <span className="ml-2 text-xs text-blue-600">(학교 입력)</span>
                  )}
                </div>
                {isEditMode ? (
                  <Input
                    value={attendanceSheet?.teacherInfo?.className || headerData.className}
                    onChange={(e) => {
                      const className = e.target.value
                      setHeaderData({ 
                        ...headerData, 
                        className,
                        gradeClass: formatGradeClass(attendanceSheet?.teacherInfo?.grade || headerData.grade, className)
                      })
                      if (attendanceSheet) {
                        const updated = {
                          ...attendanceSheet,
                          teacherInfo: {
                            ...attendanceSheet.teacherInfo,
                            className,
                          }
                        }
                        attendanceSheetStore.upsert(updated)
                        setAttendanceSheet(updated)
                      }
                    }}
                    className="w-full"
                    disabled={!!teacherEducationInfo}
                    title={teacherEducationInfo ? '학교 선생님이 입력한 정보는 수정할 수 없습니다.' : ''}
                    placeholder="반"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {attendanceSheet?.teacherInfo?.className || headerData.className || '-'}반
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">교육신청인원</div>
                <div className="text-base font-medium text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded">
                  {attendanceSheet?.students?.length || students.length || 0}명
                </div>
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 이름</div>
                {isEditMode ? (
                  <Input
                    value={attendanceSheet?.teacherInfo?.teacherName || institutionContact.name || headerData.schoolContactName}
                    onChange={(e) => {
                      const teacherName = e.target.value
                      setHeaderData({ ...headerData, schoolContactName: teacherName })
                      setInstitutionContact(prev => ({ ...prev, name: teacherName }))
                      if (attendanceSheet) {
                        const updated = {
                          ...attendanceSheet,
                          teacherInfo: {
                            ...attendanceSheet.teacherInfo,
                            teacherName,
                          }
                        }
                        attendanceSheetStore.upsert(updated)
                        setAttendanceSheet(updated)
                      }
                    }}
                    className="w-full"
                    placeholder="담임 선생님 이름"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {attendanceSheet?.teacherInfo?.teacherName || institutionContact.name || headerData.schoolContactName || '-'}
                  </div>
                )}
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">담임/담당자 연락처</div>
                {isEditMode ? (
                  <Input
                    value={attendanceSheet?.teacherInfo?.teacherContact || institutionContact.phone || ''}
                    onChange={(e) => {
                      const teacherContact = e.target.value
                      setInstitutionContact(prev => ({ ...prev, phone: teacherContact }))
                      if (attendanceSheet) {
                        const updated = {
                          ...attendanceSheet,
                          teacherInfo: {
                            ...attendanceSheet.teacherInfo,
                            teacherContact,
                          }
                        }
                        attendanceSheetStore.upsert(updated)
                        setAttendanceSheet(updated)
                      }
                    }}
                    className="w-full"
                    placeholder="010-1234-5678"
                  />
                ) : (
                  <div className="text-base font-medium text-gray-900 dark:text-gray-100">
                    {attendanceSheet?.teacherInfo?.teacherContact || institutionContact.phone || '-'}
                  </div>
                )}
              </div>
            </div>
            
            {/* 학교 담당자 서명 - 교육 정보 섹션 내부 */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">학교 담당자 서명</div>
              <div className="max-w-xs">
                {signatures.school ? (
                  <div className="space-y-2">
                    <div className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 p-2 flex items-center justify-center min-h-[80px]">
                      <img
                        src={signatures.school.signatureImageUrl}
                        alt="학교 담당자 서명"
                        className="max-w-[200px] max-h-[80px] object-contain"
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      {dayjs(signatures.school.signedAt).format('YYYY-MM-DD HH:mm')}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                      {signatures.school.signedByUserName}
                    </div>
                    {isEditMode && (userRole === 'admin' || signatures.school.signedByUserId === userProfile?.userId) && (
                      <Button
                        size="small"
                        danger
                        icon={<X className="w-3 h-3" />}
                        onClick={() => handleSignatureDelete('school')}
                        className="w-full mt-2"
                      >
                        삭제
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center min-h-[80px]">
                      <span className="text-sm text-gray-400 dark:text-gray-500">서명 없음</span>
                    </div>
                    {isEditMode && userRole === 'admin' && (
                      <Button
                        size="small"
                        type="default"
                        icon={<Edit className="w-3 h-3" />}
                        onClick={() => {
                          setSchoolSignatureModalVisible(true)
                          setSchoolSignatureUrl('')
                          setSchoolSignatureName('')
                        }}
                        className="w-full"
                      >
                        서명 선택/적용
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </DetailSectionCard>

          {/* 학교 담당자 서명 선택 모달 */}
          <Modal
            title="학교 담당자 서명 선택"
            open={schoolSignatureModalVisible}
            onOk={() => {
              if (!schoolSignatureUrl) {
                message.warning('서명 이미지를 선택해주세요.')
                return
              }
              if (!schoolSignatureName) {
                message.warning('서명자 이름을 입력해주세요.')
                return
              }
              const signature: Signature = {
                signedByUserId: userProfile?.userId || 'admin-1',
                signedByUserName: schoolSignatureName,
                signedAt: dayjs().toISOString(),
                signatureImageUrl: schoolSignatureUrl,
              }
              handleSignatureApply('school', signature)
              setSchoolSignatureModalVisible(false)
              setSchoolSignatureUrl('')
              setSchoolSignatureName('')
              message.success('서명이 적용되었습니다.')
            }}
            onCancel={() => {
              setSchoolSignatureModalVisible(false)
              setSchoolSignatureUrl('')
              setSchoolSignatureName('')
            }}
            okText="적용"
            cancelText="취소"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                서명 이미지를 선택하거나 업로드하세요.
              </p>
              
              {/* 서명 이미지 미리보기 */}
              {schoolSignatureUrl && (
                <div className="border border-gray-300 dark:border-gray-600 rounded p-4 flex flex-col items-center justify-center">
                  <img
                    src={schoolSignatureUrl}
                    alt="선택된 서명"
                    className="max-w-[200px] max-h-[80px] object-contain mb-2"
                  />
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    선택된 서명 미리보기
                  </div>
                </div>
              )}

              {/* 서명자 이름 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  서명자 이름 <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="학교 담당자 이름을 입력하세요"
                  value={schoolSignatureName}
                  onChange={(e) => setSchoolSignatureName(e.target.value)}
                />
              </div>

              {/* 내 서명 사용 버튼 */}
              {userProfile?.signatureImageUrl && (
                <Button
                  onClick={() => {
                    setSchoolSignatureUrl(userProfile.signatureImageUrl || '')
                    setSchoolSignatureName(userProfile.name || '')
                  }}
                  className="w-full"
                  type={schoolSignatureUrl === userProfile.signatureImageUrl ? 'primary' : 'default'}
                >
                  내 서명 사용 ({userProfile.name})
                </Button>
              )}

              {/* 서명 이미지 업로드 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  서명 이미지 업로드
                </label>
                <Upload
                  beforeUpload={(file) => {
                    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
                    if (!isJpgOrPng) {
                      message.error('JPG/PNG 파일만 업로드 가능합니다!')
                      return false
                    }
                    const isLt2M = file.size / 1024 / 1024 < 2
                    if (!isLt2M) {
                      message.error('이미지 크기는 2MB 미만이어야 합니다!')
                      return false
                    }

                    const reader = new FileReader()
                    reader.onload = (e) => {
                      const result = e.target?.result as string
                      setSchoolSignatureUrl(result)
                    }
                    reader.readAsDataURL(file)
                    return false
                  }}
                  accept=".png,.jpg,.jpeg"
                  maxCount={1}
                  onRemove={() => {
                    setSchoolSignatureUrl('')
                  }}
                >
                  <Button icon={<UploadOutlined />} className="w-full">
                    서명 이미지 업로드 (JPG/PNG, 최대 2MB)
                  </Button>
                </Upload>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  다른 사람의 서명을 업로드할 수 있습니다.
                </p>
              </div>
            </div>
          </Modal>

          {/* Request Attendance Info Modal */}
          <Modal
            title="출석부 정보 요청"
            open={requestModalVisible}
            onOk={handleRequestAttendanceInfo}
            onCancel={() => {
              setRequestModalVisible(false)
              setRequestMessage('')
            }}
            okText="요청 전송"
            cancelText="취소"
          >
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                학교 선생님에게 출석부 정보 입력을 요청합니다. 요청 후 선생님의 요청함에 알림이 전송됩니다.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  요청 메시지 (선택)
                </label>
                <Input.TextArea
                  rows={4}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="출석부 정보 입력을 요청드립니다."
                />
              </div>
            </div>
          </Modal>

          {/* 기본 정보 */}
          <DetailSectionCard title="기본 정보" className="mb-6">
            <EducationBasicInfoForm
              data={{
                className: headerData.gradeClass,
                regionCity: headerData.location,
                startDate: '',
                endDate: '',
                totalSessions: headerData.totalSessions,
                expectedStudents: headerData.maleCount + headerData.femaleCount,
                educationType: '',
                institutionType: '',
                targetLevel: '',
                learningTech: '',
                textbook: '',
                담당자명: headerData.schoolContactName,
                담당자연락처: '',
              }}
              isEditable={isEditMode}
              isAdmin={isAdmin}
              onChange={(field, value) => {
                if (field === 'className') {
                  const match = value.match(/(\d+)학년\s*(\d+)반/)
                  if (match) {
                    setHeaderData({ ...headerData, gradeClass: value, grade: match[1], className: match[2] })
                  }
                } else if (field === 'regionCity') {
                  setHeaderData({ ...headerData, location: value })
                } else if (field === 'totalSessions') {
                  setHeaderData({ ...headerData, totalSessions: value })
                } else if (field === 'expectedStudents') {
                  const total = value
                  const maleCount = Math.floor(total / 2)
                  const femaleCount = total - maleCount
                  setHeaderData({ ...headerData, maleCount, femaleCount })
                } else if (field === '담당자명') {
                  setHeaderData({ ...headerData, schoolContactName: value })
                }
              }}
            />
          </DetailSectionCard>

          {/* SECTION 2: 회차별 수업 정보 - 가로형 테이블 */}
          {sessions && sessions.length > 0 && (
            <DetailSectionCard title="회차별 수업 정보" className="mb-6">
              <Table
                columns={[
                  {
                    title: '구분',
                    dataIndex: 'label',
                    key: 'label',
                    width: 120,
                    render: (text: string, record: any) => {
                      if (record.subLabel) {
                        return (
                          <div>
                            <div className="font-semibold text-gray-700 dark:text-gray-300">{text || ''}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{record.subLabel}</div>
                          </div>
                        )
                      }
                      return <span className="font-semibold text-gray-700 dark:text-gray-300">{text}</span>
                    },
                  },
                  ...sessions.map((session, index) => ({
                    title: `${session.sessionNumber}회차`,
                    key: `session${index}`,
                    width: 200,
                    align: 'center' as const,
                    render: (_: any, record: any) => record[`session${index + 1}`],
                  })),
                ]}
                dataSource={sessionTableDataSource}
                rowKey="key"
                pagination={false}
                components={{
                  body: {
                    row: (props: any) => {
                      // 참여강사 관련 행들은 병합된 것처럼 보이도록 처리
                      const isInstructorRow = ['instructorType', 'instructorName', 'instructorSignature'].includes(props['data-row-key'])
                      return (
                        <tr {...props} className={isInstructorRow ? 'border-b-0' : ''} />
                      )
                    },
                  },
                }}
              />
            </DetailSectionCard>
          )}

          {/* 서명 영역 - 회차별 수업 정보 카드 바로 아래 */}
          <div className="mb-6">
            <InstitutionContactAndSignatures
              institutionContact={institutionContact}
              signatures={signatures}
              session1MainInstructorName={sessions[0]?.mainInstructor || '박정아'}
              session1AssistantInstructorName={sessions[0]?.assistantInstructor || '김윤미'}
              session2MainInstructorName={sessions[1]?.mainInstructor || '박정아'}
              session2AssistantInstructorName={sessions[1]?.assistantInstructor || '김윤미'}
              isEditMode={isEditMode}
              onInstitutionContactChange={handleInstitutionContactChange}
              onSignatureApply={handleSignatureApply}
              onSignatureDelete={handleSignatureDelete}
            />
          </div>

          {/* SECTION 3: 출석부 테이블 */}
          <DetailSectionCard title="학생별 출석 현황" className="mt-6">
            <div className="mb-4 flex items-center justify-between flex-wrap gap-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  <strong>※ 수료기준 :</strong> 학생 당 출석률 80% 이상
                </p>
              </div>
              {isEditMode && (
                <Button
                  type="primary"
                  icon={<UserPlus className="w-4 h-4" />}
                  onClick={handleAddStudent}
                  className="flex items-center"
                >
                  학생 추가
                </Button>
              )}
            </div>
            <Table
              columns={columns}
              dataSource={students}
              rowKey="id"
              pagination={{
                pageSize: 50,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}명`,
              }}
              scroll={{ x: 'max-content' }}
            />
          </DetailSectionCard>

          {/* Statistics Summary */}
          <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalStudents}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">전체 학생 수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">{completedStudents}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">수료 학생 수</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-500 dark:text-blue-400">{completionRate}%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">수료율</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{maleStudents} / {femaleStudents}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">남 / 여</div>
              </div>
            </div>
          </Card>

        </div>
      </div>
    </ProtectedRoute>
  )
}

