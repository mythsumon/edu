import { useQuery } from '@tanstack/react-query'
import { listPrograms, getProgramById, getMasterCodeChildren } from '../model/program.service'
import type { ListProgramsParams, MasterCodeChildrenParams } from '../model/program.types'
import { programQueryKeys } from './queryKeys'

/**
 * Query hook for listing programs with pagination and filters
 */
export const useProgramsQuery = (params?: ListProgramsParams) => {
  return useQuery({
    queryKey: programQueryKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listPrograms(params)
    },
  })
}

/**
 * Query hook for fetching program by ID
 */
export const useProgramByIdQuery = (
  id: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: programQueryKeys.detail(id!),
    queryFn: async () => {
      if (!id) {
        throw new Error('Program ID is required')
      }
      return await getProgramById(id)
    },
    enabled: enabled && id !== null && id !== undefined,
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
    queryKey: programQueryKeys.masterCodeChildrenByCode(
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
