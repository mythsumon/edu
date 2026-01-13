export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  ADMIN_DASHBOARD: '/admin/dashboard',
  INSTRUCTOR_DASHBOARD: '/instructor/dashboard',
  // Admin routes
  ADMIN_EDUCATION_OPERATIONS: '/admin/education-operations',
  ADMIN_INSTRUCTOR_ASSIGNMENT: '/admin/instructor-assignment',
  ADMIN_INSTRUCTOR_APPLICATION_MANAGEMENT: '/admin/instructor-assignment/application',
  ADMIN_INSTRUCTOR_ALLOCATION_MANAGEMENT: '/admin/instructor-assignment/allocation',
  ADMIN_TEACHING_CONFIRMATION_MANAGEMENT: '/admin/instructor-assignment/confirmation',
  ADMIN_REFERENCE_INFORMATION_MANAGEMENT: '/admin/reference-information-management',
  ADMIN_INSTITUTION_MANAGEMENT: '/admin/reference-information-management/institution',
  ADMIN_PROGRAM_MANAGEMENT: '/admin/reference-information-management/program',
  ADMIN_INSTRUCTOR_MANAGEMENT: '/admin/reference-information-management/instructor',
  ADMIN_SYSTEM_MANAGEMENT: '/admin/system-management',
  ADMIN_SETTINGS_AND_USER_MANAGEMENT: '/admin/system-management/settings',
  // Instructor routes
  INSTRUCTOR_EDUCATION_OPERATIONS: '/instructor/education-operations',
  INSTRUCTOR_SCHEDULE: '/instructor/instructor-assignment',
  INSTRUCTOR_STUDENTS: '/instructor/reference-information-management',
  INSTRUCTOR_ATTENDANCE: '/instructor/system-management',
  INSTRUCTOR_GRADES: '/instructor/system-management/settings',
  // Legacy routes (for backward compatibility)
  // Education Operations
  EDUCATION_OPERATIONS: '/education-operations',
  // Instructor Assignment
  INSTRUCTOR_ASSIGNMENT: '/instructor-assignment',
  INSTRUCTOR_APPLICATION_MANAGEMENT: '/instructor-assignment/application',
  INSTRUCTOR_ALLOCATION_MANAGEMENT: '/instructor-assignment/allocation',
  TEACHING_CONFIRMATION_MANAGEMENT: '/instructor-assignment/confirmation',
  // Reference Information Management
  REFERENCE_INFORMATION_MANAGEMENT: '/reference-information-management',
  INSTITUTION_MANAGEMENT: '/reference-information-management/institution',
  PROGRAM_MANAGEMENT: '/reference-information-management/program',
  INSTRUCTOR_MANAGEMENT: '/reference-information-management/instructor',
  // System Management
  SYSTEM_MANAGEMENT: '/system-management',
  SETTINGS_AND_USER_MANAGEMENT: '/system-management/settings',
  // Auth
  LOGIN: '/login',
  NOT_FOUND: '/404',
} as const

