export const accountManagementQueryKeys = {
  all: ['account-management'] as const,
  lists: () => [...accountManagementQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...accountManagementQueryKeys.lists(), { filters }] as const,
  details: () => [...accountManagementQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...accountManagementQueryKeys.details(), id] as const,
}
