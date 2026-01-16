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

/**
 * Backend DTOs
 */
export interface AdminResponseDto {
  userId: number
  username: string
  name: string
  email?: string
  phone?: string
  profilePhoto?: string
  enabled?: boolean
}

export interface InstructorResponseDto {
  userId: number
  username: string
  name: string
  email?: string
  phone?: string
  gender?: string
  dob?: string
  regionId?: number
  city?: string
  street?: string
  detailAddress?: string
  statusId?: number
  classificationId?: number
  signature?: string
  profilePhoto?: string
  enabled?: boolean
}

/**
 * Request DTO for creating admin
 */
export interface CreateAdminRequestDto {
  username: string
  password: string
  name: string
  email?: string
  phone?: string
}

/**
 * Request DTO for creating instructor
 */
export interface CreateInstructorRequestDto {
  username: string
  password: string
  name: string
  email: string
  phone?: string
  gender?: string
  dob?: string
  regionId?: number
  city?: string
  street?: string
  detailAddress?: string
  statusId?: number
  classificationId?: number
  affiliation?: string
}

/**
 * Query parameters for listing accounts
 */
export interface ListAccountsParams {
  q?: string
  page?: number
  size?: number
  sort?: string
}