export const systemManagementQueryKeys = {
  all: ['system-management'] as const,
  lists: () => [...systemManagementQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...systemManagementQueryKeys.lists(), { filters }] as const,
  details: () => [...systemManagementQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...systemManagementQueryKeys.details(), id] as const,
}

