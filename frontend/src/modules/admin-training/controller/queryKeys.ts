export const adminTrainingQueryKeys = {
  all: ['admin-training'] as const,
  lists: () => [...adminTrainingQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...adminTrainingQueryKeys.lists(), { filters }] as const,
  details: () => [...adminTrainingQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...adminTrainingQueryKeys.details(), id] as const,
  masterCodeChildren: () => [...adminTrainingQueryKeys.all, 'masterCodeChildren'] as const,
  masterCodeChildrenByCode: (parentCode: string, filters: string) =>
    [...adminTrainingQueryKeys.masterCodeChildren(), parentCode, { filters }] as const,
  programs: () => [...adminTrainingQueryKeys.all, 'programs'] as const,
  programsList: (filters: string) => [...adminTrainingQueryKeys.programs(), { filters }] as const,
  institutions: () => [...adminTrainingQueryKeys.all, 'institutions'] as const,
  institutionsList: (filters: string) => [...adminTrainingQueryKeys.institutions(), { filters }] as const,
}
