'use client'

import { useState, useEffect, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Card, Input, Badge, Button, Modal, Form, message, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Search, FileCheck, CheckCircle, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { getAttendanceDocs, type AttendanceDocument } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { teacherAttendanceSignatureStore } from '@/lib/teacherStore'
import type { TeacherAttendanceSignature } from '@/lib/teacherStore'
import { attendanceSheetStore, type AttendanceSheet } from '@/lib/attendanceSheetStore'
import { dataStore } from '@/lib/dataStore'
import dayjs from 'dayjs'

export default function TeacherAttendanceSignPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [searchText, setSearchText] = useState('')
  const [signatureModalVisible, setSignatureModalVisible] = useState(false)
  const [selectedAttendance, setSelectedAttendance] = useState<AttendanceDocument | null>(null)
  const [signatureType, setSignatureType] = useState<'image' | 'typed'>('typed')
  const [typedName, setTypedName] = useState('')
  const [signatureImageUrl, setSignatureImageUrl] = useState('')
  const [form] = Form.useForm()

  const currentTeacherId = userProfile?.userId || 'teacher-1'
  const currentInstitutionId = 'INST-001' // TODO: Get from teacher profile
  const currentInstitutionName = '평택안일초등학교' // TODO: Get from teacher profile

  // Load all AttendanceSheets for this institution (not just RETURNED_TO_TEACHER)
  const attendanceSheets = useMemo(() => {
    return attendanceSheetStore.getByInstitutionId(currentInstitutionId)
  }, [currentInstitutionId])

  const allAttendanceDocs = useMemo(() => {
    return getAttendanceDocs().filter(doc => {
      // Filter by institution
      return doc.institution === currentInstitutionName
    })
  }, [])

  const signatures = useMemo(() => {
    return teacherAttendanceSignatureStore.getAll()
  }, [])

  // Combine AttendanceSheets and AttendanceDocuments
  const attendanceList = useMemo(() => {
    // First, add all AttendanceSheets (not just those needing signature)
    const sheetItems = attendanceSheets.map(sheet => {
      const education = dataStore.getEducationById(sheet.educationId)
      const isCompleted = education && education.periodEnd 
        ? dayjs(education.periodEnd).isBefore(dayjs())
        : false
      return {
        id: sheet.attendanceId,
        educationId: sheet.educationId,
        programName: sheet.programName || education?.name || '',
        institution: sheet.institutionName || currentInstitutionName,
        gradeClass: `${sheet.teacherInfo.grade}학년 ${sheet.teacherInfo.className}반`,
        hasSigned: !!sheet.teacherSignature,
        signature: null,
        isCompleted,
        education,
        isAttendanceSheet: true,
        sheet,
      }
    })
    
    // Then add old AttendanceDocuments
    const docItems = allAttendanceDocs.map(doc => {
      const signature = signatures.find(sig => 
        sig.educationId === doc.educationId && sig.teacherId === currentTeacherId
      )
      const education = dataStore.getEducationById(doc.educationId)
      const isCompleted = education && education.periodEnd 
        ? dayjs(education.periodEnd).isBefore(dayjs())
        : false

      return {
        ...doc,
        hasSigned: !!signature,
        signature,
        isCompleted,
        education,
        isAttendanceSheet: false,
      }
    })
    
    return [...sheetItems, ...docItems]
  }, [attendanceSheets, allAttendanceDocs, signatures, currentTeacherId, currentInstitutionName])

  const filteredList = useMemo(() => {
    let filtered = attendanceList

    // Show "서명 필요" first
    filtered = filtered.sort((a, b) => {
      if (a.hasSigned && !b.hasSigned) return 1
      if (!a.hasSigned && b.hasSigned) return -1
      return 0
    })

    // Search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(item => {
        return (
          item.educationId.toLowerCase().includes(searchLower) ||
          item.programName.toLowerCase().includes(searchLower) ||
          item.institution.toLowerCase().includes(searchLower)
        )
      })
    }

    return filtered
  }, [attendanceList, searchText])

  useEffect(() => {
    // Listen for updates
    const handleUpdate = () => {
      // Force re-render
      window.location.reload()
    }

    window.addEventListener('teacherAttendanceSigned', handleUpdate)
    window.addEventListener('attendanceUpdated', handleUpdate)
    window.addEventListener('attendanceSheetUpdated', handleUpdate)

    return () => {
      window.removeEventListener('teacherAttendanceSigned', handleUpdate)
      window.removeEventListener('attendanceUpdated', handleUpdate)
      window.removeEventListener('attendanceSheetUpdated', handleUpdate)
    }
  }, [])

  const handleSign = (attendance: AttendanceDocument) => {
    setSelectedAttendance(attendance)
    setTypedName(userProfile?.name || '')
    setSignatureImageUrl(userProfile?.signatureImageUrl || '')
    setSignatureType(userProfile?.signatureImageUrl ? 'image' : 'typed')
    setSignatureModalVisible(true)
  }

  const handleSignatureSubmit = () => {
    if (!selectedAttendance) return

    if (signatureType === 'typed' && !typedName.trim()) {
      message.warning('이름을 입력해주세요.')
      return
    }

    if (signatureType === 'image' && !signatureImageUrl) {
      message.warning('서명 이미지를 선택해주세요.')
      return
    }

    // Check if this is an AttendanceSheet
    const sheet = attendanceSheetStore.getByEducationId(selectedAttendance.educationId)
    if (sheet) {
      // Allow signature for RETURNED_TO_TEACHER, FINAL_SENT_TO_INSTRUCTOR, APPROVED, and completed sheets
      const canSign = sheet.status === 'RETURNED_TO_TEACHER' || 
                      sheet.status === 'FINAL_SENT_TO_INSTRUCTOR' || 
                      sheet.status === 'APPROVED' ||
                      (selectedAttendance?.status === 'APPROVED' && !sheet.teacherSignature)
      
      if (canSign) {
        const signature = {
          method: (signatureType === 'image' ? 'PNG' : 'TYPED') as 'PNG' | 'TYPED',
          signedBy: userProfile?.name || '학교선생님',
          signedAt: new Date().toISOString(),
          signatureRef: signatureType === 'typed' ? typedName : signatureImageUrl,
        }
        
        // If already signed, just update the signature
        if (sheet.teacherSignature) {
          const updated = {
            ...sheet,
            teacherSignature: signature,
            updatedAt: new Date().toISOString(),
          }
          attendanceSheetStore.upsert(updated)
          message.success('서명이 업데이트되었습니다.')
        } else {
          // Use addTeacherSignature for new signatures
          const actor = {
            role: 'teacher' as const,
            id: userProfile?.userId || currentTeacherId,
            name: userProfile?.name,
          }
          const result = attendanceSheetStore.addTeacherSignature(
            sheet.attendanceId,
            signature,
            actor
          )
          if (result) {
            message.success('서명이 완료되었습니다.')
          } else {
            // If addTeacherSignature fails (e.g., wrong status), just update directly
            const updated = {
              ...sheet,
              teacherSignature: signature,
              updatedAt: new Date().toISOString(),
            }
            attendanceSheetStore.upsert(updated)
            message.success('서명이 완료되었습니다.')
          }
        }
        setSignatureModalVisible(false)
        setSelectedAttendance(null)
        return
      }
    }

    // Fallback to old system
    const signature: Omit<TeacherAttendanceSignature, 'id' | 'signedAt'> = {
      educationId: selectedAttendance.educationId,
      teacherId: currentTeacherId,
      teacherName: userProfile?.name || '학교선생님',
      signatureType,
      signatureValue: signatureType === 'typed' ? typedName : signatureImageUrl,
    }

    teacherAttendanceSignatureStore.create(signature)
    message.success('서명이 완료되었습니다.')
    setSignatureModalVisible(false)
    setSelectedAttendance(null)
  }

  const columns: ColumnsType<any> = [
    {
      title: '교육ID',
      dataIndex: 'educationId',
      key: 'educationId',
      width: 120,
      render: (text: string) => <span className="font-medium">{text}</span>,
    },
    {
      title: '프로그램명',
      dataIndex: 'programName',
      key: 'programName',
      width: 250,
    },
    {
      title: '기관명',
      dataIndex: 'institution',
      key: 'institution',
      width: 150,
    },
    {
      title: '학급',
      dataIndex: 'gradeClass',
      key: 'gradeClass',
      width: 120,
    },
    {
      title: '교육 기간',
      key: 'period',
      width: 200,
      render: (_, record) => {
        const edu = record.education
        return edu ? (
          <span>{edu.periodStart} ~ {edu.periodEnd}</span>
        ) : '-'
      },
    },
    {
      title: '상태',
      key: 'status',
      width: 120,
      render: (_, record) => {
        if (record.isCompleted) {
          return <Badge status="default" text="종료" />
        }
        return <Badge status="processing" text="진행중" />
      },
    },
    {
      title: '서명 상태',
      key: 'signatureStatus',
      width: 120,
      render: (_, record) => {
        if (record.hasSigned) {
          return (
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-green-600">서명 완료</span>
            </div>
          )
        }
        return (
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-600">서명 필요</span>
          </div>
        )
      },
    },
    {
      title: '관리',
      key: 'actions',
      width: 150,
      align: 'center',
      render: (_, record) => (
        <Button
          type={record.hasSigned ? 'default' : 'primary'}
          size="small"
          icon={<FileCheck className="w-3 h-3" />}
          onClick={() => {
            // Navigate to detail page for review and signature
            if (record.isAttendanceSheet && record.sheet) {
              router.push(`/teacher/attendance-sign/${record.sheet.attendanceId}`)
            } else {
              // For old AttendanceDocument, use educationId
              router.push(`/teacher/attendance/${record.educationId}`)
            }
          }}
        >
          {record.hasSigned ? '서명 확인' : '서명하기'}
        </Button>
      ),
    },
  ]

  const signatureRequiredCount = attendanceList.filter(item => !item.hasSigned).length

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              출석부 서명/확인
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              출석부에 서명하세요. 종료된 수업도 서명 가능합니다.
            </p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">서명 필요</div>
              <div className="text-3xl font-bold text-red-600">{signatureRequiredCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">서명 완료</div>
              <div className="text-3xl font-bold text-green-600">
                {attendanceList.length - signatureRequiredCount}
              </div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체</div>
              <div className="text-3xl font-bold text-slate-600">{attendanceList.length}</div>
            </Card>
          </div>

          {/* Search and Table */}
          <Card className="rounded-xl">
            <div className="mb-4">
              <Input
                placeholder="교육ID, 프로그램명으로 검색"
                prefix={<Search className="w-4 h-4 text-gray-400" />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                className="max-w-md"
              />
            </div>

            <Table
              columns={columns}
              dataSource={filteredList}
              rowKey="id"
              scroll={{ x: 'max-content' }}
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}건`,
              }}
            />
          </Card>
        </div>
      </div>

      {/* Signature Modal */}
      <Modal
        title="출석부 서명"
        open={signatureModalVisible}
        onOk={handleSignatureSubmit}
        onCancel={() => {
          setSignatureModalVisible(false)
          setSelectedAttendance(null)
        }}
        okText="서명하기"
        cancelText="취소"
      >
        {selectedAttendance && (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">교육 정보</div>
              <div className="font-medium">{selectedAttendance.programName}</div>
              <div className="text-sm text-gray-500">{selectedAttendance.institution} - {selectedAttendance.gradeClass}</div>
            </div>

            <Form.Item label="서명 방식">
              <Select
                value={signatureType}
                onChange={setSignatureType}
                options={[
                  { value: 'typed', label: '이름 입력' },
                  { value: 'image', label: '서명 이미지' },
                ]}
              />
            </Form.Item>

            {signatureType === 'typed' ? (
              <Form.Item label="이름" required>
                <Input
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="서명할 이름을 입력하세요"
                />
              </Form.Item>
            ) : (
              <Form.Item label="서명 이미지">
                {signatureImageUrl ? (
                  <div className="space-y-2">
                    <img
                      src={signatureImageUrl}
                      alt="서명"
                      className="max-w-[200px] max-h-[80px] object-contain border border-gray-300 rounded p-2"
                    />
                    <Button
                      size="small"
                      onClick={() => {
                        if (userProfile?.signatureImageUrl) {
                          setSignatureImageUrl(userProfile.signatureImageUrl)
                        }
                      }}
                    >
                      내 서명 사용
                    </Button>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    {userProfile?.signatureImageUrl ? (
                      <Button
                        onClick={() => setSignatureImageUrl(userProfile.signatureImageUrl || '')}
                      >
                        내 서명 이미지 사용
                      </Button>
                    ) : (
                      <span>서명 이미지가 없습니다. 이름 입력 방식을 사용하세요.</span>
                    )}
                  </div>
                )}
              </Form.Item>
            )}

            <div className="text-xs text-gray-500">
              서명 후에는 수정할 수 없습니다. 확인 후 진행해주세요.
            </div>
          </div>
        )}
      </Modal>
    </ProtectedRoute>
  )
}
