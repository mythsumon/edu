import { useMutation, useQueryClient } from '@tanstack/react-query'
import { educationOperationsQueryKeys } from './queryKeys'

// Placeholder mutations - to be implemented when API is available
export const useCreateEducationOperations = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: unknown) => {
      // Placeholder - replace with actual API call
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: educationOperationsQueryKeys.lists() })
    },
  })
}

