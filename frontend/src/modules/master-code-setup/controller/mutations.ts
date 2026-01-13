import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createMasterCode, updateMasterCode } from '../model/master-code-setup.service'
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
