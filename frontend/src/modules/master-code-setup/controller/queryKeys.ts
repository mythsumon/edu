export const masterCodeSetupQueryKeys = {
  all: ['master-code-setup'] as const,
  lists: () => [...masterCodeSetupQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...masterCodeSetupQueryKeys.lists(), { filters }] as const,
  details: () => [...masterCodeSetupQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...masterCodeSetupQueryKeys.details(), id] as const,
}
