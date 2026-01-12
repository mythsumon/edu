// Utility functions for grouping submissions by education ID
// SINGLE SOURCE OF TRUTH for evidence data

import { getAttendanceDocs } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import { getActivityLogs } from '@/app/instructor/activity-logs/storage'
import { getDocs as getEquipmentDocs } from '@/app/instructor/equipment-confirmations/storage'
import type { AttendanceDocument } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import type { ActivityLog } from '@/app/instructor/activity-logs/types'
import type { EquipmentConfirmationDoc } from '@/app/instructor/equipment-confirmations/types'
import type { DocumentSubmission, EducationSubmissionGroup } from './submission-types'

/**
 * Document status summary for an education
 */
export interface EducationDocSummary {
  educationId: string
  educationName: string
  institutionName: string
  instructorName: string
  attendance?: {
    id: string
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    submittedAt?: string
    rejectReason?: string
    count: number
  }
  activity?: {
    id: string
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    submittedAt?: string
    rejectReason?: string
    count: number
  }
  equipment?: {
    id: string
    status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED'
    submittedAt?: string
    rejectReason?: string
    count: number
  }
  overallStatus: 'ALL_APPROVED' | 'ALL_SUBMITTED' | 'PARTIAL' | 'PENDING' | 'REJECTED'
  lastUpdatedAt?: string
}

/**
 * Get document summary for a specific education
 */
export function deriveEducationDocSummary(educationId: string): EducationDocSummary | null {
  const attendanceDocs = getAttendanceDocs()
  const activityLogs = getActivityLogs()
  const equipmentDocs = getEquipmentDocs()

  const attendance = attendanceDocs.find(doc => doc.educationId === educationId)
  const activity = activityLogs.find(log => (log.educationId || log.id) === educationId)
  const equipment = equipmentDocs.find(doc => (doc.educationId || doc.id) === educationId)

  if (!attendance && !activity && !equipment) {
    return null
  }

  // Determine education name and institution from first available doc
  const educationName = attendance?.programName || 
                       (activity ? `${activity.educationType} - ${activity.institutionName}` : '') ||
                       equipment?.materialName || 
                       '미상'
  const institutionName = attendance?.institution || 
                         activity?.institutionName || 
                         equipment?.organizationName || 
                         '미상'
  const instructorName = attendance?.submittedBy || 
                        activity?.submittedBy || 
                        activity?.createdBy || 
                        equipment?.createdByName || 
                        '미상'

  const summary: EducationDocSummary = {
    educationId,
    educationName,
    institutionName,
    instructorName,
    overallStatus: 'PENDING',
    lastUpdatedAt: undefined,
  }

  if (attendance) {
    summary.attendance = {
      id: attendance.id,
      status: attendance.status,
      submittedAt: attendance.submittedAt,
      rejectReason: attendance.rejectReason,
      count: 1,
    }
    if (attendance.updatedAt && (!summary.lastUpdatedAt || attendance.updatedAt > summary.lastUpdatedAt)) {
      summary.lastUpdatedAt = attendance.updatedAt
    }
  }

  if (activity) {
    summary.activity = {
      id: activity.id || '',
      status: activity.status || 'DRAFT',
      submittedAt: activity.submittedAt,
      rejectReason: activity.rejectReason,
      count: 1,
    }
    if (activity.createdAt && (!summary.lastUpdatedAt || activity.createdAt > summary.lastUpdatedAt)) {
      summary.lastUpdatedAt = activity.createdAt
    }
  }

  if (equipment) {
    summary.equipment = {
      id: equipment.id,
      status: equipment.status,
      submittedAt: equipment.status === 'SUBMITTED' ? equipment.createdAt : undefined,
      rejectReason: equipment.rejectReason,
      count: 1,
    }
    if (equipment.updatedAt && (!summary.lastUpdatedAt || equipment.updatedAt > summary.lastUpdatedAt)) {
      summary.lastUpdatedAt = equipment.updatedAt
    }
  }

  // Calculate overall status
  const docs = [summary.attendance, summary.activity, summary.equipment].filter(Boolean) as any[]
  if (docs.length === 0) {
    summary.overallStatus = 'PENDING'
  } else {
    const allApproved = docs.every(doc => doc.status === 'APPROVED')
    const allSubmitted = docs.every(doc => doc.status === 'SUBMITTED')
    const hasRejected = docs.some(doc => doc.status === 'REJECTED')
    const hasSubmitted = docs.some(doc => doc.status === 'SUBMITTED')

    if (allApproved) {
      summary.overallStatus = 'ALL_APPROVED'
    } else if (hasRejected) {
      summary.overallStatus = 'REJECTED'
    } else if (allSubmitted) {
      summary.overallStatus = 'ALL_SUBMITTED'
    } else if (hasSubmitted) {
      summary.overallStatus = 'PARTIAL'
    } else {
      summary.overallStatus = 'PENDING'
    }
  }

  return summary
}

