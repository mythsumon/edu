import { useMutation, useQueryClient } from '@tanstack/react-query'
import { accountManagementQueryKeys } from './queryKeys'
import { createAdmin } from '../model/account-management.service'
import type { CreateAdminRequestDto } from '../model/account-management.types'

/**
 * Mutation hook for creating a new admin
 */
export const useCreateAdmin = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateAdminRequestDto) => {
      return await createAdmin(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.admins() })
    },
  })
}

// Placeholder mutations - to be implemented when API is available
export const useUpdateAccountManagement = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: unknown) => {
      // Placeholder - replace with actual API call
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: accountManagementQueryKeys.lists() })
    },
  })
}
