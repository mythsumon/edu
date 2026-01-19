import { useQuery } from '@tanstack/react-query'
import { listTrainings, getTrainingById, getMasterCodeChildren, listPrograms, listInstitutions } from '../model/training.service'
import type { ListTrainingsParams, MasterCodeChildrenParams, ListProgramsParams, ListInstitutionsParams } from '../model/training.types'
import { trainingQueryKeys } from './queryKeys'

/**
 * Query hook for listing trainings with pagination and filters
 */
export const useTrainingsQuery = (params?: ListTrainingsParams) => {
  return useQuery({
    queryKey: trainingQueryKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listTrainings(params)
    },
  })
}

/**
 * Query hook for fetching training by ID
 */
export const useTrainingByIdQuery = (
  id: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: trainingQueryKeys.detail(id!),
    queryFn: async () => {
      if (!id) {
        throw new Error('Training ID is required')
      }
      return await getTrainingById(id)
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
    queryKey: trainingQueryKeys.masterCodeChildrenByCode(
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
 * Query hook for listing programs with pagination and filters
 */
export const useProgramsQuery = (params?: ListProgramsParams) => {
  return useQuery({
    queryKey: trainingQueryKeys.programsList(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listPrograms(params)
    },
  })
}

/**
 * Query hook for listing institutions with pagination and filters
 */
export const useInstitutionsQuery = (params?: ListInstitutionsParams) => {
  return useQuery({
    queryKey: trainingQueryKeys.institutionsList(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listInstitutions(params)
    },
  })
}
