import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createCommonCode, updateCommonCode, deleteCommonCode } from '../model/common-code.service'
import type {
  CommonCodeCreateDto,
  CommonCodeUpdateDto,
} from '../model/common-code.types'
import { commonCodeQueryKeys } from './queryKeys'

/**
 * Create common code mutation hook
 */
export const useCreateCommonCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CommonCodeCreateDto) => {
      return await createCommonCode(data)
    },
    onSuccess: (_, variables) => {
      // Invalidate all list, roots, and tree queries after creation
      // queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.roots() })
      // queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.tree() })
      
      // Invalidate children query if parentId exists
      if (variables.parentId !== null && variables.parentId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: commonCodeQueryKeys.list(JSON.stringify({ parentId: variables.parentId, sort: "code,desc" })),
        })
      }
    },
  })
}

/**
 * Update common code mutation hook
 */
export const useUpdateCommonCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CommonCodeUpdateDto }) => {
      return await updateCommonCode(id, data)
    },
    onSuccess: (_, variables) => {
      // Invalidate root queries (for parent codes)
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.roots() })
      
      // Invalidate all list queries
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.lists() })
      
      // Invalidate children query if parentId exists (for child codes)
      if (variables.data.parentId !== null && variables.data.parentId !== undefined) {
        queryClient.invalidateQueries({
          queryKey: commonCodeQueryKeys.list(JSON.stringify({ parentId: variables.data.parentId, sort: "code,desc" })),
        })
      }
      
      // Invalidate detail query for the updated code
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.detail(variables.id) })
      
      // Invalidate tree queries
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.tree() })
    },
  })
}

/**
 * Delete common code mutation hook
 */
export const useDeleteCommonCode = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: number) => {
      return await deleteCommonCode(id)
    },
    onSuccess: () => {
      // Invalidate root queries (for parent codes)
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.roots() })
      
      // Invalidate all list queries (this will include all children queries)
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.lists() })
      
      // Invalidate tree queries
      queryClient.invalidateQueries({ queryKey: commonCodeQueryKeys.tree() })
    },
  })
}
