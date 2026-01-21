# 교육 관리 시스템 프로젝트 설명서

## 📋 프로젝트 개요

**교육 관리 시스템(Education Management System)**은 경기도 미래치매 교육 프로그램을 통합 관리하는 웹 기반 플랫폼입니다. 교육 프로그램 생성부터 강사 배정, 문서 제출 및 승인, 정산까지 교육 운영의 전 과정을 디지털화하여 효율적으로 관리할 수 있도록 지원합니다.

### 프로젝트 목적

- 교육 프로그램의 체계적 관리 및 추적
- 강사 신청 및 배정 프로세스 자동화
- 교육 진행 현황 실시간 모니터링
- 문서 제출 및 승인 워크플로우 관리
- 권역별 교육 현황 통계 및 분석
- 정산 및 출장비 계산 자동화

---

## 🏗️ 시스템 아키텍처

### 기술 스택

#### 프론트엔드
- **Framework**: Next.js 15.5.3 (App Router)
- **Language**: TypeScript 5.9.3
- **React**: 19.1.0
- **Styling**: 
  - Tailwind CSS 4
  - Ant Design 5.26.7
- **State Management**: Zustand 5.0.7
- **Form Management**: React Hook Form 7.62.0 + Zod 4.0.15
- **HTTP Client**: Axios 1.11.0
- **Icons**: Lucide React 0.537.0
- **Internationalization**: React i18next 15.6.1
- **Notifications**: React Toastify 11.0.5
- **Charts**: Recharts 2.15.4

#### 백엔드
- **Framework**: Spring Boot 3.x
- **Language**: Java 21
- **Database**: PostgreSQL
- **Security**: Spring Security (JWT 기반 인증)
- **Migration**: Flyway
- **API**: RESTful API (`/api/v1/**`)

#### 개발 환경
- **Node.js**: 최신 LTS 버전
- **Package Manager**: npm
- **Build Tool**: Next.js (Turbopack)
- **Port**: 3050 (개발 서버)

---

## 👥 사용자 역할 및 권한

### 관리자 (Admin)
- 전체 시스템 관리 권한
- 교육 프로그램 생성 및 관리
- 강사 신청 승인 및 배정
- 문서 제출 검토 및 승인/반려
- 기준정보 관리 (교육기관, 프로그램, 강사)
- 시스템 설정 및 사용자 관리
- 통계 및 대시보드 조회

### 운영자 (Operator)
- 교육 운영 관리
- 교육 과정 등록 및 수정
- 강사 배정 관리
- 교육 현황 모니터링

### 강사 (Instructor)
- 교육 신청 및 출강 확정
- 출석부, 활동일지, 교구확인서 작성 및 제출
- 내 출강 일정 조회
- 교육 진행 및 문서 관리

### 교사 (Teacher)
- 출석부 서명
- 교육 관련 요청

---

## 🎯 주요 기능

### 1. 대시보드
- **KPI 대시보드**: 전체 프로그램 수, 진행률, 완료 프로그램, 참여 기관 수
- **권역별 진행 현황**: 6개 권역별 교육 진행률 시각화 (카드 및 지도)
- **특별 항목 진행률**: 도서/벽화, 50차시, 특별 수업 진행률
- **프로그램 목록**: 검색 가능한 프로그램 목록 테이블
- **상세 보기**: 출석부, 활동일지, 교구확인서 링크

### 2. 교육 운영 관리
- 교육 프로그램 생성 및 수정
- 교육 일정 관리 (차시별)
- 교육 상태 관리 (대기 → 오픈예정 → 강사공개 → 신청마감 → 진행중 → 완료)
- 자동 상태 전환 (스케줄링)
- 교육 정보 일괄 업로드 (엑셀)

### 3. 강사 배정 관리
- 강사 신청 관리
- 강사 배정 (주강사/보조강사)
- 출강 확정 관리
- 수동 배정 기능
- 배정 현황 조회

### 4. 문서 제출 및 승인
- 출석부 제출 및 승인
- 활동일지 제출 및 승인
- 교구확인서 제출 및 승인
- 증빙 자료 제출
- 승인/반려 워크플로우

### 5. 기준정보 관리
- 교육기관 관리
- 프로그램 관리
- 강사 정보 관리
- 공통 코드 관리
- 일괄 업로드 기능

