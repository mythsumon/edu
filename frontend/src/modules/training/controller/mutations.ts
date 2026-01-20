import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTraining, updateTraining, deleteTraining } from '../model/training.service'
import type { TrainingCreateDto, TrainingUpdateDto } from '../model/training.types'
import { trainingQueryKeys } from './queryKeys'

/**
 * Create training mutation hook
 */
export const useCreateTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: TrainingCreateDto) => {
      return await createTraining(data)
    },
    onSuccess: () => {
      // Invalidate training list queries after creation
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.lists() })
    },
  })
}

/**
 * Update training mutation hook
 */
export const useUpdateTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: TrainingUpdateDto }) => {
      return await updateTraining(id, data)
    },
    onSuccess: (_, variables) => {
      // Invalidate training list queries and detail query after update
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.detail(variables.id) })
    },
  })
}

/**
 * Delete training mutation hook
 */
export const useDeleteTraining = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteTraining(id)
    },
    onSuccess: () => {
      // Invalidate training list queries after deletion
      queryClient.invalidateQueries({ queryKey: trainingQueryKeys.lists() })
    },
  })
}
