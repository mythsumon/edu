// Initialize example equipment confirmation documents for testing
import { upsertDoc } from './storage'
import { EquipmentConfirmationDoc } from './types'
import { instructorCourses } from '@/mock/instructorDashboardData'

export function initExampleEquipmentDocs() {
  if (typeof window === 'undefined') return

  // Check if example data already exists
  const existingDocs = JSON.parse(localStorage.getItem('equipment_confirmation_docs') || '[]')
  if (existingDocs.length >= 10) {
    console.log('Example equipment docs already exist')
    return
  }

  // Generate 10 example documents based on instructorCourses
  const exampleDocs: EquipmentConfirmationDoc[] = []

  for (let i = 0; i < Math.min(10, instructorCourses.length); i++) {
    const course = instructorCourses[i]
    const now = new Date()
    const daysAgo = i * 2
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000).toISOString()
    
    const statuses: Array<'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED'> = ['DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED', 'BORROWED', 'RETURNED']
    const status = statuses[i % 6]
    
    const startDate = new Date(course.startDate)
    const endDate = new Date(course.endDate)
    const month = startDate.getMonth() + 1
    const day = startDate.getDate()
    
    const doc: EquipmentConfirmationDoc = {
      id: `equipment-${i + 1}`,
      materialName: course.educationName,
      organizationName: course.institutionName,
      lectureDateText: `25. ${String(month).padStart(2, '0')}. ${String(day).padStart(2, '0')}.`,
      sessionsText: `${8 + (i % 4)}차시 / ${8 + (i % 4)}차시`,
      studentCount: 20 + (i % 10),
      instructorsText: '홍길동 / 이보조',
      borrowerName: '홍길동',
      plannedReturnerName: '홍길동',
      schedule: {
        plannedBorrowText: `${month}월 ${day}일 08시`,
        plannedReturnText: `${endDate.getMonth() + 1}월 ${endDate.getDate()}일 18시`,
        plannedBorrowDate: course.startDate,
        plannedReturnDate: course.endDate,
      },
      items: [
        { id: `item-${i}-1`, name: '노트북', quantity: 20 + (i % 10) },
        { id: `item-${i}-2`, name: '프로젝터', quantity: 1 },
        ...(i % 2 === 0 ? [{ id: `item-${i}-3`, name: '마이크', quantity: 2 }] : []),
      ],
      returnConditionOk: i < 5 ? 'Y' : 'N',
      allowanceTarget: i < 3 ? 'Y' : 'N',
      createdByName: '홍길동',
      equipmentManagerName: i < 5 ? `김관리${i + 1}` : '',
      actualReturnerName: i < 5 ? '홍길동' : '',
      signatures: i < 5 ? {
        borrower: {
          signedByUserId: 'instructor-1',
          signedByUserName: '홍길동',
          signedAt: createdAt,
          signatureImageUrl: '/api/placeholder/200/80',
        },
        manager: {
          signedByUserId: `manager-${i + 1}`,
          signedByUserName: `김관리${i + 1}`,
          signedAt: createdAt,
          signatureImageUrl: '/api/placeholder/200/80',
        },
      } : {},
      attachments: [],
      educationId: course.id,
      status,
      ...(status !== 'DRAFT' ? {
        submittedAt: createdAt,
        submittedBy: '홍길동',
      } : {}),
      ...(status === 'APPROVED' || status === 'BORROWED' || status === 'RETURNED' ? {
        approvedAt: new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        approvedBy: '관리자',
      } : {}),
      ...(status === 'REJECTED' ? {
        rejectedAt: new Date(new Date(createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
        rejectedBy: '관리자',
        rejectReason: '서명이 누락되었습니다.',
      } : {}),
      createdAt,
      updatedAt: createdAt,
    }
    
    exampleDocs.push(doc)
  }

  // Save example documents
  try {
    exampleDocs.forEach(doc => upsertDoc(doc))
    console.log(`Example equipment documents initialized (${exampleDocs.length} documents)`)
  } catch (error) {
    console.error('Failed to save some example documents:', error)
  }
}
