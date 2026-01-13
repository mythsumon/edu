import { RouteObject } from 'react-router-dom'
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
          // Admin routes grouped under /admin
          {
            path: '/admin',
            element: <AdminRouteGuard />,
            children: [
              {
                path: 'dashboard',
                element: <DashboardPage />,
              },
              {
                path: 'education-operations',
                element: <EducationOperationsPage />,
              },
              {
                path: 'instructor-assignment',
                children: [
                  {
                    path: 'application',
                    element: <InstructorApplicationManagementPage />,
                  },
                  {
                    path: 'allocation',
                    element: <InstructorAllocationManagementPage />,
                  },
                  {
                    path: 'confirmation',
                    element: <TeachingConfirmationManagementPage />,
                  },
                ],
              },
              {
                path: 'reference-information-management',
                children: [
                  {
                    path: 'institution',
                    element: <InstitutionManagementPage />,
                  },
                  {
                    path: 'program',
                    element: <ProgramManagementPage />,
                  },
                  {
                    path: 'instructor',
                    element: <InstructorManagementPage />,
                  },
                ],
              },
              {
                path: 'system-management',
                children: [
                  {
                    path: 'settings',
                    element: <SettingsAndUserManagementPage />,
                  },
                ],
              },
            ],
          },
          // Instructor routes grouped under /instructor
          {
            path: '/instructor',
            element: <InstructorRouteGuard />,
            children: [
              {
                path: 'dashboard',
                element: <DashboardPage />,
              },
              {
                path: 'education-operations',
                element: <EducationOperationsPage />,
              },
              {
                path: 'instructor-assignment',
                element: <EducationOperationsPage />,
              },
              {
                path: 'reference-information-management',
                element: <EducationOperationsPage />,
              },
              {
                path: 'system-management',
                children: [
                  {
                    path: 'settings',
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

