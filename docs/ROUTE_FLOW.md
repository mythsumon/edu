# 프로젝트 라우트 구조 및 사용자 플로우

## 📋 목차
1. [인증 플로우](#인증-플로우)
2. [라우트 구조](#라우트-구조)
3. [역할별 접근 권한](#역할별-접근-권한)
4. [사이드바 메뉴 구조](#사이드바-메뉴-구조)

---

## 🔐 인증 플로우

### 1. 초기 접근
```
사용자 → http://localhost:3000/
  ↓
AppShell 확인 (userRole 체크)
  ↓
인증되지 않음 → /login으로 리다이렉트
```

### 2. 로그인 프로세스
```
/login 페이지 접근
  ↓
역할 선택 (관리자/강사)
  ↓
이메일/비밀번호 자동 입력
  ↓
로그인 버튼 클릭
  ↓
AuthContext.login(role) 호출
  ↓
역할에 따라 리다이렉트:
  - admin → /admin/dashboard (→ / 로 리다이렉트)
  - instructor → /instructor/dashboard
```

### 3. 인증 후 플로우
```
인증 완료
  ↓
localStorage에 userRole 저장
  ↓
AppShell에서 역할 확인
  ↓
역할에 맞는 사이드바 표시:
  - admin → AdminSidebar
  - instructor → InstructorSidebar
```

---

## 🗺️ 라우트 구조

### 공개 라우트 (인증 불필요)
```
/login
  └── 로그인 페이지 (역할 선택 + 인증)
```

### 홈 라우트
```
/
  └── 전체 프로그램 현황 (공개 대시보드)
```

### 관리자 전용 라우트 (`/admin/*`)
```
/admin
  └── 관리자 메인 페이지

/admin/dashboard
  └── 관리자 대시보드 (현재 / 로 리다이렉트)

/admin/operations
  └── 교육 운영 관리

/admin/operations/create
  └── 교육 운영 생성

/admin/education-status
  └── 교육 현황

/admin/instructor-assignment/
  ├── applications/
  │   └── 강사 신청 관리
  ├── manual/
  │   └── 강사 배정 관리
  └── confirmations/
      └── 출강 확정 관리

/admin/reference-info/
  ├── institution-page
  │   └── 교육기관 관리
  ├── institution-create
  │   └── 교육기관 생성
  ├── program-page
  │   └── 프로그램 관리
  ├── program-create
  │   └── 프로그램 생성
  ├── instructor-page
  │   └── 강사 관리
  └── instructor-create
      └── 강사 생성

/admin/system
  └── 시스템 설정 및 사용자 관리
```

### 강사 전용 라우트 (`/instructor/*`)
```
/instructor
  └── 강사 메인 페이지

/instructor/dashboard
  └── 강사 대시보드

/instructor/application
  └── 강사 신청 관리

/instructor/assignment
  └── 강사 배정 관리

/instructor/confirmation
  └── 출강 확정 관리
```

### 공통 라우트
```
/education
  └── 교육 관리

/institution
  └── 교육기관 페이지

/program
  └── 프로그램 페이지

/instructor (일반)
  └── 강사 페이지

/system/settings
  └── 시스템 설정

/equipment/[id]
  └── 장비 상세

/attendance/[id]
  └── 출석 상세

/activity/[id]
  └── 활동 상세

/unified-edit
  └── 통합 편집

/test
  └── 테스트 페이지
```

---

## 🔒 역할별 접근 권한

### 관리자 (Admin)
- ✅ 모든 `/admin/*` 라우트 접근 가능
- ✅ AdminSidebar 표시
- ❌ `/instructor/*` 라우트 접근 불가 (강사 대시보드로 리다이렉트)

### 강사 (Instructor)
- ✅ 모든 `/instructor/*` 라우트 접근 가능
- ✅ InstructorSidebar 표시
- ❌ `/admin/*` 라우트 접근 불가 (관리자 대시보드로 리다이렉트)

### 비인증 사용자
- ✅ `/login` 접근 가능
- ✅ `/` (홈) 접근 가능
- ❌ 보호된 라우트 접근 시 `/login`으로 리다이렉트

---

## 📱 사이드바 메뉴 구조

### 관리자 사이드바 (`AdminSidebar`)
```
📊 대시보드
  └── 전체 프로그램 현황 → /admin/dashboard

📚 교육 운영
  └── 교육 관리 → /admin/operations

🎓 강사 배정
  ├── 강사 신청 관리 → /admin/instructor-assignment/applications
  ├── 강사 배정 관리 → /admin/instructor-assignment/manual
  └── 출강 확정 관리 → /admin/instructor-assignment/confirmations

🏢 기준정보 관리
  ├── 교육기관 관리 → /admin/reference-info/institution-page
  ├── 프로그램 관리 → /admin/reference-info/program-page
  └── 강사 관리 → /admin/reference-info/instructor-page

⚙️ 시스템 관리
  └── 설정 및 사용자 관리 → /admin/system
```

### 강사 사이드바 (`InstructorSidebar`)
```
📊 대시보드
  └── 내 대시보드 → /instructor/dashboard

🎓 강사 배정
  ├── 강사 신청 관리 → /instructor/application
  ├── 강사 배정 관리 → /instructor/assignment
  └── 출강 확정 관리 → /instructor/confirmation
```

---

## 🔄 리다이렉트 규칙

### ProtectedRoute 동작
```typescript
// 인증되지 않은 사용자
!isAuthenticated → /login

// 권한이 없는 사용자
requiredRole="admin" && userRole !== "admin" 
  → userRole === "instructor" ? /instructor/dashboard : /login

requiredRole="instructor" && userRole !== "instructor"
  → userRole === "admin" ? /admin/dashboard : /login
```

### 특수 리다이렉트
```
/admin/dashboard → / (홈으로 리다이렉트)
```

---

## 🏗️ 컴포넌트 구조

### 레이아웃 계층
```
RootLayout (app/layout.tsx)
  └── AppProviders (app/providers.tsx)
      ├── AuthProvider
      ├── ThemeProvider
      ├── LanguageProvider
      └── AntdThemeProvider
          └── AppShell
              ├── Sidebar (역할별)
              ├── Header
              └── Main Content
```

### 보호된 라우트
```
ProtectedRoute (components/auth/ProtectedRoute.tsx)
  ├── 인증 확인
  ├── 역할 확인
  └── 권한 없음 시 리다이렉트
```

---

## 📝 주요 파일 위치

### 라우트 파일
- `app/page.tsx` - 홈 페이지
- `app/login/page.tsx` - 로그인 페이지
- `app/admin/**/page.tsx` - 관리자 라우트
- `app/instructor/**/page.tsx` - 강사 라우트

### 레이아웃 컴포넌트
- `app/layout.tsx` - 루트 레이아웃
- `app/providers.tsx` - 프로바이더 래퍼
- `components/layout/AppShell.tsx` - 앱 셸
- `components/layout/admin/AdminSidebar.tsx` - 관리자 사이드바
- `components/layout/instructor/InstructorSidebar.tsx` - 강사 사이드바

### 인증 관련
- `contexts/AuthContext.tsx` - 인증 컨텍스트
- `components/auth/ProtectedRoute.tsx` - 보호된 라우트

---

## 🎯 사용자 시나리오

### 시나리오 1: 관리자 로그인
```
1. /login 접근
2. "관리자" 역할 선택 → admin@example.com / demo1234 자동 입력
3. 로그인 버튼 클릭
4. AuthContext.login('admin') 호출
5. /admin/dashboard로 리다이렉트 → / 로 자동 리다이렉트
6. AdminSidebar 표시
7. 관리자 메뉴 접근 가능
```

### 시나리오 2: 강사 로그인
```
1. /login 접근
2. "강사" 역할 선택 → instructor@example.com / demo1234 자동 입력
3. 로그인 버튼 클릭
4. AuthContext.login('instructor') 호출
5. /instructor/dashboard로 리다이렉트
6. InstructorSidebar 표시
7. 강사 메뉴 접근 가능
```

### 시나리오 3: 비인증 사용자
```
1. / 접근 → 정상 표시
2. /admin/dashboard 접근 시도
3. ProtectedRoute가 인증 확인
4. !isAuthenticated → /login으로 리다이렉트
```

### 시나리오 4: 권한 없는 접근
```
1. 강사로 로그인
2. /admin/operations 접근 시도
3. ProtectedRoute가 역할 확인
4. requiredRole="admin" && userRole="instructor"
5. /instructor/dashboard로 리다이렉트
```

---

## 🔧 개발 참고사항

### 역할 기반 사이드바 표시
- `AppShell`에서 `userRole` 확인
- `userRole === 'admin'` → `AdminSidebar`
- `userRole === 'instructor'` → `InstructorSidebar`
- `userRole === null` → 사이드바 없음

### ProtectedRoute 사용법
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### 인증 상태 확인
```tsx
const { userRole, isAuthenticated, login, logout } = useAuth()
```

---

## 📌 주의사항

1. `/admin/dashboard`는 현재 `/`로 리다이렉트됨
2. 로그인 페이지(`/login`)는 사이드바/헤더 없이 표시
3. 모든 보호된 라우트는 `ProtectedRoute`로 감싸야 함
4. 역할은 `localStorage`에 저장되므로 새로고침해도 유지됨









