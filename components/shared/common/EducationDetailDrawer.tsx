'use client'

import React from 'react'
import { Drawer, Tabs, Button, Space, Badge } from 'antd'
import { Eye, Download, CheckCircle2, XCircle } from 'lucide-react'
import type { EducationDocSummary } from '@/entities/submission'
import { getEvidenceByEducationGrouped } from '@/entities/submission'
import { generateAttendanceFilename, generateActivityLogFilename } from '@/lib/filenameGenerator'
import dayjs from 'dayjs'

interface EducationDetailDrawerProps {
  open: boolean
  onClose: () => void
  educationId: string
  summary: EducationDocSummary | null
  isAdmin?: boolean
  onViewAttendance?: (educationId: string) => void
  onViewActivity?: (id: string) => void
  onViewEquipment?: (id: string) => void
  onApprove?: (type: 'attendance' | 'activity' | 'equipment', id: string) => void
  onReject?: (type: 'attendance' | 'activity' | 'equipment', id: string, reason: string) => void
}

export const EducationDetailDrawer: React.FC<EducationDetailDrawerProps> = ({
  open,
  onClose,
  educationId,
  summary,
  isAdmin = false,
  onViewAttendance,
  onViewActivity,
  onViewEquipment,
  onApprove,
  onReject,
}) => {
  const evidence = getEvidenceByEducationGrouped(educationId)

  const getStatusBadge = (status?: string) => {
    if (status === 'APPROVED') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-50 to-green-100 text-emerald-700 border border-emerald-200">
          승인됨
        </span>
      )
    }
    if (status === 'REJECTED') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200">
          반려됨
        </span>
      )
    }
    if (status === 'SUBMITTED') {
      return (
        <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border border-blue-200">
          제출됨
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-50 to-yellow-100 text-amber-700 border border-amber-200">
        미제출
      </span>
    )
  }

  const handleDownload = (type: 'attendance' | 'activity', filename: string) => {
    // In real implementation, this would trigger actual file download
    console.log(`Downloading ${type}: ${filename}`)
  }

  return (
    <Drawer
      title={summary?.educationName || '교육 상세'}
      placement="right"
      size="large"
      onClose={onClose}
      open={open}
    >
      {summary && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">기본 정보</h3>
            <div className="space-y-2 text-sm">
              <div><span className="font-medium">교육ID:</span> {summary.educationId}</div>
              <div><span className="font-medium">기관명:</span> {summary.institutionName}</div>
              <div><span className="font-medium">강사명:</span> {summary.instructorName}</div>
            </div>
          </div>

          <Tabs
            items={[
              {
                key: 'attendance',
                label: `교육 출석부 ${summary.attendance ? `(${summary.attendance.count})` : ''}`,
                children: (
                  <div className="space-y-4">
                    {summary.attendance ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            {getStatusBadge(summary.attendance.status)}
                            {summary.attendance.rejectReason && (
                              <div className="mt-2 text-sm text-red-600">
                                반려 사유: {summary.attendance.rejectReason}
                              </div>
                            )}
                            {summary.attendance.submittedAt && (
                              <div className="mt-1 text-xs text-gray-500">
                                제출일: {dayjs(summary.attendance.submittedAt).format('YYYY-MM-DD HH:mm')}
                              </div>
                            )}
                          </div>
                        </div>
                        <Space>
                          {!isAdmin && onViewAttendance && (
                            <Button
                              type="primary"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => onViewAttendance(summary.educationId)}
                            >
                              {summary.attendance.status === 'DRAFT' ? '작성하기' : '수정하기'}
                            </Button>
                          )}
                          {isAdmin && onViewAttendance && (
                            <Button
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => onViewAttendance(summary.educationId)}
                            >
                              상세보기
                            </Button>
                          )}
                          {evidence.attendance && (
                            <Button
                              icon={<Download className="w-4 h-4" />}
                              onClick={() => {
                                const filename = generateAttendanceFilename({
                                  sessionDate: evidence.attendance?.sessions[0]?.date,
                                  schoolName: evidence.attendance?.institution || '',
                                  gradeClass: evidence.attendance?.gradeClass || '',
                                  documentType: '출석부',
                                })
                                handleDownload('attendance', filename)
                              }}
                            >
                              다운로드
                            </Button>
                          )}
                          {isAdmin && summary.attendance.status === 'SUBMITTED' && (
                            <>
                              {onApprove && (
                                <Button
                                  type="primary"
                                  icon={<CheckCircle2 className="w-4 h-4" />}
                                  onClick={() => onApprove('attendance', summary.attendance!.id)}
                                >
                                  승인
                                </Button>
                              )}
                              {onReject && (
                                <Button
                                  danger
                                  icon={<XCircle className="w-4 h-4" />}
                                  onClick={() => {
                                    const reason = prompt('반려 사유를 입력하세요:')
                                    if (reason) {
                                      onReject('attendance', summary.attendance!.id, reason)
                                    }
                                  }}
                                >
                                  반려
                                </Button>
                              )}
                            </>
                          )}
                        </Space>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-4 text-gray-400">
                          출석부가 제출되지 않았습니다.
                        </div>
                        <Space>
                          {onViewAttendance && (
                            <Button
                              type="primary"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => onViewAttendance(summary.educationId)}
                            >
                              작성하기
                            </Button>
                          )}
                        </Space>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'activity',
                label: `교육 활동 일지 ${summary.activity ? `(${summary.activity.count})` : ''}`,
                children: (
                  <div className="space-y-4">
                    {summary.activity ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            {getStatusBadge(summary.activity.status)}
                            {summary.activity.rejectReason && (
                              <div className="mt-2 text-sm text-red-600">
                                반려 사유: {summary.activity.rejectReason}
                              </div>
                            )}
                            {summary.activity.submittedAt && (
                              <div className="mt-1 text-xs text-gray-500">
                                제출일: {dayjs(summary.activity.submittedAt).format('YYYY-MM-DD HH:mm')}
                              </div>
                            )}
                          </div>
                        </div>
                        <Space>
                          {!isAdmin && onViewActivity && (
                            <Button
                              type="primary"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => {
                                if (summary.activity?.id) {
                                  onViewActivity(summary.activity.id)
                                } else {
                                  onViewActivity(summary.educationId)
                                }
                              }}
                            >
                              {summary.activity.status === 'DRAFT' ? '작성하기' : '수정하기'}
                            </Button>
                          )}
                          {isAdmin && onViewActivity && (
                            <Button
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => onViewActivity(summary.activity!.id)}
                            >
                              상세보기
                            </Button>
                          )}
                          {evidence.activity && (
                            <Button
                              icon={<Download className="w-4 h-4" />}
                              onClick={() => {
                                const firstSession = evidence.activity?.sessions?.[0]
                                const filename = generateActivityLogFilename({
                                  sessionDate: firstSession?.date,
                                  startDate: evidence.activity?.startDate,
                                  endDate: evidence.activity?.endDate,
                                  schoolName: evidence.activity?.institutionName || '',
                                  gradeClass: `${evidence.activity?.grade || ''}학년 ${evidence.activity?.class || ''}반`,
                                  instructorName: summary.instructorName,
                                  documentType: '교육활동일지',
                                })
                                handleDownload('activity', filename)
                              }}
                            >
                              다운로드
                            </Button>
                          )}
                          {isAdmin && summary.activity.status === 'SUBMITTED' && (
                            <>
                              {onApprove && (
                                <Button
                                  type="primary"
                                  icon={<CheckCircle2 className="w-4 h-4" />}
                                  onClick={() => onApprove('activity', summary.activity!.id)}
                                >
                                  승인
                                </Button>
                              )}
                              {onReject && (
                                <Button
                                  danger
                                  icon={<XCircle className="w-4 h-4" />}
                                  onClick={() => {
                                    const reason = prompt('반려 사유를 입력하세요:')
                                    if (reason) {
                                      onReject('activity', summary.activity!.id, reason)
                                    }
                                  }}
                                >
                                  반려
                                </Button>
                              )}
                            </>
                          )}
                        </Space>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-4 text-gray-400">
                          활동 일지가 제출되지 않았습니다.
                        </div>
                        <Space>
                          {onViewActivity && (
                            <Button
                              type="primary"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => {
                                // 활동 일지가 없으면 educationId를 전달하여 새로 생성하거나 찾기
                                onViewActivity(summary.educationId)
                              }}
                            >
                              작성하기
                            </Button>
                          )}
                        </Space>
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'equipment',
                label: `교구 확인서 ${summary.equipment ? `(${summary.equipment.count})` : ''}`,
                children: (
                  <div className="space-y-4">
                    {summary.equipment ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            {getStatusBadge(summary.equipment.status)}
                            {summary.equipment.rejectReason && (
                              <div className="mt-2 text-sm text-red-600">
                                반려 사유: {summary.equipment.rejectReason}
                              </div>
                            )}
                            {summary.equipment.submittedAt && (
                              <div className="mt-1 text-xs text-gray-500">
                                제출일: {dayjs(summary.equipment.submittedAt).format('YYYY-MM-DD HH:mm')}
                              </div>
                            )}
                          </div>
                        </div>
                        <Space>
                          {!isAdmin && onViewEquipment && (
                            <Button
                              type="primary"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => {
                                if (summary.equipment?.id) {
                                  onViewEquipment(summary.equipment.id)
                                } else {
                                  onViewEquipment(summary.educationId)
                                }
                              }}
                            >
                              {summary.equipment.status === 'DRAFT' ? '작성하기' : '수정하기'}
                            </Button>
                          )}
                          {isAdmin && onViewEquipment && (
                            <Button
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => onViewEquipment(summary.equipment!.id)}
                            >
                              상세보기
                            </Button>
                          )}
                          {isAdmin && summary.equipment.status === 'SUBMITTED' && (
                            <>
                              {onApprove && (
                                <Button
                                  type="primary"
                                  icon={<CheckCircle2 className="w-4 h-4" />}
                                  onClick={() => onApprove('equipment', summary.equipment!.id)}
                                >
                                  승인
                                </Button>
                              )}
                              {onReject && (
                                <Button
                                  danger
                                  icon={<XCircle className="w-4 h-4" />}
                                  onClick={() => {
                                    const reason = prompt('반려 사유를 입력하세요:')
                                    if (reason) {
                                      onReject('equipment', summary.equipment!.id, reason)
                                    }
                                  }}
                                >
                                  반려
                                </Button>
                              )}
                            </>
                          )}
                        </Space>
                      </>
                    ) : (
                      <div className="space-y-4">
                        <div className="text-center py-4 text-gray-400">
                          교구 확인서가 제출되지 않았습니다.
                        </div>
                        <Space>
                          {onViewEquipment && (
                            <Button
                              type="primary"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => {
                                // 교구 확인서가 없으면 educationId를 전달하여 새로 생성하거나 찾기
                                onViewEquipment(summary.educationId)
                              }}
                            >
                              작성하기
                            </Button>
                          )}
                        </Space>
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
        </div>
      )}
    </Drawer>
  )
}

