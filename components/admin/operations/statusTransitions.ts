// Status transition rules for education status changes
export type EducationStatus = 
  | '대기'
  | '오픈예정'
  | '강사공개'
  | '신청마감'
  | '확정'
  | '교육 진행 중'
  | '종료'
  | '취소'

// Define allowed transitions
export const statusTransitions: Record<EducationStatus, EducationStatus[]> = {
  '대기': ['오픈예정'],
  '오픈예정': ['강사공개', '신청마감'],
  '강사공개': ['신청마감'],
  '신청마감': ['확정'],
  '확정': ['교육 진행 중'],
  '교육 진행 중': ['종료'],
  '종료': [], // No transitions allowed
  '취소': [], // No transitions allowed
}

// Status descriptions for tooltips
export const statusDescriptions: Record<EducationStatus, string> = {
  '대기': '교육이 등록되었지만 아직 진행되지 않은 초기 상태입니다. (관리자 전용)',
  '오픈예정': '교육이 예정되어 있지만 아직 강사에게 공개되지 않은 상태입니다.',
  '강사공개': '강사에게 교육이 노출되어 신청을 받을 수 있는 상태입니다.',
  '신청마감': '강사 신청이 마감된 상태입니다.',
  '확정': '강사 배정이 완료되어 교육이 확정된 상태입니다.',
  '교육 진행 중': '교육이 현재 진행 중인 상태입니다.',
  '종료': '교육이 완료된 상태입니다.',
  '취소': '교육이 취소된 상태입니다.',
}

// Status icons (emoji for simplicity)
export const statusIcons: Record<EducationStatus, string> = {
  '대기': '⏳',
  '오픈예정': '📅',
  '강사공개': '👤',
  '신청마감': '🔒',
  '확정': '✅',
  '교육 진행 중': '▶',
  '종료': '🏁',
  '취소': '❌',
}

// Check if a status transition is allowed
export function canTransition(from: EducationStatus, to: EducationStatus): boolean {
  return statusTransitions[from]?.includes(to) ?? false
}

// Get allowed next statuses for a given status
export function getAllowedNextStatuses(currentStatus: EducationStatus): EducationStatus[] {
  return statusTransitions[currentStatus] || []
}

// Check if status change is irreversible
export function isIrreversibleTransition(from: EducationStatus, to: EducationStatus): boolean {
  // 신청마감 → 확정 is irreversible
  if (from === '신청마감' && to === '확정') {
    return true
  }
  // 확정 → 교육 진행 중 is also significant
  if (from === '확정' && to === '교육 진행 중') {
    return true
  }
  return false
}

// Check if status allows instructor applications
export function allowsInstructorApplications(status: EducationStatus): boolean {
  return status === '강사공개'
}

