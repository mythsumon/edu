import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createAdminTraining, updateAdminTraining, deleteAdminTraining } from '../model/admin-training.service'
import type { AdminTrainingCreateDto, AdminTrainingUpdateDto } from '../model/admin-training.types'
import { adminTrainingQueryKeys } from './queryKeys'

/**
 * Create admin training mutation hook
 */
export const useCreateAdminTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AdminTrainingCreateDto) => {
      return await createAdminTraining(data)
    },
    onSuccess: () => {
      // Invalidate admin training list queries after creation
      queryClient.invalidateQueries({ queryKey: adminTrainingQueryKeys.lists() })
    },
  })
}

/**
 * Update admin training mutation hook
 */
export const useUpdateAdminTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: AdminTrainingUpdateDto }) => {
      return await updateAdminTraining(id, data)
    },
    onSuccess: (_, variables) => {
      // Invalidate admin training list queries and detail query after update
      queryClient.invalidateQueries({ queryKey: adminTrainingQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: adminTrainingQueryKeys.detail(variables.id) })
    },
  })
}

/**
 * Delete admin training mutation hook
 */
export const useDeleteAdminTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteAdminTraining(id)
    },
    onSuccess: () => {
      // Invalidate admin training list queries after deletion
      queryClient.invalidateQueries({ queryKey: adminTrainingQueryKeys.lists() })
    },
  })
}
