import { RouteObject, Navigate } from 'react-router-dom'
import { AppShell } from '../layout/AppShell'
import { ProtectedLayout } from '../layout/ProtectedLayout'
import { AdminRouteGuard } from '../layout/AdminRouteGuard'
import { InstructorRouteGuard } from '../layout/InstructorRouteGuard'
import { ROUTES } from '@/shared/constants/routes'
import { HomePage } from '@/modules/home'
import { DashboardPage } from '@/modules/dashboard'
import { EducationOperationsPage } from '@/modules/education-operations'
import {
  InstructorApplicationManagementPage,
  InstructorAllocationManagementPage,
  TeachingConfirmationManagementPage,
} from '@/modules/instructor-assignment'
import {
  InstitutionManagementPage,
  ProgramManagementPage,
  InstructorManagementPage,
} from '@/modules/reference-information-management'
import { SettingsAndUserManagementPage } from '@/modules/system-management'
import {
  AdminAccountManagementPage,
  InstructorAccountManagementPage,
} from '@/modules/account-management'

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <AppShell />,
        children: [
          {
            path: ROUTES.HOME,
            element: <HomePage />,
          },
          // Admin routes grouped under /admin
          {
            path: ROUTES.ADMIN,
            element: <AdminRouteGuard />,
            children: [
              {
                path: ROUTES.ADMIN_DASHBOARD,
                element: <DashboardPage />,
              },
              {
                path: ROUTES.ADMIN_EDUCATION_OPERATIONS,
                element: <EducationOperationsPage />,
              },
              {
                path: ROUTES.ADMIN_INSTRUCTOR_ASSIGNMENT,
                children: [
                  {
                    path: ROUTES.ADMIN_INSTRUCTOR_APPLICATION_MANAGEMENT,
                    element: <InstructorApplicationManagementPage />,
                  },
                  {
                    path: ROUTES.ADMIN_INSTRUCTOR_ALLOCATION_MANAGEMENT,
                    element: <InstructorAllocationManagementPage />,
                  },
                  {
                    path: ROUTES.ADMIN_TEACHING_CONFIRMATION_MANAGEMENT,
                    element: <TeachingConfirmationManagementPage />,
                  },
                ],
              },
              {
                path: ROUTES.ADMIN_REFERENCE_INFORMATION_MANAGEMENT,
                children: [
                  {
                    path: ROUTES.ADMIN_INSTITUTION_MANAGEMENT,
                    element: <InstitutionManagementPage />,
                  },
                  {
                    path: ROUTES.ADMIN_PROGRAM_MANAGEMENT,
                    element: <ProgramManagementPage />,
                  },
                  {
                    path: ROUTES.ADMIN_INSTRUCTOR_MANAGEMENT,
                    element: <InstructorManagementPage />,
                  },
                ],
              },
              {
                path: ROUTES.ADMIN_SYSTEM_MANAGEMENT,
                children: [
                  {
                    path: ROUTES.ADMIN_SETTINGS_AND_USER_MANAGEMENT,
                    element: <SettingsAndUserManagementPage />,
                  },
                ],
              },
              {
                path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT,
                children: [
                  {
                    index: true,
                    element: <Navigate to={ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_FULL} replace />,
                  },
                  {
                    path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS,
                    element: <AdminAccountManagementPage />,
                  },
                  {
                    path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS,
                    element: <InstructorAccountManagementPage />,
                  },
                ],
              },
            ],
          },
          // Instructor routes grouped under /instructor
          {
            path: ROUTES.INSTRUCTOR,
            element: <InstructorRouteGuard />,
            children: [
              {
                path: ROUTES.INSTRUCTOR_DASHBOARD,
                element: <DashboardPage />,
              },
              {
                path: ROUTES.INSTRUCTOR_EDUCATION_OPERATIONS,
                element: <EducationOperationsPage />,
              },
              {
                path: ROUTES.INSTRUCTOR_SCHEDULE,
                element: <EducationOperationsPage />,
              },
              {
                path: ROUTES.INSTRUCTOR_STUDENTS,
                element: <EducationOperationsPage />,
              },
              {
                path: ROUTES.INSTRUCTOR_ATTENDANCE,
                children: [
                  {
                    path: ROUTES.INSTRUCTOR_GRADES,
                    element: <SettingsAndUserManagementPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
]

