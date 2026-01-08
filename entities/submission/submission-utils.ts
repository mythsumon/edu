// Utility functions for grouping submissions by education ID

import { getAttendanceDocs } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { getActivityLogs } from '@/app/instructor/activity-logs/storage'
import { getDocs as getEquipmentDocs } from '@/app/instructor/equipment-confirmations/storage'
import type { AttendanceDocument } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import type { ActivityLog } from '@/app/instructor/activity-logs/types'
import type { EquipmentConfirmationDoc } from '@/app/instructor/equipment-confirmations/types'
import type { DocumentSubmission, EducationSubmissionGroup } from './submission-types'

/**
 * Get all submissions grouped by education ID
 */
export function getEducationSubmissionGroups(): EducationSubmissionGroup[] {
  const attendanceDocs = getAttendanceDocs()
  const activityLogs = getActivityLogs()
  const equipmentDocs = getEquipmentDocs()

  // Create a map to group by educationId
  const groupsMap = new Map<string, EducationSubmissionGroup>()

  // Process attendance documents
  attendanceDocs
    .filter(doc => doc.status !== 'DRAFT')
    .forEach(doc => {
      const educationId = doc.educationId
      if (!groupsMap.has(educationId)) {
        groupsMap.set(educationId, {
          educationId,
          educationName: doc.programName,
          institutionName: doc.institution,
          instructorName: doc.submittedBy || '미상',
          overallStatus: 'PENDING',
        })
      }
      const group = groupsMap.get(educationId)!
      group.attendance = {
        id: doc.id,
        type: 'attendance',
        educationId: doc.educationId,
        status: doc.status,
        submittedAt: doc.submittedAt,
        submittedBy: doc.submittedBy,
        approvedAt: doc.approvedAt,
        approvedBy: doc.approvedBy,
        rejectedAt: doc.rejectedAt,
        rejectedBy: doc.rejectedBy,
        rejectReason: doc.rejectReason,
      }
      if (doc.submittedAt && (!group.submittedAt || doc.submittedAt > group.submittedAt)) {
        group.submittedAt = doc.submittedAt
      }
      if (doc.updatedAt && (!group.lastUpdatedAt || doc.updatedAt > group.lastUpdatedAt)) {
        group.lastUpdatedAt = doc.updatedAt
      }
    })

  // Process activity logs
  activityLogs
    .filter(log => log.status && log.status !== 'DRAFT')
    .forEach(log => {
      const educationId = log.educationId || ''
      if (!educationId) return

      if (!groupsMap.has(educationId)) {
        groupsMap.set(educationId, {
          educationId,
          educationName: `${log.educationType} - ${log.institutionName}`,
          institutionName: log.institutionName,
          instructorName: log.submittedBy || log.createdBy || '미상',
          overallStatus: 'PENDING',
        })
      }
      const group = groupsMap.get(educationId)!
      group.activity = {
        id: log.id || '',
        type: 'activity',
        educationId: log.educationId || '',
        status: log.status || 'SUBMITTED',
        submittedAt: log.submittedAt,
        submittedBy: log.submittedBy || log.createdBy,
        approvedAt: log.approvedAt,
        approvedBy: log.approvedBy,
        rejectedAt: log.rejectedAt,
        rejectedBy: log.rejectedBy,
        rejectReason: log.rejectReason,
      }
      if (log.submittedAt && (!group.submittedAt || log.submittedAt > group.submittedAt)) {
        group.submittedAt = log.submittedAt
      }
      if (log.createdAt && (!group.lastUpdatedAt || log.createdAt > group.lastUpdatedAt)) {
        group.lastUpdatedAt = log.createdAt
      }
    })

  // Process equipment confirmations
  equipmentDocs
    .filter(doc => doc.status !== 'DRAFT')
    .forEach(doc => {
      const educationId = doc.educationId || doc.id
      if (!groupsMap.has(educationId)) {
        groupsMap.set(educationId, {
          educationId,
          educationName: doc.materialName,
          institutionName: doc.organizationName,
          instructorName: doc.createdByName,
          overallStatus: 'PENDING',
        })
      }
      const group = groupsMap.get(educationId)!
      group.equipment = {
        id: doc.id,
        type: 'equipment',
        educationId: doc.educationId || doc.id,
        status: doc.status,
        submittedAt: doc.status === 'SUBMITTED' ? doc.createdAt : undefined,
        submittedBy: doc.createdByName,
        approvedAt: doc.approvedAt,
        approvedBy: doc.approvedBy,
        rejectedAt: doc.rejectedAt,
        rejectedBy: doc.rejectedBy,
        rejectReason: doc.rejectReason,
      }
      if (doc.createdAt && (!group.submittedAt || doc.createdAt > group.submittedAt)) {
        group.submittedAt = doc.createdAt
      }
      if (doc.updatedAt && (!group.lastUpdatedAt || doc.updatedAt > group.lastUpdatedAt)) {
        group.lastUpdatedAt = doc.updatedAt
      }
    })

  // Calculate overall status for each group
  const groups = Array.from(groupsMap.values())
  groups.forEach(group => {
    const docs = [group.attendance, group.activity, group.equipment].filter(Boolean) as DocumentSubmission[]
    
    if (docs.length === 0) {
      group.overallStatus = 'PENDING'
      return
    }

    const allApproved = docs.every(doc => doc.status === 'APPROVED')
    const allSubmitted = docs.every(doc => doc.status === 'SUBMITTED')
    const hasRejected = docs.some(doc => doc.status === 'REJECTED')
    const hasSubmitted = docs.some(doc => doc.status === 'SUBMITTED')

    if (allApproved) {
      group.overallStatus = 'ALL_APPROVED'
    } else if (hasRejected) {
      group.overallStatus = 'REJECTED'
    } else if (allSubmitted) {
      group.overallStatus = 'ALL_SUBMITTED'
    } else if (hasSubmitted) {
      group.overallStatus = 'PARTIAL'
    } else {
      group.overallStatus = 'PENDING'
    }
  })

  // Sort by last updated date (newest first)
  return groups.sort((a, b) => {
    const dateA = a.lastUpdatedAt || a.submittedAt || ''
    const dateB = b.lastUpdatedAt || b.submittedAt || ''
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
}

/**
 * Get submission groups filtered by instructor name
 */
export function getEducationSubmissionGroupsByInstructor(instructorName: string): EducationSubmissionGroup[] {
  const allGroups = getEducationSubmissionGroups()
  return allGroups.filter(group => group.instructorName === instructorName)
}

/**
 * Get all individual submissions for an instructor (flattened from groups)
 */
export function getInstructorSubmissions(instructorName: string): {
  id: string
  type: 'attendance' | 'activity' | 'equipment'
  educationId: string
  educationName: string
  institutionName: string
  instructorName: string
  submittedAt: string
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED'
  rejectReason?: string
}[] {
  const groups = getEducationSubmissionGroupsByInstructor(instructorName)
  const submissions: any[] = []

  groups.forEach(group => {
    if (group.attendance && group.attendance.status !== 'DRAFT') {
      submissions.push({
        id: group.attendance.id,
        type: 'attendance',
        educationId: group.educationId,
        educationName: group.educationName,
        institutionName: group.institutionName,
        instructorName: group.instructorName,
        submittedAt: group.attendance.submittedAt || '',
        status: group.attendance.status,
        rejectReason: group.attendance.rejectReason,
      })
    }
    if (group.activity && group.activity.status !== 'DRAFT') {
      submissions.push({
        id: group.activity.id,
        type: 'activity',
        educationId: group.educationId,
        educationName: group.educationName,
        institutionName: group.institutionName,
        instructorName: group.instructorName,
        submittedAt: group.activity.submittedAt || '',
        status: group.activity.status,
        rejectReason: group.activity.rejectReason,
      })
    }
    if (group.equipment && group.equipment.status !== 'DRAFT') {
      submissions.push({
        id: group.equipment.id,
        type: 'equipment',
        educationId: group.educationId,
        educationName: group.educationName,
        institutionName: group.institutionName,
        instructorName: group.instructorName,
        submittedAt: group.equipment.submittedAt || '',
        status: group.equipment.status,
        rejectReason: group.equipment.rejectReason,
      })
    }
  })

  // Sort by submitted date (newest first)
  return submissions.sort((a, b) =>
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )
}

