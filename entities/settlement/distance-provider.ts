/**
 * Distance Calculation Providers
 * Supports multiple distance calculation methods with pluggable interface
 */

import type { DistanceProvider, InstitutionCategory } from './settlement-types'

/**
 * Haversine formula for calculating straight-line distance between two coordinates
 */
function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

/**
 * Haversine Distance Provider
 * Calculates straight-line distance between coordinates
 */
export class HaversineDistanceProvider implements DistanceProvider {
  getDistanceKm(
    instructorLat: number | undefined,
    instructorLng: number | undefined,
    institutionLat: number | undefined,
    institutionLng: number | undefined,
    instructorAddress?: string,
    institutionAddress?: string
  ): number {
    if (
      instructorLat === undefined ||
      instructorLng === undefined ||
      institutionLat === undefined ||
      institutionLng === undefined
    ) {
      // If coordinates are missing, return 0 (will need manual entry)
      return 0
    }

    return haversineDistance(instructorLat, instructorLng, institutionLat, institutionLng)
  }
}

/**
 * Mock Distance Provider
 * Returns a mock distance for testing (can be replaced with actual calculation)
 */
export class MockDistanceProvider implements DistanceProvider {
  getDistanceKm(
    instructorLat: number | undefined,
    instructorLng: number | undefined,
    institutionLat: number | undefined,
    institutionLng: number | undefined,
    instructorAddress?: string,
    institutionAddress?: string
  ): number {
    // Mock: return a fixed distance or calculate based on addresses
    if (instructorAddress && institutionAddress) {
      // Simple mock: return distance based on address similarity
      // In real implementation, this would call geocoding API
      return 35 // Mock 35km
    }
    return 0
  }
}

/**
 * Kakao Maps Distance Provider (Stub)
 * Will call Kakao Maps Directions API to get driving distance
 * TODO: Implement actual Kakao API integration
 */
export class KakaoDistanceProvider implements DistanceProvider {
  private apiKey?: string

  constructor(apiKey?: string) {
    this.apiKey = apiKey
  }

  async getDistanceKm(
    instructorLat: number | undefined,
    instructorLng: number | undefined,
    institutionLat: number | undefined,
    institutionLng: number | undefined,
    instructorAddress?: string,
    institutionAddress?: string
  ): Promise<number> {
    // TODO: Implement Kakao Maps Directions API call
    // Example API endpoint:
    // https://apis-navi.kakao.com/v1/directions?origin=${instructorLat},${instructorLng}&destination=${institutionLat},${institutionLng}
    
    // For now, fallback to Haversine if coordinates are available
    if (
      instructorLat !== undefined &&
      instructorLng !== undefined &&
      institutionLat !== undefined &&
      institutionLng !== undefined
    ) {
      const haversine = new HaversineDistanceProvider()
      return haversine.getDistanceKm(
        instructorLat,
        instructorLng,
        institutionLat,
        institutionLng
      )
    }

    return 0
  }
}

/**
 * Default distance provider (Haversine)
 */
export const defaultDistanceProvider = new HaversineDistanceProvider()
