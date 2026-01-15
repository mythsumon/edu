/**
 * Zone DTO from backend
 */
export interface ZoneDto {
  id: number
  name: string
  regions?: RegionDto[]
}

/**
 * Region DTO from backend
 */
export interface RegionDto {
  id: number
  name: string
  zoneId?: number
}
