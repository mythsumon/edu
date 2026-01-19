/**
 * Query key factory for teacher module
 */
export const teacherQueryKeys = {
  /**
   * All teacher-related queries
   */
  all: ['teacher'] as const,

  /**
   * List teachers query
   */
  lists: () => [...teacherQueryKeys.all, 'list'] as const,
  list: (params?: string) => [...teacherQueryKeys.lists(), params] as const,

  /**
   * Individual teacher queries
   */
  details: () => [...teacherQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...teacherQueryKeys.details(), id] as const,
}
