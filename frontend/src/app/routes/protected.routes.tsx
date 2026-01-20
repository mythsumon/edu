import { RouteObject, Navigate } from 'react-router-dom'
import { AppShell } from '../layout/AppShell'
import { ProtectedLayout } from '../layout/ProtectedLayout'
import { AdminRouteGuard } from '../layout/AdminRouteGuard'
import { InstructorRouteGuard } from '../layout/InstructorRouteGuard'
import { TeacherRouteGuard } from '../layout/TeacherRouteGuard'
import { ROUTES } from '@/shared/constants/routes'
import { DashboardPage, TeacherDashboardPage } from '@/modules/dashboard'
import { MasterCodeSetupPage, MasterCodeCreatePage } from '@/modules/master-code-setup'
import { CommonCodePage } from '@/modules/common-code'
import { InstitutionManagementPage, InstitutionCreatePage, InstitutionEditPage } from '@/modules/institution'
import { ProgramListPage, ProgramCreatePage, ProgramEditPage } from '@/modules/program'
import {
  AdminAccountManagementPage,
  AddAdminPage,
  AdminDetailPage,
  EditAdminPage,
  InstructorAccountManagementPage,
  AddInstructorPage,
  InstructorDetailPage,
  EditInstructorPage,
  TeacherAccountManagementPage,
  AddTeacherPage,
  TeacherDetailPage,
  EditTeacherPage,
  AdminAccountSettingsPage,
  ProfileSettingsAdminPage,
  ProfileSettingsInstructorPage,
  ProfileSettingsTeacherPage,
} from '@/modules/account-management'
import { AdminTrainingPage, AdminTrainingCreatePage } from '@/modules/admin-training'

export const protectedRoutes: RouteObject[] = [
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <AppShell />,
        children: [
          // Admin routes grouped under /admin
          {
            path: ROUTES.ADMIN,
            element: <AdminRouteGuard />,
            children: [
              {
                index: true,
                element: <Navigate to={ROUTES.ADMIN_DASHBOARD_FULL} replace />,
              },
              {
                path: ROUTES.ADMIN_DASHBOARD,
                element: <DashboardPage />,
              },
              {
                path: ROUTES.ACCOUNT_SETTINGS,
                element: <AdminAccountSettingsPage />,
              },
              {
                path: ROUTES.PROFILE_SETTINGS,
                element: <ProfileSettingsAdminPage />,
              },
              // Teacher profile settings (teachers use admin routes)
              {
                path: 'teacher-profile-settings',
                element: <ProfileSettingsTeacherPage />,
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
                      {
                        path: ROUTES.ADMIN_ACCOUNT_MANAGEMENT_ADMINS_EDIT,
                        element: <EditAdminPage />,
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
              {
                path: ROUTES.ADMIN_TRAINING,
                children: [
                  {
                    index: true,
                    element: <AdminTrainingPage />,
                  },
                  {
                    path: ROUTES.ADMIN_TRAINING_CREATE,
                    element: <AdminTrainingCreatePage />,
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
                index: true,
                element: <Navigate to={ROUTES.INSTRUCTOR_DASHBOARD_FULL} replace />,
              },
              {
                path: ROUTES.INSTRUCTOR_DASHBOARD,
                element: <DashboardPage />,
              },
              {
                path: ROUTES.ACCOUNT_SETTINGS,
                element: <AdminAccountSettingsPage />,
              },
              {
                path: ROUTES.PROFILE_SETTINGS,
                element: <ProfileSettingsInstructorPage />,
              },
            ],
          },
          // Teacher routes grouped under /teacher
          {
            path: ROUTES.TEACHER,
            element: <TeacherRouteGuard />,
            children: [
              {
                index: true,
                element: <Navigate to={ROUTES.TEACHER_DASHBOARD_FULL} replace />,
              },
              {
                path: ROUTES.TEACHER_DASHBOARD,
                element: <TeacherDashboardPage />,
              },
              {
                path: ROUTES.ACCOUNT_SETTINGS,
                element: <AdminAccountSettingsPage />,
              },
              {
                path: ROUTES.PROFILE_SETTINGS,
                element: <ProfileSettingsTeacherPage />,
              },
            ],
          },
        ],
      },
    ],
  },
]

