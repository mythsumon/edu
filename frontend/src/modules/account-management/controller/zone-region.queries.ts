import { useQuery } from '@tanstack/react-query'
import { getAllZones, getAllRegions, getRegionsByZoneId } from '../model/zone-region.service'

/**
 * Query hook for fetching all zones
 */
export const useZonesQuery = () => {
  return useQuery({
    queryKey: ['zones'],
    queryFn: async () => {
      return await getAllZones()
    },
  })
}

/**
 * Query hook for fetching all regions
 */
export const useRegionsQuery = () => {
  return useQuery({
    queryKey: ['regions'],
    queryFn: async () => {
      return await getAllRegions()
    },
  })
}

/**
 * Query hook for fetching regions by zone ID
 */
export const useRegionsByZoneQuery = (zoneId: number | null) => {
  return useQuery({
    queryKey: ['regions', zoneId],
    queryFn: async () => {
      if (!zoneId) {
        return []
      }
      return await getRegionsByZoneId(zoneId)
    },
    enabled: !!zoneId,
  })
}
