import { EvidenceDoc } from './types'

const STORAGE_KEY = 'evidence_docs'

function getDummyEvidenceDocs(): EvidenceDoc[] {
  const now = new Date().toISOString()
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
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
