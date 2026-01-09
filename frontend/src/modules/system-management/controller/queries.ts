import { useQuery } from '@tanstack/react-query'
import { systemManagementQueryKeys } from './queryKeys'

// Placeholder queries - to be implemented when API is available
export const useSystemManagementListQuery = () => {
  return useQuery({
    queryKey: systemManagementQueryKeys.lists(),
    queryFn: async () => {
      // Placeholder - replace with actual API call
      return []
    },
  })
}

