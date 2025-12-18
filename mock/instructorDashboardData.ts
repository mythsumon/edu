// Mock data for Instructor Dashboard
export interface InstructorCourse {
  id: string;
  educationName: string;
  institutionName: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  status: '예정' | '진행중' | '완료';
  region?: string;
  classInfo: string;
  timeRange: string; // e.g. "09:00~12:10"
}

export interface InstructorCalendarEvent {
  date: string; // YYYY-MM-DD
  title: string;
  status: '예정' | '진행중' | '완료';
}

// Mock data for "내 출강 리스트" (at least 8 rows)
export const instructorCourses: InstructorCourse[] = [
  {
    id: '1',
    educationName: '블록코딩 기초 프로그램',
    institutionName: '서울초등학교',
    startDate: '2025-03-01',
    endDate: '2025-06-30',
    status: '진행중',
    region: '서울',
    classInfo: '3학년 2반',
    timeRange: '09:00~12:10'
  },
  {
    id: '2',
    educationName: 'AI 체험 워크숍',
    institutionName: '경기중학교',
    startDate: '2025-03-15',
    endDate: '2025-05-30',
    status: '진행중',
    region: '경기',
    classInfo: '2학년 1반',
    timeRange: '14:00~16:00'
  },
  {
    id: '3',
    educationName: '로봇 공학 입문',
    institutionName: '인천고등학교',
    startDate: '2025-04-01',
    endDate: '2025-07-31',
    status: '예정',
    region: '인천',
    classInfo: '1학년 3반',
    timeRange: '10:00~12:00'
  },
  {
    id: '4',
    educationName: '창의적 문제 해결 프로그램',
    institutionName: '부산초등학교',
    startDate: '2025-03-20',
    endDate: '2025-06-20',
    status: '진행중',
    region: '부산',
    classInfo: '4학년 1반',
    timeRange: '13:00~15:00'
  },
  {
    id: '5',
    educationName: '디지털 리터러시 기초',
    institutionName: '대구중학교',
    startDate: '2025-04-05',
    endDate: '2025-07-05',
    status: '예정',
    region: '대구',
    classInfo: '1학년 2반',
    timeRange: '09:30~11:30'
  },
  {
    id: '6',
    educationName: '미디어 아트 창작',
    institutionName: '광주고등학교',
    startDate: '2025-03-10',
    endDate: '2025-06-10',
    status: '진행중',
    region: '광주',
    classInfo: '2학년 3반',
    timeRange: '15:00~17:00'
  },
  {
    id: '7',
    educationName: '게임 디자인과 프로그래밍',
    institutionName: '울산초등학교',
    startDate: '2025-04-15',
    endDate: '2025-07-15',
    status: '예정',
    region: '울산',
    classInfo: '5학년 1반',
    timeRange: '11:00~13:00'
  },
  {
    id: '8',
    educationName: '웹 개발 기초',
    institutionName: '수원초등학교',
    startDate: '2025-02-01',
    endDate: '2025-02-28',
    status: '완료',
    region: '수원',
    classInfo: '6학년 2반',
    timeRange: '10:00~12:00'
  },
  {
    id: '9',
    educationName: '모바일 앱 만들기',
    institutionName: '대전중학교',
    startDate: '2025-01-15',
    endDate: '2025-02-15',
    status: '완료',
    region: '대전',
    classInfo: '3학년 3반',
    timeRange: '14:00~16:00'
  },
  {
    id: '10',
    educationName: '3D 프린팅 기초',
    institutionName: '세종고등학교',
    startDate: '2025-03-25',
    endDate: '2025-06-25',
    status: '예정',
    region: '세종',
    classInfo: '1학년 1반',
    timeRange: '09:00~11:00'
  }
];

// Calendar events data (at least 10 events)
export const instructorCalendarEvents: InstructorCalendarEvent[] = [
  {
    date: '2025-03-01',
    title: '블록코딩 기초',
    status: '진행중'
  },
  {
    date: '2025-03-05',
    title: 'AI 체험 워크숍',
    status: '진행중'
  },
  {
    date: '2025-03-10',
    title: '로봇 공학 입문',
    status: '예정'
  },
  {
    date: '2025-03-12',
    title: '창의적 문제 해결',
    status: '진행중'
  },
  {
    date: '2025-03-15',
    title: '디지털 리터러시',
    status: '예정'
  },
  {
    date: '2025-03-17',
    title: '미디어 아트 창작',
    status: '진행중'
  },
  {
    date: '2025-03-20',
    title: '게임 디자인',
    status: '예정'
  },
  {
    date: '2025-03-22',
    title: '웹 개발 기초',
    status: '완료'
  },
  {
    date: '2025-03-25',
    title: '3D 프린팅 기초',
    status: '예정'
  },
  {
    date: '2025-03-28',
    title: '모바일 앱 만들기',
    status: '완료'
  },
  {
    date: '2025-03-30',
    title: '블록코딩 기초',
    status: '진행중'
  },
  {
    date: '2025-03-31',
    title: 'AI 체험 워크숍',
    status: '진행중'
  }
];