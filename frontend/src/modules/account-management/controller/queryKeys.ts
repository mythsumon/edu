import type { ListAccountsParams } from '../model/account-management.types'

export const accountManagementQueryKeys = {
  all: ['account-management'] as const,
  admins: () => [...accountManagementQueryKeys.all, 'admins'] as const,
  adminList: (params?: ListAccountsParams) =>
    [...accountManagementQueryKeys.admins(), 'list', params] as const,
  adminDetails: () => [...accountManagementQueryKeys.admins(), 'detail'] as const,
  adminDetail: (id: number) => [...accountManagementQueryKeys.adminDetails(), id] as const,
  adminDetailByUsername: (username: string) => [...accountManagementQueryKeys.adminDetails(), 'username', username] as const,
  instructors: () => [...accountManagementQueryKeys.all, 'instructors'] as const,
  instructorList: (params?: ListAccountsParams) =>
    [...accountManagementQueryKeys.instructors(), 'list', params] as const,
  instructorMe: () => [...accountManagementQueryKeys.instructors(), 'me'] as const,
  details: () => [...accountManagementQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...accountManagementQueryKeys.details(), id] as const,
  teachers: () => [...accountManagementQueryKeys.all, 'teachers'] as const,
  teacherList: (params?: ListAccountsParams) =>
    [...accountManagementQueryKeys.teachers(), 'list', params] as const,
  teacherDetails: () => [...accountManagementQueryKeys.teachers(), 'detail'] as const,
  teacherDetail: (id: number) => [...accountManagementQueryKeys.teacherDetails(), id] as const,
}
