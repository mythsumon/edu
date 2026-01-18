/**
 * Education Status Scheduler
 * 자동으로 교육 상태를 전환하는 프론트엔드 스케줄러
 */

import dayjs from 'dayjs'
import { dataStore, type Education } from './dataStore'

type ScheduledTransition = {
  educationId: string
  targetStatus: string
  scheduledTime: dayjs.Dayjs
  timerId?: NodeJS.Timeout
}

class EducationScheduler {
  private timers: Map<string, ScheduledTransition> = new Map()
  private checkInterval: NodeJS.Timeout | null = null

  /**
   * 스케줄러 시작
   * 앱 로드 시 호출
   */
  start() {
    // 즉시 체크하여 이미 지난 시간 처리
    this.checkAndUpdateStatuses()

    // 1분마다 체크
    this.checkInterval = setInterval(() => {
      this.checkAndUpdateStatuses()
    }, 60000) // 1분

    // 모든 교육의 스케줄 설정
    this.scheduleAllEducations()
  }

  /**
   * 스케줄러 중지
   */
  stop() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }

    // 모든 타이머 정리
    this.timers.forEach((transition) => {
      if (transition.timerId) {
        clearTimeout(transition.timerId)
      }
    })
    this.timers.clear()
  }

  /**
   * 모든 교육의 스케줄을 설정
   */
  private scheduleAllEducations() {
    const educations = dataStore.getEducations()

    educations.forEach((education) => {
      this.scheduleEducation(education)
    })
  }

  /**
   * 특정 교육의 스케줄 설정
   */
  scheduleEducation(education: Education) {
    // 기존 타이머 제거
    this.clearEducationTimers(education.educationId)

    const now = dayjs()

    // openAt 스케줄 설정
    if (education.openAt) {
      const openAt = dayjs(education.openAt)
      
      if (openAt.isValid()) {
        if (openAt.isBefore(now) || openAt.isSame(now)) {
          // 이미 지난 시간이면 즉시 전환
          if (education.status === '오픈예정') {
            this.transitionStatus(education.educationId, '강사공개')
          }
        } else {
          // 미래 시간이면 타이머 설정
          const msUntilOpen = openAt.diff(now)
          const timerId = setTimeout(() => {
            this.transitionStatus(education.educationId, '강사공개')
            this.timers.delete(`${education.educationId}-open`)
          }, msUntilOpen)

          this.timers.set(`${education.educationId}-open`, {
            educationId: education.educationId,
            targetStatus: '강사공개',
            scheduledTime: openAt,
            timerId,
          })
        }
      }
    }

    // closeAt 스케줄 설정
    if (education.closeAt) {
      const closeAt = dayjs(education.closeAt)
      
      if (closeAt.isValid()) {
        if (closeAt.isBefore(now) || closeAt.isSame(now)) {
          // 이미 지난 시간이면 즉시 전환
          if (education.status === '강사공개') {
            this.transitionStatus(education.educationId, '신청마감')
          }
        } else {
          // 미래 시간이면 타이머 설정
          const msUntilClose = closeAt.diff(now)
          const timerId = setTimeout(() => {
            this.transitionStatus(education.educationId, '신청마감')
            this.timers.delete(`${education.educationId}-close`)
          }, msUntilClose)

          this.timers.set(`${education.educationId}-close`, {
            educationId: education.educationId,
            targetStatus: '신청마감',
            scheduledTime: closeAt,
            timerId,
          })
        }
      }
    }
  }

  /**
   * 특정 교육의 타이머 제거
   */
  clearEducationTimers(educationId: string) {
    const openKey = `${educationId}-open`
    const closeKey = `${educationId}-close`

    const openTimer = this.timers.get(openKey)
    if (openTimer?.timerId) {
      clearTimeout(openTimer.timerId)
      this.timers.delete(openKey)
    }

    const closeTimer = this.timers.get(closeKey)
    if (closeTimer?.timerId) {
      clearTimeout(closeTimer.timerId)
      this.timers.delete(closeKey)
    }
  }

  /**
   * 주기적으로 상태를 체크하고 업데이트
   */
  private checkAndUpdateStatuses() {
    const educations = dataStore.getEducations()
    const now = dayjs()

    educations.forEach((education) => {
      // openAt 체크
      if (education.openAt && education.status === '오픈예정') {
        const openAt = dayjs(education.openAt)
        if (openAt.isBefore(now) || openAt.isSame(now)) {
          this.transitionStatus(education.educationId, '강사공개')
        }
      }

      // closeAt 체크
      if (education.closeAt && education.status === '강사공개') {
        const closeAt = dayjs(education.closeAt)
        if (closeAt.isBefore(now) || closeAt.isSame(now)) {
          this.transitionStatus(education.educationId, '신청마감')
        }
      }
    })
  }

  /**
   * 상태 전환 실행
   */
  private transitionStatus(educationId: string, newStatus: string) {
    const education = dataStore.getEducationById(educationId)
    if (!education) return

    // 상태 전환 규칙 확인
    const allowedTransitions: Record<string, string[]> = {
      '오픈예정': ['강사공개', '신청마감'],
      '강사공개': ['신청마감'],
    }

    const currentStatus = education.status
    const allowed = allowedTransitions[currentStatus] || []

    if (!allowed.includes(newStatus)) {
      console.warn(
        `Invalid status transition: ${currentStatus} -> ${newStatus} for education ${educationId}`
      )
      return
    }

    // 상태 업데이트
    dataStore.updateEducation(educationId, { status: newStatus })

    // 이벤트 발행
    this.dispatchStatusUpdateEvent(educationId, newStatus)

    // 스케줄 재설정 (closeAt이 있으면 계속 스케줄링)
    const updatedEducation = dataStore.getEducationById(educationId)
    if (updatedEducation) {
      this.scheduleEducation(updatedEducation)
    }
  }

  /**
   * 상태 업데이트 이벤트 발행
   */
  private dispatchStatusUpdateEvent(educationId: string, newStatus: string) {
    // CustomEvent 발행
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('educationStatusUpdated', {
          detail: {
            educationId,
            newStatus,
            timestamp: new Date().toISOString(),
          },
        })
      )

      // localStorage 이벤트도 발행 (다른 탭과 동기화)
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'educationStatusUpdated',
        newValue: JSON.stringify({ educationId, newStatus }),
      }))
    }
  }
}

// 싱글톤 인스턴스
export const educationScheduler = new EducationScheduler()

// 브라우저 환경에서만 자동 시작
if (typeof window !== 'undefined') {
  // DOM이 로드된 후 시작
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      educationScheduler.start()
    })
  } else {
    educationScheduler.start()
  }

  // 페이지 언로드 시 정리
  window.addEventListener('beforeunload', () => {
    educationScheduler.stop()
  })
}
