export const trainingQueryKeys = {
  all: ['training'] as const,
  lists: () => [...trainingQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...trainingQueryKeys.lists(), { filters }] as const,
  details: () => [...trainingQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...trainingQueryKeys.details(), id] as const,
  masterCodeChildren: () => [...trainingQueryKeys.all, 'masterCodeChildren'] as const,
  masterCodeChildrenByCode: (parentCode: string, filters: string) =>
    [...trainingQueryKeys.masterCodeChildren(), parentCode, { filters }] as const,
  programs: () => [...trainingQueryKeys.all, 'programs'] as const,
  programsList: (filters: string) => [...trainingQueryKeys.programs(), { filters }] as const,
  institutions: () => [...trainingQueryKeys.all, 'institutions'] as const,
  institutionsList: (filters: string) => [...trainingQueryKeys.institutions(), { filters }] as const,
}
