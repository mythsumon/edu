import { useQuery } from '@tanstack/react-query'
import { listMasterCodes } from '../model/master-code-setup.service'
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
