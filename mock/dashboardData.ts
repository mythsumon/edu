// Mock data for dashboard components
import type { Region } from '@/types/region'

export const mockRegionData: Region[] = [
  {
    id: 'region1',
    name: '1권역',
    totalCount: 120,
    completedCount: 85,
    inProgressCount: 25,
    notStartedCount: 10,
    progress: 70.8,
    institutions: [
      { id: 'inst1', name: '경기교육청', progress: 75 },
      { id: 'inst2', name: '수원교육청', progress: 68 },
      { id: 'inst3', name: '성남교육청', progress: 72 },
    ]
  },
  {
    id: 'region2',
    name: '2권역',
    totalCount: 95,
    completedCount: 60,
    inProgressCount: 25,
    notStartedCount: 10,
    progress: 63.2,
    institutions: [
      { id: 'inst4', name: '안양교육청', progress: 65 },
      { id: 'inst5', name: '부천교육청', progress: 60 },
    ]
  },
  {
    id: 'region3',
    name: '3권역',
    totalCount: 110,
    completedCount: 78,
    inProgressCount: 22,
    notStartedCount: 10,
    progress: 70.9,
    institutions: [
      { id: 'inst6', name: '광명교육청', progress: 72 },
      { id: 'inst7', name: '과천교육청', progress: 69 },
    ]
  },
  {
    id: 'region4',
    name: '4권역',
    totalCount: 85,
    completedCount: 55,
    inProgressCount: 20,
    notStartedCount: 10,
    progress: 64.7,
    institutions: [
      { id: 'inst8', name: '시흥교육청', progress: 66 },
      { id: 'inst9', name: '군포교육청', progress: 62 },
    ]
  },
  {
    id: 'region5',
    name: '5권역',
    totalCount: 105,
    completedCount: 75,
    inProgressCount: 20,
    notStartedCount: 10,
    progress: 71.4,
    institutions: [
      { id: 'inst10', name: '의왕교육청', progress: 73 },
      { id: 'inst11', name: '하남교육청', progress: 70 },
    ]
  },
  {
    id: 'region6',
    name: '6권역',
    totalCount: 90,
    completedCount: 65,
    inProgressCount: 15,
    notStartedCount: 10,
    progress: 72.2,
    institutions: [
      { id: 'inst12', name: '이천교육청', progress: 74 },
      { id: 'inst13', name: '여주교육청', progress: 71 },
    ]
  }
]

export const mockSpecialItems = [
  {
    id: 'remote',
    name: '도서벽지',
    totalCount: 45,
    completedCount: 32,
    inProgressCount: 8,
    notStartedCount: 5,
    progress: 71.1,
    target: '원격지역 교육 지원'
  },
  {
    id: 'sessions50',
    name: '50차시',
    totalCount: 180,
    completedCount: 125,
    inProgressCount: 35,
    notStartedCount: 20,
    progress: 69.4,
    target: '50차시 프로그램 운영'
  },
  {
    id: 'special',
    name: '특수학급',
    totalCount: 30,
    completedCount: 22,
    inProgressCount: 5,
    notStartedCount: 3,
    progress: 73.3,
    target: '특수학급 교육 지원'
  }
]

export const mockKpiData = [
  {
    id: 'total-programs',
    title: '전체 프로그램 수',
    value: '595',
    change: '+12%',
    changeType: 'positive',
    description: '전월 대비 증가'
  },
  {
    id: 'in-progress',
    title: '진행 중인 교육',
    value: '130',
    change: '+5%',
    changeType: 'positive',
    description: '현재 진행 중'
  },
  {
    id: 'completed',
    title: '완료된 교육',
    value: '420',
    change: '+8%',
    changeType: 'positive',
    description: '누적 완료 수'
  },
  {
    id: 'instructors',
    title: '등록된 강사',
    value: '285',
    change: '+3%',
    changeType: 'positive',
    description: '활성 강사 수'
  }
]

export const mockChartData = [
  { name: '1월', programs: 45, completed: 32 },
  { name: '2월', programs: 52, completed: 38 },
  { name: '3월', programs: 60, completed: 45 },
  { name: '4월', programs: 58, completed: 42 },
  { name: '5월', programs: 65, completed: 50 },
  { name: '6월', programs: 70, completed: 55 },
]