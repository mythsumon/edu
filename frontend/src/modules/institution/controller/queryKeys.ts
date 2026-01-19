export const institutionQueryKeys = {
  all: ['institution'] as const,
  lists: () => [...institutionQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...institutionQueryKeys.lists(), { filters }] as const,
  details: () => [...institutionQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...institutionQueryKeys.details(), id] as const,
  masterCode: () => [...institutionQueryKeys.all, 'master-code'] as const,
  masterCodeChildren: () => [...institutionQueryKeys.masterCode(), 'children'] as const,
  masterCodeChildrenByCode: (code: string, params?: string) => [
    ...institutionQueryKeys.masterCodeChildren(),
    code,
    params,
  ] as const,
  masterCodeGrandChildren: () => [...institutionQueryKeys.masterCode(), 'grandchildren'] as const,
  masterCodeGrandChildrenByCode: (code: string, params?: string) => [
    ...institutionQueryKeys.masterCodeGrandChildren(),
    code,
    params,
  ] as const,
  masterCodeById: (id: number) => [
    ...institutionQueryKeys.masterCode(),
    'by-id',
    id,
  ] as const,
}
