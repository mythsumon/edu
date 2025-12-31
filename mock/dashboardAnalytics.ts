/**
 * Mock data for Admin Dashboard Analytics
 */

import dayjs from 'dayjs'

// Generate trend data for the last 14 days
export const generateAssignmentsTrendData = () => {
  const data = []
  for (let i = 13; i >= 0; i--) {
    const date = dayjs().subtract(i, 'days')
    data.push({
      date: date.format('MM/DD'),
      assignments: Math.floor(Math.random() * 20) + 10,
      applications: Math.floor(Math.random() * 30) + 15,
    })
  }
  return data
}

// Status breakdown data
export const statusBreakdownData = [
  { name: '대기', value: 12, color: '#94a3b8' },
  { name: 'Open 예정', value: 8, color: '#3b82f6' },
  { name: '강사공개', value: 15, color: '#10b981' },
  { name: '신청마감', value: 20, color: '#f59e0b' },
  { name: '확정', value: 25, color: '#8b5cf6' },
  { name: '진행중', value: 18, color: '#06b6d4' },
  { name: '종료', value: 30, color: '#84cc16' },
  { name: '취소', value: 5, color: '#ef4444' },
]

// Evidence review data
export const evidenceReviewData = [
  { status: '1월 1주', pending: 12, approved: 45, rejected: 3 },
  { status: '1월 2주', pending: 8, approved: 52, rejected: 2 },
  { status: '1월 3주', pending: 15, approved: 38, rejected: 5 },
  { status: '1월 4주', pending: 10, approved: 48, rejected: 4 },
]

// KPI data
export interface KPIMetric {
  label: string
  value: string | number
  delta?: {
    value: string
    isPositive: boolean
  }
  description?: string
}

export const kpiMetrics: KPIMetric[] = [
  {
    label: '전체 프로그램',
    value: '128',
    delta: { value: '지난 주 대비 +8개', isPositive: true },
    description: '총 등록된 교육 프로그램 수',
  },
  {
    label: '전체 수업',
    value: '1,542',
    delta: { value: '지난 주 대비 +124개', isPositive: true },
    description: '전체 수업 세션 수',
  },
  {
    label: '배정된 강사',
    value: '89',
    delta: { value: '지난 주 대비 +12명', isPositive: true },
    description: '현재 배정된 강사 수',
  },
  {
    label: '미배정 수업',
    value: '23',
    delta: { value: '지난 주 대비 -5개', isPositive: true },
    description: '강사가 배정되지 않은 수업',
  },
  {
    label: '검토 대기 증빙',
    value: '45',
    delta: { value: '지난 주 대비 +8개', isPositive: false },
    description: '검토가 필요한 증빙 자료',
  },
  {
    label: '거절된 증빙',
    value: '12',
    delta: { value: '지난 주 대비 +2개', isPositive: false },
    description: '거절된 증빙 자료 수',
  },
]


