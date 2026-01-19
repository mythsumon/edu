/**
 * Daum Postcode API utility
 * Provides functions to open the Daum Postcode search popup
 */

declare global {
  interface Window {
    daum?: {
      Postcode: new (options: {
        oncomplete: (data: DaumPostcodeData) => void
        onresize?: (size: { width: string; height: string }) => void
        onclose?: (state: 'FORCE_CLOSE' | 'COMPLETE_CLOSE') => void
        width?: string
        height?: string
        maxSuggestItems?: number
        theme?: {
          bgColor?: string
          searchBgColor?: string
          contentBgColor?: string
          pageBgColor?: string
          textColor?: string
          queryTextColor?: string
          postcodeTextColor?: string
          emphTextColor?: string
          outlineColor?: string
        }
      }) => {
        open: () => void
        embed: (element: HTMLElement) => void
      }
    }
  }
}

export interface DaumPostcodeData {
  zonecode: string // Postal code (우편번호)
  address: string // Full address (전체 주소)
  addressEnglish: string // Full address in English
  addressType: 'R' | 'J' // R: Road address, J: Jibun address
  roadAddress: string // Road address (도로명 주소)
  roadAddressEnglish: string // Road address in English
  jibunAddress: string // Jibun address (지번 주소)
  jibunAddressEnglish: string // Jibun address in English
  autoRoadAddress: string // Auto-detected road address
  autoRoadAddressEnglish: string // Auto-detected road address in English
  autoJibunAddress: string // Auto-detected jibun address
  autoJibunAddressEnglish: string // Auto-detected jibun address in English
  userSelectedType: 'R' | 'J' // User selected address type
  noSelected: 'Y' | 'N' // Whether user selected an address
  userLanguageType: 'K' | 'E' // K: Korean, E: English
  roadnameCode: string // Road name code
  bcode: string // Building code
  buildingCode: string // Building code
  apartment: string // Apartment name
  sido: string // Province (시도)
  sigungu: string // City/County (시군구)
  sigunguCode: string // City/County code
  bname: string // District name (법정동명)
  roadname: string // Road name (도로명)
  buildingName: string // Building name
  query: string // Search query
}

export interface PostcodeOptions {
  onComplete: (data: DaumPostcodeData) => void
  onClose?: (state: 'FORCE_CLOSE' | 'COMPLETE_CLOSE') => void
  width?: string
  height?: string
}

/**
 * Opens the Daum Postcode search popup
 * @param options Configuration options for the postcode search
 */
export function openPostcodeSearch(options: PostcodeOptions): void {
  if (typeof window === 'undefined' || !window.daum?.Postcode) {
    console.error('Daum Postcode API is not loaded. Please ensure the script is included in index.html')
    return
  }

  const postcode = new window.daum.Postcode({
    oncomplete: options.onComplete,
    onclose: options.onClose,
    width: options.width || '100%',
    height: options.height || '100%',
    maxSuggestItems: 5,
  })

  postcode.open()
}

/**
 * Checks if the Daum Postcode API is loaded
 */
export function isPostcodeApiLoaded(): boolean {
  return typeof window !== 'undefined' && typeof window.daum?.Postcode !== 'undefined'
}
