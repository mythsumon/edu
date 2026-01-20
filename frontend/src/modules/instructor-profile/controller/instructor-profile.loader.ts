import { queryClient } from '@/app/config/queryClient'
import { masterCodeChildrenByCodeQueryOptions } from './instructor-profile.query-options'

/**
 * Loader function for instructor profile page
 * Prefetches master code data using ensureQueryData
 */
export const instructorProfileLoader = async () => {
  // Prefetch all required master code children
  const [
    instructorStatus,      // Code 100: Instructor Status
    instructorClassification, // Code 200: Instructor Classification
    instructorRegion,     // Code 1300: Instructor Region
    instructorCity,       // Code 1400: Instructor City
  ] = await Promise.all([
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
      masterCodeChildrenByCodeQueryOptions('500', {
        page: 0,
        size: 100,
      })
    ),
  ])

  return {
    instructorStatus,
    instructorClassification,
    instructorRegion,
    instructorCity,
  }
}
