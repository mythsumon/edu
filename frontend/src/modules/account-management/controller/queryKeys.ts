export const accountManagementQueryKeys = {
  all: ['account-management'] as const,
  admins: () => [...accountManagementQueryKeys.all, 'admins'] as const,
  adminList: (params?: { q?: string; page?: number; size?: number; sort?: string }) =>
    [...accountManagementQueryKeys.admins(), 'list', params] as const,
  instructors: () => [...accountManagementQueryKeys.all, 'instructors'] as const,
  instructorList: (params?: { q?: string; page?: number; size?: number; sort?: string }) =>
    [...accountManagementQueryKeys.instructors(), 'list', params] as const,
  details: () => [...accountManagementQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...accountManagementQueryKeys.details(), id] as const,
}
