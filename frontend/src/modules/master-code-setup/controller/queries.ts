import { useQuery } from '@tanstack/react-query'
import {
  listMasterCodes,
  listRootMasterCodes,
  checkCodeExists,
  getMasterCodeTree,
  getMasterCodeChildrenByCode
} from '../model/master-code-setup.service'
import type { ListMasterCodesParams } from '../model/master-code-setup.types'
import { masterCodeSetupQueryKeys } from './queryKeys'

/**
 * Query hook for listing master codes with pagination and filters
 */
export const useMasterCodeSetupListQuery = (params?: ListMasterCodesParams) => {
  return useQuery({
    queryKey: masterCodeSetupQueryKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listMasterCodes(params)
    },
  })
}

/**
 * Query hook for listing root-level master codes only
 */
export const useRootMasterCodesQuery = (
  params?: Omit<ListMasterCodesParams, 'parentId' | 'rootOnly'>
) => {
  return useQuery({
    queryKey: masterCodeSetupQueryKeys.rootsList(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listRootMasterCodes(params)
    },
  })
}

/**
 * Query hook for listing all master codes (for parent dropdown)
 */
export const useAllMasterCodesQuery = () => {
  return useQuery({
    queryKey: masterCodeSetupQueryKeys.list(JSON.stringify({ size: 1000 })),
    queryFn: async () => {
      return await listMasterCodes({ size: 1000 })
    },
  })
}

/**
 * Query hook for checking if master code exists
 * Returns true if code exists, false if available
 */
export const useCheckCodeExistsQuery = (code: number | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: masterCodeSetupQueryKeys.checkCode(code!),
    queryFn: async () => {
      if (code === undefined) return false
      return await checkCodeExists(code)
    },
    enabled: enabled && code !== undefined && !isNaN(code),
    retry: false,
  })
}

/**
 * Query hook for checking if master code has children
 * Returns true if code has children, false otherwise
 */
export const useMasterCodeHasChildrenQuery = (parentId: number | undefined, enabled: boolean) => {
  return useQuery({
    queryKey: masterCodeSetupQueryKeys.list(JSON.stringify({ parentId, size: 1 })),
    queryFn: async () => {
      if (parentId === undefined) return false
      const result = await listMasterCodes({ parentId, size: 1 })
      return result.items.length > 0
    },
    enabled: enabled && parentId !== undefined,
    retry: false,
  })
}

/**
 * Query hook for getting master code tree (hierarchical structure)
 */
export const useMasterCodeTreeQuery = (rootId?: number, depth?: number) => {
  return useQuery({
    queryKey: masterCodeSetupQueryKeys.treeWithParams(rootId, depth),
    queryFn: async () => {
      return await getMasterCodeTree(rootId, depth)
    },
  })
}

/**
 * Query hook for listing children of a specific master code
 */
export const useMasterCodeChildrenQuery = (
  parentId: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: masterCodeSetupQueryKeys.list(JSON.stringify({ parentId })),
    queryFn: async () => {
      if (!parentId) return { items: [], total: 0, page: 0, size: 0, totalPages: 0 }
      return await listMasterCodes({ parentId })
    },
    enabled: enabled && parentId !== null && parentId !== undefined,
  })
}

/**
 * Query hook for fetching master code children by parent code
 */
export const useMasterCodeChildrenByCodeQuery = (
  parentCode: number,
  params?: { q?: string; page?: number; size?: number; sort?: string }
) => {
  return useQuery({
    queryKey: ['master-codes', 'children', parentCode, params],
    queryFn: async () => {
      return await getMasterCodeChildrenByCode(parentCode, params)
    },
  })
}
