/**
 * Get API base URL from environment variables
 */
export function getApiBaseUrl(): string {
  const baseUrl = import.meta.env.VITE_API_BASE_URL
  
  // For development/dummy screens, provide a fallback
  if (!baseUrl) {
    console.warn('VITE_API_BASE_URL is not defined. Using default fallback.')
    return 'http://localhost:8080/api/v1'
  }

  return baseUrl
}