/**
 * Get all education summaries (grouped by educationId)
 */
export function getAllEducationDocSummaries(): EducationDocSummary[] {
  const attendanceDocs = getAttendanceDocs()
  const activityLogs = getActivityLogs()
  const equipmentDocs = getEquipmentDocs()

  const educationMap = new Map<string, EducationDocSummary>()

  // Process attendance docs
  attendanceDocs.forEach(doc => {
    const educationId = doc.educationId
    if (!educationMap.has(educationId)) {
      const summary = deriveEducationDocSummary(educationId)
      if (summary) {
        educationMap.set(educationId, summary)
      }
    }
  })

  // Process activity logs
  activityLogs.forEach(log => {
    const educationId = log.educationId || log.id || ''
    if (educationId && !educationMap.has(educationId)) {
      const summary = deriveEducationDocSummary(educationId)
      if (summary) {
        educationMap.set(educationId, summary)
      }
    }
  })

  // Process equipment docs
  equipmentDocs.forEach(doc => {
    const educationId = doc.educationId || doc.id
    if (!educationMap.has(educationId)) {
      const summary = deriveEducationDocSummary(educationId)
      if (summary) {
        educationMap.set(educationId, summary)
      }
    }
  })

  // Sort by last updated (newest first)
  return Array.from(educationMap.values()).sort((a, b) => {
    const dateA = a.lastUpdatedAt || ''
    const dateB = b.lastUpdatedAt || ''
    return new Date(dateB).getTime() - new Date(dateA).getTime()
  })
}

/**
 * Get education summaries filtered by instructor
 */
export function getEducationDocSummariesByInstructor(instructorName: string): EducationDocSummary[] {
  return getAllEducationDocSummaries().filter(summary => summary.instructorName === instructorName)
}

/**
 * Get all evidence documents grouped by education
 */
export function getEvidenceByEducationGrouped(educationId: string): {
  attendance?: AttendanceDocument
  activity?: ActivityLog
  equipment?: EquipmentConfirmationDoc
} {
  const attendanceDocs = getAttendanceDocs()
  const activityLogs = getActivityLogs()
  const equipmentDocs = getEquipmentDocs()

  return {
    attendance: attendanceDocs.find(doc => doc.educationId === educationId),
    activity: activityLogs.find(log => (log.educationId || log.id) === educationId),
    equipment: equipmentDocs.find(doc => (doc.educationId || doc.id) === educationId),
  }
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
  const summaries = getEducationDocSummariesByInstructor(instructorName)
  const submissions: any[] = []

  summaries.forEach(summary => {
    if (summary.attendance && summary.attendance.status !== 'DRAFT') {
      submissions.push({
        id: summary.attendance.id,
        type: 'attendance',
        educationId: summary.educationId,
        educationName: summary.educationName,
        institutionName: summary.institutionName,
        instructorName: summary.instructorName,
        submittedAt: summary.attendance.submittedAt || '',
        status: summary.attendance.status,
        rejectReason: summary.attendance.rejectReason,
      })
    }
    if (summary.activity && summary.activity.status !== 'DRAFT') {
      submissions.push({
        id: summary.activity.id,
        type: 'activity',
        educationId: summary.educationId,
        educationName: summary.educationName,
        institutionName: summary.institutionName,
        instructorName: summary.instructorName,
        submittedAt: summary.activity.submittedAt || '',
        status: summary.activity.status,
        rejectReason: summary.activity.rejectReason,
      })
    }
    if (summary.equipment && summary.equipment.status !== 'DRAFT') {
      submissions.push({
        id: summary.equipment.id,
        type: 'equipment',
        educationId: summary.educationId,
        educationName: summary.educationName,
        institutionName: summary.institutionName,
        instructorName: summary.instructorName,
        submittedAt: summary.equipment.submittedAt || '',
        status: summary.equipment.status,
        rejectReason: summary.equipment.rejectReason,
      })
    }
  })

  // Sort by submitted date (newest first)
  return submissions.sort((a, b) =>
    new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  )
}

