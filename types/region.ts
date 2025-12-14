export type SpecialCategory = '도서·벽지' | '50차시' | '특수학급'

export type LocalStat = {
  name: string           // 자치단체
  institutions: number   // 교육기관수
  classes: number        // 학급
  students: number       // 학생수
  bookWall: number       // 도서·벽지
  fiftyHours: number     // 50차시
  specialClass: number   // 특수학급
}

export type RegionSummary = {
  percent: number        // 교육 퍼센트
  bookWall: number
  fiftyHours: number
  specialClass: number
}

export type RegionData = {
  id: 1 | 2 | 3 | 4 | 5 | 6
  name: string           // '1권역'
  color: string          // Tailwind color token or hex
  educationPercent: number
  bookWall: number
  fiftyHours: number
  specialClass: number
  locals: LocalStat[]
  summary: RegionSummary
}

export const REGIONS: RegionData[] = [
  {
    id: 1,
    name: '1권역',
    color: '#2563EB',
    educationPercent: 60,
    bookWall: 10,
    fiftyHours: 50,
    specialClass: 1000,
    locals: [
      { name: '수원시', institutions: 15, classes: 30, students: 450, bookWall: 3, fiftyHours: 15, specialClass: 200 },
      { name: '성남시', institutions: 12, classes: 25, students: 380, bookWall: 4, fiftyHours: 20, specialClass: 180 },
      { name: '의정부시', institutions: 8, classes: 15, students: 220, bookWall: 3, fiftyHours: 15, specialClass: 120 },
    ],
    summary: {
      percent: 60,
      bookWall: 10,
      fiftyHours: 50,
      specialClass: 1000,
    },
  },
  {
    id: 2,
    name: '2권역',
    color: '#F97316',
    educationPercent: 75,
    bookWall: 15,
    fiftyHours: 60,
    specialClass: 1200,
    locals: [
      { name: '안양시', institutions: 18, classes: 35, students: 520, bookWall: 5, fiftyHours: 25, specialClass: 250 },
      { name: '부천시', institutions: 14, classes: 28, students: 420, bookWall: 4, fiftyHours: 20, specialClass: 200 },
      { name: '광명시', institutions: 10, classes: 20, students: 300, bookWall: 6, fiftyHours: 15, specialClass: 150 },
    ],
    summary: {
      percent: 75,
      bookWall: 15,
      fiftyHours: 60,
      specialClass: 1200,
    },
  },
  {
    id: 3,
    name: '3권역',
    color: '#EAB308',
    educationPercent: 45,
    bookWall: 8,
    fiftyHours: 40,
    specialClass: 800,
    locals: [
      { name: '평택시', institutions: 10, classes: 18, students: 270, bookWall: 2, fiftyHours: 10, specialClass: 100 },
      { name: '동두천시', institutions: 6, classes: 12, students: 180, bookWall: 3, fiftyHours: 15, specialClass: 90 },
      { name: '안산시', institutions: 12, classes: 22, students: 330, bookWall: 3, fiftyHours: 15, specialClass: 110 },
    ],
    summary: {
      percent: 45,
      bookWall: 8,
      fiftyHours: 40,
      specialClass: 800,
    },
  },
  {
    id: 4,
    name: '4권역',
    color: '#22C55E',
    educationPercent: 80,
    bookWall: 20,
    fiftyHours: 70,
    specialClass: 1500,
    locals: [
      { name: '고양시', institutions: 20, classes: 40, students: 600, bookWall: 6, fiftyHours: 30, specialClass: 300 },
      { name: '용인시', institutions: 18, classes: 35, students: 525, bookWall: 7, fiftyHours: 25, specialClass: 280 },
      { name: '파주시', institutions: 12, classes: 24, students: 360, bookWall: 7, fiftyHours: 15, specialClass: 220 },
    ],
    summary: {
      percent: 80,
      bookWall: 20,
      fiftyHours: 70,
      specialClass: 1500,
    },
  },
  {
    id: 5,
    name: '5권역',
    color: '#A855F7',
    educationPercent: 55,
    bookWall: 12,
    fiftyHours: 45,
    specialClass: 900,
    locals: [
      { name: '이천시', institutions: 11, classes: 20, students: 300, bookWall: 4, fiftyHours: 15, specialClass: 150 },
      { name: '구리시', institutions: 9, classes: 18, students: 270, bookWall: 3, fiftyHours: 12, specialClass: 140 },
      { name: '남양주시', institutions: 12, classes: 25, students: 375, bookWall: 5, fiftyHours: 18, specialClass: 160 },
    ],
    summary: {
      percent: 55,
      bookWall: 12,
      fiftyHours: 45,
      specialClass: 900,
    },
  },
  {
    id: 6,
    name: '6권역',
    color: '#14B8A6',
    educationPercent: 70,
    bookWall: 18,
    fiftyHours: 55,
    specialClass: 1100,
    locals: [
      { name: '오산시', institutions: 13, classes: 26, students: 390, bookWall: 5, fiftyHours: 20, specialClass: 200 },
      { name: '시흥시', institutions: 11, classes: 22, students: 330, bookWall: 4, fiftyHours: 18, specialClass: 180 },
      { name: '군포시', institutions: 14, classes: 28, students: 420, bookWall: 9, fiftyHours: 17, specialClass: 220 },
    ],
    summary: {
      percent: 70,
      bookWall: 18,
      fiftyHours: 55,
      specialClass: 1100,
    },
  },
]





