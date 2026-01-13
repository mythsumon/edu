export const instructorAssignmentQueryKeys = {
  all: ['instructor-assignment'] as const,
  lists: () => [...instructorAssignmentQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...instructorAssignmentQueryKeys.lists(), { filters }] as const,
  details: () => [...instructorAssignmentQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...instructorAssignmentQueryKeys.details(), id] as const,
}

