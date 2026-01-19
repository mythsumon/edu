import { useQuery } from '@tanstack/react-query'
import { getInstructorScheduleList } from '../model/lecture.service'
import type { ListSchedulesParams } from '../model/lecture.types'
import { lectureQueryKeys } from './queryKeys'

/**
 * Query hook for listing instructor schedules with pagination and filters
 */
export const useInstructorScheduleListQuery = (params?: ListSchedulesParams) => {
  return useQuery({
    queryKey: lectureQueryKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      return await getInstructorScheduleList(params)
    },
  })
}
