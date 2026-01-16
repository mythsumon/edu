import { useQuery } from '@tanstack/react-query'
import {
  listCommonCodes,
  listRootCommonCodes,
  checkCodeExists,
  getCommonCodeTree,
  getCommonCodeById,
  getCommonCodeChildrenByCode,
} from '../model/common-code.service'
import type { ListCommonCodesParams } from '../model/common-code.types'
import { commonCodeQueryKeys } from './queryKeys'

/**
 * Query hook for listing common codes with pagination and filters
 */
export const useCommonCodeListQuery = (params?: ListCommonCodesParams) => {
  return useQuery({
    queryKey: commonCodeQueryKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listCommonCodes(params)
    },
  })
}

/**
 * Query hook for listing root-level common codes only
 */
export const useRootCommonCodesQuery = (
  params?: Omit<ListCommonCodesParams, 'parentId' | 'rootOnly'>
) => {
  return useQuery({
    queryKey: commonCodeQueryKeys.rootsList(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listRootCommonCodes(params)
    },
  })
}

/**
 * Query hook for listing all common codes (for dropdown)
 */
export const useAllCommonCodesQuery = () => {
  return useQuery({
    queryKey: commonCodeQueryKeys.list(JSON.stringify({ size: 1000 })),
    queryFn: async () => {
      return await listCommonCodes({ size: 1000 })
    },
  })
}

/**
 * Query hook for checking if common code exists
 * Returns true if code exists, false if available
 */
export const useCheckCodeExistsQuery = (code: string | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: commonCodeQueryKeys.checkCode(code!),
    queryFn: async () => {
      if (code === undefined || code.trim() === '') return false
      return await checkCodeExists(code)
    },
    enabled: enabled && code !== undefined && code.trim() !== '',
    retry: false,
  })
}

/**
 * Query hook for checking if common code has children
 * Returns true if code has children, false otherwise
 */
export const useCommonCodeHasChildrenQuery = (parentId: number | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: commonCodeQueryKeys.list(JSON.stringify({ parentId, size: 1 })),
    queryFn: async () => {
      if (parentId === undefined) return false
      const result = await listCommonCodes({ parentId, size: 1 })
      return result.items.length > 0
    },
    enabled: enabled && parentId !== undefined,
    retry: false,
  })
}

/**
 * Query hook for getting common code tree (hierarchical structure)
 */
export const useCommonCodeTreeQuery = (rootId?: number, depth?: number) => {
  return useQuery({
    queryKey: commonCodeQueryKeys.treeWithParams(rootId, depth),
    queryFn: async () => {
      return await getCommonCodeTree(rootId, depth)
    },
  })
}

/**
 * Query hook for listing children of a specific common code
 */
export const useCommonCodeChildrenQuery = (
  parentId: number | null | undefined,
  enabled: boolean = true,
  params?: Omit<ListCommonCodesParams, 'parentId'>
) => {
  return useQuery({
    queryKey: commonCodeQueryKeys.list(JSON.stringify({ parentId, ...params })),
    queryFn: async () => {
      if (!parentId) return { items: [], total: 0, page: 0, size: 0, totalPages: 0 }
      return await listCommonCodes({ parentId, ...params })
    },
    enabled: enabled && parentId !== null && parentId !== undefined,
  })
}

/**
 * Query hook for getting common code by id
 */
export const useCommonCodeByIdQuery = (id: number | undefined, enabled: boolean = true) => {
  return useQuery({
    queryKey: commonCodeQueryKeys.detail(id!),
    queryFn: async () => {
      if (id === undefined) throw new Error('ID is required')
      return await getCommonCodeById(id)
    },
    enabled: enabled && id !== undefined,
  })
}

/**
 * Query hook for fetching common code children by parent code
 */
export const useCommonCodeChildrenByCodeQuery = (
  parentCode: string,
  params?: { q?: string; page?: number; size?: number; sort?: string }
) => {
  return useQuery({
    queryKey: ['common-codes', 'children', parentCode, params],
    queryFn: async () => {
      return await getCommonCodeChildrenByCode(parentCode, params)
    },
  })
}
