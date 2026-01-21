import { useQuery } from '@tanstack/react-query'
import { getInstructorScheduleList } from '../model/training.service'
import type { ListSchedulesParams } from '../model/training.types'
import { trainingQueryKeys } from './queryKeys'

/**
 * Query hook for listing instructor schedules with pagination and filters
 */
export const useInstructorScheduleListQuery = (params?: ListSchedulesParams) => {
  return useQuery({
    queryKey: trainingQueryKeys.list(JSON.stringify(params || {})),
    queryFn: async () => {
      return await getInstructorScheduleList(params)
    },
  })
}
