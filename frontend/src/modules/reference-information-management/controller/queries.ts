import { useQuery } from '@tanstack/react-query'
import { referenceInformationManagementQueryKeys } from './queryKeys'

// Placeholder queries - to be implemented when API is available
export const useReferenceInformationManagementListQuery = () => {
  return useQuery({
    queryKey: referenceInformationManagementQueryKeys.lists(),
    queryFn: async () => {
      // Placeholder - replace with actual API call
      return []
    },
  })
}

