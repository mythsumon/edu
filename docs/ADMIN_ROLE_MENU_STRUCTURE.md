# Admin Role Menu Structure

This document outlines the menu structure specifically designed for admin users in the education management system.

## Menu Structure

### 대시보드 (Dashboard)
- **전체 프로그램 현황** → `/admin/dashboard`

### 교육 운영 (Education Operations)
- **교육 관리** → `/admin/operations`

### 강사 배정 (Instructor Assignment)
- **강사 신청 관리** → `/admin/instructor-assignment/applications`
- **강사 배정 관리** → `/admin/instructor-assignment/manual`
- **출강 확정 관리** → `/admin/instructor-assignment/confirmations`

### 기준정보 관리 (Reference Information Management)
- **교육기관 관리** → `/admin/reference-info/institution-page`
- **프로그램 관리** → `/admin/reference-info/program-page`
- **강사 관리** → `/admin/reference-info/instructor-page`

### 시스템 관리 (System Management)
- **설정 및 사용자 관리** → `/admin/system`

## Implementation Details

### Component Structure
- **AdminSidebar.tsx**: Dedicated sidebar component for admin users with the specific menu structure
- **AppShell.tsx**: Updated to conditionally render AdminSidebar for `/admin/*` routes

### Route Protection
All admin pages are protected using the `ProtectedRoute` component with `requiredRole="admin"` to ensure only authorized users can access them.

### File Organization
The admin pages follow the directory structure outlined in `ADMIN_MENU_FILE_MAPPING.md`:
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

## Access Control
- Admin users can access all menu items
- Regular users will see a different menu structure (defined in `Sidebar.tsx`)
- Unauthorized access attempts are redirected to login or shown access denied messages

## UI Features
- Collapsible sidebar with smooth animations
- Hover tooltips for collapsed state
- Active state highlighting for current page
- Responsive design for all screen sizes
- Consistent styling with the rest of the application