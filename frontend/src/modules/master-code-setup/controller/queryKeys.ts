export const masterCodeSetupQueryKeys = {
  all: ['master-code-setup'] as const,
  lists: () => [...masterCodeSetupQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...masterCodeSetupQueryKeys.lists(), { filters }] as const,
  roots: () => [...masterCodeSetupQueryKeys.all, 'roots'] as const,
  rootsList: (filters: string) => [...masterCodeSetupQueryKeys.roots(), { filters }] as const,
  details: () => [...masterCodeSetupQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...masterCodeSetupQueryKeys.details(), id] as const,
  check: () => [...masterCodeSetupQueryKeys.all, 'check'] as const,
  checkCode: (code: string) => [...masterCodeSetupQueryKeys.check(), code] as const,
  tree: () => [...masterCodeSetupQueryKeys.all, 'tree'] as const,
  treeWithParams: (rootId?: number, depth?: number) => [
    ...masterCodeSetupQueryKeys.tree(),
    { rootId, depth },
  ] as const,
}
