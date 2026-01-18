import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProgram, updateProgram } from '../model/program.service'
import type { ProgramCreateDto, ProgramUpdateDto } from '../model/program.types'
import { programQueryKeys } from './queryKeys'

/**
 * Create program mutation hook
 */
export const useCreateProgram = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: ProgramCreateDto) => {
      return await createProgram(data)
    },
    onSuccess: () => {
      // Invalidate program list queries after creation
      queryClient.invalidateQueries({ queryKey: programQueryKeys.lists() })
    },
  })
}

/**
 * Update program mutation hook
 */
export const useUpdateProgram = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: ProgramUpdateDto }) => {
      return await updateProgram(id, data)
    },
    onSuccess: (_, variables) => {
      // Invalidate program list queries and detail query after update
      queryClient.invalidateQueries({ queryKey: programQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: programQueryKeys.detail(variables.id) })
    },
  })
}
