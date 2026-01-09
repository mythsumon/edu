export const referenceInformationManagementQueryKeys = {
  all: ['reference-information-management'] as const,
  lists: () => [...referenceInformationManagementQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...referenceInformationManagementQueryKeys.lists(), { filters }] as const,
  details: () => [...referenceInformationManagementQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...referenceInformationManagementQueryKeys.details(), id] as const,
}

