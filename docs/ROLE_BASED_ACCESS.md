# Role-Based Access Control Implementation

## Overview

This document explains the implementation of role-based access control (RBAC) in the education management system. The system now supports two distinct roles:

1. **Admin** - Full access to all administrative functions
2. **Instructor** - Limited access focused on teaching and course management

## Directory Structure

```
app/
├── admin/                 # Admin-only routes
│   ├── dashboard/         # Admin dashboard
│   ├── operations/        # Education operations
│   ├── instructor-assignment/ # Instructor assignment management
│   ├── reference-info/    # Reference information management
│   │   ├── institution-page.tsx
│   │   ├── program-page.tsx
│   │   └── instructor-page.tsx
│   └── system/            # System management
│       └── page.tsx
├── instructor/            # Instructor-only routes
│   ├── dashboard/         # Instructor dashboard
│   ├── application/       # Course application
│   ├── assignment/        # Assignment management
│   └── attendance/        # Attendance management
└── login/                 # Public login page
```

## Authentication Flow

1. Users access `/login` to select their role
2. Upon login, users are redirected to their respective dashboards:
   - Admins: `/admin/dashboard`
   - Instructors: `/instructor/dashboard`
3. All protected routes are wrapped with `ProtectedRoute` component

## Implementation Details

### AuthContext

The authentication system uses React Context API to manage user roles:

- `userRole`: Current user role ('admin' or 'instructor')
- `isAuthenticated`: Boolean indicating if user is logged in
- `login(role)`: Login function that sets the user role
- `logout()`: Logout function that clears the user role

### ProtectedRoute Component

Wraps all protected pages to ensure only authorized users can access them:

```tsx
<ProtectedRoute requiredRole="admin">
  <AdminDashboard />
</ProtectedRoute>
```

### Sidebar Navigation

The sidebar dynamically renders menu items based on the user's role:

- Admins see full administrative menu
- Instructors see teaching-focused menu

## Role Permissions

### Admin Role
Full access to:
- Dashboard with statistics
- Education operations management
- Instructor assignment management
- Reference information management (institutions, programs, instructors)
- System settings

### Instructor Role
Access to:
- Personal dashboard with courses and schedule
- Course application
- Assignment management
- Attendance management

## Future Enhancements

1. **Operator Role**: Add an operator role with intermediate permissions
2. **Backend Integration**: Connect to actual authentication backend
3. **Session Management**: Implement proper session timeout and refresh
4. **Permission Granularity**: Add more granular permissions within roles