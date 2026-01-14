import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse } from '@/shared/http/types/common'
import type { ZoneDto, RegionDto } from './zone-region.types'

/**
 * Get all zones
 */
export async function getAllZones(): Promise<ZoneDto[]> {
  const response = await axiosInstance.get<ApiResponse<ZoneDto[]>>('/zones')
  return response.data.data
}

/**
 * Get all regions
 */
export async function getAllRegions(): Promise<RegionDto[]> {
  const response = await axiosInstance.get<ApiResponse<RegionDto[]>>('/regions')
  return response.data.data
}

/**
 * Get regions by zone ID
 */
export async function getRegionsByZoneId(zoneId: number): Promise<RegionDto[]> {
  const response = await axiosInstance.get<ApiResponse<RegionDto[]>>('/regions', {
    params: { zoneId },
  })
  return response.data.data
}