/**
 * Get all submission groups (grouped by education)
 */
export function getEducationSubmissionGroups(): EducationSubmissionGroup[] {
  const summaries = getAllEducationDocSummaries()
  
  return summaries.map(summary => ({
    educationId: summary.educationId,
    educationName: summary.educationName,
    institutionName: summary.institutionName,
    instructorName: summary.instructorName,
    attendance: summary.attendance ? {
      id: summary.attendance.id,
      type: 'attendance',
      educationId: summary.educationId,
      status: summary.attendance.status,
      submittedAt: summary.attendance.submittedAt,
      submittedBy: summary.instructorName,
      rejectReason: summary.attendance.rejectReason,
    } : undefined,
    activity: summary.activity ? {
      id: summary.activity.id,
      type: 'activity',
      educationId: summary.educationId,
      status: summary.activity.status,
      submittedAt: summary.activity.submittedAt,
      submittedBy: summary.instructorName,
      rejectReason: summary.activity.rejectReason,
    } : undefined,
    equipment: summary.equipment ? {
      id: summary.equipment.id,
      type: 'equipment',
      educationId: summary.educationId,
      status: summary.equipment.status,
      submittedAt: summary.equipment.submittedAt,
      submittedBy: summary.instructorName,
      rejectReason: summary.equipment.rejectReason,
    } : undefined,
    overallStatus: summary.overallStatus,
    submittedAt: summary.lastUpdatedAt,
    lastUpdatedAt: summary.lastUpdatedAt,
  }))
}

/**
 * Get submission groups filtered by instructor name (legacy support)
 */
export function getEducationSubmissionGroupsByInstructor(instructorName: string): EducationSubmissionGroup[] {
  const summaries = getEducationDocSummariesByInstructor(instructorName)
  
  return summaries.map(summary => ({
    educationId: summary.educationId,
    educationName: summary.educationName,
    institutionName: summary.institutionName,
    instructorName: summary.instructorName,
    attendance: summary.attendance ? {
      id: summary.attendance.id,
      type: 'attendance',
      educationId: summary.educationId,
      status: summary.attendance.status,
      submittedAt: summary.attendance.submittedAt,
      submittedBy: summary.instructorName,
      rejectReason: summary.attendance.rejectReason,
    } : undefined,
    activity: summary.activity ? {
      id: summary.activity.id,
      type: 'activity',
      educationId: summary.educationId,
      status: summary.activity.status,
      submittedAt: summary.activity.submittedAt,
      submittedBy: summary.instructorName,
      rejectReason: summary.activity.rejectReason,
    } : undefined,
    equipment: summary.equipment ? {
      id: summary.equipment.id,
      type: 'equipment',
      educationId: summary.educationId,
      status: summary.equipment.status,
      submittedAt: summary.equipment.submittedAt,
      submittedBy: summary.instructorName,
      rejectReason: summary.equipment.rejectReason,
    } : undefined,
    overallStatus: summary.overallStatus,
    submittedAt: summary.lastUpdatedAt,
    lastUpdatedAt: summary.lastUpdatedAt,
  }))
}
