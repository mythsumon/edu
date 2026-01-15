import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMasterCode, updateMasterCode, deleteMasterCode } from '../model/master-code-setup.service'
import type {
  MasterCodeCreateDto,
  MasterCodeUpdateDto,
} from '../model/master-code-setup.types'
import { masterCodeSetupQueryKeys } from './queryKeys'

/**
 * Create master code mutation hook
 */
export const useCreateMasterCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: MasterCodeCreateDto) => {
      return await createMasterCode(data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterCodeSetupQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: masterCodeSetupQueryKeys.roots() })
    },
  })
}

/**
 * Update master code mutation hook
 */
export const useUpdateMasterCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MasterCodeUpdateDto }) => {
      return await updateMasterCode(id, data)
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: masterCodeSetupQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: masterCodeSetupQueryKeys.detail(variables.id) })
    },
  })
}

/**
 * Delete master code mutation hook
 */
export const useDeleteMasterCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteMasterCode(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: masterCodeSetupQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: masterCodeSetupQueryKeys.roots() })
    },
  })
}
