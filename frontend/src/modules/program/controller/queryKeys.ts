export const programQueryKeys = {
  all: ['program'] as const,
  lists: () => [...programQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...programQueryKeys.lists(), { filters }] as const,
  details: () => [...programQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...programQueryKeys.details(), id] as const,
  masterCodeChildren: () => [...programQueryKeys.all, 'masterCodeChildren'] as const,
  masterCodeChildrenByCode: (parentCode: string, filters: string) =>
    [...programQueryKeys.masterCodeChildren(), parentCode, { filters }] as const,
}
