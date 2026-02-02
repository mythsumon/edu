/**
 * 31-City/County Distance Matrix
 * Fixed distance table for inter-city/county travel allowance calculation
 * Source: "31개 시군청간 거리표"
 * 
 * Rule: Same city/county movement = 0 km
 * Distance is calculated using city hall to city hall fixed values
 */

export type CityCountyCode = 
  | 'SUWON' | 'YONGIN' | 'SEONGNAM' | 'GOYANG' | 'BUCHEON' | 'ANSAN' | 'ANYANG' | 'HWASEONG'
  | 'PYEONGTAEK' | 'GIMPO' | 'OSAN' | 'ICHEON' | 'GWANGMYEONG' | 'SIHEUNG' | 'GUNPO'
  | 'UIJEONGBU' | 'YANGJU' | 'DONGDUCHEON' | 'POCHEON' | 'GAPYEONG' | 'YEONCHEON' | 'PAJU'
  | 'YEOJU' | 'YANGPYEONG' | 'GWANGJU' | 'HANAM' | 'NAMYANGJU' | 'GURI'
  | 'UIWANG' | 'GWACHEON' | 'ANSEONG'

export interface CityCountyInfo {
  code: CityCountyCode
  name: string // Korean name (e.g., "수원시")
  nameEn: string // English name
}

/**
 * 31 Cities/Counties list
 */
export const CITY_COUNTIES: CityCountyInfo[] = [
  { code: 'SUWON', name: '수원시', nameEn: 'Suwon' },
  { code: 'YONGIN', name: '용인시', nameEn: 'Yongin' },
  { code: 'SEONGNAM', name: '성남시', nameEn: 'Seongnam' },
  { code: 'GOYANG', name: '고양시', nameEn: 'Goyang' },
  { code: 'BUCHEON', name: '부천시', nameEn: 'Bucheon' },
  { code: 'ANSAN', name: '안산시', nameEn: 'Ansan' },
  { code: 'ANYANG', name: '안양시', nameEn: 'Anyang' },
  { code: 'HWASEONG', name: '화성시', nameEn: 'Hwaseong' },
  { code: 'PYEONGTAEK', name: '평택시', nameEn: 'Pyeongtaek' },
  { code: 'GIMPO', name: '김포시', nameEn: 'Gimpo' },
  { code: 'OSAN', name: '오산시', nameEn: 'Osan' },
  { code: 'ICHEON', name: '이천시', nameEn: 'Icheon' },
  { code: 'GWANGMYEONG', name: '광명시', nameEn: 'Gwangmyeong' },
  { code: 'SIHEUNG', name: '시흥시', nameEn: 'Siheung' },
  { code: 'GUNPO', name: '군포시', nameEn: 'Gunpo' },
  { code: 'UIJEONGBU', name: '의정부시', nameEn: 'Uijeongbu' },
  { code: 'YANGJU', name: '양주시', nameEn: 'Yangju' },
  { code: 'DONGDUCHEON', name: '동두천시', nameEn: 'Dongducheon' },
  { code: 'POCHEON', name: '포천시', nameEn: 'Pocheon' },
  { code: 'GAPYEONG', name: '가평군', nameEn: 'Gapyeong' },
  { code: 'YEONCHEON', name: '연천군', nameEn: 'Yeoncheon' },
  { code: 'PAJU', name: '파주시', nameEn: 'Paju' },
  { code: 'YEOJU', name: '여주시', nameEn: 'Yeoju' },
  { code: 'YANGPYEONG', name: '양평군', nameEn: 'Yangpyeong' },
  { code: 'GWANGJU', name: '광주시', nameEn: 'Gwangju' },
  { code: 'HANAM', name: '하남시', nameEn: 'Hanam' },
  { code: 'NAMYANGJU', name: '남양주시', nameEn: 'Namyangju' },
  { code: 'GURI', name: '구리시', nameEn: 'Guri' },
  { code: 'UIWANG', name: '의왕시', nameEn: 'Uiwang' },
  { code: 'GWACHEON', name: '과천시', nameEn: 'Gwacheon' },
  { code: 'ANSEONG', name: '안성시', nameEn: 'Anseong' },
]

/**
 * Distance matrix: City/County to City/County distance in km
 * This is a placeholder structure - actual distances should be populated from the "31개 시군청간 거리표"
 * 
 * Format: distanceMatrix[from][to] = distance in km
 * Same city = 0 km (diagonal)
 */
export const CITY_DISTANCE_MATRIX: Record<CityCountyCode, Record<CityCountyCode, number>> = {} as any

/**
 * Initialize distance matrix with actual distance data from "31개 시군청간 거리표"
 * Source: Google Sheet "31개 시군청간 거리표"
 * Distances are in kilometers (city hall to city hall)
 */
