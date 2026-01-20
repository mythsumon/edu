import { EvidenceDoc } from './types'

const STORAGE_KEY = 'evidence_docs'

function getDummyEvidenceDocs(): EvidenceDoc[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  return [
    {
      id: 'evidence-1',
      educationId: '1',
      educationName: '블록코딩 기초 프로그램',
      institutionName: '서울초등학교',
      instructorName: '홍길동',
      assistantInstructorName: '김보조',
      items: [
        {
          id: 'item-1',
          fileUrl: '/mock/evidence/evidence1.jpg',
          fileName: '증빙자료1.jpg',
          fileSize: 1024000,
          uploadedAt: weekAgo,
          uploadedBy: '김보조',
        },
        {
          id: 'item-2',
          fileUrl: '/mock/evidence/evidence2.jpg',
          fileName: '증빙자료2.jpg',
          fileSize: 1024000,
          uploadedAt: weekAgo,
          uploadedBy: '김보조',
        },
        {
          id: 'item-3',
          fileUrl: '/mock/evidence/evidence3.jpg',
          fileName: '증빙자료3.jpg',
          fileSize: 1024000,
          uploadedAt: weekAgo,
          uploadedBy: '김보조',
        },
        {
          id: 'item-4',
          fileUrl: '/mock/evidence/evidence4.jpg',
          fileName: '증빙자료4.jpg',
          fileSize: 1024000,
          uploadedAt: weekAgo,
          uploadedBy: '김보조',
        },
        {
          id: 'item-5',
          fileUrl: '/mock/evidence/evidence5.jpg',
          fileName: '증빙자료5.jpg',
          fileSize: 1024000,
          uploadedAt: weekAgo,
          uploadedBy: '김보조',
        },
      ],
      status: 'SUBMITTED',
      submittedAt: weekAgo,
      submittedBy: '김보조',
      createdAt: weekAgo,
      updatedAt: weekAgo,
    },
    {
      id: 'evidence-2',
      educationId: '2',
      educationName: 'AI 체험 워크숍',
      institutionName: '경기중학교',
      instructorName: '홍길동',
      assistantInstructorName: '이보조',
      items: [
        {
          id: 'item-6',
          fileUrl: '/mock/evidence/evidence6.jpg',
          fileName: '증빙자료1.jpg',
          fileSize: 1024000,
          uploadedAt: yesterday,
          uploadedBy: '이보조',
        },
        {
          id: 'item-7',
          fileUrl: '/mock/evidence/evidence7.jpg',
          fileName: '증빙자료2.jpg',
          fileSize: 1024000,
          uploadedAt: yesterday,
          uploadedBy: '이보조',
        },
      ],
      status: 'DRAFT',
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: 'evidence-3',
      educationId: '3',
      educationName: '로봇 제어 실습',
      institutionName: '인천고등학교',
      instructorName: '박강사',
      assistantInstructorName: '최보조',
      items: [
        {
          id: 'item-8',
          fileUrl: '/mock/evidence/evidence8.jpg',
          fileName: '증빙자료1.jpg',
          fileSize: 1024000,
          uploadedAt: threeDaysAgo,
          uploadedBy: '최보조',
        },
        {
          id: 'item-9',
          fileUrl: '/mock/evidence/evidence9.jpg',
          fileName: '증빙자료2.jpg',
          fileSize: 1024000,
          uploadedAt: threeDaysAgo,
          uploadedBy: '최보조',
        },
        {
          id: 'item-10',
          fileUrl: '/mock/evidence/evidence10.jpg',
          fileName: '증빙자료3.jpg',
          fileSize: 1024000,
          uploadedAt: threeDaysAgo,
          uploadedBy: '최보조',
        },
        {
          id: 'item-11',
          fileUrl: '/mock/evidence/evidence11.jpg',
          fileName: '증빙자료4.jpg',
          fileSize: 1024000,
          uploadedAt: threeDaysAgo,
          uploadedBy: '최보조',
        },
        {
          id: 'item-12',
          fileUrl: '/mock/evidence/evidence12.jpg',
          fileName: '증빙자료5.jpg',
          fileSize: 1024000,
          uploadedAt: threeDaysAgo,
          uploadedBy: '최보조',
        },
      ],
      status: 'SUBMITTED',
      submittedAt: threeDaysAgo,
      submittedBy: '최보조',
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    },
    {
      id: 'evidence-4',
      educationId: '4',
      educationName: '3D 프린팅 창의교육',
      institutionName: '부산중학교',
      instructorName: '정강사',
      assistantInstructorName: '강보조',
      items: [
        {
          id: 'item-13',
          fileUrl: '/mock/evidence/evidence13.jpg',
          fileName: '증빙자료1.jpg',
          fileSize: 1024000,
          uploadedAt: twoDaysAgo,
          uploadedBy: '강보조',
        },
        {
          id: 'item-14',
          fileUrl: '/mock/evidence/evidence14.jpg',
          fileName: '증빙자료2.jpg',
          fileSize: 1024000,
          uploadedAt: twoDaysAgo,
          uploadedBy: '강보조',
        },
        {
          id: 'item-15',
          fileUrl: '/mock/evidence/evidence15.jpg',
          fileName: '증빙자료3.jpg',
          fileSize: 1024000,
          uploadedAt: twoDaysAgo,
          uploadedBy: '강보조',
        },
      ],
      status: 'SUBMITTED',
      submittedAt: twoDaysAgo,
      submittedBy: '강보조',
      createdAt: twoDaysAgo,
      updatedAt: twoDaysAgo,
    },
    {
      id: 'evidence-5',
      educationId: '5',
      educationName: '드론 조종 체험',
      institutionName: '대전초등학교',
      instructorName: '윤강사',
      assistantInstructorName: '송보조',
      items: [
        {
          id: 'item-16',
          fileUrl: '/mock/evidence/evidence16.jpg',
          fileName: '증빙자료1.jpg',
          fileSize: 1024000,
          uploadedAt: yesterday,
          uploadedBy: '송보조',
        },
        {
          id: 'item-17',
          fileUrl: '/mock/evidence/evidence17.jpg',
          fileName: '증빙자료2.jpg',
          fileSize: 1024000,
          uploadedAt: yesterday,
          uploadedBy: '송보조',
        },
        {
          id: 'item-18',
          fileUrl: '/mock/evidence/evidence18.jpg',
          fileName: '증빙자료3.jpg',
          fileSize: 1024000,
          uploadedAt: yesterday,
          uploadedBy: '송보조',
        },
        {
          id: 'item-19',
          fileUrl: '/mock/evidence/evidence19.jpg',
          fileName: '증빙자료4.jpg',
          fileSize: 1024000,
          uploadedAt: yesterday,
          uploadedBy: '송보조',
        },
      ],
      status: 'SUBMITTED',
      submittedAt: yesterday,
      submittedBy: '송보조',
      createdAt: yesterday,
      updatedAt: yesterday,
    },
    {
      id: 'evidence-6',
      educationId: '6',
      educationName: '스마트팜 IoT 교육',
      institutionName: '광주고등학교',
      instructorName: '임강사',
      assistantInstructorName: '한보조',
      items: [
        {
          id: 'item-20',
          fileUrl: '/mock/evidence/evidence20.jpg',
          fileName: '증빙자료1.jpg',
          fileSize: 1024000,
          uploadedAt: now,
          uploadedBy: '한보조',
        },
        {
          id: 'item-21',
          fileUrl: '/mock/evidence/evidence21.jpg',
          fileName: '증빙자료2.jpg',
          fileSize: 1024000,
          uploadedAt: now,
          uploadedBy: '한보조',
        },
        {
          id: 'item-22',
          fileUrl: '/mock/evidence/evidence22.jpg',
          fileName: '증빙자료3.jpg',
          fileSize: 1024000,
          uploadedAt: now,
          uploadedBy: '한보조',
        },
        {
          id: 'item-23',
          fileUrl: '/mock/evidence/evidence23.jpg',
          fileName: '증빙자료4.jpg',
          fileSize: 1024000,
          uploadedAt: now,
          uploadedBy: '한보조',
        },
        {
          id: 'item-24',
          fileUrl: '/mock/evidence/evidence24.jpg',
          fileName: '증빙자료5.jpg',
          fileSize: 1024000,
          uploadedAt: now,
          uploadedBy: '한보조',
        },
      ],
      status: 'SUBMITTED',
      submittedAt: now,
      submittedBy: '한보조',
      createdAt: now,
      updatedAt: now,
    },
  ]
}

