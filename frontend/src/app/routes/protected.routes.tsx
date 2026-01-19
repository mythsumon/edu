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
  // InstitutionManagementPage,
  InstructorManagementPage,
} from '@/modules/reference-information-management'
import { SettingsAndUserManagementPage } from '@/modules/system-management'
import { MasterCodeSetupPage, MasterCodeCreatePage } from '@/modules/master-code-setup'
import { CommonCodePage } from '@/modules/common-code'
import { InstitutionManagementPage, InstitutionCreatePage, InstitutionEditPage } from '@/modules/institution'
import { ProgramListPage, ProgramCreatePage, ProgramEditPage } from '@/modules/program'
import {
  AdminAccountManagementPage,
  AddAdminPage,
  AdminDetailPage,
  InstructorAccountManagementPage,
  AddInstructorPage,
  InstructorDetailPage,
  EditInstructorPage,
  TeacherAccountManagementPage,
  AddTeacherPage,
  TeacherDetailPage,
  EditTeacherPage,
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
                  // {
                  //   path: ROUTES.ADMIN_INSTITUTION_MANAGEMENT,
                  //   element: <InstitutionManagementPage />,
                  // },
                  {
                    path: ROUTES.ADMIN_PROGRAM_MANAGEMENT,
                    element: <ProgramListPage />,
                  },
                  {
                    path: ROUTES.ADMIN_INSTRUCTOR_MANAGEMENT,
                    element: <InstructorManagementPage />,
                  },
                ],
              },
              {
                path: ROUTES.ADMIN_PROGRAM,
                children: [
                  {
                    index: true,
                    element: <ProgramListPage />,
                  },
                  {
                    path: ROUTES.ADMIN_PROGRAM_CREATE,
                    element: <ProgramCreatePage />,
                  },
                  {
                    path: ROUTES.ADMIN_PROGRAM_EDIT,
                    element: <ProgramEditPage />,
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
                path: ROUTES.ADMIN_MASTER_CODE_SETUP,
                children: [
                  {
                    index: true,
                    element: <MasterCodeSetupPage />,
                  },
                  {
                    path: ROUTES.ADMIN_MASTER_CODE_SETUP_CREATE,
                    element: <MasterCodeCreatePage />,
                  },
                ],
              },
              {
                path: ROUTES.ADMIN_COMMON_CODE,
                element: <CommonCodePage />,
              },
              {
                path: ROUTES.ADMIN_INSTITUTION,
                children: [
                  {
                    index: true,
                    element: <InstitutionManagementPage />,
                  },
                  {
                    path: ROUTES.ADMIN_INSTITUTION_CREATE,
                    element: <InstitutionCreatePage />,
                  },
                  {
                    path: ROUTES.ADMIN_INSTITUTION_EDIT,
                    element: <InstitutionEditPage />,
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
                    children: [
                      {
                        index: true,
                        element: <AdminAccountManagementPage />,
                      },
                      {
                        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_CREATE,
                        element: <AddAdminPage />,
                      },
                      {
                        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_DETAIL,
                        element: <AdminDetailPage />,
                      },
                    ],
                  },
                  {
                    path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS,
                    children: [
                      {
                        index: true,
                        element: <InstructorAccountManagementPage />,
                      },
                      {
                        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_CREATE,
                        element: <AddInstructorPage />,
                      },
                      {
                        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_EDIT,
                        element: <EditInstructorPage />,
                      },
                      {
                        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_INSTRUCTORS_DETAIL,
                        element: <InstructorDetailPage />,
                      },
                    ],
                  },
                  {
                    path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS,
                    children: [
                      {
                        index: true,
                        element: <TeacherAccountManagementPage />,
                      },
                      {
                        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_CREATE,
                        element: <AddTeacherPage />,
                      },
                      {
                        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_EDIT,
                        element: <EditTeacherPage />,
                      },
                      {
                        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_TEACHERS_DETAIL,
                        element: <TeacherDetailPage />,
                      },
                    ],
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