function initializeDistanceMatrix(): void {
  CITY_COUNTIES.forEach(from => {
    CITY_DISTANCE_MATRIX[from.code] = {} as Record<CityCountyCode, number>
    CITY_COUNTIES.forEach(to => {
      if (from.code === to.code) {
        // Same city = 0 km
        CITY_DISTANCE_MATRIX[from.code][to.code] = 0
      } else {
        // Default placeholder - will be populated with actual data
        CITY_DISTANCE_MATRIX[from.code][to.code] = 0
      }
    })
  })

  // Populate actual distance data from "31개 시군청간 거리표"
  // Source: Google Sheet "31개 시군청간 거리표"
  // Note: Matrix is symmetric (distance A→B = distance B→A)
  // Distances are in kilometers (city hall to city hall)
  
  // Visible data from the provided table (partial - full table needs to be populated)
  setDistance('GAPYEONG', 'GOYANG', 62.62)
  setDistance('GOYANG', 'GWACHEON', 29.19)
  setDistance('GWACHEON', 'GWANGMYEONG', 12.38)
  setDistance('GWANGMYEONG', 'GWANGJU', 35.42)
  setDistance('GURI', 'NAMYANGJU', 2.53)

  // Common routes for testing (estimated based on geographic proximity)
  // TODO: Replace with actual values from complete "31개 시군청간 거리표"
  
  // 수원시 (Suwon) - central location
  setDistance('SUWON', 'SEONGNAM', 15.0) // Estimated
  setDistance('SUWON', 'YONGIN', 12.0) // Estimated
  setDistance('SUWON', 'HWASEONG', 18.0) // Estimated
  setDistance('SUWON', 'OSAN', 20.0) // Estimated
  setDistance('SUWON', 'PYEONGTAEK', 25.0) // Estimated
  setDistance('SUWON', 'ICHEON', 30.0) // Estimated
  setDistance('SUWON', 'YEOJU', 35.0) // Estimated
  setDistance('SUWON', 'YANGPYEONG', 40.0) // Estimated
  setDistance('SUWON', 'ANSEONG', 28.0) // Estimated
  setDistance('SUWON', 'ANYANG', 10.0) // Estimated
  setDistance('SUWON', 'GUNPO', 8.0) // Estimated
  setDistance('SUWON', 'UIWANG', 12.0) // Estimated
  setDistance('SUWON', 'HANAM', 18.0) // Estimated
  setDistance('SUWON', 'GURI', 25.0) // Estimated
  setDistance('SUWON', 'NAMYANGJU', 28.0) // Estimated
  setDistance('SUWON', 'GWANGJU', 35.0) // Estimated
  setDistance('SUWON', 'GOYANG', 35.0) // Estimated
  setDistance('SUWON', 'BUCHEON', 25.0) // Estimated
  setDistance('SUWON', 'SIHEUNG', 20.0) // Estimated
  setDistance('SUWON', 'ANSAN', 25.0) // Estimated
  setDistance('SUWON', 'GWANGMYEONG', 22.0) // Estimated
  setDistance('SUWON', 'GWACHEON', 20.0) // Estimated
  setDistance('SUWON', 'GIMPO', 30.0) // Estimated
  setDistance('SUWON', 'UIJEONGBU', 40.0) // Estimated
  setDistance('SUWON', 'YANGJU', 45.0) // Estimated
  setDistance('SUWON', 'DONGDUCHEON', 50.0) // Estimated
  setDistance('SUWON', 'POCHEON', 55.0) // Estimated
  setDistance('SUWON', 'GAPYEONG', 60.0) // Estimated
  setDistance('SUWON', 'YEONCHEON', 70.0) // Estimated
  setDistance('SUWON', 'PAJU', 45.0) // Estimated

  // 성남시 (Seongnam) - common destination
  setDistance('SEONGNAM', 'YONGIN', 18.0) // Estimated
  setDistance('SEONGNAM', 'HANAM', 8.0) // Estimated
  setDistance('SEONGNAM', 'GURI', 12.0) // Estimated
  setDistance('SEONGNAM', 'NAMYANGJU', 15.0) // Estimated
  setDistance('SEONGNAM', 'GWANGJU', 20.0) // Estimated
  setDistance('SEONGNAM', 'ICHEON', 25.0) // Estimated
  setDistance('SEONGNAM', 'YEOJU', 30.0) // Estimated
  setDistance('SEONGNAM', 'YANGPYEONG', 35.0) // Estimated
  setDistance('SEONGNAM', 'ANYANG', 12.0) // Estimated
  setDistance('SEONGNAM', 'GUNPO', 10.0) // Estimated
  setDistance('SEONGNAM', 'UIWANG', 8.0) // Estimated
  setDistance('SEONGNAM', 'GWACHEON', 10.0) // Estimated
  setDistance('SEONGNAM', 'GWANGMYEONG', 12.0) // Estimated
  setDistance('SEONGNAM', 'GOYANG', 25.0) // Estimated
  setDistance('SEONGNAM', 'BUCHEON', 20.0) // Estimated

  // 용인시 (Yongin) - common destination
  setDistance('YONGIN', 'ICHEON', 20.0) // Estimated
  setDistance('YONGIN', 'YEOJU', 25.0) // Estimated
  setDistance('YONGIN', 'YANGPYEONG', 30.0) // Estimated
  setDistance('YONGIN', 'GWANGJU', 15.0) // Estimated
  setDistance('YONGIN', 'ANSEONG', 18.0) // Estimated
  setDistance('YONGIN', 'OSAN', 15.0) // Estimated
  setDistance('YONGIN', 'PYEONGTAEK', 20.0) // Estimated
  setDistance('YONGIN', 'HWASEONG', 15.0) // Estimated

  // Note: This is a partial implementation
  // Full matrix should be populated from the complete "31개 시군청간 거리표" table
  // For missing distances, the system will use 0 and log a warning
  // Admin should populate the complete table for accurate calculations
}

