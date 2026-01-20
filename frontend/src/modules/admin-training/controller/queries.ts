import { useQuery } from '@tanstack/react-query'
import { listAdminTrainings, getAdminTrainingById, getMasterCodeChildren, listPrograms, listInstitutions } from '../model/admin-training.service'
import type { ListAdminTrainingsParams, MasterCodeChildrenParams, ListProgramsParams, ListInstitutionsParams } from '../model/admin-training.types'
import { adminTrainingQueryKeys } from './queryKeys'

/**
 * Query hook for listing admin trainings with pagination and filters
 */
export const useAdminTrainingsQuery = (params?: ListAdminTrainingsParams) => {
  return useQuery({
    queryKey: adminTrainingQueryKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listAdminTrainings(params)
    },
  })
}

/**
 * Query hook for fetching admin training by ID
 */
export const useAdminTrainingByIdQuery = (
  id: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: adminTrainingQueryKeys.detail(id!),
    queryFn: async () => {
      if (!id) {
        throw new Error('Admin Training ID is required')
      }
      return await getAdminTrainingById(id)
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
    queryKey: adminTrainingQueryKeys.masterCodeChildrenByCode(
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
    queryKey: adminTrainingQueryKeys.programsList(JSON.stringify(params || {})),
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
    queryKey: adminTrainingQueryKeys.institutionsList(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listInstitutions(params)
    },
  })
}