### 6. 정산 관리
- 출장비 계산
- 거리 기반 수당 계산
- 지급 횟수 모드 관리
- 정산 내역 조회 및 관리

### 7. 통계 및 리포트
- 권역별 통계
- 프로그램별 통계
- 강사 배정률 통계
- 월별 트렌드 분석
- 완료율 분석

---

## 📁 프로젝트 구조

```
/
├── app/                          # Next.js App Router 페이지
│   ├── layout.tsx               # 루트 레이아웃
│   ├── page.tsx                 # 홈 페이지
│   ├── globals.css              # 전역 스타일
│   ├── admin/                   # 관리자 페이지
│   │   ├── dashboard/           # 대시보드
│   │   ├── operations/          # 교육 운영 관리
│   │   ├── education-status/    # 교육 상태 변경
│   │   ├── instructor-assignment/ # 강사 배정
│   │   ├── submissions/         # 제출 관리
│   │   ├── settlements/         # 정산 관리
│   │   ├── reference-info/      # 기준정보 관리
│   │   └── system/              # 시스템 관리
│   ├── instructor/              # 강사 페이지
│   │   ├── dashboard/           # 강사 대시보드
│   │   ├── application/         # 교육 신청
│   │   ├── assignment/          # 배정 현황
│   │   ├── attendance/          # 출석부
│   │   ├── activity-logs/       # 활동일지
│   │   └── equipment-confirmations/ # 교구확인서
│   ├── teacher/                 # 교사 페이지
│   │   ├── dashboard/           # 교사 대시보드
│   │   ├── attendance/          # 출석 관리
│   │   └── classes/             # 수업 관리
│   └── login/                   # 로그인 페이지
│
├── components/                  # 컴포넌트 구조
│   ├── layout/                  # 레이아웃 컴포넌트
│   │   ├── Header.tsx           # 헤더
│   │   ├── AppShell.tsx         # 앱 셸
│   │   └── [role]/              # 역할별 레이아웃
│   ├── page/                    # 페이지별 특화 컴포넌트
│   ├── shared/                  # 공유 컴포넌트
│   │   ├── common/              # 기본 UI 컴포넌트
│   │   ├── ui/                  # 복합 UI 컴포넌트
│   │   └── utils/               # 유틸리티 컴포넌트
│   ├── admin/                   # 관리자 전용 컴포넌트
│   │   ├── operations/          # 교육 운영 컴포넌트
│   │   └── common-code/         # 공통 코드 컴포넌트
│   ├── dashboard/               # 대시보드 컴포넌트
│   ├── auth/                    # 인증 컴포넌트
│   └── localization/            # 다국어 컴포넌트
│
├── entities/                    # 데이터 엔티티 및 비즈니스 로직
│   ├── education/               # 교육 엔티티
│   │   ├── education-utils.ts   # 교육 유틸리티
│   │   └── index.ts
│   ├── instructor/              # 강사 엔티티
│   │   ├── instructor-utils.ts
│   │   ├── instructor-validation.ts
│   │   └── index.ts
│   ├── settlement/              # 정산 엔티티
│   │   ├── settlement-types.ts
│   │   ├── allowance-calculator.ts
│   │   ├── travel-expense-calculator.ts
│   │   └── index.ts
│   ├── submission/              # 제출 엔티티
│   │   ├── submission-types.ts
│   │   ├── submission-mutation.ts
│   │   └── index.ts
│   ├── user/                    # 사용자 엔티티
│   │   ├── user-types.ts
│   │   ├── user-query.ts
│   │   └── index.ts
│   ├── fee/                     # 수수료 정책
│   │   └── fee-policy.ts
│   ├── endpoints.ts             # API 엔드포인트 정의
│   └── index.ts                 # 전체 엔티티 내보내기
│
├── hooks/                       # 커스텀 훅
│   └── [custom-hooks].ts
│
├── libs/                        # 외부 라이브러리 설정
│   └── [library-configs].ts
│
├── lib/                         # 유틸리티 라이브러리
│   ├── dataStore.ts             # 중앙 데이터 스토어
│   └── [utilities].ts
│
├── locales/                     # 다국어 지원
│   ├── kr/                      # 한국어
│   │   └── translation.json
│   └── en/                      # 영어
│       └── translation.json
│
├── providers/                   # Context Providers
│   └── providers.tsx
│
├── contexts/                    # React Context
│   └── [contexts].tsx
│
├── types/                       # TypeScript 타입 정의
│   └── [types].ts
│
├── public/                      # 퍼블릭 자산
│   └── [static-files]
│
├── assets/                      # 정적 자산
│   ├── fonts/                   # 폰트 파일
│   └── imgs/                    # 이미지 및 아이콘
│
├── backend/                     # Spring Boot 백엔드
│   ├── src/main/java/
│   │   └── com/itwizard/swaedu/
│   │       ├── modules/         # 기능별 모듈
│   │       │   ├── admin/       # 관리자 모듈
│   │       │   ├── auth/        # 인증 모듈
│   │       │   ├── instructor/  # 강사 모듈
│   │       │   ├── program/     # 프로그램 모듈
│   │       │   ├── region/      # 권역 모듈
│   │       │   └── teacher/     # 교사 모듈
│   │       ├── config/          # 설정
│   │       │   └── security/    # 보안 설정
│   │       └── exception/       # 예외 처리
│   └── src/main/resources/
│       └── db/migration/        # Flyway 마이그레이션
│
├── docs/                        # 문서
│   ├── DEVELOPER_FLOW.md        # 개발자 가이드
│   ├── ROLE_BASED_ACCESS.md     # 역할 기반 접근 제어
│   └── [other-docs].md
│
├── package.json                 # 프론트엔드 의존성
├── tsconfig.json                # TypeScript 설정
├── next.config.js               # Next.js 설정
├── tailwind.config.js           # Tailwind CSS 설정
└── README.md                    # 프로젝트 README
```

