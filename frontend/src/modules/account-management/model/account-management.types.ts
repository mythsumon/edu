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
  regionId?: number
  region?: string // region name from mastercode (codeName)
  classificationId?: number
  instructorClassification?: string // classification name from mastercode (codeName)
}

/**
 * Admin detail data for detail page display
 */
export interface AdminDetail {
  id: number
  username: string
  name: string
  email?: string
  phone?: string
  enabled?: boolean
  profilePhoto?: string
}

/**
 * Instructor detail data for detail page display
 */
export interface InstructorDetail {
  id: number
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
  affiliation?: string
  enabled?: boolean
  createdAt?: string
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
  affiliation?: string
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
 * Request DTO for updating instructor (password excluded)
 */
export interface UpdateInstructorRequestDto {
  username: string
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
  regionIds?: number[]
  classificationIds?: number[]
  statusIds?: number[]
  zoneIds?: number[]
}