import { queryClient } from '@/app/config/queryClient'
import { 
  masterCodeChildrenByCodeQueryOptions,
  masterCodeGrandChildrenByCodeQueryOptions,
  instructorMeQueryOptions,
} from './instructor-profile.query-options'

/**
 * Loader function for instructor profile page
 * Prefetches master code data using ensureQueryData
 */
export const instructorProfileLoader = async () => {
  // Prefetch all required data
  const [
    instructorMe,          // Current instructor profile
    instructorStatus,      // Code 100: Instructor Status (children)
    instructorClassification, // Code 200: Instructor Classification (children)
    instructorRegion,     // Code 500: Instructor Region (children)
    instructorCity,       // Code 500: Instructor City (grandchildren)
  ] = await Promise.all([
    queryClient.ensureQueryData(instructorMeQueryOptions()),
    queryClient.ensureQueryData(
      masterCodeChildrenByCodeQueryOptions('100', {
        page: 0,
        size: 100,
      })
    ),
    queryClient.ensureQueryData(
      masterCodeChildrenByCodeQueryOptions('200', {
        page: 0,
        size: 100,
      })
    ),
    queryClient.ensureQueryData(
      masterCodeChildrenByCodeQueryOptions('500', {
        page: 0,
        size: 100,
      })
    ),
    queryClient.ensureQueryData(
      masterCodeGrandChildrenByCodeQueryOptions('500-1', {
        page: 0,
        size: 100,
      }),
    ),
  ])

  return {
    instructorMe,
    instructorStatus,
    instructorClassification,
    instructorRegion,
    instructorCity,
  }
}
