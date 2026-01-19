import { useQuery } from '@tanstack/react-query'
import { listInstitutions, getInstitutionById, getMasterCodeChildren, getMasterCodeGrandChildren, getMasterCodeById } from '../model/institution.service'
import type { MasterCodeChildrenParams, ListInstitutionsParams } from '../model/institution.types'
import { institutionQueryKeys } from './queryKeys'

/**
 * Query hook for listing institutions with pagination and filters
 */
export const useInstitutionsQuery = (params?: ListInstitutionsParams) => {
  return useQuery({
    queryKey: institutionQueryKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listInstitutions(params)
    },
  })
}

/**
 * Query hook for fetching master code children by parent code
 */
export const useMasterCodeChildrenQuery = (
  parentCode: string | undefined,
  params?: MasterCodeChildrenParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: institutionQueryKeys.masterCodeChildrenByCode(
      parentCode!,
      JSON.stringify(params || {})
    ),
    queryFn: async () => {
      if (!parentCode || parentCode.trim() === '') {
        throw new Error('Parent code is required')
      }
      return await getMasterCodeChildren(parentCode, params)
    },
    enabled: enabled && parentCode !== undefined && parentCode.trim() !== '',
  })
}

/**
 * Query hook for fetching master code grandchildren by parent code
 * Grandchildren are children of children (2 levels deep)
 */
export const useMasterCodeGrandChildrenQuery = (
  parentCode: string | undefined,
  params?: MasterCodeChildrenParams,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: institutionQueryKeys.masterCodeGrandChildrenByCode(
      parentCode!,
      JSON.stringify(params || {})
    ),
    queryFn: async () => {
      if (!parentCode || parentCode.trim() === '') {
        throw new Error('Parent code is required')
      }
      return await getMasterCodeGrandChildren(parentCode, params)
    },
    enabled: enabled && parentCode !== undefined && parentCode.trim() !== '',
  })
}

/**
 * Query hook for fetching master code by ID
 */
export const useMasterCodeByIdQuery = (
  id: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: institutionQueryKeys.masterCodeById(id!),
    queryFn: async () => {
      if (!id) {
        throw new Error('Master code ID is required')
      }
      return await getMasterCodeById(id)
    },
    enabled: enabled && id !== null && id !== undefined,
  })
}

/**
 * Query hook for fetching institution by ID
 */
export const useInstitutionByIdQuery = (
  id: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: institutionQueryKeys.detail(id!),
    queryFn: async () => {
      if (!id) {
        throw new Error('Institution ID is required')
      }
      return await getInstitutionById(id)
    },
    enabled: enabled && id !== null && id !== undefined,
  })
}
