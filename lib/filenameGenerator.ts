/**
 * Auto-generate filenames for evidence downloads
 * Format: (강의날짜)(시작일~종료일)학교이름학년-반_문서타입_이름
 */

import dayjs from 'dayjs'

interface FilenameParams {
  sessionDate?: string // 강의날짜 (first session date)
  startDate?: string // 시작일
  endDate?: string // 종료일
  schoolName: string // 학교이름
  gradeClass: string // 학년-반 (e.g., "5학년 6반")
  documentType: '강의계획서' | '교육활동일지' | '출석부' | '활동사진'
  instructorName?: string // 강사 이름 (for 강의계획서, 교육활동일지)
  photoIndex?: number // 사진 번호 (for 활동사진)
  totalPhotos?: number // 총 사진 수 (for 활동사진)
}

/**
 * Generate filename for 강의계획서
 * Format: (강의날짜)(시작일~종료일)학교이름학년-반_강의계획서_이름
 */
export function generateLessonPlanFilename(params: FilenameParams): string {
  const { sessionDate, startDate, endDate, schoolName, gradeClass, instructorName = '' } = params
  
  const datePart = formatDatePart(sessionDate, startDate, endDate)
  const schoolPart = sanitizeFilename(`${schoolName}${gradeClass}`)
  const namePart = sanitizeFilename(instructorName)
  
  return `${datePart}${schoolPart}_강의계획서${namePart ? '_' + namePart : ''}`
}

/**
 * Generate filename for 교육활동일지
 * Format: (강의날짜)(시작일~종료일)학교이름학년-반_교육활동일지_이름
 */
export function generateActivityLogFilename(params: FilenameParams): string {
  const { sessionDate, startDate, endDate, schoolName, gradeClass, instructorName = '' } = params
  
  const datePart = formatDatePart(sessionDate, startDate, endDate)
  const schoolPart = sanitizeFilename(`${schoolName}${gradeClass}`)
  const namePart = sanitizeFilename(instructorName)
  
  return `${datePart}${schoolPart}_교육활동일지${namePart ? '_' + namePart : ''}`
}

/**
 * Generate filename for 출석부
 * Format: (강의날짜)학교이름학년-반_출석부
 */
export function generateAttendanceFilename(params: FilenameParams): string {
  const { sessionDate, schoolName, gradeClass } = params
  
  const datePart = sessionDate ? formatDate(sessionDate) : ''
  const schoolPart = sanitizeFilename(`${schoolName}${gradeClass}`)
  
  return `${datePart}${schoolPart}_출석부`
}

/**
 * Generate filename for 활동사진
 * Format: (강의날짜)(시작일~종료일)학교이름학년-반_활동사진01~NN
 */
export function generatePhotoFilename(params: FilenameParams): string {
  const { sessionDate, startDate, endDate, schoolName, gradeClass, photoIndex, totalPhotos } = params
  
  const datePart = formatDatePart(sessionDate, startDate, endDate)
  const schoolPart = sanitizeFilename(`${schoolName}${gradeClass}`)
  const photoPart = photoIndex !== undefined 
    ? String(photoIndex).padStart(2, '0')
    : (totalPhotos ? `01~${String(totalPhotos).padStart(2, '0')}` : '01')
  
  return `${datePart}${schoolPart}_활동사진${photoPart}`
}

/**
 * Format date part: (강의날짜)(시작일~종료일)
 */
function formatDatePart(sessionDate?: string, startDate?: string, endDate?: string): string {
  const parts: string[] = []
  
  if (sessionDate) {
    parts.push(`(${formatDate(sessionDate)})`)
  }
  
  if (startDate && endDate) {
    parts.push(`(${formatDate(startDate)}~${formatDate(endDate)})`)
  } else if (startDate) {
    parts.push(`(${formatDate(startDate)})`)
  }
  
  return parts.join('')
}

/**
 * Format date to YYYYMMDD
 */
function formatDate(dateStr: string): string {
  try {
    // Handle various date formats
    const date = dayjs(dateStr)
    if (!date.isValid()) {
      // Try parsing as is
      return dateStr.replace(/[^0-9]/g, '').slice(0, 8)
    }
    return date.format('YYYYMMDD')
  } catch {
    return dateStr.replace(/[^0-9]/g, '').slice(0, 8)
  }
}

/**
 * Sanitize filename: remove invalid characters
 */
function sanitizeFilename(name: string): string {
  return name
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid filename characters
    .replace(/\s+/g, '') // Remove spaces
    .trim()
}

