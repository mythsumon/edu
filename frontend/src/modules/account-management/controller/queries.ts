import { useQuery } from '@tanstack/react-query'
import { accountManagementQueryKeys } from './queryKeys'

// Placeholder queries - to be implemented when API is available
export const useAccountManagementQuery = () => {
  return useQuery({
    queryKey: accountManagementQueryKeys.lists(),
    queryFn: async () => {
      // Placeholder - replace with actual API call
      return null
    },
  })
}
