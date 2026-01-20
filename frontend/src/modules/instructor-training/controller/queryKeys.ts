export const trainingQueryKeys = {
  all: ['training'] as const,
  lists: () => [...trainingQueryKeys.all, 'list'] as const,
  list: (params?: unknown) => [...trainingQueryKeys.lists(), params] as const,
  details: () => [...trainingQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...trainingQueryKeys.details(), id] as const,
}
