'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Badge, Space, Card, Modal, Input, message } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Eye, CheckCircle2, XCircle, CheckCircle, X } from 'lucide-react'
import { PageHeaderSticky } from '@/components/admin/operations'
import { useAuth } from '@/contexts/AuthContext'
import {
  getEducationSubmissionGroups,
  approveOrRejectAllDocuments,
  approveOrRejectSubmission,
  type EducationSubmissionGroup,
  type DocumentType,
} from '@/entities/submission'
import dayjs from 'dayjs'

const { TextArea } = Input

export default function SubmissionsByEducationPage() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [groups, setGroups] = useState<EducationSubmissionGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [approveModalVisible, setApproveModalVisible] = useState(false)
  const [rejectModalVisible, setRejectModalVisible] = useState(false)
  const [selectedGroup, setSelectedGroup] = useState<EducationSubmissionGroup | null>(null)
  const [rejectReason, setRejectReason] = useState('')

  useEffect(() => {
    loadGroups()
  }, [])

  const loadGroups = () => {
    const allGroups = getEducationSubmissionGroups()
    setGroups(allGroups)
  }

  const getStatusBadge = (status: string) => {
    if (status === 'APPROVED') {
      return <Badge status="success" text="승인됨" />
    }
    if (status === 'REJECTED') {
      return <Badge status="error" text="반려됨" />
    }
    if (status === 'SUBMITTED') {
      return <Badge status="processing" text="제출됨" />
    }
    return <Badge status="default" text="대기" />
  }

  const getOverallStatusBadge = (status: string) => {
    if (status === 'ALL_APPROVED') {
      return <Badge status="success" text="전체 승인" />
    }
    if (status === 'ALL_SUBMITTED') {
      return <Badge status="processing" text="전체 제출" />
    }
    if (status === 'PARTIAL') {
      return <Badge status="warning" text="일부 제출" />
    }
    if (status === 'REJECTED') {
      return <Badge status="error" text="반려됨" />
    }
    return <Badge status="default" text="대기" />
  }

  const handleViewDetail = (group: EducationSubmissionGroup, type: DocumentType) => {
    if (type === 'attendance' && group.attendance) {
      router.push(`/admin/attendance/${group.attendance.id}`)
    } else if (type === 'activity' && group.activity) {
      router.push(`/admin/activity-logs/${group.activity.id}`)
    } else if (type === 'equipment' && group.equipment) {
      router.push(`/admin/equipment-confirmations/${group.equipment.id}`)
    }
  }

  const handleApproveAll = (group: EducationSubmissionGroup) => {
    setSelectedGroup(group)
    setApproveModalVisible(true)
  }

  const handleRejectAll = (group: EducationSubmissionGroup) => {
    setSelectedGroup(group)
    setRejectReason('')
    setRejectModalVisible(true)
  }

  const confirmApproveAll = async () => {
    if (!selectedGroup) return

    setLoading(true)
    const adminName = userProfile?.name || '관리자'
    const result = approveOrRejectAllDocuments(selectedGroup.educationId, 'approve', adminName)

    if (result.success) {
      message.success('모든 문서가 승인되었습니다.')
      setApproveModalVisible(false)
      setSelectedGroup(null)
      loadGroups()
    } else {
      message.error(`승인 처리 중 오류가 발생했습니다: ${result.errors.join(', ')}`)
    }
    setLoading(false)
  }

  const confirmRejectAll = async () => {
    if (!selectedGroup) return

    if (!rejectReason.trim()) {
      message.warning('반려 사유를 입력해주세요.')
      return
    }

    setLoading(true)
    const adminName = userProfile?.name || '관리자'
    const result = approveOrRejectAllDocuments(selectedGroup.educationId, 'reject', adminName, rejectReason)

    if (result.success) {
      message.success('모든 문서가 반려되었습니다.')
      setRejectModalVisible(false)
      setSelectedGroup(null)
      setRejectReason('')
      loadGroups()
    } else {
      message.error(`반려 처리 중 오류가 발생했습니다: ${result.errors.join(', ')}`)
    }
    setLoading(false)
  }

  const handleApproveSingle = async (group: EducationSubmissionGroup, type: DocumentType) => {
    const adminName = userProfile?.name || '관리자'
    let docId = ''
    
    if (type === 'attendance' && group.attendance) {
      docId = group.attendance.id
    } else if (type === 'activity' && group.activity) {
      docId = group.activity.id
    } else if (type === 'equipment' && group.equipment) {
      docId = group.equipment.id
    }

    if (!docId) return

    setLoading(true)
    const result = approveOrRejectSubmission(
      { educationId: docId, documentType: type, action: 'approve' },
      adminName
    )

    if (result.success) {
      message.success('승인되었습니다.')
      loadGroups()
    } else {
      message.error(result.error || '승인 처리 중 오류가 발생했습니다.')
    }
    setLoading(false)
  }

  const handleRejectSingle = async (group: EducationSubmissionGroup, type: DocumentType) => {
    Modal.confirm({
      title: '문서 반려',
      content: (
        <div className="mt-4">
          <p className="mb-2">반려 사유를 입력해주세요:</p>
          <TextArea
            rows={4}
            placeholder="반려 사유를 입력하세요"
            onChange={(e) => setRejectReason(e.target.value)}
          />
        </div>
      ),
      onOk: async () => {
        if (!rejectReason.trim()) {
          message.warning('반려 사유를 입력해주세요.')
          return
        }

        const adminName = userProfile?.name || '관리자'
        let docId = ''
        
        if (type === 'attendance' && group.attendance) {
          docId = group.attendance.id
        } else if (type === 'activity' && group.activity) {
          docId = group.activity.id
        } else if (type === 'equipment' && group.equipment) {
          docId = group.equipment.id
        }

        if (!docId) return

        setLoading(true)
        const result = approveOrRejectSubmission(
          { educationId: docId, documentType: type, action: 'reject', reason: rejectReason },
          adminName
        )

        if (result.success) {
          message.success('반려되었습니다.')
          setRejectReason('')
          loadGroups()
        } else {
          message.error(result.error || '반려 처리 중 오류가 발생했습니다.')
        }
        setLoading(false)
      },
    })
  }

  const columns: ColumnsType<EducationSubmissionGroup> = [
    {
      title: '교육명',
      dataIndex: 'educationName',
      key: 'educationName',
      width: 200,
      fixed: 'left',
    },
    {
      title: '기관명',
      dataIndex: 'institutionName',
      key: 'institutionName',
      width: 150,
    },
    {
      title: '강사명',
      dataIndex: 'instructorName',
      key: 'instructorName',
      width: 120,
    },
    {
      title: '전체 상태',
      dataIndex: 'overallStatus',
      key: 'overallStatus',
      width: 120,
      render: (status: string) => getOverallStatusBadge(status),
    },
    {
      title: '교육 출석부',
      key: 'attendance',
      width: 150,
      render: (_, record) => {
        if (!record.attendance) {
          return <span className="text-gray-400">미제출</span>
        }
        return (
          <div className="flex items-center gap-2">
            {getStatusBadge(record.attendance.status)}
            <Space>
              <Button
                size="small"
                icon={<Eye className="w-3 h-3" />}
                onClick={() => handleViewDetail(record, 'attendance')}
              >
                보기
              </Button>
              {record.attendance.status === 'SUBMITTED' && (
                <>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckCircle className="w-3 h-3" />}
                    onClick={() => handleApproveSingle(record, 'attendance')}
                    loading={loading}
                  >
                    승인
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<X className="w-3 h-3" />}
                    onClick={() => handleRejectSingle(record, 'attendance')}
                    loading={loading}
                  >
                    거부
                  </Button>
                </>
              )}
            </Space>
          </div>
        )
      },
    },
    {
      title: '교육 활동 일지',
      key: 'activity',
      width: 150,
      render: (_, record) => {
        if (!record.activity) {
          return <span className="text-gray-400">미제출</span>
        }
        return (
          <div className="flex items-center gap-2">
            {getStatusBadge(record.activity.status)}
            <Space>
              <Button
                size="small"
                icon={<Eye className="w-3 h-3" />}
                onClick={() => handleViewDetail(record, 'activity')}
              >
                보기
              </Button>
              {record.activity.status === 'SUBMITTED' && (
                <>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckCircle className="w-3 h-3" />}
                    onClick={() => handleApproveSingle(record, 'activity')}
                    loading={loading}
                  >
                    승인
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<X className="w-3 h-3" />}
                    onClick={() => handleRejectSingle(record, 'activity')}
                    loading={loading}
                  >
                    거부
                  </Button>
                </>
              )}
            </Space>
          </div>
        )
      },
    },
    {
      title: '교구 확인서',
      key: 'equipment',
      width: 150,
      render: (_, record) => {
        if (!record.equipment) {
          return <span className="text-gray-400">미제출</span>
        }
        return (
          <div className="flex items-center gap-2">
            {getStatusBadge(record.equipment.status)}
            <Space>
              <Button
                size="small"
                icon={<Eye className="w-3 h-3" />}
                onClick={() => handleViewDetail(record, 'equipment')}
              >
                보기
              </Button>
              {record.equipment.status === 'SUBMITTED' && (
                <>
                  <Button
                    size="small"
                    type="primary"
                    icon={<CheckCircle className="w-3 h-3" />}
                    onClick={() => handleApproveSingle(record, 'equipment')}
                    loading={loading}
                  >
                    승인
                  </Button>
                  <Button
                    size="small"
                    danger
                    icon={<X className="w-3 h-3" />}
                    onClick={() => handleRejectSingle(record, 'equipment')}
                    loading={loading}
                  >
                    거부
                  </Button>
                </>
              )}
            </Space>
          </div>
        )
      },
    },
    {
      title: '제출일시',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      width: 180,
      render: (date?: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-',
    },
    {
      title: '일괄 처리',
      key: 'bulkActions',
      width: 200,
      fixed: 'right',
      render: (_, record) => {
        const allSubmitted = 
          record.attendance?.status === 'SUBMITTED' &&
          record.activity?.status === 'SUBMITTED' &&
          record.equipment?.status === 'SUBMITTED'
        
        const hasSubmitted = 
          record.attendance?.status === 'SUBMITTED' ||
          record.activity?.status === 'SUBMITTED' ||
          record.equipment?.status === 'SUBMITTED'

        if (!hasSubmitted) {
          return <span className="text-gray-400">-</span>
        }

        return (
          <Space>
            {allSubmitted && (
              <>
                <Button
                  size="small"
                  type="primary"
                  icon={<CheckCircle2 className="w-3 h-3" />}
                  onClick={() => handleApproveAll(record)}
                  loading={loading}
                >
                  전체 승인
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<XCircle className="w-3 h-3" />}
                  onClick={() => handleRejectAll(record)}
                  loading={loading}
                >
                  전체 거부
                </Button>
              </>
            )}
          </Space>
        )
      },
    },
  ]

  const allSubmittedCount = groups.filter(g => g.overallStatus === 'ALL_SUBMITTED').length
  const allApprovedCount = groups.filter(g => g.overallStatus === 'ALL_APPROVED').length
  const partialCount = groups.filter(g => g.overallStatus === 'PARTIAL').length
  const rejectedCount = groups.filter(g => g.overallStatus === 'REJECTED').length

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <PageHeaderSticky
          mode="list"
          onCancel={() => router.back()}
        />

        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              교육별 제출 현황
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              교육 ID별로 3개 문서(출석부, 활동 일지, 교구 확인서)의 제출 상태를 확인하고 승인/거부할 수 있습니다.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체 제출 완료</div>
              <div className="text-3xl font-bold text-blue-600">{allSubmittedCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체 승인 완료</div>
              <div className="text-3xl font-bold text-green-600">{allApprovedCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">일부 제출</div>
              <div className="text-3xl font-bold text-yellow-600">{partialCount}</div>
            </Card>
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">반려</div>
              <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
            </Card>
          </div>

          {/* Table */}
          <Card className="rounded-xl">
            <Table
              columns={columns}
              dataSource={groups}
              rowKey="educationId"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}건`,
              }}
              scroll={{ x: 'max-content' }}
            />
          </Card>
        </div>

        {/* Approve All Modal */}
        <Modal
          title="전체 승인 확인"
          open={approveModalVisible}
          onOk={confirmApproveAll}
          onCancel={() => {
            setApproveModalVisible(false)
            setSelectedGroup(null)
          }}
          confirmLoading={loading}
        >
          <p>
            <strong>{selectedGroup?.educationName}</strong>의 모든 문서를 승인하시겠습니까?
          </p>
          <ul className="mt-4 list-disc list-inside">
            {selectedGroup?.attendance && (
              <li>교육 출석부: {selectedGroup.attendance.status === 'SUBMITTED' ? '제출됨' : '미제출'}</li>
            )}
            {selectedGroup?.activity && (
              <li>교육 활동 일지: {selectedGroup.activity.status === 'SUBMITTED' ? '제출됨' : '미제출'}</li>
            )}
            {selectedGroup?.equipment && (
              <li>교구 확인서: {selectedGroup.equipment.status === 'SUBMITTED' ? '제출됨' : '미제출'}</li>
            )}
          </ul>
        </Modal>

        {/* Reject All Modal */}
        <Modal
          title="전체 거부 확인"
          open={rejectModalVisible}
          onOk={confirmRejectAll}
          onCancel={() => {
            setRejectModalVisible(false)
            setSelectedGroup(null)
            setRejectReason('')
          }}
          confirmLoading={loading}
        >
          <p className="mb-4">
            <strong>{selectedGroup?.educationName}</strong>의 모든 문서를 거부하시겠습니까?
          </p>
          <div className="mb-4">
            <p className="mb-2">반려 사유:</p>
            <TextArea
              rows={4}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="반려 사유를 입력하세요"
            />
          </div>
        </Modal>
      </div>
    </ProtectedRoute>
  )
}

