export const educationOperationsQueryKeys = {
  all: ['education-operations'] as const,
  lists: () => [...educationOperationsQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...educationOperationsQueryKeys.lists(), { filters }] as const,
  details: () => [...educationOperationsQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...educationOperationsQueryKeys.details(), id] as const,
}

