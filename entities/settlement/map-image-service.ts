/**
 * Map Image Generation Service
 * Generates reference map images for travel allowance evidence
 * 
 * Implementation: Uses Kakao Maps Static Map API or pre-rendered regional route images
 */

import type { InstructorRegion, InstitutionRegion } from './instructor-payment-types'

/**
 * Map image generation options
 */
export interface MapImageOptions {
  width?: number
  height?: number
  level?: number // Zoom level (1-14)
  format?: 'png' | 'jpeg'
}

/**
 * Generate route map image URL
 * 
 * Route: Home → Institution 1 → Institution 2 → ... → Home
 * 
 * @param homeRegion - Instructor's home region
 * @param institutionRegions - Institution regions in visit order
 * @param options - Map image options
 * @returns Map image URL (Kakao Maps Static API URL or pre-rendered image URL)
 */
export function generateRouteMapImageUrl(
  homeRegion: InstructorRegion,
  institutionRegions: InstitutionRegion[],
  options: MapImageOptions = {}
): string | undefined {
  const {
    width = 800,
    height = 600,
    level = 3,
    format = 'png',
  } = options
  
  // If no coordinates available, return undefined
  if (!homeRegion.lat || !homeRegion.lng) {
    return undefined
  }
  
  // If no institutions, return home location map
  if (institutionRegions.length === 0) {
    return generateSingleLocationMapUrl(homeRegion.lat, homeRegion.lng, width, height, level, format)
  }
  
  // Collect all waypoints
  const waypoints: Array<{ lat: number; lng: number; name: string }> = []
  
  // Add home as start point
  waypoints.push({
    lat: homeRegion.lat,
    lng: homeRegion.lng,
    name: '집',
  })
  
  // Add institutions
  institutionRegions.forEach((inst, index) => {
    if (inst.lat && inst.lng) {
      waypoints.push({
        lat: inst.lat,
        lng: inst.lng,
        name: inst.institutionName || `기관${index + 1}`,
      })
    }
  })
  
  // Add home as end point (return)
  waypoints.push({
    lat: homeRegion.lat,
    lng: homeRegion.lng,
    name: '집',
  })
  
  // Generate Kakao Maps Static API URL
  // Note: This requires Kakao Maps API key
  // For now, return a placeholder URL structure
  // TODO: Implement actual Kakao Maps Static API call
  
  const centerLat = waypoints.reduce((sum, w) => sum + w.lat, 0) / waypoints.length
  const centerLng = waypoints.reduce((sum, w) => sum + w.lng, 0) / waypoints.length
  
  // Build markers parameter
  const markers = waypoints.map((w, i) => {
    const markerType = i === 0 ? 'start' : i === waypoints.length - 1 ? 'end' : 'waypoint'
    return `${w.lat},${w.lng}`
  }).join('|')
  
  // Build Kakao Maps Static API URL
  // Format: https://apis.map.kakao.com/staticmap/v2?center={lat},{lng}&level={level}&w={width}&h={height}&markers={markers}
  const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || ''
  
  if (!kakaoApiKey) {
    // Return placeholder URL (will need to be replaced with actual implementation)
    console.warn('Kakao Maps API key not configured. Map image generation disabled.')
    return undefined
  }
  
  const baseUrl = 'https://apis.map.kakao.com/staticmap/v2'
  const params = new URLSearchParams({
    center: `${centerLat},${centerLng}`,
    level: level.toString(),
    w: width.toString(),
    h: height.toString(),
    markers: markers,
    apikey: kakaoApiKey,
  })
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * Generate single location map URL
 */
function generateSingleLocationMapUrl(
  lat: number,
  lng: number,
  width: number,
  height: number,
  level: number,
  format: string
): string {
  const kakaoApiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || ''
  
  if (!kakaoApiKey) {
    return undefined as any
  }
  
  const baseUrl = 'https://apis.map.kakao.com/staticmap/v2'
  const params = new URLSearchParams({
    center: `${lat},${lng}`,
    level: level.toString(),
    w: width.toString(),
    h: height.toString(),
    markers: `${lat},${lng}`,
    apikey: kakaoApiKey,
  })
  
  return `${baseUrl}?${params.toString()}`
}

/**
 * Generate route description for map image
 * Uses city/county names from regions
 */
function generateRouteDescriptionFromRegions(
  homeRegion: InstructorRegion,
  institutionRegions: InstitutionRegion[]
): string {
  if (institutionRegions.length === 0) {
    return `${homeRegion.cityCounty} → ${homeRegion.cityCounty}`
  }
  
  const routeParts = [
    homeRegion.cityCounty,
    ...institutionRegions.map(inst => inst.cityCounty),
    homeRegion.cityCounty,
  ]
  
  return routeParts.join(' → ')
}

/**
 * Generate map image with fallback to placeholder
 * 
 * If Kakao Maps API is not available, returns a placeholder image URL
 */
export function generateMapImageWithFallback(
  homeRegion: InstructorRegion,
  institutionRegions: InstitutionRegion[],
  options: MapImageOptions = {}
): string {
  const imageUrl = generateRouteMapImageUrl(homeRegion, institutionRegions, options)
  
  if (imageUrl) {
    return imageUrl
  }
  
  // Fallback: Return placeholder image
  // In production, this could be a pre-rendered image or a default map image
  const routeDescription = generateRouteDescriptionFromRegions(homeRegion, institutionRegions)
  
  // Return a data URL with route description as placeholder
  // In real implementation, this would be replaced with actual map image
  const svgContent = `
    <svg width="${options.width || 800}" height="${options.height || 600}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <text x="50%" y="50%" text-anchor="middle" font-size="16" fill="#666">
        지도 이미지: ${routeDescription}
      </text>
      <text x="50%" y="60%" text-anchor="middle" font-size="12" fill="#999">
        (Kakao Maps API 키가 설정되지 않았습니다)
      </text>
    </svg>
  `.trim()
  
  // Encode SVG to base64 (browser-safe)
  const base64 = typeof window !== 'undefined'
    ? btoa(unescape(encodeURIComponent(svgContent)))
    : Buffer.from(svgContent).toString('base64')
  
  return `data:image/svg+xml;base64,${base64}`
}
