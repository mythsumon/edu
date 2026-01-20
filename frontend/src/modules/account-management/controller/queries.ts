import { useQuery } from '@tanstack/react-query'
import { accountManagementQueryKeys } from './queryKeys'
import { listAdmins, listInstructors, listTeachers, getAdminById, getAdminByUsername, getInstructorById, getTeacherById } from '../model/account-management.service'
import {
  mapAdminAccountList,
  mapInstructorAccountList,
  mapTeacherAccountList,
  mapAdminDetail,
  mapInstructorDetail,
  mapTeacherDetail,
} from '../model/mapper'
import type { ListAccountsParams, AdminDetail, InstructorDetail, TeacherDetail } from '../model/account-management.types'

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
 * Query hook for fetching a single admin by ID
 */
export const useAdminDetailQuery = (id: number) => {
  return useQuery({
    queryKey: accountManagementQueryKeys.adminDetail(id),
    queryFn: async () => {
      const dto = await getAdminById(id)
      return mapAdminDetail(dto)
    },
    enabled: !!id,
  })
}

/**
 * Query hook for fetching a single admin by username
 */
export const useAdminDetailByUsernameQuery = (username: string) => {
  return useQuery({
    queryKey: accountManagementQueryKeys.adminDetailByUsername(username),
    queryFn: async () => {
      const dto = await getAdminByUsername(username)
      return mapAdminDetail(dto)
    },
    enabled: !!username,
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

/**
 * Query hook for listing teacher accounts
 */
export const useTeacherAccountsQuery = (params?: ListAccountsParams) => {
  return useQuery({
    queryKey: accountManagementQueryKeys.teacherList(params),
    queryFn: async () => {
      const pageResponse = await listTeachers(params)
      return {
        items: mapTeacherAccountList(pageResponse.items),
        total: pageResponse.total,
        page: pageResponse.page,
        size: pageResponse.size,
        totalPages: pageResponse.totalPages,
      }
    },
  })
}

/**
 * Query hook for fetching a single teacher by ID
 */
export const useTeacherDetailQuery = (id: number) => {
  return useQuery({
    queryKey: accountManagementQueryKeys.teacherDetail(id),
    queryFn: async () => {
      const dto = await getTeacherById(id)
      return mapTeacherDetail(dto)
    },
    enabled: !!id,
  })
}
