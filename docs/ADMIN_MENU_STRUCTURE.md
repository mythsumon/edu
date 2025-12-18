# Admin Menu Structure Mapping

This document maps the admin menu structure to the actual file structure in the application.

## Menu Structure

### 1. 대시보드 (Dashboard)
- **전체 프로그램 현황** → `app/page.tsx`

### 2. 교육 운영 (Education Operations)
- **교육 관리** → `app/education/page.tsx`

### 3. 강사 배정 (Instructor Assignment)
- **강사 신청 관리** → `app/instructor/application/page.tsx`
- **강사 배정 관리** → `app/instructor/assignment/page.tsx`
- **출강 확정 관리** → `app/instructor/confirmation/page.tsx`

### 4. 기준정보 관리 (Reference Information Management)
- **교육기관 관리** → `app/institution/page.tsx`
- **프로그램 관리** → `app/program/page.tsx`
- **강사 관리** → `app/instructor/page.tsx`

### 5. 시스템 관리 (System Management)
- **설정 및 사용자 관리** → `app/system/settings/page.tsx`

## Directory Structure

```
app/
├── page.tsx                        # Dashboard (전체 프로그램 현황)
├── education/
│   └── page.tsx                   # 교육 관리
├── institution/
│   └── page.tsx                   # 교육기관 관리
├── instructor/
│   ├── page.tsx                   # 강사 관리
│   ├── application/
│   │   └── page.tsx              # 강사 신청 관리
│   ├── assignment/
│   │   └── page.tsx              # 강사 배정 관리
│   └── confirmation/
│       └── page.tsx              # 출강 확정 관리
├── program/
│   └── page.tsx                   # 프로그램 관리
└── system/
    └── settings/
        └── page.tsx              # 설정 및 사용자 관리
```

This structure ensures that the file organization directly corresponds to the admin menu structure, making it easy for developers to locate and maintain the relevant components.