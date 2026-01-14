import { useQuery } from '@tanstack/react-query'
import { listMasterCodes, getMasterCodeChildrenByCode } from '../model/master-code-setup.service'
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
