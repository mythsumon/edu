'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Table, Tag, Timeline, Modal, Descriptions } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Eye, CheckCircle, XCircle, FileCheck } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { dataStore } from '@/lib/dataStore'
import { attendanceSheetStore, type AttendanceSheet } from '@/lib/attendanceSheetStore'
import dayjs from 'dayjs'

type AttendanceSheetWithEducation = AttendanceSheet & { education: NonNullable<ReturnType<typeof dataStore.getEducationById>> }

export default function CompletedAttendancePage() {
  const { userProfile } = useAuth()
  const [sheets, setSheets] = useState<AttendanceSheetWithEducation[]>([])
  const [loading, setLoading] = useState(false)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedSheet, setSelectedSheet] = useState<AttendanceSheetWithEducation | null>(null)

  const currentInstitutionId = 'INST-001' // TODO: Get from teacher profile

  const loadSheets = () => {
    setLoading(true)
    try {
      const allSheets = attendanceSheetStore.getByInstitutionId(currentInstitutionId)
      // Filter for completed states
      const completedSheets = allSheets.filter(sheet => 
        sheet.status === 'FINAL_SENT_TO_INSTRUCTOR' ||
        sheet.status === 'SUBMITTED_TO_ADMIN' ||
        sheet.status === 'APPROVED' ||
        sheet.status === 'REJECTED'
      )
      
      // Enrich with education data
      const enriched = completedSheets
        .map(sheet => {
          const education = dataStore.getEducationById(sheet.educationId)
          if (!education) {
            console.warn(`Education not found for ${sheet.educationId}`)
            return null
          }
          return {
            ...sheet,
            education,
          }
        })
        .filter((item): item is AttendanceSheetWithEducation => item !== null && item.education !== undefined)

      setSheets(enriched)
    } catch (error) {
      console.error('Error loading attendance sheets:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Force initialization on mount
    if (typeof window !== 'undefined') {
      // Ensure dummy data is loaded
      attendanceSheetStore.getAll()
    }
    
    loadSheets()

    const handleUpdate = () => {
      loadSheets()
    }

    window.addEventListener('attendanceSheetUpdated', handleUpdate)
    window.addEventListener('attendanceSheetStatusChanged', handleUpdate)

    return () => {
      window.removeEventListener('attendanceSheetUpdated', handleUpdate)
      window.removeEventListener('attendanceSheetStatusChanged', handleUpdate)
    }
  }, [currentInstitutionId])

  const handleViewDetail = (sheet: AttendanceSheetWithEducation) => {
    setSelectedSheet(sheet)
    setDetailModalVisible(true)
  }

  const getStatusTag = (status: AttendanceSheet['status']) => {
    switch (status) {
      case 'FINAL_SENT_TO_INSTRUCTOR':
        return <Tag color="blue">강사에게 전송됨</Tag>
      case 'SUBMITTED_TO_ADMIN':
        return <Tag color="purple">관리자 제출됨</Tag>
      case 'APPROVED':
        return <Tag color="green" icon={<CheckCircle />}>승인됨</Tag>
      case 'REJECTED':
        return <Tag color="red" icon={<XCircle />}>반려됨</Tag>
      default:
        return <Tag>{status}</Tag>
    }
  }

  const columns: ColumnsType<AttendanceSheetWithEducation> = [
    {
      title: '프로그램명',
      dataIndex: ['education', 'name'],
      key: 'programName',
      render: (text, record) => record.education?.name || record.programName || '-',
    },
    {
      title: '기관명',
      dataIndex: 'institutionName',
      key: 'institutionName',
    },
    {
      title: '학년/반',
      key: 'gradeClass',
      render: (_, record) => {
        const { grade, className } = record.teacherInfo
        return grade && className ? `${grade}학년 ${className}반` : '-'
      },
    },
    {
      title: '상태',
      key: 'status',
      render: (_, record) => getStatusTag(record.status),
    },
    {
      title: '완료일',
      dataIndex: 'updatedAt',
      key: 'completedAt',
      render: (text) => text ? dayjs(text).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '작업',
      key: 'action',
      render: (_, record) => (
        <button
          onClick={() => handleViewDetail(record)}
          className="text-blue-600 hover:text-blue-800"
        >
          <Eye className="inline w-4 h-4 mr-1" />
          상세보기
        </button>
      ),
    },
  ]

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              완료된 출석부
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              완료된 출석부를 확인하세요.
            </p>
          </div>

          {/* Table */}
          <Card className="rounded-xl">
            <Table
              columns={columns}
              dataSource={sheets}
              rowKey="attendanceId"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}개`,
              }}
              locale={{
                emptyText: '완료된 출석부가 없습니다.',
              }}
            />
          </Card>

          {/* Detail Modal */}
          <Modal
            title="출석부 상세 정보"
            open={detailModalVisible}
            onCancel={() => {
              setDetailModalVisible(false)
              setSelectedSheet(null)
            }}
            footer={null}
            width={900}
          >
            {selectedSheet && (
              <div className="space-y-4">
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="프로그램명">
                    {selectedSheet.programName || selectedSheet.education?.name}
                  </Descriptions.Item>
                  <Descriptions.Item label="기관명">
                    {selectedSheet.institutionName}
                  </Descriptions.Item>
                  <Descriptions.Item label="학년/반">
                    {selectedSheet.teacherInfo.grade}학년 {selectedSheet.teacherInfo.className}반
                  </Descriptions.Item>
                  <Descriptions.Item label="담당 선생님">
                    {selectedSheet.teacherInfo.teacherName}
                  </Descriptions.Item>
                  <Descriptions.Item label="학생 수">
                    {selectedSheet.students?.length || 0}명
                  </Descriptions.Item>
                  <Descriptions.Item label="상태">
                    {getStatusTag(selectedSheet.status)}
                  </Descriptions.Item>
                </Descriptions>

                {selectedSheet.adminReview && (
                  <Card title="관리자 검토 결과" size="small">
                    <Descriptions column={1}>
                      <Descriptions.Item label="결과">
                        {selectedSheet.adminReview.status === 'APPROVED' ? (
                          <Tag color="green">승인</Tag>
                        ) : (
                          <Tag color="red">반려</Tag>
                        )}
                      </Descriptions.Item>
                      {selectedSheet.adminReview.reason && (
                        <Descriptions.Item label="사유">
                          {selectedSheet.adminReview.reason}
                        </Descriptions.Item>
                      )}
                      {selectedSheet.adminReview.reviewedAt && (
                        <Descriptions.Item label="검토일">
                          {dayjs(selectedSheet.adminReview.reviewedAt).format('YYYY-MM-DD HH:mm')}
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>
                )}

                {selectedSheet.auditLog && selectedSheet.auditLog.length > 0 && (
                  <Card title="처리 이력" size="small">
                    <Timeline>
                      {selectedSheet.auditLog.map((log) => (
                        <Timeline.Item
                          key={log.id}
                          color={
                            log.toState === 'APPROVED' ? 'green' :
                            log.toState === 'REJECTED' ? 'red' :
                            'blue'
                          }
                        >
                          <div>
                            <strong>{log.actorName || log.actorId}</strong> ({log.actorRole})
                            <br />
                            {log.fromState} → {log.toState}
                            <br />
                            <span className="text-gray-500 text-sm">
                              {dayjs(log.timestamp).format('YYYY-MM-DD HH:mm')}
                            </span>
                            {log.comment && (
                              <div className="text-gray-600 text-sm mt-1">
                                {log.comment}
                              </div>
                            )}
                          </div>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Card>
                )}
              </div>
            )}
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  )
}
