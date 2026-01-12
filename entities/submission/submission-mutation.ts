// Mutation functions for approving/rejecting submissions

import { upsertAttendanceDoc, getAttendanceDocById, getAttendanceDocByEducationId } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { upsertActivityLog, getActivityLogById } from '@/app/instructor/activity-logs/storage'
import { upsertDoc, getDocById } from '@/app/instructor/equipment-confirmations/storage'
import { getEducationSubmissionGroups } from './submission-utils'
import type { ApprovalAction } from './submission-types'

/**
 * Approve or reject a document submission
 */
export function approveOrRejectSubmission(
  action: ApprovalAction,
  adminName: string
): { success: boolean; error?: string } {
  try {
    const now = new Date().toISOString()

    if (action.documentType === 'attendance') {
      // Try by ID first, then by educationId
      let doc = getAttendanceDocById(action.educationId)
      if (!doc) {
        doc = getAttendanceDocByEducationId(action.educationId)
      }
      if (!doc) {
        return { success: false, error: '출석부 문서를 찾을 수 없습니다.' }
      }

      if (action.action === 'approve') {
        doc.status = 'APPROVED'
        doc.approvedAt = now
        doc.approvedBy = adminName
        doc.rejectedAt = undefined
        doc.rejectedBy = undefined
        doc.rejectReason = undefined
      } else {
        doc.status = 'REJECTED'
        doc.rejectedAt = now
        doc.rejectedBy = adminName
        doc.rejectReason = action.reason || '반려 사유가 없습니다.'
        doc.approvedAt = undefined
        doc.approvedBy = undefined
      }

      const result = upsertAttendanceDoc(doc)
      return result
    }

    if (action.documentType === 'activity') {
      const log = getActivityLogById(action.educationId)
      if (!log) {
        return { success: false, error: '활동 일지를 찾을 수 없습니다.' }
      }

      if (action.action === 'approve') {
        log.status = 'APPROVED'
        log.approvedAt = now
        log.approvedBy = adminName
        log.rejectedAt = undefined
        log.rejectedBy = undefined
        log.rejectReason = undefined
      } else {
        log.status = 'REJECTED'
        log.rejectedAt = now
        log.rejectedBy = adminName
        log.rejectReason = action.reason || '반려 사유가 없습니다.'
        log.approvedAt = undefined
        log.approvedBy = undefined
      }

      upsertActivityLog(log)
      return { success: true }
    }

    if (action.documentType === 'equipment') {
      const doc = getDocById(action.educationId)
      if (!doc) {
        return { success: false, error: '교구 확인서를 찾을 수 없습니다.' }
      }

      if (action.action === 'approve') {
        doc.status = 'APPROVED'
        doc.approvedAt = now
        doc.approvedBy = adminName
        doc.rejectedAt = undefined
        doc.rejectedBy = undefined
        doc.rejectReason = undefined
      } else {
        doc.status = 'REJECTED'
        doc.rejectedAt = now
        doc.rejectedBy = adminName
        doc.rejectReason = action.reason || '반려 사유가 없습니다.'
        doc.approvedAt = undefined
        doc.approvedBy = undefined
      }

      upsertDoc(doc)
      return { success: true }
    }

    return { success: false, error: '알 수 없는 문서 유형입니다.' }
  } catch (error) {
    console.error('Error approving/rejecting submission:', error)
    return { success: false, error: '처리 중 오류가 발생했습니다.' }
  }
}

/**
 * Approve or reject all documents for an education ID
 */
export function approveOrRejectAllDocuments(
  educationId: string,
  action: 'approve' | 'reject',
  adminName: string,
  reason?: string
): { success: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Get all documents for this education
  const groups = getEducationSubmissionGroups()
  const group = groups.find(g => g.educationId === educationId)
  
  if (!group) {
    return { success: false, errors: ['교육 정보를 찾을 수 없습니다.'] }
  }

  // Process each document type
  if (group.attendance) {
    const result = approveOrRejectSubmission(
      { educationId: group.attendance.id, documentType: 'attendance', action, reason },
      adminName
    )
    if (!result.success) {
      errors.push(`출석부: ${result.error || '처리 실패'}`)
    }
  }

  if (group.activity) {
    const result = approveOrRejectSubmission(
      { educationId: group.activity.id, documentType: 'activity', action, reason },
      adminName
    )
    if (!result.success) {
      errors.push(`활동 일지: ${result.error || '처리 실패'}`)
    }
  }

  if (group.equipment) {
    const result = approveOrRejectSubmission(
      { educationId: group.equipment.id, documentType: 'equipment', action, reason },
      adminName
    )
    if (!result.success) {
      errors.push(`교구 확인서: ${result.error || '처리 실패'}`)
    }
  }

  return {
    success: errors.length === 0,
    errors,
  }
}