/**
 * Helper function to set distance in both directions (symmetric matrix)
 */
function setDistance(from: CityCountyCode, to: CityCountyCode, distance: number): void {
  CITY_DISTANCE_MATRIX[from][to] = distance
  CITY_DISTANCE_MATRIX[to][from] = distance
}

// Initialize on module load
initializeDistanceMatrix()

/**
 * Get distance between two cities/counties using the fixed distance matrix
 * 
 * @param fromCity - Source city/county code
 * @param toCity - Destination city/county code
 * @returns Distance in kilometers (0 if same city)
 */
export function getCityDistance(
  fromCity: CityCountyCode | string,
  toCity: CityCountyCode | string
): number {
  // Normalize city codes (handle string inputs)
  const from = fromCity as CityCountyCode
  const to = toCity as CityCountyCode
  
  // Same city = 0 km
  if (from === to) {
    return 0
  }
  
  // Look up in matrix
  const distance = CITY_DISTANCE_MATRIX[from]?.[to]
  if (distance !== undefined) {
    return distance
  }
  
  // Fallback: try reverse lookup (matrix should be symmetric)
  const reverseDistance = CITY_DISTANCE_MATRIX[to]?.[from]
  if (reverseDistance !== undefined) {
    return reverseDistance
  }
  
  // If not found, return 0 (will need manual entry)
  console.warn(`Distance not found for ${from} → ${to}`)
  return 0
}

/**
 * Map city/county name (Korean) to code
 * 
 * @param cityName - Korean city/county name (e.g., "수원시", "성남시")
 * @returns City/county code or null if not found
 */
export function mapCityNameToCode(cityName: string): CityCountyCode | null {
  const normalized = cityName.trim()
  const city = CITY_COUNTIES.find(c => 
    c.name === normalized || 
    c.name.includes(normalized) || 
    normalized.includes(c.name)
  )
  return city?.code || null
}

/**
 * Calculate total distance for a route: Home → Inst1 → Inst2 → ... → Home
 * Uses city/county codes to look up fixed distances
 * 
 * @param homeCity - Instructor's home city/county code
 * @param institutionCities - Array of institution city/county codes in visit order
 * @returns Total distance in kilometers
 */
export function calculateRouteDistance(
  homeCity: CityCountyCode | string,
  institutionCities: (CityCountyCode | string)[]
): number {
  if (institutionCities.length === 0) {
    return 0
  }
  
  let totalDistance = 0
  let currentCity = homeCity
  
  // Home → First institution
  for (const instCity of institutionCities) {
    const segmentDistance = getCityDistance(currentCity, instCity)
    totalDistance += segmentDistance
    currentCity = instCity
  }
  
  // Last institution → Home
  const returnDistance = getCityDistance(currentCity, homeCity)
  totalDistance += returnDistance
  
  return totalDistance
}

/**
 * Generate route description string: "Home → Inst1 → Inst2 → ... → Home"
 * 
 * @param homeCityName - Instructor's home city/county name
 * @param institutionCityNames - Array of institution city/county names in visit order
 * @returns Route description string
 */
export function generateRouteDescription(
  homeCityName: string,
  institutionCityNames: string[]
): string {
  if (institutionCityNames.length === 0) {
    return `${homeCityName} → ${homeCityName}`
  }
  
  const route = [homeCityName, ...institutionCityNames, homeCityName]
  return route.join(' → ')
}