---

## 🔄 주요 워크플로우

### 교육 프로그램 생성 및 관리 플로우

```
1. 관리자 로그인
   ↓
2. 교육 운영 관리 페이지 접근
   ↓
3. 신규 교육 생성
   - 교육명, 교육기관, 기간 입력
   - 차시별 일정 설정
   - 초기 상태: "대기"
   ↓
4. 교육 상태 변경
   - 대기 → 오픈예정 → 강사공개 → 신청마감 → 진행중 → 완료
   - 자동 전환 또는 수동 변경
   ↓
5. 강사 배정
   - 강사 신청 확인
   - 주강사/보조강사 배정
   - 출강 확정
```

### 강사 신청 및 배정 플로우

```
1. 강사 로그인
   ↓
2. 교육 신청 페이지 접근
   - 공개된 교육 목록 확인
   - 신청 가능한 교육 선택
   ↓
3. 교육 신청 제출
   ↓
4. 관리자 승인 대기
   ↓
5. 관리자 배정 확인
   - 주강사/보조강사 배정
   ↓
6. 강사 출강 확정
   ↓
7. 교육 진행 및 문서 제출
```

### 문서 제출 및 승인 플로우

```
1. 강사 문서 작성
   - 출석부 작성
   - 활동일지 작성
   - 교구확인서 작성
   - 강의계획서 작성
   ↓
2. 문서 제출
   ↓
3. 관리자 검토
   ↓
4. 승인/반려 결정
   ↓
5. 반려 시 수정 요청
   ↓
6. 재제출 (반려된 경우)
```

---

## 🎨 UI/UX 특징

### 디자인 시스템
- **Ant Design 5** 기반 컴포넌트 라이브러리
- **Tailwind CSS** 유틸리티 클래스 활용
- 일관된 디자인 언어 및 컴포넌트 재사용

### 반응형 디자인
- **Desktop**: 4열 KPI 카드, 3열 권역 그리드
- **Tablet**: 2열 레이아웃
- **Mobile**: 1열 레이아웃

### 다국어 지원
- 한국어 (기본)
- 영어
- 브라우저 저장소에 언어 설정 저장
- 헤더 우측 상단 언어 전환 버튼

### 사용자 경험
- 직관적인 네비게이션
- 실시간 상태 업데이트
- 명확한 피드백 메시지
- 로딩 상태 표시
- 에러 처리 및 복구

---

## 🔐 보안 및 인증

### 인증 방식
- JWT (JSON Web Token) 기반 인증
- Bearer Token 방식
- 토큰 갱신 메커니즘

### 권한 관리
- 역할 기반 접근 제어 (RBAC)
- 페이지별 접근 권한 검증
- API 엔드포인트 보호

### 보안 기능
- 사용자 활성화 상태 검증
- 인증 실패 처리
- 접근 거부 처리
- 입력 데이터 검증

