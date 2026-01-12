import { RouteObject } from 'react-router-dom'
import { AppShell } from '../layout/AppShell'
import { ProtectedLayout } from '../layout/ProtectedLayout'
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
          {
            path: ROUTES.DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.ADMIN_DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.INSTRUCTOR_DASHBOARD,
            element: <DashboardPage />,
          },
          {
            path: ROUTES.EDUCATION_OPERATIONS,
            element: <EducationOperationsPage />,
          },
          {
            path: ROUTES.INSTRUCTOR_APPLICATION_MANAGEMENT,
            element: <InstructorApplicationManagementPage />,
          },
          {
            path: ROUTES.INSTRUCTOR_ALLOCATION_MANAGEMENT,
            element: <InstructorAllocationManagementPage />,
          },
          {
            path: ROUTES.TEACHING_CONFIRMATION_MANAGEMENT,
            element: <TeachingConfirmationManagementPage />,
          },
          {
            path: ROUTES.INSTITUTION_MANAGEMENT,
            element: <InstitutionManagementPage />,
          },
          {
            path: ROUTES.PROGRAM_MANAGEMENT,
            element: <ProgramManagementPage />,
          },
          {
            path: ROUTES.INSTRUCTOR_MANAGEMENT,
            element: <InstructorManagementPage />,
          },
          {
            path: ROUTES.SETTINGS_AND_USER_MANAGEMENT,
            element: <SettingsAndUserManagementPage />,
          },
        ],
      },
    ],
  },
]

