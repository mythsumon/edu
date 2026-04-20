'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Drawer, Tabs, Button, Space, Badge } from 'antd'
import { Eye, Download, CheckCircle2, XCircle, ChevronRight } from 'lucide-react'
import type { EducationDocSummary } from '@/entities/submission'
import { getEvidenceByEducationGrouped } from '@/entities/submission'
import { generateAttendanceFilename, generateActivityLogFilename } from '@/lib/filenameGenerator'
import { EducationFeeCalculationFlow } from './EducationFeeCalculationFlow'
import { dataStore } from '@/lib/dataStore'
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
  onViewEvidence?: (id: string) => void
  onViewLessonPlan?: (id: string) => void
  onApprove?: (type: 'attendance' | 'activity' | 'equipment' | 'evidence' | 'lessonPlan', id: string) => void
  onReject?: (type: 'attendance' | 'activity' | 'equipment' | 'evidence' | 'lessonPlan', id: string, reason: string) => void
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
  onViewEvidence,
  onViewLessonPlan,
  onApprove,
  onReject,
}) => {
  const router = useRouter()
  const evidence = getEvidenceByEducationGrouped(educationId)
  type ActivityFilter = 'ALL' | 'NOT_WRITTEN' | 'SUBMITTED' | 'OVERDUE'
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('ALL')
  const [showAggregate, setShowAggregate] = useState(false)

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
      {summary && (() => {
        // 교육 정보 가져오기
        const education = dataStore.getEducations().find(e => e.educationId === summary.educationId)
        const assignments = dataStore.getInstructorAssignments()
        const assignment = assignments.find(a => a.educationId === summary.educationId)

        type ActivityEntryStatus = 'NOT_WRITTEN' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'OVERDUE' | 'DRAFT'
        interface ActivityEntry {
          key: string
          date: string
          session?: number
          instructorId: string
          instructorName: string
          role: 'MAIN' | 'ASSISTANT'
          status: ActivityEntryStatus
          submittedAt?: string
          submissionId?: string
        }

        const activityEntries: ActivityEntry[] = []
        const consumedMatchedInstructors = new Set<string>()

        // 1차: assignment.lessons, 2차: education.lessons
        type LessonLike = {
          session?: number
          date: string
          mainInstructors?: Array<{ id: string; name: string }> | number
          assistantInstructors?: Array<{ id: string; name: string }> | number
          mainInstructorName?: string
          assistantInstructorName?: string
        }
        const rawLessons: LessonLike[] =
          (assignment?.lessons as LessonLike[] | undefined)?.length
            ? (assignment!.lessons as LessonLike[])
            : ((education?.lessons as LessonLike[] | undefined) ?? [])

        const sortedLessons = rawLessons
          .slice()
          .sort((a, b) => a.date.localeCompare(b.date))

        // Fallback: lessons 데이터가 없으면 education 기간/차시로 가상 세션 생성
        if (sortedLessons.length === 0) {
          const DEFAULT_MIN_SESSIONS = 4
          const totalSessions = Math.max(
            education?.totalSessions ?? 0,
            summary.activity?.count ?? 0,
            DEFAULT_MIN_SESSIONS
          )
          const start = education?.periodStart
            ? dayjs(education.periodStart)
            : summary.activity?.submittedAt
              ? dayjs(summary.activity.submittedAt)
              : dayjs()
          const rawEnd = education?.periodEnd ? dayjs(education.periodEnd) : start
          // 기간이 너무 좁으면 차시 수만큼 펼쳐서 날짜 구분이 되도록 함
          const end =
            rawEnd.diff(start, 'day') < totalSessions - 1
              ? start.add(totalSessions - 1, 'day')
              : rawEnd
          const totalDays = Math.max(end.diff(start, 'day'), 0)

          // 날짜마다 투입될 강사 목록: 주강사 1 + 보조강사 N
          const mainInstructor = {
            id: education?.mainInstructorId || `main-${summary.educationId}`,
            name: summary.instructorName,
          }
          const assistantIds = education?.assistantInstructorIds ?? []
          const DEFAULT_ASSISTANT_COUNT = 2
          const assistantCount = Math.max(assistantIds.length, DEFAULT_ASSISTANT_COUNT)
          const assistantInstructors = Array.from({ length: assistantCount }, (_, idx) => ({
            id: assistantIds[idx] || `assist-${summary.educationId}-${idx}`,
            name: assistantIds[idx]
              ? `보조강사 ${idx + 1}`
              : `보조강사 ${idx + 1}`,
          }))

          for (let i = 0; i < totalSessions; i += 1) {
            const offset =
              totalSessions <= 1 ? 0 : Math.round((totalDays * i) / (totalSessions - 1))
            sortedLessons.push({
              session: i + 1,
              date: start.add(offset, 'day').format('YYYY-MM-DD'),
              mainInstructors: [mainInstructor],
              assistantInstructors,
            })
          }
        }

        const resolveArray = (
          value: Array<{ id: string; name: string }> | number | undefined,
          fallbackName: string | undefined,
          idPrefix: string
        ): Array<{ id: string; name: string }> => {
          if (Array.isArray(value)) return value
          if (typeof value === 'number' && value > 0 && fallbackName) {
            return Array.from({ length: value }, (_, idx) => ({
              id: `${idPrefix}-${idx}`,
              name: fallbackName,
            }))
          }
          return []
        }

        sortedLessons.forEach((lesson) => {
          const daysSince = dayjs().startOf('day').diff(dayjs(lesson.date).startOf('day'), 'day')

          const push = (inst: { id: string; name: string }, role: 'MAIN' | 'ASSISTANT') => {
            let status: ActivityEntryStatus
            let submittedAt: string | undefined
            let submissionId: string | undefined

            const canConsumeSummary =
              !!summary.activity &&
              inst.name === summary.instructorName &&
              !consumedMatchedInstructors.has(inst.id)

            if (canConsumeSummary && summary.activity) {
              status = (summary.activity.status as ActivityEntryStatus) || 'SUBMITTED'
              submittedAt = summary.activity.submittedAt
              submissionId = summary.activity.id
              consumedMatchedInstructors.add(inst.id)
            } else if (daysSince > 3) {
              status = 'OVERDUE'
            } else {
              status = 'NOT_WRITTEN'
            }

            activityEntries.push({
              key: `${lesson.date}-${inst.id}-${role}-${lesson.session ?? ''}`,
              date: lesson.date,
              session: lesson.session,
              instructorId: inst.id,
              instructorName: inst.name,
              role,
              status,
              submittedAt,
              submissionId,
            })
          }

          const mainArr = resolveArray(
            lesson.mainInstructors,
            lesson.mainInstructorName || summary.instructorName,
            `main-${lesson.date}`
          )
          const assistArr = resolveArray(
            lesson.assistantInstructors,
            lesson.assistantInstructorName,
            `assist-${lesson.date}`
          )
          mainArr.forEach((inst) => push(inst, 'MAIN'))
          assistArr.forEach((inst) => push(inst, 'ASSISTANT'))
        })

        const totalEntries = activityEntries.length
        const completedEntries = activityEntries.filter(
          (e) => e.status === 'SUBMITTED' || e.status === 'APPROVED'
        ).length
        const overdueEntries = activityEntries.filter((e) => e.status === 'OVERDUE').length

        const entriesByDate = activityEntries.reduce<Record<string, ActivityEntry[]>>((acc, e) => {
          ;(acc[e.date] = acc[e.date] || []).push(e)
          return acc
        }, {})
        const sortedDates = Object.keys(entriesByDate).sort()

        const renderEntryStatusBadge = (status: ActivityEntryStatus) => {
          const map: Record<ActivityEntryStatus, { label: string; className: string }> = {
            APPROVED: {
              label: '승인됨',
              className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            },
            SUBMITTED: {
              label: '제출완료',
              className: 'bg-blue-50 text-blue-700 border-blue-200',
            },
            DRAFT: {
              label: '작성중',
              className: 'bg-amber-50 text-amber-700 border-amber-200',
            },
            REJECTED: {
              label: '반려됨',
              className: 'bg-red-50 text-red-700 border-red-200',
            },
            OVERDUE: {
              label: '기한 초과',
              className: 'bg-red-100 text-red-700 border-red-300',
            },
            NOT_WRITTEN: {
              label: '미작성',
              className: 'bg-slate-50 text-slate-600 border-slate-200',
            },
          }
          const conf = map[status]
          return (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${conf.className}`}
            >
              {conf.label}
            </span>
          )
        }

        const handleEntryClick = (entry: ActivityEntry) => {
          if (
            (entry.status === 'SUBMITTED' || entry.status === 'APPROVED') &&
            entry.submissionId
          ) {
            router.push(`/admin/activity-logs/${entry.submissionId}`)
          }
        }

        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">기본 정보</h3>
              <div className="space-y-2 text-sm">
                <div><span className="font-medium">교육ID:</span> {summary.educationId}</div>
                <div><span className="font-medium">기관명:</span> {summary.institutionName}</div>
                <div><span className="font-medium">강사명:</span> {summary.instructorName}</div>
              </div>
            </div>

            {/* 교육비 계산 흐름 */}
            {education && (
              <EducationFeeCalculationFlow
                education={education}
                assignments={assignments}
                policy="STATUS_BASED"
              />
            )}

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
                              onClick={() => {
                                if (summary.attendance?.id) {
                                  // 출석부가 있으면 상세 페이지로 이동
                                  router.push(`/instructor/attendance/${summary.attendance.id}`)
                                } else {
                                  // 출석부가 없으면 작성 페이지로 이동
                                  onViewAttendance(summary.educationId)
                                }
                              }}
                            >
                              {summary.attendance ? '상세보기' : '작성하기'}
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
                          {isAdmin ? '없음' : '출석부가 제출되지 않았습니다.'}
                        </div>
                        {!isAdmin && (
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
                        )}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'activity',
                label: `교육 활동 일지 ${totalEntries > 0 ? `(${completedEntries}/${totalEntries})` : ''}`,
                children: (() => {
                  // 필터 적용
                  const filterPredicate = (e: ActivityEntry) => {
                    if (activityFilter === 'ALL') return true
                    if (activityFilter === 'NOT_WRITTEN') return e.status === 'NOT_WRITTEN'
                    if (activityFilter === 'SUBMITTED')
                      return e.status === 'SUBMITTED' || e.status === 'APPROVED'
                    if (activityFilter === 'OVERDUE') return e.status === 'OVERDUE'
                    return true
                  }
                  const filteredEntries = activityEntries.filter(filterPredicate)
                  const filteredByDate = filteredEntries.reduce<Record<string, ActivityEntry[]>>(
                    (acc, e) => {
                      ;(acc[e.date] = acc[e.date] || []).push(e)
                      return acc
                    },
                    {}
                  )
                  const filteredDates = Object.keys(filteredByDate).sort()
                  const notWrittenCount = activityEntries.filter(
                    (e) => e.status === 'NOT_WRITTEN'
                  ).length
                  const progressPct =
                    totalEntries > 0 ? Math.round((completedEntries / totalEntries) * 100) : 0

                  const filterChips: Array<{
                    key: ActivityFilter
                    label: string
                    count: number
                    activeClass: string
                  }> = [
                    {
                      key: 'ALL',
                      label: '전체',
                      count: totalEntries,
                      activeClass: 'bg-slate-900 text-white border-slate-900',
                    },
                    {
                      key: 'NOT_WRITTEN',
                      label: '미작성',
                      count: notWrittenCount,
                      activeClass: 'bg-slate-700 text-white border-slate-700',
                    },
                    {
                      key: 'SUBMITTED',
                      label: '제출완료',
                      count: completedEntries,
                      activeClass: 'bg-blue-600 text-white border-blue-600',
                    },
                    {
                      key: 'OVERDUE',
                      label: '기한초과',
                      count: overdueEntries,
                      activeClass: 'bg-red-600 text-white border-red-600',
                    },
                  ]

                  const getInitial = (name: string) =>
                    name && name.length > 0 ? name.charAt(name.length >= 2 ? 0 : 0) : '?'

                  return (
                    <div className="space-y-4">
                      {totalEntries === 0 ? (
                        <div className="text-center py-8 text-gray-400">
                          활동 일지를 생성할 기초 정보(교육 기간/강사)가 부족합니다.
                        </div>
                      ) : (
                        <>
                          {/* 요약 + 진행률 */}
                          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="flex items-baseline justify-between mb-2">
                              <div className="text-sm text-slate-600">작성 진행률</div>
                              <div className="text-sm">
                                <span className="text-2xl font-bold text-slate-900">
                                  {completedEntries}
                                </span>
                                <span className="text-slate-400 font-medium"> / {totalEntries}</span>
                                <span className="ml-1.5 text-xs font-semibold text-blue-600">
                                  ({progressPct}%)
                                </span>
                              </div>
                            </div>
                            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                                style={{ width: `${progressPct}%` }}
                              />
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <span className="inline-flex items-center gap-1">
                                <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
                                기한초과 {overdueEntries}
                              </span>
                              <span className="inline-flex items-center gap-1">
                                <span className="inline-block h-2 w-2 rounded-full bg-slate-400" />
                                미작성 {notWrittenCount}
                              </span>
                              <span className="ml-auto text-[11px] text-slate-400">
                                수업일 +3일 경과 시 기한초과 처리
                              </span>
                            </div>
                          </div>

                          {/* 필터 칩 */}
                          <div className="flex flex-wrap items-center gap-2">
                            {filterChips.map((chip) => {
                              const active = activityFilter === chip.key
                              return (
                                <button
                                  key={chip.key}
                                  type="button"
                                  onClick={() => setActivityFilter(chip.key)}
                                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                                    active
                                      ? chip.activeClass
                                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                  }`}
                                >
                                  {chip.label}
                                  <span
                                    className={`inline-flex min-w-[18px] justify-center rounded-full px-1 text-[10px] font-semibold ${
                                      active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {chip.count}
                                  </span>
                                </button>
                              )
                            })}
                          </div>

                          {/* 날짜별 컴팩트 리스트 */}
                          {filteredDates.length === 0 ? (
                            <div className="py-8 text-center text-sm text-slate-400">
                              해당 조건의 일지가 없습니다.
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {filteredDates.map((date) => {
                                const dateEntries = filteredByDate[date]
                                const dateLabel = dayjs(date).format('M월 D일 (dd)')
                                const mainCount = dateEntries.filter(
                                  (e) => e.role === 'MAIN'
                                ).length
                                const assistCount = dateEntries.filter(
                                  (e) => e.role === 'ASSISTANT'
                                ).length
                                const doneCount = dateEntries.filter(
                                  (e) => e.status === 'SUBMITTED' || e.status === 'APPROVED'
                                ).length
                                return (
                                  <div
                                    key={date}
                                    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
                                  >
                                    {/* 날짜 헤더 */}
                                    <div className="flex items-center justify-between bg-slate-50 px-4 py-2.5">
                                      <div className="flex items-center gap-2">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-blue-500 text-[11px] font-bold text-white">
                                          {dayjs(date).format('D')}
                                        </span>
                                        <span className="text-sm font-semibold text-slate-800">
                                          {dateLabel}
                                        </span>
                                        <span className="text-xs text-slate-500">
                                          · 주{mainCount} 보조{assistCount}
                                        </span>
                                      </div>
                                      <span className="text-xs font-medium text-slate-500">
                                        {doneCount}/{dateEntries.length} 제출
                                      </span>
                                    </div>

                                    {/* 강사별 행 */}
                                    <ul className="divide-y divide-slate-100">
                                      {dateEntries.map((entry) => {
                                        const isClickable =
                                          (entry.status === 'SUBMITTED' ||
                                            entry.status === 'APPROVED') &&
                                          !!entry.submissionId
                                        const isMain = entry.role === 'MAIN'
                                        const avatarClass = isMain
                                          ? 'bg-indigo-100 text-indigo-700'
                                          : 'bg-purple-100 text-purple-700'
                                        const roleLabel = isMain ? '주강사' : '보조강사'
                                        const roleBadgeClass = isMain
                                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                                          : 'bg-purple-50 text-purple-700 border-purple-200'
                                        return (
                                          <li
                                            key={entry.key}
                                            onClick={() => handleEntryClick(entry)}
                                            className={`group flex items-center gap-3 px-4 py-2.5 transition-colors ${
                                              isClickable
                                                ? 'cursor-pointer hover:bg-blue-50/50'
                                                : 'hover:bg-slate-50/60'
                                            }`}
                                          >
                                            <div
                                              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarClass}`}
                                            >
                                              {getInitial(entry.instructorName)}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                              <div className="flex items-center gap-1.5 text-sm">
                                                <span className="truncate font-medium text-slate-900">
                                                  {entry.instructorName}
                                                </span>
                                                <span
                                                  className={`inline-flex shrink-0 items-center rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${roleBadgeClass}`}
                                                >
                                                  {roleLabel}
                                                </span>
                                              </div>
                                              <div className="mt-0.5 flex items-center gap-2 text-[11px] text-slate-500">
                                                {entry.session !== undefined && (
                                                  <span>{entry.session}차시</span>
                                                )}
                                                {entry.submittedAt && (
                                                  <>
                                                    <span className="text-slate-300">·</span>
                                                    <span>
                                                      제출{' '}
                                                      {dayjs(entry.submittedAt).format('MM-DD HH:mm')}
                                                    </span>
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                            <div className="shrink-0">
                                              {renderEntryStatusBadge(entry.status)}
                                            </div>
                                            {isClickable && (
                                              <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-blue-500" />
                                            )}
                                          </li>
                                        )
                                      })}
                                    </ul>
                                  </div>
                                )
                              })}
                            </div>
                          )}

                        {/* 기존 승인/반려/다운로드 (단일 집계 기준) - 접힘 */}
                        {summary.activity && (
                          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50">
                            <button
                              type="button"
                              onClick={() => setShowAggregate((v) => !v)}
                              className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
                            >
                              <span>집계 문서 작업 (제출본 기준)</span>
                              <ChevronRight
                                className={`h-4 w-4 transition-transform ${
                                  showAggregate ? 'rotate-90' : ''
                                }`}
                              />
                            </button>
                            {showAggregate && (
                              <div className="border-t border-slate-200 p-3">
                            <Space wrap>
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
                                      onClick={() =>
                                        onApprove('activity', summary.activity!.id)
                                      }
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
                            {summary.activity.rejectReason && (
                              <div className="mt-2 text-sm text-red-600">
                                반려 사유: {summary.activity.rejectReason}
                              </div>
                            )}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  )
                })(),
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
                          {isAdmin ? '없음' : '교구 확인서가 제출되지 않았습니다.'}
                        </div>
                        {!isAdmin && (
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
                        )}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'evidence',
                label: `증빙자료 ${summary.evidence ? `(${summary.evidence.count})` : ''}`,
                children: (
                  <div className="space-y-4">
                    {summary.evidence ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            {getStatusBadge(summary.evidence.status)}
                            {summary.evidence.rejectReason && (
                              <div className="mt-2 text-sm text-red-600">
                                반려 사유: {summary.evidence.rejectReason}
                              </div>
                            )}
                            {summary.evidence.submittedAt && (
                              <div className="mt-1 text-xs text-gray-500">
                                제출일: {dayjs(summary.evidence.submittedAt).format('YYYY-MM-DD HH:mm')}
                              </div>
                            )}
                          </div>
                        </div>
                        <Space>
                          {!isAdmin && onViewEvidence && (
                            <Button
                              type="primary"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => {
                                if (summary.evidence?.id) {
                                  onViewEvidence(summary.evidence.id)
                                } else {
                                  onViewEvidence(summary.educationId)
                                }
                              }}
                            >
                              {summary.evidence.status === 'DRAFT' ? '작성하기' : '수정하기'}
                            </Button>
                          )}
                          {isAdmin && onViewEvidence && (
                            <Button
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => onViewEvidence(summary.evidence!.id)}
                            >
                              상세보기
                            </Button>
                          )}
                          {isAdmin && summary.evidence.status === 'SUBMITTED' && (
                            <>
                              {onApprove && (
                                <Button
                                  type="primary"
                                  icon={<CheckCircle2 className="w-4 h-4" />}
                                  onClick={() => onApprove('evidence', summary.evidence!.id)}
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
                                      onReject('evidence', summary.evidence!.id, reason)
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
                          {isAdmin ? '없음' : '증빙자료가 제출되지 않았습니다.'}
                        </div>
                        {!isAdmin && (
                          <Space>
                            {onViewEvidence && (
                              <Button
                                type="primary"
                                icon={<Eye className="w-4 h-4" />}
                                onClick={() => {
                                  // 증빙자료가 없으면 educationId를 전달하여 새로 생성하거나 찾기
                                  onViewEvidence(summary.educationId)
                                }}
                              >
                                작성하기
                              </Button>
                            )}
                          </Space>
                        )}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                key: 'lessonPlan',
                label: `강의계획서 ${summary.lessonPlan ? `(${summary.lessonPlan.count})` : ''}`,
                children: (
                  <div className="space-y-4">
                    {summary.lessonPlan ? (
                      <>
                        <div className="flex items-center justify-between">
                          <div>
                            {getStatusBadge(summary.lessonPlan.status)}
                            {summary.lessonPlan.rejectReason && (
                              <div className="mt-2 text-sm text-red-600">
                                반려 사유: {summary.lessonPlan.rejectReason}
                              </div>
                            )}
                            {summary.lessonPlan.submittedAt && (
                              <div className="mt-1 text-xs text-gray-500">
                                제출일: {dayjs(summary.lessonPlan.submittedAt).format('YYYY-MM-DD HH:mm')}
                              </div>
                            )}
                          </div>
                        </div>
                        <Space>
                          {!isAdmin && onViewLessonPlan && (
                            <Button
                              type="primary"
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => {
                                if (summary.lessonPlan?.id) {
                                  router.push(`/instructor/schedule/${summary.educationId}/lesson-plan`)
                                } else {
                                  router.push(`/instructor/schedule/${summary.educationId}/lesson-plan`)
                                }
                              }}
                            >
                              {summary.lessonPlan.status === 'DRAFT' ? '작성하기' : '수정하기'}
                            </Button>
                          )}
                          {isAdmin && onViewLessonPlan && (
                            <Button
                              icon={<Eye className="w-4 h-4" />}
                              onClick={() => onViewLessonPlan(summary.lessonPlan!.id)}
                            >
                              상세보기
                            </Button>
                          )}
                          {isAdmin && summary.lessonPlan.status === 'SUBMITTED' && (
                            <>
                              {onApprove && (
                                <Button
                                  type="primary"
                                  icon={<CheckCircle2 className="w-4 h-4" />}
                                  onClick={() => onApprove('lessonPlan', summary.lessonPlan!.id)}
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
                                      onReject('lessonPlan', summary.lessonPlan!.id, reason)
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
                          {isAdmin ? '없음' : '강의계획서가 제출되지 않았습니다.'}
                        </div>
                        {!isAdmin && (
                          <Space>
                            {onViewLessonPlan && (
                              <Button
                                type="primary"
                                icon={<Eye className="w-4 h-4" />}
                                onClick={() => {
                                  router.push(`/instructor/schedule/${summary.educationId}/lesson-plan`)
                                }}
                              >
                                작성하기
                              </Button>
                            )}
                          </Space>
                        )}
                      </div>
                    )}
                  </div>
                ),
              },
            ]}
          />
          </div>
        )
      })()}
    </Drawer>
  )
}

