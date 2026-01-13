// Placeholder types - to be implemented when API is available
export interface AccountManagement {
  id: string
  // Add more fields as needed
}

/**
 * Admin account data for table display
 */
export interface AdminAccount {
  id: number
  name: string
  username: string
  email?: string
  phoneNumber?: string
}

/**
 * Instructor account data for table display
 */
export interface InstructorAccount {
  id: number
  name: string
  username: string
  affiliation?: string
  region?: string // city/country
  instructorClassification?: string
}