export function getEvidenceDocs(): EvidenceDoc[] {
  if (typeof window === 'undefined') return []
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
    
    // Initialize with dummy data if empty
    const dummy = getDummyEvidenceDocs()
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dummy))
    return dummy
  } catch (error) {
    console.error('Failed to load evidence docs:', error)
    return []
  }
}

export function getEvidenceDocById(id: string): EvidenceDoc | undefined {
  const docs = getEvidenceDocs()
  return docs.find(doc => doc.id === id)
}

export function getEvidenceDocByEducationId(educationId: string): EvidenceDoc | undefined {
  const docs = getEvidenceDocs()
  return docs.find(doc => doc.educationId === educationId)
}

export function upsertEvidenceDoc(doc: EvidenceDoc): void {
  if (typeof window === 'undefined') return
  
  try {
    const docs = getEvidenceDocs()
    const index = docs.findIndex(d => d.id === doc.id)
    
    if (index >= 0) {
      docs[index] = { ...doc, updatedAt: new Date().toISOString() }
    } else {
      docs.push({ ...doc, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
    
    // Trigger custom event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('evidenceUpdated'))
    }
  } catch (error) {
    console.error('Failed to save evidence doc:', error)
    throw error
  }
}

export function deleteEvidenceDoc(id: string): void {
  if (typeof window === 'undefined') return
  
  try {
    const docs = getEvidenceDocs()
    const filtered = docs.filter(doc => doc.id !== id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
    
    // Trigger custom event for real-time updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('evidenceUpdated'))
    }
  } catch (error) {
    console.error('Failed to delete evidence doc:', error)
    throw error
  }
}
