import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createInstitution, updateInstitution } from '../model/institution.service'
import type { InstitutionCreateDto, InstitutionUpdateDto } from '../model/institution.types'
import { institutionQueryKeys } from './queryKeys'

/**
 * Create institution mutation hook
 */
export const useCreateInstitution = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: InstitutionCreateDto) => {
      return await createInstitution(data)
    },
    onSuccess: () => {
      // Invalidate institution list queries after creation
      queryClient.invalidateQueries({ queryKey: institutionQueryKeys.lists() })
    },
  })
}

/**
 * Update institution mutation hook
 */
export const useUpdateInstitution = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: InstitutionUpdateDto }) => {
      return await updateInstitution(id, data)
    },
    onSuccess: (_, variables) => {
      // Invalidate institution list queries and detail query after update
      queryClient.invalidateQueries({ queryKey: institutionQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: institutionQueryKeys.detail(variables.id) })
    },
  })
}
