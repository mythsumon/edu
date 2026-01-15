/**
 * Login request DTO
 */
export interface LoginRequestDto {
  username: string
  password: string
}

/**
 * Login response DTO
 */
export interface LoginResponseDto {
  access_token: string
  refresh_token: string
}

/**
 * Refresh token request DTO
 */
export interface RefreshTokenRequestDto {
  refreshToken: string
}

/**
 * Refresh token response DTO
 */
export interface RefreshTokenResponseDto {
  access_token: string
  refresh_token: string
}

/**
 * User response DTO
 */
export interface UserResponseDto {
  id: number
  username: string
  roleName: string
  enabled: boolean
  admin?: {
    name: string
  } | null
  instructor?: {
    name: string
    email: string
    phone: string
    gender: string
    dob: string
    city: string
    street: string
    detailAddress: string
  } | null
}
