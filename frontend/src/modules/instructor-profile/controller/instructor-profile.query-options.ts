import { queryOptions } from '@tanstack/react-query'
import { 
  getMasterCodeById, 
  getMasterCodeByCode, 
  getMasterCodeChildrenByCode,
  getMasterCodeGrandChildrenByCode,
} from '../model/instructor-profile.service'
import type { MasterCodeChildrenParams } from '../model/instructor-profile.types'
import { instructorProfileQueryKeys } from './queryKeys'

/**
 * Query options for fetching master code by ID
 * Can be used with useQuery or ensureQueryData
 */
export const masterCodeByIdQueryOptions = (id: number) => {
  return queryOptions({
    queryKey: instructorProfileQueryKeys.masterCodeById(id),
    queryFn: async () => {
      if (!id) {
        throw new Error('Master code ID is required')
      }
      return await getMasterCodeById(id)
    },
  })
}

/**
 * Query options for fetching master code by code
 * Can be used with useQuery or ensureQueryData
 */
export const masterCodeByCodeQueryOptions = (code: string) => {
  return queryOptions({
    queryKey: instructorProfileQueryKeys.masterCodeByCode(code),
    queryFn: async () => {
      if (!code || code.trim() === '') {
        throw new Error('Master code code is required')
      }
      return await getMasterCodeByCode(code)
    },
  })
}

/**
 * Query options for fetching master code children by code
 * Can be used with useQuery or ensureQueryData
 */
export const masterCodeChildrenByCodeQueryOptions = (
  code: string,
  params?: MasterCodeChildrenParams
) => {
  return queryOptions({
    queryKey: instructorProfileQueryKeys.masterCodeChildrenByCode(code, JSON.stringify(params || {})),
    queryFn: async () => {
      if (!code || code.trim() === '') {
        throw new Error('Master code code is required')
      }
      return await getMasterCodeChildrenByCode(code, params)
    },
  })
}

/**
 * Query options for fetching master code grandchildren by code
 * Can be used with useQuery or ensureQueryData
 */
export const masterCodeGrandChildrenByCodeQueryOptions = (
  code: string,
  params?: MasterCodeChildrenParams
) => {
  return queryOptions({
    queryKey: instructorProfileQueryKeys.masterCodeGrandChildrenByCode(code, JSON.stringify(params || {})),
    queryFn: async () => {
      if (!code || code.trim() === '') {
        throw new Error('Master code code is required')
      }
      return await getMasterCodeGrandChildrenByCode(code, params)
    },
  })
}
