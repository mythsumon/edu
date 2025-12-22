# Admin Menu to File Path Mapping

This document maps the admin menu structure to the actual file paths in the application.

## Menu Structure and File Paths

### 대시보드 (Dashboard)
- **전체 프로그램 현황** → `/app/admin/dashboard/page.tsx`

### 강사 배정 관리 (Instructor Assignment Management)
- **강사 신청 관리** → `/app/admin/instructor-assignment/applications/page.tsx`
- **출강 확정 조회** → `/app/admin/instructor-assignment/confirmations/page.tsx`
- **강사 수동배정** → `/app/admin/instructor-assignment/manual/page.tsx`

### 교육 상태 변경 (Education Status Change)
- **교육 상태 변경** → `/app/admin/education-status/page.tsx`

### 교육 관리 (Education Management)
- **교육 조회** → `/app/admin/operations/page.tsx`
- **교육 생성** → `/app/admin/operations/create/page.tsx`

### 교육기관 관리 (Institution Management)
- **교육기관 조회** → `/app/admin/reference-info/institution-page.tsx`
- **교육기관 생성** → `/app/admin/reference-info/institution-create/page.tsx`

### 프로그램 관리 (Program Management)
- **프로그램 조회** → `/app/admin/reference-info/program-page.tsx`
- **프로그램 생성** → `/app/admin/reference-info/program-create/page.tsx`

### 강사 관리 (Instructor Management)
- **강사 조회** → `/app/admin/reference-info/instructor-page.tsx`
- **강사 생성** → `/app/admin/reference-info/instructor-create/page.tsx`

### 설정 및 사용자 관리 (Settings and User Management)
- **설정 및 사용자 관리** → `/app/admin/system/page.tsx`

## Directory Structure

```
app/
├── admin/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── instructor-assignment/
│   │   ├── applications/
│   │   │   └── page.tsx
│   │   ├── confirmations/
│   │   │   └── page.tsx
│   │   └── manual/
│   │       └── page.tsx
│   ├── education-status/
│   │   └── page.tsx
│   ├── operations/
│   │   ├── page.tsx
│   │   └── create/
│   │       └── page.tsx
│   ├── reference-info/
│   │   ├── institution-page.tsx
│   │   ├── institution-create/
│   │   │   └── page.tsx
│   │   ├── program-page.tsx
│   │   ├── program-create/
│   │   │   └── page.tsx
│   │   ├── instructor-page.tsx
│   │   └── instructor-create/
│   │       └── page.tsx
│   └── system/
│       └── page.tsx
```

## Implementation Notes

1. Some pages are directly in the reference-info directory (e.g., `institution-page.tsx`) while others are in subdirectories (e.g., `institution-create/page.tsx`). This follows the existing pattern in the codebase.

2. Pages that don't exist yet will need to be created to match this structure.

3. The menu structure has been updated to match the detailed requirements provided, with specific icons for different menu items.