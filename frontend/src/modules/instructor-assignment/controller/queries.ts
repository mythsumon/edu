import { useQuery } from '@tanstack/react-query'
import { instructorAssignmentQueryKeys } from './queryKeys'

// Placeholder queries - to be implemented when API is available
export const useInstructorAssignmentListQuery = () => {
  return useQuery({
    queryKey: instructorAssignmentQueryKeys.lists(),
    queryFn: async () => {
      // Placeholder - replace with actual API call
      return []
    },
  })
}