---

## 📊 데이터 관리

### 상태 관리 전략
- **서버 상태**: React Query (향후 적용 예정)
- **전역 클라이언트 상태**: Zustand
- **로컬 UI 상태**: React useState

### 데이터 흐름
- **엔티티 기반 구조**: 기능별 엔티티 모듈
- **타입 안정성**: TypeScript 엄격 모드
- **API 통신**: Axios 기반 HTTP 클라이언트
- **중앙 데이터 스토어**: `lib/dataStore.ts` (현재는 더미 데이터, API 연동 예정)

---

## 🚀 개발 환경 설정

### 필수 요구사항
- Node.js (최신 LTS 버전)
- npm 또는 yarn
- Java 21 (백엔드 개발 시)
- PostgreSQL (백엔드 개발 시)

### 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 프로덕션 서버 실행
npm start

# 린트 검사
npm run lint
```

### 환경 변수
프로젝트 루트에 `.env.local` 파일을 생성하여 필요한 환경 변수를 설정합니다.

```env
# API 엔드포인트
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1

# 기타 설정
# ...
```

---

## 📝 개발 가이드라인

### 코딩 컨벤션
- **컴포넌트**: PascalCase (`Button.tsx`)
- **유틸리티/훅**: camelCase (`useAutoFocus.ts`)
- **엔티티**: kebab-case (`user-types.ts`)

### Import 순서
1. React 및 Next.js
2. 외부 라이브러리
3. 내부 모듈 (`@/` 경로)

### 컴포넌트 작성 규칙
- TypeScript Interface 사용
- Named export 우선
- 공통 컴포넌트 재사용
- 2곳 이상 사용 시 공통 모듈로 분리

### 상태 관리 규칙
- 서버 상태는 React Query 사용
- 전역 클라이언트 상태는 Zustand 사용
- 로컬 UI 상태는 useState 사용

---

## 📚 주요 문서

- [README.md](README.md) - 프로젝트 기본 정보
- [USER_GUIDE.md](USER_GUIDE.md) - 사용자 가이드
- [PROJECT_FLOW_DOCUMENTATION.md](PROJECT_FLOW_DOCUMENTATION.md) - 전체 플로우 문서
- [USER_FLOW.md](USER_FLOW.md) - 사용자 플로우
- [docs/DEVELOPER_FLOW.md](docs/DEVELOPER_FLOW.md) - 개발자 가이드
- [docs/index.md](docs/index.md) - 문서 인덱스

---

## 🔄 프로젝트 현황

### 완료된 기능
- ✅ 사용자 인증 및 권한 관리
- ✅ 대시보드 (KPI, 권역별 통계)
- ✅ 교육 운영 관리
- ✅ 교육 상태 관리
- ✅ 강사 배정 관리
- ✅ 문서 제출 및 승인
- ✅ 기준정보 관리
- ✅ 정산 관리
- ✅ 다국어 지원

### 진행 중인 작업
- 🔄 API 연동 (현재 더미 데이터 사용)
- 🔄 React Query 도입
- 🔄 성능 최적화

### 향후 계획
- 📋 실시간 알림 시스템
- 📋 고급 리포트 기능
- 📋 모바일 앱 지원
- 📋 데이터 분석 대시보드 확장

---

## 🤝 기여 가이드

### 개발 워크플로우
1. 요구사항 분석 → 기존 구현 확인
2. 기존 코드 재사용 → 없다면 공통 모듈 생성
3. 공통 모듈 등록 → `index.ts`에 export 추가
4. 페이지에서 import → 공통 모듈 활용

### 필수 체크리스트
- [ ] 기존 `components/shared/common/` 컴포넌트 확인 및 활용
- [ ] 유사한 기능의 기존 구현 검색 완료
- [ ] 2곳 이상 사용될 가능성이 있는 로직은 공통 모듈로 분리
- [ ] `index.ts`에 새로운 export 추가
- [ ] HTML 기본 요소 대신 공통 컴포넌트 사용
- [ ] TypeScript 타입 정의 완료
- [ ] 다국어 키 추가 (필요 시)

---

## 📞 문의 및 지원

프로젝트 관련 문의사항이나 버그 리포트는 이슈 트래커를 통해 제출해주세요.

---

**마지막 업데이트**: 2024년
