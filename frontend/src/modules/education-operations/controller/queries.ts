import { useQuery } from '@tanstack/react-query'
import { educationOperationsQueryKeys } from './queryKeys'

// Placeholder queries - to be implemented when API is available
export const useEducationOperationsListQuery = () => {
  return useQuery({
    queryKey: educationOperationsQueryKeys.lists(),
    queryFn: async () => {
      // Placeholder - replace with actual API call
      return []
    },
  })
}

