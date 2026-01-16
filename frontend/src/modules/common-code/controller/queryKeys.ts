export const commonCodeQueryKeys = {
  all: ['common-code'] as const,
  lists: () => [...commonCodeQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...commonCodeQueryKeys.lists(), { filters }] as const,
  roots: () => [...commonCodeQueryKeys.all, 'roots'] as const,
  rootsList: (filters: string) => [...commonCodeQueryKeys.roots(), { filters }] as const,
  details: () => [...commonCodeQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...commonCodeQueryKeys.details(), id] as const,
  detailByCode: (code: string) => [...commonCodeQueryKeys.details(), 'code', code] as const,
  check: () => [...commonCodeQueryKeys.all, 'check'] as const,
  checkCode: (code: string) => [...commonCodeQueryKeys.check(), code] as const,
  tree: () => [...commonCodeQueryKeys.all, 'tree'] as const,
  treeWithParams: (rootId?: number, depth?: number) => [
    ...commonCodeQueryKeys.tree(),
    { rootId, depth },
  ] as const,
  grandchildren: () => [...commonCodeQueryKeys.all, 'grandchildren'] as const,
  grandchildrenByCode: (code: string, params?: string) => [
    ...commonCodeQueryKeys.grandchildren(),
    code,
    params,
  ] as const,
}
