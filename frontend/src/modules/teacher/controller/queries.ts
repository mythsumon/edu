import { useQuery } from '@tanstack/react-query'
import { listTeachers, getTeacherById } from '../model/teacher.service'
import type { ListTeachersParams } from '../model/teacher.types'
import { teacherQueryKeys } from './queryKeys'

/**
 * Query hook for listing teachers with pagination and filters
 */
export const useTeachersListQuery = (params?: ListTeachersParams) => {
  return useQuery({
    queryKey: teacherQueryKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      return await listTeachers(params)
    },
  })
}

/**
 * Query hook for fetching teacher by userId
 */
export const useTeacherByIdQuery = (
  userId: number | null | undefined,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: teacherQueryKeys.detail(userId!),
    queryFn: async () => {
      if (!userId) {
        throw new Error('Teacher userId is required')
      }
      return await getTeacherById(userId)
    },
    enabled: enabled && userId !== null && userId !== undefined,
  })
}
