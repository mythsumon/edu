export const lectureQueryKeys = {
  all: ['lecture'] as const,
  lists: () => [...lectureQueryKeys.all, 'list'] as const,
  list: (params?: unknown) => [...lectureQueryKeys.lists(), params] as const,
  details: () => [...lectureQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...lectureQueryKeys.details(), id] as const,
}
