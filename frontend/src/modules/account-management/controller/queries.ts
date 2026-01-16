import { useQuery } from '@tanstack/react-query'
import { accountManagementQueryKeys } from './queryKeys'
import { listAdmins, listInstructors, getInstructorById } from '../model/account-management.service'
import {
  mapAdminAccountList,
  mapInstructorAccountList,
  mapInstructorDetail,
} from '../model/mapper'
import type { ListAccountsParams, InstructorDetail } from '../model/account-management.types'

/**
 * Query hook for listing admin accounts
 */
export const useAdminAccountsQuery = (params?: ListAccountsParams) => {
  return useQuery({
    queryKey: accountManagementQueryKeys.adminList(params),
    queryFn: async () => {
      const pageResponse = await listAdmins(params)
      return {
        items: mapAdminAccountList(pageResponse.items),
        total: pageResponse.total,
        page: pageResponse.page,
        size: pageResponse.size,
        totalPages: pageResponse.totalPages,
      }
    },
  })
}

/**
 * Query hook for listing instructor accounts
 */
export const useInstructorAccountsQuery = (params?: ListAccountsParams) => {
  return useQuery({
    queryKey: accountManagementQueryKeys.instructorList(params),
    queryFn: async () => {
      const pageResponse = await listInstructors(params)
      return {
        items: mapInstructorAccountList(pageResponse.items),
        total: pageResponse.total,
        page: pageResponse.page,
        size: pageResponse.size,
        totalPages: pageResponse.totalPages,
      }
    },
  })
}

/**
 * Query hook for fetching a single instructor by ID
 */
export const useInstructorDetailQuery = (id: number) => {
  return useQuery({
    queryKey: accountManagementQueryKeys.detail(id),
    queryFn: async () => {
      const dto = await getInstructorById(id)
      return mapInstructorDetail(dto)
    },
    enabled: !!id,
  })
}
